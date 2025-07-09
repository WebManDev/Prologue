"use client"

import type React from "react"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
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
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { MemberHeader } from "@/components/navigation/member-header"
import Link from "next/link"
import { CREATORS } from "@/lib/creators"
import { getDocs, collection, doc, getDoc, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore"
import { 
  db, 
  auth, 
  getMemberProfile, 
  getAthleteProfile,
  getAllComprehensiveAthletes,
  getComprehensiveAthletesByIds,
  getAthleteAnalytics,
} from "@/lib/firebase"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"

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

  // Firebase state
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{ firstName: string; lastName: string; profileImageUrl: string | null; profilePic?: string; profilePicture?: string }>({ firstName: "", lastName: "", profileImageUrl: null })
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null)
  const [profileCache, setProfileCache] = useState<Record<string, any>>({})
  const [subscriptions, setSubscriptions] = useState<{[athleteId: string]: any}>({})
  const [athletes, setAthletes] = useState<any[]>(CREATORS)

  // Enhanced state management
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedExperience, setSelectedExperience] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"rating" | "students" | "newest">("rating")
  const [selectedCreator, setSelectedCreator] = useState<(typeof CREATORS)[0] | null>(null)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // Refs for maintaining focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Firebase effects - Load profile (synced with member-home)
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.currentUser) return
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

  // Listen to real-time updates
  useEffect(() => {
    if (!auth?.currentUser) return

    // Listen to athletes collection and fetch comprehensive data
    const unsubscribeAthletes = onSnapshot(collection(db, "athletes"), async (snapshot) => {
      try {
        // Get all athlete IDs from the snapshot
        const athleteIds = snapshot.docs.map(doc => doc.id)
        
        // Fetch comprehensive data for all athletes
        const comprehensiveAthletes = await getComprehensiveAthletesByIds(athleteIds)
        
        // Enhance with analytics for each athlete
        const athletesWithAnalytics = await Promise.all(
          comprehensiveAthletes.map(async (athlete) => {
            try {
              const analytics = await getAthleteAnalytics(athlete.id)
              return {
                ...athlete,
                // Override with latest analytics
                totalPosts: analytics.totalPosts,
                totalVideos: analytics.totalVideos,
                totalArticles: analytics.totalArticles,
                totalCourses: analytics.totalCourses,
                totalContent: analytics.totalContent,
                totalViews: analytics.totalViews,
                engagementRate: analytics.engagementRate,
                // Ensure all UI fields are present
                avatar: athlete.profileImageUrl || athlete.avatar || "/placeholder.svg?height=80&width=80",
                coverImage: athlete.coverImage || "/placeholder.svg?height=200&width=400",
                followers: athlete.followers?.toString() || "0",
                following: athlete.following?.toString() || "0",
                subscriptionPrice: athlete.pricing?.pro || athlete.subscriptionPrice || 0,
              }
            } catch (error) {
              console.error(`Error fetching analytics for athlete ${athlete.id}:`, error)
              return {
                ...athlete,
                avatar: athlete.profileImageUrl || athlete.avatar || "/placeholder.svg?height=80&width=80",
                coverImage: athlete.coverImage || "/placeholder.svg?height=200&width=400",
                followers: athlete.followers?.toString() || "0",
                following: athlete.following?.toString() || "0",
                subscriptionPrice: athlete.pricing?.pro || athlete.subscriptionPrice || 0,
              }
            }
          })
        )
        
        // Merge with static creators (fallback data)
        const merged = [
          ...athletesWithAnalytics,
          ...CREATORS.filter(staticAthlete => !athletesWithAnalytics.some(f => f.id === staticAthlete.id))
        ]
        
        setAthletes(merged)
      } catch (error) {
        console.error("Error fetching comprehensive athlete data:", error)
        // Fallback to basic data on error
        const basicData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          avatar: doc.data().profileImageUrl || "/placeholder.svg?height=80&width=80",
          coverImage: doc.data().coverImage || "/placeholder.svg?height=200&width=400",
        }))
        setAthletes([...basicData, ...CREATORS])
      }
    })

    // Listen to member subscriptions
    const unsubscribeMember = onSnapshot(doc(db, "members", auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data()
        setSubscriptions(userData.subscriptions || {})
      }
    })

    return () => {
      unsubscribeAthletes()
      unsubscribeMember()
    }
  }, [auth?.currentUser])

  // Enhanced fetch for initial load with comprehensive data
  useEffect(() => {
    async function fetchComprehensiveAthletes() {
      try {
        // Fetch all comprehensive athlete data
        const comprehensiveAthletes = await getAllComprehensiveAthletes()
        
        // Enhance with real-time analytics
        const athletesWithAnalytics = await Promise.all(
          comprehensiveAthletes.map(async (athlete) => {
            try {
              const analytics = await getAthleteAnalytics(athlete.id)
              return {
                ...athlete,
                // Add real-time content counts
                totalPosts: analytics.totalPosts,
                totalVideos: analytics.totalVideos,
                totalArticles: analytics.totalArticles,
                totalCourses: analytics.totalCourses,
                totalContent: analytics.totalContent,
                totalViews: analytics.totalViews,
                totalLikes: analytics.totalLikes,
                totalComments: analytics.totalComments,
                engagementRate: analytics.engagementRate,
                // Ensure UI compatibility
                avatar: athlete.profileImageUrl || athlete.avatar || "/placeholder.svg?height=80&width=80",
                coverImage: athlete.coverImage || "/placeholder.svg?height=200&width=400",
                followers: athlete.followers?.toString() || "0",
                following: athlete.following?.toString() || "0",
                subscriptionPrice: athlete.pricing?.pro || athlete.subscriptionPrice || 0,
              }
            } catch (error) {
              console.error(`Error fetching analytics for athlete ${athlete.id}:`, error)
              return {
                ...athlete,
                avatar: athlete.profileImageUrl || athlete.avatar || "/placeholder.svg?height=80&width=80",
                coverImage: athlete.coverImage || "/placeholder.svg?height=200&width=400",
                followers: athlete.followers?.toString() || "0",
                following: athlete.following?.toString() || "0",
                subscriptionPrice: athlete.pricing?.pro || athlete.subscriptionPrice || 0,
              }
            }
          })
        )
        
        // Merge with static data for any missing athletes
        const merged = [
          ...athletesWithAnalytics,
          ...CREATORS.filter(staticAthlete => !athletesWithAnalytics.some(f => f.id === staticAthlete.id))
        ]
        
        setAthletes(merged)
        console.log(`[DEBUG] Loaded ${athletesWithAnalytics.length} comprehensive athlete profiles`)
      } catch (error) {
        console.error("Error fetching comprehensive athletes:", error)
        // Fallback to basic fetch
        const snapshot = await getDocs(collection(db, "athletes"))
        const basicData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          avatar: doc.data().profileImageUrl || "/placeholder.svg?height=80&width=80",
          coverImage: doc.data().coverImage || "/placeholder.svg?height=200&width=400",
        }))
        // Merge with static creators
        const merged = [
          ...basicData,
          ...CREATORS.filter(staticAthlete => !basicData.some(f => f.id === staticAthlete.id))
        ]
        setAthletes(merged)
      }
    }
    fetchComprehensiveAthletes()
  }, [])

  const fetchSubscriptions = async () => {
    if (auth?.currentUser) {
      const memberRef = doc(db, "members", auth.currentUser.uid)
      const memberSnap = await getDoc(memberRef)
      if (memberSnap.exists()) {
        const memberData = memberSnap.data()
        setSubscriptions(memberData.subscriptions || {})
      }
    }
  }

  useEffect(() => {
    fetchSubscriptions()
    
    // Refresh subscription status when user returns to the page
    const handleFocus = () => {
      fetchSubscriptions()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const isSubscribedToCreator = (athleteId: string) => {
    return subscriptions[athleteId] && subscriptions[athleteId].status === "active"
  }

  // Get unique sports and other filter options
  const availableSports = useMemo(() => {
    const sports = [...new Set(athletes.map((athlete) => athlete.sport))]
    return sports.sort()
  }, [athletes])

  // Enhanced filtering logic
  const filteredAthletes = useMemo(() => {
    const filtered = athletes.filter((athlete) => {
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
  }, [selectedSport, selectedType, selectedRating, selectedExperience, searchQuery, sortBy, athletes])

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
      const athlete = athletes.find((a) => a.id === athleteId)
      if (athlete) {
        subscribeToCreator(athlete)
      }
    },
    [subscribeToCreator, athletes],
  )

  const handleUnsubscribe = useCallback(
    (athleteId: string) => {
      unsubscribeFromCreator(athleteId)
    },
    [unsubscribeFromCreator],
  )

  const handleCreatorClick = useCallback((creator: (typeof athletes)[0]) => {
    window.location.href = `/creator/${creator.id}`
  }, [])

  const handleFollowToggle = useCallback(
    (creatorId: string) => {
      const creator = athletes.find((a) => a.id === creatorId)
      if (!creator) return

      if (isFollowing(creatorId)) {
        unfollowCreator(creatorId)
      } else {
        followCreator(creator)
      }
    },
    [isFollowing, followCreator, unfollowCreator, athletes],
  )

  const handleSubscribeClick = useCallback(
    (creatorId: string) => {
      const creator = athletes.find((a) => a.id === creatorId)
      if (!creator) return

      setSelectedCreator(creator)
      router.push(`/member-subscription-plans?creatorId=${creatorId}&creatorName=${encodeURIComponent(creator.name)}`)
    },
    [router, athletes],
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
    ({ athlete }: { athlete: (typeof athletes)[0] }) => (
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
                  {athlete.profileImageUrl || athlete.profilePic || athlete.profilePicture || athlete.avatar ? (
                    <img
                      src={athlete.profileImageUrl || athlete.profilePic || athlete.profilePicture || athlete.avatar}
                      alt={athlete.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{athlete.rating}</span>
                      <span className="text-xs text-gray-400">({Object.keys(athlete.ratings || {}).length})</span>
                    </div>
                    <p className="text-sm text-gray-500">{athlete.followers} followers</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {athlete.totalContent || 0} content
                  </div>
                </div>
              </div>
            </div>

            {/* Specialty and Bio - Enhanced */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-prologue-electric">{athlete.specialty}</p>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{athlete.bio}</p>
              
              {/* Additional Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{athlete.responseRate || "95%"} response rate</span>
                <span>{athlete.experience || "5+ years"}</span>
              </div>
              
              {/* Tags & Certifications */}
              {(athlete.languages?.length > 0 || athlete.certifications?.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {athlete.languages?.slice(0, 2).map((lang: string, idx: number) => (
                    <Badge key={`lang-${idx}`} variant="secondary" className="text-xs px-2 py-0.5">
                      {lang}
                    </Badge>
                  ))}
                  {athlete.certifications?.slice(0, 1).map((cert: string, idx: number) => (
                    <Badge key={`cert-${idx}`} variant="outline" className="text-xs px-2 py-0.5 border-prologue-electric/30 text-prologue-electric">
                      {cert.length > 20 ? cert.substring(0, 20) + "..." : cert}
                    </Badge>
                  ))}
                  {athlete.engagementRate && athlete.engagementRate !== "0%" && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700">
                      {athlete.engagementRate} engagement
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Action Section - Condensed */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {isSubscribedToCreator(athlete.id) ? (
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
    [handleCreatorClick, isSubscribedToCreator, handleUnsubscribe, handleSubscribeClick],
  )

  if (isMobile || isTablet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MemberHeader
          currentPath="/member-browse"
          unreadNotifications={unreadNotificationsCount}
          unreadMessages={unreadMessagesCount}
          hasNewContent={hasNewTrainingContent}
          onLogout={logout}
          profileImageUrl={profileImageUrl}
          profileData={profileData}
        />

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
                        <DropdownMenuContent className="w-48">
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
                {filteredAthletes.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>

              {filteredAthletes.length === 0 && (
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
          <div className="flex items-center justify-around h-20 px-6">
            <Link
              href="/member-home"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/member-training"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-xs font-medium">Training</span>
            </Link>
            <Link
              href="/member-browse"
              className="flex flex-col items-center space-y-2 text-prologue-electric transition-colors"
            >
              <Search className="h-6 w-6" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link
              href="/member-feedback"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs font-medium">Feedback</span>
            </Link>
            <Link
              href="/member-messaging"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors relative"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">Messages</span>
              {unreadMessagesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </nav>
      </div>
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
            {filteredAthletes.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>

          {/* Empty State */}
          {filteredAthletes.length === 0 && (
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
