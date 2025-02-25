'use client';

import React, { useState, useEffect } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import type { CategoryGroup, Category } from '../../types';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, X, Save, GripVertical } from 'lucide-react';
import { generateUniqueColor } from '../../utils/colorUtils';
import { cn } from '../../lib/utils';

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
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
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
    if (!newCategoryName.trim() || !currentUser) return;

    const newCategory = {
      name: newCategoryName.trim(),
      groupId,
      color: generateUniqueColor(categories),
      order: categories.filter(c => c.groupId === groupId).length,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as const;

    try {
      await addCategory(newCategory);
      setNewCategoryName('');
      setAddingCategoryToGroup(null);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editedCategoryName.trim() || !currentUser) return;

    const updates = {
      name: editedCategoryName.trim(),
      color: editedCategoryColor,
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    } as const;

    try {
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

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>, itemId: string) => {
    event.currentTarget.style.cursor = 'grabbing';
    event.currentTarget.style.opacity = '0.5';
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>, itemId: string) => {
    event.currentTarget.style.cursor = 'grab';
    event.currentTarget.style.opacity = '1';
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Category Groups</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Add New Group Form */}
      <form onSubmit={handleAddGroup} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Group
          </button>
        </div>
      </form>

      {/* Category Groups List */}
      <Accordion.Root
        type="multiple"
        value={expandedGroups}
        onValueChange={setExpandedGroups}
        className="space-y-4"
      >
        {groups.map((group) => (
          <Accordion.Item
            key={group.id}
            value={group.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <Accordion.Header>
              <Accordion.Trigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    {editingGroup === group.id ? (
                      <input
                        type="text"
                        value={editedGroupName}
                        onChange={(e) => setEditedGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateGroup(group.id);
                          if (e.key === 'Escape') {
                            setEditingGroup(null);
                            setEditedGroupName('');
                          }
                        }}
                        className="px-2 py-1 border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{group.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editingGroup === group.id) {
                          handleUpdateGroup(group.id);
                        } else {
                          setEditingGroup(group.id);
                          setEditedGroupName(group.name);
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {editingGroup === group.id ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Edit2 className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronDown className="h-5 w-5 text-gray-500 transform transition-transform duration-200" />
                  </div>
                </div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <div className="p-4 space-y-4">
                {/* Categories List */}
                <div className="space-y-2">
                  {categories
                    .filter((category) => category.groupId === group.id)
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                        onPointerDown={(e) => handleDragStart(e, category.id)}
                        onPointerUp={(e) => handleDragEnd(e, category.id)}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {editingCategory === category.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedCategoryName}
                                onChange={(e) => setEditedCategoryName(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded"
                                autoFocus
                              />
                              <input
                                type="color"
                                value={editedCategoryColor}
                                onChange={(e) => setEditedCategoryColor(e.target.value)}
                                className="w-8 h-8"
                              />
                            </div>
                          ) : (
                            <span>{category.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (editingCategory === category.id) {
                                handleUpdateCategory(category.id);
                              } else {
                                setEditingCategory(category.id);
                                setEditedCategoryName(category.name);
                                setEditedCategoryColor(category.color);
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {editingCategory === category.id ? (
                              <Save className="h-4 w-4" />
                            ) : (
                              <Edit2 className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add Category Button/Form */}
                {addingCategoryToGroup === group.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddCategory(group.id);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newCategoryName.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCategoryToGroup(null);
                        setNewCategoryName('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingCategoryToGroup(group.id)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Category</span>
                  </button>
                )}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
};

export default CategoryGroupSettings;
