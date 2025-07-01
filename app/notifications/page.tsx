"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Search,
  TrendingUp,
  Bell,
  MessageSquare,
  Users,
  Trophy,
  CheckCircle,
  Filter,
  X,
  EyeOff,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import { useAdvancedNotifications, AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"
import { NotificationCard } from "@/components/notifications/notification-card"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

function NotificationsPageContent() {
  const { isMobile, isTablet } = useMobileDetection()

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    filterNotifications,
  } = useAdvancedNotifications()

  // Local helper functions to replace missing ones
  const getNotificationsByType = (type: string) => {
    return notifications.filter((notification) => notification.type === type)
  }

  const [activeTab, setActiveTab] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)

  // Quick search suggestions for athletes
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

  // Get filtered notifications based on active tab
  const getFilteredNotifications = () => {
    let filtered = notifications

    if (activeTab !== "all") {
      filtered = getNotificationsByType(activeTab)
    }

    if (selectedFilter !== "all") {
      filtered = filterNotifications(filtered, selectedFilter)
    }

    return filtered
  }

  const filteredNotifications = getFilteredNotifications()

  // Handle notification actions
  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
  }

  const handleArchive = (id: string) => {
    archiveNotification(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleDismissAll = () => {
    // Implementation for dismiss all
    notifications.forEach((notification) => {
      if (!notification.read) {
        markAsRead(notification.id)
      }
    })
  }

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchFocus = () => {
    setShowSearchDropdown(true)
  }

  const handleSearchSelect = (search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }

  // Get notification counts by type
  const getNotificationCounts = () => {
    return {
      all: notifications.length,
      messages: getNotificationsByType("message").length,
      subscribers: getNotificationsByType("subscriber").length,
      achievements: getNotificationsByType("achievement").length,
      system: getNotificationsByType("system").length,
    }
  }

  const counts = getNotificationCounts()

  const DesktopHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                <Image
                  src="/prologue-main-logo.png"
                  alt="PROLOGUE"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                PROLOGUE
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search athletes, content..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  onFocus={handleSearchFocus}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showSearchDropdown && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
                    <div className="space-y-1">
                      {quickSearches.map((search, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                          onClick={() => handleSearchSelect(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <AthleteNav currentPath="/notifications" />

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-1" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="flex items-center w-full">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/promote" className="flex items-center w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Promote
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )

  const MainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"}`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>
                {isMobile ? "Notifications" : "Athlete Notifications"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isMobile
                  ? unreadCount > 0
                    ? `${unreadCount} unread`
                    : "All caught up!"
                  : "Stay connected with your audience and opportunities"}
              </p>
              {unreadCount > 0 && !isMobile && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 mt-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>
          <div className={`flex ${isMobile ? "w-full space-x-2" : "space-x-3"}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={isMobile ? "flex-1" : ""} size={isMobile ? "sm" : "default"}>
                  <Filter className="h-4 w-4 mr-2" />
                  {isMobile ? "Filter" : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Notifications</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("unread")}>Unread Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("today")}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("week")}>This Week</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size={isMobile ? "sm" : "default"}
                className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? "flex-1" : ""}`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isMobile ? "Mark Read" : "Mark All Read"}
              </Button>
            )}
            {!isMobile && (
              <Button onClick={handleDismissAll} variant="outline" size="sm">
                <EyeOff className="h-4 w-4 mr-2" />
                Dismiss All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Stats - Responsive Grid */}
      <div
        className={`grid ${isMobile ? "grid-cols-2 gap-3" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-4 gap-6"} mb-6`}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Total</CardTitle>
            <Bell className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{counts.all}</div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>All notifications</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Messages</CardTitle>
            <MessageSquare className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{counts.messages}</div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>New messages</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Subscribers</CardTitle>
            <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{counts.subscribers}</div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>New subscribers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Achievements</CardTitle>
            <Trophy className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{counts.achievements}</div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Milestones reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Tabs - Responsive Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className={`${isMobile ? "space-y-2" : ""}`}>
          <TabsList className={`${isMobile ? "grid w-full grid-cols-3 h-auto" : "grid w-full grid-cols-5"}`}>
            <TabsTrigger
              value="all"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <Bell className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>{isMobile ? "All" : `All (${counts.all})`}</span>
              {isMobile && <span className="text-xs text-gray-500">({counts.all})</span>}
            </TabsTrigger>
            <TabsTrigger
              value="message"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <MessageSquare className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>
                {isMobile ? "Messages" : `Messages (${counts.messages})`}
              </span>
              {isMobile && <span className="text-xs text-gray-500">({counts.messages})</span>}
            </TabsTrigger>
            <TabsTrigger
              value="subscriber"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>
                {isMobile ? "Subs" : `Subscribers (${counts.subscribers})`}
              </span>
              {isMobile && <span className="text-xs text-gray-500">({counts.subscribers})</span>}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="achievement" className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Achievements ({counts.achievements})</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>System ({counts.system})</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {isMobile && (
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="achievement" className="flex items-center flex-col space-y-1 py-3">
                <Trophy className="h-3 w-3" />
                <span className="text-xs">Achievements</span>
                <span className="text-xs text-gray-500">({counts.achievements})</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center flex-col space-y-1 py-3">
                <Settings className="h-3 w-3" />
                <span className="text-xs">System</span>
                <span className="text-xs text-gray-500">({counts.system})</span>
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        {/* All Notifications */}
        <TabsContent value="all" className="space-y-3">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleArchive}
                  onDelete={handleDelete}
                  onPerformAction={(notificationId, actionId) => {
                    console.log("Performing action:", actionId, "on notification:", notificationId)
                  }}
                  showDismissButton={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {selectedFilter === "unread"
                    ? "You have no unread notifications"
                    : "You don't have any notifications yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="message" className="space-y-3">
          {getNotificationsByType("message").length > 0 ? (
            <div className="space-y-3">
              {getNotificationsByType("message").map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleArchive}
                  onDelete={handleDelete}
                  onPerformAction={(notificationId, actionId) => {
                    console.log("Performing action:", actionId, "on notification:", notificationId)
                  }}
                  showDismissButton={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No message notifications</h3>
                <p className="text-gray-600">Message notifications will appear here when you receive new messages.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscriber" className="space-y-3">
          {getNotificationsByType("subscriber").length > 0 ? (
            <div className="space-y-3">
              {getNotificationsByType("subscriber").map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleArchive}
                  onDelete={handleDelete}
                  onPerformAction={(notificationId, actionId) => {
                    console.log("Performing action:", actionId, "on notification:", notificationId)
                  }}
                  showDismissButton={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriber notifications</h3>
                <p className="text-gray-600">Notifications about new subscribers will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievement" className="space-y-3">
          {getNotificationsByType("achievement").length > 0 ? (
            <div className="space-y-3">
              {getNotificationsByType("achievement").map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleArchive}
                  onDelete={handleDelete}
                  onPerformAction={(notificationId, actionId) => {
                    console.log("Performing action:", actionId, "on notification:", notificationId)
                  }}
                  showDismissButton={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievement notifications</h3>
                <p className="text-gray-600">Achievement and milestone notifications will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-3">
          {getNotificationsByType("system").length > 0 ? (
            <div className="space-y-3">
              {getNotificationsByType("system").map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleArchive}
                  onDelete={handleDelete}
                  onPerformAction={(notificationId, actionId) => {
                    console.log("Performing action:", actionId, "on notification:", notificationId)
                  }}
                  showDismissButton={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No system notifications</h3>
                <p className="text-gray-600">System updates and announcements will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/notifications"
        showBottomNav={true}
        unreadNotifications={unreadCount}
        unreadMessages={0}
        hasNewContent={false}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopHeader />
      <MainContent />
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <AdvancedNotificationProvider>
      <NotificationsPageContent />
    </AdvancedNotificationProvider>
  )
} 