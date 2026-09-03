// ============================================================
// AgriOS — Firebase Auth Service
// Guards against null auth when Firebase is not configured.
// ============================================================
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './client';

const googleProvider = new GoogleAuthProvider();

function requireAuth() {
  if (!auth) throw new Error('Firebase Auth is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY to .env.local.');
  return auth;
}

export async function signInWithGoogle() {
  const a = requireAuth();
  const result = await signInWithPopup(a, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const a = requireAuth();
  const result = await signInWithEmailAndPassword(a, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const a = requireAuth();
  const result = await createUserWithEmailAndPassword(a, email, password);
  await ensureUserProfile(result.user, displayName);
  return result.user;
}

export async function signOutUser() {
  const a = requireAuth();
  await signOut(a);
}

/** Returns an unsubscribe function. Returns noop if Firebase not configured. */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth || !isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

async function ensureUserProfile(user: User, displayName?: string) {
  if (!db) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || 'Farmer',
      photoURL: user.photoURL,
      country: 'India',
      language: 'en',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export { auth };
