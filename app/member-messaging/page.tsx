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
import { auth, sendMessage, listenForMessages, getChatId } from "@/lib/firebase"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { MemberHeader } from "@/components/navigation/member-header"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"

export default function MemberMessagingPage() {
  const { unreadMessagesCount, unreadNotificationsCount, markMessagesAsRead, hasNewTrainingContent } =
    useMemberNotifications()
  const { isMobile, isTablet } = useMobileDetection()
  const { logout } = useUnifiedLogout()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Messaging state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")

  // Firestore state
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const db = getFirestore()

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

  // Fetch current user and subscribed athletes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user)
        try {
          // Get member profile to find subscribed athletes
          const memberDoc = await getDoc(doc(db, "members", user.uid))
          if (memberDoc.exists()) {
            const memberData = memberDoc.data()
            const subscriptions = memberData.subscriptions || {}
            const subscribedAthleteIds = Object.keys(subscriptions).filter(
              (athleteId) => subscriptions[athleteId]?.status === "active"
            )
            
            if (subscribedAthleteIds.length > 0) {
              // Fetch athlete profiles for subscribed athletes
              const athletePromises = subscribedAthleteIds.map(async (athleteId: string) => {
                const athleteDoc = await getDoc(doc(db, "athletes", athleteId))
                if (athleteDoc.exists()) {
                  const athleteData = athleteDoc.data()
                  return {
                    id: athleteId,
                    name: athleteData.name || "Athlete",
                    avatar: athleteData.profilePic || "/placeholder.svg",
                    lastMessage: "Click to start a conversation",
                    timestamp: "Just now",
                    unread: 0,
                    online: false,
                    isCoach: true,
                    role: `${athleteData.sport || "Sport"} Coach`,
                    email: athleteData.email,
                    sport: athleteData.sport || "Sport"
                  }
                }
                return null
              })
              
              const athleteResults = await Promise.all(athletePromises)
              const validAthletes = athleteResults.filter(athlete => athlete !== null)
              setConversations(validAthletes)
            } else {
              setConversations([])
            }
          }
          setLoading(false)
        } catch (error) {
          console.error("Error fetching subscribed athletes:", error)
          setLoading(false)
        }
      } else {
        setCurrentUser(null)
        setConversations([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [db])

  // Listen for messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !currentUser) return

    const unsubscribe = listenForMessages({
      memberId: currentUser.uid,
      athleteId: selectedConversation,
      callback: (msgs) => {
        setMessages(msgs)
      },
    })

    return () => unsubscribe && unsubscribe()
  }, [selectedConversation, currentUser])

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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser) return
    
    try {
      await sendMessage({
        memberId: currentUser.uid,
        athleteId: selectedConversation,
        senderId: currentUser.uid,
        senderRole: "member",
        content: messageInput.trim(),
      })
      setMessageInput("")
    } catch (error) {
      console.error("Error sending message:", error)
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

  // Filter conversations based on search
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.sport?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

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
          </div>
          {searchQuery && searchResults.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No results found for "{searchQuery}"</div>
          )}
        </div>
      </div>
    )
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect, isMobile, isTablet])

  // Get profile image and data for header
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  useEffect(() => {
    if (!currentUser) return
    const fetchProfile = async () => {
      const memberDoc = await getDoc(doc(db, "members", currentUser.uid))
      if (memberDoc.exists()) {
        const data = memberDoc.data()
        setProfileImageUrl(data.profilePic || data.profilePicture || null)
        setProfileData({ firstName: data.firstName || "", lastName: data.lastName || "" })
      }
    }
    fetchProfile()
  }, [currentUser, db])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MemberHeader
        currentPath="/member-messaging"
        onLogout={logout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-6 py-8 ${isMobile || isTablet ? "pb-20" : ""}`}>
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Messages</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchQuery ? "No conversations found" : "No subscribed athletes to message yet"}
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                        selectedConversation === conversation.id
                          ? "bg-prologue-electric/10 border-prologue-electric"
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
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{conversation.name}</h4>
                            <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                            {conversation.unread > 0 && (
                              <Badge className="bg-prologue-electric text-white text-xs ml-2">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {conversation.role}
                            </Badge>
                            {conversation.isCoach && (
                              <Star className="h-3 w-3 text-yellow-500 ml-1" fill="currentColor" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-span-8">
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
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
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConv?.name}</h3>
                      <p className="text-sm text-gray-600">{selectedConv?.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
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
                    <div key={message.id} className={`flex ${message.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUser?.uid ? "bg-prologue-electric text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid ? "text-blue-100" : "text-gray-500"}`}>
                          {message.time || "Just now"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="pr-10"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-prologue-electric hover:bg-prologue-blue text-white"
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
        <MemberMobileNavigation />
      )}
    </div>
  )
} 