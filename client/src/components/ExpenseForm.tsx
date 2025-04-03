import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Location, ExpenseWithDetails, User } from "@shared/schema";
import { z } from "zod";
// Removed unused Controller import
// import { Controller } from "react-hook-form";
// Removed unused useFormField import
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// Removed unused cn import
// import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
// Removed unused Timestamp, query, orderBy, getDocs imports
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed unused SelectPrimitive import
// import * as SelectPrimitive from "@radix-ui/react-select";
// Removed unused ChevronDown import
// import { ChevronDown } from "lucide-react";
import { Combobox, ComboboxItem } from "@/components/ui/combobox"; // Keep Combobox
import { getMonthFromDate } from "@/lib/utils"; // Added getMonthFromDate
import { useAuth } from "@/context/AuthContext";
// Removed unused apiRequest import
import { queryClient } from "@/lib/queryClient"; // Import queryClient for invalidation
import { SPLIT_TYPES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";

export interface ExpenseFormProps {
  expense?: ExpenseWithDetails;
  onClose: (needsRefetch?: boolean) => void;
  categories: Category[];
  locations: Location[];
  users: User[]; // Keep users prop for potential future use, even if currently unused in logic
  isLoading?: boolean;
}
// Zod schema
const formSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"), // Validate as positive number
  date: z.date(),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"),
  splitType: z.string().min(1, "Split type is required"),
});

export type ExpenseFormData = z.infer<typeof formSchema>;

// Removed unused 'users' from props destructuring
export default function ExpenseForm({ expense, onClose, categories, locations, isLoading }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const formRef = useRef<HTMLFormElement>(null); // Ref for the form element
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: expense?.description || "",
      amount: expense?.amount ?? undefined, // Use number or undefined, not string
      date: expense?.date || new Date(),
      categoryId: expense?.categoryId || "",
      locationId: expense?.locationId || "",
      splitType: expense?.splitType || "50/50",
    },
  });

  // --- Start: Add Location Creation Logic ---
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);

  const handleCreateLocation = async (locationName: string) => {
    if (!locationName.trim() || isCreatingLocation) return;

    setIsCreatingLocation(true);
    try {
      const locationData = {
        name: locationName.trim(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "locations"), locationData);

      toast({
        title: "Location created",
        description: `"${locationName.trim()}" added.`
      });

      // Refetch locations query and wait for completion
      await queryClient.refetchQueries({ queryKey: ['locations'] });

      // THEN update the form value with the new location ID, ensuring the list is updated
      form.setValue("locationId", docRef.id, { shouldValidate: true });

    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error("Error creating location:", error);
      // Type check before accessing properties
      const errorMessage = error instanceof Error ? error.message : "Could not add the new location.";
      toast({
        title: "Error creating location",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingLocation(false);
    }
  };
  // --- End: Add Location Creation Logic ---

  const onSubmit = async (data: ExpenseFormData) => {
    if (!currentUser || !userProfile) {
      toast({
        title: "Authentication Error",
        description: "User data not available",
        variant: "destructive"
      });
      return;
    }

    // Verify auth consistency
    if (currentUser.uid !== userProfile.id) {
      console.error('Authentication mismatch:', {
        currentUserId: currentUser.uid,
        profileId: userProfile.id
      });
      toast({
        title: "Data Error",
        description: "Authentication data mismatch",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!currentUser || !userProfile) {
        throw new Error('Missing user data');
      }

      if (!currentUser) {
        throw new Error('User not authenticated');
      }
const expenseData = {
  ...data,
  paidByUserId: currentUser.uid, // Store only Firebase Auth UID
  amount: data.amount, // Already a number from Zod coercion
  month: getMonthFromDate(data.date), // Use utility function
  createdAt: serverTimestamp(),
};

if (expense?.id) {
        // Update existing expense
        await updateDoc(doc(db, "expenses", expense.id), expenseData);
        toast({ title: "Expense updated" });
      } else {
        // Add new expense
        await addDoc(collection(db, "expenses"), expenseData);
        toast({ title: "Expense added" });
      }

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: [`expenses`, expenseData.month] });
      queryClient.invalidateQueries({ queryKey: [`summary`, expenseData.month] });

      onClose(false); // Close without additional refetch
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error("Error saving expense:", error);
      // Type check before accessing properties
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Error saving expense",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
 
  // --- Start: Mobile Keyboard Handling ---
  useEffect(() => {
    const formElement = formRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!formElement || !scrollContainer) return;
 
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      // Check if the focused element is an input, select, textarea, or button within our form
      if (target.matches('input, select, textarea, button') && formElement.contains(target)) {
        // Use setTimeout to allow the keyboard to finish animating/resizing viewport
        setTimeout(() => {
          // Check if visualViewport API is available
          if (window.visualViewport) {
            const viewport = window.visualViewport;
            const targetRect = target.getBoundingClientRect();
            const scrollContainerRect = scrollContainer.getBoundingClientRect();
 
            // Calculate how much of the element is visible within the visual viewport
            const visibleHeight = Math.max(0, Math.min(targetRect.bottom, viewport.height) - Math.max(targetRect.top, 0));
 
            // If element is mostly obscured by keyboard (e.g., bottom part below viewport offsetTop)
            // or if the top is above the scroll container's visible top
            const isObscured = targetRect.bottom > viewport.height - viewport.offsetTop; // Simplified check
            const isAbove = targetRect.top < scrollContainerRect.top;
 
            if (isObscured || isAbove) {
               target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            // Fallback for browsers without visualViewport API
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300); // Adjust delay as needed
      }
    };
 
    formElement.addEventListener('focusin', handleFocusIn);
 
    return () => {
      formElement.removeEventListener('focusin', handleFocusIn);
    };
  }, []); // Empty dependency array ensures this runs once on mount
  // --- End: Mobile Keyboard Handling ---
 
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Prepare items for Comboboxes
  const categoryItems: ComboboxItem[] = categories.map(c => ({ value: c.id, label: c.name }));
  const locationItems: ComboboxItem[] = locations.map(l => ({ value: l.id, label: l.name }));

  return (
    <Form {...form}>
      {/* Assign formRef here */}
      <form id="expense-form" ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full"> {/* Make form flex column */}
        {/* Scrollable Content Area */}
        {/* Assign scrollContainerRef here and add styling */}
        <div ref={scrollContainerRef} className="flex-grow overflow-y-auto space-y-6 p-1 mb-4"> {/* Added padding and margin-bottom */}
          {/* Original content starts here */}
          {/* Removed duplicate form tag */}
        {/* Reordered Fields */}
        <div className="grid grid-cols-1 gap-4">
          {/* 1. Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Amount (£)</FormLabel> {/* Match screenshot label */}
                <FormControl asChild><Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-10"
                    {...field} // Spread props, including id from FormControl
                  /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* 2. Category (Combobox) */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col"> {/* Ensure proper layout for Combobox */}
                 <FormLabel className="text-sm font-medium">Category</FormLabel>
                 <FormControl asChild><Combobox
                     items={categoryItems}
                     placeholder="Select a category"
                     emptyMessage="No category found."
                     className="h-10" // Keep height consistent
                     {...field} // Spread field props (includes value, onChange, etc.)
                     // No onCreateNew for categories
                     // id is passed automatically by FormControl asChild
                   /></FormControl>
                 <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* 3. Location (Combobox with Create New) */}
          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem className="flex flex-col"> {/* Ensure proper layout for Combobox */}
                 <FormLabel className="text-sm font-medium">Location</FormLabel>
                 <FormControl asChild><Combobox
                     items={locationItems}
                     onCreateNew={handleCreateLocation} // Add create new handler
                     placeholder="Select or add location"
                     createNewLabel="Add new location"
                     emptyMessage="No location found."
                     className="h-10" // Keep height consistent
                     disabled={isCreatingLocation} // Disable while creating (Keep this one, as it's specific logic)
                     {...field} // Spread field props (includes value, onChange, etc.)
                     // Removed duplicated props below
                     // id is passed automatically by FormControl asChild
                   /></FormControl>
                 <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* 4. Split Type (Reverted to FormField) */}
          <FormField
            control={form.control}
            name="splitType"
            render={({ field }) => ( // Revert to simple render prop
              <FormItem>
                 <FormLabel className="text-sm font-medium">Split Type</FormLabel>
                 {/* Remove FormControl asChild */}
                 <Select
                   onValueChange={field.onChange} // Pass field.onChange to onValueChange
                   value={field.value}           // Pass field.value to value
                   // name={field.name} // name is handled by FormField
                   // onBlur={field.onBlur} // Optional: Pass onBlur if needed
                 >
                   <FormControl> {/* Wrap Trigger in FormControl (without asChild) */}
                     <SelectTrigger ref={field.ref} className="h-10"> {/* Pass ref to Trigger */}
                       <SelectValue placeholder="Select split type" />
                     </SelectTrigger>
                   </FormControl>
                       <SelectContent>
                         {SPLIT_TYPES.map((type) => (
                           <SelectItem key={type} value={type}>
                             {type === "100%" ? "100% (Owed by other)" : type}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                  {/* FormMessage remains outside */}
                  <FormMessage className="text-xs" />
                </FormItem>
            )}
          />

          {/* 5. Date */}
           <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col"> {/* Ensure proper layout */}
                 <FormLabel className="text-sm font-medium">Date</FormLabel>
                 <FormControl asChild><DatePicker {...field} className="h-10 w-full"/></FormControl>
                 <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* 6. Description (Optional, at the end) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel> {/* Match screenshot label */}
                {/* Comment moved outside FormControl */}
                {/* Use Textarea for potentially longer descriptions? Or keep Input */}
                <FormControl asChild><Input
                    placeholder="What was this expense for?"
                    className="h-10"
                    {...field} // Spread props, including id from FormControl
                  /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

        </div> {/* End of grid */}
      </div> {/* <<<< ADDED: Close scrollable container div */}

        {/* <<<< REMOVED old non-sticky button container */}
 
        {/* Buttons Container (Fixed at bottom) */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-background pb-4 px-1"> {/* Make buttons sticky */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isSubmitting}
            className="h-10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10"
          >
            {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Save Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
