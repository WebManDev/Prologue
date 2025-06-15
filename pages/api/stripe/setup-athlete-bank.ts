import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { athleteId, accountNumber, routingNumber, accountHolderName } = req.body

    // Validate required fields
    if (!athleteId || !accountNumber || !routingNumber || !accountHolderName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get athlete from Firestore
    const athleteDoc = await adminDb.collection('athletes').doc(athleteId).get()
    if (!athleteDoc.exists) {
      return res.status(404).json({ error: 'Athlete not found' })
    }

    // Create a bank account token
    const bankAccount = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: 'individual',
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    })

    // Create a bank account in your Stripe account
    const bankAccountObj = await stripe.accounts.createExternalAccount(
      process.env.STRIPE_ACCOUNT_ID!, // Your platform's Stripe account ID
      {
        external_account: bankAccount.id,
      }
    )

    // Update athlete's document with bank account ID
    await adminDb.collection('athletes').doc(athleteId).update({
      bankAccountId: bankAccountObj.id,
      bankAccountLast4: accountNumber.slice(-4),
      bankAccountStatus: 'active',
      updatedAt: new Date().toISOString(),
    })

    res.status(200).json({ 
      bankAccountId: bankAccountObj.id,
      last4: accountNumber.slice(-4)
    })
  } catch (error: any) {
    console.error('Error setting up bank account:', error)
    res.status(500).json({ error: error.message || 'Failed to set up bank account' })
  }
} 