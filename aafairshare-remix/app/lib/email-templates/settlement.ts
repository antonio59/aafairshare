/**
 * Email template for settlement notifications
 */
export const settlementEmailTemplate = {
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
  .header { font-size: 1.2em; font-weight: bold; color: #3b82f6; margin-bottom: 15px; }
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
  `.trim()
};
