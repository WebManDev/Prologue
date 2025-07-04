import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { accountId } = req.body

    if (!accountId) {
      return res.status(400).json({ error: 'Missing account ID' })
    }

    // Create login link for existing accounts
    const loginLink = await stripe.accounts.createLoginLink(accountId)

    res.status(200).json({ 
      success: true,
      loginUrl: loginLink.url,
      message: 'Login link created successfully'
    })
  } catch (error: any) {
    console.error('Error creating login link:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create login link' 
    })
  }
} 