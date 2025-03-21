/**
 * Type declarations for Radix UI components
 * Compatible with React 19 and TypeScript 5.x
 */
declare module '@radix-ui/react-dropdown-menu' {
  import * as React from 'react';
  
  // Common primitive props
  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<'button'> & {
    asChild?: boolean;
  };
  
  type PrimitiveDivProps = React.ComponentPropsWithoutRef<'div'> & {
    asChild?: boolean;
  };

  // ForwardRef type helper for React 19 compatibility
  type ForwardRefComponent<T, P> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<T>
  >;

  // Root
  export const Root: React.FC<{
    children?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
  }>;

  // Trigger
  export const Trigger: ForwardRefComponent<
    HTMLButtonElement,
    PrimitiveButtonProps
  >;

  // Portal
  export const Portal: React.FC<{
    children?: React.ReactNode;
    container?: HTMLElement;
    forceMount?: boolean;
  }>;

  // Content
  interface ContentProps extends PrimitiveDivProps {
    loop?: boolean;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onFocusOutside?: (event: FocusEvent) => void;
    onInteractOutside?: (event: React.SyntheticEvent) => void;
    forceMount?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    avoidCollisions?: boolean;
    collisionBoundary?: Element | null | Array<Element | null>;
    collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
    arrowPadding?: number;
    sticky?: 'partial' | 'always';
    hideWhenDetached?: boolean;
  }
  
  export const Content: ForwardRefComponent<HTMLDivElement, ContentProps>;

  // Item
  interface ItemProps extends PrimitiveDivProps {
    disabled?: boolean;
    onSelect?: (event: Event) => void;
    textValue?: string;
    inset?: boolean;
  }
  
  export const Item: ForwardRefComponent<HTMLDivElement, ItemProps>;

  // Group
  export const Group: ForwardRefComponent<HTMLDivElement, PrimitiveDivProps>;

  // Label
  interface LabelProps extends PrimitiveDivProps {
    inset?: boolean;
  }
  
  export const Label: ForwardRefComponent<HTMLDivElement, LabelProps>;

  // CheckboxItem
  interface CheckboxItemProps extends PrimitiveDivProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    onSelect?: (event: Event) => void;
    textValue?: string;
  }
  
  export const CheckboxItem: ForwardRefComponent<HTMLDivElement, CheckboxItemProps>;

  // RadioGroup
  interface RadioGroupProps extends PrimitiveDivProps {
    value?: string;
    onValueChange?: (value: string) => void;
  }
  
  export const RadioGroup: ForwardRefComponent<HTMLDivElement, RadioGroupProps>;

  // RadioItem
  interface RadioItemProps extends PrimitiveDivProps {
    value: string;
    disabled?: boolean;
    onSelect?: (event: Event) => void;
    textValue?: string;
  }
  
  export const RadioItem: ForwardRefComponent<HTMLDivElement, RadioItemProps>;

  // ItemIndicator
  interface ItemIndicatorProps extends React.ComponentPropsWithoutRef<'span'> {
    forceMount?: boolean;
    asChild?: boolean;
  }
  
  export const ItemIndicator: ForwardRefComponent<HTMLSpanElement, ItemIndicatorProps>;

  // Separator
  export const Separator: ForwardRefComponent<HTMLDivElement, PrimitiveDivProps>;

  // Sub
  export const Sub: React.FC<{
    children?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>;

  // SubTrigger
  interface SubTriggerProps extends PrimitiveDivProps {
    disabled?: boolean;
    textValue?: string;
    inset?: boolean;
  }
  
  export const SubTrigger: ForwardRefComponent<HTMLDivElement, SubTriggerProps>;

  // SubContent
  interface SubContentProps extends Omit<ContentProps, 'onCloseAutoFocus' | 'onInteractOutside'> {
    loop?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    forceMount?: boolean;
  }
  
  export const SubContent: ForwardRefComponent<HTMLDivElement, SubContentProps>;

  // Arrow
  export const Arrow: React.FC<
    React.ComponentPropsWithoutRef<'svg'> & {
      width?: number;
      height?: number;
    }
  >;
}
