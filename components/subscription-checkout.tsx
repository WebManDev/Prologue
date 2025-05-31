"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Shield, CheckCircle, Users, Star } from "lucide-react"

// Hardcoded keys as requested
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RTKV905oLGlYeZ0j3Dl8jKIYNYIFU1kuNMLZhvXECRhTVNIqdAHQTe5Dq5AEZ0eVMI7HRyopowo34ZAtFWp8V9H00pznHlYqu"

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

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
    stripeAccountId: string
  }
  memberEmail: string
  memberName: string
  onSuccess: () => void
  onCancel: () => void
}

export function SubscriptionCheckout({
  athlete,
  memberEmail,
  memberName,
  onSuccess,
  onCancel,
}: SubscriptionCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        athlete={athlete}
        memberEmail={memberEmail}
        memberName={memberName}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
}

function CheckoutForm({ athlete, memberEmail, memberName, onSuccess, onCancel }: SubscriptionCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

      // Create subscription
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberEmail,
          memberName,
          athleteAccountId: athlete.stripeAccountId,
          athleteId: athlete.id,
          paymentMethodId: paymentMethod.id,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
      } else {
        setSubscriptionSucceeded(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }

    setIsProcessing(false)
  }

  if (subscriptionSucceeded) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Active!</h2>
          <p className="text-gray-600 mb-4">
            You're now subscribed to <strong>{athlete.name}</strong>'s content
          </p>
          <p className="text-sm text-gray-500">Redirecting to content...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Athlete Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscribe to {athlete.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 mb-4">
            <img src={athlete.profilePic || "/placeholder.svg"} alt={athlete.name} className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="font-semibold text-gray-900">{athlete.name}</h3>
              <Badge variant="outline">{athlete.sport}</Badge>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{athlete.bio}</p>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{athlete.subscribers}</span>
            </span>
            <span>{athlete.posts} posts</span>
            <span className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{athlete.rating}</span>
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-medium">Monthly Subscription</span>
            <span className="text-2xl font-bold text-green-600">$10.00</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-lg">
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
                  },
                }}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What you get:</p>
                <ul className="space-y-1">
                  <li>• Access to all workout videos</li>
                  <li>• Exclusive blog posts and tips</li>
                  <li>• Direct messaging with {athlete.name}</li>
                  <li>• Cancel anytime</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe $10/month"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Badge */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Secured by Stripe
        </Badge>
      </div>
    </div>
  )
}
