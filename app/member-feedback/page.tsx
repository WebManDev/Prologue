"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Search, Filter, Star, MapPin, Calendar, Clock, MessageSquare, Plus, X, Send, Upload, Video, FileText, Users, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from "lucide-react"
import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth } from "@/lib/firebase"
import { getMemberProfile } from "@/lib/firebase"
import { getAthletesByIds } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import { addDoc, collection, Timestamp, getDocs, query, orderBy, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

interface FeedbackRequest {
  id: string
  coach: {
    name: string
    sport: string
    rating: number
    location: string
    avatar: string
    verified: boolean
    experience: string
    specialties: string[]
  }
  session: {
    title: string
    description: string
    duration: number
    type: "technique" | "strategy" | "mental" | "fitness"
    scheduledDate?: string
  }
  status: "pending" | "accepted" | "completed" | "declined"
  requestedDate: string
  priority: "low" | "medium" | "high"
  notes?: string
}

// Add a type for received feedback
interface ReceivedFeedback {
  id: string;
  requestId: string;
  title: string;
  rating: number;
  comment: string;
  createdAt?: { seconds: number };
  athleteId?: string;
}

export default function MemberFeedbackPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()

  // Filter states
  const [requestFilter, setRequestFilter] = useState("all")
  const [coachFilter, setCoachFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Request feedback dialog state
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestForm, setRequestForm] = useState({
    coachId: "",
    sessionTitle: "",
    sessionDescription: "",
    sessionType: "technique" as const,
    duration: 60,
    priority: "medium" as const,
    notes: "",
    preferredDate: "",
  })

  // Firebase state
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [subscribedAthletes, setSubscribedAthletes] = useState<any[]>([])
  const [loadingSubscribed, setLoadingSubscribed] = useState(true)
  const [receivedFeedback, setReceivedFeedback] = useState<ReceivedFeedback[]>([])
  const [sentFeedback, setSentFeedback] = useState<any[]>([])
  const [platformFeedbackHistory, setPlatformFeedbackHistory] = useState<any[]>([])
  const [loadingFeedbackHistory, setLoadingFeedbackHistory] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Platform feedback form state
  const [platformFeedbackType, setPlatformFeedbackType] = useState("")
  const [platformFeedbackTitle, setPlatformFeedbackTitle] = useState("")
  const [platformFeedbackMessage, setPlatformFeedbackMessage] = useState("")

  // Mock feedback requests data (keeping for UI demonstration)
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([
    {
      id: "1",
      coach: {
        name: "Sarah Martinez",
        sport: "Tennis Coach",
        rating: 4.9,
        location: "Los Angeles, CA",
        avatar: "/placeholder.svg?height=60&width=60",
        verified: true,
        experience: "8+ years",
        specialties: ["Serve Technique", "Mental Game", "Tournament Prep"],
      },
      session: {
        title: "Advanced Serve Technique",
        description: "Focus on improving serve consistency and power through proper form and follow-through",
        duration: 90,
        type: "technique",
        scheduledDate: "2024-01-20",
      },
      status: "pending",
      requestedDate: "2024-01-15",
      priority: "high",
      notes: "Need help with serve consistency before upcoming tournament",
    },
    {
      id: "2",
      coach: {
        name: "Mike Chen",
        sport: "Fitness Coach",
        rating: 4.7,
        location: "San Diego, CA",
        avatar: "/placeholder.svg?height=60&width=60",
        verified: false,
        experience: "5+ years",
        specialties: ["Strength Training", "Conditioning", "Injury Prevention"],
      },
      session: {
        title: "Athletic Conditioning Program",
        description: "Develop sport-specific fitness and endurance training plan",
        duration: 60,
        type: "fitness",
        scheduledDate: "2024-01-18",
      },
      status: "accepted",
      requestedDate: "2024-01-12",
      priority: "medium",
    },
    {
      id: "3",
      coach: {
        name: "Emma Wilson",
        sport: "Sports Psychologist",
        rating: 4.8,
        location: "San Francisco, CA",
        avatar: "/placeholder.svg?height=60&width=60",
        verified: true,
        experience: "10+ years",
        specialties: ["Mental Performance", "Competition Anxiety", "Focus Training"],
      },
      session: {
        title: "Pre-Competition Mental Preparation",
        description: "Strategies for managing competition nerves and maintaining focus",
        duration: 45,
        type: "mental",
      },
      status: "completed",
      requestedDate: "2024-01-10",
      priority: "high",
      notes: "Excellent session on visualization techniques",
    },
  ])

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  // Firebase profile fetching
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

  // Fetch subscribed athletes
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

  // Fetch platform feedback history from Firestore
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

  // Fetch feedback data
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

  const handleLogout = useCallback(async () => {
    console.log("🔄 Member logout initiated from feedback")

    try {
      const success = await logout({
        customMessage: "Securing your member account and logging out...",
        onComplete: () => {
          console.log("✅ Member logout completed successfully from feedback")
          toast({
            title: "Logged Out Successfully",
            description: "You have been securely logged out. Redirecting to login page...",
            duration: 2000,
          })
        },
        onError: (error) => {
          console.error("❌ Member logout failed from feedback:", error)
          toast({
            title: "Logout Failed",
            description: "There was an issue logging you out. Please try again.",
            variant: "destructive",
            duration: 3000,
          })
        },
      })

      if (!success) {
        console.warn("⚠️ Member logout was not successful, attempting emergency logout")
        setTimeout(() => {
          window.location.href = "/login"
        }, 3000)
      }
    } catch (error) {
      console.error("Logout error:", error)
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    }
  }, [logout])

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return feedbackRequests.filter((request) => {
      const matchesRequestFilter = requestFilter === "all" || request.status === requestFilter
      const matchesCoachFilter =
        coachFilter === "all" || request.coach.sport.toLowerCase().includes(coachFilter.toLowerCase())
      const matchesSearch =
        searchQuery === "" ||
        request.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.coach.sport.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesRequestFilter && matchesCoachFilter && matchesSearch
    })
  }, [feedbackRequests, requestFilter, coachFilter, searchQuery])

  // Handle request feedback form
  const handleRequestFeedback = useCallback(() => {
    const newRequest: FeedbackRequest = {
      id: Date.now().toString(),
      coach: {
        name: "New Coach",
        sport: "General Coach",
        rating: 4.5,
        location: "Location TBD",
        avatar: "/placeholder.svg?height=60&width=60",
        verified: false,
        experience: "TBD",
        specialties: [],
      },
      session: {
        title: requestForm.sessionTitle,
        description: requestForm.sessionDescription,
        duration: requestForm.duration,
        type: requestForm.sessionType,
        scheduledDate: requestForm.preferredDate,
      },
      status: "pending",
      requestedDate: new Date().toISOString().split("T")[0],
      priority: requestForm.priority,
      notes: requestForm.notes,
    }

    setFeedbackRequests((prev) => [newRequest, ...prev])
    setShowRequestDialog(false)
    setRequestForm({
      coachId: "",
      sessionTitle: "",
      sessionDescription: "",
      sessionType: "technique",
      duration: 60,
      priority: "medium",
      notes: "",
      preferredDate: "",
    })

    toast({
      title: "Feedback Request Sent",
      description: "Your feedback request has been submitted successfully.",
    })
  }, [requestForm])

  // Firebase file upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Firebase feedback submission to athletes
  const handleSubmitFeedbackToAthlete = async () => {
    if (!requestForm.coachId) {
      toast({
        title: "Error",
        description: "Please select an athlete to send feedback to.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    const selectedAthleteData = subscribedAthletes.find((athlete) => athlete.id === requestForm.coachId)
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

      await addDoc(collection(db, "feedbackToAthlete"), {
        athleteId: selectedAthleteData?.id,
        athleteName: selectedAthleteData?.name,
        memberId,
        memberName,
        title: requestForm.sessionTitle,
        message: requestForm.sessionDescription,
        videoUrl,
        createdAt: Timestamp.now(),
      })

      // Create notification for the athlete
      await addDoc(collection(db, "notifications"), {
        userId: selectedAthleteData?.id,
        type: "feedback",
        title: requestForm.sessionTitle,
        message: requestForm.sessionDescription,
        from: memberName,
        createdAt: Timestamp.now(),
        read: false,
      })
      
      // Reset form
      setRequestForm({
        coachId: "",
        sessionTitle: "",
        sessionDescription: "",
        sessionType: "technique",
        duration: 60,
        priority: "medium",
        notes: "",
        preferredDate: "",
      })
      setSelectedFile(null)
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

  // Firebase platform feedback submission
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const MainContent = () => (
    <div className={`${isMobile ? "px-1 py-4 pb-24" : "px-6 py-6"} min-h-screen flex flex-col`}>
      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search coaches or sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Select value={requestFilter} onValueChange={setRequestFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Requests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>

            <Select value={coachFilter} onValueChange={setCoachFilter}>
              <SelectTrigger className="w-40">
                <Star className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Coaches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coaches</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="psychology">Psychology</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request Feedback Button */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button className="bg-prologue-electric hover:bg-prologue-blue whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Send Media for Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send Media for Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="creatorSelect">Select Creator</Label>
                <Select
                  value={requestForm.coachId}
                  onValueChange={(value) => setRequestForm({ ...requestForm, coachId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subscribed creator" />
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
                <Label htmlFor="mediaUpload">Upload Media</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input 
                    type="file" 
                    accept="video/*,image/*" 
                    multiple 
                    className="hidden" 
                    id="mediaUpload" 
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="mediaUpload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload videos or images</p>
                        <p className="text-xs text-gray-500">MP4, MOV, JPG, PNG up to 50MB each</p>
                      </div>
                    </div>
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-gray-50 rounded flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="feedbackRequest">What would you like feedback on?</Label>
                <Textarea
                  id="feedbackRequest"
                  value={requestForm.sessionDescription}
                  onChange={(e) => setRequestForm({ ...requestForm, sessionDescription: e.target.value })}
                  placeholder="Describe what specific feedback you're looking for..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={requestForm.priority}
                  onValueChange={(value: any) => setRequestForm({ ...requestForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Not urgent</SelectItem>
                    <SelectItem value="medium">Moderately urgent</SelectItem>
                    <SelectItem value="high">Very urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitFeedbackToAthlete} 
                  disabled={!requestForm.coachId || !requestForm.sessionDescription || isSubmitting}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send for Feedback
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feedback Requests List */}
      <div className="flex-1 space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className={`p-8 text-center ${isMobile ? 'w-full' : ''}` }>
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback requests found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || requestFilter !== "all" || coachFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Start by requesting feedback from your coaches"}
            </p>
            {!searchQuery && requestFilter === "all" && coachFilter === "all" && (
              <Button
                onClick={() => setShowRequestDialog(true)}
                className="bg-prologue-electric hover:bg-prologue-blue"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Feedback
              </Button>
            )}
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className={`hover:shadow-md transition-shadow ${isMobile ? 'w-full' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Coach Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-400 p-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{request.coach.name}</h3>
                        </div>
                        <p className="text-gray-600">{request.coach.sport}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{request.session.title}</h4>
                      <p className="text-gray-700 mb-3">{request.session.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{request.session.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {request.session.scheduledDate
                              ? `Scheduled: ${new Date(request.session.scheduledDate).toLocaleDateString()}`
                              : `Requested: ${new Date(request.requestedDate).toLocaleDateString()}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{request.coach.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Coach Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{request.coach.rating}/5.0</span>
                        </div>
                        <span>{request.coach.experience}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0 items-center px-2 pb-2">
                        {request.status === "pending" && (
                          <>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">Edit Request</Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-red-600 hover:text-red-700 bg-transparent"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {request.status === "accepted" && (
                          <Button size="sm" className="w-full sm:w-auto bg-prologue-electric hover:bg-prologue-blue">
                            Join Session
                          </Button>
                        )}
                        {request.status === "completed" && (
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            View Feedback
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/member-feedback"
        showBottomNav={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
      <MainContent />

      {/* Logout Notification */}
      <LogoutNotification
        isVisible={loadingState.isVisible}
        userType={loadingState.userType}
        stage={loadingState.stage}
        message={loadingState.message}
        error={loadingState.error}
        canRetry={loadingState.canRetry}
        onRetry={retryLogout}
        onCancel={cancelLogout}
      />
      <Toaster />
    </div>
  )
} 