import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import app from '../firebase';

const auth = getAuth(app);

const users = [
  {
    email: 'andypamo@gmail.com',
    role: 'partner1'
  },
  {
    email: 'antoniojsmith@protonmail.com',
    role: 'partner2'
  }
];

const setupAuth = async () => {
  for (const user of users) {
    try {
      // Try to create the user with a temporary password
      const tempPassword = 'TempPass123!';
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, tempPassword);
        console.log(`Created user: ${user.email} with UID: ${userCredential.user.uid}`);
      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') {
          console.error(`Error creating user ${user.email}:`, error);
          continue;
        }
        console.log(`User already exists: ${user.email}`);
      }

      // Send password reset email regardless of whether user was just created or already existed
      await sendPasswordResetEmail(auth, user.email);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error);
    }
  }
};

// Function to reset all user passwords
const resetAllPasswords = async () => {
  for (const user of users) {
    try {
      await sendPasswordResetEmail(auth, user.email);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      console.error(`Failed to send reset email to ${user.email}:`, error);
    }
  }
};

// Only run when explicitly requested
const command = process.argv[2];

if (command === '--setup') {
  setupAuth().then(() => {
    console.log('Auth setup complete');
    process.exit(0);
  }).catch((error) => {
    console.error('Auth setup failed:', error);
    process.exit(1);
  });
} else if (command === '--reset-all') {
  resetAllPasswords().then(() => {
    console.log('Password reset emails sent to all users');
    process.exit(0);
  }).catch((error) => {
    console.error('Failed to reset passwords:', error);
    process.exit(1);
  });
} else {
  console.log('Available commands:');
  console.log('  --setup     : Create users and send password reset emails');
  console.log('  --reset-all : Send password reset emails to all users');
  process.exit(0);
}
