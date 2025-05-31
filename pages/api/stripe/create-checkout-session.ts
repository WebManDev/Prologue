import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe('sk_test_51RTKV905oLGlYeZ0j3Dl8jKIYNYIFU1kuNMLZhvXECRhTVNIqdAHQTe5Dq5AEZ0eVMI7HRyopowo34ZAtFWp8V9H00pznHlYqu', {
  apiVersion: '2025-05-28.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount, userId, coachId, feedbackType } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Video Feedback (${feedbackType})`,
              metadata: { userId, coachId, feedbackType },
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/member-messaging?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/member-messaging?canceled=1`,
      metadata: { userId, coachId, feedbackType },
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
} 