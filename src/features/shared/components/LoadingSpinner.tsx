import React from 'react';
import { _Loader2 } from 'lucide-react';

/**
 * LoadingSpinner component - displays a loading spinner with an optional message
 * 
 * @param {Object} props
 * @param {string} props.message - Optional message to display below the spinner
 * @param {string} props.size - Size of the spinner: 'sm', 'md', or 'lg'
 * @param {string} props.color - Color of the spinner (tailwind color class name without the 'border-')
 * @param {boolean} props.fullPage - Whether to display the spinner in the center of the page
 */
export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md', 
  color = 'rose-600',
  fullPage = false
}) {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const spinnerClass = `animate-spin rounded-full ${sizeClasses[size]} border-t-${color} border-b-${color} border-r-transparent border-l-transparent`;
  
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClass} role="status" aria-live="polite"></div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm" aria-live="polite">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {content}
      </div>
    );
  }

  return content;
} 