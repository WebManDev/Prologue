import * as admin from 'firebase-admin';
import serviceAccount from '../prologue-16d46-firebase-adminsdk-fbsvc-37f79df5f5.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth(); 