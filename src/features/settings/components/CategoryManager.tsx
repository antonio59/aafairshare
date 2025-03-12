import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Edit, Save, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../../core/api/supabase';

export const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCategory, setEditingCategory] = useState({ index: -1, value: '' });
  
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, category')
        .order('category');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      setSaving(true);
      setError('');
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          category: newCategory.trim()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories([...categories, data]);
      setNewCategory('');
      setSuccess('Category added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (id, newName) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      setSaving(true);
      setError('');
      
      const { data, error } = await supabase
        .from('categories')
        .update({ category: newName.trim() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(categories.map(cat => cat.id === id ? data : cat));
      setEditingCategory({ index: -1, value: '' });
      setSuccess('Category updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      setSaving(true);
      setError('');
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(cat => cat.id !== id));
      setSuccess('Category deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Categories</h3>
        <p className="text-sm text-gray-500">Manage your expense categories to better organize your spending. Add, edit, or remove categories as needed.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <Check size={16} className="mr-2" />
          {success}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add new category"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          disabled={saving}
        />
        <button
          onClick={handleAddCategory}
          disabled={saving || !newCategory.trim()}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      <ul className="space-y-2">
        {categories.map((category, index) => (
          <li key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            {editingCategory.index === index ? (
              <input
                type="text"
                value={editingCategory.value}
                onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                autoFocus
              />
            ) : (
              <span className="flex items-center text-gray-700">
                <Tag size={16} className="mr-2 text-gray-500" />
                {category.category}
              </span>
            )}
            
            <div className="flex items-center space-x-2">
              {editingCategory.index === index ? (
                <>
                  <button
                    onClick={() => handleUpdateCategory(category.id, editingCategory.value)}
                    disabled={saving || !editingCategory.value.trim()}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingCategory({ index: -1, value: '' })}
                    disabled={saving}
                    className="p-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingCategory({ index, value: category.category })}
                    disabled={saving}
                    className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={saving}
                    className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};