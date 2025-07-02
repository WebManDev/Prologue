"use client"

import type React from "react"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Star,
  User,
  MapPin,
  ChevronDown,
  UserPlus,
  CheckCircle,
  SlidersHorizontal,
  X,
  Zap,
  Home,
  MessageCircle,
  BookOpen,
  MessageSquare,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Calendar,
  Clock,
  Heart,
  Share2,
  Verified,
  Trophy,
  Play,
  ThumbsUp,
  MessageCircleMore,
  Crown,
} from "lucide-react"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { MemberHeader } from "@/components/navigation/member-header"
import Link from "next/link"
import { CREATORS } from "@/lib/creators"
import { getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { logout } = useUnifiedLogout()

  // Enhanced state management
  const [activeTab, setActiveTab] = useState<"browse" | "featured" | "trending">("browse")
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedPrice, setSelectedPrice] = useState<string>("all")
  const [selectedExperience, setSelectedExperience] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"rating" | "price" | "students" | "newest">("rating")
  const [selectedCreator, setSelectedCreator] = useState<(typeof CREATORS)[0] | null>(null)
  const [showCreatorProfile, setShowCreatorProfile] = useState(false)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [athletes, setAthletes] = useState(CREATORS)

  // Refs for maintaining focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get unique sports and other filter options
  const availableSports = useMemo(() => {
    const sports = [...new Set(CREATORS.map((athlete) => athlete.sport))]
    return sports.sort()
  }, [])

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

      // Price filter
      if (selectedPrice !== "all") {
        const price = athlete.subscriptionPrice
        switch (selectedPrice) {
          case "under-25":
            if (price >= 25) return false
            break
          case "25-40":
            if (price < 25 || price > 40) return false
            break
          case "over-40":
            if (price <= 40) return false
            break
        }
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
        case "price":
          return a.subscriptionPrice - b.subscriptionPrice
        case "students":
          return b.totalStudents - a.totalStudents
        case "newest":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [selectedSport, selectedType, selectedRating, selectedPrice, selectedExperience, searchQuery, sortBy, athletes])

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

  const handleCreatorClick = useCallback((creator: (typeof CREATORS)[0]) => {
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

  const handleSubscribeClick = useCallback((creatorId: string) => {
    const creator = athletes.find((a) => a.id === creatorId)
    if (!creator) return

    setSelectedCreator(creator)
    setSubscriptionDialogOpen(true)
  }, [athletes])

  const handleConfirmSubscription = useCallback(() => {
    if (selectedCreator) {
      subscribeToCreator(selectedCreator)
    }
    setSubscriptionDialogOpen(false)
  }, [selectedCreator, subscribeToCreator])

  const clearAllFilters = useCallback(() => {
    setSelectedSport("all")
    setSelectedType("all")
    setSelectedRating("all")
    setSelectedPrice("all")
    setSelectedExperience("all")
    setSearchQuery("")
  }, [])

  const hasActiveFilters =
    selectedSport !== "all" ||
    selectedType !== "all" ||
    selectedRating !== "all" ||
    selectedPrice !== "all" ||
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

  // Enhanced Athlete Card Component with pricing properly inside the card
  const AthleteCard = useCallback(
    ({ athlete }: { athlete: (typeof CREATORS)[0] }) => (
      <Card className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-prologue-electric/30 group overflow-hidden">
        <CardContent className="p-0 h-full">
          {/* Cover Image */}
          <div className="relative h-40 bg-gradient-to-r from-gray-300 to-gray-400 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 right-4 flex items-center space-x-2">
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
            <div className="absolute bottom-4 left-4 text-white">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{athlete.location}</span>
              </div>
            </div>
          </div>

          {/* Card Content - All content inside this div */}
          <div className="p-6 space-y-6">
            {/* Profile Section */}
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden border-4 border-white -mt-10 relative z-10 cursor-pointer hover:ring-4 hover:ring-prologue-electric/20 transition-all"
                  onClick={() => handleCreatorClick(athlete)}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-2">
                <div className="mb-3">
                  <h3
                    className="font-semibold text-gray-900 text-xl cursor-pointer hover:text-prologue-electric transition-colors mb-2"
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{athlete.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{athlete.followers} followers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio and Specialty */}
            <div>
              <p className="text-sm font-medium text-prologue-electric mb-2">{athlete.specialty}</p>
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{athlete.bio}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 mb-1">{athlete.totalStudents}</p>
                <p className="text-xs text-gray-600">Students</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 mb-1">{athlete.responseRate}</p>
                <p className="text-xs text-gray-600">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 mb-1">{athlete.experience}</p>
                <p className="text-xs text-gray-600">Experience</p>
              </div>
            </div>

            {/* Recent Activity */}
            {athlete.recentActivity && athlete.recentActivity.length > 0 && (
              <div className="p-4 bg-prologue-electric/5 rounded-lg border border-prologue-electric/20">
                <h4 className="text-sm font-medium text-prologue-electric mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  {athlete.recentActivity.slice(0, 1).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-prologue-electric/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.type === "video" ? (
                          <Play className="h-4 w-4 text-prologue-electric" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-prologue-electric" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{activity.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{activity.timestamp}</span>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{activity.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircleMore className="h-3 w-3" />
                            <span>{activity.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {athlete.achievements && athlete.achievements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  {athlete.achievements.slice(0, 2).map((achievement, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 px-2 py-1"
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                  {athlete.achievements.length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{athlete.achievements.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Pricing and Action Section - Contained within card */}
            <div className="pt-6 border-t border-gray-100">
              {/* Price Display */}
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">${athlete.subscriptionPrice}</span>
                <span className="text-sm text-gray-500 ml-1">/month</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isSubscribed(athlete.id) ? (
                  <Button
                    variant="outline"
                    onClick={() => handleUnsubscribe(athlete.id)}
                    className="w-full text-prologue-electric border-prologue-electric hover:bg-prologue-electric hover:text-white h-12"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Subscribed
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push(`/member-subscription-plans?athleteId=${athlete.id}`)}
                    className="w-full bg-prologue-electric hover:bg-prologue-blue text-white h-12"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                )}

                {/* Secondary Actions */}
                <div className="flex items-center justify-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-prologue-electric p-2">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-prologue-electric p-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreatorClick(athlete)}
                    className="text-gray-500 hover:text-prologue-electric text-sm"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [handleCreatorClick, isSubscribed, handleUnsubscribe, handleSubscribe, router],
  )

  // Enhanced List View Component with better spacing
  const AthleteListItem = useCallback(
    ({ athlete }: { athlete: (typeof CREATORS)[0] }) => {
      const router = useRouter();
      return (
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-8">
            <div className="flex items-center space-x-8">
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:ring-4 hover:ring-prologue-electric/20 transition-all"
                  onClick={() => handleCreatorClick(athlete)}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-600" />
                  </div>
                </div>
                {athlete.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-prologue-electric rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      className="font-semibold text-gray-900 text-xl mb-2 cursor-pointer hover:text-prologue-electric transition-colors"
                      onClick={() => handleCreatorClick(athlete)}
                    >
                      {athlete.name}
                    </h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {athlete.type}
                      </Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {athlete.sport}
                      </Badge>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{athlete.location}</span>
                    </div>
                    <p className="text-sm font-medium text-prologue-electric mb-2">{athlete.specialty}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed max-w-2xl">{athlete.bio}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-medium">{athlete.rating}</span>
                      <span className="text-sm text-gray-500">({athlete.totalStudents} students)</span>
                    </div>
                    <p className="text-sm text-gray-500">{athlete.followers} followers</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>{athlete.responseRate} response</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{athlete.avgSessionLength}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{athlete.experience}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">${athlete.subscriptionPrice}</span>
                      <span className="text-sm text-gray-500 ml-1">/month</span>
                    </div>
                    {isSubscribed(athlete.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsubscribe(athlete.id)}
                        className="text-prologue-electric border-prologue-electric hover:bg-prologue-electric hover:text-white px-4 py-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Subscribed
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push(`/member-subscription-plans?athleteId=${athlete.id}`)}
                        className="bg-prologue-electric hover:bg-prologue-blue text-white px-4 py-2"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    [handleCreatorClick, isSubscribed, handleUnsubscribe, handleSubscribe, router],
  )

  // Enhanced Filter Section with better spacing
  const FilterSection = useMemo(
    () => (
      <Card className="bg-white border border-gray-200">
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
                  <DropdownMenuItem onClick={() => setSelectedExperience("all")}>Any Experience</DropdownMenuItem>
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

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent h-10">
                    {selectedPrice === "all"
                      ? "Any Price"
                      : selectedPrice === "under-25"
                        ? "Under $25"
                        : selectedPrice === "25-40"
                          ? "$25 - $40"
                          : "Over $40"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setSelectedPrice("all")}>Any Price</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPrice("under-25")}>Under $25</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPrice("25-40")}>$25 - $40</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedPrice("over-40")}>Over $40</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [
      hasActiveFilters,
      clearAllFilters,
      selectedSport,
      selectedType,
      selectedExperience,
      selectedRating,
      selectedPrice,
      availableSports,
    ],
  )

  // Subscription Dialog
  const SubscriptionDialog = useMemo(() => {
    if (!selectedCreator) return null

    return (
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Subscribe to {selectedCreator.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
                <User className="w-full h-full text-gray-500 p-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedCreator.name}</h3>
              <p className="text-gray-600">
                {selectedCreator.sport} • {selectedCreator.specialty}
              </p>
            </div>

            <div className="bg-gradient-to-r from-prologue-electric to-prologue-blue text-white rounded-lg p-8 text-center">
              <div className="text-4xl font-bold mb-2">${selectedCreator.subscriptionPrice}</div>
              <div className="text-blue-100">per month</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Access to all premium content</span>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Direct messaging with creator</span>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Personalized training plans</span>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support and feedback</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setSubscriptionDialogOpen(false)}
                className="flex-1 bg-transparent h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubscription}
                className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white h-12"
              >
                <Crown className="h-5 w-5 mr-2" />
                Subscribe Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }, [selectedCreator, subscriptionDialogOpen, handleConfirmSubscription])

  useEffect(() => {
    async function fetchAthletes() {
      try {
        const snapshot = await getDocs(collection(db, "athletes"))
        const fetched = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
            sport: data.sport || "",
            type: data.type || "athlete",
            avatar: data.avatar || "/placeholder.svg?height=80&width=80",
            coverImage: data.coverImage || "/placeholder.svg?height=200&width=400",
            followers: data.followers || "0",
            following: data.following || "0",
            rating: data.rating || 0,
            specialty: data.specialty || "",
            bio: data.bio || "",
            location: data.location || "",
            university: data.university || "",
            achievements: data.achievements || [],
            isVerified: data.isVerified || false,
            subscriptionPrice: data.subscriptionPrice || 0,
            responseRate: data.responseRate || "",
            totalStudents: data.totalStudents || 0,
            experience: data.experience || "",
            joinedDate: data.joinedDate || "",
            totalPosts: data.totalPosts || 0,
            totalVideos: data.totalVideos || 0,
            avgSessionLength: data.avgSessionLength || "",
            languages: data.languages || [],
            certifications: data.certifications || [],
            socialMedia: data.socialMedia || {},
            recentActivity: data.recentActivity || [],
            stats: data.stats || {},
          }
        })
        // Merge fetched with static by id
        const merged = [
          ...fetched,
          ...CREATORS.filter(staticAthlete => !fetched.some(f => f.id === staticAthlete.id))
        ]
        setAthletes(merged)
      } catch (e) {
        setAthletes(CREATORS)
      }
    }
    fetchAthletes()
  }, [])

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/member-discover"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
      >
        <div className="p-6 space-y-8">
          {/* Mobile Search with better spacing */}
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
              className="pl-12 pr-12 h-12 bg-gray-100 border-0 focus:ring-2 focus:ring-prologue-electric/20 text-base"
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

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 h-10 px-4"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Mobile Tabs with better spacing */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm h-12">
              <TabsTrigger value="browse" className="text-sm">
                Browse
              </TabsTrigger>
              <TabsTrigger value="featured" className="text-sm">
                Featured
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-sm">
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6 mt-6">
              {/* Mobile Filters */}
              {showFilters && <div className="space-y-6">{FilterSection}</div>}

              {/* Mobile Sort and View Controls */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} found
                </p>
                <div className="flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 px-4 bg-transparent">
                        <Filter className="h-4 w-4 mr-2" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price")}>Lowest Price</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("students")}>Most Students</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="bg-prologue-electric/10 text-prologue-electric px-3 py-1">
                      Filtered
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mobile Athlete Cards with better spacing */}
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
                  <Button onClick={clearAllFilters} variant="outline" className="h-12 px-6 bg-transparent">
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-6 mt-6">
              <div className="space-y-6">
                {filteredAthletes
                  .filter((athlete) => athlete.isVerified)
                  .slice(0, 6)
                  .map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6 mt-6">
              <div className="space-y-6">
                {filteredAthletes
                  .sort((a, b) => b.totalStudents - a.totalStudents)
                  .slice(0, 6)
                  .map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Bottom Navigation with better spacing */}
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
              href="/member-discover"
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

        {SubscriptionDialog}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MemberHeader
        currentPath="/member-discover"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        onLogout={logout}
      />

      {/* Main Content with better spacing */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Enhanced Tabs with better spacing */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/50 backdrop-blur-sm h-12">
              <TabsTrigger value="browse" className="text-sm">
                Browse All
              </TabsTrigger>
              <TabsTrigger value="featured" className="text-sm">
                Featured
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-sm">
                Trending
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 bg-white h-10 px-4">
                    <TrendingUp className="h-4 w-4" />
                    <span>Sort by {sortBy}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price")}>Lowest Price</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("students")}>Most Students</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-10">
            {/* Enhanced Sidebar Filters with better spacing */}
            <div className="col-span-3">{FilterSection}</div>

            {/* Main Content Area with better spacing */}
            <div className="col-span-9">
              <TabsContent value="browse" className="space-y-8">
                {/* Search and Results Header with better spacing */}
                <div className="mb-8">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search athletes by name, sport, specialty, or location..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      className="pl-12 pr-12 h-12 bg-white border border-gray-200 focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric text-base"
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

                  <div className="flex items-center justify-between">
                    <p className="text-base text-gray-600">
                      {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} found
                    </p>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="bg-prologue-electric/10 text-prologue-electric px-3 py-1">
                        Filtered Results
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Athletes Display with better spacing */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredAthletes.map((athlete) => (
                      <AthleteCard key={athlete.id} athlete={athlete} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAthletes.map((athlete) => (
                      <AthleteListItem key={athlete.id} athlete={athlete} />
                    ))}
                  </div>
                )}

                {/* Empty State with better spacing */}
                {filteredAthletes.length === 0 && (
                  <div className="text-center py-20">
                    <User className="h-24 w-24 mx-auto mb-8 text-gray-300" />
                    <h3 className="text-2xl font-medium text-gray-900 mb-4">No athletes found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                      We couldn't find any athletes matching your current filters. Try adjusting your search criteria.
                    </p>
                    <div className="space-x-4">
                      <Button onClick={clearAllFilters} variant="outline" className="h-12 px-8 bg-transparent">
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
              </TabsContent>

              <TabsContent value="featured" className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Athletes & Coaches</h2>
                  <p className="text-gray-600 text-lg">
                    Discover our top-rated and verified creators who are making a difference in their sports.
                  </p>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredAthletes
                      .filter((athlete) => athlete.isVerified)
                      .slice(0, 9)
                      .map((athlete) => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAthletes
                      .filter((athlete) => athlete.isVerified)
                      .slice(0, 9)
                      .map((athlete) => (
                        <AthleteListItem key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending Now</h2>
                  <p className="text-gray-600 text-lg">
                    The most popular athletes and coaches based on recent activity and student engagement.
                  </p>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredAthletes
                      .sort((a, b) => b.totalStudents - a.totalStudents)
                      .slice(0, 9)
                      .map((athlete) => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAthletes
                      .sort((a, b) => b.totalStudents - a.totalStudents)
                      .slice(0, 9)
                      .map((athlete) => (
                        <AthleteListItem key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>

      {SubscriptionDialog}
    </div>
  )
}
