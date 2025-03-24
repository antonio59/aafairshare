import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
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
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { USERS, SPLIT_TYPES } from "@/lib/constants";
import type { RecurringExpenseWithDetails } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  name: z.string().min(2, "Name must be at least 2 characters"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  frequency: z.string().min(1, "Frequency is required"),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date().nullable().optional(),
  next_date: z.date({
    required_error: "Next date is required",
  }),
  paid_by: z.number({
    required_error: "Paid by is required",
  }),
  split_type: z.string().default("50/50"),
  notes: z.string().optional(),
  category_id: z.number({
    required_error: "Category is required",
  }),
  location_id: z.number({
    required_error: "Location is required",
  }),
  is_active: z.boolean().default(true),
});

// Component props interface
interface RecurringExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringExpense?: RecurringExpenseWithDetails;
}

// Define FormData type
type FormData = z.infer<typeof formSchema>;

export default function RecurringExpenseForm({ 
  open, 
  onOpenChange, 
  recurringExpense 
}: RecurringExpenseFormProps) {
  // State for categories and locations
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationName, setLocationName] = useState("");

  // Fetch categories and locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await apiRequest("GET", "/api/categories");
        const locationsResponse = await apiRequest("GET", "/api/locations");
        
        const categoriesData = await categoriesResponse.json();
        const locationsData = await locationsResponse.json();
        
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Initialize form with recurring expense data or defaults
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: recurringExpense ? {
      name: recurringExpense.name,
      amount: recurringExpense.amount.toString(),
      frequency: recurringExpense.frequency,
      start_date: new Date(recurringExpense.start_date),
      end_date: recurringExpense.end_date ? new Date(recurringExpense.end_date) : null,
      next_date: new Date(recurringExpense.next_date),
      paid_by: recurringExpense.paid_by,
      split_type: recurringExpense.split_type,
      notes: recurringExpense.notes || "",
      category_id: recurringExpense.category_id,
      location_id: recurringExpense.location_id,
      is_active: recurringExpense.is_active,
    } : {
      name: "",
      amount: "",
      frequency: "monthly",
      start_date: new Date(),
      end_date: null,
      next_date: new Date(),
      paid_by: 1, // Default to first user
      split_type: "50/50",
      notes: "",
      category_id: 0,
      location_id: 0,
      is_active: true,
    }
  });

  // Watch start_date to update next_date automatically when start_date changes
  const startDate = form.watch("start_date");
  const frequency = form.watch("frequency");

  useEffect(() => {
    // Only set next_date equal to start_date when creating a new recurring expense
    if (!recurringExpense) {
      form.setValue("next_date", startDate);
    }
  }, [startDate, form, recurringExpense]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // If location_id is 0 and locationName is provided, create a new location
    if (data.location_id === 0 && locationName) {
      try {
        const locationResponse = await apiRequest("POST", "/api/locations", { name: locationName });
        const newLocation = await locationResponse.json();
        data.location_id = newLocation.id;
      } catch (error) {
        console.error("Error creating location:", error);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (recurringExpense) {
        // Update existing recurring expense
        await apiRequest(
          "PATCH", 
          `/api/recurring-expenses/${recurringExpense.id}`, 
          data
        );
      } else {
        // Create new recurring expense
        await apiRequest(
          "POST", 
          "/api/recurring-expenses", 
          data
        );
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["/api/recurring-expenses"],
      });

      // Close the form and reset
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving recurring expense:", error);
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Rent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (£)</FormLabel>
                    <FormControl>
                      <Input placeholder="100.00" type="number" step="0.01" {...field} />
                    </FormControl>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? FREQUENCY_OPTIONS.find(
                                  (option) => option.value === field.value
                                )?.label
                              : "Select frequency"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandGroup>
                            {FREQUENCY_OPTIONS.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => {
                                  form.setValue("frequency", option.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    option.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
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
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Next Date</FormLabel>
                    <Popover>
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
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
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
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < startDate
                        }
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Button
                          variant="ghost"
                          className="w-full justify-center"
                          onClick={() => form.setValue("end_date", null)}
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
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paid_by"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Paid By</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? USERS.find((user) => user.id === field.value)
                                  ?.name
                              : "Select user"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandGroup>
                            {USERS.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.name}
                                onSelect={() => {
                                  form.setValue("paid_by", user.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    user.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {user.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="split_type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Split Type</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? SPLIT_TYPES.find(t => t.value === field.value)?.label : "Select split type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandGroup>
                            {SPLIT_TYPES.map((type) => (
                              <CommandItem
                                key={type.value}
                                value={type.value}
                                onSelect={() => {
                                  form.setValue("split_type", type.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    type.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {type.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && categories.length > 0
                              ? categories.find(
                                  (category) => category.id === field.value
                                )?.name || "Select category"
                              : "Select category"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => {
                                  form.setValue("category_id", category.id);
                                }}
                              >
                                <div
                                  className="mr-2 h-4 w-4 rounded-full"
                                  style={{
                                    backgroundColor: category.color,
                                  }}
                                />
                                <span className="ml-1">{category.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Combobox
                      items={[
                        ...locations.map((loc) => ({
                          value: loc.id.toString(),
                          label: loc.name,
                        })),
                        { value: "0", label: "Add new location..." },
                      ]}
                      value={field.value.toString()}
                      onSelect={(value) => {
                        const numValue = parseInt(value);
                        form.setValue("location_id", numValue);
                        if (numValue === 0) {
                          setLocationName("");
                        }
                      }}
                      onCreateNew={(value) => {
                        setLocationName(value);
                      }}
                      createNewLabel="Create location"
                      placeholder="Select location"
                      emptyMessage="No locations found"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.getValues("location_id") === 0 && (
              <FormItem>
                <FormLabel>New Location Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter new location name"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this recurring expense
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : recurringExpense
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}