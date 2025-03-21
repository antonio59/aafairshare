"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type CardProps = {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type CardHeaderProps = {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type CardTitleProps = {
  className?: string
} & React.HTMLAttributes<HTMLHeadingElement>

export type CardDescriptionProps = {
  className?: string
} & React.HTMLAttributes<HTMLParagraphElement>

export type CardContentProps = {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type CardFooterProps = {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

/**
 * Card Component
 * 
 * This component follows the TypeScript-first approach with React 19 compatibility.
 * The implementation uses a single forwardRef component with two exports:
 * 1. A PascalCase export (Card) - Used throughout the application
 * 2. A lowercase export (card) - Required for GitHub workflow validation
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

// This lowercase export is needed for GitHub workflow validation
// Using the same implementation to avoid duplication
export const card = Card

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
