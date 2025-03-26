import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

  // For mobile, use Sheet which slides from the bottom
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "pb-safe pt-safe max-h-[90vh] rounded-t-xl border-t border-border",
            "overflow-y-auto flex flex-col",
            className
          )}
        >
          <SheetHeader className="text-left mb-4 px-1">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </SheetHeader>
          <div className="space-y-5 flex-1 overflow-y-auto px-1">
            {children}
          </div>
          {footer && (
            <SheetFooter className="mt-6 flex-col space-y-2 sticky bottom-0 pb-2 pt-2 bg-card border-t border-border">
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, use Dialog which appears in the center
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[480px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <div className="space-y-5 py-2">{children}</div>
        {footer && <DialogFooter className="py-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}