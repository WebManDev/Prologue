import { NextResponse } from "next/server"
import { z } from "zod"
import { saveCheckoutAttempt, updateCheckoutAttempt } from "@/lib/firebase-admin"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase-admin"

// Types for Lemon Squeezy API
type LemonSqueezyCheckoutAttributes = {
  store_id: number
  variant_id: number
  custom_price?: number
  checkout_options: {
    embed: boolean
  }
  checkout_data: {
    email: string
    name: string
    success_url: string
    cancel_url: string
  }
}

type LemonSqueezyCheckoutPayload = {
  data: {
    type: "checkouts"
    attributes: LemonSqueezyCheckoutAttributes
  }
}

// Zod schema for custom data
const CustomDataSchema = z.object({
  athleteId: z.string(),
  memberEmail: z.string().email(),
  memberName: z.string(),
  plan: z.enum(["basic", "pro", "premium"])
})

// Zod schema for request body
const CheckoutRequestSchema = z.object({
  variantId: z.string().refine(
    (val) => ['851467', '851522', '851524'].includes(val),
    { message: "Invalid variant ID" }
  ),
  email: z.string().email(),
  name: z.string(),
  plan: z.enum(['basic', 'pro', 'premium']),
  athleteId: z.string()
})

// Hardcoded Lemon Squeezy configuration
const LEMON_SQUEEZY_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJkNjRjNDg5ZmFmNjliNjRhNGM0NDMwMjk0N2FmNmFmNGFiZTNhNjM4ZDI1YTdjZDNjNGI2ODMwMjQ4OWYzYTRlZjJjMDYzODNlOTc2ZWRmNSIsImlhdCI6MTc0OTk3MjIwMi45MDIxNTEsIm5iZiI6MTc0OTk3MjIwMi45MDIxNTMsImV4cCI6MjA2NTUwNTAwMi42NDE4MDksInN1YiI6IjUwNTQzNjgiLCJzY29wZXMiOltdfQ.MLPBlIi6kpWVO8zTwyzV42Otf0jsgKSTFWsDIMz-bkBMaO5tSrEl6ZJiY4p2eDot7SljAl1MMfHuHcNDDKZcMsKILCkRbfdqU0t7Mo8marPl-qRQwTssHH9t7mOMeG8mwjbKpSaEBF_qbX3SLG_Iw_bT0XZWxvGyAodt-_gRpSAk8rHJPYycKYoML0VrPWo8c96ysZFoQ5skC_2KhRTNQmdU-eIOKl8-RAl3iRfLbSUcWaD4KbzmDXWaUGIu1clGBoNvDWFLYNkvQeeQULrfZpAQxzdGhJ2cnDLxsC5nA7IyI2JVQX5xBUZJeSGABKuGJZ6XX71krV_5AG9jAeIifv5pac_BwwqErXCvs5G0BDgF-huYF4hJUiolDWAmaGm2TktZUn7AoLRSj8MOj40gy-341XpDHiiKzRSRTx8oOEMYQdElgtFdI0b32Jr72zaU4mrVSbsL0iQy2FXolPxs5ilXM0MewHAYw6Wt65dB4CLU_PJOq6TkW4YW3KlVOevg"
const LEMON_SQUEEZY_STORE_ID = "190893"
const APP_URL = "http://localhost:3000"

// Hardcoded variant IDs for subscription plans
const VARIANT_IDS = {
  basic: "851467",    // Basic Plan
  pro: "851522",      // Pro Plan
  premium: "851524"   // Premium Plan
}

export async function POST(request: Request) {
  let checkoutId: string | undefined

  try {
    const body = await request.json()
    
    // Validate request body using Zod
    const validationResult = CheckoutRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const { variantId, email, name, plan, athleteId } = validationResult.data

    // Get athlete's custom pricing
    const athleteDoc = await getDoc(doc(db, "athletes", athleteId))
    if (!athleteDoc.exists()) {
      return NextResponse.json(
        { error: "Athlete not found" },
        { status: 404 }
      )
    }

    const athleteData = athleteDoc.data()
    const customPrice = plan === 'pro' ? athleteData.pricing?.pro : 
                       plan === 'premium' ? athleteData.pricing?.premium : 
                       4.99 // Basic plan price

    // Save initial checkout attempt
    checkoutId = await saveCheckoutAttempt({
      variantId,
      email,
      name,
      status: 'pending',
      plan,
      customPrice
    })

    // Log the incoming data
    console.log('Incoming request data:', {
      store_id: 190893,
      variant_id: variantId,
      email,
      name
    })

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: { email, name },
          product_options: {
            redirect_url: `${APP_URL}/member-dashboard?checkout=success&checkout_id=${checkoutId}`,
            enabled_variants: [parseInt(variantId, 10)],
            custom_price: customPrice * 100 // Convert to cents
          },
          test_mode: true
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMON_SQUEEZY_STORE_ID
            }
          },
          variant: {
            data: {
              type: "variants",
              id: variantId
            }
          }
        }
      }
    }

    console.log('Creating checkout with payload:', JSON.stringify(payload, null, 2))

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${LEMON_SQUEEZY_API_KEY}`
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Lemon Squeezy API error:", data)
      
      // Update checkout attempt with error
      if (checkoutId) {
        await updateCheckoutAttempt(checkoutId, {
          status: 'failed',
          error: data.errors?.[0]?.detail || "Failed to create checkout"
        })
      }

      return NextResponse.json(
        { 
          error: data.errors?.[0]?.detail || "Failed to create checkout",
          details: data.errors || [],
          checkoutId
        },
        { status: response.status }
      )
    }

    if (!data.data?.attributes?.url) {
      console.error("Invalid response format from Lemon Squeezy:", data)
      
      // Update checkout attempt with error
      if (checkoutId) {
        await updateCheckoutAttempt(checkoutId, {
          status: 'failed',
          error: "Invalid response from payment provider"
        })
      }

      return NextResponse.json(
        { 
          error: "Invalid response from payment provider",
          checkoutId
        },
        { status: 500 }
      )
    }

    // Update checkout attempt with success
    if (checkoutId) {
      await updateCheckoutAttempt(checkoutId, {
        status: 'success'
      })
    }

    return NextResponse.json({ 
      url: data.data.attributes.url,
      checkoutId
    })
  } catch (error: any) {
    console.error("Error creating checkout:", error)
    
    // Update checkout attempt with error if we have an ID
    if (checkoutId) {
      await updateCheckoutAttempt(checkoutId, {
        status: 'failed',
        error: error.message || "Internal server error"
      })
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message,
        checkoutId
      },
      { status: 500 }
    )
  }
}
