import { v4 as uuidv4 } from 'uuid';
import { addCategoryToFirestore } from '../store/firebaseOperations';
import type { Category } from '../types';

const categories: Omit<Category, 'id'>[] = [
  // Utilities (Blue shades)
  { name: 'Energy', color: '#2196F3', group: 'Utilities' },
  { name: 'Internet', color: '#1976D2', group: 'Utilities' },
  { name: 'Water', color: '#0D47A1', group: 'Utilities' },

  // Housing (Brown shades)
  { name: 'Council Tax', color: '#795548', group: 'Housing' },
  { name: 'Furniture/Appliances', color: '#6D4C41', group: 'Housing' },
  { name: 'House Maintenance/Repairs', color: '#5D4037', group: 'Housing' },
  { name: 'Rent', color: '#4E342E', group: 'Housing' },

  // Food (Green shades)
  { name: 'Dining Out', color: '#4CAF50', group: 'Food' },
  { name: 'Food Subscriptions', color: '#388E3C', group: 'Food' },
  { name: 'Groceries', color: '#2E7D32', group: 'Food' },
  { name: 'Takeout/Delivery', color: '#1B5E20', group: 'Food' },

  // Transportation (Orange shades)
  { name: 'Flights', color: '#FF9800', group: 'Transportation' },
  { name: 'Gasoline', color: '#F57C00', group: 'Transportation' },
  { name: 'Public Transportation', color: '#EF6C00', group: 'Transportation' },
  { name: 'Ride-hailing Services', color: '#E65100', group: 'Transportation' },

  // Insurance (Purple shades)
  { name: 'Health Insurance', color: '#9C27B0', group: 'Insurance' },
  { name: 'Home Insurance', color: '#7B1FA2', group: 'Insurance' },
  { name: 'Life Insurance', color: '#6A1B9A', group: 'Insurance' },
  { name: 'Travel Insurance', color: '#4A148C', group: 'Insurance' },

  // Entertainment (Red shades)
  { name: 'Concerts/Events', color: '#F44336', group: 'Entertainment' },
  { name: 'Hobbies', color: '#E53935', group: 'Entertainment' },
  { name: 'Holiday', color: '#D32F2F', group: 'Entertainment' },
  { name: 'Movies', color: '#C62828', group: 'Entertainment' },
  { name: 'Other Entertainment', color: '#B71C1C', group: 'Entertainment' },
  { name: 'Streaming Services', color: '#D50000', group: 'Entertainment' },

  // Clothing (Pink shades)
  { name: 'Alterations', color: '#E91E63', group: 'Clothing' },
  { name: 'Clothing Purchases', color: '#C2185B', group: 'Clothing' },
  { name: 'Dry Cleaning', color: '#880E4F', group: 'Clothing' },

  // Health and Wellness (Teal shades)
  { name: 'Health and Wellness', color: '#009688', group: 'Health and Wellness' },

  // Miscellaneous (Grey shades)
  { name: 'Donations', color: '#9E9E9E', group: 'Miscellaneous' },
  { name: 'Gifts', color: '#757575', group: 'Miscellaneous' },
  { name: 'Other Miscellaneous Expenses', color: '#616161', group: 'Miscellaneous' },
];

export const addCategories = async () => {
  try {
    for (const category of categories) {
      const categoryWithId: Category = {
        ...category,
        id: uuidv4()
      };
      await addCategoryToFirestore(categoryWithId);
      console.log(`Added category: ${category.name}`);
    }
    console.log('All categories added successfully');
  } catch (error) {
    console.error('Error adding categories:', error);
  }
};

// Execute if this file is run directly
if (require.main === module) {
  addCategories();
}
