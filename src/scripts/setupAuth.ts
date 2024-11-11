import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../firebase';

const auth = getAuth(app);

const users = [
  {
    email: 'andypamo@gmail.com',
    role: 'partner1',
    tempPassword: 'TempPass123!' // Temporary password for initial creation
  },
  {
    email: 'antoniojsmith@protonmail.com',
    role: 'partner2',
    tempPassword: 'TempPass123!' // Temporary password for initial creation
  }
];

const setupAuth = async () => {
  for (const user of users) {
    try {
      console.log(`Processing user: ${user.email}`);
      
      // Try to create the user
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.tempPassword);
        console.log(`Created new user: ${user.email} with UID: ${userCredential.user.uid}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User already exists: ${user.email}`);
          
          // Try to sign in with temp password to verify account exists and is accessible
          try {
            await signInWithEmailAndPassword(auth, user.email, user.tempPassword);
            console.log(`Successfully verified existing user: ${user.email}`);
          } catch (signInError) {
            console.log(`Could not verify existing user: ${user.email}. Will send reset email.`);
          }
        } else {
          console.error(`Error creating user ${user.email}:`, error);
          continue;
        }
      }

      // Send password reset email
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
      console.log(`Sending reset email to: ${user.email}`);
      await sendPasswordResetEmail(auth, user.email);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      console.error(`Failed to send reset email to ${user.email}:`, error);
    }
  }
};

// Function to verify user access
const verifyUsers = async () => {
  for (const user of users) {
    try {
      console.log(`Verifying access for: ${user.email}`);
      await signInWithEmailAndPassword(auth, user.email, user.tempPassword);
      console.log(`Successfully verified access for: ${user.email}`);
      await auth.signOut();
    } catch (error) {
      console.error(`Failed to verify access for ${user.email}:`, error);
    }
  }
};

const command = process.argv[2];

switch (command) {
  case '--setup':
    console.log('Setting up users and sending password reset emails...');
    setupAuth().then(() => {
      console.log('Setup complete');
      process.exit(0);
    }).catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
    break;

  case '--reset-all':
    console.log('Sending password reset emails to all users...');
    resetAllPasswords().then(() => {
      console.log('Password reset emails sent');
      process.exit(0);
    }).catch((error) => {
      console.error('Failed to reset passwords:', error);
      process.exit(1);
    });
    break;

  case '--verify':
    console.log('Verifying user access...');
    verifyUsers().then(() => {
      console.log('Verification complete');
      process.exit(0);
    }).catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
    break;

  default:
    console.log('Available commands:');
    console.log('  --setup     : Create users and send password reset emails');
    console.log('  --reset-all : Send password reset emails to all users');
    console.log('  --verify    : Verify user access');
    process.exit(0);
}
