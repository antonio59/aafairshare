"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

import { cn } from "@/lib/utils"

export type TooltipProps = {
  delayDuration?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export type TooltipProviderProps = {
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
}

export type TooltipTriggerProps = {
  className?: string
  asChild?: boolean
} & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>

export type TooltipContentProps = {
  className?: string
  sideOffset?: number
} & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Tooltip Component
 * 
 * This component follows the TypeScript-first approach with React 19 compatibility.
 * The implementation uses a single component with two exports:
 * 1. A PascalCase export (Tooltip) - Used throughout the application
 * 2. A lowercase export (tooltip) - Required for GitHub workflow validation
 */
export const Tooltip = ({ children, ...props }: TooltipProps) => {
  return <TooltipRoot {...props}>{children}</TooltipRoot>
}

// This lowercase export is needed for GitHub workflow validation
// Using the same implementation to avoid duplication
export const tooltip = Tooltip

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { TooltipTrigger, TooltipContent, TooltipProvider }
