"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth, saveAthleteProfile } from "@/lib/firebase"

export default function StripeSuccessPage() {
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function handleProfile() {
      const user = auth.currentUser;
      if (!user) {
        // Not logged in, redirect to settings
        router.push("/coach/settings");
        return;
      }
      // Save or update the coach profile
      await saveAthleteProfile(user.uid, {
        name: user.displayName || "Coach",
        email: user.email || "",
        sport: "",
        role: "coach",
        bio: "",
        specialties: [],
        location: "",
        experience: "",
        certifications: [],
        profilePicture: user.photoURL || "/placeholder.svg",
      });
      setIsVerified(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => router.push("/coach/dashboard"), 1500);
    }
    handleProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Setup Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your Stripe account has been successfully connected. You can now receive payments from students.
          </p>

          {isVerified ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">✓ Account verified and ready to receive payments</p>
              </div>

              <Link href="/coach/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Verifying your account setup...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
