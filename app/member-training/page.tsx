"use client"

import type React from "react"
import { Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  User,
  ChevronDown,
  Star,
  MessageSquare,
  Filter,
  Clock,
  Target,
  CheckCircle,
  Plus,
  Trophy,
  Calendar,
  Play,
  BookOpen,
  Award,
  Activity,
  Users,
  Heart,
  Edit3,
} from "lucide-react"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Save } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { auth, getMemberProfile } from "@/lib/firebase"
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface WeeklyGoal {
  id: string
  title: string
  description: string
  points: number
  category: "content" | "engagement" | "learning" | "community" | "progress"
  target: number
  current: number
  completed: boolean
  icon: React.ComponentType<{ className?: string }>
}

export default function MemberTrainingPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent, markTrainingAsVisited } = useMemberNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedCoach, setSelectedCoach] = useState("all")

  // Goals state
  const [showGoalSelector, setShowGoalSelector] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<WeeklyGoal[]>([])
  const [availableGoals, setAvailableGoals] = useState<WeeklyGoal[]>([])
  const [weekExpiration, setWeekExpiration] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [totalPoints, setTotalPoints] = useState(150)

  // Firebase state
  const [articles, setArticles] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [creators, setCreators] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  // Add dynamic programs state
  const [programs, setPrograms] = useState<any[]>([]);

  // Mark training as visited on mount
  useEffect(() => {
    if (hasNewTrainingContent) {
      markTrainingAsVisited()
    }
  }, [hasNewTrainingContent, markTrainingAsVisited])

  // Quick search suggestions
  const quickSearches = useMemo(
    () => [
      { label: "Navigate Recruitment" },
      { label: "Nutrition" },
      { label: "NIL" },
      { label: "Training Programs" },
      { label: "Mental Performance" },
      { label: "Injury Prevention" },
      { label: "Sports Psychology" },
      { label: "Athletic Scholarships" },
    ],
    [],
  )

  // Mock search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const mockResults = [
      {
        type: "coach",
        name: "Jordan Smith",
        sport: "Tennis",
        rating: 4.9,
        experience: "8+ years",
        location: "Los Angeles, CA",
      },
      {
        type: "coach",
        name: "Alex Rodriguez",
        sport: "Basketball",
        rating: 4.8,
        experience: "12+ years",
        location: "Miami, FL",
      },
      {
        type: "content",
        title: "College Recruitment Guide",
        creator: "PROLOGUE Team",
        views: "45K",
        duration: "12 min",
      },
      {
        type: "content",
        title: "NIL Deal Strategies",
        creator: "Sports Business Pro",
        views: "32K",
        duration: "18 min",
      },
    ].filter(
      (result) =>
        result.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.creator?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return mockResults
  }, [searchQuery])

  // Mock training sessions data
  const [trainingSessions, setTrainingSessions] = useState([])

  // Mock achievements data
  const [achievements, setAchievements] = useState([])

  // Training stats
  const trainingStats = {
    totalSessions: 0,
    completedSessions: 0,
    scheduledSessions: 0,
    totalPoints: 0,
    weeklyGoal: 5,
    currentStreak: 3,
  }

  // Initialize available goals
  useEffect(() => {
    const goals: WeeklyGoal[] = [
      {
        id: "1",
        title: "Watch 5 Training Videos",
        description: "Complete 5 educational training videos this week",
        points: 50,
        category: "content",
        target: 5,
        current: 2,
        completed: false,
        icon: Video,
      },
      {
        id: "2",
        title: "Message 3 Coaches",
        description: "Connect with 3 different coaches for guidance",
        points: 40,
        category: "engagement",
        target: 3,
        current: 1,
        completed: false,
        icon: MessageSquare,
      },
      {
        id: "3",
        title: "Complete 2 Courses",
        description: "Finish 2 complete training courses",
        points: 75,
        category: "learning",
        target: 2,
        current: 0,
        completed: false,
        icon: BookOpen,
      },
      {
        id: "4",
        title: "Subscribe to 2 Creators",
        description: "Follow 2 new creators for their content",
        points: 30,
        category: "community",
        target: 2,
        current: 1,
        completed: false,
        icon: Users,
      },
      {
        id: "5",
        title: "Browse Coaches 10 Times",
        description: "Explore coach profiles to find the right fit",
        points: 25,
        category: "engagement",
        target: 10,
        current: 4,
        completed: false,
        icon: Target,
      },
      {
        id: "6",
        title: "Like 15 Posts",
        description: "Engage with community content",
        points: 20,
        category: "community",
        target: 15,
        current: 8,
        completed: false,
        icon: Heart,
      },
      {
        id: "7",
        title: "Complete Profile Setup",
        description: "Finish setting up your member profile",
        points: 60,
        category: "progress",
        target: 1,
        current: 0,
        completed: false,
        icon: Award,
      },
      {
        id: "8",
        title: "Schedule 3 Sessions",
        description: "Book 3 training sessions with coaches",
        points: 80,
        category: "engagement",
        target: 3,
        current: 1,
        completed: false,
        icon: Calendar,
      },
    ]

    setAvailableGoals(goals)

    // Set initial selected goals (first 4)
    if (selectedGoals.length === 0) {
      setSelectedGoals(goals.slice(0, 4))
    }
  }, [selectedGoals.length])

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    const now = new Date()
    const diff = weekExpiration.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [weekExpiration])

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: { name?: string; title?: string; label?: string }) => {
    if (search.label) {
      setSearchQuery(search.label)
      setShowSearchDropdown(false)
      console.log("Member training searching for:", search.label)
    } else if (search.name || search.title) {
      setSearchQuery(search.name || search.title || "")
      setShowSearchDropdown(false)
      console.log("Member training searching for:", search.name || search.title)
    }
  }, [])

  const clearSearch = useCallback(() => {
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

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  const handleLogout = useCallback(async () => {
    console.log("🔄 Member logout initiated from training page")

    try {
      const success = await logout({
        customMessage: "Securing your member account and logging out...",
        onComplete: () => {
          console.log("✅ Member logout completed successfully from training page")
          toast({
            title: "Logged Out Successfully",
            description: "You have been securely logged out. Redirecting to login page...",
            duration: 2000,
          })
        },
        onError: (error) => {
          console.error("❌ Member logout failed from training page:", error)
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

  // Firebase functionality
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser
        if (user) {
          const profile = await getMemberProfile(user.uid)
          setProfileData(profile)
          setProfileImageUrl(profile?.profileImageUrl || null)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
    loadProfile()
  }, [])

  // Get subscribed athlete IDs (only active subscriptions for new content)
  const athleteIds = useMemo(() => {
    if (!profileData?.subscriptions) return []
    
    // Only return athletes with active subscriptions for new training content
    return Object.keys(profileData.subscriptions).filter(
      athleteId => profileData.subscriptions[athleteId]?.status === "active"
    )
  }, [profileData])

  // Get all athlete IDs (including inactive) for historical content access
  const allAthleteIds = useMemo(() => {
    if (!profileData?.subscriptions) return []
    return Object.keys(profileData.subscriptions)
  }, [profileData])

  // Check if user has access to specific content
  const hasContentAccess = useCallback((authorId: string, contentType: 'training' | 'feedback' | 'messaging') => {
    if (!profileData?.subscriptions || !authorId) return false
    
    const subscription = profileData.subscriptions[authorId]
    if (!subscription) return false
    
    // Always allow access to feedback and messaging history
    if (contentType === 'feedback' || contentType === 'messaging') {
      return true
    }
    
    // Only allow training content for active subscriptions
    return subscription.status === "active"
  }, [profileData])

  // Listen to content from subscribed creators
  useEffect(() => {
    if (!athleteIds.length) {
      setArticles([])
      setVideos([])
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    function listenToBatch(
      ids: string[],
      collectionName: "articles" | "videos" | "courses",
      setter: React.Dispatch<any[]>
    ) {
      const q = query(
        collection(db, collectionName),
        where("createdBy", "in", ids),
        orderBy("createdAt", "desc")
      )

      return onSnapshot(q, (snapshot) => {
        const content = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: collectionName.slice(0, -1) // Remove 's' from end
        }))
        setter(content)
      }, (error) => {
        console.error(`Error listening to ${collectionName}:`, error)
        setError(`Failed to load ${collectionName}`)
      })
    }

    async function fetchCreators() {
      try {
        const creatorsData: {[key: string]: any} = {}
        
        for (const athleteId of athleteIds) {
          const athleteDoc = await getDoc(doc(db, "athletes", athleteId))
          if (athleteDoc.exists()) {
            creatorsData[athleteId] = athleteDoc.data()
          }
        }
        
        setCreators(creatorsData)
      } catch (error) {
        console.error("Error fetching creators:", error)
      }
    }

    async function fetchContent() {
      try {
        const unsubscribeArticles = listenToBatch(athleteIds, "articles", setArticles)
        const unsubscribeVideos = listenToBatch(athleteIds, "videos", setVideos)
        const unsubscribeCourses = listenToBatch(athleteIds, "courses", setCourses)

        await fetchCreators()

        setLoading(false)

        return () => {
          unsubscribeArticles()
          unsubscribeVideos()
          unsubscribeCourses()
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        setError("Failed to load content")
        setLoading(false)
      }
    }

    fetchContent()
  }, [athleteIds])

  // Fetch programs (courses and videos) from Firestore for subscribed athletes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!athleteIds.length) {
        setPrograms([]);
        return;
      }
      setLoading(true);
      try {
        // Fetch courses
        const coursesQ = query(
          collection(db, "courses"),
          where("authorId", "in", athleteIds)
        );
        const coursesSnapshot = await getDocs(coursesQ);
        const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "course" }));

        // Fetch videos
        const videosQ = query(
          collection(db, "videos"),
          where("authorId", "in", athleteIds)
        );
        const videosSnapshot = await getDocs(videosQ);
        const videos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "video" }));

        // Combine and sort by createdAt (desc)
        const allPrograms = [...courses, ...videos].sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setPrograms(allPrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [athleteIds]);

  const fetchAuthorProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "athletes", uid)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() : null
    } catch (error) {
      console.error("Error fetching author profile:", error)
      return null
    }
  }

  const getCreatorInfo = (creatorId: string) => {
    return creators[creatorId] || { firstName: "Unknown", lastName: "Creator" }
  }

  const formatDate = (date: any) => {
    if (!date) return "Unknown date"
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString()
  }

  const handleContentClick = (type: string, id: string, creatorId: string) => {
    if (!hasContentAccess(creatorId, 'training')) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to access this content.",
        variant: "destructive",
      })
      return
    }

    // Navigate to content
    window.location.href = `/${type}/${id}`
  }

  function sanitizeDescription(html: string) {
    if (!html) return "No description available."
    return html.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
  }

  // Filter programs based on selected filter
  const filteredPrograms = useMemo(() => {
    if (selectedFilter === "all") return programs;
    if (selectedFilter === "in-progress") return programs.filter((p) => p.completed < (p.sessions || p.totalSessions || 1));
    if (selectedFilter === "completed") return programs.filter((p) => p.completed === (p.sessions || p.totalSessions || 1));
    return programs.filter((p) => (p.category || "").toLowerCase() === selectedFilter);
  }, [selectedFilter, programs]);

  // Filter training sessions based on selected filters
  const filteredSessions = useMemo(() => {
    return []
  }, [])

  // Get unique coaches for filter
  const coaches = useMemo(() => {
    return []
  }, [])

  const handleTrainingSubmit = () => {}

  const getTypeColor = (type: string) => {
    return ""
  }

  const getStatusColor = (status: string) => {
    return ""
  }

  const getStatusIcon = (status: string) => {
    return <Clock className="h-4 w-4" />
  }

  const getTypeIcon = (type: string) => {
    return <Activity className="h-5 w-5" />
  }

  // Goal management functions
  const handleGoalSelection = (goalIds: string[]) => {
    if (goalIds.length > 4) {
      toast({
        title: "Maximum Goals Reached",
        description: "You can only select up to 4 goals per week.",
        variant: "destructive",
      })
      return
    }

    const newSelectedGoals = availableGoals.filter((goal) => goalIds.includes(goal.id))
    setSelectedGoals(newSelectedGoals)
  }

  const completeGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId && !goal.completed) {
          const updatedGoal = { ...goal, completed: true, current: goal.target }

          // Add points to profile
          setTotalPoints((prevPoints) => prevPoints + goal.points)

          toast({
            title: "Goal Completed! 🎉",
            description: `You earned ${goal.points} points! Total: ${totalPoints + goal.points}`,
            duration: 4000,
          })

          return updatedGoal
        }
        return goal
      }),
    )
  }

  const resetWeeklyGoals = () => {
    setSelectedGoals([])
    setWeekExpiration(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    setShowGoalSelector(true)

    toast({
      title: "New Week Started",
      description: "Select your 4 goals for this week!",
      duration: 3000,
    })
  }

  // Auto-reset when week expires
  useEffect(() => {
    if (daysRemaining === 0) {
      resetWeeklyGoals()
    }
  }, [daysRemaining])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "content":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "engagement":
        return "bg-green-100 text-green-700 border-green-200"
      case "learning":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "community":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Memoized search dropdown content
  const searchDropdownContent = useMemo(() => {
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
                  {('label' in search) ? search.label : ''}
                </button>
              ))}

            {isShowingResults &&
              displayItems.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleSearchSelect(result)}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{('name' in result && result.name) ? result.name : ('title' in result && result.title) ? result.title : ''}</h5>
                    <p className="text-xs text-gray-600">
                      {('type' in result && result.type === "coach")
                        ? `${'sport' in result ? result.sport : ''} • ${'experience' in result ? result.experience : ''} • ${'rating' in result ? result.rating : ''}/5.0`
                        : ('creator' in result && 'views' in result)
                          ? `${result.creator} • ${result.views} views`
                          : ''}
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

  const MainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      {/* Weekly Goals Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Weekly Goals</h2>
            <Badge className="bg-prologue-electric/10 text-prologue-electric">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-700">{totalPoints} points</Badge>
          </div>

          <Dialog open={showGoalSelector} onOpenChange={setShowGoalSelector}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Edit3 className="h-4 w-4" />
                <span>Edit Goals</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select Your Weekly Goals (Choose 4)</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableGoals.map((goal) => {
                  const IconComponent = goal.icon
                  const isSelected = selectedGoals.some((g) => g.id === goal.id)

                  return (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-prologue-electric bg-prologue-electric/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        const currentIds = selectedGoals.map((g) => g.id)
                        if (isSelected) {
                          handleGoalSelection(currentIds.filter((id) => id !== goal.id))
                        } else if (currentIds.length < 4) {
                          handleGoalSelection([...currentIds, goal.id])
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox checked={isSelected} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <IconComponent className="h-4 w-4" />
                            <h3 className="font-semibold text-sm">{goal.title}</h3>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getCategoryColor(goal.category)}`}>{goal.category}</Badge>
                            <Badge className="text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                              +{goal.points} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600">{selectedGoals.length}/4 goals selected</span>
                <Button
                  onClick={() => setShowGoalSelector(false)}
                  disabled={selectedGoals.length !== 4}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Goals
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Selected Goals Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedGoals.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-8 text-center border-dashed border-2 border-gray-300">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Goals Selected</h3>
                <p className="text-gray-500 mb-4">Choose 4 goals to start your weekly challenge</p>
                <Button
                  onClick={() => setShowGoalSelector(true)}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Goals
                </Button>
              </Card>
            </div>
          ) : (
            selectedGoals.map((goal) => {
              const IconComponent = goal.icon
              const progressPercentage = (goal.current / goal.target) * 100
              const cardBg = (isMobile || isTablet) ? getCategoryColor(goal.category) : ''
              const border = (isMobile || isTablet) ? 'border-white' : 'border'
              return (
                <Card key={goal.id} className={`p-4 ${cardBg} ${border}`}>
                  <div className={`flex items-start justify-between mb-3 ${isMobile || isTablet ? 'gap-2' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`h-5 w-5 ${isMobile || isTablet ? 'text-gray-700' : ''}`} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1">
                        +{goal.points} pts
                      </Badge>
                      {goal.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                  </div>
                  <h3 className={`font-semibold mb-2 ${isMobile || isTablet ? 'text-base' : 'text-sm'}`}>{goal.title}</h3>
                  <p className={`opacity-80 mb-3 ${isMobile || isTablet ? 'text-sm' : 'text-xs'}`}>{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{goal.current}/{goal.target}</span>
                    </div>
                    <Progress value={progressPercentage} className={`h-2 ${isMobile || isTablet ? 'bg-gray-200' : ''}`} />
                  </div>
                  {!goal.completed && goal.current >= goal.target && (
                    <Button
                      size="sm"
                      className={`w-full mt-3 bg-green-600 hover:bg-green-700 ${isMobile || isTablet ? 'text-base py-2' : ''}`}
                      onClick={() => completeGoal(goal.id)}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Complete Goal
                    </Button>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {daysRemaining === 0 && (
          <Card className="mt-4 p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Week Expired</span>
              </div>
              <Button onClick={resetWeeklyGoals} className="bg-red-600 hover:bg-red-700">
                Start New Week
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Training Programs</h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Filter className="h-4 w-4" />
                <span className="capitalize">
                  {selectedFilter === "all" ? "All" : selectedFilter.replace("-", " ")}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Programs</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("in-progress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("technical")}>Technical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("mental")}>Mental</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("fitness")}>Fitness</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className={`overflow-hidden transition-shadow ${isMobile || isTablet ? 'bg-white/80 border border-gray-200' : 'hover:shadow-lg'}`}>
              <div className={`flex ${isMobile || isTablet ? 'flex-col' : ''}`}>
                <div className={`${isMobile || isTablet ? 'w-full h-40' : 'w-48 h-32'} bg-gray-100 overflow-hidden flex-shrink-0`}>
                  <Image
                    src={program.thumbnail || "/placeholder.svg"}
                    alt={program.title}
                    width={isMobile || isTablet ? 320 : 192}
                    height={isMobile || isTablet ? 160 : 128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`flex-1 ${isMobile || isTablet ? 'p-4' : 'p-6'}`}>
                  <div className={`flex items-start justify-between mb-3 ${isMobile || isTablet ? 'gap-2' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant={program.difficulty === "Advanced" ? "default" : "secondary"}
                          className={`text-xs ${isMobile || isTablet ? 'px-2 py-1' : ''}`}
                        >
                          {program.difficulty}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${isMobile || isTablet ? 'px-2 py-1' : ''}`}>
                          {program.category}
                        </Badge>
                      </div>
                      <h3 className={`font-semibold mb-2 ${isMobile || isTablet ? 'text-lg' : 'text-xl'} text-gray-900`}>{program.title}</h3>
                      <p className={`mb-3 ${isMobile || isTablet ? 'text-sm' : 'text-gray-600'}`}>{program.description}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-4 mb-4 ${isMobile || isTablet ? 'flex-wrap gap-2' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <Image
                        src={program.coachAvatar || "/placeholder.svg"}
                        alt={program.coach}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className={`text-sm ${isMobile || isTablet ? 'font-medium' : 'text-gray-600'}`}>{program.coach}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{program.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">{program.students} students</span>
                  </div>
                  <div className={`flex items-center justify-between mb-4 ${isMobile || isTablet ? 'flex-wrap gap-2' : ''}`}>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{program.sessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">
                        {program.completed}/{program.sessions} completed
                      </span>
                    </div>
                    <Progress value={(program.completed / program.sessions) * 100} className={`${isMobile || isTablet ? 'h-2 bg-gray-200' : ''}`} />
                  </div>
                  <div className={`flex space-x-3 ${isMobile || isTablet ? 'gap-2' : ''}`}>
                    <Button className={`bg-prologue-electric hover:bg-prologue-blue ${isMobile || isTablet ? 'text-base py-2' : ''}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Continue Training
                    </Button>
                    <Button variant="outline" className={isMobile || isTablet ? 'text-base py-2' : ''}>View Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )

  if (isMobile || isTablet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MemberHeader
          currentPath="/member-training"
          onLogout={logout}
          showSearch={true}
          unreadNotifications={unreadNotificationsCount}
          unreadMessages={unreadMessagesCount}
          hasNewContent={hasNewTrainingContent}
          profileImageUrl={profileImageUrl}
          profileData={profileData}
        />
        <MobileLayout
          userType="member"
          currentPath="/member-training"
          showBottomNav={true}
          unreadNotifications={unreadNotificationsCount}
          unreadMessages={unreadMessagesCount}
          hasNewContent={hasNewTrainingContent}
        >
          <MainContent />
        </MobileLayout>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader
        currentPath="/member-training"
        onLogout={handleLogout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
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
    </div>
  )
}
