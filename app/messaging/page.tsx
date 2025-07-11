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
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth, getSubscribersForAthlete, sendMessage, listenForMessages, getChatId, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { toast } from "@/components/ui/use-toast"
import type { User as FirebaseUser } from "firebase/auth"

export default function MessagingPage() {
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

  // Fetch current user and subscribers
  useEffect(() => {
    // Only run if we're on client side and Firebase is available
    if (!isClient || !auth || !db) {
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser(user)
        try {
          // Fetch subscribers for this athlete
          const subscribersList = await getSubscribersForAthlete(user.uid)
          
          // Create conversations from subscribers
          const conversationsData = subscribersList.map((subscriber: any) => ({
            id: subscriber.id,
            name: subscriber.name || "Member",
            avatar: subscriber.profilePic || "/placeholder.svg",
            lastMessage: "Click to start a conversation",
            timestamp: "Just now",
            unread: 0,
            online: false,
            type: "subscriber",
            email: subscriber.email,
            sport: subscriber.sport || "Sport"
          }))
          setConversations(conversationsData)
          // Auto-select first conversation if none selected
          if (!selectedConversation && conversationsData.length > 0) {
            setSelectedConversation(conversationsData[0].id)
          }
          setLoading(false)
        } catch (error) {
          console.error("Error fetching subscribers:", error)
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
      memberId: selectedConversation,
      athleteId: currentUser.uid,
      callback: (msgs) => {
        setMessages(msgs)
      },
    })

    return () => unsubscribe && unsubscribe()
  }, [selectedConversation, currentUser])

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

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchFocus = () => {
    setShowSearchDropdown(true)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser) return
    
    try {
      await sendMessage({
        memberId: selectedConversation,
        athleteId: currentUser.uid,
        senderId: currentUser.uid,
        senderRole: "coach",
        content: messageInput.trim(),
      })
      setMessageInput("")
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter conversations based on search
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation)

  // Search dropdown content
  const searchDropdownContent = (
    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
        <div className="space-y-1">
          {quickSearches.map((search, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
              onClick={() => {
                setSearchQuery(search)
                setShowSearchDropdown(false)
              }}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-logo.png"
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

              <div className="flex items-center space-x-1 relative" ref={searchRef}>
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

                {showSearchDropdown && searchDropdownContent}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/content"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">Content</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/feedback"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/messaging"
                  className="flex flex-col items-center space-y-1 text-blue-500 transition-colors group relative"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                </Link>
                <Link
                  href="/notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </nav>

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
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/promote" className="flex items-center w-full cursor-pointer">
                        <Trophy className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>
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
                        {searchQuery ? "No conversations found" : "No subscribers to message yet"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchQuery ? "Try a different search term" : "Subscribers will appear here when they join"}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 border-l-4 ${
                          selectedConversation === conversation.id
                            ? "bg-gray-100 border-l-blue-500"
                            : "border-l-transparent hover:border-l-blue-300"
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
                                <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                                  {conversation.type}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                              {conversation.unread > 0 && (
                                <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
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
                            {["Hi there!", "Thanks for subscribing!", "How can I help you today?"].map((suggestion, index) => (
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
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-900 border border-gray-200"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid ? "text-blue-100" : "text-gray-500"}`}>
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
                          className="pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
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
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
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
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Choose a subscriber from the list to start messaging and provide guidance.
                    </p>
                    {conversations.length === 0 && !loading && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                          You don't have any subscribers yet.
                        </p>
                        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Link href="/promote">
                            <Trophy className="h-4 w-4 mr-2" />
                            Promote Your Content
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
              href="/home"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/content"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Content</span>
            </Link>
            <Link
              href="/feedback"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Feedback</span>
            </Link>
            <Link
              href="/messaging"
              className="flex flex-col items-center space-y-1 text-blue-500 transition-colors relative"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
              {conversations.reduce((sum, conv) => sum + conv.unread, 0) > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
} 