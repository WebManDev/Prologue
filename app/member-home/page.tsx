"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  ChevronDown,
  LogOut,
  ThumbsUp,
  MessageSquare,
  Share,
  Search,
  X,
  Home,
  MessageCircle,
  Bell,
  BookOpen,
  LayoutDashboard,
  Lock,
  Crown,
  ImageIcon,
  MoreHorizontal,
  Play,
  Bookmark,
  Heart,
  Repeat2,
  Send,
  Camera,
  Video,
  Zap,
  Eye,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

export default function MemberHomePage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // Contexts
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()
  const { getCreatorContent, getSubscribedContent, hasNewContent, hasNewSubscribedContent, markContentAsViewed } =
    useMemberSubscriptions()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [showNewContent, setShowNewContent] = useState(false)
  const [activeTab, setActiveTab] = useState<"feed" | "subscribed">("feed")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())

  const [selectedSpace, setSelectedSpace] = useState<any>(null)
  const [spaceDialogOpen, setSpaceDialogOpen] = useState(false)
  const [whoIsGoingDialogOpen, setWhoIsGoingDialogOpen] = useState(false)
  const [joinedSpaces, setJoinedSpaces] = useState<Set<string>>(new Set())

  const mockSpaces = useMemo(
    () => [
      {
        id: "space-1",
        title: "Morning Basketball Pickup",
        organizer: "Mike Chen",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Central Park Courts",
        time: "Tomorrow 8:00 AM",
        participants: 8,
        maxParticipants: 10,
        isPublic: true,
        sport: "Basketball",
        description: "Casual pickup game for all skill levels. Bring your own water!",
        attendees: ["Sarah M.", "Alex R.", "Jordan K.", "Emma D.", "Chris L.", "Maya P.", "Tyler W.", "Lisa C."],
      },
      {
        id: "space-2",
        title: "Tennis Training Session",
        organizer: "Sarah Martinez",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Riverside Tennis Club",
        time: "Today 6:00 PM",
        participants: 4,
        maxParticipants: 6,
        isPublic: false,
        sport: "Tennis",
        description: "Advanced tennis training focusing on serve technique and footwork.",
        attendees: ["Mike J.", "Alex K.", "Emma R.", "David L."],
      },
      {
        id: "space-3",
        title: "Swimming Workout Group",
        organizer: "Lisa Chen",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Aquatic Center Pool",
        time: "Friday 7:00 AM",
        participants: 6,
        maxParticipants: 8,
        isPublic: true,
        sport: "Swimming",
        description: "Early morning swim workout. All levels welcome. Pool entry fee required.",
        attendees: ["Jordan S.", "Maya T.", "Chris R.", "Tyler M.", "Emma K.", "Alex P."],
      },
      {
        id: "space-4",
        title: "Soccer Skills Training",
        organizer: "David Rodriguez",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Memorial Field",
        time: "Saturday 10:00 AM",
        participants: 12,
        maxParticipants: 16,
        isPublic: true,
        sport: "Soccer",
        description: "Technical skills training session focusing on ball control and passing.",
        attendees: [
          "Maria G.",
          "Carlos R.",
          "Sofia L.",
          "Diego M.",
          "Ana P.",
          "Luis K.",
          "Isabella R.",
          "Miguel S.",
          "Camila T.",
          "Roberto F.",
          "Lucia M.",
          "Fernando D.",
        ],
      },
    ],
    [],
  )

  // Trending topics
  const trendingTopics = useMemo(
    () => [
      { name: "College Recruitment", posts: "2.4K posts" },
      { name: "NIL Deals", posts: "1.8K posts" },
      { name: "Training Tips", posts: "3.2K posts" },
      { name: "Mental Health", posts: "1.5K posts" },
      { name: "Nutrition", posts: "2.1K posts" },
    ],
    [],
  )

  const handleSpaceClick = useCallback((space: any) => {
    setSelectedSpace(space)
    setSpaceDialogOpen(true)
  }, [])

  const handleJoinSpace = useCallback((spaceId: string) => {
    setJoinedSpaces((prev) => new Set([...prev, spaceId]))
    setSpaceDialogOpen(false)
  }, [])

  const handleRequestJoin = useCallback((spaceId: string) => {
    // Mock request functionality
    console.log("Requesting to join space:", spaceId)
    setSpaceDialogOpen(false)
  }, [])

  const handleWhoIsGoing = useCallback(() => {
    setWhoIsGoingDialogOpen(true)
  }, [])

  // Get content from subscriptions
  const followedContent = useMemo(() => getCreatorContent(), [getCreatorContent])
  const subscribedContent = useMemo(() => getSubscribedContent(), [getSubscribedContent])

  // Enhanced content with more variety and social media features
  const enhancedFeedContent = useMemo(() => {
    const baseContent = [...followedContent, ...subscribedContent]

    // Add variety of content types from creators
    const varietyContent = [
      {
        id: "variety-1",
        creatorId: "athlete-1",
        creatorName: "Sarah Martinez",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        type: "video" as const,
        title: "Morning Training Routine",
        content:
          "Starting my day with some serve practice and footwork drills. The key is consistency! 🎾 What's your morning routine looking like?",
        timestamp: "3 hours ago",
        likes: 234,
        comments: 18,
        shares: 12,
        views: 1240,
        isNew: true,
        isPremium: false,
        isRecommendation: false,
        media: {
          type: "video",
          thumbnail: "/placeholder.svg?height=300&width=400",
          duration: "2:45",
        },
      },
      {
        id: "variety-2",
        creatorId: "coach-1",
        creatorName: "Mike Johnson",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        type: "image" as const,
        title: "Mental Preparation Tips",
        content:
          "5 key strategies I use with my athletes before big competitions. Visualization is everything! 🧠💪 Save this post for your next big game.",
        timestamp: "6 hours ago",
        likes: 189,
        comments: 24,
        shares: 8,
        views: 892,
        isNew: false,
        isPremium: false,
        isRecommendation: false,
        media: {
          type: "image",
          thumbnail: "/placeholder.svg?height=300&width=400",
        },
      },
      {
        id: "variety-3",
        creatorId: "athlete-2",
        creatorName: "Alex Rodriguez",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: false,
        type: "blog" as const,
        title: "The Science Behind Perfect Shooting Form",
        content:
          "Breaking down the biomechanics of shooting - from foot placement to follow-through. This changed my game completely! 🏀 Link in bio for the full breakdown.",
        timestamp: "1 day ago",
        likes: 456,
        comments: 67,
        shares: 23,
        views: 2340,
        isNew: false,
        isPremium: true,
        isRecommendation: false,
      },
      {
        id: "variety-4",
        creatorId: "coach-2",
        creatorName: "Lisa Chen",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        type: "workout" as const,
        title: "Pool Workout: Building Endurance",
        content:
          "Today's training session focused on building cardiovascular endurance. 2000m mixed strokes! 🏊‍♀️ Drop your favorite pool workout below 👇",
        timestamp: "2 days ago",
        likes: 312,
        comments: 45,
        shares: 19,
        views: 1560,
        isNew: false,
        isPremium: true,
        isRecommendation: false,
        media: {
          type: "image",
          thumbnail: "/placeholder.svg?height=300&width=400",
        },
      },
    ]

    return [...baseContent, ...varietyContent].sort((a, b) => {
      // Sort by timestamp, with "new" content first
      if (a.isNew && !b.isNew) return -1
      if (!a.isNew && b.isNew) return 1
      return 0
    })
  }, [followedContent, subscribedContent])

  // Quick search suggestions
  const quickSearches = useMemo(
    () => [
      "Navigate Recruitment",
      "Nutrition",
      "NIL",
      "Training Programs",
      "Mental Performance",
      "Injury Prevention",
      "Sports Psychology",
      "Athletic Scholarships",
    ],
    [],
  )

  // Mock search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const mockResults = [
      {
        type: "athlete",
        name: "Alex Johnson",
        sport: "Tennis",
        school: "Miami Prep Academy",
        ranking: "#15 in state",
      },
      {
        type: "athlete",
        name: "Sarah Martinez",
        sport: "Soccer",
        school: "Elite Sports Academy",
        ranking: "#8 in region",
      },
      {
        type: "content",
        title: "College Recruitment Guide",
        creator: "PROLOGUE Team",
        views: "45K",
        duration: "12 min",
      },
      {
        type: "content",
        title: "NIL Deal Strategies",
        creator: "Sports Business Pro",
        views: "32K",
        duration: "18 min",
      },
    ].filter(
      (result) =>
        result.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.creator?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return mockResults
  }, [searchQuery])

  // Social media interaction handlers
  const handleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  const handleSave = useCallback((postId: string) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  const handleShare = useCallback((postId: string) => {
    // Mock share functionality
    console.log("Sharing post:", postId)
    // In a real app, this would open a share dialog
  }, [])

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
    console.log("Searching for:", search)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }, [])

  // Handle home visit
  useEffect(() => {
    if (hasNewContent || hasNewSubscribedContent) {
      setShowNewContent(true)
      // Mark content as viewed after a delay
      const timer = setTimeout(() => {
        markContentAsViewed()
        setShowNewContent(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [hasNewContent, hasNewSubscribedContent, markContentAsViewed])

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest(".mobile-menu")) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  // Optimized logout handler
  const handleLogout = async () => {
    try {
      // Replace with actual logout logic
      console.log("Logout logic not implemented")
    } catch (error) {
      console.error("Logout failed:", error)
      window.location.href = "/"
    }
  }

  // Memoized search dropdown content
  const searchDropdownContent = useMemo(() => {
    const displayItems = searchQuery ? searchResults : quickSearches.slice(0, 8)
    const isShowingResults = searchQuery && searchResults.length > 0
    const isShowingQuickSearches = !searchQuery

    return (
      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {isShowingResults ? `Results for "${searchQuery}"` : "Quick Searches"}
          </h4>
          <div className="space-y-1">
            {isShowingQuickSearches &&
              displayItems.map((search: string | { name?: string; title?: string }, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                  onClick={() => handleSearchSelect(typeof search === "string" ? search : (search.name || search.title || ""))}
                >
                  {typeof search === "string" ? search : (search.name || search.title || "")}
                </button>
              ))}

            {isShowingResults &&
              displayItems.map((result: string | { name?: string; title?: string; type?: string; sport?: string; school?: string; creator?: string; views?: string }, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleSearchSelect(typeof result === "string" ? result : (result.name || result.title || ""))}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{typeof result === "string" ? result : (result.name || result.title || "")}</h5>
                    <p className="text-xs text-gray-600">
                      {typeof result !== "string" && result.type === "athlete"
                        ? `${result.sport || ""} • ${result.school || ""}`
                        : typeof result !== "string" && result.creator && result.views
                          ? `${result.creator} • ${result.views} views`
                          : ""}
                    </p>
                  </div>
                </div>
              ))}

            {searchQuery && searchResults.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No results found for "{searchQuery}"</div>
            )}
          </div>
        </div>
      </div>
    )
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Fixed Navigation */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/member-home" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/prologue-logo.png"
                alt="PROLOGUE"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-lg font-athletic font-bold text-gray-900 tracking-wider">PROLOGUE</span>
          </Link>

          {/* Right Actions - Search, Bell, Dropdown */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowSearchDropdown(true)}>
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Notification Bell */}
            <Link href="/member-notifications" className="relative">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotificationsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </Button>
            </Link>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={false}>
                  <Link href="/member-dashboard">
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-prologue-electric/30 transition-all">
                      <User className="w-full h-full text-gray-500 p-1" />
                    </div>
                  </Link>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/member-dashboard" className="flex items-center w-full cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/member-settings" className="flex items-center w-full cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={false}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearchDropdown && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Button variant="ghost" size="sm" className="p-2 mr-2" onClick={() => setShowSearchDropdown(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search athletes, content..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Searches</h3>
              <div className="space-y-2">
                {quickSearches.slice(0, 8).map((search: string | { name?: string; title?: string }, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => handleSearchSelect(typeof search === "string" ? search : (search.name || search.title || ""))}
                  >
                    <span className="text-gray-700">{typeof search === "string" ? search : (search.name || search.title || "")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/member-home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-logo.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-prologue-electric transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>

              <div className="flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search athletes, content..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
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

                {/* Search Dropdown */}
                {showSearchDropdown && searchDropdownContent}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/member-home"
                  className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors group relative"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-prologue-electric rounded-full"></div>
                </Link>
                <Link
                  href="/member-training"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group relative"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">Training</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasNewTrainingContent && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
                <Link
                  href="/member-discover"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <Search className="h-5 w-5" />
                  <span className="text-xs font-medium">Discover</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-feedback"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors relative group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {unreadMessagesCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 p-1.5" disabled={false}>
                      <Link href="/member-dashboard">
                        <div className="w-7 h-7 bg-gray-300 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-prologue-electric/30 transition-all">
                          <User className="w-full h-full text-gray-500 p-1" />
                        </div>
                      </Link>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/member-dashboard" className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/member-settings" className="flex items-center w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={false}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notification Bell - moved to right of dropdown */}
                <Link href="/member-notifications" className="relative">
                  <Button variant="ghost" size="sm" className="p-1.5 relative">
                    <Bell className="h-4.5 w-4.5 text-gray-600" />
                    {unreadNotificationsCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {/* Stories Section */}

            {/* Create Post Section */}
            <Card className="bg-white border border-gray-200 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    <User className="w-full h-full text-gray-500 p-2" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="What's on your mind?"
                      className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-prologue-electric">
                      <Video className="h-4 w-4 mr-2" />
                      Live Video
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-prologue-electric">
                      <Camera className="h-4 w-4 mr-2" />
                      Photo/Video
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-prologue-electric">
                      <Target className="h-4 w-4 mr-2" />
                      Train
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 mb-8 bg-white/50 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "feed"
                    ? "bg-white text-prologue-electric shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Feed</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("subscribed")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "subscribed"
                    ? "bg-white text-prologue-electric shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Subscribed</span>
                </div>
              </button>
            </div>

            {/* Content Feed */}
            <div className="space-y-6">
              {activeTab === "feed" && (
                <>
                  {enhancedFeedContent.length > 0 ? (
                    enhancedFeedContent.map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-white border transition-all duration-300 hover:shadow-lg ${
                          item.isNew ? "border-prologue-electric/30 shadow-md" : "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Regular Content Card */}
                          <div className="space-y-0">
                            {/* Post Header */}
                            <div className="p-4 pb-3">
                              <div className="flex items-start space-x-3">
                                <Link href={`/creator/${item.creatorId}`}>
                                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden hover:ring-2 hover:ring-prologue-electric/30 transition-all cursor-pointer">
                                    <User className="w-full h-full text-gray-500 p-2" />
                                  </div>
                                </Link>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <Link href={`/creator/${item.creatorId}`}>
                                          <h4 className="font-semibold text-gray-900 hover:text-prologue-electric transition-colors cursor-pointer">
                                            {item.creatorName}
                                          </h4>
                                        </Link>
                                        {item.creatorVerified && (
                                          <div className="w-4 h-4 bg-prologue-electric rounded-full flex items-center justify-center">
                                            <svg
                                              className="w-2.5 h-2.5 text-white"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <span>{item.timestamp}</span>
                                        <span>•</span>
                                        <div className="flex items-center space-x-1">
                                          <Eye className="h-3 w-3" />
                                          <span>{item.views}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {item.isNew && (
                                        <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                                      )}
                                      {item.isPremium && (
                                        <Badge className="bg-prologue-fire text-white text-xs">
                                          <Crown className="h-3 w-3 mr-1" />
                                          Premium
                                        </Badge>
                                      )}
                                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div className="px-4 pb-3">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{item.content}</p>
                            </div>

                            {/* Media Content */}
                            {item.media && (
                              <div className="relative">
                                <div className="aspect-video bg-gray-200 overflow-hidden">
                                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                    {item.media.type === "video" ? (
                                      <div className="text-center">
                                        <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center mb-2 mx-auto">
                                          <Play className="h-8 w-8 text-white ml-1" />
                                        </div>
                                        {item.media.duration && (
                                          <Badge className="bg-black/70 text-white text-xs">
                                            {item.media.duration}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <ImageIcon className="h-12 w-12 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                                {item.isPremium && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-center text-white">
                                      <Lock className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-sm font-medium">Premium Content</p>
                                      <p className="text-xs opacity-90">Subscribe to unlock</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Engagement Stats */}
                            <div className="px-4 py-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <div className="flex -space-x-1">
                                      <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <Heart className="h-2.5 w-2.5 text-white fill-current" />
                                      </div>
                                      <div className="w-5 h-5 bg-prologue-electric rounded-full border-2 border-white flex items-center justify-center">
                                        <ThumbsUp className="h-2.5 w-2.5 text-white fill-current" />
                                      </div>
                                    </div>
                                    <span>{item.likes} likes</span>
                                  </div>
                                  <span>{item.comments} comments</span>
                                  <span>{item.shares} shares</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 py-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex-1 hover:bg-red-50 ${likedPosts.has(item.id) ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                                    onClick={() => handleLike(item.id)}
                                  >
                                    <Heart
                                      className={`h-5 w-5 mr-2 ${likedPosts.has(item.id) ? "fill-current" : ""}`}
                                    />
                                    <span className="hidden sm:inline">Like</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10"
                                  >
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    <span className="hidden sm:inline">Comment</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-gray-600 hover:text-green-600 hover:bg-green-50"
                                    onClick={() => handleShare(item.id)}
                                  >
                                    <Repeat2 className="h-5 w-5 mr-2" />
                                    <span className="hidden sm:inline">Share</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10"
                                    onClick={() => handleShare(item.id)}
                                  >
                                    <Send className="h-5 w-5 mr-2" />
                                    <span className="hidden sm:inline">Send</span>
                                  </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`${savedPosts.has(item.id) ? "text-prologue-electric" : "text-gray-600 hover:text-prologue-electric"}`}
                                    onClick={() => handleSave(item.id)}
                                  >
                                    <Bookmark className={`h-4 w-4 ${savedPosts.has(item.id) ? "fill-current" : ""}`} />
                                  </Button>
                                  {item.isPremium && (
                                    <Button size="sm" className="bg-prologue-fire hover:bg-prologue-fire/90 text-white">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Subscribe
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Comment Preview */}
                            <div className="px-4 pb-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                  <User className="w-full h-full text-gray-500 p-1.5" />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Home className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Your feed is empty</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Start following creators and subscribing to content to see updates in your feed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/member-browse">
                            <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                              Browse Creators
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {activeTab === "subscribed" && (
                <>
                  {subscribedContent.length > 0 ? (
                    subscribedContent.map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-white border transition-all duration-300 hover:shadow-lg ${
                          item.isNew ? "border-prologue-electric/30 shadow-md" : "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                              <Link href={`/creator/${item.creatorId}`}>
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden hover:ring-2 hover:ring-prologue-electric/30 transition-all cursor-pointer">
                                  <User className="w-full h-full text-gray-500 p-2" />
                                </div>
                              </Link>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Link href={`/creator/${item.creatorId}`}>
                                      <h4 className="font-semibold text-gray-900 hover:text-prologue-electric transition-colors cursor-pointer">
                                        {item.creatorName}
                                      </h4>
                                    </Link>
                                    <p className="text-sm text-gray-600">{item.timestamp}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {item.isNew && (
                                      <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                                    )}
                                    <Badge className="bg-prologue-fire text-white text-xs">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Premium
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{item.content}</p>
                            </div>

                            {item.media && (
                              <div className="relative">
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                    {item.media.type === "video" ? (
                                      <Play className="h-12 w-12 text-gray-600" />
                                    ) : (
                                      <ImageIcon className="h-12 w-12 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-6">
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-prologue-electric transition-colors">
                                  <ThumbsUp className="h-5 w-5" />
                                  <span className="text-sm">{item.likes}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-prologue-electric transition-colors">
                                  <MessageSquare className="h-5 w-5" />
                                  <span className="text-sm">{item.comments}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-prologue-electric transition-colors">
                                  <Share className="h-5 w-5" />
                                  <span className="text-sm">{item.shares}</span>
                                </button>
                              </div>
                              <Button size="sm" variant="ghost" className="text-gray-600 hover:text-prologue-electric">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Crown className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No subscribed content</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Subscribe to creators to see their premium content and exclusive updates here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/member-browse">
                            <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                              Find Creators to Subscribe
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            {/* Spaces Near You */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Spaces Near You</h3>
                  <Badge className="bg-prologue-electric text-white text-xs">Live</Badge>
                </div>
                <div className="space-y-4">
                  {mockSpaces.map((space) => (
                    <div
                      key={space.id}
                      className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100 hover:border-prologue-electric/30"
                      onClick={() => handleSpaceClick(space)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-prologue-electric text-white text-xs">{space.sport}</Badge>
                          {space.isPublic ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">Public</Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">Private</Badge>
                          )}
                          {joinedSpaces.has(space.id) && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">Joined</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{space.time}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1 hover:text-prologue-electric transition-colors">
                        {space.title}
                      </h4>
                      <p className="text-sm text-gray-600">{space.location}</p>
                      <span className="text-sm text-gray-500">
                        {space.participants}/{space.maxParticipants} going
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Trending Topics</h3>
                  <TrendingUp className="h-5 w-5 text-prologue-electric" />
                </div>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 hover:text-prologue-electric transition-colors">
                          #{topic.name}
                        </h4>
                        <p className="text-sm text-gray-600">{topic.posts}</p>
                      </div>
                      <div className="text-gray-400">
                        <span className="text-xs">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Who to Follow */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Who to Follow</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Sarah Martinez</h4>
                      <p className="text-sm text-gray-600">Tennis Coach</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Mike Johnson</h4>
                      <p className="text-sm text-gray-600">Basketball Trainer</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Alex Rodriguez</h4>
                      <p className="text-sm text-gray-600">Sports Psychologist</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Space Details Dialog */}
      {spaceDialogOpen && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className="bg-prologue-electric text-white text-xs">{selectedSpace.sport}</Badge>
                    {selectedSpace.isPublic ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Public</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 text-xs">Private</Badge>
                    )}
                    {joinedSpaces.has(selectedSpace.id) && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Joined</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedSpace.title}</h3>
                  <p className="text-sm text-gray-600">{selectedSpace.time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSpaceDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Organizer */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <User className="w-full h-full text-gray-500 p-1.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedSpace.organizer}</p>
                  <p className="text-xs text-gray-600">Organizer</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs">📍</span>
                  </div>
                  <span>{selectedSpace.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs">👥</span>
                  </div>
                  <span>
                    {selectedSpace.participants}/{selectedSpace.maxParticipants} participants
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-1">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedSpace.description}</p>
              </div>

              {/* Who's Going */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Who's Going</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWhoIsGoing}
                    className="text-prologue-electric hover:text-prologue-blue text-xs"
                  >
                    See all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSpace.attendees.slice(0, 6).map((attendee: string, index: number) => (
                    <div key={index} className="flex items-center space-x-1 bg-gray-50 rounded-full px-2 py-1">
                      <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-500 p-0.5" />
                      </div>
                      <span className="text-xs text-gray-700">{attendee}</span>
                    </div>
                  ))}
                  {selectedSpace.attendees.length > 6 && (
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                      <span className="text-xs text-gray-600">+{selectedSpace.attendees.length - 6}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {joinedSpaces.has(selectedSpace.id) ? (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled>
                    ✓ Joined
                  </Button>
                ) : selectedSpace.isPublic ? (
                  <Button
                    className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white"
                    onClick={() => handleJoinSpace(selectedSpace.id)}
                  >
                    Join Space
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white"
                    onClick={() => handleRequestJoin(selectedSpace.id)}
                  >
                    Request to Join
                  </Button>
                )}
                <Button variant="outline" size="sm" className="px-3 bg-transparent">
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Who's Going Dialog */}
      {whoIsGoingDialogOpen && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Who's Going</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWhoIsGoingDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3">
                {selectedSpace.attendees.map((attendee: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{attendee}</p>
                      <p className="text-sm text-gray-600">Member</p>
                    </div>
                    {index === 0 && <Badge className="bg-prologue-electric text-white text-xs">Organizer</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 mobile-menu">
          <div className="flex items-center justify-around h-16 px-4">
            <Link
              href="/member-home"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/member-training"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors relative"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Training</span>
              {hasNewTrainingContent && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
            <Link
              href="/member-discover"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link
              href="/member-feedback"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Feedback</span>
            </Link>
            <Link
              href="/member-messaging"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors relative"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
              {unreadMessagesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
