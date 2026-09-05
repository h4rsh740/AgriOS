// ============================================================
// AgriOS — Firebase Client Configuration
// Only uses NEXT_PUBLIC_ env vars — safe for browser.
// Initializes lazily to prevent SSR/build-time crashes when
// Firebase is not configured (e.g., demo mode, CI builds).
// ============================================================
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const isFirebaseConfigured =
  typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'string' &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length > 10;

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  // Prevent duplicate initialization in Next.js dev mode
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  _auth = getAuth(app);
  _db = getFirestore(app);
  _storage = getStorage(app);
}

export { isFirebaseConfigured };
export const auth = _auth;
export const db = _db;
export const storage = _storage;
export default app;
