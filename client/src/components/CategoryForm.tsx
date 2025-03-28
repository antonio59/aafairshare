import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

const formSchema = insertCategorySchema.extend({
  // Ensure color is selected
  color: z.string().min(1, "Please select a color")
});

type FormData = z.infer<typeof formSchema>;

export default function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      form.reset({
        name: "",
        color: CATEGORY_COLORS[0]
      });
    }
  }, [category, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (category) {
        // Update existing category
        await apiRequest(`/api/categories/${category.id}`, 'PATCH', data);
        toast({
          title: "Category updated",
          description: "The category has been updated successfully."
        });
      } else {
        // Create new category
        await apiRequest('/api/categories', 'POST', data);
        toast({
          title: "Category added",
          description: "The category has been added successfully."
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });

      // Close the form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create footer buttons with improved styling
  const formFooter = (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
        className="flex-1 h-11 min-w-[120px] transition-all hover:bg-muted/80 active:scale-[0.98]"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="flex-1 h-11 min-w-[120px] transition-all hover:brightness-105 active:scale-[0.98]"
        form="category-form"
      >
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
                <FormLabel className="text-base font-medium">Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Category name" 
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/25"
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
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
                <FormLabel className="text-base font-medium">Color</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-5 gap-4 py-2">
                    {CATEGORY_COLORS.map(color => (
                      <div key={color} className="relative flex items-center justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-12 w-12 p-0 rounded-full transition-all", 
                            field.value === color ? "ring-2 ring-primary border-primary shadow-md" : "opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        >
                          {field.value === color && (
                            <Check className="h-5 w-5 text-white drop-shadow-md" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
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