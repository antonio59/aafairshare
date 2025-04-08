import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const refreshThreshold = 80; // Pixels to pull down to trigger refresh

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY.current = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY.current - startY.current);
      
      // Apply resistance to the pull
      const progress = Math.min(1, pullDistance / refreshThreshold);
      setPullProgress(progress);
      
      // Prevent default scrolling when pulling
      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      const pullDistance = Math.max(0, currentY.current - startY.current);
      
      if (pullDistance >= refreshThreshold) {
        // Trigger refresh
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      // Reset state
      setIsPulling(false);
      setPullProgress(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, onRefresh]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className={`absolute left-0 right-0 flex justify-center transition-transform duration-200 z-10 ${
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          transform: `translateY(${isPulling ? pullProgress * refreshThreshold : 0}px)`,
          top: '-40px'
        }}
      >
        <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-2">
          <RefreshCw 
            className={`h-6 w-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ 
              transform: isPulling && !isRefreshing ? `rotate(${pullProgress * 360}deg)` : 'rotate(0deg)'
            }}
          />
        </div>
      </div>
      
      {/* Main content */}
      {children}
    </div>
  );
}
