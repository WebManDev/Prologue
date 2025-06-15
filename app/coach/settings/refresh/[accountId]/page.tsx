"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RefreshPage() {
  const params = useParams()
  const accountId = params?.accountId as string
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (accountId) {
      setIsLoading(true)
      fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: accountId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setIsLoading(false)
          if (data.url) {
            window.location.href = data.url
          } else if (data.error) {
            setError(data.error)
          }
        })
        .catch((err) => {
          setIsLoading(false)
          setError(err.message)
        })
    }
  }, [accountId])

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Add Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Please complete your account setup to start accepting payments.
              </p>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {isLoading && (
                <p className="text-sm text-gray-500">Creating a new account link...</p>
              )}
              {accountId && !isLoading && !error && (
                <div className="text-xs text-gray-500">
                  Your connected account ID: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{accountId}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 