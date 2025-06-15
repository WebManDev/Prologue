"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { addSubscriptionForMember, auth } from "@/lib/firebase"

// Initialize Stripe with publishable key
const stripePromise = loadStripe("pk_test_51RTKV905oLGlYeZ0j3Dl8jKIYNYIFU1kuNMLZhvXECRhTVNIqdAHQTe5Dq5AEZ0eVMI7HRyopowo34ZAtFWp8V9H00pznHlYqu")

interface SubscriptionCheckoutProps {
  athlete: {
    id: string
    name: string
    sport: string
    bio: string
    profilePic: string
    subscribers: number
    posts: number
    rating: number
    stripeAccountId?: string // Optional for test mode
    pricing: {
      basic: number
      pro: number
      premium: number
    }
  }
  memberEmail: string
  memberName: string
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ athlete, memberEmail, memberName, onSuccess, onCancel }: SubscriptionCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'premium'>('basic')
  const [subscriptionSucceeded, setSubscriptionSucceeded] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: memberName,
          email: memberEmail,
        },
      })

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Payment method creation failed")
        setIsProcessing(false)
        return
      }

      if (!paymentMethod) {
        setError("Failed to create payment method")
        setIsProcessing(false)
        return
      }

      // Create subscription (pass athleteId and plan)
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberEmail,
          memberName,
          athleteId: athlete.id,
          paymentMethodId: paymentMethod.id,
          plan: selectedPlan
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create subscription")
        setIsProcessing(false)
        return
      }

      // Add athlete to member's subscriptions in Firestore
      if (auth.currentUser) {
        await addSubscriptionForMember(auth.currentUser.uid, athlete.id, selectedPlan)
      }
      setSubscriptionSucceeded(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error("Subscription error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  if (subscriptionSucceeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription Successful!</h3>
        <p className="text-gray-600">Thank you for subscribing to {athlete.name}'s {selectedPlan} plan.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <SubscriptionPlans
          onSelectPlan={setSelectedPlan}
          selectedPlan={selectedPlan}
          isLoading={isProcessing}
          prices={athlete.pricing}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <Card>
          <CardContent className="p-6">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing || !stripe}>
          {isProcessing ? "Processing..." : "Subscribe Now"}
        </Button>
      </div>
    </form>
  )
}

export function SubscriptionCheckout(props: SubscriptionCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
