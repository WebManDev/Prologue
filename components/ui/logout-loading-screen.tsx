"use client"

import { useEffect, useState } from "react"
import { Loader2, LogOut, CheckCircle, AlertCircle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface LogoutLoadingScreenProps {
  isVisible: boolean
  stage: "initializing" | "clearing-data" | "securing-session" | "redirecting" | "complete" | "error"
  message?: string
  progress?: number
  onRetry?: () => void
  onCancel?: () => void
  error?: string
  estimatedTime?: number
}

export function LogoutLoadingScreen({
  isVisible,
  stage,
  message,
  progress = 0,
  onRetry,
  onCancel,
  error,
  estimatedTime = 3000,
}: LogoutLoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  // Smooth progress animation
  useEffect(() => {
    if (!isVisible) {
      setDisplayProgress(0)
      setElapsedTime(0)
      return
    }

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = progress
        const diff = target - prev
        return prev + diff * 0.1 // Smooth easing
      })
    }, 16) // 60fps

    return () => clearInterval(interval)
  }, [progress, isVisible])

  // Track elapsed time
  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [isVisible])

  // Auto-show details if taking too long
  useEffect(() => {
    if (elapsedTime > 2000 && !showDetails) {
      setShowDetails(true)
    }
  }, [elapsedTime, showDetails])

  const getStageInfo = () => {
    switch (stage) {
      case "initializing":
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          title: "Initializing Logout",
          description: "Preparing to securely log you out...",
          color: "blue",
        }
      case "clearing-data":
        return {
          icon: <Shield className="h-8 w-8 text-orange-500 animate-pulse" />,
          title: "Clearing Session Data",
          description: "Removing authentication tokens and cached data...",
          color: "orange",
        }
      case "securing-session":
        return {
          icon: <Shield className="h-8 w-8 text-purple-500 animate-pulse" />,
          title: "Securing Session",
          description: "Invalidating session and clearing cookies...",
          color: "purple",
        }
      case "redirecting":
        return {
          icon: <LogOut className="h-8 w-8 text-green-500" />,
          title: "Redirecting",
          description: "Taking you to the login page...",
          color: "green",
        }
      case "complete":
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: "Logout Complete",
          description: "You have been successfully logged out.",
          color: "green",
        }
      case "error":
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: "Logout Failed",
          description: error || "An error occurred during logout. Please try again.",
          color: "red",
        }
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          title: "Logging Out",
          description: "Please wait...",
          color: "blue",
        }
    }
  }

  const stageInfo = getStageInfo()
  const isError = stage === "error"
  const isComplete = stage === "complete"
  const isProcessing = !isError && !isComplete

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Main Loading Card */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header with animated background */}
        <div
          className={`relative px-6 py-8 text-center ${
            isError
              ? "bg-gradient-to-br from-red-50 to-red-100"
              : isComplete
                ? "bg-gradient-to-br from-green-50 to-green-100"
                : "bg-gradient-to-br from-blue-50 to-purple-50"
          }`}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </div>

          {/* Icon */}
          <div className="relative mb-4 flex justify-center">
            <div className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg">{stageInfo.icon}</div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">{stageInfo.title}</h2>

          {/* Description */}
          <p className="text-gray-600 text-sm">{message || stageInfo.description}</p>
        </div>

        {/* Progress Section */}
        {isProcessing && (
          <div className="px-6 py-4 border-b border-gray-100">
            {/* Progress Bar */}
            <div className="mb-3">
              <Progress value={displayProgress} className="h-2" />
            </div>

            {/* Progress Text */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{Math.round(displayProgress)}% complete</span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{(elapsedTime / 1000).toFixed(1)}s</span>
              </span>
            </div>

            {/* Estimated time remaining */}
            {estimatedTime > 0 && elapsedTime < estimatedTime && (
              <div className="mt-2 text-xs text-gray-400 text-center">
                Estimated time remaining: {Math.max(0, Math.ceil((estimatedTime - elapsedTime) / 1000))}s
              </div>
            )}
          </div>
        )}

        {/* Details Section (shown after delay or on error) */}
        {(showDetails || isError) && (
          <div className="px-6 py-4 bg-gray-50">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-500 hover:text-gray-700 mb-2 flex items-center space-x-1"
            >
              <span>Technical Details</span>
              <span className={`transform transition-transform ${showDetails ? "rotate-180" : ""}`}>▼</span>
            </button>

            {showDetails && (
              <div className="text-xs text-gray-600 space-y-1 font-mono bg-white rounded p-3 border">
                <div>Stage: {stage}</div>
                <div>Progress: {Math.round(displayProgress)}%</div>
                <div>Elapsed: {(elapsedTime / 1000).toFixed(2)}s</div>
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-center space-x-3">
          {isError && onRetry && (
            <Button onClick={onRetry} size="sm" className="bg-blue-500 hover:bg-blue-600">
              <LogOut className="h-4 w-4 mr-2" />
              Retry Logout
            </Button>
          )}

          {isError && onCancel && (
            <Button onClick={onCancel} variant="outline" size="sm">
              Cancel
            </Button>
          )}

          {isComplete && <div className="text-sm text-green-600 font-medium">Redirecting automatically...</div>}

          {isProcessing && elapsedTime > 5000 && onCancel && (
            <Button onClick={onCancel} variant="ghost" size="sm" className="text-gray-500">
              Cancel
            </Button>
          )}
        </div>

        {/* Loading Animation Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse"></div>
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white/20 rounded-full animate-bounce`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

// Hook for managing logout loading state
export function useLogoutLoadingState() {
  const [isVisible, setIsVisible] = useState(false)
  const [stage, setStage] = useState<LogoutLoadingScreenProps["stage"]>("initializing")
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [estimatedTime, setEstimatedTime] = useState(3000)

  const showLoading = (initialMessage?: string, estimatedDuration?: number) => {
    setIsVisible(true)
    setStage("initializing")
    setProgress(0)
    setMessage(initialMessage || "")
    setError("")
    setEstimatedTime(estimatedDuration || 3000)
  }

  const updateStage = (newStage: LogoutLoadingScreenProps["stage"], newProgress?: number, newMessage?: string) => {
    setStage(newStage)
    if (newProgress !== undefined) setProgress(newProgress)
    if (newMessage) setMessage(newMessage)
  }

  const showError = (errorMessage: string) => {
    setStage("error")
    setError(errorMessage)
    setProgress(0)
  }

  const complete = () => {
    setStage("complete")
    setProgress(100)
    // Auto-hide after a short delay
    setTimeout(() => {
      setIsVisible(false)
    }, 1500)
  }

  const hide = () => {
    setIsVisible(false)
    setStage("initializing")
    setProgress(0)
    setMessage("")
    setError("")
  }

  return {
    isVisible,
    stage,
    progress,
    message,
    error,
    estimatedTime,
    showLoading,
    updateStage,
    showError,
    complete,
    hide,
  }
} 