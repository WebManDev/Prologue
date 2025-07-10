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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth } from "@/lib/firebase"
import { getMemberProfile } from "@/lib/firebase"
import { getAthletesByIds } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import { addDoc, collection, Timestamp, getDocs, query, orderBy, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth"
import { MemberHeader } from "@/components/navigation/member-header"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Add a type for received feedback
interface ReceivedFeedback {
  id: string;
  requestId: string;
  title: string;
  rating: number;
  comment: string;
  createdAt?: { seconds: number };
  athleteId?: string;
  // Add other fields as needed
}

export default function MemberFeedbackPage() {
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()
  const { isMobile, isTablet } = useMobileDetection()
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const memberProfile = await getMemberProfile(auth.currentUser.uid)
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
    }
    fetchProfile()
  }, [])

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

  // Add state for showing all feedback
  const [showAllFeedback, setShowAllFeedback] = useState(false)

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchSubscribedAthletes(user.uid);
      } else {
        setSubscribedAthletes([]);
        setLoadingSubscribed(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchSubscribedAthletes(uid: string) {
    setLoadingSubscribed(true);
    const profileData = await getMemberProfile(uid);
    const subscriptionsObj = profileData?.subscriptions || {};
    const activeAthleteIds = Object.keys(subscriptionsObj).filter(
      (athleteId) => subscriptionsObj[athleteId]?.status === "active"
    );
    if (activeAthleteIds.length === 0) {
      setSubscribedAthletes([]);
      setLoadingSubscribed(false);
      return;
    }
    const athletes = await getAthletesByIds(activeAthleteIds);
    setSubscribedAthletes(athletes);
    setLoadingSubscribed(false);
  }

  // Platform feedback history state
  const [platformFeedbackHistory, setPlatformFeedbackHistory] = useState<any[]>([])
  const [loadingFeedbackHistory, setLoadingFeedbackHistory] = useState(true)

  // Fetch platform feedback history from Firestore (only for current user)
  useEffect(() => {
    if (!auth.currentUser) return;
    setLoadingFeedbackHistory(true);
    const q = query(
      collection(db, "platformFeedback"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    getDocs(q)
      .then(snapshot => {
        setPlatformFeedbackHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      })
      .finally(() => setLoadingFeedbackHistory(false))
  }, [])

  const [receivedFeedback, setReceivedFeedback] = useState<ReceivedFeedback[]>([]);
  const [sentFeedback, setSentFeedback] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch feedback received
        const q = query(collection(db, "feedbackGiven"), where("memberId", "==", user.uid));
        getDocs(q).then(snapshot => {
          setReceivedFeedback(snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              requestId: data.requestId || '',
              title: data.title || '',
              rating: data.rating || 0,
              comment: data.comment || '',
              createdAt: data.createdAt,
              athleteId: data.athleteId || '',
            };
          }));
        });

        // Fetch feedback sent to athletes
        const sentQuery = query(
          collection(db, "feedbackToAthlete"),
          where("memberId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        getDocs(sentQuery).then(snapshot => {
          setSentFeedback(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        });
      } else {
        setReceivedFeedback([]);
        setSentFeedback([]);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const { logout } = useUnifiedLogout()

  const handleLogout = async () => {
    console.log("🔄 Member logout initiated from feedback page")
    await logout({
      customMessage: "Securing your member account and logging out...",
      onComplete: () => {
        console.log("✅ Member logout completed successfully from feedback page")
        toast({
          title: "Logged Out Successfully",
          description: "You have been securely logged out. Redirecting to login page...",
          duration: 2000,
        })
      },
      onError: (error) => {
        console.error("❌ Member logout failed from feedback page:", error)
        toast({
          title: "Logout Failed",
          description: "There was an issue logging you out. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      },
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const refreshSentFeedback = async () => {
    if (!auth.currentUser) return;
    const sentQuery = query(
      collection(db, "feedbackToAthlete"),
      where("memberId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(sentQuery);
    setSentFeedback(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  }

  const handleSubmitFeedbackToAthlete = async () => {
    if (!selectedAthlete) {
      toast({
        title: "Error",
        description: "Please select an athlete to send feedback to.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    const selectedAthleteData = subscribedAthletes.find((athlete) => athlete.id === selectedAthlete)
    const memberId = auth.currentUser?.uid || null
    const memberName = auth.currentUser?.displayName || ""
    let videoUrl = null

    try {
      // Upload video if selected
      if (selectedFile) {
        try {
          const storage = getStorage()
          const filePath = `feedback-videos/${memberId}/${Date.now()}_${selectedFile.name}`
          const fileRef = ref(storage, filePath)
          await uploadBytes(fileRef, selectedFile)
          videoUrl = await getDownloadURL(fileRef)
        } catch (e) {
          console.error("Video upload failed:", e)
          toast({
            title: "Warning",
            description: "Failed to upload video. Feedback will be sent without video.",
            variant: "destructive",
            duration: 4000,
          })
        }
      }

      console.log("Attempting to submit feedback with data:", {
        athleteId: selectedAthleteData?.id,
        athleteName: selectedAthleteData?.name,
        memberId,
        memberName,
        title: feedbackTitle,
        message: feedbackDescription,
        videoUrl,
        currentUser: auth.currentUser?.uid
      })

      await addDoc(collection(db, "feedbackToAthlete"), {
        athleteId: selectedAthleteData?.id,
        athleteName: selectedAthleteData?.name,
        memberId,
        memberName,
        title: feedbackTitle,
        message: feedbackDescription,
        videoUrl,
        createdAt: Timestamp.now(),
      })

      // Create notification for the athlete
      await addDoc(collection(db, "notifications"), {
        userId: selectedAthleteData?.id, // athlete's user ID
        type: "feedback",
        title: feedbackTitle,
        message: feedbackDescription,
        from: memberName,
        createdAt: Timestamp.now(),
        read: false,
      })
      
      // Refresh the sent feedback data in background (don't await)
      refreshSentFeedback().catch(e => {
        console.warn("Failed to refresh sent feedback:", e)
      })
      
      // Reset form
      setFeedbackTitle("")
      setFeedbackDescription("")
      setSelectedFile(null)
      setSelectedAthlete("")
      setIsSubmitting(false)
      
      toast({
        title: "Success!",
        description: `Feedback submitted successfully to ${selectedAthleteData?.name}!${videoUrl ? " Video uploaded." : ""}`,
        duration: 4000,
      })
    } catch (e) {
      console.error("Feedback submission error:", e)
      setIsSubmitting(false)
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to submit feedback: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleSubmitPlatformFeedback = async () => {
    if (!platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage) {
      return
    }

    setIsSubmitting(true)

    try {
      // Run email sending and Firestore write in parallel, don't wait for email
      const firestorePromise = addDoc(collection(db, "platformFeedback"), {
        type: platformFeedbackType,
        title: platformFeedbackTitle,
        message: platformFeedbackMessage,
        createdAt: Timestamp.now(),
        userId: auth.currentUser?.uid || null,
      })

      // Send email in background (don't await)
      fetch("/api/send-feedback-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: platformFeedbackType,
          title: platformFeedbackTitle,
          message: platformFeedbackMessage,
        }),
      }).catch(e => {
        // Silent fail for email - it's not critical
        console.warn("Email sending failed:", e)
      })

      // Only wait for Firestore write
      await firestorePromise

      // Reset form
      setPlatformFeedbackType("")
      setPlatformFeedbackTitle("")
      setPlatformFeedbackMessage("")
      setIsSubmitting(false)

      // Show success message using toast instead of alert
      toast({
        title: "Success!",
        description: "Platform feedback submitted successfully!",
        duration: 3000,
      })

    } catch (e) {
      console.error("Feedback submission error:", e)
      setIsSubmitting(false)
      
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
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

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Unknown time"
    
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.floor(diffInDays / 7)
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "1 day ago"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInWeeks === 1) return "1 week ago"
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`
    return date.toLocaleDateString()
  }

  // Memoized search dropdown content
  const searchDropdownContent = React.useMemo(() => {
    const displayItems = searchQuery ? searchResults : quickSearches.slice(0, 8);
    const isShowingResults = searchQuery && searchResults.length > 0;
    const isShowingQuickSearches = !searchQuery;

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
              quickSearches.slice(0, 8).map((search, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                  onClick={() => handleSearchSelect(search)}
                >
                  {search}
                </button>
              ))}

            {isShowingResults &&
              searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleSearchSelect(result.name || result.title || "")}
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
      <MemberHeader
        currentPath="/member-feedback"
        onLogout={handleLogout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="athletes" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Feedback to Athletes</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Platform Feedback</span>
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
                                src={athlete.profileImageUrl || athlete.profilePic || athlete.profilePicture || athlete.avatar || "/placeholder.svg"}
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
                    disabled={!selectedAthlete || !feedbackTitle || !feedbackDescription || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Feedback
                      </>
                    )}
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
                            src={athlete.profileImageUrl || athlete.profilePic || athlete.profilePicture || athlete.avatar || "/placeholder.svg"}
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
                    {sentFeedback.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No feedback sent yet</p>
                        <p className="text-sm text-gray-400 mt-1">Your sent feedback will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentFeedback.slice(0, 3).map((feedback) => (
                          <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Delivered
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {feedback.message.length > 80 
                                ? `${feedback.message.substring(0, 80)}...` 
                                : feedback.message
                              }
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Sent to {feedback.athleteName}</span>
                              <span>{getTimeAgo(feedback.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {sentFeedback.length > 0 && (
                      <div className="text-center mt-6">
                        <Button variant="outline" onClick={() => setShowAllFeedback(true)}>View All Feedback</Button>
                      </div>
                    )}
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


        </Tabs>
      </main>

      {/* All Feedback Dialog */}
      <Dialog open={showAllFeedback} onOpenChange={setShowAllFeedback}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>All Feedback History</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Feedback sent to athletes */}
            {sentFeedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Feedback Sent to Athletes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sentFeedback.map((feedback) => (
                      <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Delivered
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{feedback.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Sent to {feedback.athleteName}</span>
                          <span>{getTimeAgo(feedback.createdAt)}</span>
                        </div>
                        {feedback.videoUrl && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Video attached
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Feedback received from athletes */}
            {receivedFeedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Feedback Received from Athletes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {receivedFeedback.map((feedback) => (
                      <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Received
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">({feedback.rating}/5)</span>
                        </div>
                        <p className="text-gray-700 mb-1">{feedback.comment}</p>
                        <div className="text-xs text-gray-500">{feedback.createdAt?.seconds ? new Date(feedback.createdAt.seconds * 1000).toLocaleString() : ""}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Platform feedback history */}
            {platformFeedbackHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Platform Feedback History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformFeedbackHistory.map((feedback) => (
                      <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                              <Badge variant="secondary" className={getStatusColor(feedback.status)}>
                                {getStatusIcon(feedback.status)}
                                <span className="ml-1 capitalize">{(feedback.status || "new").replace("-", " ")}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{feedback.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Type: {feedback.type}</span>
                              <span>•</span>
                              <span>{feedback.createdAt?.seconds ? new Date(feedback.createdAt.seconds * 1000).toISOString().slice(0, 10) : ""}</span>
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
                                    className={`h-4 w-4 ${i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
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
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Show empty state only if no feedback exists at all */}
            {platformFeedbackHistory.length === 0 && receivedFeedback.length === 0 && sentFeedback.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback history yet</h3>
                  <p className="text-gray-600">Your feedback history will appear here once you send or receive feedback.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
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
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Training</span>
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
              className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors"
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
        </nav>
      )}
      <Toaster />
    </div>
  )
} 