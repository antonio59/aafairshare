
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const Recurring = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Format the current month for display
  const currentMonthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recurring Expenses</h1>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium mb-2">No recurring expenses yet</h3>
        <p className="text-gray-500 mb-6">
          Set up recurring expenses for items that repeat regularly, like rent or subscriptions.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Recurring Expense
        </Button>
      </div>
    </div>
  );
};

export default Recurring;
