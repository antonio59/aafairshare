import React, { useRef, useEffect } from 'react';

// Create a global variable to store the announce function
let announceFunction: ((message: string, assertive?: boolean) => void) | null = null;

// Function to announce messages to screen readers
export const announce = (message: string, assertive = false) => {
  if (announceFunction) {
    announceFunction(message, assertive);
  } else {
    console.warn('LiveRegion component not mounted. Message not announced:', message);
  }
};

export default function LiveRegion() {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the announce function
    announceFunction = (message: string, assertive = false) => {
      const targetRef = assertive ? assertiveRef.current : politeRef.current;
      if (targetRef) {
        // Clear previous announcements
        targetRef.textContent = '';
        
        // Force a reflow
        void targetRef.offsetWidth;
        
        // Set the new message
        targetRef.textContent = message;
      }
    };

    // Clean up when component unmounts
    return () => {
      announceFunction = null;
    };
  }, []);

  return (
    <>
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region-polite"
      />
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region-assertive"
      />
    </>
  );
}
