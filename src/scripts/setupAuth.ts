import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../firebase';

const auth = getAuth(app);

const users = [
  {
    email: 'andypamo@gmail.com',
    password: '1234'
  },
  {
    email: 'antoniojsmith@protonmail.com',
    password: '1234'
  }
];

const setupAuth = async () => {
  for (const user of users) {
    try {
      await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`Created user: ${user.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
  }
};

setupAuth().then(() => {
  console.log('Auth setup complete');
  process.exit(0);
}).catch((error) => {
  console.error('Auth setup failed:', error);
  process.exit(1);
});
