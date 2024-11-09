import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2, Loader2, Hash } from 'lucide-react';
import type { CategoryGroup } from '../../types';

const CategoryGroupSettings = () => {
  const { categoryGroups = [], addCategoryGroup, updateCategoryGroup, deleteCategoryGroup } = useExpenseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    icon: '',
    order: 0,
  });

  const handleAddGroup = () => {
    setFormData({ name: '', color: '#000000', icon: '', order: categoryGroups.length });
    setEditingGroup(null);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditGroup = (group: CategoryGroup) => {
    setFormData({
      name: group.name,
      color: group.color,
      icon: group.icon || '',
      order: group.order,
    });
    setEditingGroup(group);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group? All categories in this group will need to be reassigned.')) {
      try {
        setError(null);
        setSuccess(null);
        await deleteCategoryGroup(id);
        setSuccess('Group deleted successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete group');
        console.error('Error deleting group:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingGroup) {
        await updateCategoryGroup(editingGroup.id, formData);
        setSuccess('Group updated successfully');
      } else {
        await addCategoryGroup(formData);
        setSuccess('Group added successfully');
      }

      setIsModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
      console.error('Error saving group:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Category Groups</h3>
        <button
          onClick={handleAddGroup}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Group
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
          {categoryGroups
            .sort((a, b) => a.order - b.order)
            .map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: group.color }}
                  />
                  <span>{group.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Edit group"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete group"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          {categoryGroups.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No category groups created yet. Add some groups to organize your categories.
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingGroup ? 'Edit' : 'Add'} Category Group
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingGroup(null);
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
                    placeholder="Enter group name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 p-1 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Optional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter icon name (e.g., Home, Car, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGroup(null);
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
                  {editingGroup ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupSettings;
