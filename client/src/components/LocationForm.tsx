import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Location, insertLocationSchema } from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location;
}

export default function LocationForm({ open, onOpenChange, location }: LocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: location?.name || ""
    }
  });

  // Update form when location changes
  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name
      });
    } else {
      form.reset({
        name: ""
      });
    }
  }, [location, form]);

  const onSubmit = async (data: { name: string }) => {
    setIsSubmitting(true);
    
    try {
      if (location) {
        // Update existing location
        await apiRequest(`/api/locations/${location.id}`, 'PATCH', data);
        toast({
          title: "Location updated",
          description: "The location has been updated successfully."
        });
      } else {
        // Create new location
        await apiRequest('/api/locations', 'POST', data);
        toast({
          title: "Location added",
          description: "The location has been added successfully."
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      
      // Close the form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
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
        form="location-form"
      >
        {isSubmitting ? "Saving..." : location ? "Update" : "Save"}
      </Button>
    </>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={location ? "Edit Location" : "Add New Location"}
      description="Locations help track where expenses occur"
      footer={formFooter}
    >
      <div className="py-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <Form {...form}>
          <form id="location-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Location Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter location name" 
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/25" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Examples: Grocery Store, Restaurant, Online Shop
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </ResponsiveDialog>
  );
}