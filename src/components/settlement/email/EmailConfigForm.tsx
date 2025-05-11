import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface TestEmailConfig {
  year: number;
  month: number;
  settlementAmount: number;
  settlementDirection: "owes" | "owed" | "even";
}

interface EmailConfigFormProps {
  config: TestEmailConfig;
  onConfigChange: (config: TestEmailConfig) => void;
}

export const EmailConfigForm = ({ config, onConfigChange }: EmailConfigFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<TestEmailConfig>({
    defaultValues: config
  });

  const handleSubmit = (values: TestEmailConfig) => {
    onConfigChange(values);
  };

  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Generate year options (current year, last year, next year)
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="border rounded-md mt-4 overflow-hidden">
      <div 
        className="p-3 bg-slate-50 flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="font-medium">Email Test Configuration</h3>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select 
                    value={String(form.watch("month"))}
                    onValueChange={(value) => form.setValue("month", parseInt(value))}
                  >
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select 
                    value={String(form.watch("year"))}
                    onValueChange={(value) => form.setValue("year", parseInt(value))}
                  >
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="settlementAmount">Settlement Amount (£)</Label>
                <Input
                  id="settlementAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.watch("settlementAmount")}
                  onChange={(e) => form.setValue("settlementAmount", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="settlementDirection">Settlement Direction</Label>
                <Select 
                  value={form.watch("settlementDirection")}
                  onValueChange={(value) => form.setValue("settlementDirection", value as TestEmailConfig["settlementDirection"])}
                >
                  <SelectTrigger id="settlementDirection">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owes">User 1 owes User 2</SelectItem>
                    <SelectItem value="owed">User 2 owes User 1</SelectItem>
                    <SelectItem value="even">No settlement needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" variant="outline" size="sm">
                Apply Configuration
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};
