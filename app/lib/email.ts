import { httpsCallable } from "firebase/functions";
import { functions } from "~/lib/firebase";
import { Expense, Settlement, User } from "~/shared/schema";
import { formatCurrency, formatDate, formatMonthYear } from "~/lib/utils";
import { settlementEmailTemplate } from "~/lib/email-templates/settlement";

interface SendSettlementEmailParams {
  settlement: Settlement;
  expenses: Expense[];
  users: User[];
  month: string;
}

/**
 * Sends a settlement email with CSV and PDF attachments
 * @param params Settlement email parameters
 * @returns Promise that resolves when the email is sent
 */
export async function sendSettlementEmail(params: SendSettlementEmailParams): Promise<void> {
  const { settlement, expenses, users, month } = params;

  // Find the users involved in the settlement
  const fromUser = users.find(u => u.id === settlement.fromUserId);
  const toUser = users.find(u => u.id === settlement.toUserId);

  if (!fromUser || !toUser) {
    throw new Error("Could not find users involved in settlement");
  }

  // Calculate totals for each user
  const fromUserTotal = expenses
    .filter(exp => exp.paidByUserId === fromUser.id)
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const toUserTotal = expenses
    .filter(exp => exp.paidByUserId === toUser.id)
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const totalExpenses = fromUserTotal + toUserTotal;

  // Prepare email data
  const emailData = {
    settlement: {
      ...settlement,
      date: formatDate(settlement.date),
      amount: formatCurrency(settlement.amount),
      month: formatMonthYear(month)
    },
    fromUser: {
      id: fromUser.id,
      name: fromUser.username || fromUser.email?.split('@')[0] || 'Unknown User',
      email: fromUser.email
    },
    toUser: {
      id: toUser.id,
      name: toUser.username || toUser.email?.split('@')[0] || 'Unknown User',
      email: toUser.email
    },
    expenses: expenses.map(exp => ({
      ...exp,
      date: formatDate(exp.date instanceof Date ? exp.date : new Date(exp.date)),
      amount: formatCurrency(exp.amount)
    })),
    month: formatMonthYear(month),
    // Template data for placeholders
    templateData: {
      month: formatMonthYear(month),
      fromUserName: fromUser.username || fromUser.email?.split('@')[0] || 'Unknown User',
      toUserName: toUser.username || toUser.email?.split('@')[0] || 'Unknown User',
      fromUserTotalFormatted: formatCurrency(fromUserTotal),
      toUserTotalFormatted: formatCurrency(toUserTotal),
      totalExpensesFormatted: formatCurrency(totalExpenses),
      settlementAmountFormatted: formatCurrency(settlement.amount)
    },
    template: settlementEmailTemplate
  };

  // Call the Firebase Cloud Function to send the email
  const sendEmail = httpsCallable(functions, 'sendSettlementEmail');
  await sendEmail(emailData);
}
