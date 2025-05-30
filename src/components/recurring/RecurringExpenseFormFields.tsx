import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AmountInput from "@/components/expense/AmountInput";
import DateSelector from "@/components/expense/DateSelector";
import CategorySelector from "@/components/expense/CategorySelector";
import LocationSelector from "@/components/expense/LocationSelector";
import FrequencySelector from "@/components/recurring/FrequencySelector";
import SplitTypeSelector from "@/components/expense/SplitTypeSelector";
import UserSelector from "./UserSelector";
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecurringExpenseFormFieldsProps {
  formData: {
    amount: string;
    nextDueDate: Date;
    endDate: Date | null;
    category: string;
    location: string;
    description: string;
    frequency: string;
    split: string;
    userId: string;
  };
  onChange: (field: string, value: string | Date | null) => void;
}

const RecurringExpenseFormFields = ({ formData, onChange }: RecurringExpenseFormFieldsProps) => {
  return (
    <>
      {/* Amount and Date in the same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
        <div>
          <AmountInput 
            value={formData.amount} 
            onChange={(value) => onChange("amount", value)} 
          />
        </div>
        <div>
          <Label>Next Due Date</Label>
          <DateSelector 
            selectedDate={formData.nextDueDate} 
            onChange={(date) => onChange("nextDueDate", date)} 
          />
        </div>
        <div>
          <Label>End Date (Optional)</Label>
          <DateSelector 
            selectedDate={formData.endDate} 
            onChange={(date) => onChange("endDate", date)} 
            allowClear={true} 
          />
        </div>
      </div>

      {/* Category */}
      <CategorySelector 
        selectedCategory={formData.category} 
        onChange={(category) => onChange("category", category)} 
      />

      {/* Location */}
      <LocationSelector 
        selectedLocation={formData.location} 
        onChange={(location) => onChange("location", location)} 
      />

      {/* Split Type */}
      <SplitTypeSelector 
        selectedSplitType={formData.split}
        onChange={(splitType) => onChange("split", splitType)}
      />

      {/* User Selector */}
      <UserSelector
        selectedUserId={formData.userId}
        onChange={(userId) => onChange("userId", userId)}
      />

      {/* Frequency */}
      <FrequencySelector 
        selectedFrequency={formData.frequency} 
        onChange={(frequency) => onChange("frequency", frequency)} 
      />

      {/* Description */}
      <div className="mb-4 sm:mb-6">
        <Label htmlFor="description">Description (Optional)</Label>
        <div className="mt-1">
          <Input
            type="text"
            id="description"
            placeholder="Add notes about this recurring expense"
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default RecurringExpenseFormFields;
