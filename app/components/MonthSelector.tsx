import { Button } from "~/components/ui/button";
import { Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useToast } from "~/hooks/use-toast";
import { getPreviousMonth, getNextMonth, formatMonthYear } from "~/lib/utils";

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export default function MonthSelector({ value, onChange, onExport }: MonthSelectorProps) {
  const { toast } = useToast();

  // Directly format the month using the value prop
  const formattedMonth = formatMonthYear(value);

  const handleExport = (format: 'csv' | 'pdf') => {
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
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange(getPreviousMonth(value))}
          className="mr-1 sm:mr-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">{formattedMonth}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange(getNextMonth(value))}
          className="ml-1 sm:ml-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {onExport && (
        <>
          {/* Desktop export button */}
          <div className="hidden sm:flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-600 hover:text-primary border-gray-300 hover:border-primary">
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <span>Export CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <span>Export PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile export button */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100">
                  <Download className="h-3.5 w-3.5" />
                  <span className="sr-only">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-28">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="text-xs py-1.5">
                  <FileText className="h-3 w-3 mr-1.5" />
                  <span>CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-xs py-1.5">
                  <FileText className="h-3 w-3 mr-1.5" />
                  <span>PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
}
