'use client';

import { useQueryState } from 'nuqs';
import { useState, useEffect, useTransition, Suspense } from 'react';

import type { Category, Location } from '@/types/supabase';

import { Skeleton } from '@/components/ui/skeleton';

// Consolidated state types
type SettingsState = {
  categories: Category[];
  locations: Location[];
  error: string;
  isLoading: boolean;
  editing: {
    type: 'category' | 'location' | null;
    id: string | null;
    value: string;
  };
  new: {
    category: string;
    location: string;
  };
};

// Define fetch functions before they're used
const fetchCategories = async (setState: React.Dispatch<React.SetStateAction<SettingsState>>, signal?: AbortSignal) => {
  try {
    const response = await fetch('/api/categories', signal ? { signal: signal as AbortSignal } : undefined);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    // Update consolidated state
    setState(prev => ({
      ...prev,
      categories: data
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    setState(prev => ({
      ...prev,
      error: 'Failed to load categories'
    }));
  }
};

const fetchLocations = async (setState: React.Dispatch<React.SetStateAction<SettingsState>>, signal?: AbortSignal) => {
  try {
    const response = await fetch('/api/locations', signal ? { signal } : undefined);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    setState(prev => ({
      ...prev,
      locations: data
    }));
  } catch (error) {
    if (error instanceof Error) {
      setState(prev => ({
        ...prev,
        error: error.message
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch locations'
      }));
    }
  }
};

// Create a component that uses the hooks
function SettingsContent() {
  // URL-based state management for active tab
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'categories' });
  
  // Consolidated state using a single state object
  const [state, setState] = useState<SettingsState>({
    categories: [],
    locations: [],
    error: '',
    isLoading: false,
    editing: {
      type: null,
      id: null,
      value: ''
    },
    new: {
      category: '',
      location: ''
    }
  });
  
  // React 19 transitions for smoother UI updates
  const [isPending, startTransition] = useTransition();

  // Data fetching on component mount
  // In a future update, this will be moved to a server component
  // Fetch data when component mounts
  useEffect(() => {
    // Create an AbortController for fetch cleanup
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Use async IIFE pattern with cleanup
    (async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        await Promise.all([
          fetchCategories(setState, signal),
          fetchLocations(setState, signal)
        ]);
      } catch (error) {
        // Only log if not from an aborted request
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error fetching data:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to load data. Please try refreshing the page.'
          }));
        }
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
    
    // React 19 compatible cleanup function
    return () => controller.abort();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.new.category.trim()) return;

    // Use React 19 transitions for smoother UI updates
    startTransition(async () => {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: state.new.category.trim() })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Update consolidated state
        setState(prev => ({
          ...prev,
          categories: [...prev.categories, data],
          new: {
            ...prev.new,
            category: ''
          },
          error: ''
        }));
      } catch (error) {
        console.error('Error adding category:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to add category'
        }));
      }
    });
  };

  const handleDeleteCategory = async (id: string) => {
    // Use React 19 transitions for smoother UI updates
    startTransition(async () => {
      try {
        const response = await fetch(`/api/categories?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error);
        }

        // Update consolidated state
        setState(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat.id !== id),
          error: ''
        }));
      } catch (error) {
        console.error('Error deleting category:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to delete category'
        }));
      }
    });
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.new.location.trim()) return;

    // Use React 19 transitions for smoother UI updates
    startTransition(async () => {
      try {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: state.new.location.trim() })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Update consolidated state
        setState(prev => ({
          ...prev,
          locations: [...prev.locations, data],
          new: {
            ...prev.new,
            location: ''
          },
          error: ''
        }));
      } catch (error) {
        console.error('Error adding location:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to add location'
        }));
      }
    });
  };

  const handleDeleteLocation = async (id: string) => {
    // Use React 19 transitions for smoother UI updates
    startTransition(async () => {
      try {
        const response = await fetch(`/api/locations?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error);
        }

        // Update consolidated state
        setState(prev => ({
          ...prev,
          locations: prev.locations.filter(loc => loc.id !== id),
          error: ''
        }));
      } catch (error) {
        console.error('Error deleting location:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to delete location'
        }));
      }
    });
  };

  const handleEditLocation = async (id: string) => {
    if (!state.editing.value.trim()) return;
    
    // Use React 19 transitions for smoother UI updates
    startTransition(async () => {
      try {
        const response = await fetch(`/api/locations?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: state.editing.value.trim() })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Update consolidated state
        setState(prev => ({
          ...prev,
          locations: prev.locations.map(loc => 
            loc.id === id ? { ...loc, location: prev.editing.value.trim() } : loc
          ),
          editing: {
            type: null,
            id: null,
            value: ''
          },
          error: ''
        }));
      } catch (error) {
        console.error('Error updating location:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to update location'
        }));
      }
    });
  };

  const handleEditCategory = async (id: string) => {
    if (!state.editing.value.trim()) return;
    
    // Use React 19 transitions for smoother UI updates
    startTransition(async () => {
      try {
        const response = await fetch(`/api/categories?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: state.editing.value.trim() })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Update consolidated state
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(cat => 
            cat.id === id ? { ...cat, category: prev.editing.value.trim() } : cat
          ),
          editing: {
            type: null,
            id: null,
            value: ''
          },
          error: ''
        }));
      } catch (error) {
        console.error('Error updating category:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to update category'
        }));
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Loading indicators */}
      {isPending && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm animate-pulse z-50">
          Updating...
        </div>
      )}
      
      {state.isLoading && (
        <div className="flex justify-center items-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
          <span className="ml-2 text-indigo-500">Loading data...</span>
        </div>
      )}
      
      {state.error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
          <strong>Error:</strong> {state.error}
        </div>
      )}
      
      {/* Tab navigation with URL state */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-4 ${activeTab === 'categories' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2 px-4 ${activeTab === 'locations' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Locations
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Categories Section */}
        {activeTab === 'categories' && (
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="flex gap-2 p-4 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    value={state.new.category}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      new: { ...prev.new, category: e.target.value }
                    }))}
                    placeholder="Enter category name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add
                  </button>
                </form>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Existing Categories</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  {state.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-12 bg-gray-200 animate-pulse rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {state.categories.length > 0 ? state.categories.map((cat: Category) => (
                      <div
                        key={cat.id}
                        className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        {state.editing.type === 'category' && state.editing.id === cat.id ? (
                          <div className="flex gap-2 flex-1">
                            <input
                              type="text"
                              value={state.editing.value}
                              onChange={(e) => setState(prev => ({
                                ...prev,
                                editing: { ...prev.editing, value: e.target.value }
                              }))}
                              className="flex-1 text-sm rounded border-gray-300"
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditCategory(cat.id)}
                              className="text-green-600 hover:text-green-800 px-2"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  editing: { type: null, id: null, value: '' }
                                }));
                              }}
                              className="text-gray-600 hover:text-gray-800 px-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">{cat.category}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setState(prev => ({
                                    ...prev,
                                    editing: { 
                                      type: 'category', 
                                      id: cat.id, 
                                      value: cat.category 
                                    }
                                  }));
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              >
                                ×
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      )) : (
                        <p className="col-span-3 text-gray-500 text-center py-4">No categories added yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </Suspense>
        )}

        {/* Locations Section */}
        {activeTab === 'locations' && (
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Locations</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Add New Location</h3>
                <form onSubmit={handleAddLocation} className="flex gap-2 p-4 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    value={state.new.location}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      new: { ...prev.new, location: e.target.value }
                    }))}
                    placeholder="Enter location name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add
                  </button>
                </form>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Existing Locations</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  {state.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-12 bg-gray-200 animate-pulse rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {state.locations.length > 0 ? state.locations.map((loc: Location) => (
                      <div
                        key={loc.id}
                        className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        {state.editing.type === 'location' && state.editing.id === loc.id ? (
                          <div className="flex gap-2 flex-1">
                            <input
                              type="text"
                              value={state.editing.value}
                              onChange={(e) => setState(prev => ({
                                ...prev,
                                editing: { ...prev.editing, value: e.target.value }
                              }))}
                              className="flex-1 text-sm rounded border-gray-300"
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditLocation(loc.id)}
                              className="text-green-600 hover:text-green-800 px-2"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  editing: { type: null, id: null, value: '' }
                                }));
                              }}
                              className="text-gray-600 hover:text-gray-800 px-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">{loc.location}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setState(prev => ({
                                    ...prev,
                                    editing: { 
                                      type: 'location', 
                                      id: loc.id, 
                                      value: loc.location 
                                    }
                                  }));
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => handleDeleteLocation(loc.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              >
                                ×
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      )) : (
                        <p className="col-span-3 text-gray-500 text-center py-4">No locations added yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </Suspense>
        )}
      </div>
    </div>
  );
}

// Export the main component with Suspense
export default function Settings() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-lg" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}