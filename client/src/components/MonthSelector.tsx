import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import useMonthNavigation from "@/hooks/useMonthNavigation";
import { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface MonthSelectorProps {
  onMonthChange: (month: string) => void;
  initialMonth?: string;
  onExport?: (format: 'csv' | 'xlsx' | 'pdf') => void;
}

export default function MonthSelector({ onMonthChange, initialMonth, onExport }: MonthSelectorProps) {
  const { currentMonth, previousMonth, nextMonth, formattedMonth } = useMonthNavigation(initialMonth);
  const { toast } = useToast();

  useEffect(() => {
    onMonthChange(currentMonth);
  }, [currentMonth, onMonthChange]);

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      toast({
        title: "Export not available",
        description: "Export functionality is not available for this view.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={previousMonth}
          className="mr-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">{formattedMonth}</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextMonth}
          className="ml-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      
      {onExport && (
        <div className="hidden sm:flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-primary border-gray-300 hover:border-primary">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                <span>Export CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                <FileText className="h-4 w-4 mr-2" />
                <span>Export Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                <span>Export PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
