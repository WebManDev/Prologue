import { type NextRequest, NextResponse } from "next/server"
import { createPaymentIntent } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { amount, coachAccountId, courseId, studentId } = await request.json()

    if (!amount || !coachAccountId || !courseId || !studentId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const paymentIntent = await createPaymentIntent(amount, coachAccountId, courseId, studentId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent creation failed:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
