import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

interface Tag {
  id: string;
  name: string;
  categoryId?: string;
}

const addTags = async () => {
  try {
    // Get existing tags to avoid duplicates
    const tagsSnapshot = await db.collection('tags').get();
    const existingTags = new Set(
      tagsSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        return data.name.toLowerCase();
      })
    );

    // Define new tags
    const newTags = [
      "M&S",
      "Morrisons",
      "Amazon Fresh",
      "Amazon",
      "Waitrose",
      "Thames Water",
      "Muscle Foods",
      "Temu",
      "Tesco",
      "Lidl",
      "Aldi",
      "Deliveroo",
      "Uber",
      "Uber Eats",
      "Well Easy",
      "Holland & Barrett",
      "National Express",
      "Market",
      "Macro Food Centre",
      "Ryanair",
      "Iceland",
      "Sainsburys",
      "Virgin Media"
    ];

    // Add tags
    for (const tagName of newTags) {
      const normalizedName = tagName.toLowerCase();
      if (!existingTags.has(normalizedName)) {
        const newTag: Tag = {
          id: uuidv4(),
          name: tagName
        };
        await db.collection('tags').doc(newTag.id).set(newTag);
        console.log(`Added tag: ${tagName}`);
      } else {
        console.log(`Tag already exists: ${tagName}`);
      }
    }

    console.log('Tags setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error adding tags:', error);
    process.exit(1);
  }
};

addTags();
