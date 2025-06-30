"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Star,
  User,
  MapPin,
  ChevronDown,
  UserPlus,
  Crown,
  CheckCircle,
  ArrowLeft,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"

// Mock creators data with comprehensive sports coverage
const mockCreators = [
  {
    id: "athlete-1",
    name: "Sarah Martinez",
    sport: "Tennis",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "15.2K",
    rating: 4.9,
    specialty: "Serve Technique",
    bio: "Professional tennis player specializing in serve technique and mental game.",
    location: "California, USA",
    university: "Stanford University",
    achievements: ["NCAA Champion 2022", "Regional Tournament Winner"],
    isVerified: true,
    subscriptionPrice: 29.99,
    responseRate: "98%",
    totalStudents: 127,
    experience: "8+ years",
  },
  {
    id: "coach-1",
    name: "Mike Johnson",
    sport: "Basketball",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "8.7K",
    rating: 4.8,
    specialty: "Mental Performance",
    bio: "Former professional player turned mental performance coach.",
    location: "Texas, USA",
    achievements: ["Professional Player", "Mental Performance Certified"],
    isVerified: true,
    subscriptionPrice: 39.99,
    responseRate: "95%",
    totalStudents: 89,
    experience: "12+ years",
  },
  {
    id: "athlete-2",
    name: "Alex Rodriguez",
    sport: "Basketball",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "12.1K",
    rating: 4.7,
    specialty: "Shooting Form",
    bio: "College basketball player focused on shooting mechanics and game strategy.",
    location: "Florida, USA",
    university: "University of Florida",
    achievements: ["All-Conference Team", "3-Point Contest Winner"],
    isVerified: true,
    subscriptionPrice: 24.99,
    responseRate: "92%",
    totalStudents: 156,
    experience: "5+ years",
  },
  {
    id: "coach-2",
    name: "Lisa Chen",
    sport: "Swimming",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "9.8K",
    rating: 4.9,
    specialty: "Stroke Technique",
    bio: "Olympic trials qualifier with expertise in stroke technique and endurance training.",
    location: "California, USA",
    achievements: ["Olympic Trials Qualifier", "USA Swimming Certified"],
    isVerified: true,
    subscriptionPrice: 34.99,
    responseRate: "99%",
    totalStudents: 203,
    experience: "8+ years",
  },
  {
    id: "mentor-1",
    name: "David Rodriguez",
    sport: "Soccer",
    type: "mentor" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "6.5K",
    rating: 4.6,
    specialty: "Career Guidance",
    bio: "Former professional soccer player now mentoring young athletes.",
    location: "New York, USA",
    achievements: ["Professional Player", "Youth Development Certified"],
    isVerified: false,
    subscriptionPrice: 19.99,
    responseRate: "88%",
    totalStudents: 74,
    experience: "15+ years",
  },
  {
    id: "athlete-3",
    name: "Emma Davis",
    sport: "Track & Field",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "7.2K",
    rating: 4.8,
    specialty: "Sprint Training",
    bio: "Collegiate sprinter specializing in 100m and 200m events.",
    location: "Texas, USA",
    university: "University of Texas",
    achievements: ["Conference Champion", "National Qualifier"],
    isVerified: true,
    subscriptionPrice: 27.99,
    responseRate: "94%",
    totalStudents: 98,
    experience: "5+ years",
  },
  {
    id: "coach-3",
    name: "James Wilson",
    sport: "Football",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "11.3K",
    rating: 4.7,
    specialty: "Quarterback Training",
    bio: "Former NFL quarterback coach specializing in mechanics and decision making.",
    location: "Georgia, USA",
    achievements: ["NFL Coach", "Championship Winner"],
    isVerified: true,
    subscriptionPrice: 45.99,
    responseRate: "96%",
    totalStudents: 134,
    experience: "20+ years",
  },
  {
    id: "athlete-4",
    name: "Maria Gonzalez",
    sport: "Volleyball",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "5.8K",
    rating: 4.6,
    specialty: "Spiking Technique",
    bio: "Professional volleyball player with expertise in attacking strategies.",
    location: "California, USA",
    university: "UCLA",
    achievements: ["All-American", "Conference MVP"],
    isVerified: true,
    subscriptionPrice: 22.99,
    responseRate: "91%",
    totalStudents: 87,
    experience: "6+ years",
  },
  {
    id: "coach-4",
    name: "Robert Kim",
    sport: "Baseball",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "8.1K",
    rating: 4.8,
    specialty: "Pitching Mechanics",
    bio: "Former MLB pitcher turned pitching coach with focus on biomechanics.",
    location: "Arizona, USA",
    achievements: ["MLB Player", "Pitching Coach Certified"],
    isVerified: true,
    subscriptionPrice: 38.99,
    responseRate: "97%",
    totalStudents: 112,
    experience: "14+ years",
  },
  {
    id: "athlete-5",
    name: "Tyler Brooks",
    sport: "Wrestling",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "4.9K",
    rating: 4.5,
    specialty: "Takedown Techniques",
    bio: "NCAA Division I wrestler specializing in takedown and ground control.",
    location: "Iowa, USA",
    university: "University of Iowa",
    achievements: ["NCAA All-American", "State Champion"],
    isVerified: true,
    subscriptionPrice: 26.99,
    responseRate: "89%",
    totalStudents: 76,
    experience: "4+ years",
  },
  {
    id: "coach-5",
    name: "Amanda Foster",
    sport: "Gymnastics",
    type: "coach" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "7.6K",
    rating: 4.9,
    specialty: "Floor Routines",
    bio: "Former Olympic gymnast now coaching elite level floor and vault routines.",
    location: "Colorado, USA",
    achievements: ["Olympic Competitor", "National Team Coach"],
    isVerified: true,
    subscriptionPrice: 42.99,
    responseRate: "98%",
    totalStudents: 145,
    experience: "16+ years",
  },
  {
    id: "athlete-6",
    name: "Kevin Park",
    sport: "Golf",
    type: "athlete" as const,
    avatar: "/placeholder.svg?height=80&width=80",
    followers: "6.3K",
    rating: 4.7,
    specialty: "Short Game",
    bio: "Professional golfer specializing in short game and course management.",
    location: "Florida, USA",
    achievements: ["PGA Tour Player", "College Champion"],
    isVerified: true,
    subscriptionPrice: 35.99,
    responseRate: "93%",
    totalStudents: 91,
    experience: "9+ years",
  },
]

// All sports available
const allSports = [
  "All Sports",
  "Basketball",
  "Tennis",
  "Swimming",
  "Soccer",
  "Track & Field",
  "Football",
  "Volleyball",
  "Baseball",
  "Wrestling",
  "Gymnastics",
  "Golf",
  "Softball",
  "Cross Country",
  "Lacrosse",
  "Hockey",
  "Water Polo",
  "Rowing",
  "Cycling",
  "Martial Arts",
]

const creatorTypes = ["All Types", "Athletes", "Coaches", "Mentors"]

/**
 * Debounced, controlled SearchBar component with custom UI
 */
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export function SearchBar({ value = "", onSearch, delay = 300, placeholder = "Search creators, sports, specialties..." }: {
  value?: string;
  onSearch: (term: string) => void;
  delay?: number;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedInput = useDebounce(inputValue, delay);
  const isFirstRun = useRef(true);

  // Sync with external value (e.g., when clearing filters)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search callback
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onSearch(debouncedInput);
  }, [debouncedInput, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
      />
    </div>
  );
}

export default function MemberBrowsePageWrapper() {
  // ← these hooks never get remounted
  const [selectedSport, setSelectedSport] = useState("All Sports")
  const [selectedType, setSelectedType] = useState("All Types")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("rating")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <MemberBrowsePage
      selectedSport={selectedSport}
      setSelectedSport={setSelectedSport}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      sortBy={sortBy}
      setSortBy={setSortBy}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  )
}

function MemberBrowsePage({
  selectedSport,
  setSelectedSport,
  selectedType,
  setSelectedType,
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
}: {
  selectedSport: string
  setSelectedSport: (sport: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  sortBy: string
  setSortBy: (sort: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount } = useMemberNotifications()
  const { isFollowing, isSubscribed, followCreator, unfollowCreator, subscribeToCreator } = useMemberSubscriptions()

  // Filter creators (now includes search filtering)
  const filteredCreators = useMemo(() => {
    let filtered = mockCreators

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((creator) => 
        creator.name.toLowerCase().includes(searchLower) ||
        creator.sport.toLowerCase().includes(searchLower) ||
        creator.specialty.toLowerCase().includes(searchLower) ||
        creator.bio.toLowerCase().includes(searchLower) ||
        creator.location.toLowerCase().includes(searchLower) ||
        (creator.university && creator.university.toLowerCase().includes(searchLower))
      )
    }

    // Filter by sport
    if (selectedSport !== "All Sports") {
      filtered = filtered.filter((creator) => creator.sport === selectedSport)
    }

    // Filter by type
    if (selectedType !== "All Types") {
      const typeMap = { Athletes: "athlete", Coaches: "coach", Mentors: "mentor" }
      filtered = filtered.filter((creator) => creator.type === typeMap[selectedType as keyof typeof typeMap])
    }

    // Create a copy before sorting to avoid mutating the original array
    const sortedCreators = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "followers":
          return (
            Number.parseInt(b.followers.replace("K", "000").replace(".", "")) -
            Number.parseInt(a.followers.replace("K", "000").replace(".", ""))
          )
        case "price":
          return a.subscriptionPrice - b.subscriptionPrice
        case "students":
          return b.totalStudents - a.totalStudents
        default:
          return 0
      }
    })

    return sortedCreators
  }, [selectedSport, selectedType, sortBy, searchTerm])

  const handleFollowToggle = useCallback(
    (creator: any) => {
      if (isFollowing(creator.id)) {
        unfollowCreator(creator.id)
      } else {
        followCreator(creator)
      }
    },
    [isFollowing, followCreator, unfollowCreator],
  )

  const handleSubscribe = useCallback(
    (creator: any) => {
      subscribeToCreator(creator)
    },
    [subscribeToCreator],
  )

  const clearFilters = useCallback(() => {
    setSelectedSport("All Sports")
    setSelectedType("All Types")
    setSortBy("rating")
    setSearchTerm("")
  }, [setSelectedSport, setSelectedType, setSortBy, setSearchTerm])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [setSearchTerm])

  // Memoize MainContent to prevent recreation on every render
  const MainContent = useMemo(() => () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/member-home">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900">Browse Creators</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search creators by name, sport, specialty, or location..."
            delay={300}
            value={searchTerm}
          />
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sport Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedSport}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 max-h-64 overflow-y-auto">
                {allSports.map((sport) => (
                  <DropdownMenuItem key={sport} onClick={() => setSelectedSport(sport)}>
                    {sport}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200">
                  {selectedType}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {creatorTypes.map((type) => (
                  <DropdownMenuItem key={type} onClick={() => setSelectedType(type)}>
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Sort by{" "}
                  {sortBy === "rating"
                    ? "Rating"
                    : sortBy === "followers"
                      ? "Followers"
                      : sortBy === "price"
                        ? "Price"
                        : "Students"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("followers")}>Most Followers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price")}>Lowest Price</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("students")}>Most Students</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {(selectedSport !== "All Sports" || selectedType !== "All Types" || sortBy !== "rating" || searchTerm) && (
              <Button variant="ghost" onClick={clearFilters} className="text-gray-600 hover:text-gray-900">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? "s" : ""} found
            {searchTerm && (
              <span className="ml-2">
                for "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </div>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <Card
              key={creator.id}
              className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Creator Header */}
                  <div className="flex items-start space-x-4">
                    <Link href={`/creator/${creator.id}`}>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden hover:ring-2 hover:ring-prologue-electric/30 transition-all cursor-pointer">
                          <User className="w-full h-full text-gray-500 p-3" />
                        </div>
                        {creator.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-prologue-electric rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white fill-current" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/creator/${creator.id}`}>
                        <h3 className="text-lg font-bold text-gray-900 hover:text-prologue-electric transition-colors cursor-pointer truncate">
                          {creator.name}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {creator.sport}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {creator.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{creator.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{creator.followers}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="space-y-3">
                    <p className="text-gray-700 text-sm line-clamp-2">{creator.bio}</p>

                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{creator.location}</span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Specialty:</span> {creator.specialty}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{creator.totalStudents} students</span>
                      <span className="font-bold text-prologue-electric">${creator.subscriptionPrice}/mo</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => handleFollowToggle(creator)}
                      variant={isFollowing(creator.id) ? "secondary" : "outline"}
                      size="sm"
                      className={`flex-1 transition-all duration-200 ${
                        isFollowing(creator.id)
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "hover:bg-prologue-electric hover:text-white border-prologue-electric text-prologue-electric"
                      }`}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {isFollowing(creator.id) ? "Following" : "Follow"}
                    </Button>

                    {isSubscribed(creator.id) ? (
                      <Button size="sm" className="flex-1 bg-prologue-fire text-white hover:bg-prologue-fire/90">
                        <Crown className="h-4 w-4 mr-1" />
                        Subscribed
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(creator)}
                        size="sm"
                        className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCreators.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No creators found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No creators match your search for "${searchTerm}". Try adjusting your search terms or filters.`
                : "Try adjusting your filters to find more creators."
              }
            </p>
            <Button onClick={clearFilters} className="bg-prologue-electric hover:bg-prologue-blue text-white">
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  ), [selectedSport, selectedType, sortBy, searchTerm, filteredCreators, handleFollowToggle, handleSubscribe, clearFilters, isFollowing, isSubscribed])

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/member-browse"
        showBottomNav={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={false}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return <MainContent />
} 