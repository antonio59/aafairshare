import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Location, insertLocationSchema } from "@shared/schema";
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
        await apiRequest('PATCH', `/api/locations/${location.id}`, data);
        toast({
          title: "Location updated",
          description: "The location has been updated successfully."
        });
      } else {
        // Create new location
        await apiRequest('POST', '/api/locations', data);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "Add New Location"}</DialogTitle>
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
                    <Input {...field} placeholder="Location name" />
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
                {isSubmitting ? "Saving..." : location ? "Update Location" : "Save Location"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
