
interface User {
  id: string;
  email: string;
  name: string;
}

interface EmailContent {
  htmlContent: string;
  settlementMessage: string;
}

/**
 * Generate email content for settlement notification
 */
export function generateEmailContent(
  user1: User,
  user2: User,
  settlementDirection: string,
  settlementAmount: string,
  monthName: string,
  year: string
): EmailContent {
  // Direction message
  let settlementMessage = `No settlement needed for ${monthName} ${year}.`;
  if (settlementDirection === 'owes') {
    settlementMessage = `${user1.name} paid ${user2.name} £${settlementAmount} for ${monthName} ${year}.`;
  } else if (settlementDirection === 'owed') {
    settlementMessage = `${user2.name} paid ${user1.name} £${settlementAmount} for ${monthName} ${year}.`;
  }

  // Create HTML email content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">AAFairShare: Settlement Complete</h1>
      
      <p>Hi ${user1.name} and ${user2.name},</p>
      
      <p>A settlement has been marked as complete in your shared expense tracking:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="font-weight: bold; font-size: 18px;">${settlementMessage}</p>
        <p>Period: ${monthName} ${year}</p>
      </div>
      
      <p>The settlement report and expense details are attached to this email for your records:</p>
      <ul>
        <li>PDF Report - Visual representation of the settlement summary</li>
        <li>CSV Export - Detailed expense data for the period</li>
      </ul>
      
      <p>You can log in to the application to view more details and your expense history.</p>
      
      <p>Best regards,<br>The AAFairShare Team</p>
    </div>
  `;

  return { htmlContent, settlementMessage };
}
