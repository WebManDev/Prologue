import * as admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Try to use environment variables first
    const projectId = process.env.FIREBASE_PROJECT_ID || "prologue-16d46";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@prologue-16d46.iam.gserviceaccount.com";
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCwW+oer326vsoi\n3/KCYaHzr4sUpNdgNlnED0OGLNfk2Yu3YlqEMnwSQqFnpPY+4UmCnW9uATDNuhOy\nHafwy0V7B0Yb49ZEghh+qF7VieikrYKfXDpG1ZOYdPfxYBU+Zux35C223HgYS3fS\n6mvNgkb/zZyFSNW+6JDEkvhyixZZJG7WHWkKZqC+Ff+a2mD9GYGqVnldoCd2+jGI\nMB1F+ZY1Htrygf+KnmpBHPVjQFdkIwfFTDRWrXPYFELc/8QbBtbKtQdhd1r1Unpy\na6iQARaDIVt/pZsnL6F/4CIaVU556jGVisG1Y8lSRf0iVtEZZ8qgc48kTrAiBZpX\nFCStT1qLAgMBAAECggEAHdmI0GXKpZOKWgnGnavRwhGpvDZEX/wDCIy+1JR9fDYY\nEFN815hF6L9PW2AP78eo7gsgo6Fe9cszbzfWx4pYOcEa7DiNeS394F42IvWDI3Bc\nxgVRtdCLeUf++WNWZSf9iTNdS3CYgSAw6UmVMoUE6GIQRnzz9Kqfai4oEBcbkr2w\nAUtj8PTx5m1Z1DiGMdME7hSz+BFED1eavpdiUW9i7xERjETc9oK20Op62LOA/XrN\n+ZlWrvhGAbeFE+Kq+7RNTyS9Y5TZ9r1ooof6TKFEgdiWvQnPwOTgpWfSqrgw9WNi\nLNlC8Oj9cWxhxRRmKg8Y2u43yPj++XF9vUdAGQjrEQKBgQDuKSjf0R2OnjAJdfa2\n1uWU/ctXAaz/PuT1MZXi6L42l/8vejyBIzazzsx3ADt9upxLnYRrtP/9EhALsA1e\n1rBmgIZeTBvk8wkr6GtOnPI0P75Awvdk+oK/vovDKESpyx6ftQnq2FTtxWhwpVsR\nDXAgegOKZGoEsgPxToQ7xe7KmwKBgQC9ka28n5t3BBI4b5Y28a6ydK20c87IPnXd\nMSeEgjALfj6RyXnL0v5lsPpJ8qn5Puhb1r53B6PdIKhDa8XYYuAr93ecgnqpip1r\neyjBJKcSqBO8KGMwDc35yPsZ2NrXw/wsCXsb7xh5KAnvpYRkreeC9kJaOoDvvX5u\nSsN1dTH20QKBgA/9U3EzaPiaRj9cXCQKaX+HSo+c3TCF2HldyuJhHeQscEWPv2As\nLRAFYlTa/yOB09x/xtQ0Yrtq6wjd2Qf1AgLfviW2lmjYqFT6VboBb4FyhiNy84kk\nCIM3F8sSeQmtSXEPhort20XbaxelAmgyrsR/bJ1uAHAwQ3OAAgDBWTbhAoGAWGwg\nFtB36p7KhOp/raczrmfAMmCmPj7sKT1pSmSTVnkPZF8O4aTMJtDTHjUDVZAjP9s9\nwjWdGGLIOZKGmTUdjUSD1UwDPRu768tpqhWXnJsrgWNxSJPX1MALZ/X/tg7jjALs\nGo5+4txrLg4NYAzB5RNKxd1uEOVZmMZkv1/n61ECgYBWMaF1S2+vUFjCn1o/RCBh\nDTwOjVDQUhC4NhSzdVfmWIZ3jVCl/ce9yN5PuZ6ne1xEhCOrts8IwYr2NgluWxdu\n3hwNM1DYYVRhTzsEI79LKZX6qhPdqiBHljtSQ7FLQisCA/evVWIa/m/E+3Jdlz9W\n+YLhkvCI1Uum3MGCyNEctg==\n-----END PRIVATE KEY-----\n";

    // Format the private key properly (replace \\n with actual newlines)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey
    };

    console.log('Initializing Firebase Admin with project:', projectId);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw new Error(`Firebase Admin initialization failed: ${error?.message || 'Unknown error'}`);
  }
} else {
  console.log('Firebase Admin already initialized');
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth(); 