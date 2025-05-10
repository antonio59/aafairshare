
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  ShoppingBag, 
  Gift, 
  ShoppingCart, 
  Umbrella, 
  Train, 
  Utensils, 
  Ticket, 
  Zap 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  addExpense, 
  getCategories, 
  getLocations,
  createLocation
} from "@/services/expenseService";

const categories = [
  { name: "Dining", icon: <Utensils className="h-6 w-6" /> },
  { name: "Entertainment", icon: <Ticket className="h-6 w-6" /> },
  { name: "Gifts", icon: <Gift className="h-6 w-6" /> },
  { name: "Groceries", icon: <ShoppingCart className="h-6 w-6" /> },
  { name: "Health", icon: <Heart className="h-6 w-6" /> },
  { name: "Holidays", icon: <Umbrella className="h-6 w-6" /> },
  { name: "Shopping", icon: <ShoppingBag className="h-6 w-6" /> },
  { name: "Transport", icon: <Train className="h-6 w-6" /> },
  { name: "Utilities", icon: <Zap className="h-6 w-6" /> },
];

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date(),
    category: "",
    location: "",
    description: "",
    paidBy: "1", // Default to Antonio
    split: "50/50", // Default to equal split
  });

  // New location dialog
  const [newLocationDialogOpen, setNewLocationDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [creatingLocation, setCreatingLocation] = useState(false);

  // Fetch categories and locations
  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  
  const { data: locations, refetch: refetchLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  // Combine hardcoded categories with those from the database
  const allCategories = [...categories];
  if (dbCategories) {
    const dbCategoryNames = new Set(dbCategories.map(cat => cat.name));
    const missingDbCategories = dbCategories
      .filter(cat => !categories.some(c => c.name === cat.name))
      .map(cat => ({ name: cat.name, icon: <ShoppingBag className="h-6 w-6" /> }));
    
    allCategories.push(...missingDbCategories);
  }

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
        paidBy: formData.paidBy,
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

  const handleAddNewLocation = async () => {
    if (!newLocationName.trim()) return;
    
    setCreatingLocation(true);
    
    try {
      const newLocation = await createLocation(newLocationName.trim());
      
      toast({
        title: "Location added",
        description: `${newLocationName} has been added as a new location.`,
      });
      
      // Update locations list
      await refetchLocations();
      
      // Set the new location as selected
      handleChange("location", newLocation.name);
      
      // Close the dialog
      setNewLocationDialogOpen(false);
      setNewLocationName("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingLocation(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <div className="mb-6">
          <Label htmlFor="amount">Amount</Label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <Input
              type="number"
              id="amount"
              placeholder="0.00"
              className="pl-7"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
            />
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <Label>Date</Label>
          <div className="mt-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => handleChange("date", date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <Label>Category</Label>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {allCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={cn(
                  "p-4 border rounded-md flex flex-col items-center justify-center gap-2 transition-colors",
                  formData.category === category.name
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleChange("category", category.name)}
              >
                {category.icon}
                <span className="text-xs">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <Label htmlFor="location">Location</Label>
          <div className="mt-1 flex gap-2">
            <Select
              value={formData.location}
              onValueChange={(value) => handleChange("location", value)}
            >
              <SelectTrigger id="location" className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Locations</SelectLabel>
                  {locations && locations.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setNewLocationDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Split Type */}
        <div className="mb-6">
          <Label>Split Type</Label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <button
              type="button"
              className={cn(
                "p-4 border rounded-lg",
                formData.split === "50/50"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              )}
              onClick={() => handleChange("split", "50/50")}
            >
              <div className="font-semibold">Equal</div>
              <div className="text-sm text-gray-500">Split equally among all</div>
            </button>
            <button
              type="button"
              className={cn(
                "p-4 border rounded-lg",
                formData.split === "custom"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              )}
              onClick={() => handleChange("split", "custom")}
            >
              <div className="font-semibold">Percent</div>
              <div className="text-sm text-gray-500">100% owed by the other user</div>
            </button>
          </div>
        </div>

        {/* Paid By */}
        <div className="mb-6">
          <Label>Paid By</Label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <button
              type="button"
              className={cn(
                "p-4 border rounded-lg flex items-center gap-3",
                formData.paidBy === "1"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              )}
              onClick={() => handleChange("paidBy", "1")}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio"
                  alt="Antonio avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-medium">Antonio</div>
            </button>
            <button
              type="button"
              className={cn(
                "p-4 border rounded-lg flex items-center gap-3",
                formData.paidBy === "2"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              )}
              onClick={() => handleChange("paidBy", "2")}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
                  alt="Andres avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-medium">Andres</div>
            </button>
          </div>
        </div>

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

      {/* Add new location dialog */}
      <Dialog open={newLocationDialogOpen} onOpenChange={setNewLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="new-location">Location Name</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="new-location"
                  placeholder="Enter location name"
                  className="pl-10"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewLocationDialogOpen(false);
                setNewLocationName("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewLocation}
              disabled={creatingLocation || !newLocationName.trim()}
            >
              {creatingLocation ? "Adding..." : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddExpense;
