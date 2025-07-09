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
  MapPin,
  Calendar,
  GraduationCap,
  Trophy,
  Users,
  Heart,
  Share2,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth, sendMessage, listenForMessages, getChatId, db, getMemberProfile } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { MemberHeader } from "@/components/navigation/member-header"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { toast } from "@/components/ui/use-toast"
import type { User as FirebaseUser } from "firebase/auth"

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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Client-side check
  useEffect(() => {
    setIsClient(true)
  }, [])

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
    // Only run if we're on client side and Firebase is available
    if (!isClient || !auth || !db) {
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser(user)
        try {
          // Get member profile to find subscribed athletes
          const memberDoc = await getDoc(doc(db, "members", user.uid))
          if (memberDoc.exists()) {
            const memberData = memberDoc.data()
            const subscriptions = memberData.subscriptions || {}
            
            // Allow messaging for all subscriptions (active and inactive) to preserve history
            const allSubscribedAthleteIds = Object.keys(subscriptions)
            
            if (allSubscribedAthleteIds.length > 0) {
              // Fetch athlete profiles for all subscribed athletes (active and inactive)
              const athletePromises = allSubscribedAthleteIds.map(async (athleteId: string) => {
                const athleteDoc = await getDoc(doc(db, "athletes", athleteId))
                if (athleteDoc.exists()) {
                  const athleteData = athleteDoc.data()
                  const subscriptionStatus = subscriptions[athleteId]?.status || 'inactive'
                  
                  return {
                    id: athleteId,
                    name: athleteData.name || "Athlete",
                    avatar: athleteData.profileImageUrl || athleteData.profilePic || athleteData.profilePicture || "/placeholder.svg",
                    lastMessage: subscriptionStatus === 'active' ? "Click to start a conversation" : "Subscription expired - view history only",
                    timestamp: "Just now",
                    unread: 0,
                    online: subscriptionStatus === 'active', // Show as offline if subscription inactive
                    isCoach: true,
                    role: `${athleteData.sport || "Sport"} Coach`,
                    email: athleteData.email,
                    sport: athleteData.sport || "Sport",
                    university: athleteData.university || athleteData.school || "University",
                    location: athleteData.location || "Location",
                    level: athleteData.level || "Professional",
                    experience: athleteData.experience || "5+ years",
                    specialties: athleteData.specialties || ["Training", "Performance"],
                    achievements: athleteData.achievements || ["Team Captain", "All-Star"],
                    subscriptionStatus: subscriptionStatus, // Add subscription status
                  }
                }
                return null
              })
              
              const athleteResults = await Promise.all(athletePromises)
              const validAthletes = athleteResults.filter(athlete => athlete !== null)
              setConversations(validAthletes)
              // Auto-select first conversation if none selected
              if (!selectedConversation && validAthletes.length > 0) {
                setSelectedConversation(validAthletes[0].id)
              }
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
  }, [isClient])

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
    
    // Check if the selected conversation has an active subscription
    const selectedConversationData = conversations.find(conv => conv.id === selectedConversation)
    if (selectedConversationData?.subscriptionStatus !== 'active') {
      // Show error message for inactive subscriptions
      console.warn("Cannot send messages - subscription is inactive")
      // You could add a toast notification here
      return
    }
    
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
      try {
        const memberProfile = await getMemberProfile(currentUser.uid)
                 if (memberProfile) {
           const imageUrl = memberProfile.profileImageUrl || memberProfile.profilePic || memberProfile.profilePicture || null
           setProfileImageUrl(imageUrl)
           setProfileData({ 
             firstName: memberProfile.firstName || "", 
             lastName: memberProfile.lastName || "",
             profileImageUrl: imageUrl,
             profilePic: memberProfile.profilePic || null,
             profilePicture: memberProfile.profilePicture || null
           })
         }
      } catch (error) {
        console.error("Error fetching member profile:", error)
      }
    }
    fetchProfile()
  }, [currentUser])

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
      <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-8xl mx-auto px-4 py-6"}`}>
        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-12"} gap-4 ${isMobile ? "h-auto" : "h-[calc(100vh-180px)]"}`}
        >
          {/* Conversations List */}
          <div className={`${isMobile ? "mb-4" : "col-span-4"}`}>
            <Card className="h-full border border-gray-300 bg-white rounded-lg overflow-hidden">
              <CardHeader className="pb-3 bg-gray-200 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-900">Messages</CardTitle>
                  <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-300">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <div className="space-y-0">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Loading conversations...</span>
                      </div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium mb-1">
                        {searchQuery ? "No conversations found" : "No athletes to message yet"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchQuery ? "Try a different search term" : "Subscribe to athletes to start messaging"}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 border-l-4 ${
                          selectedConversation === conversation.id
                            ? "bg-gray-100 border-l-prologue-electric"
                            : "border-l-transparent hover:border-l-prologue-electric/50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                              <Image
                                src={conversation.avatar || "/placeholder.svg"}
                                alt={conversation.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {conversation.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 text-sm truncate">{conversation.name}</h4>
                                {conversation.isCoach && (
                                  <Badge className="bg-prologue-electric/10 text-prologue-electric text-xs px-2 py-0.5">
                                    Coach
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                              {conversation.unread > 0 && (
                                <div className="w-5 h-5 bg-prologue-electric text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation.unread}
                                </div>
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
          <div className={`${isMobile ? "" : "col-span-8"}`}>
            <Card className="h-full border border-gray-300 bg-white rounded-lg overflow-hidden flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 bg-gray-200 border-b border-gray-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                            <Image
                              src={selectedConv.avatar || "/placeholder.svg"}
                              alt={selectedConv.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {selectedConv.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedConv.name}</h3>
                          <p className="text-sm text-gray-600">{selectedConv.online ? "Online" : "Last seen 2 hours ago"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-300">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-300">
                          <Video className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-300">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Star Conversation
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
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto bg-white">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Start your conversation</h3>
                          <p className="text-gray-600 mb-4">Send a message to {selectedConv.name} to get started</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {["Hi there!", "Looking forward to training!", "When's our next session?"].map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setMessageInput(suggestion)}
                                className="text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className={`flex ${message.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === currentUser?.uid
                                  ? "bg-prologue-electric text-white"
                                  : "bg-gray-100 text-gray-900 border border-gray-200"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid ? "text-prologue-electric/70" : "text-gray-500"}`}>
                                {message.time || "Just now"}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-300 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-200">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type a message..."
                          className="pr-10 bg-white border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-lg hover:bg-gray-200"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-prologue-electric hover:bg-prologue-blue text-white rounded-lg"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // No conversation selected state
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Choose an athlete from the list to start messaging and get training guidance.
                    </p>
                    {conversations.length === 0 && !loading && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                          You haven't subscribed to any athletes yet.
                        </p>
                        <Button asChild className="bg-prologue-electric hover:bg-prologue-blue text-white">
                          <Link href="/member-browse">
                            <Users className="h-4 w-4 mr-2" />
                            Discover Athletes
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
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
              href="/member-browse"
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
              className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors relative"
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