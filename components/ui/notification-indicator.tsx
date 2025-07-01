"use client"

import { useAdvancedNotifications } from "@/contexts/advanced-notification-context"
import { Bell } from "lucide-react"

export function NotificationIndicator() {
  const { unreadCount } = useAdvancedNotifications()

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </div>
  )
} 