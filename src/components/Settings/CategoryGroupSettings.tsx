import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2, Loader2, Hash, GripVertical } from 'lucide-react';
import type { CategoryGroup } from '../../types';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from "react-beautiful-dnd";

const CategoryGroupSettings = () => {
  const { categoryGroups = [], addCategoryGroup, updateCategoryGroup, deleteCategoryGroup } = useExpenseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data state with default values
  const [formData, setFormData] = useState({
    name: '',
    color: '#6B7280', // Default color
    icon: '',
    order: 0,
  });

  const handleAddGroup = () => {
    setFormData({ 
      name: '', 
      color: '#6B7280', // Default color
      icon: '', 
      order: categoryGroups.length 
    });
    setEditingGroup(null);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditGroup = (group: CategoryGroup) => {
    setFormData({
      name: group.name,
      color: group.color || '#6B7280', // Fallback to default color if undefined
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
      // Validate name
      if (formData.name.trim().length === 0) {
        throw new Error('Group name is required');
      }

      // Validate order
      if (formData.order < 0) {
        throw new Error('Order must be a positive number');
      }

      // Check for duplicate names
      const existingGroup = categoryGroups.find(
        g => g.name.toLowerCase() === formData.name.toLowerCase() && g.id !== editingGroup?.id
      );
      if (existingGroup) {
        throw new Error('A group with this name already exists');
      }

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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(categoryGroups);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order for all affected groups
    try {
      for (let i = 0; i < items.length; i++) {
        if (items[i].order !== i) {
          await updateCategoryGroup(items[i].id, { ...items[i], order: i });
        }
      }
    } catch (err) {
      setError('Failed to update group order');
      console.error('Error updating group order:', err);
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="groups">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {categoryGroups
                  .sort((a, b) => a.order - b.order)
                  .map((group, index) => (
                    <Draggable key={group.id} draggableId={group.id} index={index}>
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical size={18} />
                            </div>
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            />
                            <span>{group.name}</span>
                            <span className="text-sm text-gray-500">Order: {group.order + 1}</span>
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
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
                {categoryGroups.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No category groups created yet. Add some groups to organize your categories.
                  </p>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 p-1 border border-gray-300 rounded-lg"
                    required
                  />
                  <div 
                    className="flex-1 h-10 rounded-lg border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
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
                  value={formData.order + 1}
                  onChange={(e) => setFormData({ ...formData, order: Math.max(0, parseInt(e.target.value) - 1) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max={categoryGroups.length + (editingGroup ? 0 : 1)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a number between 1 and {categoryGroups.length + (editingGroup ? 0 : 1)}
                </p>
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
