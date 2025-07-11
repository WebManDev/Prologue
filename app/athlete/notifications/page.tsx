"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  ChevronDown,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Trophy,
  Heart,
  MessageCircleIcon,
  Calendar,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
  Settings,
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import AthleteMobileNavigation from "@/components/mobile/athlete-mobile-navigation"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AthleteNotificationsPage() {
  const { unreadMessagesCount, unreadNotificationsCount, markNotificationsAsRead, hasNewTrainingContent } =
    useMemberNotifications()
  const { isMobile, isTablet } = useMobileDetection()
  const { logout } = useUnifiedLogout()

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "training",
      title: "New Training Program Available",
      message: "Coach Sarah Martinez has uploaded a new serve technique program for you.",
      timestamp: "2 minutes ago",
      read: false,
      icon: BookOpen,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      sender: "Coach Sarah Martinez",
      senderAvatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      type: "feedback",
      title: "Feedback Received",
      message: "You received new feedback on your backhand technique video.",
      timestamp: "1 hour ago",
      read: false,
      icon: MessageSquare,
      iconColor: "text-green-500",
      iconBg: "bg-green-100",
      sender: "Elite Tennis Academy",
      senderAvatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      type: "achievement",
      title: "Achievement Unlocked!",
      message: "Congratulations! You've completed 10 training sessions this month.",
      timestamp: "3 hours ago",
      read: true,
      icon: Trophy,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-100",
      sender: "PROLOGUE",
      senderAvatar: "/prologue-main-logo.png",
    },
    {
      id: 4,
      type: "message",
      title: "New Message",
      message: "Coach Mike Johnson sent you a message about your mental training progress.",
      timestamp: "5 hours ago",
      read: true,
      icon: MessageCircleIcon,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
      sender: "Coach Mike Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      type: "reminder",
      title: "Training Session Reminder",
      message: "Don't forget your scheduled training session tomorrow at 3:00 PM.",
      timestamp: "1 day ago",
      read: true,
      icon: Calendar,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
      sender: "PROLOGUE",
      senderAvatar: "/prologue-main-logo.png",
    },
    {
      id: 6,
      type: "social",
      title: "New Follower",
      message: "Alex Johnson started following your progress. Say hello!",
      timestamp: "2 days ago",
      read: true,
      icon: Heart,
      iconColor: "text-pink-500",
      iconBg: "bg-pink-100",
      sender: "Alex Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Mark notifications as read when entering the page
  useEffect(() => {
    if (unreadNotificationsCount > 0) {
      // Simulate reading all notifications after a short delay
      const timer = setTimeout(() => {
        markNotificationsAsRead()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [unreadNotificationsCount, markNotificationsAsRead])

  const handleLogout = async () => {
    console.log("🔄 Athlete logout initiated from notifications page")
    await logout({
      customMessage: "Securing your athlete account and logging out...",
      onComplete: () => {
        console.log("✅ Athlete logout completed successfully from notifications page")
        toast({
          title: "Logged Out Successfully",
          description: "You have been securely logged out. Redirecting to login page...",
          duration: 2000,
        })
      },
      onError: (error) => {
        console.error("❌ Athlete logout failed from notifications page:", error)
        toast({
          title: "Logout Failed",
          description: "There was an issue logging you out. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      },
    })
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "unread") return !notification.read
    return notification.type === selectedFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MemberHeader
        currentPath="/athlete/notifications"
        onLogout={handleLogout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
      />

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-4 lg:px-6 py-6 ${isMobile || isTablet ? "pb-20" : ""}`}>
        {/* Simple Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 bg-white border-gray-300">
                  <Filter className="h-4 w-4" />
                  <span className="capitalize">
                    {selectedFilter === "all" ? "All" : selectedFilter.replace("-", " ")}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("unread")}>Unread</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("training")}>Training</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("feedback")}>Feedback</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("achievement")}>Achievements</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("message")}>Messages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("social")}>Social</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-1">
          {filteredNotifications.map((notification) => {
            const IconComponent = notification.icon
            return (
              <Card
                key={notification.id}
                className={`border-0 shadow-none hover:bg-gray-100 transition-colors cursor-pointer ${
                  !notification.read ? "bg-blue-50 border-l-4 border-l-prologue-electric" : "bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={notification.senderAvatar || "/placeholder.svg"}
                        alt={notification.sender}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                          {!notification.read && <div className="w-2 h-2 bg-prologue-electric rounded-full"></div>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Read
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-2">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{notification.sender}</span>
                          <div
                            className={`w-4 h-4 ${notification.iconBg} rounded-full flex items-center justify-center`}
                          >
                            <IconComponent className={`h-2.5 w-2.5 ${notification.iconColor}`} />
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            notification.type === "training"
                              ? "bg-blue-100 text-blue-700"
                              : notification.type === "feedback"
                                ? "bg-green-100 text-green-700"
                                : notification.type === "achievement"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : notification.type === "message"
                                    ? "bg-purple-100 text-purple-700"
                                    : notification.type === "social"
                                      ? "bg-pink-100 text-pink-700"
                                      : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {selectedFilter === "all"
                  ? "You're all caught up! No new notifications."
                  : `No ${selectedFilter} notifications found.`}
              </p>
            </div>
          )}

          {filteredNotifications.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                Load More Notifications
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <AthleteMobileNavigation
          currentPath="/athleteDashboard"
          unreadMessages={unreadMessagesCount}
        />
      )}
      <Toaster />
    </div>
  )
} 