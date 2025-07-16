"use client"

import { useEffect, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth, getMemberProfile } from "@/lib/firebase"
import MemberDashboardPage from "@/components/member-dashboard-page"

export default function MemberDashboardPageWrapper() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <MemberDashboardContent />
      </Suspense>
    </>
  )
}

function MemberDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutStatus = searchParams?.get("checkout")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (!user) {
        router.push("/")
        return
      }

      // Check if user has completed onboarding
      try {
        const memberProfile = await getMemberProfile(user.uid)
        if (memberProfile && !memberProfile.onboardingCompleted) {
          router.push("/member/onboarding")
          return
        }
      } catch (error) {
        console.error("Error checking member profile:", error)
      }

      setIsCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    // If checkout was successful, show success message
    if (checkoutStatus === "success") {
      // Remove the query param after showing the message
      const url = new URL(window.location.href)
      url.searchParams.delete("checkout")
      window.history.replaceState({}, document.title, url.toString())
    }
  }, [checkoutStatus])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <MemberDashboardPage />
} 