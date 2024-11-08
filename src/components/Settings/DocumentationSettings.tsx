import React from 'react';
import { HelpCircle, FileText, Users, DollarSign, PieChart } from 'lucide-react';

const DocumentationSettings = () => {
  const sections = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Account Management',
      content: [
        'Log in with your email and password',
        'Change your password in Account Settings',
        'Set your preferred currency',
      ],
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Managing Expenses',
      content: [
        'Add new expenses with description, amount, and category',
        'Split expenses equally or assign to one person',
        'Edit or delete expenses as needed',
      ],
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: 'Budgets & Categories',
      content: [
        'Create custom expense categories',
        'Set monthly budgets for each category',
        'Track spending against budgets',
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Settlements',
      content: [
        'View monthly balance between partners',
        'Mark months as settled when payments are made',
        'Track settlement history',
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">How to Use AA FairShare</h3>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-blue-600">{section.icon}</div>
              <h4 className="text-lg font-medium">{section.title}</h4>
            </div>
            <ul className="space-y-2 ml-9">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-600 list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">
          Need more help? Contact support at support@aafairshare.com
        </p>
      </div>
    </div>
  );
};

export default DocumentationSettings;