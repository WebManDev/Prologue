import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, amount, description } = req.body
    if (!userId || !amount || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/promote?success=true`,
      cancel_url: `${req.headers.origin}/promote?canceled=true`,
      metadata: {
        userId,
        description,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout session error:', error)
    res.status(500).json({ error: error.message || 'Failed to create checkout session' })
  }
} 