import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { Plus, Edit2, Trash2, X, Calendar, Tag } from 'lucide-react';
import RecurringExpenses from './RecurringExpenses';

interface Category {
  id: string;
  name: string;
  group: string;
}

interface Tag {
  id: string;
  name: string;
  categoryId?: string;
}

const ExpenseSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'recurring'>('categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Tag | null>(null);
  const { categories, tags, addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag } = useExpenseStore();

  const categoryGroups = {
    'Utilities': ['Water', 'Energy', 'Internet'],
    'Housing': ['Rent/Mortgage', 'Council Tax', 'Home insurance', 'Maintenance/Repairs', 'Furniture/Appliances'],
    'Food': ['Groceries', 'Dining out', 'Takeout/Delivery', 'Food Subscriptions'],
    'Transportation': ['Gasoline', 'Car insurance', 'Maintenance/Repairs', 'Public transportation', 'Ride-hailing services'],
    'Insurance': ['Health insurance', 'Life insurance', 'Travel insurance'],
    'Entertainment': ['Movies/Streaming services', 'Concerts/Events', 'Hobbies', 'Holiday', 'Other entertainment'],
    'Clothing': ['Clothing purchases', 'Dry cleaning', 'Alterations'],
    'Health and Wellness': ['Medical expenses', 'Gym membership', 'Health supplements', 'Wellness services'],
    'Miscellaneous': ['Gifts', 'Donations', 'Other miscellaneous expenses']
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Category | Tag) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'categories') {
        deleteCategory(id);
      } else if (activeTab === 'tags') {
        deleteTag(id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    if (activeTab === 'categories') {
      const group = formData.get('group') as string;
      if (editingItem) {
        updateCategory(editingItem.id, { name, group });
      } else {
        addCategory({ name, group });
      }
    } else if (activeTab === 'tags') {
      const categoryId = formData.get('categoryId') as string;
      if (editingItem) {
        updateTag(editingItem.id, { name, categoryId: categoryId || undefined });
      } else {
        addTag({ name, categoryId: categoryId || undefined });
      }
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Categories</h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Category
              </button>
            </div>

            {Object.entries(categoryGroups).map(([group, categoryNames]) => (
              <div key={group} className="bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-medium mb-3">{group}</h4>
                <div className="space-y-2">
                  {categories
                    .filter(cat => cat.group === group)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(category => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                      >
                        <span>{category.name}</span>
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
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Tag
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                {tags
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(tag => {
                    const category = tag.categoryId ? categories.find(c => c.id === tag.categoryId) : null;
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
                  className="w-full"
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
                    defaultValue={editingItem?.group || ''}
                    className="w-full"
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
                    defaultValue={editingItem?.categoryId || ''}
                    className="w-full"
                  >
                    <option value="">No specific category</option>
                    {categories
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(category => (
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