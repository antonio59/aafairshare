'use client';

import { useParams } from 'next/navigation';

// Define the params type for this dynamic route
type ExpenseDetailParams = {
  id: string;
};

export default function ExpenseDetailPage() {
  // useParams returns the dynamic route parameters
  const params = useParams<ExpenseDetailParams>();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expense Details</h1>
      <p className="text-gray-600">Viewing expense ID: {params.id}</p>
    </div>
  );
}