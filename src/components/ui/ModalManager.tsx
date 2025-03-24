'use client';

/**
 * ModalManager component
 * Centralized modal management using Zustand store
 * 
 * @module components/ui/ModalManager
 */
import { useEffect } from 'react';

import { useUIStore } from '@/store';

/**
 * Modal component props
 */
interface ModalProps {
  /** Modal ID used for identification */
  id: string;
  /** Modal title text */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional custom CSS classes */
  className?: string;
}

/**
 * Generic Modal component
 * Used to display content in a modal dialog
 */
export function Modal({ id, title, children, className }: ModalProps): JSX.Element | null {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === id;
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);
  
  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/**
 * Notification component
 * Displays toast notifications from the UI store
 */
export function Notification(): JSX.Element | null {
  const { notification, clearNotification } = useUIStore();
  
  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    return undefined; // Explicitly return undefined for the empty case
  }, [notification, clearNotification]);
  
  if (!notification) return null;
  
  // Define background color based on notification type
  const bgColors: Record<string, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    default: 'bg-gray-500', // Default fallback color
  };
  
  // Determine which background color to use, defaulting to 'default' if type is invalid
  const bgColor = notification.type && bgColors[notification.type] 
    ? bgColors[notification.type] 
    : bgColors.default;
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg max-w-md`}>
        <div className="flex justify-between items-center">
          <p>{notification.message}</p>
          <button 
            onClick={clearNotification}
            className="ml-4 text-white"
          >
            <span className="sr-only">Dismiss</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ModalManager component
 * Renders both the Modal and Notification components
 */
export default function ModalManager(): JSX.Element {
  return (
    <>
      <Notification />
      {/* Modals would be registered here or in parent components */}
    </>
  );
}