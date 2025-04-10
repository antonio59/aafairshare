import React, { useState, useEffect, useRef } from 'react';
import { cn } from '~/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip = ({
  children,
  content,
  position = 'top',
  className
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null); // Ref for the trigger button

  const showTooltip = () => {
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  // Handle clicks outside the tooltip to dismiss it
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the tooltip content AND the trigger button
      if (
        tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Handle Escape key to close tooltip
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);


  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 border-t-2',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 border-b-2',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 border-l-2',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 border-r-2',
  };

  return (
    // Use a span for inline positioning if needed, or adjust parent component
    <span className="relative inline-block">
      {/* Changed div to button for accessibility */}
      <button
        ref={triggerRef} // Add ref to the trigger
        type="button" // Explicitly set type
        // Removed tooltip-trigger class
        className="cursor-pointer p-0 m-0 border-none bg-transparent appearance-none text-left" // Reset button styles
        onClick={showTooltip}
        onFocus={showTooltip} // Show on focus for keyboard users
        onBlur={hideTooltip} // Hide on blur
        aria-describedby={isVisible ? `tooltip-${content.replace(/\s+/g, '-')}` : undefined} // Link tooltip content for screen readers
      >
        {children}
      </button>

      {isVisible && (
        <div
          id={`tooltip-${content.replace(/\s+/g, '-')}`} // Add unique ID
          ref={tooltipRef} // Keep ref for click outside logic
          role="tooltip" // Add tooltip role
          className={cn(
            'absolute z-50 bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-[200px] whitespace-normal',
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </span>
  );
};

export { Tooltip };
