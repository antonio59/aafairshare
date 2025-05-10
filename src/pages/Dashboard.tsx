
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getMonthData, 
  getCurrentMonth, 
  getCurrentYear,
  downloadCSV
} from "@/services/expenseService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText,
  FileType,
  Plus, 
  Pencil, 
  Trash 
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [searchTerm, setSearchTerm] = useState("");

  // Format the current month for display
  const currentMonthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");

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

  // Filter expenses based on search term
  const filteredExpenses = monthData?.expenses.filter((expense) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      expense.category.toLowerCase().includes(searchTermLower) ||
      expense.location.toLowerCase().includes(searchTermLower) ||
      expense.description.toLowerCase().includes(searchTermLower) ||
      (expense.paidBy === "1" ? "antonio" : "andres").includes(searchTermLower)
    );
  });

  // Handle export to CSV
  const handleExportCSV = () => {
    if (monthData?.expenses) {
      downloadCSV(monthData.expenses, year, month);
    }
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    // PDF export would typically use a library like jspdf or pdfmake
    // For now, we'll just show an alert
    alert("PDF export functionality will be implemented with a PDF generation library");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-28 text-center">
              {currentMonthLabel}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" /> Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileType className="mr-2 h-4 w-4" /> Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">£</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total</span>
                </div>
                <span className="text-2xl font-bold">£{monthData?.totalExpenses.toFixed(2)}</span>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio"
                      alt="Antonio avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Antonio Paid</span>
                </div>
                <span className="text-2xl font-bold">£{monthData?.user1Paid.toFixed(2)}</span>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
                      alt="Andres avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Andres Paid</span>
                </div>
                <span className="text-2xl font-bold">£{monthData?.user2Paid.toFixed(2)}</span>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
                      alt="Settlement avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Settlement Due</span>
                </div>
                <span className="text-2xl font-bold text-green">£{monthData?.settlement.toFixed(2)}</span>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Expenses</h2>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Filter by category, location, paid by..."
                  className="pl-9 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 border-b">Date</th>
                    <th className="px-6 py-3 border-b">Category/Location</th>
                    <th className="px-6 py-3 border-b">Description</th>
                    <th className="px-6 py-3 border-b">Amount</th>
                    <th className="px-6 py-3 border-b">Paid By</th>
                    <th className="px-6 py-3 border-b">Split</th>
                    <th className="px-6 py-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses && filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{expense.category}</div>
                          <div className="text-sm text-gray-500">{expense.location}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {expense.description || "-"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          £{expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {expense.paidBy === "1" ? "Antonio" : "Andres"}
                        </td>
                        <td className="px-6 py-4">{expense.split}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500">
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? "No matching expenses found." : "No expenses found for this month."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t text-sm text-gray-500">
              Total: {filteredExpenses?.length || 0} expenses
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
