import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import type { Tag } from '../../types';

interface TagSettingsProps {
  onClose?: () => void;
}

const TagSettings: React.FC<TagSettingsProps> = ({ onClose }) => {
  const { tags, addTag, updateTag, deleteTag } = useExpenseStore();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await addTag({
        name: newTagName.trim(),
      });
      setNewTagName('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editedName.trim()) return;

    try {
      await updateTag(tagId, { name: editedName.trim() });
      setEditingTag(null);
      setEditedName('');
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteTag(tagId);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tags</h2>
      
      {/* Add new tag form */}
      <form onSubmit={handleAddTag} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="form-input flex-1"
          />
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add Tag
          </button>
        </div>
      </form>

      {/* Tag list */}
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2 p-2 bg-white rounded-md shadow"
          >
            {editingTag === tag.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="form-input flex-1"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdateTag(tag.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setEditedName('');
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1">{tag.name}</span>
                <button
                  onClick={() => {
                    setEditingTag(tag.id);
                    setEditedName(tag.name);
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>

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

export default TagSettings;
