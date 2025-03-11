import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyPageNoticeProps {
  pageName?: string;
}

const EmptyPageNotice = ({ pageName }: EmptyPageNoticeProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 bg-gray-50 rounded-lg">
      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">This page has not been implemented yet</h3>
      <p className="mt-2 text-sm text-gray-600">
        The {pageName || 'requested'} page will be available in future updates.
      </p>
    </div>
  );
};

export default EmptyPageNotice;