import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase-admin.js';

const addCategoryGroups = async () => {
  try {
    // Get existing groups to avoid duplicates
    const groupsSnapshot = await db.collection('categoryGroups').get();
    const existingGroups = new Set(
      groupsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return data.name.toLowerCase();
      })
    );

    // Define groups with their order
    const groups = [
      { name: 'Clothing', order: 0 },
      { name: 'Entertainment', order: 1 },
      { name: 'Food', order: 2 },
      { name: 'Health and Wellness', order: 3 },
      { name: 'Housing', order: 4 },
      { name: 'Insurance', order: 5 },
      { name: 'Miscellaneous', order: 6 },
      { name: 'Transportation', order: 7 },
      { name: 'Utilities', order: 8 }
    ];

    // Add groups
    for (const group of groups) {
      const normalizedName = group.name.toLowerCase();
      if (!existingGroups.has(normalizedName)) {
        const newGroup = {
          id: uuidv4(),
          name: group.name,
          order: group.order,
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await db.collection('categoryGroups').doc(newGroup.id).set(newGroup);
        console.log(`Added category group: ${group.name}`);
      } else {
        console.log(`Category group already exists: ${group.name}`);
      }
    }

    console.log('Category groups setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error adding category groups:', error);
    process.exit(1);
  }
};

addCategoryGroups();
