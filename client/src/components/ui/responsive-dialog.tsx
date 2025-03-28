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
  SheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // For mobile, use Sheet which slides from the bottom with enhanced styling
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "pb-safe pt-safe max-h-[95vh] rounded-t-xl border-t border-border",
            "overflow-y-auto flex flex-col shadow-lg",
            "bg-card/95 backdrop-blur-sm",
            className
          )}
        >
          <SheetHeader className="text-left relative mb-6 px-4 pt-2">
            <SheetClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
            <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
            )}
          </SheetHeader>
          <div className="space-y-6 flex-1 overflow-y-auto px-4 mobile-form-spacing">
            {children}
          </div>
          {footer && (
            <SheetFooter className="mt-6 flex flex-row justify-end space-x-3 sticky bottom-0 pb-4 pt-3 px-4 bg-card border-t border-border">
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, use Dialog which appears in the center with enhanced styling
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[480px] shadow-lg rounded-xl", className)}>
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
          )}
        </DialogHeader>
        <div className="space-y-6 py-4">{children}</div>
        {footer && <DialogFooter className="py-2 flex justify-end space-x-3">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}