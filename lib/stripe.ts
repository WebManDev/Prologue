import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY env var not set');
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var not set');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe with the secret key
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  { apiVersion: "2025-06-30.basil" }
);

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: "usd",
  platformFeePercentage: 15, // 15% platform fee (athlete's share is 85%)
  monthlySubscriptionPrice: 10, // $10/month for athlete subscriptions
}

// Create Stripe Connect account for athletes
export async function createAthleteStripeAccount(athleteData: {
  email: string
  firstName: string
  lastName: string
  country: string
}) {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: athleteData.country,
      email: athleteData.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        product_description: "Athletic coaching and training content subscriptions",
        url: "https://prologuehq.com",
        mcc: "7997", // Athletic and Recreational Services
        name: "Prologue", // This should show in the onboarding interface
      },
      business_type: "individual",
      individual: {
        first_name: athleteData.firstName,
        last_name: athleteData.lastName,
        email: athleteData.email,
        address: {
          country: athleteData.country,
        },
      },
      settings: {
        payouts: {
          schedule: {
            interval: "manual",
          },
        },
      },
    })

    return account
  } catch (error) {
    console.error("Error creating Stripe account:", error)
    throw error
  }
}

// Create subscription for member to athlete
export async function createSubscription(customerId: string, athleteAccountId: string, athleteId: string) {
  try {
    // Create a price for this athlete's subscription
    const price = await stripe.prices.create({
      unit_amount: STRIPE_CONFIG.monthlySubscriptionPrice * 100, // Convert to cents
      currency: STRIPE_CONFIG.currency,
      recurring: { interval: "month" },
      product_data: {
        name: `Monthly Subscription - Athlete ${athleteId}`,
      },
    })

    // Calculate platform fee
    const platformFee = Math.round(STRIPE_CONFIG.monthlySubscriptionPrice * STRIPE_CONFIG.platformFeePercentage * 100)

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      application_fee_percent: STRIPE_CONFIG.platformFeePercentage * 100,
      transfer_data: {
        destination: athleteAccountId,
      },
      metadata: {
        athleteId,
        athleteAccountId,
      },
    })

    return subscription
  } catch (error) {
    console.error("Error creating subscription:", error)
    throw error
  }
}

// Create customer for member
export async function createCustomer(memberData: { email: string; name: string }) {
  try {
    const customer = await stripe.customers.create({
      email: memberData.email,
      name: memberData.name,
    })

    return customer
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}

// Get athlete earnings
export async function getAthleteEarnings(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    })

    const charges = await stripe.charges.list(
      {
        limit: 100,
      },
      {
        stripeAccount: accountId,
      },
    )

    return {
      balance,
      charges,
    }
  } catch (error) {
    console.error("Error retrieving earnings:", error)
    throw error
  }
}

// Create payout for athlete
export async function createPayout(accountId: string, amount: number) {
  try {
    const payout = await stripe.payouts.create(
      {
        amount: amount * 100, // Convert to cents
        currency: STRIPE_CONFIG.currency,
      },
      {
        stripeAccount: accountId,
      },
    )

    return payout
  } catch (error) {
    console.error("Error creating payout:", error)
    throw error
  }
}
