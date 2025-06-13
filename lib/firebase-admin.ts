import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "prologue-16d46",
      clientEmail: "firebase-adminsdk-xxxxx@prologue-16d46.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9QFi67K6ZQZxX\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
    }),
    databaseURL: "https://prologue-16d46.firebaseio.com"
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth(); 