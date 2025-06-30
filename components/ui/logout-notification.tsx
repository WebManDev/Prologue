"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle, X } from "lucide-react"

interface LogoutNotificationProps {
  isVisible: boolean
  userType: string
  stage: string
  message: string
  error: string | null
  canRetry: boolean
  onRetry: () => void
  onCancel: () => void
}

export function LogoutNotification({
  isVisible,
  userType,
  stage,
  message,
  error,
  canRetry,
  onRetry,
  onCancel,
}: LogoutNotificationProps) {
  if (!isVisible) return null

  const getStageIcon = () => {
    if (error) {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
    
    switch (stage) {
      case "initiating":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "signing-out":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "clearing-data":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "redirecting":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStageColor = () => {
    if (error) return "border-red-200 bg-red-50"
    
    switch (stage) {
      case "redirecting":
        return "border-green-200 bg-green-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${getStageColor()}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getStageIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {error ? "Logout Failed" : "Logging Out"}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {error || message}
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                {canRetry && (
                  <Button onClick={onRetry} className="flex-1">
                    Try Again
                  </Button>
                )}
                
                {!error && (
                  <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                  </Button>
                )}
                
                {error && (
                  <Button variant="outline" onClick={onCancel} className="flex-1">
                    Close
                  </Button>
                )}
              </div>
            </div>
            
            {!error && (
              <button
                onClick={onCancel}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 