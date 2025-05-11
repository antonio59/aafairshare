
import { User } from "@/types";
import { TestEmailConfig } from "./types";
import { TestDataGenerator } from "./testDataGenerator";
import { generateSettlementReportPDF } from "@/services/export/settlementReportService";
import { exportToCSV } from "@/services/export/csvExportService";

/**
 * Service for preparing email form data
 */
export class EmailFormDataService {
  /**
   * Prepare form data for the email
   */
  static async prepareFormData(users: User[], config?: TestEmailConfig) {
    const { testYear, testMonth, sampleMonthData } = TestDataGenerator.generateTestData(users, config);
    
    // Generate PDF report
    const pdfReport = generateSettlementReportPDF(
      {
        totalExpenses: sampleMonthData.totalExpenses,
        user1Paid: sampleMonthData.user1Paid,
        user2Paid: sampleMonthData.user2Paid,
        settlement: sampleMonthData.settlement,
        settlementDirection: sampleMonthData.settlementDirection
      },
      testYear,
      testMonth,
      users[0].name,
      users[1].name
    );
    
    // Generate CSV report
    const csvContent = exportToCSV(sampleMonthData.expenses, testYear, testMonth);
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Prepare form data
    const formData = new FormData();
    formData.append("year", testYear.toString());
    formData.append("month", testMonth.toString());
    formData.append("user1", users[0].id);
    formData.append("user2", users[1].id);
    formData.append("settlementAmount", sampleMonthData.settlement.toString());
    formData.append("settlementDirection", sampleMonthData.settlementDirection);
    formData.append("reportPdf", pdfReport, `test_settlement_${testYear}_${testMonth}.pdf`);
    formData.append("reportCsv", csvBlob, `test_expenses_${testYear}_${testMonth}.csv`);
    
    return {
      formData,
      testData: {
        year: testYear,
        month: testMonth,
        settlementAmount: sampleMonthData.settlement,
        settlementDirection: sampleMonthData.settlementDirection
      }
    };
  }
}
