import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'Missing userId' })

    // Get the member's Stripe customer ID from Firestore
    const memberDoc = await adminDb.collection('members').doc(userId).get()
    const customerId = memberDoc.data()?.stripeCustomerId
    if (!customerId) return res.status(404).json({ error: 'Stripe customer not found' })

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin}/account`, // Change to your return page
    })

    res.status(200).json({ url: session.url })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create portal session' })
  }
} 