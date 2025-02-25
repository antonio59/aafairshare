'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog } from './ui/dialog';
import { Select } from './ui/select';
import type { Category, CategoryGroup, Tag, RecurringExpense, UserSettings } from '@/types';

interface SettingsData {
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  recurringExpenses: RecurringExpense[];
  userSettings: UserSettings;
  stats: {
    totalCategories: number;
    totalGroups: number;
    totalTags: number;
    totalRecurring: number;
    categoriesByGroup: Record<string, Category[]>;
    monthlyRecurringTotal: number;
  };
}

export function SettingsClient() {
  // State
  const [data, setData] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from server component
  useEffect(() => {
    const dataScript = document.getElementById('settings-data');
    if (dataScript) {
      const settingsData = JSON.parse(dataScript.innerHTML);
      setData(settingsData);
    }
  }, []);

  if (!data) return null;

  const {
    categories,
    categoryGroups,
    tags,
    recurringExpenses,
    userSettings,
    stats
  } = data;

  // Handlers
  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      // Update local state
      setData(prev => prev ? {
        ...prev,
        userSettings: { ...prev.userSettings, ...updates }
      } : null);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings/categories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add category');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add category:', error);
    } finally {
      setIsSubmitting(false);
      setShowAddCategoryModal(false);
    }
  };

  const handleAddGroup = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings/category-groups', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add group');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add group:', error);
    } finally {
      setIsSubmitting(false);
      setShowAddGroupModal(false);
    }
  };

  const handleAddTag = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings/tags', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add tag');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsSubmitting(false);
      setShowAddTagModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalCategories}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Category Groups</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalGroups}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Tags</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalTags}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Recurring</h3>
          <p className="text-2xl font-bold mt-1">£{stats.monthlyRecurringTotal.toFixed(2)}</p>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  id="theme"
                  value={userSettings.theme}
                  onValueChange={(value) => handleUpdateSettings({ theme: value })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  id="currency"
                  value={userSettings.currency}
                  onValueChange={(value) => handleUpdateSettings({ currency: value })}
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultSplit">Default Split</Label>
                <Select
                  id="defaultSplit"
                  value={userSettings.defaultSplit}
                  onValueChange={(value) => handleUpdateSettings({ defaultSplit: value })}
                >
                  <option value="equal">Equal</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <div className="space-x-2">
                <Button onClick={() => setShowAddGroupModal(true)}>
                  Add Group
                </Button>
                <Button onClick={() => setShowAddCategoryModal(true)}>
                  Add Category
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              {categoryGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  <h4 className="font-medium">{group.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.categoriesByGroup[group.id]?.map(category => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <Button onClick={() => setShowAddTagModal(true)}>
                Add Tag
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span>{tag.name}</span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recurring Expenses</h3>
              <Button>Add Recurring</Button>
            </div>
            <div className="space-y-4">
              {recurringExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      £{expense.amount} • {expense.frequency}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={userSettings.notifications.email}
                  onCheckedChange={(checked) =>
                    handleUpdateSettings({
                      notifications: { ...userSettings.notifications, email: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Switch
                  id="pushNotifications"
                  checked={userSettings.notifications.push}
                  onCheckedChange={(checked) =>
                    handleUpdateSettings({
                      notifications: { ...userSettings.notifications, push: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="recurringNotifications">Recurring Expense Reminders</Label>
                <Switch
                  id="recurringNotifications"
                  checked={userSettings.notifications.recurring}
                  onCheckedChange={(checked) =>
                    handleUpdateSettings({
                      notifications: { ...userSettings.notifications, recurring: checked }
                    })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Category Modal */}
      <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
        {/* Add category form */}
      </Dialog>

      {/* Add Group Modal */}
      <Dialog open={showAddGroupModal} onOpenChange={setShowAddGroupModal}>
        {/* Add group form */}
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog open={showAddTagModal} onOpenChange={setShowAddTagModal}>
        {/* Add tag form */}
      </Dialog>
    </div>
  );
}
