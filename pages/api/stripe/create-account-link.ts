import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { account } = req.body

    if (!account) {
      return res.status(400).json({ error: 'Missing account ID' })
    }

    // Ensure we're using HTTPS URLs for live mode
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prologuehq.com'
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account,
      refresh_url: `${baseUrl}/athlete-settings?refresh=true`,
      return_url: `${baseUrl}/athlete-settings?success=true`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    })

    res.status(200).json({ 
      success: true,
      url: accountLink.url,
      message: 'Account link created successfully'
    })
  } catch (error: any) {
    console.error('Error creating account link:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create account link' 
    })
  }
} 