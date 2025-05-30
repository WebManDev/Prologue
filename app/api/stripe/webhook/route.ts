import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleSuccessfulPayment(paymentIntent)
        break

      case "account.updated":
        const account = event.data.object as Stripe.Account
        await handleAccountUpdate(account)
        break

      case "payout.paid":
        const payout = event.data.object as Stripe.Payout
        await handlePayoutPaid(payout)
        break

      case "payout.failed":
        const failedPayout = event.data.object as Stripe.Payout
        await handlePayoutFailed(failedPayout)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler failed:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  // Update database with successful course purchase
  console.log("Payment succeeded:", paymentIntent.id)

  // Here you would:
  // 1. Grant course access to student
  // 2. Update coach earnings
  // 3. Send confirmation emails
  // 4. Update analytics
}

async function handleAccountUpdate(account: Stripe.Account) {
  // Update coach account status in database
  console.log("Account updated:", account.id)

  // Here you would:
  // 1. Update coach verification status
  // 2. Enable/disable payout capabilities
  // 3. Notify coach of status changes
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  // Update payout status in database
  console.log("Payout paid:", payout.id)

  // Here you would:
  // 1. Update payout status to 'paid'
  // 2. Send confirmation to coach
  // 3. Update coach balance
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  // Handle failed payout
  console.log("Payout failed:", payout.id)

  // Here you would:
  // 1. Update payout status to 'failed'
  // 2. Notify coach of failure
  // 3. Provide next steps
}
