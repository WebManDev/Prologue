"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDown,
  Search,
  Home,
  MessageCircle,
  BookOpen,
  Play,
  Target,
  TrendingUp,
  Filter,
  Star,
  Award,
  Users,
  MessageSquare,
  MoreHorizontal,
  PlayCircle,
  Timer,
  Trophy,
  BarChart3,
  Clock,
  Grid3X3,
  List,
  Compass,
  UserPlus,
  Zap,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth, getMemberProfile } from "@/lib/firebase"

export default function MemberTrainingPage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // Contexts
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent, markTrainingAsVisited } =
    useMemberNotifications()

  // State management
  const [activeTab, setActiveTab] = useState<"overview" | "programs">("overview")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "in-progress" | "completed" | "new">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Mark training as visited on mount
  useEffect(() => {
    if (hasNewTrainingContent) {
      markTrainingAsVisited()
    }
  }, [hasNewTrainingContent, markTrainingAsVisited])

  // State for goals management
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [completedGoals, setCompletedGoals] = useState<string[]>([])
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [goalsSelectedAt, setGoalsSelectedAt] = useState<Date | null>(null)

  // Mock data
  const trainingStats = {
    activePrograms: 2,
    completedPrograms: 1,
    totalHours: 47,
    totalPoints: 1250,
    weeklyGoal: 12,
    weeklyProgress: 8.5,
    streak: 5,
    totalWorkouts: 156,
  }

  const availableGoals = [
    {
      id: "complete-3-programs",
      title: "Complete 3 Training Programs",
      description: "Finish 3 different training programs to master diverse skills",
      points: 300,
      difficulty: "Medium",
      category: "Programs",
      progress: 0,
      target: 3,
    },
    {
      id: "train-20-hours",
      title: "Train 20 Hours",
      description: "Accumulate 20 hours of training time this month",
      points: 200,
      difficulty: "Medium",
      category: "Time",
      progress: 0,
      target: 20,
    },
    {
      id: "weekly-streak-7",
      title: "7-Day Training Streak",
      description: "Train for 7 consecutive days",
      points: 150,
      difficulty: "Easy",
      category: "Consistency",
      progress: 0,
      target: 7,
    },
    {
      id: "complete-basketball-program",
      title: "Complete Basketball Program",
      description: "Finish the Elite Basketball Fundamentals program",
      points: 250,
      difficulty: "Medium",
      category: "Skills",
      progress: 0,
      target: 100,
    },
    {
      id: "subscribe-to-3-creators",
      title: "Subscribe to 3 Creators",
      description: "Connect with 3 different coaches or athletes",
      points: 100,
      difficulty: "Easy",
      category: "Social",
      progress: 0,
      target: 3,
    },
    {
      id: "complete-mental-training",
      title: "Complete Mental Performance Program",
      description: "Finish the Mental Performance Mastery program",
      points: 300,
      difficulty: "Hard",
      category: "Mental",
      progress: 0,
      target: 100,
    },
    {
      id: "watch-10-videos",
      title: "Watch 10 Training Videos",
      description: "Watch 10 training videos from subscribed creators",
      points: 80,
      difficulty: "Easy",
      category: "Learning",
      progress: 0,
      target: 10,
    },
    {
      id: "monthly-training-goal",
      title: "Monthly Training Goal",
      description: "Complete 15 training sessions this month",
      points: 180,
      difficulty: "Medium",
      category: "Consistency",
      progress: 0,
      target: 15,
    },
  ]

  const trainingPrograms = useMemo(
    () => [
      {
        id: 1,
        title: "Elite Basketball Fundamentals",
        instructor: "Coach Mike Johnson",
        instructorAvatar: "/placeholder.svg?height=40&width=40",
        duration: "8 weeks",
        progress: 75,
        status: "in-progress",
        difficulty: "Intermediate",
        rating: 4.8,
        students: 234,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: false,
        completedLessons: 12,
        totalLessons: 16,
        description: "Master the fundamentals of basketball with professional coaching techniques and drills.",
        tags: ["Basketball", "Fundamentals", "Skills"],
        likes: 89,
        comments: 23,
        shares: 12,
        lastActivity: "2 hours ago",
        category: "Sports Skills",
        isSubscribed: true,
        recentVideos: [
          {
            id: 1,
            title: "Advanced Shooting Form Analysis",
            duration: "12:34",
            thumbnail: "/placeholder.svg?height=90&width=160",
            uploadedAt: "2 days ago",
            views: 1234,
          },
          {
            id: 2,
            title: "Defensive Positioning Masterclass",
            duration: "18:45",
            thumbnail: "/placeholder.svg?height=90&width=160",
            uploadedAt: "5 days ago",
            views: 892,
          },
        ],
      },
      {
        id: 2,
        title: "Mental Performance Mastery",
        instructor: "Dr. Sarah Chen",
        instructorAvatar: "/placeholder.svg?height=40&width=40",
        duration: "6 weeks",
        progress: 45,
        status: "in-progress",
        difficulty: "Advanced",
        rating: 4.9,
        students: 156,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: true,
        completedLessons: 7,
        totalLessons: 12,
        description: "Develop mental toughness and peak performance mindset for competitive athletics.",
        tags: ["Mental Health", "Psychology", "Performance"],
        likes: 124,
        comments: 31,
        shares: 18,
        lastActivity: "5 hours ago",
        category: "Mental Training",
        isSubscribed: true,
        recentVideos: [
          {
            id: 3,
            title: "Visualization Techniques for Athletes",
            duration: "15:22",
            thumbnail: "/placeholder.svg?height=90&width=160",
            uploadedAt: "1 day ago",
            views: 567,
          },
          {
            id: 4,
            title: "Overcoming Performance Anxiety",
            duration: "22:18",
            thumbnail: "/placeholder.svg?height=90&width=160",
            uploadedAt: "4 days ago",
            views: 1089,
          },
        ],
      },
      {
        id: 3,
        title: "Strength & Conditioning",
        instructor: "Alex Rodriguez",
        instructorAvatar: "/placeholder.svg?height=40&width=40",
        duration: "12 weeks",
        progress: 100,
        status: "completed",
        difficulty: "Beginner",
        rating: 4.7,
        students: 445,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: false,
        completedLessons: 24,
        totalLessons: 24,
        description: "Build strength, power, and endurance with scientifically-backed training methods.",
        tags: ["Strength", "Conditioning", "Fitness"],
        likes: 203,
        comments: 45,
        shares: 28,
        lastActivity: "1 week ago",
        category: "Fitness",
        isSubscribed: false,
        recentVideos: [],
      },
      {
        id: 4,
        title: "Nutrition for Athletes",
        instructor: "Lisa Martinez",
        instructorAvatar: "/placeholder.svg?height=40&width=40",
        duration: "4 weeks",
        progress: 0,
        status: "new",
        difficulty: "Beginner",
        rating: 4.6,
        students: 89,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: true,
        completedLessons: 0,
        totalLessons: 8,
        description: "Learn optimal nutrition strategies to fuel your athletic performance and recovery.",
        tags: ["Nutrition", "Health", "Recovery"],
        likes: 67,
        comments: 15,
        shares: 9,
        lastActivity: "New",
        category: "Nutrition",
        isSubscribed: false,
        recentVideos: [],
      },
    ],
    [],
  )

  const calculateTotalPoints = useCallback(() => {
    return completedGoals.reduce((total, goalId) => {
      const goal = availableGoals.find((g) => g.id === goalId)
      return total + (goal?.points || 0)
    }, 0)
  }, [completedGoals])

  const toggleGoalSelection = useCallback((goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId)
      } else if (prev.length < 3) {
        return [...prev, goalId]
      }
      return prev
    })
  }, [])

  const markGoalCompleted = useCallback((goalId: string) => {
    setCompletedGoals((prev) => [...prev, goalId])
  }, [])

  const handleCloseGoalsModal = useCallback(() => {
    setShowGoalsModal(false)
  }, [])

  const handleConfirmGoals = useCallback(() => {
    setGoalsSelectedAt(new Date())
    setShowGoalsModal(false)
  }, [])

  const areGoalsExpired = useCallback(() => {
    if (!goalsSelectedAt) return false
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return goalsSelectedAt < oneWeekAgo
  }, [goalsSelectedAt])

  useEffect(() => {
    if (areGoalsExpired()) {
      setSelectedGoals([])
      setGoalsSelectedAt(null)
    }
  }, [areGoalsExpired])

  // Filter programs
  const filteredPrograms = useMemo(() => {
    let filtered = trainingPrograms

    if (selectedFilter !== "all") {
      filtered = filtered.filter((program) => program.status === selectedFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.instructor.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [trainingPrograms, selectedFilter, searchQuery])

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
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

  // Goals Selection Modal
  const GoalsModal = () => {
    useEffect(() => {
      if (showGoalsModal) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = "unset"
      }

      return () => {
        document.body.style.overflow = "unset"
      }
    }, [showGoalsModal])

    if (!showGoalsModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleCloseGoalsModal} />
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Select Your Goals</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseGoalsModal}
                className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Choose up to 3 goals to track your progress and earn points.</p>
          </div>
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="grid gap-4">
              {availableGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id)
                const isCompleted = completedGoals.includes(goal.id)
                const canSelect = selectedGoals.length < 3 || isSelected
                const progressPercentage = 0 // Start at 0 initially

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isSelected
                        ? "border-prologue-electric bg-prologue-electric/5"
                        : canSelect
                          ? "border-gray-200 hover:border-gray-300 cursor-pointer"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                    } ${isCompleted ? "opacity-75" : ""}`}
                    onClick={() => !isCompleted && canSelect && toggleGoalSelection(goal.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{goal.title}</h3>
                          {isCompleted && <Award className="h-4 w-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center space-x-3 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {goal.difficulty}
                          </Badge>
                          <span className="text-purple-600 font-medium">+{goal.points} points</span>
                          <span className="text-gray-500">{goal.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && !isCompleted && (
                          <div className="w-5 h-5 bg-prologue-electric rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Progress: 0/{goal.target}</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-1.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{selectedGoals.length}/3 goals selected</p>
              <Button
                onClick={handleConfirmGoals}
                disabled={selectedGoals.length === 0}
                className="bg-prologue-electric hover:bg-prologue-blue text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Goals
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [profileData, setProfileData] = useState({ firstName: "", lastName: "", profileImageUrl: null })
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return
      const memberProfile = await getMemberProfile(auth.currentUser.uid)
      if (memberProfile) {
        setProfileData({
          firstName: memberProfile.firstName || "",
          lastName: memberProfile.lastName || "",
          profileImageUrl: memberProfile.profileImageUrl || null,
        })
        setProfileImageUrl(memberProfile.profileImageUrl || null)
      }
    }
    loadProfile()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <GoalsModal />
      {/* Header */}
      <MemberHeader
        currentPath="/member-training"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        onLogout={() => {}}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Training Hub Navigation */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="programs" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Programs</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-3">
                {activeTab === "programs" && (
                  <>
                    <div className="flex items-center space-x-1 bg-white rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2 bg-white">
                          <Filter className="h-4 w-4" />
                          <span className="capitalize">
                            {selectedFilter === "all" ? "All" : selectedFilter.replace("-", " ")}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Programs</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter("new")}>New</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter("in-progress")}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>Completed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                <Link href="/member-discover">
                  <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                    <Compass className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Discover More</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Training Stats - Matching the provided image */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">Active</p>
                        <p className="text-3xl font-bold">{trainingStats.activePrograms}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">Completed</p>
                        <p className="text-3xl font-bold">{trainingStats.completedPrograms}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">Hours</p>
                        <p className="text-3xl font-bold">{trainingStats.totalHours}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Timer className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">Points</p>
                        <p className="text-3xl font-bold">{trainingStats.totalPoints}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Zap className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Progress */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Weekly Progress</h3>
                        <Badge variant="outline" className="text-prologue-electric border-prologue-electric">
                          {trainingStats.streak} day streak
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Training Hours</span>
                          <span className="text-sm text-gray-600">
                            {trainingStats.weeklyProgress}/{trainingStats.weeklyGoal} hours
                          </span>
                        </div>
                        <Progress
                          value={(trainingStats.weeklyProgress / trainingStats.weeklyGoal) * 100}
                          className="h-3"
                        />
                        <p className="text-sm text-gray-600">
                          {trainingStats.weeklyGoal - trainingStats.weeklyProgress} hours remaining to reach your weekly
                          goal
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-prologue-electric hover:bg-prologue-electric/10"
                        >
                          View All
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            type: "lesson",
                            title: "Completed: Advanced Shooting Techniques",
                            program: "Elite Basketball Fundamentals",
                            time: "2 hours ago",
                            icon: Target,
                            color: "text-green-600",
                            bgColor: "bg-green-100",
                          },
                          {
                            type: "achievement",
                            title: "Earned: Mental Toughness Badge",
                            program: "Mental Performance Mastery",
                            time: "1 day ago",
                            icon: Award,
                            color: "text-yellow-600",
                            bgColor: "bg-yellow-100",
                          },
                          {
                            type: "milestone",
                            title: "Reached 75% completion",
                            program: "Elite Basketball Fundamentals",
                            time: "3 days ago",
                            icon: TrendingUp,
                            color: "text-prologue-electric",
                            bgColor: "bg-prologue-electric/10",
                          },
                        ].map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div
                              className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                            >
                              <activity.icon className={`h-5 w-5 ${activity.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-600">{activity.program}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">My Goals</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-purple-600">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">{calculateTotalPoints()} pts</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowGoalsModal(true)}
                            className="text-prologue-electric hover:bg-prologue-electric/10"
                          >
                            <Target className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {selectedGoals.slice(0, 3).map((goalId) => {
                          const goal = availableGoals.find((g) => g.id === goalId)
                          if (!goal) return null
                          const isCompleted = completedGoals.includes(goalId)
                          const progressPercentage = 0 // Start at 0

                          return (
                            <div
                              key={goal.id}
                              className={`p-3 rounded-lg border ${
                                isCompleted
                                  ? "bg-green-50 border-green-200"
                                  : "bg-prologue-electric/5 border-prologue-electric/20"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm">{goal.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-purple-600 font-medium">+{goal.points}pts</span>
                                  {isCompleted && <Award className="h-4 w-4 text-green-600" />}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">0/{goal.target}</span>
                                <span className="text-xs text-gray-600">0%</span>
                              </div>
                              <Progress value={0} className="h-2" />
                            </div>
                          )
                        })}
                        {selectedGoals.length > 0 && goalsSelectedAt && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600">
                              Goals expire:{" "}
                              {new Date(goalsSelectedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {selectedGoals.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-600 mb-2">No goals selected</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowGoalsModal(true)}
                              className="text-prologue-electric border-prologue-electric hover:bg-prologue-electric/10"
                            >
                              Choose Goals
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discover More Programs */}
                  <Card className="bg-gradient-to-br from-prologue-electric to-prologue-blue border-0 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Discover More</h3>
                        <Compass className="h-5 w-5 text-white/80" />
                      </div>
                      <p className="text-sm text-white/80 mb-4">
                        Find new training programs and connect with other athletes to enhance your performance.
                      </p>
                      <Link href="/member-browse">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full bg-white text-prologue-electric hover:bg-gray-100"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Explore Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Training Stats */}
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">This Week</h3>
                        <BarChart3 className="h-5 w-5 text-prologue-electric" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Training Hours</span>
                          <span className="font-medium text-gray-900">12.5h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lessons Completed</span>
                          <span className="font-medium text-gray-900">8</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Streak</span>
                          <span className="font-medium text-gray-900">5 days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg. Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-900">4.8</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Programs Tab */}
            <TabsContent value="programs" className="space-y-6">
              {/* Discover More Section */}
              <Card className="bg-gradient-to-r from-prologue-electric/10 to-prologue-blue/10 border border-prologue-electric/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Looking for more training programs?</h3>
                      <p className="text-gray-600 mb-4">
                        Discover new programs from top coaches and connect with other athletes in your sport.
                      </p>
                      <div className="flex items-center space-x-3">
                        <Link href="/member-discover">
                          <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Find Programs
                          </Button>
                        </Link>
                        <Link href="/member-discover">
                          <Button
                            variant="outline"
                            className="border-prologue-electric text-prologue-electric hover:bg-prologue-electric/10 bg-transparent"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Connect with Athletes
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-24 h-24 bg-prologue-electric/20 rounded-full flex items-center justify-center">
                        <Compass className="h-12 w-12 text-prologue-electric" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPrograms.map((program) => (
                    <Card
                      key={program.id}
                      className={`bg-white border transition-all duration-300 ${
                        program.isSubscribed
                          ? "border-prologue-electric shadow-lg ring-2 ring-prologue-electric/20"
                          : "border-gray-200 hover:shadow-lg"
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                              <Play className="h-12 w-12 text-gray-600" />
                            </div>
                          </div>
                          {program.isNew && (
                            <Badge className="absolute top-3 left-3 bg-prologue-electric text-white">New</Badge>
                          )}
                          {program.isSubscribed && (
                            <Badge className="absolute top-3 right-3 bg-green-600 text-white">Subscribed</Badge>
                          )}
                          <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{program.duration}</span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3
                                className={`font-semibold mb-1 ${program.isSubscribed ? "text-prologue-electric" : "text-gray-900"}`}
                              >
                                {program.title}
                              </h3>
                              <p className="text-sm text-gray-600">{program.instructor}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {program.difficulty}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{program.description}</p>

                          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{program.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{program.students}</span>
                            </div>
                          </div>

                          {program.status !== "new" && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-600">
                                  {program.completedLessons}/{program.totalLessons} lessons
                                </span>
                              </div>
                              <Progress value={program.progress} className="h-2" />
                            </div>
                          )}

                          {/* Recent Videos for Subscribed Creators */}
                          {program.isSubscribed && program.recentVideos.length > 0 && (
                            <div className="mb-4 p-3 bg-prologue-electric/5 rounded-lg border border-prologue-electric/20">
                              <h4 className="text-sm font-medium text-prologue-electric mb-2">
                                Latest from {program.instructor}
                              </h4>
                              <div className="space-y-2">
                                {program.recentVideos.slice(0, 2).map((video) => (
                                  <div key={video.id} className="flex items-center space-x-3">
                                    <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                        <Play className="h-3 w-3 text-gray-600" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">{video.title}</p>
                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <span>{video.duration}</span>
                                        <span>•</span>
                                        <span>{video.uploadedAt}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex-1 mr-2 bg-transparent ${
                                program.isSubscribed
                                  ? "border-prologue-electric text-prologue-electric hover:bg-prologue-electric hover:text-white"
                                  : "hover:bg-prologue-electric hover:text-white"
                              }`}
                            >
                              {program.status === "completed"
                                ? "Review"
                                : program.status === "new"
                                  ? "Start"
                                  : "Continue"}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-prologue-electric">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrograms.map((program) => (
                    <Card
                      key={program.id}
                      className="bg-white border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                              <Play className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{program.title}</h3>
                                <p className="text-sm text-gray-600">{program.instructor}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {program.difficulty}
                                </Badge>
                                {program.isNew && (
                                  <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-1">{program.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span>{program.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{program.students}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {program.status !== "new" && (
                                  <div className="text-sm text-gray-600">{program.progress}% complete</div>
                                )}
                                <Button size="sm" className="bg-prologue-electric hover:bg-prologue-blue text-white">
                                  {program.status === "completed"
                                    ? "Review"
                                    : program.status === "new"
                                      ? "Start"
                                      : "Continue"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredPrograms.length === 0 && (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No training programs found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start your training journey by discovering available programs or adjust your filters.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/member-discover">
                        <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                          Discover Programs
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => setSelectedFilter("all")}>
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
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
            className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-medium">Training</span>
          </Link>
          <Link
            href="/member-discover"
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
    </div>
  )
}
