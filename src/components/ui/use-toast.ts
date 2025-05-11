
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };

// Add helper to create consistent toast notifications
export const showToast = {
  success: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "default",
    });
  },
  error: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "destructive",
    });
  },
  info: (title: string, description?: string) => {
    return toast({
      title,
      description,
    });
  }
};
