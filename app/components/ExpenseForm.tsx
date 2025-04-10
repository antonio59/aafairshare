import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Expense, ExpenseWithDetails, Category, Location, User } from "~/shared/schema";
import { db } from "~/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { useFirestoreFormSubmit } from "~/hooks/use-firestore-form-submit";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { getCurrentMonth } from "~/lib/utils";

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
  date: z.date({
    required_error: "Date is required",
  }),
  // paidByUserId is no longer in the form but will be added during submission
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  expense?: ExpenseWithDetails;
  categories: Category[];
  locations: Location[];
  users: User[];
  currentUserId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExpenseForm({
  expense,
  categories,
  locations,
  users,
  currentUserId,
  onSuccess,
  onCancel
}: ExpenseFormProps) {
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
      amount: expense ? String(expense.amount) : "",
      description: expense?.description || "",
      categoryId: expense?.categoryId || "",
      locationId: expense?.locationId || "",
      splitType: expense?.splitType || "50/50",
      date: expense?.date ? new Date(expense.date) : new Date(),
      // paidByUserId is automatically set to currentUserId
    },
    mode: "onSubmit", // Only validate on submit
    reValidateMode: "onBlur", // Re-validate when fields lose focus
  });

  // Use the Firestore form submit hook
  const { handleSubmit: handleFirestoreSubmit, isSubmitting: isFirestoreSubmitting } = useFirestoreFormSubmit({
    collectionName: "expenses",
    item: expense, // Pass the expense if we're editing
    successAddTitle: "Expense Added",
    successUpdateTitle: "Expense Updated",
    successAddDescription: "The expense has been added successfully.",
    successUpdateDescription: "The expense has been updated successfully.",
    errorTitle: "Error",
    errorDescription: "Failed to save expense. Please try again.",
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      form.reset();
    }
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
    try {
      // Prepare the data for submission
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount),
        paidByUserId: currentUserId, // Always set the current user as the payer
        month: format(values.date, 'yyyy-MM'), // Add the month field
      };

      // Use the Firestore submit handler
      await handleFirestoreSubmit(expenseData);
    } catch (error) {
      console.error("Error submitting expense form:", error);
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive"
      });
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

          {/* Date Selection */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
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
        </div>

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
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

        {/* Description Field (Optional) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
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
            {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
