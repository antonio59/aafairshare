
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUsers, addRecurringExpense } from "@/services/expenseService";
import AmountInput from "@/components/expense/AmountInput";
import DateSelector from "@/components/expense/DateSelector";
import CategorySelector from "@/components/expense/CategorySelector";
import LocationSelector from "@/components/expense/LocationSelector";
import FrequencySelector from "@/components/recurring/FrequencySelector";
import { User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface AddRecurringExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddRecurringExpenseForm = ({ isOpen, onClose, onSuccess }: AddRecurringExpenseFormProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    nextDueDate: new Date(),
    category: "",
    location: "",
    description: "",
    frequency: "monthly", // Default to monthly
    userId: "", // Will be set to current user's ID
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
        
        // Set default userId to the first user if available
        if (userData.length > 0) {
          setFormData(prev => ({
            ...prev,
            userId: userData[0].id
          }));
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    
    fetchUsers();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.amount || !formData.nextDueDate || !formData.category || !formData.userId || !formData.frequency) {
        toast({
          title: "Missing fields",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Format the data for submission
      const recurringData = {
        amount: parseFloat(formData.amount),
        next_due_date: format(formData.nextDueDate, "yyyy-MM-dd"),
        category: formData.category,
        location: formData.location,
        description: formData.description,
        user_id: formData.userId,
        frequency: formData.frequency,
      };

      // Submit the recurring expense
      await addRecurringExpense(recurringData);
      
      // Success message
      toast({
        title: "Recurring expense added",
        description: "Your recurring expense has been successfully added.",
      });
      
      // Close dialog and refresh parent
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error("Error adding recurring expense:", error);
      toast({
        title: "Error",
        description: "Failed to add recurring expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Recurring Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          {/* Amount and Date in the same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <AmountInput 
                value={formData.amount} 
                onChange={(value) => handleChange("amount", value)} 
              />
            </div>
            <div>
              <DateSelector 
                selectedDate={formData.nextDueDate} 
                onChange={(date) => handleChange("nextDueDate", date)} 
              />
            </div>
          </div>

          {/* Category */}
          <CategorySelector 
            selectedCategory={formData.category} 
            onChange={(category) => handleChange("category", category)} 
          />

          {/* Location */}
          <LocationSelector 
            selectedLocation={formData.location} 
            onChange={(location) => handleChange("location", location)} 
          />

          {/* Frequency */}
          <FrequencySelector 
            selectedFrequency={formData.frequency} 
            onChange={(frequency) => handleChange("frequency", frequency)} 
          />

          {/* Description */}
          <div className="mb-6">
            <Label htmlFor="description">Description (Optional)</Label>
            <div className="mt-1">
              <Input
                type="text"
                id="description"
                placeholder="Add notes about this recurring expense"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Recurring Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecurringExpenseForm;
