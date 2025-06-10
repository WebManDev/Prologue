"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StripeRefreshPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/coach/settings")
    }, 2000)
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-2">Stripe Onboarding Incomplete</h1>
        <p className="text-gray-600">You can try again from your payment settings.<br/>Redirecting...</p>
      </div>
    </div>
  )
}
