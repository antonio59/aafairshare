import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const addCategoryGroups = async () => {
  const groups = [
    {
      id: uuidv4(),
      name: "Clothing",
      order: 0
    },
    {
      id: uuidv4(),
      name: "Entertainment",
      order: 1
    },
    {
      id: uuidv4(),
      name: "Food",
      order: 2
    },
    {
      id: uuidv4(),
      name: "Health and Wellness",
      order: 3
    },
    {
      id: uuidv4(),
      name: "Housing",
      order: 4
    },
    {
      id: uuidv4(),
      name: "Insurance",
      order: 5
    },
    {
      id: uuidv4(),
      name: "Miscellaneous",
      order: 6
    },
    {
      id: uuidv4(),
      name: "Transportation",
      order: 7
    },
    {
      id: uuidv4(),
      name: "Utilities",
      order: 8
    }
  ];

  try {
    // Get existing groups to avoid duplicates
    const snapshot = await db.collection('categoryGroups').get();
    const existingGroups = new Set(
      snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data().name)
    );

    // Only add groups that don't already exist
    for (const group of groups) {
      if (!existingGroups.has(group.name)) {
        await db.collection('categoryGroups').doc(group.id).set(group);
        console.log('Added group:', group.name);
      } else {
        console.log('Group already exists:', group.name);
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
