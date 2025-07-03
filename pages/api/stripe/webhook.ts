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
      case 'customer.subscription.created': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const athleteId = subscription.metadata?.athleteId
        const plan = subscription.metadata?.plan || 'basic'

        if (!athleteId) {
          console.error('No athleteId found in subscription metadata')
          return res.status(400).json({ error: 'No athleteId found' })
        }

        // Get customer details to find the member
        const customer = await stripe.customers.retrieve(customerId)
        const memberEmail = customer.email

        if (!memberEmail) {
          console.error('No email found for customer')
          return res.status(400).json({ error: 'No email found for customer' })
        }

        // Find the member by email
        const membersSnapshot = await adminDb.collection('members')
          .where('email', '==', memberEmail)
          .limit(1)
          .get()

        if (!membersSnapshot.empty) {
          const memberDoc = membersSnapshot.docs[0]
          const memberId = memberDoc.id

          // Update member's subscriptions
          await adminDb.collection('members').doc(memberId).update({
            [`subscriptions.${athleteId}`]: {
              status: "active",
              plan: plan,
              subscriptionId: subscription.id,
              createdAt: new Date().toISOString(),
              lastPaymentDate: new Date().toISOString(),
            }
          })

          // Increment the athlete's subscriber count
          await adminDb.collection('athletes').doc(athleteId).update({
            subscribers: FieldValue.increment(1)
          })

          console.log(`Subscription created: Member ${memberId} subscribed to athlete ${athleteId}`)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const athleteId = subscription.metadata?.athleteId
        const status = subscription.status

        if (!athleteId) {
          console.error('No athleteId found in subscription metadata')
          return res.status(400).json({ error: 'No athleteId found' })
        }

        // Get customer details to find the member
        const customer = await stripe.customers.retrieve(customerId)
        const memberEmail = customer.email

        if (!memberEmail) {
          console.error('No email found for customer')
          return res.status(400).json({ error: 'No email found for customer' })
        }

        // Find the member by email
        const membersSnapshot = await adminDb.collection('members')
          .where('email', '==', memberEmail)
          .limit(1)
          .get()

        if (!membersSnapshot.empty) {
          const memberDoc = membersSnapshot.docs[0]
          const memberId = memberDoc.id

          // Update member's subscription status
          await adminDb.collection('members').doc(memberId).update({
            [`subscriptions.${athleteId}.status`]: status,
            [`subscriptions.${athleteId}.updatedAt`]: new Date().toISOString(),
          })

          console.log(`Subscription updated: Member ${memberId} subscription to athlete ${athleteId} is now ${status}`)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const athleteId = subscription.metadata?.athleteId

        if (!athleteId) {
          console.error('No athleteId found in subscription metadata')
          return res.status(400).json({ error: 'No athleteId found' })
        }

        // Get customer details to find the member
        const customer = await stripe.customers.retrieve(customerId)
        const memberEmail = customer.email

        if (!memberEmail) {
          console.error('No email found for customer')
          return res.status(400).json({ error: 'No email found for customer' })
        }

        // Find the member by email
        const membersSnapshot = await adminDb.collection('members')
          .where('email', '==', memberEmail)
          .limit(1)
          .get()

        if (!membersSnapshot.empty) {
          const memberDoc = membersSnapshot.docs[0]
          const memberId = memberDoc.id

          // Update member's subscription status to cancelled
          await adminDb.collection('members').doc(memberId).update({
            [`subscriptions.${athleteId}.status`]: "cancelled",
            [`subscriptions.${athleteId}.cancelledAt`]: new Date().toISOString(),
          })

          // Decrement the athlete's subscriber count
          await adminDb.collection('athletes').doc(athleteId).update({
            subscribers: FieldValue.increment(-1)
          })

          console.log(`Subscription cancelled: Member ${memberId} unsubscribed from athlete ${athleteId}`)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription as string
        const customerId = invoice.customer as string

        if (subscriptionId) {
          // Get the subscription to find athleteId
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const athleteId = subscription.metadata?.athleteId

          if (athleteId) {
            // Get customer details to find the member
            const customer = await stripe.customers.retrieve(customerId)
            const memberEmail = customer.email

            if (memberEmail) {
              // Find the member by email
              const membersSnapshot = await adminDb.collection('members')
                .where('email', '==', memberEmail)
                .limit(1)
                .get()

              if (!membersSnapshot.empty) {
                const memberDoc = membersSnapshot.docs[0]
                const memberId = memberDoc.id

                // Update last payment date
                await adminDb.collection('members').doc(memberId).update({
                  [`subscriptions.${athleteId}.lastPaymentDate`]: new Date().toISOString(),
                  [`subscriptions.${athleteId}.status`]: "active",
                })

                console.log(`Payment succeeded: Updated payment date for member ${memberId} subscription to athlete ${athleteId}`)
              }
            }
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription as string
        const customerId = invoice.customer as string

        if (subscriptionId) {
          // Get the subscription to find athleteId
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const athleteId = subscription.metadata?.athleteId

          if (athleteId) {
            // Get customer details to find the member
            const customer = await stripe.customers.retrieve(customerId)
            const memberEmail = customer.email

            if (memberEmail) {
              // Find the member by email
              const membersSnapshot = await adminDb.collection('members')
                .where('email', '==', memberEmail)
                .limit(1)
                .get()

              if (!membersSnapshot.empty) {
                const memberDoc = membersSnapshot.docs[0]
                const memberId = memberDoc.id

                // Update subscription status to past_due
                await adminDb.collection('members').doc(memberId).update({
                  [`subscriptions.${athleteId}.status`]: "past_due",
                  [`subscriptions.${athleteId}.lastPaymentFailed`]: new Date().toISOString(),
                })

                console.log(`Payment failed: Updated status for member ${memberId} subscription to athlete ${athleteId}`)
              }
            }
          }
        }

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