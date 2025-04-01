import React, { useEffect } from "react"; // Removed useState
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@shared/schema"; // Use Category type from schema
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Removed useToast import, handled by hook
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
// Removed Firestore imports, handled by hook
import { useFirestoreFormSubmit } from '@/hooks/useFirestoreFormSubmit'; // Import the hook

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category; // Use Category type from schema
}

// Local Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().min(1, "Please select a color")
});

type FormData = z.infer<typeof formSchema>;

export default function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  // Removed local isSubmitting state and toast

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      color: category?.color || CATEGORY_COLORS[0]
    }
  });

  // Update form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color
      });
    } else {
      // Reset to defaults when adding a new category or closing the form
       form.reset({
         name: "",
         color: CATEGORY_COLORS[0]
       });
    }
  }, [category, form, open]); // Add open dependency to reset on close

  // Use the custom hook for submission logic
  const { handleSubmit: handleFirestoreSubmit, isSubmitting } = useFirestoreFormSubmit({ // Remove <FormData>
    collectionName: "categories",
    item: category, // Pass the category being edited (if any)
    onSuccess: () => {
      // No need to invalidate queries here if Settings listener handles it
      onOpenChange(false); // Close dialog on success
      form.reset({ name: "", color: CATEGORY_COLORS[0] }); // Reset form
    },
    // onError is handled by the hook's default toast
  });

  // Wrapper function to match react-hook-form's expected signature
  const onSubmit = (data: FormData) => {
    handleFirestoreSubmit(data); // Call the hook's submit handler
  };

  // Create footer buttons (uses isSubmitting from the hook)
  const formFooter = (
    <>
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1 h-11 min-w-[120px] transition-all hover:bg-muted/80 active:scale-[0.98]">
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 min-w-[120px] transition-all hover:brightness-105 active:scale-[0.98]" form="category-form">
        {isSubmitting ? "Saving..." : category ? "Update" : "Save"}
      </Button>
    </>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Edit Category" : "Add New Category"}
      description="Categories help you organize and track expenses by type"
      footer={formFooter}
    >
      <Form {...form}>
        <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Category name" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Give your category a clear, descriptive name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-5 gap-4">
                    {CATEGORY_COLORS.map(color => (
                      <Button
                        key={color}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-10 w-10 rounded-full p-0 relative",
                          field.value === color && "ring-2 ring-primary"
                        )}
                        style={{ 
                          backgroundColor: color,
                          borderColor: color
                        }}
                        onClick={() => field.onChange(color)}
                      >
                        {field.value === color && (
                          <Check className="h-4 w-4 text-white absolute" />
                        )}
                        <span className="sr-only">Select color {color}</span>
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  Select a color to visually identify this category
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
