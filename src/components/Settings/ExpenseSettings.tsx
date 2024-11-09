import { useState, useEffect } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import { Plus, Edit2, Trash2, X, Calendar, Tag, RefreshCw, AlertCircle, CheckCircle2, Loader2, Hash, Folder } from 'lucide-react';
import RecurringExpenses from './RecurringExpenses';
import type { Category, Tag as TagType } from '../../types';
import Dropdown from '../common/Dropdown';

// Type guard functions
const isCategory = (item: any): item is Category => {
  return item && 'group' in item;
};

const isTag = (item: any): item is TagType => {
  return item && 'categoryId' in item;
};

// Category groups and colors
const categoryGroups = {
  'Utilities': '#2196F3',
  'Housing': '#795548',
  'Food': '#4CAF50',
  'Transportation': '#FF9800',
  'Insurance': '#9C27B0',
  'Entertainment': '#F44336',
  'Clothing': '#E91E63',
  'Health and Wellness': '#009688',
  'Miscellaneous': '#9E9E9E'
} as const;

const ExpenseSettings = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'recurring'>('categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | TagType | null>(null);
  const [isAddingCategories, setIsAddingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { categories = [], tags = [], addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag, restoreDefaultCategories } = useExpenseStore();
  const { currentUser } = useUserStore();

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    group: '',
    categoryId: '',
  });

  // Ensure categories are loaded
  useEffect(() => {
    if (categories.length === 0) {
      handleRestoreDefaultCategories();
    }
  }, [categories.length]);

  const handleRestoreDefaultCategories = async () => {
    try {
      setIsAddingCategories(true);
      setError(null);
      setSuccess(null);
      await restoreDefaultCategories();
      setSuccess('Default categories restored successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore categories');
      console.error('Error restoring categories:', err);
    } finally {
      setIsAddingCategories(false);
    }
  };

  const handleAddItem = () => {
    if (!currentUser) return;
    setFormData({ name: '', group: '', categoryId: '' });
    setEditingItem(null);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditItem = (item: Category | TagType) => {
    if (!currentUser) return;
    setFormData({
      name: item.name,
      group: isCategory(item) ? item.group : '',
      categoryId: isTag(item) ? item.categoryId || '' : '',
    });
    setEditingItem(item);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setError(null);
        setSuccess(null);
        if (activeTab === 'categories') {
          await deleteCategory(id);
          setSuccess('Category deleted successfully');
        } else if (activeTab === 'tags') {
          await deleteTag(id);
          setSuccess('Tag deleted successfully');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
        console.error('Error deleting item:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'categories') {
        const color = categoryGroups[formData.group as keyof typeof categoryGroups] || '#9E9E9E';
        
        if (editingItem && isCategory(editingItem)) {
          await updateCategory(editingItem.id, { 
            name: formData.name, 
            group: formData.group, 
            color 
          });
          setSuccess('Category updated successfully');
        } else {
          await addCategory({ 
            name: formData.name, 
            group: formData.group, 
            color 
          });
          setSuccess('Category added successfully');
        }
      } else if (activeTab === 'tags') {
        if (editingItem && isTag(editingItem)) {
          await updateTag(editingItem.id, { 
            name: formData.name, 
            categoryId: formData.categoryId || undefined 
          });
          setSuccess('Tag updated successfully');
        } else {
          await addTag({ 
            name: formData.name, 
            categoryId: formData.categoryId || undefined 
          });
          setSuccess('Tag added successfully');
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
      console.error('Error saving item:', err);
    } finally {
      setIsSubmitting(false);
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
                  {isAddingCategories ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <RefreshCw size={20} />
                  )}
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
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{success}</span>
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
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
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
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Edit category"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(category.id)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Delete category"
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
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{success}</span>
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
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
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
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Edit tag"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(tag.id)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Delete tag"
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
          <Folder size={18} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : 'Tag'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'tag'} name`}
                    required
                  />
                </div>
              </div>

              {activeTab === 'categories' && (
                <Dropdown
                  label="Group"
                  value={formData.group}
                  onChange={(value) => setFormData({ ...formData, group: value })}
                  options={Object.keys(categoryGroups).map(group => ({
                    value: group,
                    label: group
                  }))}
                  placeholder="Select a group"
                  required
                />
              )}

              {activeTab === 'tags' && (
                <Dropdown
                  label="Category (Optional)"
                  value={formData.categoryId}
                  onChange={(value) => setFormData({ ...formData, categoryId: value })}
                  options={categories
                    .filter((category): category is Category => category !== null)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(category => ({
                      value: category.id,
                      label: category.name
                    }))}
                  placeholder="Select a category"
                />
              )}

              <div className="flex justify-end gap-3 pt-6 border-t">
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
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
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
