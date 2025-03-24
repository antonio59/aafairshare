/**
 * Toast Component and Hook
 * 
 * A toast component built on top of Radix UI's Toast primitive.
 * Includes a custom hook for managing toast state and actions.
 * 
 * @example
 * ```tsx
 * function Demo() {
 *   const { toast } = useToast()
 *   
 *   return (
 *     <Button
 *       onClick={() => {
 *         toast({
 *           title: "Success",
 *           description: "Your action was completed."
 *         })
 *       }}
 *     >
 *       Show Toast
 *     </Button>
 *   )
 * }
 * ```
 */

import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Constants
const TOAST_LIMIT = 1

// Styles
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Types
interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  className?: string
  variant?: VariantProps<typeof toastVariants>['variant']
  onOpenChange?: (open: boolean) => void
  open?: boolean
  defaultOpen?: boolean
  duration?: number
  title?: string
}

interface ToasterToast extends Omit<ToastProps, 'title'> {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

interface State {
  toasts: ToasterToast[]
}

type ToastActionElement = React.ReactElement<typeof ToastPrimitives.Action>

const enum ActionTypes {
  ADD_TOAST = "ADD_TOAST",
  UPDATE_TOAST = "UPDATE_TOAST",
  DISMISS_TOAST = "DISMISS_TOAST",
  REMOVE_TOAST = "REMOVE_TOAST",
}

interface BaseAction<T extends ActionTypes> {
  type: T
}

interface AddToastAction extends BaseAction<ActionTypes.ADD_TOAST> {
  toast: ToasterToast
}

interface UpdateToastAction extends BaseAction<ActionTypes.UPDATE_TOAST> {
  toast: Partial<ToasterToast>
}

interface DismissToastAction extends BaseAction<ActionTypes.DISMISS_TOAST> {
  toastId: string | null
}

interface RemoveToastAction extends BaseAction<ActionTypes.REMOVE_TOAST> {
  toastId: string | null
}

type Action =
  | AddToastAction
  | UpdateToastAction
  | DismissToastAction
  | RemoveToastAction

type Toast = Omit<ToasterToast, "id">

// Components
const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// State Management
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case ActionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case ActionTypes.DISMISS_TOAST: {
      const { toastId } = action
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === null
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case ActionTypes.REMOVE_TOAST:
      if (action.toastId === null) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }

    default:
      return state
  }
}

function dispatch(action: Action): void {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function dismiss(toastId?: string): void {
  dispatch({
    type: ActionTypes.DISMISS_TOAST,
    toastId: toastId ?? null,
  })
}

/**
 * Hook for managing toast notifications
 * @returns Object containing toast state and methods for managing toasts
 */
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  const toast = ({ ...props }: Toast) => {
    const id = Math.random().toString(36).slice(2, 9)

    dispatch({
      type: ActionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss(id)
        },
      },
    })

    return {
      id,
      dismiss: () => dismiss(id),
      update: (props: ToasterToast) =>
        dispatch({
          type: ActionTypes.UPDATE_TOAST,
          toast: { ...props, id },
        }),
    }
  }

  return {
    ...state,
    toast,
    dismiss,
  }
}

export {
  type Toast,
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast as ToastComponent,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
