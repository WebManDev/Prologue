"use client"

import { useEffect, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MemberDashboard } from "@/components/member-dashboard"
import { auth } from "@/lib/firebase"

export default function MemberDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemberDashboardContent />
    </Suspense>
  )
}

function MemberDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutStatus = searchParams?.get("checkout")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/")
        return
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

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

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

  return <MemberDashboard onLogout={handleLogout} />
} 