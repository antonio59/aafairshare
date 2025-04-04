import * as admin from "firebase-admin";
// Initialize Firebase Admin SDK (assuming service account key is set via env var)
// You might need to adjust initialization based on your environment
// e.g., admin.initializeApp({ credential: admin.credential.applicationDefault() });
// or provide the path to your service account key file.
try {
    admin.initializeApp();
}
catch (e) {
    console.log("Admin SDK already initialized or initialization failed:", e);
}
const db = admin.firestore();
const templateId = "settlementNotification";
const templatesCollection = db.collection("templates");
async function createSettlementTemplate() {
    console.log(`Checking for template '${templateId}'...`);
    const templateRef = templatesCollection.doc(templateId);
    const templateSnap = await templateRef.get();
    if (templateSnap.exists) {
        console.log(`Template '${templateId}' already exists.`);
        return;
    }
    console.log(`Creating template '${templateId}'...`);
    const templateData = {
        subject: "AAFairShare: Settlement Report for {{month}}",
        textBody: `
Hi there,

The settlement for {{month}} has been completed.

Summary:
- {{fromUserName}} Paid: {{fromUserTotalFormatted}}
- {{toUserName}} Paid: {{toUserTotalFormatted}}
- Total Expenses: {{totalExpensesFormatted}}
- Settlement Amount: {{fromUserName}} paid {{toUserName}} {{settlementAmountFormatted}}

The detailed expense report is attached in CSV and PDF formats.

Thanks,
AAFairShare Bot
    `.trim(),
        htmlBody: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; line-height: 1.6; color: #333; }
  .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: 20px auto; }
  .header { font-size: 1.2em; font-weight: bold; color: {{brandColor}}; margin-bottom: 15px; } /* Use brandColor */
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
      <div class="summary-item"><strong>{{fromUserName}} Paid:</strong> {{fromUserTotalFormatted}}</div>
      <div class="summary-item"><strong>{{toUserName}} Paid:</strong> {{toUserTotalFormatted}}</div>
      <div class="summary-item"><strong>Total Expenses:</strong> {{totalExpensesFormatted}}</div>
      <div class="summary-item"><strong>Settlement:</strong> {{fromUserName}} paid {{toUserName}} <strong>{{settlementAmountFormatted}}</strong></div>
    </div>
    <p>The detailed expense report is attached in CSV and PDF formats.</p>
    <div class="footer">
      Thanks,<br/>
      AAFairShare Bot
    </div>
  </div>
</body>
</html>
    `.trim(),
        // Add other template fields if needed by your logic
    };
    try {
        await templateRef.set(templateData);
        console.log(`Successfully created template '${templateId}'.`);
    }
    catch (error) {
        console.error(`Error creating template '${templateId}':`, error);
    }
}
createSettlementTemplate().catch(console.error);
