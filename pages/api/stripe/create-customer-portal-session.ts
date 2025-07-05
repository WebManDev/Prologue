import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customerId } = req.body
    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXT_PUBLIC_BASE_URL + '/member-dashboard',
    })
    res.json({ url: session.url })
  } catch (error: any) {
    console.error('Customer portal error:', error)
    res.status(500).json({ error: error.message || 'Failed to create portal session' })
  }
} 