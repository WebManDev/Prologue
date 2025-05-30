import { type NextRequest, NextResponse } from "next/server"
import { createPayout, getAccountBalance } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { accountId, amount } = await request.json()

    if (!accountId || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Check account balance first
    const balance = await getAccountBalance(accountId)
    const availableBalance = balance.available[0]?.amount || 0

    if (amount * 100 > availableBalance) {
      return NextResponse.json({ error: "Insufficient balance for payout" }, { status: 400 })
    }

    const payout = await createPayout(accountId, amount)

    return NextResponse.json({
      payoutId: payout.id,
      amount: payout.amount / 100,
      status: payout.status,
      arrivalDate: payout.arrival_date,
    })
  } catch (error) {
    console.error("Payout creation failed:", error)
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 })
  }
}
