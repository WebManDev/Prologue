import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const athleteId = decodedToken.uid;

    // Fetch the athlete document
    const docRef = adminDb.collection('athletes').doc(athleteId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    const athleteData = docSnap.data();
    if (!athleteData) {
      return res.status(404).json({ error: 'Athlete data missing' });
    }

    // Return relevant fields (add more as needed)
    res.status(200).json({
      stripeAccountId: athleteData.stripeAccountId || null,
      name: athleteData.name || '',
      email: athleteData.email || '',
      ...athleteData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch athlete profile' });
  }
} 