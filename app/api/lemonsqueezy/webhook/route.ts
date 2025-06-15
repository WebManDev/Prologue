import { NextResponse } from "next/server"
import { getFirestore, doc, updateDoc } from "firebase/firestore"
import { initializeFirebase } from "@/lib/firebase"
import crypto from "crypto"

// Hardcoded webhook secret
const LEMON_SQUEEZY_WEBHOOK_SECRET = "sixersSixers"

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const signature = request.headers.get("x-signature")
    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 401 }
      )
    }

    const body = await request.text()
    const hmac = crypto.createHmac("sha256", LEMON_SQUEEZY_WEBHOOK_SECRET)
    const digest = hmac.update(body).digest("hex")

    if (signature !== digest) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    const { data } = event

    // Initialize Firebase
    await initializeFirebase()
    const db = getFirestore()

    // Handle different event types
    switch (event.meta.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        const { custom_data } = data.attributes
        if (!custom_data?.athleteId || !custom_data?.memberEmail) {
          return NextResponse.json(
            { error: "Missing required custom data" },
            { status: 400 }
          )
        }

        // Update member's subscription in Firestore
        const memberRef = doc(db, "members", custom_data.memberEmail)
        await updateDoc(memberRef, {
          [`subscriptions.${custom_data.athleteId}`]: {
            status: "active",
            plan: data.attributes.variant_name.toLowerCase(),
            subscriptionId: data.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        break
      }

      case "subscription_cancelled": {
        const { custom_data } = data.attributes
        if (!custom_data?.athleteId || !custom_data?.memberEmail) {
          return NextResponse.json(
            { error: "Missing required custom data" },
            { status: 400 }
          )
        }

        // Update member's subscription status in Firestore
        const memberRef = doc(db, "members", custom_data.memberEmail)
        await updateDoc(memberRef, {
          [`subscriptions.${custom_data.athleteId}.status`]: "cancelled",
          [`subscriptions.${custom_data.athleteId}.updatedAt`]: new Date(),
        })

        break
      }

      case "subscription_paused": {
        const { custom_data } = data.attributes
        if (!custom_data?.athleteId || !custom_data?.memberEmail) {
          return NextResponse.json(
            { error: "Missing required custom data" },
            { status: 400 }
          )
        }

        // Update member's subscription status in Firestore
        const memberRef = doc(db, "members", custom_data.memberEmail)
        await updateDoc(memberRef, {
          [`subscriptions.${custom_data.athleteId}.status`]: "paused",
          [`subscriptions.${custom_data.athleteId}.updatedAt`]: new Date(),
        })

        break
      }

      case "subscription_resumed": {
        const { custom_data } = data.attributes
        if (!custom_data?.athleteId || !custom_data?.memberEmail) {
          return NextResponse.json(
            { error: "Missing required custom data" },
            { status: 400 }
          )
        }

        // Update member's subscription status in Firestore
        const memberRef = doc(db, "members", custom_data.memberEmail)
        await updateDoc(memberRef, {
          [`subscriptions.${custom_data.athleteId}.status`]: "active",
          [`subscriptions.${custom_data.athleteId}.updatedAt`]: new Date(),
        })

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
} 