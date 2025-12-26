import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;

function getFirebaseApp(): App {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  firebaseApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  return firebaseApp;
}

export function getDb(): Firestore {
  if (firestoreDb) {
    return firestoreDb;
  }

  getFirebaseApp();
  firestoreDb = getFirestore();
  return firestoreDb;
}
