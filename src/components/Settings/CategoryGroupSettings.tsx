import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import type { CategoryGroup, Category } from '../../types';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import { generateUniqueColor } from '../../utils/colorUtils';

interface CategoryGroupSettingsProps {
  onClose?: () => void;
}

const CategoryGroupSettings: React.FC<CategoryGroupSettingsProps> = ({ onClose }) => {
  const { 
    categoryGroups, 
    categories,
    addCategoryGroup, 
    updateCategoryGroup, 
    deleteCategoryGroup,
    addCategory,
    updateCategory,
    deleteCategory
  } = useExpenseStore();
  const currentUser = useUserStore(state => state.currentUser);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editedGroupName, setEditedGroupName] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategoryToGroup, setAddingCategoryToGroup] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategoryColor, setEditedCategoryColor] = useState('');

  useEffect(() => {
    setGroups(categoryGroups);
  }, [categoryGroups]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;

    const newGroup = {
      name: newGroupName.trim(),
      order: groups.length,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as const;

    try {
      await addCategoryGroup(newGroup);
      setNewGroupName('');
    } catch (error) {
      console.error('Failed to add category group:', error);
    }
  };

  const handleUpdateGroup = async (groupId: string) => {
    if (!editedGroupName.trim() || !currentUser) return;

    const updates = {
      name: editedGroupName.trim(),
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    } as const;

    try {
      await updateCategoryGroup(groupId, updates);
      setEditingGroup(null);
      setEditedGroupName('');
    } catch (error) {
      console.error('Failed to update category group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this category group and all its categories?')) return;

    try {
      await deleteCategoryGroup(groupId);
    } catch (error) {
      console.error('Failed to delete category group:', error);
    }
  };

  const handleAddCategory = async (groupId: string) => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = {
        name: newCategoryName.trim(),
        color: generateUniqueColor(categories),
        groupId: groupId
      };
      await addCategory(newCategory);
      setNewCategoryName('');
      setAddingCategoryToGroup(null);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editedCategoryName.trim()) return;

    try {
      const updates = {
        name: editedCategoryName.trim(),
        color: editedCategoryColor
      };
      await updateCategory(categoryId, updates);
      setEditingCategory(null);
      setEditedCategoryName('');
      setEditedCategoryColor('');
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !currentUser) return;

    const reorderedGroups = Array.from(groups);
    const [removed] = reorderedGroups.splice(result.source.index, 1);
    reorderedGroups.splice(result.destination.index, 0, removed);

    const updatedGroups = reorderedGroups.map((group, index) => ({
      ...group,
      order: index,
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    }));

    setGroups(updatedGroups);

    try {
      for (const group of updatedGroups) {
        const updates = {
          order: group.order,
          updatedBy: currentUser.id,
          updatedAt: group.updatedAt,
        } as const;
        await updateCategoryGroup(group.id, updates);
      }
    } catch (error) {
      console.error('Failed to update group orders:', error);
      setGroups(categoryGroups);
    }
  };

  return (
    <div className="p-3 md:p-4 w-full max-w-lg mx-auto">
      <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-center">Categories</h2>
      
      {/* Add new group form */}
      <form onSubmit={handleAddGroup} className="mb-6 md:mb-8">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="form-input w-full h-12 md:h-14 text-base px-4 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="w-full h-12 md:h-14 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-base flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Group</span>
          </button>
        </div>
      </form>

      {/* Groups and Categories list */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="category-groups">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {groups.map((group, index) => (
                <Draggable
                  key={group.id}
                  draggableId={group.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      {/* Group header */}
                      <div
                        {...provided.dragHandleProps}
                        className="flex flex-col gap-3 p-3 md:p-4 bg-gray-50 border-b"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-12 h-12 hover:bg-gray-200 active:bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                            aria-label={expandedGroups.has(group.id) ? "Collapse group" : "Expand group"}
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronDown className="w-6 h-6" />
                            ) : (
                              <ChevronRight className="w-6 h-6" />
                            )}
                          </button>
                          
                          {editingGroup === group.id ? (
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-3">
                                <input
                                  type="text"
                                  value={editedGroupName}
                                  onChange={(e) => setEditedGroupName(e.target.value)}
                                  className="form-input w-full h-12 text-base px-4 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateGroup(group.id)}
                                    className="flex-1 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 transition-colors"
                                  >
                                    <Save className="w-5 h-5" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingGroup(null);
                                      setEditedGroupName('');
                                    }}
                                    className="flex-1 h-12 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
                                  >
                                    <X className="w-5 h-5" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <span 
                                  className="font-medium text-base md:text-lg truncate block"
                                  title={group.name}
                                >
                                  {group.name}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingGroup(group.id);
                                    setEditedGroupName(group.name);
                                  }}
                                  className="w-12 h-12 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                                  aria-label="Edit group"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="w-12 h-12 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                                  aria-label="Delete group"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Categories */}
                      {expandedGroups.has(group.id) && (
                        <div className="p-3 md:p-4 space-y-3">
                          {/* Categories list */}
                          {categories
                            .filter(cat => cat.groupId === group.id)
                            .map(category => (
                              <div
                                key={category.id}
                                className="flex flex-col gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                {editingCategory === category.id ? (
                                  <div className="flex flex-col gap-3">
                                    <div className="flex flex-col md:flex-row gap-3">
                                      <input
                                        type="text"
                                        value={editedCategoryName}
                                        onChange={(e) => setEditedCategoryName(e.target.value)}
                                        className="form-input flex-1 h-12 text-base px-4 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Category name"
                                      />
                                      <input
                                        type="color"
                                        value={editedCategoryColor}
                                        onChange={(e) => setEditedCategoryColor(e.target.value)}
                                        className="form-input w-full md:w-20 h-12 rounded-lg shadow-sm border border-gray-300"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleUpdateCategory(category.id)}
                                        className="flex-1 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 transition-colors"
                                      >
                                        <Save className="w-5 h-5" />
                                        <span>Save</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCategory(null);
                                          setEditedCategoryName('');
                                          setEditedCategoryColor('');
                                        }}
                                        className="flex-1 h-12 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
                                      >
                                        <X className="w-5 h-5" />
                                        <span>Cancel</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="w-8 h-8 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <div className="flex-1 min-w-0 relative"
                                         onMouseEnter={() => setShowTooltip(category.id)}
                                         onMouseLeave={() => setShowTooltip(null)}
                                    >
                                      <span className="block truncate text-base md:text-lg" title={category.name}>
                                        {category.name}
                                      </span>
                                      {showTooltip === category.id && (
                                        <div className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap top-full left-0 mt-1">
                                          {category.name}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <button
                                        onClick={() => {
                                          setEditingCategory(category.id);
                                          setEditedCategoryName(category.name);
                                          setEditedCategoryColor(category.color);
                                        }}
                                        className="w-12 h-12 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                                        aria-label="Edit category"
                                      >
                                        <Edit2 className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="w-12 h-12 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                                        aria-label="Delete category"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}

                          {/* Add category form */}
                          {addingCategoryToGroup === group.id ? (
                            <div className="flex flex-col gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="form-input w-full h-12 text-base px-4 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                placeholder="New category name"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddCategory(group.id)}
                                  className="flex-1 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 transition-colors"
                                >
                                  <Plus className="w-5 h-5" />
                                  <span>Add</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingCategoryToGroup(null);
                                    setNewCategoryName('');
                                  }}
                                  className="flex-1 h-12 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingCategoryToGroup(group.id)}
                              className="w-full h-12 text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-5 h-5" />
                              <span>Add Category</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Close button */}
      {onClose && (
        <div className="mt-6 md:mt-8">
          <button
            onClick={onClose}
            className="w-full h-12 md:h-14 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 text-base transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupSettings;
