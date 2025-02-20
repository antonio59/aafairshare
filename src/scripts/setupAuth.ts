import { supabase } from '../supabase';

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
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.tempPassword,
          options: {
            data: {
              role: user.role
            }
          }
        });

        if (error) {
          console.error(`Error creating user ${user.email}:`, error);
          continue;
        }

        console.log(`Created new user: ${user.email} with ID: ${data.user?.id}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email);
      if (resetError) {
        console.error(`Error sending reset email to ${user.email}:`, resetError);
      } else {
        console.log(`Password reset email sent to: ${user.email}`);
      }
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
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) {
        throw error;
      }
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
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.tempPassword
      });
      if (error) {
        throw error;
      }
      console.log(`Successfully verified access for: ${user.email}`);
      await supabase.auth.signOut();
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
