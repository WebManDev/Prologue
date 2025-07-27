"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function ReferralPage() {
  const router = useRouter()
  const params = useParams()
  const referrerName = params?.referrer as string

  useEffect(() => {
    // Store the referrer in localStorage
    if (referrerName) {
      localStorage.setItem("prologue_referrer", referrerName)
      console.log("Referrer stored:", referrerName)
    }

    // Redirect to the landing page
    router.replace("/")
  }, [referrerName, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Prologue...</p>
      </div>
    </div>
  )
} 