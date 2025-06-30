"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

interface LogoutState {
  isLoading: boolean
  isVisible: boolean
  userType: string
  stage: string
  message: string
  error: string | null
  canRetry: boolean
}

interface LogoutOptions {
  customMessage?: string
  onComplete?: () => void
  onError?: (error: any) => void
}

export function useUnifiedLogout() {
  const router = useRouter()
  const [loadingState, setLoadingState] = useState<LogoutState>({
    isLoading: false,
    isVisible: false,
    userType: "",
    stage: "",
    message: "",
    error: null,
    canRetry: false,
  })

  const logout = useCallback(async (options: LogoutOptions = {}): Promise<boolean> => {
    const { customMessage, onComplete, onError } = options

    setLoadingState({
      isLoading: true,
      isVisible: true,
      userType: "member", // This could be determined dynamically
      stage: "initiating",
      message: customMessage || "Logging out...",
      error: null,
      canRetry: false,
    })

    try {
      // Stage 1: Sign out from Firebase
      setLoadingState(prev => ({
        ...prev,
        stage: "signing-out",
        message: "Signing out from your account...",
      }))

      await auth.signOut()

      // Stage 2: Clear local storage and cookies
      setLoadingState(prev => ({
        ...prev,
        stage: "clearing-data",
        message: "Clearing local data...",
      }))

      // Clear any stored user data
      localStorage.removeItem("user")
      localStorage.removeItem("userType")
      sessionStorage.clear()

      // Stage 3: Redirect
      setLoadingState(prev => ({
        ...prev,
        stage: "redirecting",
        message: "Redirecting to login page...",
      }))

      // Call onComplete callback
      if (onComplete) {
        onComplete()
      }

      // Redirect to login page
      setTimeout(() => {
        router.push("/")
      }, 1000)

      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        isVisible: false,
      }))

      return true
    } catch (error) {
      console.error("Logout error:", error)
      
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
        canRetry: true,
        message: "Logout failed. Please try again.",
      }))

      if (onError) {
        onError(error)
      }

      return false
    }
  }, [router])

  const retryLogout = useCallback(() => {
    logout()
  }, [logout])

  const cancelLogout = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isVisible: false,
      isLoading: false,
      error: null,
      canRetry: false,
    }))
  }, [])

  return {
    logout,
    loadingState,
    retryLogout,
    cancelLogout,
  }
} 