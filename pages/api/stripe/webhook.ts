import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string
  let event

  try {
    // Read the raw body for Stripe signature verification
    const chunks: Uint8Array[] = []
    for await (const chunk of req) chunks.push(chunk)
    const rawBody = Buffer.concat(chunks).toString('utf8')

    // Hardcoded webhook secret for local testing
    const webhookSecret = 'whsec_jiIdxrQtMO0UodKBrP58gKRvnXJRazAJ'

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    )
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const athleteId = subscription.metadata.athleteId

        if (!athleteId) {
          console.error('No athleteId found in subscription metadata')
          return res.status(400).json({ error: 'No athleteId found' })
        }

        // Decrement the athlete's subscriber count
        await adminDb.collection('athletes').doc(athleteId).update({
          subscribers: FieldValue.increment(-1)
        })

        console.log(`Decremented subscriber count for athlete ${athleteId}`)
        break
      }
      // Add other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: error.message })
  }
} 