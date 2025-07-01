"use client"
import Link from "next/link"
import { Home, FileText, MessageSquare, MessageCircle } from "lucide-react"
import { useAdvancedNotifications } from "@/contexts/advanced-notification-context"
import { NotificationIndicator } from "@/components/ui/notification-indicator"

interface AthleteNavProps {
  currentPath?: string
}

export function AthleteNav({ currentPath = "" }: AthleteNavProps) {
  const { hasNotifications, hasUnreadMessages } = useAdvancedNotifications()

  const isActive = (path: string) => currentPath === path

  return (
    <nav className="hidden lg:flex items-center space-x-6">
      <Link
        href="/home"
        className={`flex flex-col items-center space-y-1 transition-colors group ${
          isActive("/home") ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs font-medium">Home</span>
        <div
          className={`w-full h-0.5 bg-blue-500 transition-opacity ${
            isActive("/home") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        ></div>
      </Link>

      <Link
        href="/content"
        className={`flex flex-col items-center space-y-1 transition-colors group ${
          isActive("/content") ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
        }`}
      >
        <FileText className="h-5 w-5" />
        <span className="text-xs font-medium">Content</span>
        <div
          className={`w-full h-0.5 bg-blue-500 transition-opacity ${
            isActive("/content") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        ></div>
      </Link>

      <Link
        href="/feedback"
        className={`flex flex-col items-center space-y-1 transition-colors group ${
          isActive("/feedback") ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
        }`}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-xs font-medium">Feedback</span>
        <div
          className={`w-full h-0.5 bg-blue-500 transition-opacity ${
            isActive("/feedback") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        ></div>
      </Link>

      <Link
        href="/messaging"
        className={`flex flex-col items-center space-y-1 transition-colors relative group ${
          isActive("/messaging") ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
        }`}
      >
        <div className="relative">
          <MessageCircle className="h-5 w-5" />
          {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
        </div>
        <span className="text-xs font-medium">Messaging</span>
        <div
          className={`w-full h-0.5 bg-blue-500 transition-opacity ${
            isActive("/messaging") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        ></div>
      </Link>

      <Link
        href="/notifications"
        className={`flex flex-col items-center space-y-1 transition-colors relative group ${
          isActive("/notifications") ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
        }`}
      >
        <NotificationIndicator />
        <span className="text-xs font-medium">Notifications</span>
        <div
          className={`w-full h-0.5 bg-blue-500 transition-opacity ${
            isActive("/notifications") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        ></div>
      </Link>
    </nav>
  )
} 