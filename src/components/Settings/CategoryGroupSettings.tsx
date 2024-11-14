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
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">Categories</h2>
      
      {/* Add new group form */}
      <form onSubmit={handleAddGroup} className="mb-8">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="form-input w-full min-h-[48px] text-base px-4"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[48px] text-base flex items-center justify-center gap-2"
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
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      {/* Group header */}
                      <div
                        {...provided.dragHandleProps}
                        className="flex flex-col gap-2 p-4 bg-gray-50 border-b"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="p-2 hover:bg-gray-200 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center flex-shrink-0"
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          
                          {editingGroup === group.id ? (
                            <div className="flex-1">
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={editedGroupName}
                                  onChange={(e) => setEditedGroupName(e.target.value)}
                                  className="form-input w-full min-h-[48px] text-base px-4"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateGroup(group.id)}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[48px] flex items-center justify-center gap-2"
                                  >
                                    <Save className="w-5 h-5" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingGroup(null);
                                      setEditedGroupName('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px] flex items-center justify-center gap-2"
                                  >
                                    <X className="w-5 h-5" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 font-medium text-base">{group.name}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingGroup(group.id);
                                    setEditedGroupName(group.name);
                                  }}
                                  className="w-10 h-10 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                                  aria-label="Edit group"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
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
                        <div className="p-4 space-y-4">
                          {/* Categories list */}
                          {categories
                            .filter(cat => cat.groupId === group.id)
                            .map(category => (
                              <div
                                key={category.id}
                                className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg"
                              >
                                {editingCategory === category.id ? (
                                  <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={editedCategoryName}
                                        onChange={(e) => setEditedCategoryName(e.target.value)}
                                        className="form-input flex-1 min-h-[48px] text-base px-4"
                                        placeholder="Category name"
                                      />
                                      <input
                                        type="color"
                                        value={editedCategoryColor}
                                        onChange={(e) => setEditedCategoryColor(e.target.value)}
                                        className="form-input w-20 min-h-[48px]"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleUpdateCategory(category.id)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[48px] flex items-center justify-center gap-2"
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
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px] flex items-center justify-center gap-2"
                                      >
                                        <X className="w-5 h-5" />
                                        <span>Cancel</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-6 h-6 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="flex-1 text-base">{category.name}</span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingCategory(category.id);
                                          setEditedCategoryName(category.name);
                                          setEditedCategoryColor(category.color);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                                        aria-label="Edit category"
                                      >
                                        <Edit2 className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
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
                            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="form-input w-full min-h-[48px] text-base px-4"
                                placeholder="New category name"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddCategory(group.id)}
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[48px] flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-5 h-5" />
                                  <span>Add</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingCategoryToGroup(null);
                                    setNewCategoryName('');
                                  }}
                                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px] flex items-center justify-center gap-2"
                                >
                                  <X className="w-5 h-5" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingCategoryToGroup(group.id)}
                              className="w-full px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
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
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px] text-base"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupSettings;
