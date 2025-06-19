import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { courseId, courseTitle, coursePrice, userId } = req.body

    if (!courseId || !courseTitle || !coursePrice || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: courseTitle,
              description: `Course purchase: ${courseTitle}`,
            },
            unit_amount: Math.round(coursePrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/member/dashboard?success=true&courseId=${courseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/member/dashboard?canceled=true`,
      metadata: {
        courseId,
        userId,
        type: 'course_purchase',
      },
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
} 