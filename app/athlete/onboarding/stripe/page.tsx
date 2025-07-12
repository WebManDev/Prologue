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
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-12" style={{ backgroundColor: "#0f172a" }}>
      {/* Fixed background layer */}
      <div className="fixed inset-0 bg-slate-900" style={{ backgroundColor: "#0f172a", zIndex: -2 }}></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ zIndex: -1 }}></div>
      {/* Athletic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-red-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full p-8 flex flex-col items-center z-10">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Step 2: Set Up Payments</h1>
        <p className="text-gray-600 mb-6 text-center">Connect your Stripe account to receive payouts from the platform. You must complete this step to access your dashboard.</p>
        {!stripeAccountId ? (
          <>
            <AthleteStripeConnect athleteData={athleteData || { email: "", firstName: "", lastName: "" }} />
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