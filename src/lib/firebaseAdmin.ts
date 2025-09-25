import admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
const hasFirebaseAdmin = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    privateKey,
);

let adminDb: FirebaseFirestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

if (hasFirebaseAdmin) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey!,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  }
  adminDb = admin.firestore();
  adminAuth = admin.auth();
}

export { adminDb, adminAuth, hasFirebaseAdmin };
