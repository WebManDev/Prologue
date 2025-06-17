"use client"

import { useEffect, Suspense } from "react"
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

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.currentUser) {
      router.push("/")
      return
    }

    // If checkout was successful, show success message
    if (checkoutStatus === "success") {
      // Remove the query param after showing the message
      const url = new URL(window.location.href)
      url.searchParams.delete("checkout")
      window.history.replaceState({}, document.title, url.toString())
    }
  }, [checkoutStatus, router])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <MemberDashboard onLogout={handleLogout} />
} 