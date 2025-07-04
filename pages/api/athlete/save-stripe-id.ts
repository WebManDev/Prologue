import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '@/lib/firebase-admin'
import { adminAuth } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const athleteId = decodedToken.uid

    const { stripeAccountId } = req.body
    if (!stripeAccountId) {
      return res.status(400).json({ error: 'Missing Stripe Account ID' })
    }

    // Save the Stripe Account ID to the athlete's document
    await adminDb.collection('athletes').doc(athleteId).update({
      stripeAccountId,
      updatedAt: new Date().toISOString(),
    })

    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save Stripe Account ID' })
  }
} 