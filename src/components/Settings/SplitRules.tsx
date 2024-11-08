import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import Select from 'react-select';

const CATEGORY_GROUPS = [
  'Utilities',
  'Housing',
  'Food',
  'Transportation',
  'Insurance',
  'Entertainment',
  'Clothing',
  'Health and wellness',
  'Miscellaneous',
] as const;

const SplitRules = () => {
  const { categories, splitRules, addSplitRule, updateSplitRule, deleteSplitRule } = useExpenseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    andresPercentage: '50',
    antonioPercentage: '50',
  });

  // Group categories for the select input
  const groupedCategories = React.useMemo(() => 
    CATEGORY_GROUPS.map(group => ({
      label: group,
      options: categories
        .filter(cat => cat.group === group)
        .map(cat => ({
          value: cat.id,
          label: cat.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    })).filter(group => group.options.length > 0)
  , [categories]);

  useEffect(() => {
    if (editingRule) {
      setFormData({
        category: editingRule.category,
        andresPercentage: editingRule.splitRatio.toString(),
        antonioPercentage: (100 - editingRule.splitRatio).toString(),
      });
    }
  }, [editingRule]);

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      category: '',
      andresPercentage: '50',
      antonioPercentage: '50',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Are you sure you want to delete this split rule?')) {
      deleteSplitRule(id);
    }
  };

  const validateSplitRatio = (andresPercentage: number, antonioPercentage: number): boolean => {
    if (isNaN(andresPercentage) || isNaN(antonioPercentage)) {
      setFormError('Please enter valid numbers for both percentages');
      return false;
    }

    if (andresPercentage < 0 || antonioPercentage < 0) {
      setFormError('Percentages cannot be negative');
      return false;
    }

    if (andresPercentage + antonioPercentage !== 100) {
      setFormError('Percentages must add up to 100%');
      return false;
    }

    return true;
  };

  const handlePercentageChange = (person: 'andres' | 'antonio', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const otherValue = person === 'andres' 
      ? parseInt(formData.antonioPercentage) || 0
      : parseInt(formData.andresPercentage) || 0;

    if (numValue <= 100) {
      setFormData({
        ...formData,
        andresPercentage: person === 'andres' ? value : (100 - numValue).toString(),
        antonioPercentage: person === 'antonio' ? value : (100 - numValue).toString(),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const andresPercentage = parseInt(formData.andresPercentage);
    const antonioPercentage = parseInt(formData.antonioPercentage);

    if (!formData.category) {
      setFormError('Please select a category');
      return;
    }

    if (!validateSplitRatio(andresPercentage, antonioPercentage)) {
      return;
    }

    if (editingRule) {
      updateSplitRule(editingRule.id, {
        category: formData.category,
        splitRatio: andresPercentage,
      });
    } else {
      addSplitRule({
        category: formData.category,
        splitRatio: andresPercentage,
      });
    }

    setIsModalOpen(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Split Rules</h3>
        <button
          onClick={handleAddRule}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Split Rule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-2">
          {splitRules.map(rule => {
            const category = categories.find(c => c.id === rule.category);
            return (
              <div
                key={rule.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
              >
                <div>
                  <span className="font-medium">{category?.name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-4">
                      <span>Andres: {rule.splitRatio}%</span>
                      <span>Antonio: {100 - rule.splitRatio}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          {splitRules.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No split rules created yet. Add rules to automatically split expenses for specific categories.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRule ? 'Edit' : 'Add'} Split Rule
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRule(null);
                  setFormError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={
                    formData.category
                      ? {
                          value: formData.category,
                          label: categories.find(c => c.id === formData.category)?.name
                        }
                      : null
                  }
                  onChange={(option) => setFormData({ ...formData, category: option?.value || '' })}
                  options={groupedCategories}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Select a category"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Split Ratio
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Andres's Share (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.andresPercentage}
                      onChange={(e) => handlePercentageChange('andres', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Antonio's Share (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.antonioPercentage}
                      onChange={(e) => handlePercentageChange('antonio', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRule(null);
                    setFormError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingRule ? 'Save Changes' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitRules;