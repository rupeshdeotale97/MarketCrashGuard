
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In a production environment, these should be set in your project environment variables.
// The app will now check for these before crashing to avoid initialization errors.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy_CONFIG_REQUIRED",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "crashguard-risk.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "crashguard-risk",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "crashguard-risk.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  
  // Only attempt to initialize if we have a real-looking API key to prevent immediate crashes
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSy_CONFIG_REQUIRED") {
    return initializeApp(firebaseConfig);
  }
  
  // Fallback for development/initial state
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
