import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyA8ewziHYNN4U7c1UFZYCRkRhgxCfyyVMw',
  authDomain: 'ketolifebahrain.firebaseapp.com',
  projectId: 'ketolifebahrain',
  storageBucket: 'ketolifebahrain.firebasestorage.app',
  messagingSenderId: '632690698675',
  appId: '1:632690698675:web:68b053c9649d1495a2c3c6',
  measurementId: 'G-RQTR037P57',
};

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export let firebaseAnalytics: Analytics | null = null;

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (supported) {
      firebaseAnalytics = getAnalytics(firebaseApp);
      return firebaseAnalytics;
    }
  } catch {
    // Ignore analytics errors in restricted browsers or ad-blocked contexts
  }
  return null;
}
