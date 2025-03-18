'use client';

import { useState, useEffect } from 'react';

type Category = {
  id: string;
  category: string;
};

type Location = {
  id: string;
  location: string;
};

export default function Settings() {
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCategories([...categories, data]);
      setNewCategory('');
      setError('');
    } catch (error) {
      console.error('Error adding category:', error);
      setError(error instanceof Error ? error.message : 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setCategories(categories.filter(cat => cat.id !== id));
      setError('');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations');
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: newLocation.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setLocations([...locations, data]);
      setNewLocation('');
      setError('');
    } catch (error) {
      console.error('Error adding location:', error);
      setError(error instanceof Error ? error.message : 'Failed to add location');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const response = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setLocations(locations.filter(loc => loc.id !== id));
      setError('');
    } catch (error) {
      console.error('Error deleting location:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete location');
    }
  };

  const handleEditLocation = async (id: string) => {
    if (!editValue.trim()) return;
    
    try {
      const response = await fetch(`/api/locations?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: editValue.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setLocations(locations.map(loc => 
        loc.id === id ? { ...loc, location: editValue.trim() } : loc
      ));
      setEditingLocation(null);
      setEditValue('');
      setError('');
    } catch (error) {
      console.error('Error updating location:', error);
      setError(error instanceof Error ? error.message : 'Failed to update location');
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editValue.trim()) return;
    
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: editValue.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, category: editValue.trim() } : cat
      ));
      setEditingCategory(null);
      setEditValue('');
      setError('');
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </form>
          {error && (
            <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
              >
                {editingCategory === cat.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 text-sm rounded border-gray-300"
                    />
                    <button
                      onClick={() => handleEditCategory(cat.id)}
                      className="text-green-600 hover:text-green-800 px-2"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setEditValue('');
                      }}
                      className="text-gray-600 hover:text-gray-800 px-2"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{cat.category}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat.id);
                          setEditValue(cat.category);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Locations</h2>
          <form onSubmit={handleAddLocation} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Add new location"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
              >
                {editingLocation === loc.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 text-sm rounded border-gray-300"
                    />
                    <button
                      onClick={() => handleEditLocation(loc.id)}
                      className="text-green-600 hover:text-green-800 px-2"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingLocation(null);
                        setEditValue('');
                      }}
                      className="text-gray-600 hover:text-gray-800 px-2"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{loc.location}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingLocation(loc.id);
                          setEditValue(loc.location);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}