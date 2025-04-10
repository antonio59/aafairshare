import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { RecurringExpense, Category, Location, User } from "~/shared/schema";
import { db } from "~/lib/firebase";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Combobox, ComboboxOption } from "~/components/ui/combobox";
import CategoryIcons from "~/components/CategoryIcons";
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";

// Define form schema with Zod
const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"),
  splitType: z.enum(["50/50", "100%"]),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional().nullable(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  isActive: z.boolean().default(true),
  // paidByUserId is no longer in the form but will be added during submission
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringExpenseFormProps {
  recurringExpense?: RecurringExpense;
  categories: Category[];
  locations: Location[];
  users: User[];
  currentUserId: string;
  onSuccess?: (recurringExpense: RecurringExpense) => void;
  onCancel?: () => void;
}

export default function RecurringExpenseForm({
  recurringExpense,
  categories,
  locations,
  users,
  currentUserId,
  onSuccess,
  onCancel
}: RecurringExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Sort locations alphabetically
  const sortedLocations = [...locations].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Convert locations to combobox options
  const locationOptions: ComboboxOption[] = sortedLocations.map(location => ({
    value: location.id,
    label: location.name
  }));

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: recurringExpense ? String(recurringExpense.amount) : "",
      description: recurringExpense?.description || "",
      categoryId: recurringExpense?.categoryId || "",
      locationId: recurringExpense?.locationId || "",
      splitType: recurringExpense?.splitType || "50/50",
      startDate: recurringExpense?.startDate ? new Date(recurringExpense.startDate) : new Date(),
      endDate: recurringExpense?.endDate ? new Date(recurringExpense.endDate) : null,
      frequency: recurringExpense?.frequency || "monthly",
      isActive: recurringExpense?.isActive ?? true,
      // paidByUserId is automatically set to currentUserId
    },
    mode: "onSubmit", // Only validate on submit
    reValidateMode: "onBlur", // Re-validate when fields lose focus
  });

  // Handle creating a new location
  const handleCreateLocation = async (name: string) => {
    try {
      // Create a new location in Firestore
      const locationData = {
        name,
        createdAt: serverTimestamp(),
        createdBy: currentUserId
      };

      const docRef = await addDoc(collection(db, "locations"), locationData);

      // Update the form with the new location
      form.setValue("locationId", docRef.id);

      // Show success message
      toast({
        title: "Location Added",
        description: `${name} has been added as a new location.`
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating location:", error);
      toast({
        title: "Error",
        description: "Failed to create new location. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Transform form values to Firestore data
      const amount = parseFloat(values.amount);

      // Prepare data for Firestore
      const recurringExpenseData = {
        amount,
        description: values.description || "",
        categoryId: values.categoryId,
        locationId: values.locationId,
        splitType: values.splitType,
        startDate: Timestamp.fromDate(values.startDate),
        endDate: values.endDate ? Timestamp.fromDate(values.endDate) : null,
        frequency: values.frequency,
        isActive: values.isActive,
        paidByUserId: currentUserId, // Always use the current user
        title: values.description || "Recurring Expense",
        ...(recurringExpense?.id ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (recurringExpense?.id) {
        // Update existing recurring expense
        await updateDoc(doc(db, "recurringExpenses", recurringExpense.id), recurringExpenseData);
        toast({ title: "Recurring expense updated" });
      } else {
        // Create new recurring expense
        const docRef = await addDoc(collection(db, "recurringExpenses"), recurringExpenseData);
        toast({ title: "Recurring expense added" });
      }

      if (onSuccess) {
        onSuccess(recurringExpenseData as RecurringExpense);
      }
      form.reset();
    } catch (error) {
      console.error("Error submitting recurring expense form:", error);
      toast({
        title: "Error",
        description: "Failed to save recurring expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Field */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Amount (£)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">£</span>
                    </div>
                    <Input
                      placeholder="0.00"
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      className="pl-7 h-12 text-base"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Frequency Selection */}
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategoryIcons
                  categories={categories}
                  selectedCategoryId={field.value}
                  onSelectCategory={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Selection */}
          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Combobox
                    options={locationOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a location"
                    emptyText="No locations found"
                    onCreateNew={handleCreateLocation}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Split Type Selection */}
          <FormField
            control={form.control}
            name="splitType"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Split Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select split type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="50/50">50/50 Split</SelectItem>
                    <SelectItem value="100%">100% (Not Split)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date Selection */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-12 text-base w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date Selection (Optional) */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex items-center justify-between">
                  <FormLabel>End Date (Optional)</FormLabel>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(null)}
                      className="h-8 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <FormControl>
                  <DatePicker
                    value={field.value || undefined}
                    onChange={field.onChange}
                    className="h-12 text-base w-full"
                    minDate={form.getValues().startDate}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-800"
                />
              </FormControl>
              <FormLabel>Active</FormLabel>
            </FormItem>
          )}
        />

        {/* Description Field (Optional) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter description"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : recurringExpense ? "Update Expense" : "Create Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
