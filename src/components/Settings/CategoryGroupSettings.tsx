import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import type { CategoryGroup } from '../../types';

interface CategoryGroupSettingsProps {
  onClose: () => void;
}

const CategoryGroupSettings: React.FC<CategoryGroupSettingsProps> = ({ onClose }) => {
  const { categoryGroups, addCategoryGroup, updateCategoryGroup, deleteCategoryGroup } = useExpenseStore();
  const currentUser = useUserStore(state => state.currentUser);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

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
    if (!editedName.trim() || !currentUser) return;

    const updates = {
      name: editedName.trim(),
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    } as const;

    try {
      await updateCategoryGroup(groupId, updates);
      setEditingGroup(null);
      setEditedName('');
    } catch (error) {
      console.error('Failed to update category group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this category group?')) return;

    try {
      await deleteCategoryGroup(groupId);
    } catch (error) {
      console.error('Failed to delete category group:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !currentUser) return;

    const reorderedGroups = Array.from(groups);
    const [removed] = reorderedGroups.splice(result.source.index, 1);
    reorderedGroups.splice(result.destination.index, 0, removed);

    // Update order for all affected groups
    const updatedGroups = reorderedGroups.map((group, index) => ({
      ...group,
      order: index,
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    }));

    setGroups(updatedGroups);

    // Update each group in Firebase
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
      setGroups(categoryGroups); // Reset to original order on error
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Category Groups</h2>
      
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

      {/* Group list */}
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
                      {...provided.dragHandleProps}
                      className="flex items-center gap-2 p-2 bg-white rounded-md shadow"
                    >
                      {editingGroup === group.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
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
                              setEditedName('');
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1">{group.name}</span>
                          <button
                            onClick={() => {
                              setEditingGroup(group.id);
                              setEditedName(group.name);
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Close button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CategoryGroupSettings;
