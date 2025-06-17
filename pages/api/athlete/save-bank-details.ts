import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
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

    const { accountHolderName, accountNumber, routingNumber, accountType } = req.body

    // Create a bank account token
    const bankAccountToken = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: 'individual',
        routing_number: routingNumber,
        account_number: accountNumber,
        account_type: accountType,
      },
    })

    // Create a bank account in your Stripe account
    const bankAccount = await stripe.accounts.createExternalAccount(
      'acct_your_platform_account_id', // Your platform's Stripe account ID
      {
        external_account: bankAccountToken.id,
      }
    )

    // Save the bank account ID to the athlete's document
    await adminDb.collection('athletes').doc(athleteId).update({
      bankAccountId: bankAccount.id,
      bankAccountLast4: bankAccount.last4,
      bankAccountHolderName: accountHolderName,
      bankAccountType: accountType,
      bankAccountVerified: false, // Will be updated when verified
    })

    res.status(200).json({ 
      success: true,
      message: 'Bank account details saved successfully'
    })
  } catch (error: any) {
    console.error('Error saving bank details:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to save bank details'
    })
  }
} 