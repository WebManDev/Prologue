"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { getAthleteProfile } from "@/lib/firebase"
import { AthleteStripeConnect } from "@/components/athlete-stripe-connect"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function AthleteStripeOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [athleteData, setAthleteData] = useState<any>(null)
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) {
          setError("You must be logged in.")
          setLoading(false)
          return
        }
        const profile = await getAthleteProfile(user.uid)
        setAthleteData(profile)
        setStripeAccountId(profile?.stripeAccountId || null)
      } catch (err: any) {
        setError(err.message || "Failed to load profile.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-prologue-electric" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <p className="mb-4">{error}</p>
        <Button onClick={() => router.push("/athlete-settings")}>Return to Settings</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Step 2: Set Up Payments</h1>
        <p className="text-gray-600 mb-6 text-center">Connect your Stripe account to receive payouts from the platform. You must complete this step to access your dashboard.</p>
        {!stripeAccountId ? (
          <>
            <AthleteStripeConnect athleteData={athleteData || { email: "", firstName: "", lastName: "" }} />
            <Button variant="outline" className="mt-6 w-full" onClick={() => router.push("/athlete-settings")}>Skip for now / Return to Settings</Button>
          </>
        ) : (
          <>
            <div className="mb-6 text-green-700 font-semibold">Stripe account connected!</div>
            <Button className="w-full" onClick={() => router.push("/athleteDashboard")}>Continue to Dashboard</Button>
          </>
        )}
      </div>
    </div>
  )
} 