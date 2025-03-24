/**
 * UI store using Zustand for managing application UI state
 * 
 * @module store/ui
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Interface defining the UI store state and actions
 */
interface UIState {
  /** Indicates if the sidebar is open */
  isSidebarOpen: boolean;
  /** Current active modal */
  activeModal: string | null;
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Alert/notification message */
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null;
  
  /**
   * Toggles the sidebar open/closed state
   */
  toggleSidebar: () => void;
  
  /**
   * Sets the sidebar open state
   * @param isOpen - Whether the sidebar should be open
   */
  setSidebarOpen: (isOpen: boolean) => void;
  
  /**
   * Opens a modal
   * @param modalId - The ID of the modal to open
   */
  openModal: (modalId: string) => void;
  
  /**
   * Closes the currently active modal
   */
  closeModal: () => void;
  
  /**
   * Sets the theme preference
   * @param theme - The theme to set
   */
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  /**
   * Shows a notification/alert
   * @param message - The notification message
   * @param type - The type of notification
   */
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  
  /**
   * Clears the current notification
   */
  clearNotification: () => void;
}

/**
 * UI store with Zustand
 * Uses persist middleware to save UI preferences to localStorage
 * Uses devtools middleware for Redux DevTools integration
 */
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: true,
        activeModal: null,
        theme: 'system',
        notification: null,
        
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
        openModal: (modalId) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),
        setTheme: (theme) => set({ theme }),
        
        showNotification: (message, type) => 
          set({ notification: { message, type } }),
          
        clearNotification: () => set({ notification: null }),
      }),
      { name: 'ui-store' }
    ),
    { name: 'ui-store-devtools' }
  )
);