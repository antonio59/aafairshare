import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as path from "path"; // <-- Add path import
import {DocumentSnapshot} from "firebase-functions/v1/firestore";
import {EventContext} from "firebase-functions/v1";
import {Parser} from "@json2csv/plainjs";
import PdfPrinter from "pdfmake";
import type {
  TDocumentDefinitions, Content, ContentTable, // <-- Remove TableCell
} from "pdfmake/interfaces"; // Keep this path for CJS
// Font definition moved inside handler
// Assuming shared types are correctly mapped in tsconfig.json
// Import shared types from the installed 'shared' package
import type {
  Settlement, Expense, User, Category, Location,
} from "shared"; // Import from package name
import type {EmailTemplate} from "./types.ts"; // Assuming types are in ./types

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Printer will be instantiated inside the try block if fonts load

// Helper function to format currency (basic example)
const formatCurrency = (amount: number | undefined | null): string => {
  // Handle potential null/undefined/NaN inputs gracefully
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return "£NaN"; // Or return "£0.00" or some other indicator
  }
  return new Intl.NumberFormat("en-GB", { // Use en-GB locale
    style: "currency", currency: "GBP", // Use GBP currency
  }).format(numAmount);
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

// Helper function to replace placeholders like {{variableName}}
// in a template string
const populateTemplate = (
  templateString: string | undefined,
  data: Record<string, string | number>
): string => {
  if (!templateString) return "";
  let populated = templateString;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Use a regex to replace all occurrences of {{key}}
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      populated = populated.replace(regex, String(data[key]));
    }
  }
  return populated;
};

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

      const totalExpenses = expenses.reduce(
        (sum, exp) => sum + (Number(exp.amount) || 0), 0
      );

      // Calculate totals paid by each user
      const userTotals: Record<string, number> = {
        [fromUserId]: 0,
        [toUserId]: 0,
      };
      expenses.forEach((exp) => {
        if (exp.paidByUserId === fromUserId) {
          userTotals[fromUserId] += (Number(exp.amount) || 0);
        } else if (exp.paidByUserId === toUserId) {
          userTotals[toUserId] += (Number(exp.amount) || 0);
        }
      });

      // 5. Generate CSV
      const csvParser = new Parser({
        fields: [
          "Date", "Description", "Category", "Location", "Amount", "Paid By",
        ],
      });
      // Add summary rows to the data before parsing to CSV
      const csvSummaryRows = [
        {}, // Empty row for spacing
        {"Date": "Summary", "Description": ""},
        { // Break long lines for linter
          "Date": `${fromUserName} Paid:`,
          "Description": formatCurrency(userTotals[fromUserId]),
        },
        { // Break long lines for linter
          "Date": `${toUserName} Paid:`,
          "Description": formatCurrency(userTotals[toUserId]),
        },
        { // Break long lines for linter
          "Date": "Total Expenses:",
          "Description": formatCurrency(totalExpenses),
        },
        { // Break long lines for linter
          "Date": "Settlement Amount:",
          "Description": `${fromUserName} paid ${toUserName} ` +
                         `${formatCurrency(amount)}`,
        },
      ];
      // Combine report data and summary rows
      const csvDataWithSummary = [...reportData, ...csvSummaryRows];
      const csv = csvParser.parse(csvDataWithSummary);
      const csvBase64 = Buffer.from(csv).toString("base64");
      functions.logger.log("CSV generated successfully.");

      // 6. Generate PDF
      const brandColor = "#0F172A"; // Define Brand Color
      let pdfBase64: string | null = null; // Initialize pdfBase64

      try {
        functions.logger.log("Attempting PDF generation using vfs_fonts...");
        // Resolve path relative to the compiled file's directory (__dirname)
        const fontPath = path.resolve(__dirname, "./vfs_fonts.js");
        functions.logger.log(`Resolved font path: ${fontPath}`);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfFonts = require(fontPath); // <-- Use resolved path

        // Explicit check for loaded vfs data
        if (!pdfFonts || !pdfFonts.vfs || !pdfFonts.vfs["Roboto-Regular.ttf"]) {
          throw new Error(
            "Failed to load pdfmake vfs_fonts or required Roboto font."
          );
        }
        functions.logger.log("vfs_fonts loaded successfully.");

        // Define fonts using loaded vfs data
        const fonts = {
          Roboto: {
            normal: Buffer.from(pdfFonts.vfs["Roboto-Regular.ttf"], "base64"),
            bold: Buffer.from(pdfFonts.vfs["Roboto-Medium.ttf"], "base64"),
            italics: Buffer.from(pdfFonts.vfs["Roboto-Italic.ttf"], "base64"),
            bolditalics: Buffer.from(
              pdfFonts.vfs["Roboto-MediumItalic.ttf"],
              "base64"
            ),
          },
        };
        // Instantiate printer here
        const printer = new PdfPrinter(fonts);

        // Define PDF content
        const pdfContent: Content = [
          {text: "AAFairShare", style: "logoHeader", color: brandColor},
          {text: `Settlement Report - ${month}`, style: "header"},
          {
            text: `${fromUserName} Paid: ` +
                  `${formatCurrency(userTotals[fromUserId])}`,
            style: "summary",
          },
          {
            text: `${toUserName} Paid: ${formatCurrency(userTotals[toUserId])}`,
            style: "summary",
          },
          {
            text: `Total Expenses: ${formatCurrency(totalExpenses)}`,
            style: "summary", bold: true,
          },
          {
            text: `Settlement: ${fromUserName} paid ${toUserName} ` +
                  `${formatCurrency(amount)}`,
            style: "subheader", margin: [0, 5, 0, 10],
          },
          {
            style: "tableExample",
            table: {
              headerRows: 1,
              widths: ["auto", "*", "auto", "auto", "auto", "auto"],
              body: [
                [
                  "Date", "Description", "Category",
                  "Location", "Amount", "Paid By",
                ].map((h) => ({
                  text: h, style: "tableHeader",
                  fillColor: brandColor, color: "white",
                })),
                ...reportData.map((row, index) => {
                  const rowCells = [
                    row.Date || "",
                    row.Description || "",
                    row.Category || "",
                    row.Location || "",
                    {text: row.Amount || "", alignment: "right" as const},
                    row["Paid By"] || "",
                  ];
                  return rowCells.map((cell) => {
                    const isObject = typeof cell === "object" && cell !== null;
                    return {
                      text: isObject ? cell.text : cell,
                      alignment: isObject ? cell.alignment : "left",
                      fillColor: index % 2 === 0 ? "#F3F4F6" : undefined,
                    };
                  });
                }),
              ],
            },
            layout: {
              // Add types for layout function parameters
              hLineWidth: (i: number, node: ContentTable) => (
                i === 0 || i === 1 || i === node.table.body.length ? 1 : 0
              ),
              vLineWidth: () => 0,
              hLineColor: (i: number) => (i === 0 || i === 1 ? brandColor : "#E5E7EB"),
              paddingTop: () => 6,
              paddingBottom: () => 6,
              paddingLeft: () => 8,
              paddingRight: () => 8,
            },
          },
        ];

        // Define PDF document structure
        const docDefinition: TDocumentDefinitions = {
          content: pdfContent,
          styles: {
            logoHeader: {fontSize: 20, bold: true, margin: [0, 0, 0, 5]},
            header: {fontSize: 16, bold: true, margin: [0, 0, 0, 10]},
            subheader: {fontSize: 14, bold: true},
            summary: {fontSize: 11, margin: [0, 1, 0, 1]},
            tableExample: {margin: [0, 5, 0, 15], fontSize: 9},
            tableHeader: {bold: true, fontSize: 10},
          },
          defaultStyle: {font: "Roboto"},
        };

        // Use the locally instantiated printer
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        // Convert PDF stream to Base64
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
          // Add types for event listener callbacks
          pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
          pdfDoc.on("end", () => resolve());
          pdfDoc.on("error", (err: Error) => reject(err));
          pdfDoc.end();
        });
        pdfBase64 = Buffer.concat(chunks).toString("base64");
        functions.logger.log("PDF generated successfully.");
      } catch (pdfError) {
        functions.logger.error("Error during PDF generation:", pdfError);
        pdfBase64 = null; // Ensure pdfBase64 is null if any error occurs
      }

      // --- Adjust Email Attachment Logic ---
      // Prepare attachments, excluding PDF if pdfBase64 is null
      const attachments = [
        {
          filename: `Settlement-Report-${month}.csv`,
          content: csvBase64,
          encoding: "base64",
          contentType: "text/csv",
        },
      ];

      // Conditionally add PDF attachment
      if (pdfBase64) {
        attachments.push({
          filename: `Settlement-Report-${month}.pdf`,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        });
      } else {
        functions.logger.warn("PDF skipped; font loading error.");
      }

      // 7. Ensure Email Template Exists and Fetch It
      const templateId = "settlementNotification";
      const templateRef = db.collection("templates").doc(templateId);
      let templateSnap = await templateRef.get();

      if (!templateSnap.exists) {
        functions.logger.warn(
          `Template '${templateId}' not found. Creating default template.`
        );
        const defaultTemplateData = {
          subject: "AAFairShare: Settlement Report for {{month}}",
          textBody: `
Hi there,

The settlement for {{month}} has been completed.

Summary:
- {{fromUserName}} Paid: {{fromUserTotalFormatted}}
- {{toUserName}} Paid: {{toUserTotalFormatted}}
- Total Expenses: {{totalExpensesFormatted}}
- Settlement Amount: {{fromUserName}} paid {{toUserName}} \
{{settlementAmountFormatted}}

The detailed expense report is attached in CSV and PDF formats.

Thanks,
AAFairShare Bot
          `.trim(),
          htmlBody: `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: sans-serif; line-height: 1.6; color: #333; }
.container {
  padding: 20px; border: 1px solid #ddd; border-radius: 5px;
  max-width: 600px; margin: 20px auto;
}
.header {
  font-size: 1.2em; font-weight: bold; color: {{brandColor}};
  margin-bottom: 15px;
} /* Use brandColor */
.summary-item { margin-bottom: 5px; }
.footer { margin-top: 20px; font-size: 0.9em; color: #777; }
</style>
</head>
<body>
<div class="container">
  <div class="header">Settlement Report for {{month}}</div>
  <p>Hi there,</p>
  <p>The settlement for <strong>{{month}}</strong> has been completed.</p>
  <div class="summary">
    <div class="summary-item">
      <strong>{{fromUserName}} Paid:</strong> {{fromUserTotalFormatted}}
    </div>
    <div class="summary-item">
      <strong>{{toUserName}} Paid:</strong> {{toUserTotalFormatted}}
    </div>
    <div class="summary-item">
      <strong>Total Expenses:</strong> {{totalExpensesFormatted}}
    </div>
    <div class="summary-item">
      <strong>Settlement:</strong> {{fromUserName}} paid {{toUserName}}
      <strong>{{settlementAmountFormatted}}</strong>
    </div>
  </div>
  <p>The detailed expense report is attached in CSV and PDF formats.</p>
  <div class="footer">
    Thanks,<br/>
    AAFairShare Bot
  </div>
</div>
</body>
</html>`.trim(),
        };
        try {
          await templateRef.set(defaultTemplateData);
          functions.logger.log(`Default template '${templateId}' created.`);
          // Invalidate cache for this specific template if using getData cache
          delete dataCache[`templates-${templateId}`];
          // Re-fetch after creation
          templateSnap = await templateRef.get();
        } catch (createError) {
          functions.logger.error(
            `Failed to create default template '${templateId}':`, createError
          );
          // Exit if template cannot be created or fetched
          return;
        }
      }

      // Fetch the template data (either existing or newly created)
      // Using .data() directly as we have the snapshot now
      const template = templateSnap.data() as EmailTemplate | undefined;

      if (!template) {
        functions.logger.error(
          `Failed to load template '${templateId}' even after check/create.`
        );
        return; // Exit if template still not available
      }

      // 8. Prepare Template Data and Populate Email Content
      const templateData = {
        month: month,
        fromUserName: fromUserName,
        toUserName: toUserName,
        fromUserTotalFormatted: formatCurrency(userTotals[fromUserId]),
        toUserTotalFormatted: formatCurrency(userTotals[toUserId]),
        totalExpensesFormatted: formatCurrency(totalExpenses),
        settlementAmountFormatted: formatCurrency(amount),
        brandColor: brandColor, // Pass brand color (defined earlier)
      };

      const emailSubject = populateTemplate(template.subject, templateData);
      const emailHtmlBody = populateTemplate(template.htmlBody, templateData);
      const emailTextBody = populateTemplate(template.textBody, templateData);


      // 9. Create Email Document for Trigger Email Extension

      const emailData = {
        to: [fromUser.email, toUser.email], // Send to both users
        // from: "Optional: Your configured 'from' address",
        // replyTo: "Optional: Your configured 'reply-to' address",
        message: {
          subject: emailSubject,
          text: emailTextBody, // Use populated text body
          html: emailHtmlBody, // Use populated HTML body
          // Use the conditionally prepared attachments array
          attachments: attachments,
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
