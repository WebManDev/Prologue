import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { athleteId, amount, description } = req.body

    // Validate required fields
    if (!athleteId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get athlete's bank account info from Firestore
    const athleteDoc = await adminDb.collection('athletes').doc(athleteId).get()
    if (!athleteDoc.exists) {
      return res.status(404).json({ error: 'Athlete not found' })
    }

    const athleteData = athleteDoc.data()
    const bankAccountId = athleteData?.bankAccountId

    if (!bankAccountId) {
      return res.status(400).json({ error: 'Athlete has no bank account set up' })
    }

    // Create the payout
    const payout = await stripe.payouts.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: bankAccountId,
      description: description || `Payout to ${athleteData?.name || 'athlete'}`,
      metadata: {
        athleteId,
      },
    })

    // Update athlete's payout history in Firestore
    await adminDb.collection('athletes').doc(athleteId).collection('payouts').add({
      payoutId: payout.id,
      amount,
      status: payout.status,
      createdAt: new Date().toISOString(),
      description,
    })

    res.status(200).json({ 
      payoutId: payout.id,
      status: payout.status
    })
  } catch (error: any) {
    console.error('Error creating payout:', error)
    res.status(500).json({ error: error.message || 'Failed to create payout' })
  }
} 