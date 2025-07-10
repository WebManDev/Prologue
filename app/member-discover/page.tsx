"use client"

import type React from "react"

import { useState, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Search,
  Star,
  User,
  MapPin,
  ChevronDown,
  CheckCircle,
  SlidersHorizontal,
  X,
  Home,
  MessageCircle,
  BookOpen,
  MessageSquare,
  Filter,
  TrendingUp,
  Verified,
  Crown,
} from "lucide-react"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { MemberHeader } from "@/components/navigation/member-header"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import Link from "next/link"

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

// Mock athletes data - Enhanced with more comprehensive athlete profiles
const MOCK_ATHLETES = [
  {
    id: "athlete-1",
    name: "Sarah Martinez",
    sport: "Tennis",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=200&width=400",
    followers: "15.2K",
    following: "892",
    rating: 4.9,
    specialty: "Serve Technique",
    bio: "Professional tennis player specializing in serve technique and mental game. NCAA Champion with 8+ years of competitive experience.",
    location: "California, USA",
    university: "Stanford University",
    achievements: ["NCAA Champion 2022", "Regional Tournament Winner", "All-American 2021"],
    isVerified: true,
    subscriptionPrice: 29.99,
    responseRate: "98%",
    totalStudents: 127,
    experience: "8+ years",
    joinedDate: "2022-01-15",
    totalPosts: 234,
    totalVideos: 89,
    avgSessionLength: "45 min",
    languages: ["English", "Spanish"],
    certifications: ["USPTA Certified", "Mental Performance Coach"],
    socialMedia: {
      instagram: "@sarahtennis",
      twitter: "@sarahm_tennis",
      youtube: "SarahTennisCoach",
    },
    recentActivity: [
      {
        type: "video",
        title: "Advanced Serve Technique Breakdown",
        timestamp: "2 hours ago",
        likes: 234,
        comments: 45,
      },
      {
        type: "post",
        title: "Mental preparation before big matches",
        timestamp: "1 day ago",
        likes: 156,
        comments: 23,
      },
    ],
    stats: {
      totalLessons: 156,
      avgRating: 4.9,
      completionRate: "94%",
      studentSatisfaction: "98%",
      totalContent: 156,
      totalViews: "2.3M",
    },
  },
  {
    id: "coach-1",
    name: "Mike Johnson",
    sport: "Basketball",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=200&width=400",
    followers: "8.7K",
    following: "445",
    rating: 4.8,
    specialty: "Mental Performance",
    bio: "Former professional player turned mental performance coach. Specializing in helping athletes overcome mental barriers and achieve peak performance.",
    location: "Texas, USA",
    achievements: ["Professional Player", "Mental Performance Certified", "NCAA Coach of the Year"],
    isVerified: true,
    subscriptionPrice: 39.99,
    responseRate: "95%",
    totalStudents: 89,
    experience: "12+ years",
    joinedDate: "2021-08-20",
    totalPosts: 178,
    totalVideos: 67,
    avgSessionLength: "60 min",
    languages: ["English"],
    certifications: ["Mental Performance Certified", "NASM-CPT"],
    socialMedia: {
      instagram: "@coachmikeJ",
      twitter: "@mikejcoach",
      youtube: "CoachMikeBasketball",
    },
    recentActivity: [
      {
        type: "video",
        title: "Building Mental Toughness in Young Athletes",
        timestamp: "4 hours ago",
        likes: 189,
        comments: 34,
      },
      {
        type: "post",
        title: "The importance of visualization in sports",
        timestamp: "2 days ago",
        likes: 267,
        comments: 56,
      },
    ],
    stats: {
      totalLessons: 234,
      avgRating: 4.8,
      completionRate: "91%",
      studentSatisfaction: "96%",
      totalContent: 203,
      totalViews: "1.8M",
    },
  },
  {
    id: "athlete-2",
    name: "Alex Rodriguez",
    sport: "Basketball",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=200&width=400",
    followers: "12.1K",
    following: "623",
    rating: 4.7,
    specialty: "Shooting Form",
    bio: "College basketball player focused on shooting mechanics and game strategy. All-Conference team member with expertise in 3-point shooting.",
    location: "Florida, USA",
    university: "University of Florida",
    achievements: ["All-Conference Team", "3-Point Contest Winner", "Team Captain 2023"],
    isVerified: true,
    subscriptionPrice: 24.99,
    responseRate: "92%",
    totalStudents: 156,
    experience: "5+ years",
    joinedDate: "2022-03-10",
    totalPosts: 145,
    totalVideos: 52,
    avgSessionLength: "40 min",
    languages: ["English", "Spanish"],
    certifications: ["USA Basketball Certified"],
    socialMedia: {
      instagram: "@alexhoops",
      twitter: "@alexrod_bball",
      youtube: "AlexBasketballTips",
    },
    recentActivity: [
      {
        type: "video",
        title: "Perfect Shooting Form in 5 Steps",
        timestamp: "6 hours ago",
        likes: 345,
        comments: 67,
      },
      {
        type: "post",
        title: "Game day preparation routine",
        timestamp: "3 days ago",
        likes: 198,
        comments: 29,
      },
    ],
    stats: {
      totalLessons: 98,
      avgRating: 4.7,
      completionRate: "89%",
      studentSatisfaction: "93%",
      totalContent: 98,
      totalViews: "1.2M",
    },
  },
  {
    id: "coach-2",
    name: "Lisa Chen",
    sport: "Swimming",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=200&width=400",
    followers: "9.8K",
    following: "334",
    rating: 4.9,
    specialty: "Stroke Technique",
    bio: "Olympic trials qualifier with expertise in stroke technique and endurance training. Certified USA Swimming coach with 8+ years experience.",
    location: "California, USA",
    achievements: ["Olympic Trials Qualifier", "USA Swimming Certified", "Masters National Champion"],
    isVerified: true,
    subscriptionPrice: 34.99,
    responseRate: "99%",
    totalStudents: 203,
    experience: "8+ years",
    joinedDate: "2021-11-05",
    totalPosts: 267,
    totalVideos: 78,
    avgSessionLength: "50 min",
    languages: ["English", "Mandarin"],
    certifications: ["USA Swimming Certified", "Water Safety Instructor"],
    socialMedia: {
      instagram: "@lisaswimcoach",
      twitter: "@lisachen_swim",
      youtube: "LisaSwimmingTech",
    },
    recentActivity: [
      {
        type: "video",
        title: "Freestyle Stroke Analysis and Correction",
        timestamp: "1 hour ago",
        likes: 278,
        comments: 45,
      },
      {
        type: "post",
        title: "Training periodization for competitive swimmers",
        timestamp: "1 day ago",
        likes: 156,
        comments: 34,
      },
    ],
    stats: {
      totalLessons: 312,
      avgRating: 4.9,
      completionRate: "96%",
      studentSatisfaction: "99%",
      totalContent: 145,
      totalViews: "1.5M",
    },
  },
  {
    id: "mentor-1",
    name: "David Rodriguez",
    sport: "Soccer",
    type: "mentor" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=200&width=400",
    followers: "6.5K",
    following: "289",
    rating: 4.6,
    specialty: "Career Guidance",
    bio: "Former professional soccer player now mentoring young athletes. 15+ years of experience in professional soccer with focus on career development.",
    location: "New York, USA",
    achievements: ["Professional Player", "Youth Development Certified", "MLS Veteran"],
    isVerified: false,
    subscriptionPrice: 19.99,
    responseRate: "88%",
    totalStudents: 74,
    experience: "15+ years",
    joinedDate: "2022-06-18",
    totalPosts: 123,
    totalVideos: 34,
    avgSessionLength: "35 min",
    languages: ["English", "Spanish"],
    certifications: ["Youth Development Certified", "USSF Licensed"],
    socialMedia: {
      instagram: "@davidfutbol",
      twitter: "@davidrod_soccer",
      youtube: "DavidSoccerMentor",
    },
    recentActivity: [
      {
        type: "post",
        title: "Transitioning from college to professional soccer",
        timestamp: "5 hours ago",
        likes: 134,
        comments: 28,
      },
      {
        type: "video",
        title: "Mental aspects of professional soccer",
        timestamp: "4 days ago",
        likes: 89,
        comments: 15,
      },
    ],
    stats: {
      totalLessons: 67,
      avgRating: 4.6,
      completionRate: "85%",
      studentSatisfaction: "91%",
      totalContent: 67,
      totalViews: "890K",
    },
  },
  {
    id: "athlete-3",
    name: "Emma Davis",
    sport: "Track & Field",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    coverImage: "/placeholder.svg?height=200&width=400",
    followers: "7.2K",
    following: "456",
    rating: 4.8,
    specialty: "Sprint Training",
    bio: "Collegiate sprinter specializing in 100m and 200m events. Conference champion with expertise in speed development and race strategy.",
    location: "Texas, USA",
    university: "University of Texas",
    achievements: ["Conference Champion", "National Qualifier", "School Record Holder"],
    isVerified: true,
    subscriptionPrice: 27.99,
    responseRate: "94%",
    totalStudents: 98,
    experience: "5+ years",
    joinedDate: "2022-09-12",
    totalPosts: 189,
    totalVideos: 45,
    avgSessionLength: "35 min",
    languages: ["English"],
    certifications: ["USATF Level 1"],
    socialMedia: {
      instagram: "@emmaspeed",
      twitter: "@emma_sprints",
      youtube: "EmmaSprintTraining",
    },
    recentActivity: [
      {
        type: "video",
        title: "Sprint Start Technique Breakdown",
        timestamp: "3 hours ago",
        likes: 167,
        comments: 23,
      },
      {
        type: "post",
        title: "Recovery strategies for sprinters",
        timestamp: "2 days ago",
        likes: 145,
        comments: 31,
      },
    ],
    stats: {
      totalLessons: 78,
      avgRating: 4.8,
      completionRate: "92%",
      studentSatisfaction: "95%",
      totalContent: 89,
      totalViews: "1.1M",
    },
  },
]

const EXPERIENCE_LEVELS = ["1-3 years", "3-5 years", "5-8 years", "8+ years"]

export default function MemberDiscoverPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const router = useRouter()
  const {
    subscribedCreators,
    subscribeToCreator,
    unsubscribeFromCreator,
    isFollowing,
    followCreator,
    unfollowCreator,
    isSubscribed,
  } = useMemberSubscriptions()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()
  const { logout } = useUnifiedLogout()

  // Enhanced state management
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedExperience, setSelectedExperience] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"rating" | "students" | "newest">("rating")
  const [selectedCreator, setSelectedCreator] = useState<(typeof MOCK_ATHLETES)[0] | null>(null)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // Refs for maintaining focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get unique sports and other filter options
  const availableSports = useMemo(() => {
    const sports = [...new Set(MOCK_ATHLETES.map((athlete) => athlete.sport))]
    return sports.sort()
  }, [])

  // Enhanced filtering logic
  const filteredAthletes = useMemo(() => {
    const filtered = MOCK_ATHLETES.filter((athlete) => {
      // Sport filter
      if (selectedSport !== "all" && athlete.sport !== selectedSport) return false

      // Type filter
      if (selectedType !== "all" && athlete.type !== selectedType) return false

      // Rating filter
      if (selectedRating !== "all") {
        const minRating = Number.parseFloat(selectedRating)
        if (athlete.rating < minRating) return false
      }

      // Experience filter
      if (selectedExperience !== "all" && athlete.experience !== selectedExperience) return false

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          athlete.name.toLowerCase().includes(query) ||
          athlete.sport.toLowerCase().includes(query) ||
          athlete.specialty.toLowerCase().includes(query) ||
          athlete.bio.toLowerCase().includes(query) ||
          athlete.location.toLowerCase().includes(query)
        )
      }

      return true
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "students":
          return b.totalStudents - a.totalStudents
        case "newest":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [selectedSport, selectedType, selectedRating, selectedExperience, searchQuery, sortBy])

  // Stable event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSearchDropdown(e.target.value.length > 0)
  }, [])

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.length > 0) {
      setShowSearchDropdown(true)
    }
  }, [searchQuery])

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSearchDropdown(false), 200)
  }, [])

  const handleQuickSearchSelect = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm)
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }, [])

  const handleSubscribe = useCallback(
    (athleteId: string) => {
      const athlete = MOCK_ATHLETES.find((a) => a.id === athleteId)
      if (athlete) {
        subscribeToCreator(athlete)
      }
    },
    [subscribeToCreator],
  )

  const handleUnsubscribe = useCallback(
    (athleteId: string) => {
      unsubscribeFromCreator(athleteId)
    },
    [unsubscribeFromCreator],
  )

  const handleCreatorClick = useCallback((creator: (typeof MOCK_ATHLETES)[0]) => {
    window.location.href = `/creator/coach-2`
  }, [])

  const handleFollowToggle = useCallback(
    (creatorId: string) => {
      const creator = MOCK_ATHLETES.find((a) => a.id === creatorId)
      if (!creator) return

      if (isFollowing(creatorId)) {
        unfollowCreator(creatorId)
      } else {
        followCreator(creator)
      }
    },
    [isFollowing, followCreator, unfollowCreator],
  )

  const handleSubscribeClick = useCallback(
    (creatorId: string) => {
      const creator = MOCK_ATHLETES.find((a) => a.id === creatorId)
      if (!creator) return

      setSelectedCreator(creator)
      router.push(`/member-subscription-plans?creatorId=${creatorId}&creatorName=${encodeURIComponent(creator.name)}`)
    },
    [router],
  )

  const clearAllFilters = useCallback(() => {
    setSelectedSport("all")
    setSelectedType("all")
    setSelectedRating("all")
    setSelectedExperience("all")
    setSearchQuery("")
  }, [])

  const hasActiveFilters =
    selectedSport !== "all" ||
    selectedType !== "all" ||
    selectedRating !== "all" ||
    selectedExperience !== "all" ||
    searchQuery

  // Memoized search dropdown
  const SearchDropdown = useMemo(() => {
    if (!showSearchDropdown || !searchQuery) return null

    const filteredSearches = QUICK_SEARCHES.filter((search) => search.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
        <div className="p-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Searches</p>
          <div className="space-y-1">
            {filteredSearches.map((search) => (
              <button
                key={search}
                onClick={() => handleQuickSearchSelect(search)}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [showSearchDropdown, searchQuery, handleQuickSearchSelect])

  // Enhanced Athlete Card Component - Condensed version
  const AthleteCard = useCallback(
    ({ athlete }: { athlete: (typeof MOCK_ATHLETES)[0] }) => (
      <Card className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-prologue-electric/30 group overflow-hidden">
        <CardContent className="p-0 h-full">
          {/* Cover Image */}
          <div className="relative h-32 bg-gradient-to-r from-gray-300 to-gray-400 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              {athlete.isVerified && (
                <Badge className="bg-prologue-electric text-white text-xs px-2 py-1">
                  <Verified className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700 px-2 py-1">
                {athlete.type}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 text-white">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{athlete.location}</span>
              </div>
            </div>
          </div>

          {/* Card Content - Condensed */}
          <div className="p-4 space-y-3">
            {/* Profile Section */}
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                <div
                  className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-3 border-white -mt-8 relative z-10 cursor-pointer hover:ring-4 hover:ring-prologue-electric/20 transition-all"
                  onClick={() => handleCreatorClick(athlete)}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3
                  className="font-semibold text-gray-900 text-lg cursor-pointer hover:text-prologue-electric transition-colors mb-1"
                  onClick={() => handleCreatorClick(athlete)}
                >
                  {athlete.name}
                </h3>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {athlete.sport}
                    {athlete.university && <span className="text-gray-500"> • {athlete.university}</span>}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{athlete.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500">{athlete.followers} followers</p>
                </div>
              </div>
            </div>

            {/* Specialty and Bio - Condensed */}
            <div>
              <p className="text-sm font-medium text-prologue-electric mb-1">{athlete.specialty}</p>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{athlete.bio}</p>
            </div>

            {/* Action Section - Condensed */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {isSubscribed(athlete.id) ? (
                  <Button
                    variant="outline"
                    onClick={() => handleUnsubscribe(athlete.id)}
                    className="flex-1 text-prologue-electric border-prologue-electric hover:bg-prologue-electric hover:text-white h-10"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Subscribed
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribeClick(athlete.id)}
                    className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white h-10"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-prologue-electric p-2"
                  onClick={() => handleCreatorClick(athlete)}
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [handleCreatorClick, isSubscribed, handleUnsubscribe, handleSubscribeClick],
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        currentPath="/member-browse"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        userType="member"
      >
        <div className="min-h-screen bg-gray-50">
          {/* Search Bar */}
          <div className="p-6 space-y-8 mt-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search athletes, coaches, mentors..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="pl-12 pr-12 h-14 bg-white border-0 shadow-lg rounded-xl focus:ring-2 focus:ring-prologue-electric/20 text-base"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {SearchDropdown}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 h-10 px-4 bg-white shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 px-4 bg-white shadow-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("students")}>Most Students</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-prologue-electric">
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Sport Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Sport</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                            {selectedSport === "all" ? "All Sports" : selectedSport}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setSelectedSport("all")}>All Sports</DropdownMenuItem>
                          {availableSports.map((sport) => (
                            <DropdownMenuItem key={sport} onClick={() => setSelectedSport(sport)}>
                              {sport}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                            {selectedType === "all"
                              ? "All Types"
                              : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setSelectedType("all")}>All Types</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedType("athlete")}>Athletes</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedType("coach")}>Coaches</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedType("mentor")}>Mentors</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Experience Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Experience</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                            {selectedExperience === "all" ? "Any Experience" : selectedExperience}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setSelectedExperience("all")}>
                            Any Experience
                          </DropdownMenuItem>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <DropdownMenuItem key={level} onClick={() => setSelectedExperience(level)}>
                              {level}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                            {selectedRating === "all" ? "Any Rating" : `${selectedRating}+ Stars`}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setSelectedRating("all")}>Any Rating</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedRating("4.5")}>4.5+ Stars</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedRating("4.0")}>4.0+ Stars</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedRating("3.5")}>3.5+ Stars</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Athletes Section */}
            <div className="space-y-6">
              <div className="space-y-6">
                {(searchQuery || hasActiveFilters ? filteredAthletes : filteredAthletes).map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>

              {(searchQuery || hasActiveFilters ? filteredAthletes : filteredAthletes).length === 0 && (
                <div className="text-center py-16">
                  <User className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No athletes found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                  <Button onClick={clearAllFilters} variant="outline" className="h-12 px-6 bg-white shadow-sm">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
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
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MemberHeader
        currentPath="/member-browse"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 mt-0">
        {/* Search and Controls - Integrated Filters */}
        <div className="mb-12">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search athletes by name, sport, specialty, or location..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="pl-12 pr-12 h-12 bg-gray-50 border-0 focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric text-lg rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  )}
                  {SearchDropdown}
                </div>

                {/* Integrated Filter Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Sport Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <span className="mr-2">Sport:</span>
                        {selectedSport === "all" ? "All" : selectedSport}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem onClick={() => setSelectedSport("all")}>All Sports</DropdownMenuItem>
                      {availableSports.map((sport) => (
                        <DropdownMenuItem key={sport} onClick={() => setSelectedSport(sport)}>
                          {sport}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Type Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <span className="mr-2">Type:</span>
                        {selectedType === "all" ? "All" : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedType("all")}>All Types</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedType("athlete")}>Athletes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedType("coach")}>Coaches</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedType("mentor")}>Mentors</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Experience Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <span className="mr-2">Experience:</span>
                        {selectedExperience === "all" ? "Any" : selectedExperience}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedExperience("all")}>Any Experience</DropdownMenuItem>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <DropdownMenuItem key={level} onClick={() => setSelectedExperience(level)}>
                          {level}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Rating Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <span className="mr-2">Rating:</span>
                        {selectedRating === "all" ? "Any" : `${selectedRating}+`}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedRating("all")}>Any Rating</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedRating("4.5")}>4.5+ Stars</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedRating("4.0")}>4.0+ Stars</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedRating("3.5")}>3.5+ Stars</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-200 h-8 px-3 text-sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Sort by {sortBy === "rating" ? "Rating" : sortBy === "students" ? "Students" : "Newest"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("students")}>Most Students</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="text-gray-600 hover:text-gray-900 h-8 px-3 text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Athletes Grid - Full Width */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {(searchQuery || hasActiveFilters ? filteredAthletes : filteredAthletes).map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>

          {/* Empty State */}
          {(searchQuery || hasActiveFilters ? filteredAthletes : filteredAthletes).length === 0 && (
            <div className="text-center py-20">
              <User className="h-24 w-24 mx-auto mb-8 text-gray-300" />
              <h3 className="text-2xl font-medium text-gray-900 mb-4">No athletes found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                We couldn't find any athletes matching your current filters. Try adjusting your search criteria.
              </p>
              <div className="space-x-4">
                <Button onClick={clearAllFilters} variant="outline" className="h-12 px-8 bg-white shadow-sm">
                  Clear All Filters
                </Button>
                <Button
                  onClick={() => setSearchQuery("")}
                  className="bg-prologue-electric hover:bg-prologue-blue text-white h-12 px-8"
                >
                  Browse All Athletes
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 