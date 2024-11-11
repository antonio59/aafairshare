import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

interface CategoryGroup {
  id: string;
  name: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  groupId: string;
  color: string;
}

const addCategories = async () => {
  try {
    // Get all category groups
    const groupsSnapshot = await db.collection('categoryGroups').get();
    const groups = new Map<string, string>(); // Map group name to ID
    groupsSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as CategoryGroup;
      groups.set(data.name, data.id);
    });

    // Get existing categories to avoid duplicates
    const categoriesSnapshot = await db.collection('categories').get();
    const existingCategories = new Set(
      categoriesSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        return `${data.groupId}-${data.name}`;
      })
    );

    // Define categories by group
    const categoriesByGroup = {
      'Clothing': [
        { name: 'Alterations', color: '#E91E63' },
        { name: 'Clothing Purchases', color: '#C2185B' },
        { name: 'Dry Cleaning', color: '#880E4F' }
      ],
      'Entertainment': [
        { name: 'Concerts/Events', color: '#F44336' },
        { name: 'Hobbies', color: '#E53935' },
        { name: 'Holiday', color: '#D32F2F' },
        { name: 'Movies', color: '#C62828' },
        { name: 'Other Entertainment', color: '#B71C1C' },
        { name: 'Streaming Services', color: '#D50000' }
      ],
      'Food': [
        { name: 'Dining Out', color: '#4CAF50' },
        { name: 'Food Subscriptions', color: '#388E3C' },
        { name: 'Groceries', color: '#2E7D32' },
        { name: 'Takeout/Delivery', color: '#1B5E20' }
      ],
      'Health and Wellness': [
        { name: 'Health Supplements', color: '#009688' }
      ],
      'Housing': [
        { name: 'Furniture/Appliances', color: '#6D4C41' },
        { name: 'House Maintenance/Repairs', color: '#5D4037' },
        { name: 'Rent', color: '#4E342E' }
      ],
      'Insurance': [
        { name: 'Health Insurance', color: '#9C27B0' },
        { name: 'Home Insurance', color: '#7B1FA2' },
        { name: 'Life Insurance', color: '#6A1B9A' },
        { name: 'Travel Insurance', color: '#4A148C' }
      ],
      'Miscellaneous': [
        { name: 'Donations', color: '#9E9E9E' },
        { name: 'Gifts', color: '#757575' },
        { name: 'Other', color: '#616161' }
      ],
      'Transportation': [
        { name: 'Flights', color: '#FF9800' },
        { name: 'Gasoline', color: '#F57C00' },
        { name: 'Public Transportation', color: '#EF6C00' },
        { name: 'Ride-hailing Services', color: '#E65100' }
      ]
    };

    // Add categories
    for (const [groupName, categories] of Object.entries(categoriesByGroup)) {
      const groupId = groups.get(groupName);
      if (!groupId) {
        console.log(`Group not found: ${groupName}`);
        continue;
      }

      for (const category of categories) {
        const categoryKey = `${groupId}-${category.name}`;
        if (!existingCategories.has(categoryKey)) {
          const newCategory: Category = {
            id: uuidv4(),
            name: category.name,
            groupId: groupId,
            color: category.color
          };
          await db.collection('categories').doc(newCategory.id).set(newCategory);
          console.log(`Added category: ${category.name} to group: ${groupName}`);
        } else {
          console.log(`Category already exists: ${category.name} in group: ${groupName}`);
        }
      }
    }

    console.log('Categories setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error adding categories:', error);
    process.exit(1);
  }
};

addCategories();
