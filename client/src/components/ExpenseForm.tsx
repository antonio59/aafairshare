import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Location, ExpenseWithDetails, User } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { queryClient } from "@/lib/queryClient";
import { SPLIT_TYPES, CATEGORY_ICONS, CategoryIconName } from "@/lib/constants"; // Added CATEGORY_ICONS and CategoryIconName
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox, ComboboxItem } from "@/components/ui/combobox"; // Import Combobox
import { getMonthFromDate, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for description
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // For Split Type
import { CalendarIcon, LocateFixedIcon } from "lucide-react"; // Example icons

// --- Zod Schema (Adjust if needed based on new inputs) ---
const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"), // Changed back to locationId
  splitType: z.enum(["Equal", "Owned"]), // Updated based on image buttons
  date: z.date(),
  description: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof formSchema>;

// --- Component Props ---
export interface ExpenseFormProps {
  expense?: ExpenseWithDetails;
  onClose: (needsRefetch?: boolean) => void;
  categories: Category[];
  locations: Location[]; // Re-add locations prop
  // locations: Location[]; // Location might be free text now based on image? Removing for now.
  users: User[];
  // Removed duplicate locations prop declaration
  isLoading?: boolean;
}

// --- Component ---
export default function ExpenseForm({ expense, onClose, categories, locations, users, isLoading }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false); // State for create loading
  const { toast } = useToast();
  const { currentUser } = useAuth(); // Removed userProfile as it wasn't used in submit logic directly
  const formRef = useRef<HTMLFormElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- React Hook Form Setup ---
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expense?.amount ?? undefined,
      categoryId: expense?.categoryId || "",
      locationId: expense?.locationId || "", // Use locationId
      splitType: expense?.splitType === "100%" ? "Owned" : "Equal", // Map existing values
      date: expense?.date || new Date(),
      description: expense?.description || "",
    },
  });

  // --- Mobile Keyboard Handling Effect ---
  useEffect(() => {
    const formElement = formRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!formElement || !scrollContainer) return;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches('input, select, textarea, button') && formElement.contains(target)) {
        setTimeout(() => {
          if (window.visualViewport) {
            const viewport = window.visualViewport;
            const targetRect = target.getBoundingClientRect();
            const scrollContainerRect = scrollContainer.getBoundingClientRect();
            const isObscured = targetRect.bottom > viewport.height - viewport.offsetTop;
            const isAbove = targetRect.top < scrollContainerRect.top;
            if (isObscured || isAbove) {
               target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300);
      }
    };
    formElement.addEventListener('focusin', handleFocusIn);
    return () => {
      formElement.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  // --- Start: Add Location Creation Logic ---
  const handleCreateLocation = async (locationName: string) => {
    const trimmedName = locationName.trim();
    if (!trimmedName || isCreatingLocation) return;

    // Capitalize first letter
    const capitalizedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);

    setIsCreatingLocation(true);
    try {
      const locationData = {
        name: capitalizedName, // Use capitalized name
        createdAt: serverTimestamp()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "locations"), locationData);

      toast({
        title: "Location created",
        description: `"${capitalizedName}" added.`
      });

      // Refetch locations query (assuming Dashboard handles this via queryClient)
      // We might need to explicitly pass a refetch function or rely on Dashboard's query invalidation
      await queryClient.refetchQueries({ queryKey: ['locations'] }); // Ensure locations list updates

      // Set the newly created location in the form
      form.setValue("locationId", docRef.id, { shouldValidate: true });

    } catch (error: unknown) {
      console.error("Error creating location:", error);
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

  // --- Submission Handler ---
  const onSubmit = async (data: ExpenseFormData) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "User not logged in", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Re-implement location handling if it's not free text.
      // If location needs to be selected/created like before, the logic needs to be added back.
      // For now, assuming 'location' is just a string field.

      const expenseData = {
        // Map form data to Firestore schema
        amount: data.amount,
        categoryId: data.categoryId,
        locationId: data.locationId, // Use locationId
        // locationName is not needed if we store locationId
        splitType: data.splitType === "Owned" ? "100%" : "50/50", // Map back to stored values
        date: data.date,
        description: data.description,
        paidByUserId: currentUser.uid,
        month: getMonthFromDate(data.date),
        // Add createdAt/updatedAt timestamps
        ...(expense?.id ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (expense?.id) {
        await updateDoc(doc(db, "expenses", expense.id), expenseData);
        toast({ title: "Expense updated" });
      } else {
        await addDoc(collection(db, "expenses"), expenseData);
        toast({ title: "Expense added" });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`expenses`, expenseData.month] });
      queryClient.invalidateQueries({ queryKey: [`summary`, expenseData.month] });

      onClose(true); // Close and indicate refetch needed

    } catch (error: unknown) {
      console.error("Error saving expense:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Error saving expense", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        {/* Simplified skeleton for the new layout */}
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        {/* Add more skeletons as needed */}
      </div>
    );
  }

  // Prepare items for Location Combobox (Moved before return statement)
  const locationItems: ComboboxItem[] = locations.map(l => ({ value: l.id, label: l.name }));
  // --- Render Component ---
  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full bg-white" // Assuming white background
      >
        {/* Header div removed */}
        {/* Title moved before scrollable area */}
        <h2 className="text-xl font-semibold text-center pt-2 px-4">Add Expense</h2> {/* Reduced top padding */}

        {/* Scrollable Content Area */}
        <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-4 space-y-6">

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                       <span className="text-gray-500 sm:text-sm">£</span>
                     </div>
                     <Input
                       type="number"
                       step="0.01"
                       min="0"
                       placeholder="0.00"
                       className="pl-7 h-12 text-base" // Adjusted padding and size
                       {...field}
                     />
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                <FormControl>
                  {/* Using ToggleGroup for single selection visually similar to buttons */}
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1" // Increased gap from 2 to 3
                  >
                    {categories.map((category) => {
                      // Use the icon field from the category data, fallback to placeholder
                      const IconComponent = category.icon && CATEGORY_ICONS[category.icon as CategoryIconName]
                        ? CATEGORY_ICONS[category.icon as CategoryIconName]
                        : ({ className }: { className?: string }) => <span className={cn("text-xl", className)}>❓</span>; // Placeholder if icon missing or invalid
                      return (
                        <ToggleGroupItem
                          key={category.id}
                          value={category.id}
                          aria-label={category.name}
                          className={cn(
                            "flex flex-col items-center justify-center h-20 rounded-lg border data-[state=on]:bg-blue-100 data-[state=on]:border-blue-500 data-[state=on]:text-blue-700",
                            "hover:bg-gray-50" // Basic hover effect
                          )}
                        >
                          <IconComponent className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">{category.name}</span>
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="locationId" // Use locationId
            render={({ field }) => (
              <FormItem className="flex flex-col"> {/* Ensure proper layout for Combobox */}
                 <FormLabel className="text-sm font-medium text-gray-700">Location</FormLabel>
                 <FormControl>
                   <Combobox
                     items={locationItems}
                     onCreateNew={handleCreateLocation} // Connect create handler
                     placeholder="Select or add location"
                     createNewLabel="Add new location..." // Updated label
                     emptyMessage="No location found."
                     className="h-12 text-base"
                     disabled={isCreatingLocation} // Disable while creating
                     {...field} // Spread field props (value, onChange, etc.)
                   />
                 </FormControl>
                 <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

          {/* Split Type */}
          <FormField
            control={form.control}
            name="splitType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Split Type</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-3 pt-1"
                  >
                    <ToggleGroupItem
                      value="Equal"
                      aria-label="Split equally"
                      className={cn(
                        "flex flex-col items-start justify-center h-auto p-3 rounded-lg border data-[state=on]:bg-blue-100 data-[state=on]:border-blue-500 data-[state=on]:text-blue-700",
                        "hover:bg-gray-50 text-left" // Align text left
                      )}
                    >
                      <span className="font-semibold">Equal</span>
                      <span className="text-xs text-gray-500 data-[state=on]:text-blue-600">Split equally among all</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                       value="Owned"
                       aria-label="Owned by other user"
                       className={cn(
                         "flex flex-col items-start justify-center h-auto p-3 rounded-lg border data-[state=on]:bg-blue-100 data-[state=on]:border-blue-500 data-[state=on]:text-blue-700",
                         "hover:bg-gray-50 text-left" // Align text left
                       )}
                    >
                       <span className="font-semibold">Percent</span>
                       <span className="text-xs text-gray-500 data-[state=on]:text-blue-600">100% owed by the other user</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-gray-700">Date</FormLabel>
                <FormControl>
                  {/* Using Shadcn DatePicker, assuming it's styled appropriately or can be */}
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-12 text-base w-full" // Ensure full width and height
                   />
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description"
                    className="min-h-[80px] text-base" // Basic styling for textarea
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

        </div> {/* End Scrollable Content Area */}

        {/* Sticky Buttons Container */}
        <div className="flex justify-between gap-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            type="button"
            variant="outline" // Style based on image
            onClick={() => onClose(false)}
            disabled={isSubmitting}
            className="flex-1 h-12 text-base border-gray-300 text-gray-700" // Adjusted styling
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground" // Use primary color from theme
          >
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );

  // locationItems definition moved above
}
