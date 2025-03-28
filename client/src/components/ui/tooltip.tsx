import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

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
  
  const showTooltip = () => {
    setIsVisible(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };
  
  // Handle clicks outside the tooltip to dismiss it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
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
    <div className="relative inline-block" ref={tooltipRef}>
      <div 
        className="tooltip-trigger cursor-pointer"
        onClick={showTooltip}
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
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
    </div>
  );
};

export { Tooltip };