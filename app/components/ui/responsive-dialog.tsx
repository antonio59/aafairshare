import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { VisuallyHidden } from "~/components/ui/visually-hidden";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ResponsiveDialogProps) {
  // Define safe fallbacks
  const safeTitle = title || "Dialog"; // Ensure title is never empty
  const safeDescription = description || `Information about ${safeTitle}`; // Fallback description

  // Generate stable IDs based on the safe title
  const titleId = `dialog-title-${safeTitle.replace(/\s+/g, '-').toLowerCase()}`;
  const descriptionId = `dialog-desc-${safeTitle.replace(/\s+/g, '-').toLowerCase()}`;

  // Always render Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[600px]", // Keep desktop max-width
          "w-[90vw] max-w-[90vw] rounded-lg", // Add mobile-friendly width and rounding
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
          {description && ( // Only render description if provided
            <DialogDescription id={descriptionId}>
              <VisuallyHidden>
                {safeDescription}
              </VisuallyHidden>
            </DialogDescription>
          )}
        </DialogHeader>
        {/* Children rendered after header */}
        {/* Add max-height and overflow for scrollable content */}
        <div className="py-4 max-h-[70vh] overflow-y-auto">
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
