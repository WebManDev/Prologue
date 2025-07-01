"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface NotificationContextType {
  hasUnreadMessages: boolean
  hasNewHomeContent: boolean
  lastHomeVisit: number
  markMessagesAsRead: () => void
  markHomeAsVisited: () => void
  addNewMessage: () => void
  checkForNewHomeContent: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [hasNewHomeContent, setHasNewHomeContent] = useState(true) // Force to true for demo
  const [lastHomeVisit, setLastHomeVisit] = useState(Date.now() - 5 * 60 * 60 * 1000) // Set to 5 hours ago

  // Check for new home content every 4 hours
  useEffect(() => {
    const checkInterval = setInterval(
      () => {
        checkForNewHomeContent()
      },
      4 * 60 * 60 * 1000,
    ) // 4 hours in milliseconds

    // Check immediately on mount
    checkForNewHomeContent()

    return () => clearInterval(checkInterval)
  }, [])

  // Simulate receiving new messages periodically
  useEffect(() => {
    const messageInterval = setInterval(() => {
      // Randomly add new messages (30% chance every 30 seconds for demo)
      if (Math.random() < 0.3) {
        addNewMessage()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(messageInterval)
  }, [])

  const markMessagesAsRead = () => {
    setHasUnreadMessages(false)
  }

  const markHomeAsVisited = () => {
    setHasNewHomeContent(false)
    setLastHomeVisit(Date.now())
  }

  const addNewMessage = () => {
    setHasUnreadMessages(true)
  }

  const checkForNewHomeContent = () => {
    const now = Date.now()
    const fourHours = 4 * 60 * 60 * 1000

    if (now - lastHomeVisit >= fourHours) {
      setHasNewHomeContent(true)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        hasUnreadMessages,
        hasNewHomeContent,
        lastHomeVisit,
        markMessagesAsRead,
        markHomeAsVisited,
        addNewMessage,
        checkForNewHomeContent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
} 