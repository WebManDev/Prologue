"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  MessageSquare,
  Send,
  Upload,
  Video,
  FileText,
  Users,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import MemberMobileNavigation from "@/components/mobile/member-mobile-navigation"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth } from "@/lib/firebase"
import { getMemberProfile } from "@/lib/firebase"
import { getAthletesByIds } from "@/lib/firebase"

export default function MemberFeedbackPage() {
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()
  const { isMobile, isTablet } = useMobileDetection()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Feedback form state for athletes
  const [feedbackTitle, setFeedbackTitle] = useState("")
  const [feedbackDescription, setFeedbackDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAthlete, setSelectedAthlete] = useState("")

  // Platform feedback form state
  const [platformFeedbackType, setPlatformFeedbackType] = useState("")
  const [platformFeedbackTitle, setPlatformFeedbackTitle] = useState("")
  const [platformFeedbackMessage, setPlatformFeedbackMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Remove the static subscribedAthletes array
  const [subscribedAthletes, setSubscribedAthletes] = useState<any[]>([])
  const [loadingSubscribed, setLoadingSubscribed] = useState(true)

  useEffect(() => {
    async function fetchSubscribedAthletes() {
      if (!auth.currentUser) return
      setLoadingSubscribed(true)
      const profileData = await getMemberProfile(auth.currentUser.uid)
      const subscriptionsObj = profileData?.subscriptions || {}
      const now = new Date()
      const activeAthleteIds = Object.entries(subscriptionsObj)
        .filter(([athleteId, sub]: any) => {
          if (sub.status === "active") return true
          if (sub.status === "canceled" && sub.cancelAt && new Date(sub.cancelAt) > now) return true
          return false
        })
        .map(([athleteId]) => athleteId)
      if (activeAthleteIds.length === 0) {
        setSubscribedAthletes([])
        setLoadingSubscribed(false)
        return
      }
      const athletes = await getAthletesByIds(activeAthleteIds)
      setSubscribedAthletes(athletes)
      setLoadingSubscribed(false)
    }
    fetchSubscribedAthletes()
  }, [])

  // Mock platform feedback history
  const platformFeedbackHistory = [
    {
      id: 1,
      type: "suggestion",
      title: "Improve video quality in training sessions",
      message:
        "The video quality in some training sessions could be better. Sometimes it's hard to see the details of the techniques being demonstrated.",
      status: "resolved",
      date: "2024-01-15",
      response:
        "Thank you for your feedback! We've upgraded our recording equipment and improved video quality across all training content.",
      rating: 5,
    },
    {
      id: 2,
      type: "bug",
      title: "App crashes when uploading progress videos",
      message: "The mobile app crashes whenever I try to upload a progress video longer than 2 minutes.",
      status: "in-progress",
      date: "2024-01-10",
      response: "We're working on fixing this issue. A patch will be released in the next app update.",
      rating: null,
    },
    {
      id: 3,
      type: "feature",
      title: "Add nutrition tracking feature",
      message: "It would be great to have a nutrition tracking feature integrated with the training program.",
      status: "under-review",
      date: "2024-01-05",
      response: null,
      rating: null,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmitFeedbackToAthlete = () => {
    if (!selectedAthlete) {
      alert("Please select an athlete to send feedback to.")
      return
    }

    // Handle feedback submission logic here
    const selectedAthleteData = subscribedAthletes.find((athlete) => athlete.id === selectedAthlete)
    console.log("Submitting feedback:", {
      title: feedbackTitle,
      description: feedbackDescription,
      file: selectedFile,
      targetAthlete: selectedAthleteData,
    })

    // Reset form
    setFeedbackTitle("")
    setFeedbackDescription("")
    setSelectedFile(null)
    setSelectedAthlete("")

    // Show success message
    alert(`Feedback submitted successfully to ${selectedAthleteData?.name}!`)
  }

  const handleSubmitPlatformFeedback = async () => {
    if (!platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage) {
      return
    }

    setIsSubmitting(true)

    // Send email to andyhluu23@gmail.com
    try {
      await fetch("/api/send-feedback-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: platformFeedbackType,
          title: platformFeedbackTitle,
          message: platformFeedbackMessage,
        }),
      })
    } catch (e) {
      // Optionally handle error
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Reset form
    setPlatformFeedbackType("")
    setPlatformFeedbackTitle("")
    setPlatformFeedbackMessage("")
    setIsSubmitting(false)

    // Show success message
    alert("Platform feedback submitted successfully!")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "under-review":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-yellow-100 text-yellow-700"
      case "under-review":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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

            {searchQuery && searchResults.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No results found for "{searchQuery}"</div>
            )}
          </div>
        </div>
      </div>
    )
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect, isMobile, isTablet])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
                  <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-prologue-electric transition-colors tracking-wider">
                    PROLOGUE
                  </span>
                )}
              </Link>

              <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search coaches, content..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20 transition-all"
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
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/member-home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                  href="/member-feedback"
                  className="flex flex-col items-center space-y-1 text-prologue-electric relative"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-prologue-electric"></div>
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
                <Link
                  href="/member-notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                    <Search className="h-5 w-5 text-gray-600" />
                  </Button>

                  {/* Notification Bell */}
                  <Link href="/member-notifications" className="relative">
                    <Button variant="ghost" size="sm" className="p-2 touch-target relative">
                      <Bell className="h-5 w-5 text-gray-600" />
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
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-500 p-1" />
                      </div>
                      {!isMobile && <ChevronDown className="h-4 w-4 text-gray-500" />}
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
            <div className="border-t border-gray-200 bg-white">
              <div className="px-4 py-4" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search coaches, content..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
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
                {searchDropdownContent}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-6 py-8 ${isMobile || isTablet ? "pb-20" : ""}`}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
              <p className="text-gray-600">Share feedback with athletes and help improve PROLOGUE</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="athletes" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Feedback to Athletes</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Platform Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Feedback History</span>
            </TabsTrigger>
          </TabsList>

          {/* Feedback to Athletes Tab */}
          <TabsContent value="athletes" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Send Feedback to Athletes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Athlete *</label>
                    <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an athlete to send feedback to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subscribedAthletes.map((athlete) => (
                          <SelectItem key={athlete.id} value={athlete.id}>
                            <div className="flex items-center space-x-3">
                              <Image
                                src={athlete.avatar || "/placeholder.svg"}
                                alt={athlete.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div>
                                <span className="font-medium">{athlete.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {athlete.sport} • {athlete.university}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Title *</label>
                    <Input
                      placeholder="e.g., Great serve technique improvement"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Message *</label>
                    <Textarea
                      placeholder="Provide detailed feedback and encouragement..."
                      rows={4}
                      value={feedbackDescription}
                      onChange={(e) => setFeedbackDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Clip (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-prologue-electric transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitFeedbackToAthlete}
                    className="w-full bg-prologue-electric hover:bg-prologue-blue text-white"
                    disabled={!selectedAthlete || !feedbackTitle || !feedbackDescription}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                </CardContent>
              </Card>

              {/* Subscribed Athletes & Previous Feedback */}
              <div className="space-y-6">
                {/* Subscribed Athletes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>My Athletes ({subscribedAthletes.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscribedAthletes.map((athlete) => (
                        <div key={athlete.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Image
                            src={athlete.avatar || "/placeholder.svg"}
                            alt={athlete.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{athlete.name}</h4>
                            <p className="text-sm text-gray-600">
                              {athlete.sport} • {athlete.level}
                            </p>
                            <p className="text-xs text-gray-500">{athlete.university}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAthlete(athlete.id)}
                            className="text-xs"
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Recent Feedback Sent</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Excellent backhand form!</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Delivered
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Great improvement on your backhand technique. Keep practicing the follow-through...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Sent to Alex Johnson</span>
                          <span>2 days ago</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Serve power analysis</h4>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            Viewed
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Your serve has improved significantly. Focus on the toss consistency...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Sent to Sarah Williams</span>
                          <span>1 week ago</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Mental game feedback</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Delivered
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Your mental toughness during pressure points has really improved...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Sent to Michael Chen</span>
                          <span>2 weeks ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <Button variant="outline">View All Feedback</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Platform Feedback Tab */}
          <TabsContent value="platform">
            <Card>
              <CardHeader>
                <CardTitle>Submit Platform Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="platform-feedback-type">Feedback Type</Label>
                  <Select value={platformFeedbackType} onValueChange={setPlatformFeedbackType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="compliment">Compliment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform-feedback-title">Title</Label>
                  <Input
                    id="platform-feedback-title"
                    value={platformFeedbackTitle}
                    onChange={(e) => setPlatformFeedbackTitle(e.target.value)}
                    placeholder="Brief description of your feedback"
                  />
                </div>

                <div>
                  <Label htmlFor="platform-feedback-message">Message</Label>
                  <Textarea
                    id="platform-feedback-message"
                    value={platformFeedbackMessage}
                    onChange={(e) => setPlatformFeedbackMessage(e.target.value)}
                    placeholder="Please provide detailed feedback..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">{platformFeedbackMessage.length}/1000 characters</p>
                </div>

                <Button
                  onClick={handleSubmitPlatformFeedback}
                  disabled={!platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage || isSubmitting}
                  className="w-full bg-prologue-electric hover:bg-prologue-blue text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              {platformFeedbackHistory.map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                          <Badge variant="secondary" className={getStatusColor(feedback.status)}>
                            {getStatusIcon(feedback.status)}
                            <span className="ml-1 capitalize">{feedback.status.replace("-", " ")}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{feedback.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Type: {feedback.type}</span>
                          <span>•</span>
                          <span>{feedback.date}</span>
                        </div>
                      </div>
                    </div>

                    {feedback.response && (
                      <div className="mt-4 p-4 bg-prologue-electric/5 rounded-lg border border-prologue-electric/20">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-prologue-electric rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-prologue-electric mb-1">PROLOGUE Team Response</h4>
                            <p className="text-gray-800">{feedback.response}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {feedback.status === "resolved" && feedback.rating && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Your rating:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {feedback.status === "resolved" && !feedback.rating && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">How satisfied are you with the resolution?</span>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Satisfied
                            </Button>
                            <Button variant="outline" size="sm">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Not Satisfied
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {platformFeedbackHistory.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback submitted yet</h3>
                    <p className="text-gray-600">Your feedback history will appear here once you submit feedback.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <MemberMobileNavigation
          currentPath="/member-feedback"
          unreadNotifications={unreadNotificationsCount}
          unreadMessages={unreadMessagesCount}
          hasNewContent={false}
        />
      )}
    </div>
  )
} 