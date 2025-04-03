import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {DocumentSnapshot} from "firebase-functions/v1/firestore";
import {EventContext} from "firebase-functions/v1";
import {Parser} from "@json2csv/plainjs";
import PdfPrinter from "pdfmake";
import type {
  TDocumentDefinitions, Content,
} from "pdfmake/interfaces"; // Keep this path for CJS
// Font definition moved inside handler
// Assuming shared types are correctly mapped in tsconfig.json
// Import shared types from the installed 'shared' package
import type {
  Settlement, Expense, User, Category, Location,
} from "shared"; // Import from package name

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Font definition moved inside handler

// Moved printer instantiation into the function handler

// Helper function to format currency (basic example)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
  }).format(amount);
  // TODO: Consider making currency configurable or detecting from user settings
};

// Helper function to format date (basic example)
const formatDate = (date: Date | admin.firestore.Timestamp): string => {
  const jsDate = date instanceof admin.firestore.Timestamp ?
    date.toDate() :
    date;
  // Example: DD/MM/YYYY
  return jsDate.toLocaleDateString("en-GB");
  // TODO: Consider making date format configurable
};

// Helper function to fetch data with caching/memoization for efficiency
// Simple in-memory cache (using unknown for better type safety than any)
const dataCache: { [key: string]: unknown } = {};

/**
 * Fetches a Firestore document with basic in-memory caching.
 * @param {string} collection The Firestore collection name.
 * @param {string} id The document ID.
 * @return {Promise<T | null>} The document data or null if not found/error.
 */
async function getData<T>(
  collection: string, id: string
): Promise<T | null> {
  const cacheKey = `${collection}-${id}`;
  if (dataCache[cacheKey]) {
    return dataCache[cacheKey] as T;
  }
  try {
    const docSnap = await db.collection(collection).doc(id).get();
    if (docSnap.exists) {
      const data = {id: docSnap.id, ...docSnap.data()} as T;
      dataCache[cacheKey] = data; // Cache the result
      return data;
    }
    return null;
  } catch (error) {
    functions.logger.error(
      `Error fetching ${collection} with ID ${id}:`, error
    );
    return null;
  }
}

// Cloud Function triggered by the creation of a settlement document
// Cloud Function triggered by the creation of a settlement document
export const onSettlementCreated = functions
  .region("europe-west1") // Specify region using v1 syntax
  .firestore.document("settlements/{settlementId}")
  .onCreate(async (snap: DocumentSnapshot, context: EventContext) => {
    const settlement = snap.data() as Settlement;
    const {month, amount, fromUserId, toUserId} = settlement;

    functions.logger.log(
      `Processing settlement for month: ${month}, Amount: ${amount}`
    );

    try {
      // 1. Fetch Users
      const [fromUser, toUser] = await Promise.all([
        getData<User>("users", fromUserId),
        getData<User>("users", toUserId),
      ]);

      if (!fromUser || !toUser) {
        functions.logger.error("Could not find one or both users:", {
          fromUserId, toUserId,
        });
        return; // Exit if users not found
      }

      const fromUserName = fromUser.username ||
                           fromUser.email?.split("@")[0] ||
                           "User";
      const toUserName = toUser.username ||
                         toUser.email?.split("@")[0] ||
                         "User";

      // 2. Fetch Expenses for the month
      const expensesSnap = await db.collection("expenses")
        .where("month", "==", month)
        .orderBy("date", "asc")
        .get();

      if (expensesSnap.empty) {
        functions.logger.warn(
          `No expenses found for month ${month}. Skipping report generation.`
        );
        // Optionally send a simpler email notification?
        return;
      }

      const expenses: Expense[] = expensesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure date is a JS Date object for formatting
        date: (doc.data().date as admin.firestore.Timestamp).toDate(),
      } as Expense));

      // 3. Fetch Categories and Locations for enrichment (optional but helpful)
      // Use Promise.allSettled to avoid failing if one category/location is
      // missing
      const relatedDataPromises = expenses.flatMap((exp) => [
        exp.categoryId ?
          getData<Category>("categories", exp.categoryId) :
          Promise.resolve(null),
        exp.locationId ?
          getData<Location>("locations", exp.locationId) :
          Promise.resolve(null),
        exp.paidByUserId ?
          getData<User>("users", exp.paidByUserId) :
          Promise.resolve(null),
      ]);
      await Promise.allSettled(relatedDataPromises); // Populates the cache

      // 4. Prepare Data for Reports
      const reportData = expenses.map((exp) => {
        const category = exp.categoryId ?
          dataCache[`categories-${exp.categoryId}`] as Category | null :
          null;
        const location = exp.locationId ?
          dataCache[`locations-${exp.locationId}`] as Location | null :
          null;
        const paidByUser = exp.paidByUserId ?
          dataCache[`users-${exp.paidByUserId}`] as User | null :
          null;

        return {
          "Date": formatDate(exp.date),
          "Description": exp.description,
          "Category": category?.name || "N/A",
          "Location": location?.name || "N/A",
          "Amount": formatCurrency(exp.amount),
          "Paid By": paidByUser?.username ||
                     paidByUser?.email?.split("@")[0] ||
                     "Unknown",
        };
      });

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      // 5. Generate CSV
      const csvParser = new Parser({
        fields: [
          "Date", "Description", "Category", "Location", "Amount", "Paid By",
        ],
      });
      const csv = csvParser.parse(reportData);
      const csvBase64 = Buffer.from(csv).toString("base64");
      functions.logger.log("CSV generated successfully.");

      // 6. Generate PDF
      // Define fonts and instantiate printer inside the handler
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfFonts = require("pdfmake/build/vfs_fonts.js");
      const fonts = {
        Roboto: {
          normal: Buffer.from(pdfFonts.vfs["Roboto-Regular.ttf"], "base64"),
          bold: Buffer.from(pdfFonts.vfs["Roboto-Medium.ttf"], "base64"),
          italics: Buffer.from(pdfFonts.vfs["Roboto-Italic.ttf"], "base64"),
          bolditalics: Buffer.from(
            pdfFonts.vfs["Roboto-MediumItalic.ttf"], "base64"
          ),
        },
      };
      const printer = new PdfPrinter(fonts);
      const pdfContent: Content = [
        {text: `Settlement Report - ${month}`, style: "header"},
        {
          text: `Total Expenses: ${formatCurrency(totalExpenses)}`,
          style: "subheader",
        },
        {
          text: `Settlement: ${fromUserName} paid ${toUserName} ${
            formatCurrency(amount)
          }`,
          style: "subheader",
        },
        {text: " ", margin: [0, 10]}, // Spacer
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            // Adjust widths as needed
            widths: ["auto", "*", "auto", "auto", "auto", "auto"],
            body: [
              // Header Row
              [
                "Date", "Description", "Category",
                "Location", "Amount", "Paid By",
              ].map((h) => ({text: h, style: "tableHeader"})),
              // Data Rows
              ...reportData.map((row) => [
                row.Date || "", // Ensure defined string
                row.Description || "", // Ensure defined string
                row.Category || "", // Ensure defined string
                row.Location || "", // Ensure defined string
                row.Amount || "", // Ensure defined string
                row["Paid By"] || "", // Ensure defined string
              ]),
            ],
          },
          layout: "lightHorizontalLines", // Optional table styling
        },
      ];

      const docDefinition: TDocumentDefinitions = {
        content: pdfContent,
        styles: {
          header: {fontSize: 18, bold: true, margin: [0, 0, 0, 10]},
          subheader: {fontSize: 14, bold: true, margin: [0, 5, 0, 5]},
          tableExample: {margin: [0, 5, 0, 15]},
          tableHeader: {bold: true, fontSize: 11, color: "black"},
        },
        defaultStyle: {font: "Roboto"}, // Ensure font is applied
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);

      // Convert PDF stream to Base64
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve());
        pdfDoc.on("error", (err) => reject(err));
        pdfDoc.end();
      });
      const pdfBase64 = Buffer.concat(chunks).toString("base64");
      functions.logger.log("PDF generated successfully.");

      // 7. Create Email Document for Trigger Email Extension
      const emailSubject = `FairShare Settlement Report - ${month}`;
      const emailBody = `
        <p>Hi ${fromUserName} and ${toUserName},</p>
        <p>Attached is the expense report and settlement summary for ${
  month
}.</p>
        <p>Total expenses for the month: ${formatCurrency(totalExpenses)}</p>
        <p>Settlement amount: ${fromUserName} paid ${toUserName} ${
  formatCurrency(amount)
}.</p>
        <p>Please find the detailed CSV and PDF reports attached.</p>
        <br/>
        <p>Thanks,</p>
        <p>FairShare App</p>
      `;

      const emailData = {
        to: [fromUser.email, toUser.email], // Send to both users
        // from: "Optional: Your configured 'from' address",
        // replyTo: "Optional: Your configured 'reply-to' address",
        message: {
          subject: emailSubject,
          // Plain text version
          text: `Settlement report for ${month} attached. Total: ${
            formatCurrency(totalExpenses)
          }. ${fromUserName} paid ${toUserName} ${formatCurrency(amount)}.`,
          html: emailBody,
          attachments: [
            {
              filename: `Settlement-Report-${month}.csv`,
              content: csvBase64,
              encoding: "base64",
              contentType: "text/csv",
            },
            {
              filename: `Settlement-Report-${month}.pdf`,
              content: pdfBase64,
              encoding: "base64",
              contentType: "application/pdf",
            },
          ],
        },
      };

      // Write to the 'mail' collection (or the collection configured
      // for Trigger Email)
      await db.collection("mail").add(emailData);
      functions.logger.log(
        `Email document created successfully for settlement ${
          context.params.settlementId
        }.`
      );
    } catch (error) {
      functions.logger.error(
        `Error processing settlement ${context.params.settlementId}:`, error
      );
      // Optional: Add error reporting (e.g., write to an errors collection)
    }
  });
