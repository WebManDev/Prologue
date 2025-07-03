"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Search,
  TrendingUp,
  MessageCircle,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Filter,
  X,
  Plus,
  Archive,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"
import { auth, getSubscribersForAthlete, sendMessage, listenForMessages, getChatId } from "@/lib/firebase"
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore"

// Static data to prevent recreation on every render
const QUICK_SEARCHES = [
  "Navigate Recruitment",
  "Nutrition",
  "NIL",
  "Training Programs",
  "Mental Performance",
  "Injury Prevention",
  "Sports Psychology",
  "Athletic Scholarships",
]

export default function MessagingPage() {
  return (
    <AdvancedNotificationProvider>
      <MessagingPageContent />
    </AdvancedNotificationProvider>
  )
}

function MessagingPageContent() {
  const { isMobile, isTablet } = useMobileDetection()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [headerSearchQuery, setHeaderSearchQuery] = useState("")
  const [showHeaderSearchDropdown, setShowHeaderSearchDropdown] = useState(false)
  const [conversationSearchQuery, setConversationSearchQuery] = useState("")
  
  // Firestore state
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const db = getFirestore()

  const headerSearchRef = useRef<HTMLDivElement>(null)
  const headerSearchInputRef = useRef<HTMLInputElement>(null)
  const conversationSearchInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch current user and subscribers
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user)
        try {
          // Fetch subscribers for this athlete
          const subscribersList = await getSubscribersForAthlete(user.uid)
          setSubscribers(subscribersList)
          
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
          setLoading(false)
        } catch (error) {
          console.error("Error fetching subscribers:", error)
          setLoading(false)
        }
      } else {
        setCurrentUser(null)
        setSubscribers([])
        setConversations([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Listen for messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !currentUser) return

    const chatId = getChatId(selectedConversation, currentUser.uid)
    const unsubscribe = listenForMessages({
      memberId: selectedConversation,
      athleteId: currentUser.uid,
      callback: (msgs) => {
        setMessages(msgs)
      },
    })

    return () => unsubscribe && unsubscribe()
  }, [selectedConversation, currentUser])

  // Handle clicks outside header search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerSearchRef.current && !headerSearchRef.current.contains(event.target as Node)) {
        setShowHeaderSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Stable event handlers
  const handleHeaderSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderSearchQuery(e.target.value)
  }, [])

  const handleHeaderSearchFocus = useCallback(() => {
    setShowHeaderSearchDropdown(true)
  }, [])

  const handleHeaderSearchSelect = useCallback((search: string) => {
    setHeaderSearchQuery(search)
    setShowHeaderSearchDropdown(false)
    setTimeout(() => {
      headerSearchInputRef.current?.focus()
    }, 0)
  }, [])

  const clearHeaderSearch = useCallback(() => {
    setHeaderSearchQuery("")
    setShowHeaderSearchDropdown(false)
    setTimeout(() => {
      headerSearchInputRef.current?.focus()
    }, 0)
  }, [])

  const handleConversationSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConversationSearchQuery(e.target.value)
  }, [])

  const handleNewMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return
    
    try {
      await sendMessage({
        memberId: selectedConversation,
        athleteId: currentUser.uid,
        senderId: currentUser.uid,
        senderRole: "coach",
        content: newMessage.trim(),
      })
      setNewMessage("")
      setTimeout(() => {
        messageInputRef.current?.focus()
      }, 0)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }, [newMessage, selectedConversation, currentUser])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case "premium":
        return "bg-purple-100 text-purple-700"
      case "athlete":
        return "bg-blue-100 text-blue-700"
      case "subscriber":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }, [])

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!conversationSearchQuery.trim()) return conversations
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(conversationSearchQuery.toLowerCase()) ||
      conv.email.toLowerCase().includes(conversationSearchQuery.toLowerCase())
    )
  }, [conversations, conversationSearchQuery])

  // Memoized components
  const HeaderSearchDropdown = useMemo(() => {
    if (!showHeaderSearchDropdown) return null

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
          <div className="space-y-1">
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                onClick={() => handleHeaderSearchSelect(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [showHeaderSearchDropdown, handleHeaderSearchSelect])

  const HeaderSearchComponent = useMemo(
    () => (
      <div className="hidden md:flex items-center space-x-1 relative" ref={headerSearchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={headerSearchInputRef}
            type="text"
            placeholder="Search messages..."
            value={headerSearchQuery}
            onChange={handleHeaderSearchChange}
            className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            onFocus={handleHeaderSearchFocus}
          />
          {headerSearchQuery && (
            <button
              onClick={clearHeaderSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {HeaderSearchDropdown}
      </div>
    ),
    [headerSearchQuery, handleHeaderSearchChange, handleHeaderSearchFocus, clearHeaderSearch, HeaderSearchDropdown],
  )

  const selectedConv = useMemo(
    () => conversations.find((conv) => conv.id === selectedConversation),
    [selectedConversation, conversations],
  )

  const DesktopHeader = useMemo(
    () => (
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
              {HeaderSearchComponent}
            </div>

            <div className="flex items-center space-x-6">
              <AthleteNav currentPath="/messaging" />

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
                      <Link href="/athleteDashboard" className="flex items-center w-full">
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
    ),
    [HeaderSearchComponent],
  )

  const ConversationsList = useMemo(
    () => (
      <div
        className={`${isMobile && selectedConversation ? "hidden" : ""} ${isMobile ? "w-full" : "w-1/3"} border-r border-gray-200 flex flex-col`}
      >
        {/* Conversations Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-gray-900`}>Messages</h2>
            {isMobile && (
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={conversationSearchInputRef}
              placeholder="Search conversations..."
              className="pl-10"
              value={conversationSearchQuery}
              onChange={handleConversationSearchChange}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {conversationSearchQuery ? "No conversations found" : "No subscribers to message yet"}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={conversation.avatar || "/placeholder.svg"}
                      alt={conversation.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`${isMobile ? "text-sm" : "text-base"} font-semibold text-gray-900 truncate`}>
                          {conversation.name}
                        </h3>
                        <Badge variant="secondary" className={`${getTypeColor(conversation.type)} text-xs`}>
                          {conversation.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {conversation.unread > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">{conversation.unread}</Badge>
                        )}
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                    </div>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 truncate`}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    ),
    [isMobile, selectedConversation, conversationSearchQuery, handleConversationSearchChange, getTypeColor, loading, filteredConversations],
  )

  const ChatArea = useMemo(
    () => (
      <div
        className={`${isMobile && !selectedConversation ? "hidden" : ""} ${isMobile ? "w-full" : "flex-1"} flex flex-col`}
      >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobile && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} className="p-1">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="relative">
                    <Image
                      src={selectedConv.avatar || "/placeholder.svg"}
                      alt={selectedConv.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    {selectedConv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-gray-900`}>
                        {selectedConv.name}
                      </h3>
                      <Badge variant="secondary" className={getTypeColor(selectedConv.type)}>
                        {selectedConv.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{selectedConv.online ? "Online now" : "Last seen 2h ago"}</p>
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
                        <Star className="h-4 w-4 mr-2" />
                        Star Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser?.uid ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className={`${isMobile ? "text-sm" : "text-base"}`}>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.senderId === currentUser?.uid ? "text-blue-100" : "text-gray-500"}`}>
                      {message.time || "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    ref={messageInputRef}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={handleNewMessageChange}
                    className="resize-none"
                    rows={1}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    ),
    [
      isMobile,
      selectedConversation,
      selectedConv,
      getTypeColor,
      newMessage,
      handleNewMessageChange,
      handleKeyPress,
      handleSendMessage,
      messages,
      currentUser,
    ],
  )

  const MainContent = useMemo(
    () => (
      <main className={`${isMobile ? "px-0 py-0 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
        {!isMobile && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                  <p className="text-gray-600 mt-1">Connect with your subscribers and fellow athletes</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`${isMobile ? "h-screen" : "h-[calc(100vh-200px)]"} bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden`}
        >
          <div className="flex h-full">
            {ConversationsList}
            {ChatArea}
          </div>
        </div>
      </main>
    ),
    [isMobile, ConversationsList, ChatArea],
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/messaging"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={conversations.reduce((sum, conv) => sum + conv.unread, 0)}
        hasNewContent={false}
      >
        {MainContent}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {DesktopHeader}
      {MainContent}
    </div>
  )
} 