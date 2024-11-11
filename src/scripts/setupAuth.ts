import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
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

// Only run this script when explicitly needed
if (process.argv.includes('--send-reset')) {
  setupAuth().then(() => {
    console.log('Password reset emails sent');
    process.exit(0);
  }).catch((error) => {
    console.error('Failed to send reset emails:', error);
    process.exit(1);
  });
} else {
  console.log('Please run with --send-reset flag to send password reset emails');
  process.exit(0);
}
