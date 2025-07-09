"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  Star,
  Plus,
  CheckCircle,
  Clock,
  Search,
  X,
  Home,
  MessageCircle,
  Bell,
  LayoutDashboard,
  TrendingUp,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import FeedbackDialog from "@/components/feedback-dialog"
import Image from "next/image"
import Link from "next/link"
import { useAdvancedNotifications } from "@/contexts/advanced-notification-context"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from "firebase/firestore"
import { db, auth, getAthleteProfile, addFeedback } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

// Types for feedback
interface FeedbackRequest {
  id: string
  title: string
  description: string
  category: string
  status: "active" | "completed"
  videoUrl?: string
  createdAt: string
  completedAt?: string
  userRating?: number
  userComment?: string
  memberId?: string
}

interface GivenFeedback {
  id: string
  requestId: string
  title: string
  rating: number
  comment: string
  createdAt?: { seconds: number }
  category?: string
  userComment?: string
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export default function FeedbackPage() {
  const { isMobile, isTablet } = useMobileDetection()

  // State management
  const [activeTab, setActiveTab] = useState("requested")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequest | null>(null)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  
  // Firebase state
  const [requestedFeedback, setRequestedFeedback] = useState<FeedbackRequest[]>([])
  const [givenFeedback, setGivenFeedback] = useState<GivenFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)

  // Platform feedback state
  const [platformFeedbackType, setPlatformFeedbackType] = useState("")
  const [platformFeedbackTitle, setPlatformFeedbackTitle] = useState("")
  const [platformFeedbackMessage, setPlatformFeedbackMessage] = useState("")
  const [isSubmittingPlatform, setIsSubmittingPlatform] = useState(false)

  // Refs
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Contexts
  const { hasUnreadMessages } = useAdvancedNotifications()

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

  // Firebase data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch athlete profile picture
          const docRef = doc(db, "athletes", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setProfilePicUrl(docSnap.data().profileImageUrl || docSnap.data().profilePicture || null)
          }

          // Fetch requested feedback
          const requestedQuery = query(collection(db, "feedbackToAthlete"), where("athleteId", "==", user.uid))
          const requestedSnapshot = await getDocs(requestedQuery)
          const requestedData = requestedSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title || '',
              description: data.message || '',
              category: data.category || 'General',
              status: "active" as const,
              videoUrl: data.videoUrl,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              memberId: data.memberId || null,
            }
          })

          // Fetch given feedback
          const givenQuery = query(collection(db, "feedbackGiven"), where("athleteId", "==", user.uid))
          const givenSnapshot = await getDocs(givenQuery)
          const givenData = givenSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              requestId: data.requestId || '',
              title: data.title || '',
              rating: data.rating || 0,
              comment: data.comment || '',
              createdAt: data.createdAt,
              category: data.category || 'General',
              userComment: data.comment || '',
            }
          })

          setRequestedFeedback(requestedData)
          setGivenFeedback(givenData)
        } catch (error) {
          console.error("Error fetching feedback data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
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

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Feedback handlers
  const handleCompleteFeedback = useCallback((request: FeedbackRequest) => {
    setSelectedRequest(request)
    setShowFeedbackDialog(true)
  }, [])

  const handleSubmitFeedback = useCallback(async () => {
    if (!selectedRequest || feedbackRating === 0) return

    const user = auth.currentUser
    if (!user) return

    try {
      // Save to feedbackGiven collection
      const docRef = await addDoc(collection(db, "feedbackGiven"), {
        athleteId: user.uid,
        requestId: selectedRequest.id,
        title: selectedRequest.title,
        rating: feedbackRating,
        comment: feedbackComment,
        createdAt: serverTimestamp(),
        memberId: selectedRequest.memberId || null,
        category: selectedRequest.category,
      })

      // Delete the original feedback request
      if (selectedRequest.id) {
        const feedbackRequestRef = doc(db, "feedbackToAthlete", selectedRequest.id)
        await deleteDoc(feedbackRequestRef)
      }

      // Send notification to the member who requested feedback
      if (selectedRequest.memberId) {
        const athleteProfile = await getAthleteProfile(user.uid)
        
        await addDoc(collection(db, "notifications"), {
          type: "feedback",
          title: "Feedback Received",
          message: `${athleteProfile?.name || "Coach"} has provided feedback on your submission: "${selectedRequest.title}".`,
          recipientId: selectedRequest.memberId,
          senderId: user.uid,
          senderName: athleteProfile?.name || "Coach",
          priority: "medium",
          category: "Performance Feedback",
          actionType: "view_feedback",
          actionUrl: `/member-feedback?id=${docRef.id}`,
          metadata: {
            feedbackId: docRef.id,
            rating: feedbackRating,
            contentType: "submission",
            feedbackPreview: feedbackComment.substring(0, 100) + (feedbackComment.length > 100 ? "..." : "")
          },
          createdAt: serverTimestamp(),
          read: false
        })
      }

      // Update local state
      setGivenFeedback(prev => [
        {
          id: docRef.id,
          requestId: selectedRequest.id,
          title: selectedRequest.title,
          rating: feedbackRating,
          comment: feedbackComment,
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
          category: selectedRequest.category,
          userComment: feedbackComment,
        },
        ...prev,
      ])
      setRequestedFeedback(prev => prev.filter(req => req.id !== selectedRequest.id))

      // Reset form
      setFeedbackRating(0)
      setFeedbackComment("")
      setShowFeedbackDialog(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    }
  }, [selectedRequest, feedbackRating, feedbackComment])

  // Platform feedback submission
  const handleSubmitPlatformFeedback = useCallback(async () => {
    if (!platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage) {
      alert("Please fill in all fields")
      return
    }

    setIsSubmittingPlatform(true)
    
    try {
      await addFeedback({
        type: platformFeedbackType,
        title: platformFeedbackTitle,
        message: platformFeedbackMessage,
        userId: auth.currentUser?.uid
      })

      // Reset form
      setPlatformFeedbackType("")
      setPlatformFeedbackTitle("")
      setPlatformFeedbackMessage("")
      
      alert("Platform feedback submitted successfully!")
    } catch (error) {
      console.error("Error submitting platform feedback:", error)
      alert("Failed to submit platform feedback. Please try again.")
    } finally {
      setIsSubmittingPlatform(false)
    }
  }, [platformFeedbackType, platformFeedbackTitle, platformFeedbackMessage])

  // Filter feedback requests by tab
  const filteredRequestedFeedback = useMemo(() => {
    let requests = requestedFeedback
    
    if (searchQuery) {
      return requests.filter((request) => {
        return (
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    return requests
  }, [searchQuery, requestedFeedback])

  const filteredGivenFeedback = useMemo(() => {
    let requests = givenFeedback
    
    if (searchQuery) {
      return requests.filter((request) => {
        return (
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.category || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    return requests
  }, [searchQuery, givenFeedback])

  // Stats
  const stats = useMemo(() => {
    const total = requestedFeedback.length + givenFeedback.length
    const completed = givenFeedback.length
    const active = requestedFeedback.length
    const avgRating = givenFeedback.length > 0
      ? givenFeedback.reduce((sum, r) => sum + (r.rating || 0), 0) / givenFeedback.length
      : 0

    return { total, completed, active, avgRating }
  }, [requestedFeedback, givenFeedback])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  // Main content component
  const renderMainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      {/* Feedback Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${isMobile ? "grid w-full grid-cols-3 h-auto" : "grid w-full grid-cols-3"}`}>
          <TabsTrigger
            value="requested"
            className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
          >
            <Clock className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            <span className={`${isMobile ? "text-xs" : ""}`}>Requested ({stats.active})</span>
          </TabsTrigger>
          <TabsTrigger
            value="given"
            className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
          >
            <CheckCircle className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            <span className={`${isMobile ? "text-xs" : ""}`}>Given ({stats.completed})</span>
          </TabsTrigger>
          <TabsTrigger
            value="platform"
            className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
          >
            <Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            <span className={`${isMobile ? "text-xs" : ""}`}>Platform Feedback</span>
          </TabsTrigger>
        </TabsList>

        {/* Requested Feedback Tab */}
        <TabsContent value="requested" className="space-y-4">
          {filteredRequestedFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback requests</h3>
              <p className="text-gray-600">You haven't requested any feedback yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequestedFeedback.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {request.category}
                            </Badge>
                            <Badge
                              variant={request.status === "active" ? "default" : "secondary"}
                              className={request.status === "active" ? "bg-green-100 text-green-700" : ""}
                            >
                              {request.status === "active" ? "Active" : "Completed"}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                          <p className="text-gray-600 text-sm">{request.description}</p>
                        </div>
                      </div>

                      {/* Video Player */}
                      {request.videoUrl && (
                        <div className="space-y-3">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                            {(() => {
                              const videoId = getYouTubeVideoId(request.videoUrl)
                              if (videoId) {
                                return (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={request.title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                )
                              }
                              return (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <p className="text-sm text-gray-500">Video not available</p>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleCompleteFeedback(request as FeedbackRequest)}
                        >
                          Complete Feedback
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Given Feedback Tab */}
        <TabsContent value="given" className="space-y-4">
          {filteredGivenFeedback.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed feedback</h3>
              <p className="text-gray-600">You haven't completed any feedback yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGivenFeedback.map((feedback) => (
                <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {feedback.category || 'General'}
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Completed
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{feedback.title}</h3>
                          <p className="text-gray-600 text-sm">{feedback.comment}</p>
                        </div>
                      </div>

                      {/* User Feedback Display */}
                      {feedback.rating && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Your Feedback:</span>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (feedback.rating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">{feedback.rating}/5</span>
                            </div>
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-gray-700 italic">"{feedback.comment}"</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Completed on {feedback.createdAt ? new Date(feedback.createdAt.seconds * 1000).toLocaleDateString() : "Unknown"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Platform Feedback Tab */}
        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Feedback</h3>
                  <p className="text-gray-600">Share feedback about the PROLOGUE platform</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Type
                    </label>
                    <select
                      value={platformFeedbackType}
                      onChange={(e) => setPlatformFeedbackType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select feedback type</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="improvement">Improvement Suggestion</option>
                      <option value="general">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={platformFeedbackTitle}
                      onChange={(e) => setPlatformFeedbackTitle(e.target.value)}
                      placeholder="Brief title for your feedback"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={platformFeedbackMessage}
                      onChange={(e) => setPlatformFeedbackMessage(e.target.value)}
                      placeholder="Describe your feedback in detail..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitPlatformFeedback}
                      disabled={isSubmittingPlatform || !platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmittingPlatform ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showFeedbackDialog && selectedRequest && (
        <FeedbackDialog
          request={selectedRequest}
          rating={feedbackRating}
          comment={feedbackComment}
          onRatingChange={setFeedbackRating}
          onCommentChange={setFeedbackComment}
          onSubmit={handleSubmitFeedback}
          onClose={() => setShowFeedbackDialog(false)}
        />
      )}
    </main>
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
        {renderMainContent()}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/Prologue LOGO-1.png"
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
                    ref={searchInputRef}
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
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Content</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/feedback"
                  className="flex flex-col items-center space-y-1 text-blue-500 transition-colors group relative"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                </Link>
                <Link
                  href="/messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
                <Link
                  href="/notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        {profilePicUrl ? (
                          <Image
                            src={profilePicUrl}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-full h-full text-gray-500 p-1" />
                        )}
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
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
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
      {renderMainContent()}
    </div>
  )
} 