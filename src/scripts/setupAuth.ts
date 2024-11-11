import { getAuth, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import app from '../firebase';

const auth = getAuth(app);

// Only store email addresses, no passwords
const userEmails = [
  'andypamo@gmail.com',
  'antoniojsmith@protonmail.com'
];

const setupAuth = async () => {
  for (const email of userEmails) {
    try {
      // Send password reset email to allow secure password setup
      await sendPasswordResetEmail(auth, email);
      console.log(`Password reset email sent to: ${email}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User not found: ${email}. Please ensure the user is created in Firebase Console.`);
      } else {
        console.error(`Error processing ${email}:`, error);
      }
    }
  }
};

// Function to reset all user passwords
const resetAllPasswords = async () => {
  for (const email of userEmails) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      console.error(`Failed to send reset email to ${email}:`, error);
    }
  }
};

// Only run when explicitly requested
const command = process.argv[2];

if (command === '--reset-all') {
  resetAllPasswords().then(() => {
    console.log('Password reset emails sent to all users');
    process.exit(0);
  }).catch((error) => {
    console.error('Failed to reset passwords:', error);
    process.exit(1);
  });
} else {
  console.log('Available commands:');
  console.log('  --reset-all : Send password reset emails to all users');
  process.exit(0);
}
