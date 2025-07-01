"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface NotificationUser {
  id: string
  name: string
  username: string
  avatar?: string
  verified: boolean
  tier: "basic" | "pro" | "elite"
}

export interface NotificationAction {
  id: string
  type: "like" | "follow" | "reply" | "share" | "view" | "accept" | "decline"
  label: string
  primary?: boolean
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention" | "share" | "achievement" | "system" | "payment" | "content"
  category: "social" | "engagement" | "business" | "system" | "content"
  priority: "high" | "medium" | "low"
  title: string
  message: string
  content?: {
    type: "post" | "video" | "image" | "article"
    preview?: string
    thumbnail?: string
  }
  user?: NotificationUser
  users?: NotificationUser[]
  timestamp: Date
  read: boolean
  dismissed: boolean
  actions?: NotificationAction[]
  metadata?: {
    count?: number
    amount?: number
    achievement?: string
    contentId?: string
    relatedUrl?: string
  }
}

export interface NotificationPreferences {
  inApp: {
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    shares: boolean
    achievements: boolean
    system: boolean
    payments: boolean
    content: boolean
  }
  push: {
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    shares: boolean
    achievements: boolean
    system: boolean
    payments: boolean
    content: boolean
  }
  email: {
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    shares: boolean
    achievements: boolean
    system: boolean
    payments: boolean
    content: boolean
  }
  frequency: "instant" | "hourly" | "daily" | "weekly"
  groupSimilar: boolean
  showPreviews: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  autoDismiss: {
    enabled: boolean
    delay: number // in seconds
  }
}

export interface NotificationFilters {
  category: "all" | "social" | "engagement" | "business" | "system" | "content"
  priority: "all" | "high" | "medium" | "low"
  read: "all" | "read" | "unread"
  dateRange: "all" | "today" | "week" | "month"
}

interface AdvancedNotificationContextType {
  notifications: Notification[]
  unreadCount: number
  undismissedCount: number
  hasNotifications: boolean
  preferences: NotificationPreferences
  filters: NotificationFilters
  searchQuery: string
  isRealTimeEnabled: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissNotification: (id: string) => void
  dismissAllNotifications: () => void
  deleteNotification: (id: string) => void
  archiveNotification: (id: string) => void
  performAction: (notificationId: string, actionId: string) => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  setFilters: (filters: Partial<NotificationFilters>) => void
  setSearchQuery: (query: string) => void
  toggleRealTime: () => void
  getFilteredNotifications: () => Notification[]
  filterNotifications: (notifications: Notification[], filter: string) => Notification[]
  getVisibleNotifications: () => Notification[]
  hasUnreadMessages: boolean
  hasNewHomeContent: boolean
  markHomeAsVisited: () => void
  checkForNewHomeContent: () => void
}

const AdvancedNotificationContext = createContext<AdvancedNotificationContextType | undefined>(undefined)

const defaultPreferences: NotificationPreferences = {
  inApp: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    shares: true,
    achievements: true,
    system: true,
    payments: true,
    content: true,
  },
  push: {
    likes: true,
    comments: true,
    follows: true,
    mentions: false,
    shares: true,
    achievements: true,
    system: true,
    payments: true,
    content: false,
  },
  email: {
    likes: false,
    comments: false,
    follows: false,
    mentions: false,
    shares: false,
    achievements: true,
    system: true,
    payments: true,
    content: true,
  },
  frequency: "instant",
  groupSimilar: true,
  showPreviews: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  autoDismiss: {
    enabled: true,
    delay: 10,
  },
}

const defaultFilters: NotificationFilters = {
  category: "all",
  priority: "all",
  read: "all",
  dateRange: "all",
}

// Mock data generator
const generateMockNotifications = (): Notification[] => {
  const users: NotificationUser[] = [
    { id: "1", name: "Alex Johnson", username: "alexj", verified: true, tier: "pro" },
    { id: "2", name: "Sarah Martinez", username: "sarahm", verified: false, tier: "basic" },
    { id: "3", name: "Mike Chen", username: "mikec", verified: true, tier: "elite" },
    { id: "4", name: "Lisa Rodriguez", username: "lisar", verified: false, tier: "pro" },
    { id: "5", name: "David Kim", username: "davidk", verified: true, tier: "basic" },
  ]

  return [
    {
      id: "1",
      type: "like",
      category: "social",
      priority: "medium",
      title: "New Likes",
      message: "Alex Johnson and 12 others liked your training video",
      user: users[0],
      users: [users[0], users[1], users[2]],
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      dismissed: false,
      content: {
        type: "video",
        preview: "5-Minute Morning Workout Routine",
        thumbnail: "/placeholder.svg?height=60&width=60",
      },
      actions: [
        { id: "view", type: "view", label: "View Post" },
        { id: "like", type: "like", label: "Like Back" },
      ],
      metadata: { count: 13, contentId: "post_123", relatedUrl: "/content" },
    },
    {
      id: "2",
      type: "follow",
      category: "social",
      priority: "high",
      title: "New Follower",
      message: "Sarah Martinez started following you",
      user: users[1],
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      dismissed: false,
      actions: [
        { id: "follow", type: "follow", label: "Follow Back", primary: true },
        { id: "view", type: "view", label: "View Profile" },
      ],
      metadata: { relatedUrl: "/dashboard" },
    },
    {
      id: "3",
      type: "comment",
      category: "engagement",
      priority: "high",
      title: "New Comment",
      message: "Mike Chen commented: 'Great form! Can you share more tips?'",
      user: users[2],
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      dismissed: false,
      content: {
        type: "post",
        preview: "Deadlift Technique Breakdown",
      },
      actions: [
        { id: "reply", type: "reply", label: "Reply", primary: true },
        { id: "like", type: "like", label: "Like" },
      ],
      metadata: { relatedUrl: "/feedback" },
    },
    {
      id: "4",
      type: "payment",
      category: "business",
      priority: "high",
      title: "Payment Received",
      message: "You received $29.99 from Lisa Rodriguez for Pro Training Plan",
      user: users[3],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      dismissed: false,
      actions: [{ id: "view", type: "view", label: "View Transaction" }],
      metadata: { amount: 29.99, relatedUrl: "/dashboard" },
    },
    {
      id: "5",
      type: "achievement",
      category: "system",
      priority: "medium",
      title: "Achievement Unlocked!",
      message: "You've reached 1,000 followers! Keep up the great work.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      dismissed: false,
      actions: [
        { id: "share", type: "share", label: "Share Achievement", primary: true },
        { id: "view", type: "view", label: "View Stats" },
      ],
      metadata: { achievement: "1k_followers", relatedUrl: "/dashboard" },
    },
  ]
}

export function AdvancedNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications())
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [filters, setFiltersState] = useState<NotificationFilters>(defaultFilters)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [hasNewHomeContent, setHasNewHomeContent] = useState(false)

  // Auto-dismiss notifications based on preferences
  useEffect(() => {
    if (!preferences.autoDismiss.enabled) return

    const interval = setInterval(() => {
      const now = Date.now()
      const dismissDelay = preferences.autoDismiss.delay * 1000

      setNotifications((prev) =>
        prev.map((notification) => {
          if (!notification.dismissed && notification.read && now - notification.timestamp.getTime() > dismissDelay) {
            return { ...notification, dismissed: true }
          }
          return notification
        }),
      )
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [preferences.autoDismiss])

  // Real-time notification simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      const notificationTypes = ["like", "comment", "follow", "mention"] as const
      const categories = ["social", "engagement"] as const
      const users = [
        { id: "new1", name: "Emma Wilson", username: "emmaw", verified: false, tier: "basic" as const },
        { id: "new2", name: "James Brown", username: "jamesb", verified: true, tier: "pro" as const },
      ]

      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      const randomUser = users[Math.floor(Math.random() * users.length)]

      const newNotification: Notification = {
        id: `realtime_${Date.now()}`,
        type: randomType,
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: "medium",
        title: `New ${randomType}`,
        message: `${randomUser.name} ${randomType}d your content`,
        user: randomUser,
        timestamp: new Date(),
        read: false,
        dismissed: false,
        actions: [{ id: "view", type: "view", label: "View" }],
        metadata: { relatedUrl: "/home" },
      }

      setNotifications((prev) => [newNotification, ...prev])
      setHasNewHomeContent(true)
    }, 30000) // New notification every 30 seconds

    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
  const undismissedCount = notifications.filter((n) => !n.dismissed).length
  const hasNotifications = unreadCount > 0
  const hasUnreadMessages = notifications.some((n) => n.type === "comment" && !n.read && !n.dismissed)

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, read: true }
        }
        return n
      }),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, dismissed: true, read: true }
        }
        return n
      }),
    )
  }, [])

  const dismissAllNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const archiveNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, dismissed: true, read: true }
        }
        return n
      }),
    )
  }, [])

  const filterNotifications = useCallback((notifications: Notification[], filter: string) => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read)
      case "read":
        return notifications.filter((n) => n.read)
      case "high":
        return notifications.filter((n) => n.priority === "high")
      case "medium":
        return notifications.filter((n) => n.priority === "medium")
      case "low":
        return notifications.filter((n) => n.priority === "low")
      default:
        return notifications
    }
  }, [])

  const performAction = useCallback(
    (notificationId: string, actionId: string) => {
      console.log(`Performing action ${actionId} on notification ${notificationId}`)

      // Find the notification to get its related URL
      const notification = notifications.find((n) => n.id === notificationId)

      // Mark as read and dismiss when action is performed
      markAsRead(notificationId)
      dismissNotification(notificationId)

      // Navigate to related content if URL is provided
      if (notification?.metadata?.relatedUrl && typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = notification.metadata!.relatedUrl!
        }, 500)
      }

      // Handle specific actions
      switch (actionId) {
        case "follow":
          console.log("Following user...")
          break
        case "like":
          console.log("Liking content...")
          break
        case "reply":
          console.log("Opening reply interface...")
          break
        case "view":
          console.log("Viewing content...")
          break
        default:
          break
      }
    },
    [notifications, markAsRead, dismissNotification],
  )

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }))
  }, [])

  const setFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled((prev) => !prev)
  }, [])

  const markHomeAsVisited = useCallback(() => {
    setHasNewHomeContent(false)
  }, [])

  const checkForNewHomeContent = useCallback(() => {
    setHasNewHomeContent(true)
  }, [])

  const getFilteredNotifications = useCallback((): Notification[] => {
    let filtered = notifications.filter((n) => !n.dismissed)

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.user?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (filters.category !== "all") {
      if (filters.category === "social") {
        filtered = filtered.filter((n) => n.category === "social" || n.category === "engagement")
      } else if (filters.category === "engagement") {
        filtered = filtered.filter((n) => n.category === "engagement")
      } else {
        filtered = filtered.filter((n) => n.category === filters.category)
      }
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter((n) => n.priority === filters.priority)
    }

    // Apply read status filter
    if (filters.read !== "all") {
      filtered = filtered.filter((n) => (filters.read === "read" ? n.read : !n.read))
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      filtered = filtered.filter((n) => {
        const notificationDate = n.timestamp
        switch (filters.dateRange) {
          case "today":
            return notificationDate >= startOfDay
          case "week":
            return notificationDate >= startOfWeek
          case "month":
            return notificationDate >= startOfMonth
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, searchQuery, filters])

  const getVisibleNotifications = useCallback((): Notification[] => {
    return notifications.filter((n) => !n.dismissed)
  }, [notifications])

  const value: AdvancedNotificationContextType = {
    notifications,
    unreadCount,
    undismissedCount,
    hasNotifications,
    preferences,
    filters,
    searchQuery,
    isRealTimeEnabled,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAllNotifications,
    deleteNotification,
    archiveNotification,
    performAction,
    updatePreferences,
    setFilters,
    setSearchQuery,
    toggleRealTime,
    getFilteredNotifications,
    filterNotifications,
    getVisibleNotifications,
    hasUnreadMessages,
    hasNewHomeContent,
    markHomeAsVisited,
    checkForNewHomeContent,
  }

  return <AdvancedNotificationContext.Provider value={value}>{children}</AdvancedNotificationContext.Provider>
}

export function useAdvancedNotifications() {
  const context = useContext(AdvancedNotificationContext)
  if (context === undefined) {
    throw new Error("useAdvancedNotifications must be used within an AdvancedNotificationProvider")
  }
  return context
}

// Legacy compatibility hooks
export function useNotifications() {
  return useAdvancedNotifications()
} 