"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  MessageSquare,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import MemberMobileNavigation from "@/components/mobile/member-mobile-navigation"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

export default function MemberMessagingPage() {
  const { unreadMessagesCount, unreadNotificationsCount, markMessagesAsRead, hasNewTrainingContent } =
    useMemberNotifications()
  const { isMobile, isTablet } = useMobileDetection()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Messaging state
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [messageInput, setMessageInput] = useState("")

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

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      name: "Coach Sarah Martinez",
      role: "Tennis Coach",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Great progress on your backhand! Let's work on your serve next.",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      isCoach: true,
    },
    {
      id: 2,
      name: "Elite Tennis Academy",
      role: "Training Academy",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "New mental toughness program available. Check it out!",
      timestamp: "1 hour ago",
      unread: 0,
      online: false,
      isCoach: true,
    },
    {
      id: 3,
      name: "Sports Nutritionist Pro",
      role: "Nutrition Expert",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Your meal plan has been updated for this week.",
      timestamp: "3 hours ago",
      unread: 1,
      online: true,
      isCoach: true,
    },
    {
      id: 4,
      name: "Alex Johnson",
      role: "Fellow Member",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the training tips!",
      timestamp: "1 day ago",
      unread: 0,
      online: false,
      isCoach: false,
    },
  ]

  // Mock messages for selected conversation
  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: "Coach Sarah Martinez",
      content: "Hi Alex! I reviewed your latest training video. Your backhand technique has improved significantly!",
      timestamp: "10:30 AM",
      isMe: false,
    },
    {
      id: 2,
      senderId: "me",
      senderName: "You",
      content: "Thank you! I've been practicing the drills you recommended. Should I focus on anything specific next?",
      timestamp: "10:32 AM",
      isMe: true,
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Coach Sarah Martinez",
      content: "Let's work on your serve technique next. I'll send you a new training program focused on power serves.",
      timestamp: "10:35 AM",
      isMe: false,
    },
    {
      id: 4,
      senderId: 1,
      senderName: "Coach Sarah Martinez",
      content: "Great progress on your backhand! Let's work on your serve next.",
      timestamp: "10:38 AM",
      isMe: false,
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

  // Mark messages as read when entering the page
  useEffect(() => {
    if (unreadMessagesCount > 0) {
      // Simulate reading all messages after a short delay
      const timer = setTimeout(() => {
        markMessagesAsRead()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [unreadMessagesCount, markMessagesAsRead])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Send message logic here
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userToken")
    localStorage.removeItem("userData")
    localStorage.removeItem("authToken")
    sessionStorage.clear()

    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    window.location.href = "/"
  }

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation)

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
                  onClick={() => handleSearchSelect(search)}
                >
                  {search}
                </button>
              ))}

            {isShowingResults &&
              displayItems.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleSearchSelect(result.name || result.title)}
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
              ))}
          </div>
          {searchQuery && searchResults.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No results found for "{searchQuery}"</div>
          )}
        </div>
      </div>
    )
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect, isMobile, isTablet])

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <header className="bg-slate-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/member-home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/Prologue LOGO-1.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                {!isMobile && (
                  <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-wider">
                    PROLOGUE
                  </span>
                )}
              </Link>

              <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-80 pl-10 pr-10 py-2 bg-slate-800 text-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                    onFocus={handleSearchFocus}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {showSearchDropdown && searchDropdownContent}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/member-home"
                  className="flex flex-col items-center space-y-1 text-white hover:text-blue-400 transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-training"
                  className="flex flex-col items-center space-y-1 text-white hover:text-blue-400 transition-colors group relative"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">Training</span>
                  <div className="w-full h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasNewTrainingContent && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
                <Link
                  href="/member-feedback"
                  className="flex flex-col items-center space-y-1 text-white hover:text-blue-400 transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/member-messaging" className="flex flex-col items-center space-y-1 text-blue-400">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-400"></div>
                </Link>
                <Link
                  href="/member-notifications"
                  className="flex flex-col items-center space-y-1 text-white hover:text-blue-400 transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
              </nav>

              {/* Mobile/Tablet Navigation - Search and Bell */}
              {(isMobile || isTablet) && (
                <div className="flex items-center space-x-2">
                  {/* Search Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                    className="p-2 touch-target"
                  >
                    <Search className="h-5 w-5 text-white" />
                  </Button>

                  {/* Notification Bell */}
                  <Link href="/member-notifications" className="relative">
                    <Button variant="ghost" size="sm" className="p-2 touch-target relative">
                      <Bell className="h-5 w-5 text-white" />
                      {unreadNotificationsCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-white font-bold leading-none">
                            {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                          </span>
                        </div>
                      )}
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-300 p-1" />
                      </div>
                      {!isMobile && <ChevronDown className="h-4 w-4 text-gray-300" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/member-dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/member-settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Search Dropdown */}
          {(isMobile || isTablet) && showSearchDropdown && (
            <div className="border-t border-gray-800 bg-slate-900">
              <div className="px-4 py-4" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 bg-slate-800 text-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                    onFocus={handleSearchFocus}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {searchDropdownContent}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-6 py-8 ${isMobile || isTablet ? "pb-20" : ""}`}>
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="col-span-4">
            <Card className="h-full bg-slate-800 border-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Messages</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4 text-gray-300" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-slate-700 transition-colors border-l-4 ${
                        selectedConversation === conversation.id
                          ? "bg-blue-400/10 border-blue-400"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Image
                            src={conversation.avatar || "/placeholder.svg"}
                            alt={conversation.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-white truncate">{conversation.name}</h4>
                            <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-300 truncate">{conversation.lastMessage}</p>
                            {conversation.unread > 0 && (
                              <Badge className="bg-blue-400 text-white text-xs ml-2">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="text-xs bg-slate-700 text-gray-200">
                              {conversation.role}
                            </Badge>
                            {conversation.isCoach && (
                              <Star className="h-3 w-3 text-yellow-500 ml-1" fill="currentColor" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-span-8">
            <Card className="h-full flex flex-col bg-slate-800 border-none">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={selectedConv?.avatar || "/placeholder.svg?height=40&width=40"}
                        alt={selectedConv?.name || ""}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedConv?.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{selectedConv?.name}</h3>
                      <p className="text-sm text-gray-300">{selectedConv?.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4 text-gray-300" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4 text-gray-300" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4 text-gray-300" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isMe ? "bg-blue-400 text-white" : "bg-slate-700 text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-gray-400"}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4 text-gray-300" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="pr-10 bg-slate-700 text-white border-none"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Smile className="h-4 w-4 text-gray-300" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <MemberMobileNavigation
          currentPath="/member-messaging"
          unreadNotifications={unreadNotificationsCount}
          unreadMessages={unreadMessagesCount}
          hasNewContent={false}
        />
      )}
    </div>
  )
} 