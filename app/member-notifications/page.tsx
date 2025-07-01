"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  Bell,
  Home,
  LayoutDashboard,
  MessageCircle,
  ChevronDown,
  LogOut,
  Search,
  BookOpen,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Heart,
  MessageCircleIcon,
  Calendar,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
  X,
  Compass,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import MemberMobileNavigation from "@/components/mobile/member-mobile-navigation"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth, getMemberProfile } from "@/lib/firebase"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"

export default function MemberNotificationsPage() {
  const { unreadMessagesCount, unreadNotificationsCount, markNotificationsAsRead, hasNewTrainingContent } =
    useMemberNotifications()
  const { isMobile, isTablet } = useMobileDetection()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Quick search suggestions
  const quickSearches = [
    "Navigate Recruitment",
    "Nutrition",
    "NIL",
    "Training Programs",
    "Mental Performance",
    "Injury Prevention",
    "Sports Psychology",
    "Athletic Scholarships",
  ]

  // Mock search results based on query
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return []

    const mockResults = [
      {
        type: "coach",
        name: "Sarah Martinez",
        sport: "Tennis",
        followers: "15.2K",
        rating: 4.9,
        specialty: "Serve Technique",
      },
      {
        type: "coach",
        name: "Mike Johnson",
        sport: "Basketball",
        followers: "8.7K",
        rating: 4.8,
        specialty: "Mental Performance",
      },
      {
        type: "content",
        title: "Advanced Serve Training",
        creator: "Elite Tennis Academy",
        views: "25K",
        duration: "15 min",
      },
      {
        type: "content",
        title: "Mental Toughness Guide",
        creator: "Sports Psychology Pro",
        views: "18K",
        duration: "22 min",
      },
    ].filter(
      (result) =>
        result.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.creator?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return mockResults
  }, [searchQuery])

  // Search handlers
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleSearchFocus = React.useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = React.useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
    console.log("Searching for:", search)
  }, [])

  const clearSearch = React.useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }, [])

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
      senderAvatar: "/Prologue LOGO-1.png",
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
      senderAvatar: "/Prologue LOGO-1.png",
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

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  const handleLogout = React.useCallback(async () => {
    await logout({
      customMessage: "Securing your member account and logging out...",
      onComplete: () => {
        // Optionally show a toast or message
      },
      onError: (error) => {
        // Optionally show a toast or message
        console.error("Logout failed from notifications page:", error)
      },
    })
  }, [logout])

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "unread") return !notification.read
    return notification.type === selectedFilter
  })

  const getNotificationStats = () => {
    const total = notifications.length
    const unread = notifications.filter((n) => !n.read).length
    const training = notifications.filter((n) => n.type === "training").length
    const feedback = notifications.filter((n) => n.type === "feedback").length
    const achievements = notifications.filter((n) => n.type === "achievement").length

    return { total, unread, training, feedback, achievements }
  }

  const stats = getNotificationStats()

  const [profileData, setProfileData] = useState({ firstName: "", lastName: "", profileImageUrl: null })
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [memberStats, setMemberStats] = useState({ activeCoaches: 2, thisWeek: 3, totalSessions: 18, improvement: 15 })

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return
      const memberProfile = await getMemberProfile(auth.currentUser.uid)
      if (memberProfile) {
        setProfileData({
          firstName: memberProfile.firstName || "",
          lastName: memberProfile.lastName || "",
          profileImageUrl: memberProfile.profileImageUrl || null,
        })
        setProfileImageUrl(memberProfile.profileImageUrl || null)
        // Optionally load stats from memberProfile if available
        setMemberStats({
          activeCoaches: memberProfile.activeCoaches || 2,
          thisWeek: memberProfile.thisWeek || 3,
          totalSessions: memberProfile.totalSessions || 18,
          improvement: memberProfile.improvement || 15,
        })
      }
    }
    loadProfile()
  }, [])

  // Memoized search dropdown content
  const searchDropdownContent = React.useMemo(() => {
    const displayItems = searchQuery ? searchResults : quickSearches.slice(0, 8)
    const isShowingResults = searchQuery && searchResults.length > 0
    const isShowingQuickSearches = !searchQuery

    return (
      <div
        className={`${isMobile || isTablet ? "mt-2" : "absolute top-full left-0 mt-1 w-80"} bg-white border border-gray-200 rounded-lg shadow-lg z-50`}
      >
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {isShowingResults ? `Results for "${searchQuery}"` : "Quick Searches"}
          </h4>
          <div className="space-y-1">
            {isShowingQuickSearches &&
              displayItems.map((search, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                  onClick={() => handleSearchSelect(typeof search === 'string' ? search : search.name || search.title || '')}
                >
                  {typeof search === 'string' ? search : search.name || search.title || ''}
                </button>
              ))}

            {isShowingResults &&
              displayItems.map((result, index) => {
                if (typeof result === 'string') return null
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleSearchSelect(result.name || result.title || '')}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{result.name || result.title}</h5>
                      <p className="text-xs text-gray-600">
                        {result.type === "coach"
                          ? `${result.sport} • ${result.followers} followers`
                          : `${result.creator} • ${result.views} views`}
                      </p>
                    </div>
                  </div>
                )
              })}

            {searchQuery && searchResults.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No results found for "{searchQuery}"</div>
            )}
          </div>
        </div>
      </div>
    )
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect, isMobile, isTablet])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard-style Header */}
      <MemberHeader
        currentPath="/member-notifications"
        onLogout={handleLogout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-6 py-8 ${isMobile || isTablet ? "pb-20" : ""}`}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Stay updated with your training progress and messages</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Notifications</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("unread")}>Unread Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("training")}>Training</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("feedback")}>Feedback</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("achievement")}>Achievements</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("message")}>Messages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("social")}>Social</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="bg-transparent">
              <Archive className="h-4 w-4 mr-2" />
              Archive All
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Training</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.training}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.feedback}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.achievements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add dashboard widgets above notifications list */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
          <Card className="p-3 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Active Coaches</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.activeCoaches}</p>
              </div>
              <User className="h-6 w-6 lg:h-8 lg:w-8 text-prologue-electric" />
            </div>
          </Card>
          <Card className="p-3 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">This Week</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.thisWeek}</p>
              </div>
              <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-3 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.totalSessions}</p>
              </div>
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-3 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Improvement</p>
                <p className="text-lg lg:text-2xl font-bold text-green-600">+{memberStats.improvement}%</p>
              </div>
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Notifications</span>
              <Badge variant="secondary" className="bg-prologue-electric/10 text-prologue-electric">
                {filteredNotifications.length} notifications
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const IconComponent = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                      !notification.read
                        ? "bg-prologue-electric/5 border-prologue-electric/20"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.iconBg}`}>
                        <IconComponent className={`h-6 w-6 ${notification.iconColor}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          {!notification.read && <div className="w-2 h-2 bg-prologue-electric rounded-full"></div>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
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

                      <p className="text-gray-600 mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={notification.senderAvatar || "/placeholder.svg"}
                            alt={notification.sender}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-600">{notification.sender}</span>
                        </div>

                        <div className="flex items-center space-x-2">
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
                  </div>
                )
              })}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">
                    {selectedFilter === "all"
                      ? "You're all caught up! No new notifications."
                      : `No ${selectedFilter} notifications found.`}
                  </p>
                </div>
              )}
            </div>

            {filteredNotifications.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline">Load More Notifications</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <MemberMobileNavigation />
      )}

      <LogoutNotification
        isVisible={loadingState.isVisible}
        userType={loadingState.userType}
        stage={loadingState.stage}
        message={loadingState.message}
        error={loadingState.error}
        canRetry={loadingState.canRetry}
        onRetry={retryLogout}
        onCancel={cancelLogout}
      />
    </div>
  )
}
