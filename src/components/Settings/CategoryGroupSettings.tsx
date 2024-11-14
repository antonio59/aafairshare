import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import type { CategoryGroup, Category } from '../../types';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
    console.log('CategoryGroups updated:', categoryGroups);
    setGroups(categoryGroups);
  }, [categoryGroups]);

  useEffect(() => {
    console.log('Current Categories:', categories);
  }, [categories]);

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
      console.log('Adding new group:', newGroup);
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
      console.log('Updating group:', groupId, updates);
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
      console.log('Deleting group:', groupId);
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
        color: generateUniqueColor(categories), // Automatically generate a unique color
        groupId: groupId
      };
      console.log('Adding new category:', newCategory);
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
      console.log('Updating category:', categoryId, updates);
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
      console.log('Deleting category:', categoryId);
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
      console.log('Updating group orders:', updatedGroups);
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      
      {/* Add new group form */}
      <form onSubmit={handleAddGroup} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="form-input flex-1"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add Group
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
              className="space-y-2"
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
                      className="bg-white rounded-md shadow overflow-hidden"
                    >
                      {/* Group header */}
                      <div
                        {...provided.dragHandleProps}
                        className="flex items-center gap-2 p-2 bg-gray-50 border-b"
                      >
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedGroups.has(group.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        
                        {editingGroup === group.id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editedGroupName}
                              onChange={(e) => setEditedGroupName(e.target.value)}
                              className="form-input flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateGroup(group.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingGroup(null);
                                setEditedGroupName('');
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-medium">{group.name}</span>
                            <button
                              onClick={() => {
                                setEditingGroup(group.id);
                                setEditedGroupName(group.name);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>

                      {/* Categories */}
                      {expandedGroups.has(group.id) && (
                        <div className="p-2 space-y-2">
                          {/* Categories list */}
                          {categories
                            .filter(cat => cat.groupId === group.id)
                            .map(category => (
                              <div
                                key={category.id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md ml-6"
                              >
                                {editingCategory === category.id ? (
                                  <div className="flex-1 flex gap-2">
                                    <input
                                      type="text"
                                      value={editedCategoryName}
                                      onChange={(e) => setEditedCategoryName(e.target.value)}
                                      className="form-input flex-1"
                                      placeholder="Category name"
                                    />
                                    <input
                                      type="color"
                                      value={editedCategoryColor}
                                      onChange={(e) => setEditedCategoryColor(e.target.value)}
                                      className="form-input w-20"
                                    />
                                    <button
                                      onClick={() => handleUpdateCategory(category.id)}
                                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCategory(null);
                                        setEditedCategoryName('');
                                        setEditedCategoryColor('');
                                      }}
                                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="flex-1">{category.name}</span>
                                    <button
                                      onClick={() => {
                                        setEditingCategory(category.id);
                                        setEditedCategoryName(category.name);
                                        setEditedCategoryColor(category.color);
                                      }}
                                      className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="p-1 text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}

                          {/* Add category form */}
                          {addingCategoryToGroup === group.id ? (
                            <div className="flex gap-2 p-2 bg-gray-50 rounded-md ml-6">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="form-input flex-1"
                                placeholder="New category name"
                              />
                              <button
                                onClick={() => handleAddCategory(group.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setAddingCategoryToGroup(null);
                                  setNewCategoryName('');
                                }}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingCategoryToGroup(group.id)}
                              className="ml-6 text-sm text-blue-600 hover:text-blue-800"
                            >
                              + Add Category
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
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupSettings;
