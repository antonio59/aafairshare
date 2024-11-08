import { useState, useEffect } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import { Plus, Edit2, Trash2, X, Calendar, Tag, RefreshCw } from 'lucide-react';
import RecurringExpenses from './RecurringExpenses';
import type { Category, Tag as TagType } from '../../types';

// Type guard functions
const isCategory = (item: any): item is Category => {
  return item && 'group' in item;
};

const isTag = (item: any): item is TagType => {
  return item && 'categoryId' in item;
};

// Color mapping for different groups
const groupColors: { [key: string]: string } = {
  'Utilities': '#2196F3',
  'Housing': '#795548',
  'Food': '#4CAF50',
  'Transportation': '#FF9800',
  'Insurance': '#9C27B0',
  'Entertainment': '#F44336',
  'Clothing': '#E91E63',
  'Health and Wellness': '#009688',
  'Miscellaneous': '#9E9E9E'
};

const ExpenseSettings = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'recurring'>('categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | TagType | null>(null);
  const [isAddingCategories, setIsAddingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { categories = [], tags = [], addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag, restoreDefaultCategories } = useExpenseStore();
  const { currentUser } = useUserStore();

  // Ensure categories are loaded
  useEffect(() => {
    if (categories.length === 0) {
      handleRestoreDefaultCategories();
    }
  }, []);

  const categoryGroups: { [key: string]: string[] } = {
    'Utilities': [],
    'Housing': [],
    'Food': [],
    'Transportation': [],
    'Insurance': [],
    'Entertainment': [],
    'Clothing': [],
    'Health and Wellness': [],
    'Miscellaneous': []
  };

  const handleRestoreDefaultCategories = async () => {
    try {
      setIsAddingCategories(true);
      setError(null);
      await restoreDefaultCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore categories');
      console.error('Error restoring categories:', err);
    } finally {
      setIsAddingCategories(false);
    }
  };

  const handleAddItem = () => {
    if (!currentUser) return;
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Category | TagType) => {
    if (!currentUser) return;
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setError(null);
        if (activeTab === 'categories') {
          await deleteCategory(id);
        } else if (activeTab === 'tags') {
          await deleteTag(id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
        console.error('Error deleting item:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setError(null);
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;

      if (activeTab === 'categories') {
        const group = formData.get('group') as string;
        const color = groupColors[group] || '#9E9E9E'; // Default to grey if no color mapping exists
        
        if (editingItem && isCategory(editingItem)) {
          await updateCategory(editingItem.id, { name, group, color });
        } else {
          await addCategory({ name, group, color });
        }
      } else if (activeTab === 'tags') {
        const categoryId = formData.get('categoryId') as string;
        if (editingItem && isTag(editingItem)) {
          await updateTag(editingItem.id, { name, categoryId: categoryId || undefined });
        } else {
          await addTag({ name, categoryId: categoryId || undefined });
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
      console.error('Error saving item:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Categories</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDefaultCategories}
                  disabled={isAddingCategories || !currentUser}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <RefreshCw size={20} className={isAddingCategories ? 'animate-spin' : ''} />
                  Restore Default Categories
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!currentUser}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus size={20} />
                  Add Category
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {Object.entries(categoryGroups).map(([group]) => (
              <div key={group} className="bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-medium mb-3">{group}</h4>
                <div className="space-y-2">
                  {categories
                    .filter((cat): cat is Category => cat?.group === group)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        {currentUser && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(category)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Tags</h3>
              <button
                onClick={handleAddItem}
                disabled={!currentUser}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={20} />
                Add Tag
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                {tags
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((tag) => {
                    const category = tag.categoryId ? categories.find((c) => c?.id === tag.categoryId) : null;
                    return (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                      >
                        <div>
                          <span>{tag.name}</span>
                          {category && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({category.name})
                            </span>
                          )}
                        </div>
                        {currentUser && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(tag)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(tag.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {tags.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No tags created yet. Add some tags to organize your expenses.
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'recurring':
        return <RecurringExpenses />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tags'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Tag size={18} />
          Tags
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recurring'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Calendar size={18} />
          Recurring Expenses
        </button>
      </div>

      {renderContent()}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : 'Tag'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingItem?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {activeTab === 'categories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group
                  </label>
                  <select
                    name="group"
                    defaultValue={editingItem && isCategory(editingItem) ? editingItem.group : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a group</option>
                    {Object.keys(categoryGroups).map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'tags' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    name="categoryId"
                    defaultValue={editingItem && isTag(editingItem) ? editingItem.categoryId : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No specific category</option>
                    {categories
                      .filter((category): category is Category => category !== null)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseSettings;
