import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
}

const relevantEvents = new Set([
  'customer.subscription.deleted',
  'customer.subscription.updated',
])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed')
  }

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (relevantEvents.has(event.type)) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer;
    const stripeSubscriptionId = subscription.id;
    const status = subscription.status;
    const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    let shouldDeactivate = false;
    if (event.type === 'customer.subscription.deleted') {
      shouldDeactivate = true;
    } else if (event.type === 'customer.subscription.updated') {
      // Deactivate if cancel_at_period_end is true or status is not 'active'
      if (cancelAtPeriodEnd || status !== 'active') {
        shouldDeactivate = true;
      }
    }
    if (shouldDeactivate) {
      try {
        // Find the member by stripeCustomerId
        const memberSnap = await adminDb.collection('members').where('stripeCustomerId', '==', customerId).get()
        if (memberSnap.empty) {
          console.warn('No matching member found for customerId', customerId)
        } else {
          const memberDoc = memberSnap.docs[0]
          const memberData = memberDoc.data()
          let subscriptions = memberData.subscriptions || {}
          let athleteIdToRemove: string | null = null
          // Find the athlete subscription to deactivate
          for (const [athleteId, sub] of Object.entries(subscriptions) as [string, any][]) {
            if (sub.stripeSubscriptionId === stripeSubscriptionId) {
              athleteIdToRemove = athleteId;
              break;
            }
          }
          if (athleteIdToRemove) {
            // Explicitly update only the relevant subscription fields
            await memberDoc.ref.update({
              [`subscriptions.${athleteIdToRemove}.status`]: 'inactive',
              [`subscriptions.${athleteIdToRemove}.cancelAt`]: cancelAt,
            });
            // Optionally update activeAthletes/trainingAthletes arrays
            let memberUpdate: any = {};
            if (Array.isArray(memberData.activeAthletes)) {
              memberUpdate.activeAthletes = memberData.activeAthletes.filter((id: string) => id !== athleteIdToRemove)
            }
            if (Array.isArray(memberData.trainingAthletes)) {
              memberUpdate.trainingAthletes = memberData.trainingAthletes.filter((id: string) => id !== athleteIdToRemove)
            }
            if (Object.keys(memberUpdate).length > 0) {
              await memberDoc.ref.update(memberUpdate);
            }
          }
        }
      } catch (err) {
        console.error('Error updating subscription status and cleaning up:', err)
        return res.status(500).send('Webhook handler failed')
      }
    }
  }
  res.status(200).json({ received: true })
} 