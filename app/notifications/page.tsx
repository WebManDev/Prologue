"use client"

import type React from "react"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Search,
  Bell,
  User,
  ChevronDown,
  CheckCircle,
  SlidersHorizontal,
  X,
  Home,
  MessageCircle,
  BookOpen,
  MessageSquare,
  Filter,
  TrendingUp,
  Trophy,
  Calendar,
  AlertTriangle,
  Heart,
  Archive,
  Trash2,
  MoreVertical,
  Clock,
  Star,
  Video,
  FileText,
  Users,
  UserPlus,
} from "lucide-react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import Link from "next/link"
import Image from "next/image"
import { auth, getAthleteProfile } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore"
import type { User as FirebaseUser } from "firebase/auth"
import { db } from "@/lib/firebase"
import AthleteMobileNavigation from "@/components/mobile/athlete-mobile-navigation"
import { AthleteHeader } from "@/components/navigation/athlete-header"
import AthleteDashboardMobileLayout from "@/components/mobile/athlete-dashboard-mobile-layout"

// Static data to prevent recreation on every render
const QUICK_SEARCHES = [
  "New Subscribers",
  "Post Engagement",
  "Message Requests",
  "Feedback Requests",
  "Training Updates",
  "Achievement Unlocked",
  "Payment Notifications",
  "System Alerts",
]

// Notification types for athletes
const NOTIFICATION_TYPES = [
  { value: "all", label: "All Notifications" },
  { value: "subscriber", label: "Subscribers" },
  { value: "social", label: "Social" },
  { value: "message", label: "Messages" },
  { value: "feedback", label: "Feedback" },
  { value: "achievement", label: "Achievements" },
  { value: "system", label: "System" },
  { value: "payment", label: "Payments" },
]

export default function NotificationsPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const router = useRouter()
  const { logout } = useUnifiedLogout()

  // Enhanced state management
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "unread">("newest")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [notificationsList, setNotificationsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [athleteProfile, setAthleteProfile] = useState<any>(null)

  // Refs for maintaining focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get current user and profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUserId(user.uid)
        try {
          const profile = await getAthleteProfile(user.uid)
          setAthleteProfile(profile)
        } catch (error) {
          console.error("Error fetching athlete profile:", error)
        }
      } else {
        setCurrentUserId(null)
        setAthleteProfile(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Real-time notifications listener
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Listen to notifications for the current athlete
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("recipientId", "==", currentUserId),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt ? formatTimestamp(doc.data().createdAt) : "Just now"
      }))
      setNotificationsList(notifications)
      setLoading(false)
    }, (error) => {
      console.error("Error listening to notifications:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUserId])

  // Listen for new subscriptions to the athlete
  useEffect(() => {
    if (!currentUserId) return

    // Listen for new subscriptions to this athlete
    const subscriptionsQuery = query(
      collection(db, "subscriptions"),
      where("athleteId", "==", currentUserId),
      orderBy("createdAt", "desc")
    )

    const subscriptionsUnsubscribe = onSnapshot(subscriptionsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const subscriptionData = change.doc.data()

          // Get the member who subscribed
          const memberDoc = await getDoc(doc(db, "members", subscriptionData.memberId))
          const memberData = memberDoc.exists() ? memberDoc.data() : { firstName: "Someone" }

          // Create notification
          await createNotification({
            type: "subscriber",
            title: "New Subscriber!",
            message: `${memberData.firstName} ${memberData.lastName || ""} subscribed to your content.`,
            recipientId: currentUserId,
            senderId: subscriptionData.memberId,
            senderName: `${memberData.firstName} ${memberData.lastName || ""}`,
            priority: "high",
            category: "New Subscriber",
            actionType: "view_profile",
            actionUrl: `/member/${subscriptionData.memberId}`,
            metadata: {
              subscriptionId: change.doc.id,
              subscriptionType: subscriptionData.planType || "standard",
              subscriptionPrice: subscriptionData.price
            }
          })
        }
      })
    })

    return () => subscriptionsUnsubscribe()
  }, [currentUserId])

  // Note: Like and comment notifications are now created automatically 
  // in the likePost and addCommentToPost functions in firebase.ts

  // Note: Message notifications are now created automatically when messages are sent via sendMessage function

  // Listen for feedback requests sent to the athlete
  useEffect(() => {
    if (!currentUserId) return

    // Listen for new feedback requests
    const feedbackRequestsQuery = query(
      collection(db, "feedbackRequests"),
      where("athleteId", "==", currentUserId),
      orderBy("createdAt", "desc")
    )

    const feedbackUnsubscribe = onSnapshot(feedbackRequestsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const feedbackData = change.doc.data()

          // Get the member info
          const memberDoc = await getDoc(doc(db, "members", feedbackData.memberId))
          const memberData = memberDoc.exists() ? memberDoc.data() : { firstName: "Member" }

          // Create notification
          await createNotification({
            type: "feedback",
            title: "New Feedback Request",
            message: `${memberData.firstName} ${memberData.lastName || ""} requested feedback on their ${feedbackData.contentType || "submission"}.`,
            recipientId: currentUserId,
            senderId: feedbackData.memberId,
            senderName: `${memberData.firstName} ${memberData.lastName || ""}`,
            priority: "medium",
            category: "Feedback Request",
            actionType: "provide_feedback",
            actionUrl: `/feedback/${change.doc.id}`,
            metadata: {
              feedbackRequestId: change.doc.id,
              contentType: feedbackData.contentType,
              requestedAreas: feedbackData.requestedAreas,
              deadline: feedbackData.deadline
            }
          })
        }
      })
    })

    return () => feedbackUnsubscribe()
  }, [currentUserId])

  // Helper function to create notifications
  const createNotification = async (notificationData: any) => {
    try {
      await addDoc(collection(db, "notifications"), {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false
      })
    } catch (error) {
      console.error("Error creating notification:", error)
    }
  }

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Just now"
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  // Enhanced filtering logic
  const filteredNotifications = useMemo(() => {
    const filtered = notificationsList.filter((notification) => {
      // Type filter
      if (selectedType !== "all" && notification.type !== selectedType) return false

      // Priority filter
      if (selectedPriority !== "all" && notification.priority !== selectedPriority) return false

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query) ||
          notification.senderName?.toLowerCase().includes(query) ||
          notification.category.toLowerCase().includes(query)
        )
      }

      return true
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt?.toDate?.() || b.createdAt || 0).getTime() - new Date(a.createdAt?.toDate?.() || a.createdAt || 0).getTime()
        case "oldest":
          return new Date(a.createdAt?.toDate?.() || a.createdAt || 0).getTime() - new Date(b.createdAt?.toDate?.() || b.createdAt || 0).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        case "unread":
          return Number(!a.read) - Number(!b.read)
        default:
          return 0
      }
    })

    return filtered
  }, [selectedType, selectedPriority, searchQuery, sortBy, notificationsList])

  // Get unread count
  const unreadCount = useMemo(() => {
    return notificationsList.filter(n => !n.read).length
  }, [notificationsList])

  // Stable event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSearchDropdown(e.target.value.length > 0)
  }, [])

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.length > 0) {
      setShowSearchDropdown(true)
    }
  }, [searchQuery])

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSearchDropdown(false), 200)
  }, [])

  const handleQuickSearchSelect = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm)
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }, [])

  const handleNotificationClick = useCallback(async (notification: any) => {
    try {
      // Mark as read in Firebase
      if (!notification.read) {
        await updateDoc(doc(db, "notifications", notification.id), {
          read: true,
          readAt: serverTimestamp()
        })
      }
      
      // Navigate to action URL
      if (notification.actionUrl) {
        router.push(notification.actionUrl)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [router])

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [])

  const handleMarkAsUnread = useCallback(async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: false
      })
    } catch (error) {
      console.error("Error marking notification as unread:", error)
    }
  }, [])

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        deleted: true,
        deletedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }, [])

  const handleBulkMarkAsRead = useCallback(async () => {
    try {
      if (selectedNotifications.length > 0) {
        // Mark selected notifications as read
        const updatePromises = selectedNotifications.map(id => 
          updateDoc(doc(db, "notifications", id), {
            read: true,
            readAt: serverTimestamp()
          })
        )
        await Promise.all(updatePromises)
        setSelectedNotifications([])
      } else {
        // Mark all filtered notifications as read
        const updatePromises = filteredNotifications
          .filter(n => !n.read)
          .map(n => 
            updateDoc(doc(db, "notifications", n.id), {
              read: true,
              readAt: serverTimestamp()
            })
          )
        await Promise.all(updatePromises)
      }
    } catch (error) {
      console.error("Error bulk marking as read:", error)
    }
  }, [selectedNotifications, filteredNotifications])

  const handleBulkDelete = useCallback(async () => {
    try {
      if (selectedNotifications.length > 0) {
        const updatePromises = selectedNotifications.map(id => 
          updateDoc(doc(db, "notifications", id), {
            deleted: true,
            deletedAt: serverTimestamp()
          })
        )
        await Promise.all(updatePromises)
        setSelectedNotifications([])
      }
    } catch (error) {
      console.error("Error bulk deleting:", error)
    }
  }, [selectedNotifications])

  const clearAllFilters = useCallback(() => {
    setSelectedType("all")
    setSelectedPriority("all")
    setSearchQuery("")
  }, [])

  const hasActiveFilters = selectedType !== "all" || selectedPriority !== "all" || searchQuery

  // Get notification icon and styling
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "subscriber":
        return { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-100" }
      case "social":
        return { icon: Heart, color: "text-pink-500", bg: "bg-pink-100" }
      case "message":
        return { icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-100" }
      case "feedback":
        return { icon: MessageSquare, color: "text-green-500", bg: "bg-green-100" }
      case "achievement":
        return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100" }
      case "payment":
        return { icon: Users, color: "text-emerald-500", bg: "bg-emerald-100" }
      case "system":
        return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" }
      default:
        return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-300"
    }
  }

  // Memoized search dropdown
  const SearchDropdown = useMemo(() => {
    if (!showSearchDropdown || !searchQuery) return null

    const filteredSearches = QUICK_SEARCHES.filter((search) => search.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
        <div className="p-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Searches</p>
          <div className="space-y-1">
            {filteredSearches.map((search) => (
              <button
                key={search}
                onClick={() => handleQuickSearchSelect(search)}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [showSearchDropdown, searchQuery, handleQuickSearchSelect])

  // Enhanced Notification Card Component
  const NotificationCard = useCallback(
    ({ notification }: { notification: any }) => {
      const { icon: IconComponent, color, bg } = getNotificationIcon(notification.type)
      const isSelected = selectedNotifications.includes(notification.id)

      return (
        <Card 
          className={`bg-white border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'ring-2 ring-prologue-electric/20' : ''} ${isSelected ? 'ring-2 ring-prologue-electric' : ''}`}
          onClick={() => handleNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {/* Notification Icon */}
              <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                <IconComponent className={`h-5 w-5 ${color}`} />
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold text-gray-900 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-prologue-electric rounded-full"></div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {notification.category}
                    </Badge>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {notification.read ? (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsUnread(notification.id)
                        }}>
                          Mark as Unread
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}>
                          Mark as Read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                  {notification.message}
                </p>

                {/* Metadata */}
                {notification.metadata && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-600 space-y-1">
                      {notification.type === "subscriber" && notification.metadata.subscriptionPrice && (
                        <div>Plan: {notification.metadata.subscriptionType} • ${notification.metadata.subscriptionPrice}/month</div>
                      )}
                      {notification.type === "feedback" && notification.metadata.contentType && (
                        <div>Content: {notification.metadata.contentType} {notification.metadata.deadline && `• Due: ${new Date(notification.metadata.deadline).toLocaleDateString()}`}</div>
                      )}
                      {notification.type === "social" && notification.metadata.postTitle && (
                        <div>Post: "{notification.metadata.postTitle}"</div>
                      )}
                      {notification.type === "message" && notification.metadata.messagePreview && (
                        <div>Preview: "{notification.metadata.messagePreview.substring(0, 50)}..."</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{notification.senderName || "PROLOGUE"}</span>
                  </div>
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    [selectedNotifications, handleNotificationClick, handleMarkAsRead, handleMarkAsUnread, handleDeleteNotification],
  )

  if (isMobile || isTablet) {
    return (
      <AthleteDashboardMobileLayout
        currentPath="/notifications"
        unreadNotifications={unreadCount}
        unreadMessages={0}
        profilePhotoUrl={athleteProfile?.profilePhotoUrl || athleteProfile?.profileImageUrl || null}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">{unreadCount} unread notifications</p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleBulkMarkAsRead}
                size="sm"
                className="bg-prologue-electric hover:bg-prologue-blue text-white"
              >
                Mark All Read
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-12 pr-12 h-12 bg-white border-0 shadow-lg rounded-xl focus:ring-2 focus:ring-prologue-electric/20 text-base"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {SearchDropdown}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 h-10 px-4 bg-white shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 px-4 bg-white shadow-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("priority")}>By Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("unread")}>Unread First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-prologue-electric">
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                          {NOTIFICATION_TYPES.find(t => t.value === selectedType)?.label || "All Types"}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {NOTIFICATION_TYPES.map((type) => (
                          <DropdownMenuItem key={type.value} onClick={() => setSelectedType(type.value)}>
                            {type.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                          {selectedPriority === "all" ? "All Priorities" : selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => setSelectedPriority("all")}>All Priorities</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("high")}>High</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>Medium</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Low</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prologue-electric"></div>
                <span className="ml-3 text-gray-600">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="text-center py-16">
                <Bell className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">No notifications found</h3>
                <p className="text-gray-600">
                  {hasActiveFilters 
                    ? "Try adjusting your filters to see more notifications."
                    : "You're all caught up! New notifications will appear here."}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} variant="outline" className="h-12 px-6 bg-white shadow-sm">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </AthleteDashboardMobileLayout>
    )
  }

  // Desktop/tablet header
  return (
    <div className="min-h-screen bg-gray-50">
      <AthleteHeader
        currentPath="/notifications"
        onLogout={logout}
        showSearch={false}
        unreadNotifications={unreadCount}
        unreadMessages={0}
        profileData={athleteProfile}
        profileImageUrl={athleteProfile?.profileImageUrl || null}
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Athlete Notifications</h1>
              <p className="text-gray-600">Stay connected with your audience and opportunities</p>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="text-sm">
                  {unreadCount} unread
                </Badge>
                <Button
                  onClick={handleBulkMarkAsRead}
                  className="bg-prologue-electric hover:bg-prologue-blue text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search notifications by title, message, or sender..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="pl-12 pr-12 h-12 bg-gray-50 border-0 focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric text-lg rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  )}
                  {SearchDropdown}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Type Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <span className="mr-2">Type:</span>
                        {NOTIFICATION_TYPES.find(t => t.value === selectedType)?.label.replace(" Notifications", "") || "All"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      {NOTIFICATION_TYPES.map((type) => (
                        <DropdownMenuItem key={type.value} onClick={() => setSelectedType(type.value)}>
                          {type.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Priority Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <span className="mr-2">Priority:</span>
                        {selectedPriority === "all" ? "All" : selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedPriority("all")}>All Priorities</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPriority("high")}>High Priority</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>Medium Priority</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Low Priority</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Sort by {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "priority" ? "Priority" : "Unread"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("priority")}>By Priority</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("unread")}>Unread First</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="text-gray-600 hover:text-gray-900 h-8 px-3 text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prologue-electric"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="text-center py-20">
              <Bell className="h-24 w-24 mx-auto mb-8 text-gray-300" />
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                {hasActiveFilters ? "No notifications found" : "You're all caught up!"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                {hasActiveFilters 
                  ? "Try adjusting your search or filters to find specific notifications."
                  : "New notifications will appear here as you engage with your audience and receive updates."}
              </p>
              <div className="space-x-4">
                {hasActiveFilters ? (
                  <>
                    <Button onClick={clearAllFilters} variant="outline" className="h-12 px-8 bg-white shadow-sm">
                      Clear All Filters
                    </Button>
                    <Button
                      onClick={() => setSearchQuery("")}
                      className="bg-prologue-electric hover:bg-prologue-blue text-white h-12 px-8"
                    >
                      Show All Notifications
                    </Button>
                  </>
                ) : (
                  <Link href="/content">
                    <Button className="bg-prologue-electric hover:bg-prologue-blue text-white h-12 px-8">
                      Create New Content
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

 