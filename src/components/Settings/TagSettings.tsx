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
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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
    <div className="p-3 md:p-4 w-full max-w-2xl mx-auto">
      <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-center sm:text-left">Tags</h2>
      
      {/* Add new tag form */}
      <form onSubmit={handleAddTag} className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="form-input w-full h-12 md:h-14 text-base px-4 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="h-12 md:h-14 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-base whitespace-nowrap flex-shrink-0 flex items-center justify-center"
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
            className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {editingTag === tag.id ? (
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="form-input w-full h-12 text-base px-4 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateTag(tag.id)}
                    className="flex-1 sm:flex-none h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 px-4 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTag(null);
                      setEditedName('');
                    }}
                    className="flex-1 sm:flex-none h-12 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 flex items-center justify-center gap-2 px-4 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="flex-1 min-w-0 relative"
                  onMouseEnter={() => setShowTooltip(tag.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <span className="block truncate text-base">{tag.name}</span>
                  {showTooltip === tag.id && (
                    <div className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap top-full left-0 mt-1">
                      {tag.name}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingTag(tag.id);
                      setEditedName(tag.name);
                    }}
                    className="w-12 h-12 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                    aria-label="Edit tag"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleDeleteTag(tag.id);
                    }}
                    className="w-12 h-12 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation"
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

export default TagSettings;
