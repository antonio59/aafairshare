
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to update state based on window width
    const updateState = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Create a media query list for the mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Set initial state immediately
    updateState()
    
    // Use resize observer or event listener with throttling to improve performance
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      // Debounce the resize event to avoid excessive state updates
      timeoutId = setTimeout(updateState, 100)
    }
    
    // Handle screen orientation changes on mobile devices
    window.addEventListener('orientationchange', updateState)
    window.addEventListener('resize', handleResize)
    
    // Modern way to detect changes using the media query list
    // This works better than just window resize events
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Add listener for media query changes
    mql.addEventListener("change", onChange)
    
    // Cleanup function
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener('orientationchange', updateState)
      window.removeEventListener('resize', handleResize)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return !!isMobile
}
