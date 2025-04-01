import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription, // Import SheetDescription
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// Import the local VisuallyHidden component
import { VisuallyHidden } from "@/components/ui/visually-hidden"; 
// DialogPrimitive import removed as Close button is handled by DialogContent wrapper now

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string; // Keep description prop
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description, // Description prop received
  children,
  footer,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  
  // Define safe fallbacks
  const safeTitle = title || "Dialog"; // Ensure title is never empty
  const safeDescription = description || `Information about ${safeTitle}`; // Fallback description

  // Generate stable IDs based on the safe title
  const titleId = `dialog-title-${safeTitle.replace(/\s+/g, '-').toLowerCase()}`;
  const descriptionId = `dialog-desc-${safeTitle.replace(/\s+/g, '-').toLowerCase()}`;

  React.useEffect(() => {
  }, [open, isMobile]);

  if (isMobile) {
    // Mobile view using Sheet (unchanged)
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "pb-safe pt-safe max-h-[95vh] rounded-t-xl",
            "overflow-y-auto flex flex-col",
            "bg-background border-t border-border",
            className
          )}
        >
          <SheetHeader className="text-left relative mb-6 px-4 pt-2">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
            <SheetTitle className="text-xl font-semibold">{safeTitle}</SheetTitle>
            {description && ( // Use original description prop here if provided
              <SheetDescription className="text-sm text-muted-foreground mt-1.5">{description}</SheetDescription>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4">
            {children}
          </div>
          {footer && (
            <SheetFooter className="mt-6 flex flex-row justify-end gap-3 sticky bottom-0 pb-4 pt-3 px-4 bg-background border-t border-border">
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view using Dialog (Robust Radix Structure)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-[600px]",
          className
        )}
        // Explicitly set both labels
        aria-labelledby={titleId}
        aria-describedby={descriptionId} 
      >
        <DialogHeader>
          {/* Add ID to DialogTitle */}
          <DialogTitle id={titleId}>{safeTitle}</DialogTitle>
          {/* Add ID to DialogDescription and wrap content with VisuallyHidden */}
          <DialogDescription id={descriptionId}>
             <VisuallyHidden>
               {safeDescription}
             </VisuallyHidden>
          </DialogDescription>
        </DialogHeader>
        {/* Children rendered after header */}
        <div className="py-4">
          {children}
        </div>
        {/* Close button is implicitly handled by DialogContent wrapper */}
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
