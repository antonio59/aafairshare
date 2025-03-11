import React from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface StatusMessageProps {
  /** Type of message: 'success', 'error', 'warning', or 'info' */
  type?: MessageType;
  /** Message to display */
  message: string;
  /** Optional callback to dismiss the message */
  onDismiss?: () => void;
  /** Whether to show the icon */
  showIcon?: boolean;
}

/**
 * StatusMessage component - displays a status message with appropriate styling and icon
 */
const StatusMessage = ({ 
  type = 'info', 
  message, 
  onDismiss,
  showIcon = true 
}: StatusMessageProps) => {
  if (!message) return null;

  // Define styles based on message type
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
    }
  };

  const { bg, border, text, icon } = styles[type];

  return (
    <div 
      className={`${bg} border ${border} ${text} px-4 py-3 rounded-lg flex items-start`} 
      role="alert"
    >
      {showIcon && icon}
      <span className="flex-grow">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="ml-3 flex-shrink-0" 
          aria-label="Dismiss message"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default StatusMessage; 