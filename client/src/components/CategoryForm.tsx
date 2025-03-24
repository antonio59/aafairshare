import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

const formSchema = insertCategorySchema.extend({
  // Ensure icon and color are selected
  icon: z.string().min(1, "Please select an icon"),
  color: z.string().min(1, "Please select a color")
});

type FormData = z.infer<typeof formSchema>;

export default function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Get icons from Lucide
  const iconComponents = CATEGORY_ICONS.map(iconName => ({
    name: iconName,
    component: (LucideIcons as any)[iconName]
  })).filter(icon => icon.component);
  
  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      icon: category?.icon || CATEGORY_ICONS[0],
      color: category?.color || CATEGORY_COLORS[0]
    }
  });

  // Update form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color
      });
    } else {
      form.reset({
        name: "",
        icon: CATEGORY_ICONS[0],
        color: CATEGORY_COLORS[0]
      });
    }
  }, [category, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (category) {
        // Update existing category
        await apiRequest('PATCH', `/api/categories/${category.id}`, data);
        toast({
          title: "Category updated",
          description: "The category has been updated successfully."
        });
      } else {
        // Create new category
        await apiRequest('POST', '/api/categories', data);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
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
                    <Input {...field} placeholder="Category name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-6 gap-2">
                      {iconComponents.map(({ name, component: Icon }) => (
                        <Button
                          key={name}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-10 w-10 p-0", 
                            field.value === name && "ring-2 ring-primary border-primary"
                          )}
                          onClick={() => field.onChange(name)}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      ))}
                    </div>
                  </FormControl>
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
                    <div className="grid grid-cols-5 gap-2">
                      {CATEGORY_COLORS.map(color => (
                        <Button
                          key={color}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-8 w-8 p-0 rounded-full", 
                            field.value === color && "ring-2 ring-primary border-primary"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
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
                {isSubmitting ? "Saving..." : category ? "Update Category" : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
