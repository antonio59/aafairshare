
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  getMonthData, 
  getCurrentMonth, 
  getCurrentYear,
  downloadCSV
} from "@/services/expenseService";

// Import our extracted components
import MonthNavigator from "@/components/dashboard/MonthNavigator";
import ExportMenu from "@/components/dashboard/ExportMenu";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseFilter from "@/components/dashboard/ExpenseFilter";
import ExpensesTable from "@/components/dashboard/ExpensesTable";

const Dashboard = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch the month data
  const { data: monthData, isLoading, error } = useQuery({
    queryKey: ["monthData", year, month],
    queryFn: () => getMonthData(year, month),
  });

  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth = month;
    let newYear = year;

    if (direction === "prev") {
      newMonth -= 1;
      if (newMonth === 0) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth === 13) {
        newMonth = 1;
        newYear += 1;
      }
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (monthData?.expenses) {
      downloadCSV(monthData.expenses, year, month);
    }
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    // PDF export would typically use a library like jspdf or pdfmake
    alert("PDF export functionality will be implemented with a PDF generation library");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <MonthNavigator 
            year={year}
            month={month}
            onNavigate={navigateMonth}
          />
          <ExportMenu
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
          <Button onClick={() => navigate("/add-expense")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div>Loading...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center p-12 text-red-500">
          Error loading data.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {monthData && (
            <SummaryCards
              totalExpenses={monthData.totalExpenses}
              user1Paid={monthData.user1Paid}
              user2Paid={monthData.user2Paid}
              settlement={monthData.settlement}
            />
          )}

          {/* Expenses Table with Filter */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Expenses</h2>
              <ExpenseFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          
            {/* ExpensesTable component is now properly used here */}
            <div className="overflow-x-auto">
              <ExpensesTable 
                expenses={monthData?.expenses}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
