import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Location } from "~/shared/schema";
import { db } from "~/lib/firebase";
import { useFirestoreFormSubmit } from "~/hooks/use-firestore-form-submit";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  name: z.string().min(1, "Location name is required").max(50, "Location name is too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  location?: Location;
  onSuccess?: (location: Location) => void;
  onCancel?: () => void;
}

export default function LocationForm({ location, onSuccess, onCancel }: LocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location?.name || "",
    },
    mode: "onTouched", // Only validate fields after they've been touched
  });

  // Use the Firestore form submit hook
  const { submit } = useFirestoreFormSubmit({
    db,
    collectionName: "locations",
    successMessage: location ? "Location updated successfully" : "Location created successfully",
    errorMessage: location ? "Failed to update location" : "Failed to create location",
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data as Location);
      }
      form.reset();
    },
  });

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await submit(values, location?.id);
    } catch (error) {
      console.error("Error submitting location form:", error);
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
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter location name" {...field} />
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
            {isSubmitting ? "Saving..." : location ? "Update Location" : "Create Location"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
