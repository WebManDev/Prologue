import { type NextRequest, NextResponse } from "next/server"
import { getAthleteEarnings } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")

    if (!accountId) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 })
    }

    const earnings = await getAthleteEarnings(accountId)

    return NextResponse.json(earnings)
  } catch (error) {
    console.error("Failed to get athlete earnings:", error)
    return NextResponse.json({ error: "Failed to get earnings" }, { status: 500 })
  }
}
