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
  MessageSquare,
  Star,
  ThumbsUp,
  Filter,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"

// Static data to prevent recreation on every render
const QUICK_SEARCHES = [
  "Training Content Feedback",
  "Nutrition Video Reviews",
  "Workout Program Effectiveness",
  "Mental Performance Content",
  "Recruitment Advice Quality",
  "NIL Content Feedback",
  "Coaching Style Review",
  "Content Improvement Ideas",
]

const FEEDBACK_DATA = {
  requested: [
    {
      id: 1,
      subject: "Training Program Effectiveness",
      description: "How effective has my 12-week strength program been for you?",
      recipients: 45,
      responses: 32,
      avgRating: 4.6,
      timestamp: "2 days ago",
      status: "active",
      category: "Training Content",
      deadline: "Dec 15, 2024",
    },
    {
      id: 2,
      subject: "Nutrition Content Quality",
      description: "Please rate the quality and usefulness of my nutrition guidance videos.",
      recipients: 28,
      responses: 28,
      avgRating: 4.8,
      timestamp: "1 week ago",
      status: "completed",
      category: "Nutrition",
      deadline: "Dec 1, 2024",
    },
    {
      id: 3,
      subject: "Mental Performance Series",
      description: "Feedback on my mental performance and mindset content series.",
      recipients: 67,
      responses: 23,
      avgRating: 4.4,
      timestamp: "3 days ago",
      status: "active",
      category: "Mental Performance",
      deadline: "Dec 20, 2024",
    },
  ],
  given: [
    {
      id: 1,
      to: "Alex Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      content: "Great collaboration on the NIL content. Your insights were valuable.",
      timestamp: "1 week ago",
      status: "delivered",
      category: "Collaboration",
    },
    {
      id: 2,
      to: "Sarah Mitchell",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      content: "Excellent training methodology. Really helped improve my content structure.",
      timestamp: "2 weeks ago",
      status: "delivered",
      category: "Training",
    },
  ],
}

export default function FeedbackPage() {
  return (
    <AdvancedNotificationProvider>
      <FeedbackPageContent />
    </AdvancedNotificationProvider>
  )
}

function FeedbackPageContent() {
  const { isMobile, isTablet } = useMobileDetection()

  // Separate state for different inputs to prevent interference
  const [activeTab, setActiveTab] = useState("requested")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [newFeedback, setNewFeedback] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [requestSubject, setRequestSubject] = useState("")

  // Refs for maintaining focus
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const feedbackTextareaRef = useRef<HTMLTextAreaElement>(null)
  const subjectInputRef = useRef<HTMLInputElement>(null)

  // Stable event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }, [])

  const handleFeedbackChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewFeedback(e.target.value)
  }, [])

  const handleSubjectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestSubject(e.target.value)
  }, [])

  const handleSubmitFeedback = useCallback(() => {
    console.log("Submitting feedback:", { content: newFeedback, rating: feedbackRating })
    setNewFeedback("")
    setFeedbackRating(5)
  }, [newFeedback, feedbackRating])

  const handleRequestFeedback = useCallback(() => {
    console.log("Requesting feedback:", { subject: requestSubject, description: newFeedback })
    setRequestSubject("")
    setNewFeedback("")
  }, [requestSubject, newFeedback])

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

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "delivered":
        return "bg-purple-100 text-purple-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "active":
        return <AlertCircle className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }, [])

  // Memoized search dropdown to prevent re-renders
  const SearchDropdown = useMemo(() => {
    if (!showSearchDropdown) return null

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
          <div className="space-y-1">
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                onClick={() => handleSearchSelect(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [showSearchDropdown, handleSearchSelect])

  // Memoized header component
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

              <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search feedback requests..."
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
                {SearchDropdown}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <AthleteNav currentPath="/feedback" />

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
                      <Link href="/analytics" className="flex items-center w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
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
    [searchQuery, SearchDropdown, handleSearchChange, handleSearchFocus, clearSearch],
  )

  // Memoized main content
  const MainContent = useMemo(
    () => (
      <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
        {/* Page Header */}
        <div className="mb-6">
          <div className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>
                  {isMobile ? "Feedback" : "Feedback Center"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isMobile ? "Request & give feedback" : "Request feedback from subscribers and give testimonials"}
                </p>
              </div>
            </div>
            <div className={`flex ${isMobile ? "w-full space-x-2" : "space-x-3"}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={isMobile ? "flex-1" : ""} size={isMobile ? "sm" : "default"}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Feedback</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("active")}>Active Requests</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("recent")}>Recent</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Feedback Stats */}
        <div
          className={`grid ${isMobile ? "grid-cols-2 gap-3" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-4 gap-6"} mb-6`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Total</CardTitle>
              <MessageSquare className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>5</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>All feedback</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Requested</CardTitle>
              <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>3</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>From subscribers</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Average</CardTitle>
              <Star className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>4.6</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Star rating</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Response</CardTitle>
              <CheckCircle className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>78%</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Response rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`${isMobile ? "grid w-full grid-cols-2 h-auto" : "grid w-full grid-cols-2"}`}>
            <TabsTrigger
              value="requested"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>
                {isMobile ? "Requested" : `Requested (${FEEDBACK_DATA.requested.length})`}
              </span>
              {isMobile && <span className="text-xs text-gray-500">({FEEDBACK_DATA.requested.length})</span>}
            </TabsTrigger>
            <TabsTrigger
              value="given"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <ThumbsUp className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>
                {isMobile ? "Given" : `Given (${FEEDBACK_DATA.given.length})`}
              </span>
              {isMobile && <span className="text-xs text-gray-500">({FEEDBACK_DATA.given.length})</span>}
            </TabsTrigger>
          </TabsList>

          {/* Requested Feedback */}
          <TabsContent value="requested" className="space-y-4">
            {FEEDBACK_DATA.requested.length > 0 ? (
              <div className="space-y-4">
                {FEEDBACK_DATA.requested.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{request.subject}</h4>
                            <Badge variant="secondary" className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Sent to {request.recipients} subscribers</span>
                            <span>•</span>
                            <span>{request.responses} responses</span>
                            <span>•</span>
                            <span>Avg: {request.avgRating}/5 ⭐</span>
                            <span>•</span>
                            <span>Due: {request.deadline}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="outline">{request.category}</Badge>
                          <span>{request.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          View Responses
                        </Button>
                        <Button size="sm" variant="ghost">
                          Send Reminder
                        </Button>
                        {request.status === "active" && (
                          <Button size="sm" variant="ghost">
                            Close Request
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback requested</h3>
                  <p className="text-gray-600">
                    Start requesting feedback from your subscribers to improve your content.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Given Feedback */}
          <TabsContent value="given" className="space-y-4">
            {FEEDBACK_DATA.given.length > 0 ? (
              <div className="space-y-4">
                {FEEDBACK_DATA.given.map((feedback) => (
                  <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={feedback.avatar || "/placeholder.svg"}
                          alt={feedback.to}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">To: {feedback.to}</h4>
                              <Badge variant="secondary" className={getStatusColor(feedback.status)}>
                                {getStatusIcon(feedback.status)}
                                <span className="ml-1 capitalize">{feedback.status}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant="outline">{feedback.category}</Badge>
                              <span>{feedback.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">({feedback.rating}/5)</span>
                          </div>
                          <p className="text-gray-700">{feedback.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ThumbsUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback given</h3>
                  <p className="text-gray-600">Testimonials and feedback you've given to others will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    ),
    [isMobile, isTablet, activeTab, selectedFilter, getStatusColor, getStatusIcon],
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/feedback"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={0}
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