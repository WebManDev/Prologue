import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminAuth } from '@/lib/firebase-admin'

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

    // Get athlete data from the request body
    const { email, firstName, lastName, country = 'US' } = req.body

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: country,
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        product_description: 'Athletic coaching and training content subscriptions',
      },
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
      },
    })

    res.status(200).json({ 
      success: true,
      account: account.id,
      message: 'Stripe Connect account created successfully'
    })
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create Stripe Connect account' 
    })
  }
} 