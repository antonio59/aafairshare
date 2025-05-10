
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addExpense } from "@/services/expenseService";
import AmountInput from "@/components/expense/AmountInput";
import DateSelector from "@/components/expense/DateSelector";
import CategorySelector from "@/components/expense/CategorySelector";
import LocationSelector from "@/components/expense/LocationSelector";
import SplitTypeSelector from "@/components/expense/SplitTypeSelector";

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date(),
    category: "",
    location: "",
    description: "",
    paidBy: "1", // Default to current user
    split: "50/50", // Default to equal split
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.amount || !formData.date || !formData.category) {
        toast({
          title: "Missing fields",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }

      // Format the data for submission
      const expenseData = {
        amount: parseFloat(formData.amount),
        date: format(formData.date, "yyyy-MM-dd"),
        category: formData.category,
        location: formData.location,
        description: formData.description,
        paidBy: formData.paidBy, // Always the current user
        split: formData.split,
      };

      // Submit the expense
      await addExpense(expenseData);
      
      // Success message
      toast({
        title: "Expense added",
        description: "Your expense has been successfully added.",
      });
      
      // Navigate back to dashboard
      navigate("/");
      
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit}>
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
              selectedDate={formData.date} 
              onChange={(date) => handleChange("date", date)} 
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

        {/* Split Type */}
        <SplitTypeSelector 
          selectedSplitType={formData.split} 
          onChange={(splitType) => handleChange("split", splitType)} 
        />

        {/* Description */}
        <div className="mb-10">
          <Label htmlFor="description">Description (Optional)</Label>
          <div className="mt-1">
            <Input
              type="text"
              id="description"
              placeholder="Add notes about this expense"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg">
            Save Expense
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
