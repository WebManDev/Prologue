import { type NextRequest, NextResponse } from "next/server"
import { createCoachStripeAccount, createAccountLink } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, country } = await request.json()

    if (!email || !firstName || !lastName || !country) {
      return NextResponse.json({ error: "Missing required coach information" }, { status: 400 })
    }

    // Create Stripe Connect account
    const account = await createCoachStripeAccount({
      email,
      firstName,
      lastName,
      country,
    })

    // Create onboarding link
    const refreshUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/coach/stripe/refresh`
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/coach/stripe/success`

    const accountLink = await createAccountLink(account.id, refreshUrl, returnUrl)

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    })
  } catch (error) {
    console.error("Coach account creation failed:", error)
    return NextResponse.json({ error: "Failed to create coach account" }, { status: 500 })
  }
}
