import React from 'react';
import { CategoryManager } from './CategoryManager';
import { LocationManager } from './LocationTagManager';

export default function CategoryManagementPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Category and Location Management</h2>
        </div>
        <div className="p-6">
          <CategoryManager />
          <div className="mt-8">
            <LocationManager />
          </div>
        </div>
      </div>
    </div>
  );
}