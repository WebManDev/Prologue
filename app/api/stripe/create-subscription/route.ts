import { type NextRequest, NextResponse } from "next/server"
import { createSubscription, createCustomer } from "@/lib/stripe"
import stripe from "@/lib/stripeClient"

export async function POST(request: NextRequest) {
  try {
    const { memberEmail, memberName, athleteAccountId, athleteId, paymentMethodId } = await request.json()

    if (!memberEmail || !memberName || !athleteAccountId || !athleteId || !paymentMethodId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create customer
    const customer = await createCustomer({
      email: memberEmail,
      name: memberName,
    })

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

    // Create subscription
    const subscription = await createSubscription(customer.id, athleteAccountId, athleteId)

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
    })
  } catch (error) {
    console.error("Subscription creation failed:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
