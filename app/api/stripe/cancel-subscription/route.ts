import { type NextRequest, NextResponse } from "next/server"
import { cancelSubscription } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 })
    }

    const canceledSubscription = await cancelSubscription(subscriptionId)

    return NextResponse.json({
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status,
    })
  } catch (error) {
    console.error("Subscription cancellation failed:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
