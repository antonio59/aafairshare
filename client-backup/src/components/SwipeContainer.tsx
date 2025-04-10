import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { lightHapticFeedback, mediumHapticFeedback } from '@/lib/haptics';

interface SwipeContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance to trigger swipe
  disabled?: boolean;
}

export function SwipeContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  disabled = false,
}: SwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [location] = useLocation();

  // Reset swipe state when location changes
  useEffect(() => {
    setTouchStartX(null);
    setTouchEndX(null);
    setIsSwiping(false);
    setSwipeOffset(0);
  }, [location]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled || touchStartX === null) return;

    const currentX = e.targetTouches[0].clientX;
    setTouchEndX(currentX);

    // Calculate the swipe offset for visual feedback
    const offset = currentX - touchStartX;

    // Limit the maximum offset and apply resistance
    const maxOffset = 100;
    const resistedOffset = Math.sign(offset) * Math.min(Math.abs(offset) * 0.5, maxOffset);

    // Provide haptic feedback at certain thresholds
    if (Math.abs(offset) > threshold && Math.abs(swipeOffset) <= threshold) {
      lightHapticFeedback();
    }

    setSwipeOffset(resistedOffset);
  };

  const handleTouchEnd = () => {
    if (!isSwiping || disabled || touchStartX === null || touchEndX === null) {
      resetSwipeState();
      return;
    }

    const distance = touchEndX - touchStartX;

    // Check if swipe distance exceeds threshold
    if (Math.abs(distance) > threshold) {
      // Provide haptic feedback for successful swipe
      mediumHapticFeedback();

      if (distance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (distance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    resetSwipeState();
  };

  const resetSwipeState = () => {
    setIsSwiping(false);
    setTouchStartX(null);
    setTouchEndX(null);
    setSwipeOffset(0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetSwipeState}
      className="relative w-full h-full"
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
}
