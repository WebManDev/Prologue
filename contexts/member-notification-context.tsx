"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface MemberNotificationContextType {
  unreadMessagesCount: number
  unreadNotificationsCount: number
  hasNewTrainingContent: boolean
  lastTrainingVisit: number
  markMessagesAsRead: () => void
  markNotificationsAsRead: () => void
  markTrainingAsVisited: () => void
  addNewMessage: () => void
  addNewNotification: () => void
  checkForNewTrainingContent: () => void
}

const MemberNotificationContext = createContext<MemberNotificationContextType | undefined>(undefined)

export function MemberNotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(2)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3)
  const [hasNewTrainingContent, setHasNewTrainingContent] = useState(true)
  const [lastTrainingVisit, setLastTrainingVisit] = useState(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago

  // Check for new training content every 4 hours
  useEffect(() => {
    const checkInterval = setInterval(
      () => {
        checkForNewTrainingContent()
      },
      4 * 60 * 60 * 1000,
    ) // 4 hours in milliseconds

    // Check immediately on mount
    checkForNewTrainingContent()

    return () => clearInterval(checkInterval)
  }, [])

  // Simulate receiving new messages periodically
  useEffect(() => {
    const messageInterval = setInterval(() => {
      // Randomly add new messages (20% chance every 45 seconds)
      if (Math.random() < 0.2) {
        addNewMessage()
      }
    }, 45000) // 45 seconds

    return () => clearInterval(messageInterval)
  }, [])

  // Simulate receiving new notifications periodically
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      // Randomly add new notifications (15% chance every 60 seconds)
      if (Math.random() < 0.15) {
        addNewNotification()
      }
    }, 60000) // 60 seconds

    return () => clearInterval(notificationInterval)
  }, [])

  const markMessagesAsRead = () => {
    setUnreadMessagesCount(0)
  }

  const markNotificationsAsRead = () => {
    setUnreadNotificationsCount(0)
  }

  const markTrainingAsVisited = () => {
    setHasNewTrainingContent(false)
    setLastTrainingVisit(Date.now())
  }

  const addNewMessage = () => {
    setUnreadMessagesCount((prev) => prev + 1)
  }

  const addNewNotification = () => {
    setUnreadNotificationsCount((prev) => prev + 1)
  }

  const checkForNewTrainingContent = () => {
    const now = Date.now()
    const fourHours = 4 * 60 * 60 * 1000

    if (now - lastTrainingVisit >= fourHours) {
      setHasNewTrainingContent(true)
    }
  }

  return (
    <MemberNotificationContext.Provider
      value={{
        unreadMessagesCount,
        unreadNotificationsCount,
        hasNewTrainingContent,
        lastTrainingVisit,
        markMessagesAsRead,
        markNotificationsAsRead,
        markTrainingAsVisited,
        addNewMessage,
        addNewNotification,
        checkForNewTrainingContent,
      }}
    >
      {children}
    </MemberNotificationContext.Provider>
  )
}

export function useMemberNotifications() {
  const context = useContext(MemberNotificationContext)
  if (context === undefined) {
    throw new Error("useMemberNotifications must be used within a MemberNotificationProvider")
  }
  return context
} 