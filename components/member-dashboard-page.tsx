"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  Bell,
  Home,
  BookOpen,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Edit3,
  Plus,
  Trash2,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Star,
  Award,
  MapPin,
  School,
  Search,
  Camera,
  Upload,
  Clock,
  Activity,
  CheckCircle,
  Circle,
  ChevronRight,
  X,
  Save,
  Loader2,
  Compass,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth, saveMemberProfile, getMemberProfile, uploadProfilePicture, uploadCoverPhoto } from "@/lib/firebase"

export default function MemberDashboardPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfileChecklist, setShowProfileChecklist] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  // Quick search suggestions
  const quickSearches = useMemo(
    () => [
      "Navigate Recruitment",
      "Nutrition",
      "NIL",
      "Training Programs",
      "Mental Performance",
      "Injury Prevention",
      "Sports Psychology",
      "Athletic Scholarships",
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

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 987-6543",
    bio: "Dedicated high school tennis player with aspirations to compete at the collegiate level. Currently ranked #15 in state and actively seeking coaching to improve my mental game and technical skills. Passionate about continuous improvement and committed to excellence both on and off the court.",
    location: "Miami, FL",
    school: "Miami Prep Academy",
    graduationYear: "2025",
    sport: "Tennis",
    position: "Singles Player",
    gpa: "3.8",
    goals: [
      "Improve state ranking to top 10",
      "Secure Division I tennis scholarship",
      "Develop stronger mental game",
      "Enhance serve consistency",
      "Improve fitness and conditioning",
      "Build college recruitment profile",
    ],
    achievements: [
      "State Championship Semifinalist 2023",
      "Regional Tournament Winner 2023",
      "Team Captain - Varsity Tennis",
      "Academic Honor Roll",
      "Community Service Award",
      "Junior Tournament Circuit Top 20",
    ],
    interests: [
      "Tennis Strategy & Tactics",
      "Sports Psychology",
      "Nutrition & Fitness",
      "College Recruitment",
      "Mental Performance",
      "Injury Prevention",
    ],
    coverImageUrl: null as string | null,
  })

  // Profile completion checklist
  const profileChecklist = [
    {
      id: "basic-info",
      title: "Complete Basic Information",
      description: "Add your contact details and personal information",
      completed: !!(profileData.firstName && profileData.lastName && profileData.email && profileData.phone),
      action: () => document.getElementById("profile-tab")?.click(),
    },
    {
      id: "bio",
      title: "Write Your Bio",
      description: "Tell coaches about your athletic journey and goals",
      completed: profileData.bio.length > 50,
      action: () => document.getElementById("overview-tab")?.click(),
    },
    {
      id: "goals",
      title: "Set Your Goals",
      description: "Define what you want to achieve in your sport",
      completed: profileData.goals.length >= 3,
      action: () => document.getElementById("goals-tab")?.click(),
    },
    {
      id: "achievements",
      title: "Add Achievements",
      description: "Showcase your athletic accomplishments",
      completed: profileData.achievements.length >= 3,
      action: () => document.getElementById("achievements-tab")?.click(),
    },
    {
      id: "profile-photo",
      title: "Upload Profile Photo",
      description: "Add a professional photo to build trust with coaches",
      completed: false, // This would be based on actual photo upload
      action: () => toast({ title: "Photo Upload", description: "Click the camera icon to upload your photo" }),
    },
  ]

  const completedItems = profileChecklist.filter((item) => item.completed).length
  const totalItems = profileChecklist.length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  // Member stats
  const memberStats = {
    activeCoaches: 2,
    totalSessions: 18,
    thisWeek: 3,
    thisMonth: 12,
    avgRating: 4.8,
    hoursTraining: 45,
    goalsCompleted: 8,
    improvement: 15,
  }

  // Recent activity
  const recentActivity = [
    { type: "session", title: "Training session with Jordan Smith", time: "2 hours ago", coach: "Jordan S." },
    { type: "achievement", title: "Completed serve consistency goal", time: "1 day ago" },
    { type: "feedback", title: "Received feedback from Alex Rodriguez", time: "2 days ago", coach: "Alex R." },
    { type: "session", title: "Mental performance session", time: "3 days ago", coach: "Jordan S." },
    { type: "milestone", title: "Reached 40 hours of training", time: "4 days ago" },
    { type: "goal", title: "Set new fitness improvement goal", time: "5 days ago" },
  ]

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
    console.log("Member dashboard searching for:", search)
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

  // Scroll to top on component mount (for post-login/signup)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  const handleLogout = useCallback(async () => {
    console.log("🔄 Member logout initiated from dashboard")

    try {
      const success = await logout({
        customMessage: "Securing your member account and logging out...",
        onComplete: () => {
          console.log("✅ Member logout completed successfully from dashboard")
          toast({
            title: "Logged Out Successfully",
            description: "You have been securely logged out. Redirecting to login page...",
            duration: 2000,
          })
        },
        onError: (error) => {
          console.error("❌ Member logout failed from dashboard:", error)
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

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return
    setIsLoading(true)
    try {
      const profileDataForFirebase = {
        name: profileData.firstName + ' ' + profileData.lastName,
        email: profileData.email,
        sport: profileData.sport,
        role: (profileData as any).role || 'member',
        // Additional profile fields
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        school: profileData.school,
        graduationYear: profileData.graduationYear,
        position: profileData.position,
        gpa: profileData.gpa,
        goals: profileData.goals,
        achievements: profileData.achievements,
        interests: profileData.interests,
        profileImageUrl: profileImageUrl,
        onboardingCompleted: true,
      }
      await saveMemberProfile(auth.currentUser.uid, profileDataForFirebase)
      setIsEditing(false)
      toast({ title: "Profile updated!" })
    } catch (error) {
      toast({ title: "Save failed", description: String(error), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const addGoal = () => {
    setProfileData({
      ...profileData,
      goals: [...profileData.goals, "New goal"],
    })
  }

  const removeGoal = (index: number) => {
    setProfileData({
      ...profileData,
      goals: profileData.goals.filter((_, i) => i !== index),
    })
  }

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...profileData.goals]
    newGoals[index] = value
    setProfileData({
      ...profileData,
      goals: newGoals,
    })
  }

  const addAchievement = () => {
    setProfileData({
      ...profileData,
      achievements: [...profileData.achievements, "New achievement"],
    })
  }

  const removeAchievement = (index: number) => {
    setProfileData({
      ...profileData,
      achievements: profileData.achievements.filter((_, i) => i !== index),
    })
  }

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...profileData.achievements]
    newAchievements[index] = value
    setProfileData({
      ...profileData,
      achievements: newAchievements,
    })
  }

  const addInterest = () => {
    setProfileData({
      ...profileData,
      interests: [...profileData.interests, "New interest"],
    })
  }

  const removeInterest = (index: number) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((_, i) => i !== index),
    })
  }

  const updateInterest = (index: number, value: string) => {
    const newInterests = [...profileData.interests]
    newInterests[index] = value
    setProfileData({
      ...profileData,
      interests: newInterests,
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "session":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "feedback":
        return <Star className="h-4 w-4 text-green-500" />
      case "milestone":
        return <Award className="h-4 w-4 text-orange-500" />
      case "goal":
        return <Target className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  // Memoized search dropdown content
  const searchDropdownContent = useMemo(() => {
    const displayItems = searchQuery ? searchResults : quickSearches.slice(0, 8)
    const isShowingResults = searchQuery && searchResults.length > 0
    const isShowingQuickSearches = !searchQuery

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {isShowingResults ? `Results for "${searchQuery}"` : "Quick Searches"}
          </h4>
          <div className="space-y-1">
            {isShowingQuickSearches &&
              displayItems.map((search, index) =>
                typeof search === "string" ? (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                    onClick={() => handleSearchSelect(search)}
                  >
                    {search}
                  </button>
                ) : null
              )}

            {isShowingResults &&
              displayItems.map((result, index) =>
                typeof result === "object" && result !== null ? (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleSearchSelect(result.name ?? result.title ?? "")}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{result.name ?? result.title}</h5>
                      <p className="text-xs text-gray-600">
                        {result.type === "coach"
                          ? `${result.sport} • ${result.experience} • ${result.rating}/5.0`
                          : `${result.creator} • ${result.views} views`}
                      </p>
                    </div>
                  </div>
                ) : null
              )}

            {searchQuery && searchResults.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No results found for "{searchQuery}"</div>
            )}
          </div>
        </div>
      </div>
    )
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect])

  const DesktopHeader = () => (
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
              <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-prologue-electric transition-colors tracking-wider">
                PROLOGUE
              </span>
            </Link>

            <div className="flex items-center space-x-1 relative" ref={searchRef}>
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

              {/* Search Dropdown */}
              {showSearchDropdown && searchDropdownContent}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Navigation Items */}
            <nav className="flex items-center space-x-6">
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
                href="/member-browse"
                className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
              >
                <Compass className="h-5 w-5" />
                <span className="text-xs font-medium">Browse</span>
                <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/member-feedback"
                className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs font-medium">Feedback</span>
                <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
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

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={loadingState.isLoading}>
                  <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                    <User className="w-full h-full text-gray-500 p-1" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
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
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={loadingState.isLoading}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {loadingState.isLoading ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )

  const MainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 lg:mb-8 overflow-hidden">
        <div className="h-24 lg:h-32 bg-gradient-to-r from-prologue-electric to-prologue-blue relative">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt="Cover" fill className="object-cover w-full h-full" />
          ) : (
            <div className="absolute inset-0 bg-black/10"></div>
          )}
          {isEditing && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 text-xs lg:text-sm"
                onClick={() => coverFileInputRef.current?.click()}
              >
                <Camera className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Change Cover</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={coverFileInputRef}
                className="hidden"
                onChange={handleCoverImageChange}
              />
            </>
          )}
        </div>

        <div className="px-4 lg:px-8 pb-4 lg:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between -mt-12 lg:-mt-16">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              <div className="relative self-center lg:self-auto">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-prologue-electric to-prologue-blue rounded-full border-4 border-white overflow-hidden">
                  {selectedProfileImage ? (
                    <Image src={URL.createObjectURL(selectedProfileImage)} alt="Profile Preview" width={96} height={96} className="w-full h-full object-cover" />
                  ) : profileImageUrl ? (
                    <Image src={profileImageUrl} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full text-white p-4 lg:p-6" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 rounded-full p-0 bg-prologue-electric hover:bg-prologue-blue"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </>
                )}
              </div>

              <div className="pt-4 lg:pt-16 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <Badge className="bg-prologue-electric/10 text-prologue-electric text-xs lg:text-sm w-fit mx-auto lg:mx-0">
                    Student Athlete
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2 text-sm lg:text-base">
                  {profileData.sport} Player • Class of {profileData.graduationYear}
                </p>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 text-xs lg:text-sm text-gray-600 mb-4 space-y-1 lg:space-y-0">
                  <div className="flex items-center justify-center lg:justify-start space-x-1">
                    <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-1">
                    <School className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>{profileData.school}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />
                    <span>{profileData.gpa} GPA</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    {memberStats.activeCoaches} Active Coaches
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    {memberStats.hoursTraining} Hours Training
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                    {memberStats.goalsCompleted} Goals Completed
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 lg:pt-16 flex flex-col items-center lg:items-end space-y-3">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full lg:w-auto">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  {completionPercentage < 100 && (
                    <div
                      className="flex flex-col items-center lg:items-end space-y-2 p-3 bg-prologue-electric/10 rounded-lg border border-prologue-electric/20 cursor-pointer hover:bg-prologue-electric/20 transition-colors w-full lg:w-auto"
                      onClick={() => setShowProfileChecklist(!showProfileChecklist)}
                    >
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-prologue-electric" />
                        <span className="text-sm font-medium text-prologue-electric">Profile Completion</span>
                        {showProfileChecklist ? (
                          <ChevronDown className="h-4 w-4 text-prologue-electric" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-prologue-electric" />
                        )}
                      </div>
                      <div className="w-full lg:w-48">
                        <Progress value={completionPercentage} className="h-2" />
                        <p className="text-xs text-prologue-electric mt-1 text-center lg:text-right">
                          {completedItems}/{totalItems} completed ({completionPercentage}%)
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex space-x-2 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="flex-1 lg:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={isLoading} className="flex-1 lg:flex-none">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Completion Checklist */}
          {showProfileChecklist && completionPercentage < 100 && (
            <div className="mt-6 p-4 bg-prologue-electric/10 rounded-lg border border-prologue-electric/20">
              <h3 className="text-sm font-semibold text-prologue-electric mb-3">Complete Your Profile</h3>
              <div className="space-y-2">
                {profileChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                    onClick={item.action}
                  >
                    <div className="flex items-center space-x-3">
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Active Coaches</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.activeCoaches}</p>
            </div>
            <User className="h-6 w-6 lg:h-8 lg:w-8 text-prologue-electric" />
          </div>
        </Card>

        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">This Week</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.thisWeek}</p>
            </div>
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.totalSessions}</p>
            </div>
            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Improvement</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">+{memberStats.improvement}%</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 lg:mb-6">
              <TabsTrigger value="overview" id="overview-tab" className="text-xs lg:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" id="profile-tab" className="text-xs lg:text-sm">
                Profile
              </TabsTrigger>
              <TabsTrigger value="goals" id="goals-tab" className="text-xs lg:text-sm">
                Goals
              </TabsTrigger>
              <TabsTrigger value="achievements" id="achievements-tab" className="text-xs lg:text-sm">
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>About Me</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell coaches about your athletic journey and goals..."
                      className="min-h-[120px] resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{profileData.bio}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Training Interests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.interests.map((interest, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        {isEditing ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <Input
                              value={interest}
                              onChange={(e) => updateInterest(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={() => removeInterest(index)} className="p-2">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Star className="h-4 w-4 text-prologue-electric mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 text-sm lg:text-base">{interest}</p>
                          </>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addInterest} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Interest
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        value={profileData.school}
                        onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sport">Primary Sport</Label>
                      <Select
                        value={profileData.sport}
                        onValueChange={(value) => setProfileData({ ...profileData, sport: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tennis">Tennis</SelectItem>
                          <SelectItem value="Basketball">Basketball</SelectItem>
                          <SelectItem value="Soccer">Soccer</SelectItem>
                          <SelectItem value="Swimming">Swimming</SelectItem>
                          <SelectItem value="Track & Field">Track & Field</SelectItem>
                          <SelectItem value="Golf">Golf</SelectItem>
                          <SelectItem value="Baseball">Baseball</SelectItem>
                          <SelectItem value="Volleyball">Volleyball</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={profileData.position}
                        onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={profileData.graduationYear}
                        onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      value={profileData.gpa}
                      onChange={(e) => setProfileData({ ...profileData, gpa: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell coaches about your athletic journey and goals..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Athletic Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {isEditing ? (
                          <>
                            <Input
                              value={goal}
                              onChange={(e) => updateGoal(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={() => removeGoal(index)} className="p-2">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Target className="h-4 w-4 text-prologue-electric flex-shrink-0" />
                            <span className="text-gray-700 text-sm lg:text-base">{goal}</span>
                          </>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addGoal} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Athletic Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {isEditing ? (
                          <>
                            <Input
                              value={achievement}
                              onChange={(e) => updateAchievement(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAchievement(index)}
                              className="p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm lg:text-base">{achievement}</span>
                          </>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addAchievement} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Training Hours</span>
                <span className="text-sm font-medium text-gray-900">{memberStats.hoursTraining}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Goals Completed</span>
                <span className="text-sm font-medium text-gray-900">{memberStats.goalsCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Improvement Rate</span>
                <span className="text-sm font-medium text-green-600">+{memberStats.improvement}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="text-sm font-medium text-gray-900">{memberStats.avgRating}/5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )

  // Load profile data from Firebase on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!auth.currentUser) {
        setIsLoadingProfile(false)
        return
      }

      try {
        const memberProfile = await getMemberProfile(auth.currentUser.uid)
        if (memberProfile) {
          setProfileData({
            firstName: memberProfile.firstName || "Alex",
            lastName: memberProfile.lastName || "Johnson",
            email: memberProfile.email || "alex.johnson@example.com",
            phone: memberProfile.phone || "+1 (555) 987-6543",
            bio: memberProfile.bio || "Dedicated high school tennis player with aspirations to compete at the collegiate level. Currently ranked #15 in state and actively seeking coaching to improve my mental game and technical skills. Passionate about continuous improvement and committed to excellence both on and off the court.",
            location: memberProfile.location || "Miami, FL",
            school: memberProfile.school || "Miami Prep Academy",
            graduationYear: memberProfile.graduationYear || "2025",
            sport: memberProfile.sport || "Tennis",
            position: memberProfile.position || "Singles Player",
            gpa: memberProfile.gpa || "3.8",
            goals: memberProfile.goals || [
              "Improve state ranking to top 10",
              "Secure Division I tennis scholarship",
              "Develop stronger mental game",
              "Enhance serve consistency",
              "Improve fitness and conditioning",
              "Build college recruitment profile",
            ],
            achievements: memberProfile.achievements || [
              "State Championship Semifinalist 2023",
              "Regional Tournament Winner 2023",
              "Team Captain - Varsity Tennis",
              "Academic Honor Roll",
              "Community Service Award",
              "Junior Tournament Circuit Top 20",
            ],
            interests: memberProfile.interests || [
              "Tennis Strategy & Tactics",
              "Sports Psychology",
              "Nutrition & Fitness",
              "College Recruitment",
              "Mental Performance",
              "Injury Prevention",
            ],
            coverImageUrl: memberProfile.coverImageUrl || null,
          })
          if (memberProfile.profileImageUrl) {
            setProfileImageUrl(memberProfile.profileImageUrl)
          }
          if (memberProfile.coverImageUrl) {
            setCoverImageUrl(memberProfile.coverImageUrl)
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please refresh the page.",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfileData()
  }, [])

  // Handler for file input change (show preview, upload, update Firestore)
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return
    setSelectedProfileImage(file)
    setIsLoading(true)
    try {
      console.log("Previewing image...");
      const previewUrl = URL.createObjectURL(file)
      setProfileImageUrl(previewUrl)

      console.log("Uploading to Firebase Storage...");
      const url = await uploadProfilePicture(auth.currentUser.uid, file)
      console.log("Upload complete, URL:", url);

      setProfileImageUrl(url)
      setProfileData(prev => ({
        ...prev,
        profileImageUrl: url,
      }))

      // Use the latest profileData with the new image URL
      const updatedProfileData = {
        ...profileData,
        profileImageUrl: url,
        name: profileData.firstName + ' ' + profileData.lastName,
        role: (profileData as any).role || 'member',
        onboardingCompleted: true,
      }
      console.log("Saving to Firestore...", updatedProfileData);
      await saveMemberProfile(auth.currentUser.uid, updatedProfileData)
      console.log("Save to Firestore complete.");

      toast({ title: "Profile picture updated!" })
    } catch (error) {
      console.error("Profile image upload error:", error)
      toast({ title: "Upload failed", description: String(error), variant: "destructive" })
    } finally {
      setIsLoading(false)
      console.log("setIsLoading(false) called");
    }
  }

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    setSelectedCoverImage(file);
    setIsLoading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setCoverImageUrl(previewUrl);
      // Upload to Firebase Storage
      const url = await uploadCoverPhoto(auth.currentUser.uid, file);
      setCoverImageUrl(url);
      setProfileData(prev => ({
        ...prev,
        coverImageUrl: url,
      }));
      await saveMemberProfile(auth.currentUser.uid, {
        ...profileData,
        coverImageUrl: url,
        name: profileData.firstName + ' ' + profileData.lastName,
        role: (profileData as any).role || 'member',
        onboardingCompleted: true,
      });
      toast({ title: "Cover photo updated!" });
    } catch (error) {
      toast({ title: "Upload failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/member-dashboard"
        showBottomNav={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prologue-electric mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopHeader />
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
