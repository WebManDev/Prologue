import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import Stripe from 'stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { memberEmail, memberName, plan, paymentMethodId, userId, athleteId } = req.body

    // Validate required fields
    if (!memberEmail || !memberName || !plan || !paymentMethodId || !athleteId) {
      console.error('Missing required fields:', { memberEmail, memberName, plan, paymentMethodId, athleteId })
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!['basic', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' })
    }

    // Get athlete's pricing from Firestore
    const athleteDoc = await adminDb.collection('athletes').doc(athleteId).get()
    if (!athleteDoc.exists) {
      return res.status(404).json({ error: 'Athlete not found' })
    }

    const athleteData = athleteDoc.data()
    const price = athleteData?.pricing?.[plan] ?? 9.99 // Default to 9.99 if price not found

    // Create or get customer
    let customer
    const customers = await stripe.customers.list({
      email: memberEmail,
      limit: 1
    })

    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: memberEmail,
        name: memberName
      })
    }

    // Always update the member's Firestore document with the Stripe customer ID if userId is provided
    if (userId) {
      const memberRef = adminDb.collection('members').doc(userId);
      const memberSnap = await memberRef.get();
      if (memberSnap.exists) {
        await memberRef.update({ stripeCustomerId: customer.id });
      } else {
        await memberRef.set({
          name: memberName,
          email: memberEmail,
          stripeCustomerId: customer.id,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create a price for the subscription
    const priceObj = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
      },
    })

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceObj.id }],
      metadata: {
        plan,
        athleteId
      },
      default_payment_method: paymentMethodId,
    })

    res.status(200).json({ 
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice as string
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    res.status(500).json({ error: error.message || 'Failed to create subscription' })
  }
} 