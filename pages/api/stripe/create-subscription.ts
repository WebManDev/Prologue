import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const PLAN_PRICES = {
  basic: 499, // $4.99
  pro: 999,   // $9.99
  premium: 1999 // $19.99
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { memberEmail, memberName, plan, paymentMethodId } = req.body

    // Validate required fields
    if (!memberEmail || !memberName || !plan || !paymentMethodId) {
      console.error('Missing required fields:', { memberEmail, memberName, plan, paymentMethodId })
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!['basic', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' })
    }

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
    const price = await stripe.prices.create({
      unit_amount: PLAN_PRICES[plan as keyof typeof PLAN_PRICES],
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
      },
    })

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      metadata: {
        plan
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