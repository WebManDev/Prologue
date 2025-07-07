import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { STRIPE_CONFIG } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, athleteId, paymentMethodId, plan, name, email } = req.body
    if (!userId || !athleteId || !paymentMethodId || !plan) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Fetch athlete's pricing and Stripe Connect account
    const athleteDoc = await adminDb.collection('athletes').doc(athleteId).get()
    if (!athleteDoc.exists) {
      return res.status(404).json({ error: 'Athlete not found' })
    }
    const athlete = athleteDoc.data()
    if (!athlete?.pricing || typeof athlete.pricing[plan] !== 'number') {
      return res.status(400).json({ error: 'Athlete pricing not set for this plan' })
    }
    if (!athlete.stripeAccountId) {
      return res.status(400).json({ error: 'Athlete is not connected to Stripe' })
    }
    const priceAmount = Math.round(athlete.pricing[plan] * 100) // in cents

    // Create or retrieve Stripe customer for the user
    let customerId = athlete.stripeCustomerId?.[userId]
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: name || '',
        email: email || '',
        metadata: { userId },
      })
      customerId = customer.id
      // Optionally, save customerId to athlete document for this user
      await adminDb.collection('athletes').doc(athleteId).update({
        [`stripeCustomerId.${userId}`]: customerId,
      })
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Create a product and price for this subscription (or reuse if you have a catalog)
    const product = await stripe.products.create({
      name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription - Athlete ${athleteId}`,
    })
    const price = await stripe.prices.create({
      unit_amount: priceAmount,
      currency: STRIPE_CONFIG.currency,
      recurring: { interval: 'month' },
      product: product.id,
    })

    // Create the subscription with application fee and transfer to athlete
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      application_fee_percent: STRIPE_CONFIG.platformFeePercentage,
      transfer_data: {
        destination: athlete.stripeAccountId,
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        athleteId,
        userId,
        plan,
      },
    })

    // Fetch the existing member document
    const memberRef = adminDb.collection('members').doc(userId);
    const memberSnap = await memberRef.get();
    const memberData = memberSnap.exists ? (memberSnap.data() || {}) : {};
    const existingSub = (memberData.subscriptions && memberData.subscriptions[athleteId]) || {};

    const updatedSub = {
      createdAt: existingSub.createdAt || new Date().toISOString(),
      plan,
      status: "active",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id
    };

    if (!memberSnap.exists) {
      await memberRef.set({
        subscriptions: {
          [athleteId]: updatedSub
        }
      });
    } else {
      await memberRef.update({
        [`subscriptions.${athleteId}`]: updatedSub
      });
    }

    res.status(200).json({ success: true, subscription })
  } catch (error: any) {
    console.error('Stripe subscription error:', error)
    res.status(500).json({ error: error.message || 'Failed to create subscription' })
  }
} 