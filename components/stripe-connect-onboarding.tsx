"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, AlertCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StripeConnectOnboardingProps {
  onComplete: (accountId: string) => void
  existingAccountId?: string
}

export function StripeConnectOnboarding({ onComplete, existingAccountId }: StripeConnectOnboardingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{
    title: string;
    message: string;
    details?: string;
  } | null>(null)
  const [connectedAccountId, setConnectedAccountId] = useState<string | undefined>(existingAccountId)

  const handleCreateAccount = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/create-connect-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Stripe Connect account")
      }

      if (!data.account) {
        throw new Error("Invalid response from server: missing account ID")
      }

      setConnectedAccountId(data.account)
      // Do NOT call onComplete here. Only call after onboarding is complete.
      // Instead, immediately start onboarding:
      // Create account link for onboarding
      const accountLinkResponse = await fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: data.account }),
      })
      const accountLinkData = await accountLinkResponse.json()
      if (!accountLinkResponse.ok) {
        throw new Error(accountLinkData.error || "Failed to create account link")
      }
      if (!accountLinkData.url) {
        throw new Error("Invalid response from server: missing URL")
      }
      window.location.href = accountLinkData.url
    } catch (err: any) {
      console.error("Stripe Connect error:", err)
      setError({
        title: "Connection Failed",
        message: "Failed to create Stripe account. Please try again.",
        details: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStripeAction = async () => {
    if (!connectedAccountId) return

    setIsLoading(true)
    setError(null)

    try {
      // If it's an existing account, create a login link
      if (existingAccountId) {
        const response = await fetch("/api/stripe/create-login-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: existingAccountId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create login link")
        }

        if (!data.loginUrl) {
          throw new Error("Invalid response from server: missing login URL")
        }

        // Redirect to Stripe dashboard
        window.location.href = data.loginUrl
      } else {
        // For new accounts, create an account link for onboarding
        const response = await fetch("/api/stripe/create-account-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: connectedAccountId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create account link")
        }

        if (!data.url) {
          throw new Error("Invalid response from server: missing URL")
        }

        // Redirect to Stripe onboarding
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error("Stripe Connect error:", err)
      setError({
        title: "Connection Failed",
        message: existingAccountId 
          ? "Failed to access your Stripe dashboard. Please try again."
          : "Failed to create account link. Please try again.",
        details: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {existingAccountId ? "Manage Stripe Account" : connectedAccountId ? "Add Information" : "Connect with Stripe"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {existingAccountId 
              ? "Access your Stripe dashboard to manage your account settings and view your earnings."
              : connectedAccountId 
                ? "Complete your account setup to start receiving payments from your subscribers."
                : "Connect your Stripe account to start receiving payments from your subscribers."}
          </p>
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>
                <p>{error.message}</p>
                {error.details && (
                  <p className="text-xs mt-1 opacity-75">{error.details}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
          {!connectedAccountId && !existingAccountId && (
            <Button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating Account..." : "Create an Account"}
            </Button>
          )}
          {(connectedAccountId || existingAccountId) && (
            <Button
              onClick={handleStripeAction}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading 
                ? (existingAccountId ? "Loading..." : "Creating Link...") 
                : (existingAccountId ? "Access Dashboard" : "Add Information")}
            </Button>
          )}
          {connectedAccountId && !existingAccountId && (
            <div className="text-xs text-gray-500 mt-2">
              Your connected account ID: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{connectedAccountId}</code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 