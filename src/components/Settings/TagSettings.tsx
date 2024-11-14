import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import type { Tag } from '../../types';
import { Edit2, Trash2, Save, X } from 'lucide-react';

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
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center sm:text-left">Tags</h2>
      
      {/* Add new tag form */}
      <form onSubmit={handleAddTag} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="form-input w-full min-h-[48px] text-base px-4"
          />
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[48px] text-base whitespace-nowrap flex-shrink-0"
          >
            Add Tag
          </button>
        </div>
      </form>

      {/* Tag list */}
      <div className="space-y-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
          >
            {editingTag === tag.id ? (
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="form-input w-full min-h-[48px] text-base px-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateTag(tag.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[48px] flex-1 sm:flex-none"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTag(null);
                      setEditedName('');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px] flex-1 sm:flex-none"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="flex-1 text-base break-words">{tag.name}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingTag(tag.id);
                      setEditedName(tag.name);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit tag"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete tag"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {tags.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tags added yet. Add your first tag above.
          </div>
        )}
      </div>

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

export default TagSettings;
