import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category } from "~/shared/schema";
import { db } from "~/lib/firebase";
import { useFirestoreFormSubmit } from "~/hooks/use-firestore-form-submit";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES, CategoryIconName } from "~/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name is too long"),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess?: (category: Category) => void;
  onCancel?: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      icon: category?.icon || undefined,
    },
    mode: "onTouched", // Only validate fields after they've been touched
  });

  // Use the Firestore form submit hook
  const { submit } = useFirestoreFormSubmit({
    db,
    collectionName: "categories",
    successMessage: category ? "Category updated successfully" : "Category created successfully",
    errorMessage: category ? "Failed to update category" : "Failed to create category",
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data as Category);
      }
      form.reset();
    },
  });

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await submit(values, category?.id);
    } catch (error) {
      console.error("Error submitting category form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Icon Selection */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1"
                >
                  {CATEGORY_ICON_NAMES.map((iconName) => {
                    const Icon = CATEGORY_ICONS[iconName];
                    return (
                      <ToggleGroupItem
                        key={iconName}
                        value={iconName}
                        className="flex flex-col items-center justify-center h-20 rounded-lg border border-gray-200 dark:border-gray-700 data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900/30 data-[state=on]:border-blue-500 dark:data-[state=on]:border-blue-700 data-[state=on]:text-blue-700 dark:data-[state=on]:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        aria-label={iconName}
                      >
                        <Icon className="h-6 w-6 mb-1 text-gray-800 dark:text-white" />
                        <span className="text-xs font-medium">{iconName}</span>
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
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
            {isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
