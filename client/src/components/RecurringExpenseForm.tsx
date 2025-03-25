import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SPLIT_TYPES } from "@/lib/constants";
import type { RecurringExpenseWithDetails, InsertLocation, Category, Location } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Define frequency options
const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Biweekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

// Define form schema with validation
const formSchema = z.object({
  description: z.string().optional().or(z.literal("")),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  frequency: z.string().min(1, "Frequency is required"),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  // We'll keep the end_date for UI purposes, but won't send it to the server
  end_date: z.date().nullable().optional(),
  next_date: z.date({
    required_error: "Next date is required",
  }),
  paid_by_user_id: z.number({
    required_error: "Paid by user is required",
  }),
  split_type: z.string().default("50/50"),
  category_id: z.number({
    required_error: "Category is required",
  }),
  location_id: z.number({
    required_error: "Location is required",
  }),
  is_active: z.boolean().default(true),
});

// Helper function to validate dates
function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Component props interface
interface RecurringExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringExpense?: RecurringExpenseWithDetails;
}

// Define FormData type
type FormData = z.infer<typeof formSchema>;

interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: {
    id: number;
    username: string;
  };
}

export default function RecurringExpenseForm({ 
  open, 
  onOpenChange, 
  recurringExpense 
}: RecurringExpenseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      const response = await apiRequest('POST', '/api/locations', newLocation);
      return response.json();
    },
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      // Set the form value to the newly created location
      form.setValue('location_id', newLocation.id);
      
      toast({
        title: "Location added",
        description: `New location has been added successfully.`,
      });
    },
  });

  // Initialize form with recurring expense data or defaults
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: recurringExpense ? {
      description: recurringExpense.description || "",
      amount: recurringExpense.amount.toString(),
      frequency: recurringExpense.frequency,
      start_date: new Date(recurringExpense.start_date),
      end_date: recurringExpense.end_date ? new Date(recurringExpense.end_date) : null,
      next_date: new Date(recurringExpense.next_date),
      paid_by_user_id: recurringExpense.paid_by_user_id,
      split_type: recurringExpense.split_type,
      category_id: recurringExpense.category_id,
      location_id: recurringExpense.location_id,
      is_active: recurringExpense.is_active,
    } : {
      description: "",
      amount: "",
      frequency: "monthly",
      start_date: new Date(), // Make sure we always have a start_date by default
      end_date: null,
      next_date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to next month
      paid_by_user_id: authData?.user?.id || 1,
      split_type: "50/50",
      category_id: categories?.[0]?.id || 0, 
      location_id: locations?.[0]?.id || 0,
      is_active: true,
    }
  });

  // Watch start_date to update next_date automatically when start_date changes
  const startDate = form.watch("start_date");
  const frequency = form.watch("frequency");

  // Update form when auth data changes
  useEffect(() => {
    if (authData?.user && !recurringExpense) {
      form.setValue('paid_by_user_id', authData.user.id);
    }
  }, [authData, form, recurringExpense]);

  // Update next_date when start_date changes (only for new expenses)
  useEffect(() => {
    if (!recurringExpense) {
      form.setValue("next_date", startDate);
    }
  }, [startDate, form, recurringExpense]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (!authData?.isAuthenticated || !authData?.user) {
        throw new Error("You must be logged in to save a recurring expense");
      }

      // Set a default start_date if none is provided
      // This is a fallback safety measure to ensure we always have a start_date
      if (!data.start_date) {
        console.log("Setting default start_date as it was null");
        data.start_date = new Date();
      }
      
      // Log the data we're about to process for debugging
      console.log("Form data before processing:", data);
      
      // Explicitly create new Date objects from the dates to ensure they're valid
      let startDate;
      try {
        startDate = data.start_date instanceof Date 
          ? new Date(data.start_date.getTime()) 
          : new Date(data.start_date);
      } catch (e) {
        console.error("Error parsing start_date:", e);
        // Fallback to current date if parsing fails
        startDate = new Date();
      }
      
      let nextDate;
      try {
        nextDate = data.next_date instanceof Date 
          ? new Date(data.next_date.getTime()) 
          : new Date(data.next_date);
      } catch (e) {
        console.error("Error parsing next_date:", e);
        // Fallback to one month from current date if parsing fails
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        nextDate = date;
      }
      
      let endDate = null;
      if (data.end_date) {
        try {
          endDate = data.end_date instanceof Date 
            ? new Date(data.end_date.getTime()) 
            : new Date(data.end_date);
        } catch (e) {
          console.error("Error parsing end_date:", e);
        }
      }
      
      // Validate dates again after processing
      if (!isValidDate(startDate)) {
        console.error("Invalid start date after processing", startDate);
        startDate = new Date();
      }
      
      if (!isValidDate(nextDate)) {
        console.error("Invalid next date after processing", nextDate);
        nextDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
      }
      
      // Ensure dates are properly formatted for the PostgreSQL database
      // This converts to ISO format which is compatible with PostgreSQL
      const formattedStartDate = startDate.toISOString();
      const formattedNextDate = nextDate.toISOString();
      const formattedEndDate = endDate ? endDate.toISOString() : null;
      
      // Build the data object with all required fields and properly formatted dates
      const recurringExpenseData = {
        ...data,
        amount: parseFloat(data.amount),
        start_date: formattedStartDate,
        next_date: formattedNextDate,
        end_date: formattedEndDate,
      };
      
      // Log the final data we're sending to the server
      console.log("Data to be sent to server:", recurringExpenseData);

      if (recurringExpense) {
        // Update existing recurring expense
        const response = await apiRequest(
          "PATCH", 
          `/api/recurring-expenses/${recurringExpense.id}`, 
          recurringExpenseData
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update recurring expense');
        }
        
        toast({
          title: "Recurring expense updated",
          description: "The recurring expense has been updated successfully.",
        });
      } else {
        // Create new recurring expense
        const response = await apiRequest(
          "POST", 
          "/api/recurring-expenses", 
          recurringExpenseData
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create recurring expense');
        }
        
        toast({
          title: "Recurring expense added",
          description: "The recurring expense has been added successfully.",
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["/api/recurring-expenses"],
      });

      // Close the form and reset
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error saving recurring expense:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save recurring expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recurringExpense ? "Edit Recurring Expense" : "Create Recurring Expense"}</DialogTitle>
          <DialogDescription>
            {recurringExpense 
              ? "Update the details of your recurring expense." 
              : "Add a new recurring expense that will automatically generate expenses at regular intervals."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (£)</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">£</span>
                      </div>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-7" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  
                  const handleSelect = (date: Date | undefined) => {
                    field.onChange(date);
                    // Auto-close the popover when a date is selected
                    setOpen(false);
                  };
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleSelect}
                            initialFocus
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
                name="next_date"
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  
                  const handleSelect = (date: Date | undefined) => {
                    field.onChange(date);
                    // Auto-close the popover when a date is selected
                    setOpen(false);
                  };
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Date</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => {
                const [open, setOpen] = useState(false);
                
                const handleSelect = (date: Date | undefined) => {
                  field.onChange(date);
                  // Auto-close the popover when a date is selected
                  setOpen(false);
                };
                
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={handleSelect}
                          disabled={(date) =>
                            date < startDate
                          }
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="ghost"
                            className="w-full justify-center"
                            onClick={() => {
                              form.setValue("end_date", null);
                              setOpen(false);
                            }}
                          >
                            Clear end date
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      If set, the recurring expense will stop after this date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                        ) : (
                          categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
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
            </div>

            <FormField
              control={form.control}
              name="split_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Split Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select split type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPLIT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Describe the expense" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Toggle to activate or deactivate this recurring expense
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : recurringExpense ? "Update Expense" : "Save Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}