"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react"

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var not set');
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface Course {
  id: number
  title: string
  instructor: string
  price: string
  coachAccountId: string
}

interface StripeCheckoutProps {
  course: Course
  studentId: string
  onSuccess: () => void
  onCancel: () => void
}

export function StripeCheckout({ course, studentId, onSuccess, onCancel }: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm course={course} studentId={studentId} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}

function CheckoutForm({ course, studentId, onSuccess, onCancel }: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentSucceeded, setPaymentSucceeded] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseInt(course.price.replace("$", "")),
          coachAccountId: course.coachAccountId,
          courseId: course.id,
          studentId,
        }),
      })

      const { url, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        setIsProcessing(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      setError("An unexpected error occurred")
    }

    setIsProcessing(false)
  }

  if (paymentSucceeded) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            You now have access to <strong>{course.title}</strong>
          </p>
          <p className="text-sm text-gray-500">Redirecting to course...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600">by {course.instructor}</p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold text-green-600">{course.price}</span>
            </div>
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
                  `Pay ${course.price}`
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
