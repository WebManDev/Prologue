import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { coachId, type, message } = req.body
  if (!coachId || !type || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    await adminDb
      .collection('coaches')
      .doc(coachId)
      .collection('notifications')
      .add({
        type,
        message,
        createdAt: new Date(),
        read: false,
      })
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
} 