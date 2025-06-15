"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ReturnPage() {
  const params = useParams()
  const accountId = params?.accountId as string
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const verifyAccount = async () => {
      if (!accountId) return;

      try {
        const response = await fetch("/api/stripe/verify-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          setError(data.details || data.error || "Failed to verify account");
          setIsComplete(false);
        } else {
          setIsComplete(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify account");
        setIsComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccount();
  }, [accountId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">Verifying your account...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              {isComplete ? "Details Submitted" : "Additional Information Required"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup Incomplete</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <p className="text-gray-600">
                {isComplete 
                  ? "That's everything we need for now. Your Stripe account has been successfully set up."
                  : "Please complete your Stripe account setup to start receiving payments."}
              </p>
              <Button
                onClick={() => window.location.href = "/coach/settings"}
                className="w-full"
              >
                Return to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 