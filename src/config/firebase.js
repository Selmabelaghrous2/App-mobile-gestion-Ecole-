import { initializeApp } from 'firebase/app';
// Import persistence helper from the react-native-specific path (Firebase v9+)
import { initializeAuth, getAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqsTSmQFUtIYA3TqZ9W--YbRUTejhtR9s",
  authDomain: "schoolapp-40d85.firebaseapp.com",
  projectId: "schoolapp-40d85",
  storageBucket: "schoolapp-40d85.firebasestorage.app",
  messagingSenderId: "499904821468",
  appId: "1:499904821468:web:ae613b94e534f26fd2dc19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
// Use try-catch to handle cases where auth might already be initialized
let auth;
try {
  console.log('Firebase: Initializing auth...');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('Firebase: Auth initialized successfully');
} catch (error) {
  console.log('Firebase: Auth initialization error:', error.code);
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    console.log('Firebase: Auth already initialized, getting existing instance');
    auth = getAuth(app);
  } else {
    console.error('Firebase: Auth initialization failed:', error);
    // Still try to get auth instance as fallback
    try {
      auth = getAuth(app);
      console.log('Firebase: Using fallback auth instance');
    } catch (fallbackError) {
      console.error('Firebase: Fallback auth also failed:', fallbackError);
      throw error;
    }
  }
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export { auth };
export default app;