import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const athleteId = decodedToken.uid

    // Get the athlete's Stripe account ID
    const athleteDoc = await adminDb.collection('athletes').doc(athleteId).get()
    if (!athleteDoc.exists) {
      return res.status(404).json({ error: 'Athlete not found' })
    }

    const athleteData = athleteDoc.data()
    const stripeAccountId = athleteData?.stripeAccountId

    if (!stripeAccountId) {
      return res.status(400).json({ error: 'No Stripe account found for this athlete' })
    }

    // Update the account's business profile
    const updatedAccount = await stripe.accounts.update(stripeAccountId, {
      business_profile: {
        name: 'Prologue',
        url: 'https://prologuehq.com',
        product_description: 'Athletic coaching and training content subscriptions',
        mcc: '7997',
      },
    })

    res.status(200).json({ 
      success: true,
      account: updatedAccount,
      message: 'Account branding updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating account branding:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to update account branding' 
    })
  }
} 