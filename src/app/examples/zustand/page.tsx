'use client';

/**
 * Example page demonstrating Zustand state management
 * Shows how to use multiple stores together
 * 
 * @module app/examples/zustand/page
 */
import { useEffect } from 'react';

import CategoryList from '@/components/categories/CategoryList';
import ExpenseListWithZustand from '@/components/expenses/ExpenseListWithZustand';
import { Modal } from '@/components/ui/ModalManager';
import { useUIStore } from '@/store';

/**
 * ZustandExamplePage component
 * Demonstrates using multiple Zustand stores together
 * 
 * @component
 */
export default function ZustandExamplePage() {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    openModal, 
    closeModal, 
    activeModal, 
    theme, 
    setTheme,
    showNotification
  } = useUIStore();
  
  // Welcome notification when page loads
  useEffect(() => {
    showNotification('Welcome to the Zustand example page!', 'info');
  }, [showNotification]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 pb-4 border-b">
        <h1 className="text-2xl font-bold mb-4">Zustand State Management</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This page demonstrates how to use Zustand for state management in your application.
          The example shows multiple stores working together: expenses, categories, and UI.
        </p>
        
        {/* UI Store Demo */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">UI Store Demo</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            </button>
            
            <button
              onClick={() => openModal('demo-modal')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Open Demo Modal
            </button>
            
            <button
              onClick={() => showNotification('This is a test notification', 'success')}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Show Success Notification
            </button>
            
            <button
              onClick={() => showNotification('This is an error message', 'error')}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Show Error Notification
            </button>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Toggle Theme (Current: {theme})
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
            <p className="font-medium">Current UI State:</p>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-x-auto">
              {JSON.stringify(
                {
                  isSidebarOpen,
                  activeModal,
                  theme,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
      
      {/* Sidebar example */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Sidebar</h2>
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="#" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Expenses
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Categories
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Reports
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ExpenseListWithZustand />
        </div>
        
        <div>
          <CategoryList />
        </div>
      </div>
      
      {/* Modal example */}
      <Modal id="demo-modal" title="Demo Modal">
        <div className="space-y-4">
          <p>
            This is a demo modal managed by the UI store with Zustand. The modal state is
            persisted across component re-renders.
          </p>
          <p>
            You can open and close this modal with the UI store actions, and the state will
            be properly managed.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close Modal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}