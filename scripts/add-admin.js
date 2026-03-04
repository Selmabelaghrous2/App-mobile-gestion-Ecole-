const { createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc } = require('firebase/firestore');
const { auth, db } = require('../src/config/firebase');

async function createAdmin() {
  try {
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const role = 'admin';

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), { email, role });

    console.log('Admin user created successfully:', user.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin();