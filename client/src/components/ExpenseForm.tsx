import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Category, ExpenseWithDetails, Location, InsertLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { SPLIT_TYPES } from "@/lib/constants";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseWithDetails;
}

interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: {
    id: number;
    username: string;
  };
}

// Create a modified schema that excludes fields we handle automatically
const formSchema = z.object({
  // Description is now optional (not required)
  description: z.string().optional().or(z.literal("")),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  date: z.date({
    required_error: "Please select a date",
  }),
  split_type: z.string(),
  category_id: z.number(),
  location_id: z.number(),
});

type FormData = z.infer<typeof formSchema>;

export default function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  // Get current user data
  const { data: authData } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
  });

  // Create new location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (locationName: string): Promise<Location> => {
      const newLocation: InsertLocation = { name: locationName };
      return await apiRequest<Location>('/api/locations', 'POST', newLocation);
    },
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      // Set the form value to the newly created location
      form.setValue('location_id', newLocation.id);
    },
  });

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: expense?.description || "",
      amount: expense ? String(Number(expense.amount)) : "",
      date: expense ? new Date(expense.date) : new Date(),
      split_type: expense ? expense.split_type : "50/50",
      category_id: expense ? expense.category_id : categories?.[0]?.id || 1,
      location_id: expense ? expense.location_id : locations?.[0]?.id || 1,
    },
  });

  // Update form when expense or dependencies change
  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description || "",
        amount: String(Number(expense.amount)),
        date: new Date(expense.date),
        split_type: expense.split_type,
        category_id: expense.category_id,
        location_id: expense.location_id,
      });
    } else {
      form.reset({
        description: "",
        amount: "",
        date: new Date(),
        split_type: "50/50",
        category_id: categories?.[0]?.id || 1,
        location_id: locations?.[0]?.id || 1,
      });
    }
  }, [expense, form, categories, locations]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (!authData?.isAuthenticated || !authData?.user) {
        throw new Error("You must be logged in to save an expense");
      }

      // Convert amount to number for the API and determine the correct paying user
      const currentUserId = authData.user.id;
      
      // Find the other user's ID for proper split calculation
      // User IDs in USERS array are 7 (Antonio) and 8 (Andres)
      const otherUserId = currentUserId === 7 ? 8 : 7;
      
      // Set paid_by_user_id - always the current user regardless of split type
      // The split_type now only determines how the expense amount is distributed
      // but the expense is always paid by the user who records it
      const paid_by_user_id = currentUserId;
      
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date instanceof Date ? data.date : new Date(data.date),
        paid_by_user_id
      };

      if (expense) {
        // Update existing expense
        await apiRequest(`/api/expenses/${expense.id}`, 'PATCH', expenseData);
        
        toast({
          title: "Expense updated",
          description: "The expense has been updated successfully.",
        });
      } else {
        // Create new expense
        await apiRequest('/api/expenses', 'POST', expenseData);
        
        toast({
          title: "Expense added",
          description: "The expense has been added successfully.",
        });
      }

      // Invalidate queries to refresh data
      // Use proper query key patterns matching the ones in Dashboard/Expenses component
      const month = format(data.date, 'yyyy-MM');
      
      // Invalidate specific queries for the month
      queryClient.invalidateQueries({ queryKey: [`/api/expenses?month=${month}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/summary/${month}`] });
      
      // Also invalidate the general expenses endpoint to ensure all views refresh
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      
      // Force an immediate refetch to update the UI
      queryClient.refetchQueries({ queryKey: [`/api/expenses?month=${month}`] });
      queryClient.refetchQueries({ queryKey: [`/api/summary/${month}`] });

      // Close the form
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create footer buttons
  const formFooter = (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto"
        form="expense-form" // Connect to form by id
      >
        {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Save Expense"}
      </Button>
    </>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={expense ? "Edit Expense" : "Add New Expense"}
      description={expense 
        ? "Update expense details using the form below." 
        : "Enter expense details using the form below."}
      footer={formFooter}
    >
      <Form {...form}>
        <form id="expense-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (£)</FormLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground text-base">£</span>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="pl-7 h-12 sm:h-11 text-base" 
                      inputMode="decimal"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 sm:h-11 text-base">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" align="start" className="max-h-[280px]">
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories?.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                          className="text-base py-2.5"
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => {
              // Convert locations array to combobox items
              const locationItems: ComboboxItem[] = locations?.map(location => ({
                value: location.id.toString(),
                label: location.name
              })) || [];

              // Find the currently selected location name for display
              const selectedLocation = locations?.find(loc => loc.id === field.value)?.name;

              // Handle creation of a new location
              const handleCreateLocation = async (locationName: string) => {
                try {
                  // Check if we already have this location (case insensitive match)
                  const existingLocation = locations?.find(
                    loc => loc.name.toLowerCase() === locationName.toLowerCase()
                  );
                  
                  if (existingLocation) {
                    // If the location already exists, just use it
                    field.onChange(existingLocation.id);
                    toast({
                      title: "Location selected",
                      description: `"${existingLocation.name}" has been selected.`,
                    });
                    return;
                  }
                  
                  // Otherwise create a new location
                  const newLocation = await createLocationMutation.mutateAsync(locationName);
                  field.onChange(newLocation.id);

                  toast({
                    title: "Location added",
                    description: `"${locationName}" has been added to locations.`,
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create new location.",
                    variant: "destructive"
                  });
                }
              };

              return (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    {locationsLoading ? (
                      <Button variant="outline" disabled className="w-full justify-start">
                        Loading locations...
                      </Button>
                    ) : (
                      <Combobox
                        items={locationItems}
                        value={field.value?.toString()}
                        onSelect={(value) => field.onChange(parseInt(value))}
                        onCreateNew={handleCreateLocation}
                        placeholder="Select or add a location"
                        createNewLabel="Add new location"
                        emptyMessage="No locations found. Type to add a new one."
                        disabled={isSubmitting}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="split_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Split Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 sm:h-11 text-base">
                      <SelectValue placeholder="Select split type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" align="start" className="max-h-[280px]">
                    {SPLIT_TYPES.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="text-base py-2.5"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => {
              const [open, setOpen] = useState(false);
              
              const handleSelect = (date: Date | undefined) => {
                field.onChange(date);
                // Auto-close the popover when a date is selected
                setOpen(false);
              };
              
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-12 sm:h-11 text-base",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 sm:w-[350px]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleSelect}
                        initialFocus
                        classNames={{
                          day_selected: "bg-primary text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day: "h-9 w-9 text-base p-0 font-normal focus-within:bg-accent",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="What was this expense for?" 
                    className="h-12 sm:h-11 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ResponsiveDialog>
  );
}