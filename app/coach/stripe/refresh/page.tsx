"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function StripeRefreshPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Setup Incomplete</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment account setup was not completed. You'll need to finish the setup to receive payments.
          </p>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              Don't worry - you can complete the setup anytime from your dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Link href="/coach/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again Later
              </Button>
            </Link>

            <Link href="/coach/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
