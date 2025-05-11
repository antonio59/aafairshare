
import { User } from "@/types";
import { TestEmailConfig, EmailTestData } from "./types";

/**
 * Service for generating test data for email testing
 */
export class TestDataGenerator {
  /**
   * Generate test data for the email with custom configuration
   */
  static generateTestData(users: User[], config?: TestEmailConfig): EmailTestData {
    const currentDate = new Date();
    const testYear = config?.year || currentDate.getFullYear();
    const testMonth = config?.month || currentDate.getMonth() + 1;
    const settlementAmount = config?.settlementAmount !== undefined ? config.settlementAmount : 25.13;
    const settlementDirection = config?.settlementDirection || "owes";
    
    // Create sample data with correct expense format
    const sampleExpenses = [
      {
        id: "test-1",
        description: "Groceries",
        amount: 85.25,
        date: new Date().toISOString(),
        category: "Food",
        location: "Supermarket",
        paidBy: users[0].id,
        split: "50/50"
      },
      {
        id: "test-2",
        description: "Dinner",
        amount: 65.50,
        date: new Date().toISOString(),
        category: "Food",
        location: "Restaurant",
        paidBy: users[1].id,
        split: "50/50"
      }
    ];
    
    return {
      testYear,
      testMonth,
      sampleMonthData: {
        totalExpenses: 350.75,
        user1Paid: 200.50,
        user2Paid: 150.25,
        settlement: settlementAmount,
        settlementDirection,
        expenses: sampleExpenses
      }
    };
  }
}
