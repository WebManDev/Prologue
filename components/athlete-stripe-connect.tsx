"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getAuth } from "firebase/auth"

interface AthleteStripeConnectProps {
  athleteData: {
    email: string
    firstName: string
    lastName: string
  }
}

export function AthleteStripeConnect({ athleteData }: AthleteStripeConnectProps) {
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load athlete's Stripe account ID
  useEffect(() => {
    const loadStripeAccount = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        const idToken = await user.getIdToken()
        const response = await fetch('/api/athlete/profile', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.stripeAccountId) {
            setStripeAccountId(data.stripeAccountId)
          }
        }
      } catch (error) {
        console.error('Error loading Stripe account:', error)
      }
    }

    loadStripeAccount()
  }, [])

  const handleStripeAction = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()

      // Clear existing Stripe account ID to force creation of new account with proper branding
      if (stripeAccountId) {
        await fetch('/api/athlete/save-stripe-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ stripeAccountId: null }),
        })
        setStripeAccountId(null)
      }

      // Create new Stripe Connect account
      const createResponse = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: athleteData.email,
          firstName: athleteData.firstName,
          lastName: athleteData.lastName,
          country: 'US',
        }),
      })

      const createText = await createResponse.text();
      const createData = createText ? JSON.parse(createText) : {};
      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create Stripe account')
      }

      // Create account link for onboarding
      const linkResponse = await fetch('/api/stripe/create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: createData.account }),
      })

      const linkText = await linkResponse.text();
      const linkData = linkText ? JSON.parse(linkText) : {};
      if (!linkResponse.ok) {
        throw new Error(linkData.error || 'Failed to create account link')
      }

      // Save the account ID to the athlete's profile
      await fetch('/api/athlete/save-stripe-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ stripeAccountId: createData.account }),
      })

      // Redirect to Stripe onboarding
      window.location.href = linkData.url
    } catch (error: any) {
      console.error('Stripe Connect error:', error)
      setError(error.message || 'Failed to manage payment account')
      toast({
        title: "Error",
        description: error.message || 'Failed to manage payment account',
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBranding = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()

      const response = await fetch('/api/stripe/update-account-branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update branding')
      }

      toast({
        title: "Success",
        description: "Account branding updated to Prologue",
        duration: 3000,
      })
    } catch (error: any) {
      console.error('Branding update error:', error)
      setError(error.message || 'Failed to update branding')
      toast({
        title: "Error",
        description: error.message || 'Failed to update branding',
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Payment</CardTitle>
        <p className="text-sm text-gray-600">
          {stripeAccountId 
            ? "Access your Stripe Connect dashboard to manage payouts and account settings."
            : "Set up your Stripe Connect account to receive payouts from the platform."
          }
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <Button
          onClick={handleStripeAction}
          className="bg-prologue-electric hover:bg-prologue-blue"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {stripeAccountId ? "Accessing Dashboard..." : "Setting Up..."}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              {stripeAccountId ? "Access Stripe Dashboard" : "Set Up Stripe Connect"}
            </>
          )}
        </Button>
        {stripeAccountId && (
          <>
            <Button
              onClick={handleUpdateBranding}
              variant="outline"
              className="mt-2 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Branding...
                </>
              ) : (
                "Update to Prologue Branding"
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Account ID: {stripeAccountId.substring(0, 8)}...
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
} 