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
import { getDocs, collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { auth } from "@/lib/firebase"

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

// --- AthleteBrowseCard: Screenshot UI ---
function AthleteBrowseCard({
  athlete,
  isSubscribed,
  onSubscribe,
  onUnsubscribe,
  onViewProfile,
}: {
  athlete: any
  isSubscribed: (id: string) => boolean
  onSubscribe: (id: string) => void
  onUnsubscribe: (id: string) => void
  onViewProfile: (athlete: any) => void
}) {
  const router = useRouter();
  return (
    <Card className="w-[320px] mx-auto rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden">
      {/* Cover + Avatar */}
      <div className="relative h-32 bg-gradient-to-r from-gray-200 to-gray-300">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 right-3">
          {athlete.isVerified && (
            <Badge className="bg-blue-500 text-white text-xs px-2 py-1 flex items-center gap-1 rounded-md">
              <Verified className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs">
          <MapPin className="h-3 w-3" />
          <span>{athlete.location}</span>
        </div>
        {/* Avatar Overlapping Cover */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-1.75rem] z-10">
          <div className="w-14 h-14 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
            <User className="h-7 w-7 text-gray-400" />
          </div>
        </div>
      </div>
      {/* Main */}
      <CardContent className="pt-10 px-4 pb-4">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-gray-900 text-base leading-tight">{athlete.name}</span>
              <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize border-gray-300 bg-gray-50 text-gray-700 rounded-md">
                {athlete.type}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mb-0.5">{athlete.sport}</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{athlete.rating}</span>
              <span className="mx-1">·</span>
              <span>{athlete.followers} followers</span>
            </div>
          </div>
        </div>
        {/* Specialty & Bio */}
        <div className="text-center mt-1 mb-2">
          <div className="text-sm font-medium text-blue-600 mb-0.5">{athlete.specialty}</div>
          <div className="text-xs text-gray-500 line-clamp-2 leading-snug">{athlete.bio}</div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 text-center text-xs bg-gray-50 rounded-lg py-2 mb-2">
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">{athlete.totalStudents}</div>
            <div className="text-gray-500">Students</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">{athlete.responseRate}</div>
            <div className="text-gray-500">Response</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">{athlete.experience}</div>
            <div className="text-gray-500">Experience</div>
          </div>
        </div>
        {/* Achievement */}
        {athlete.achievements && athlete.achievements.length > 0 && (
          <div className="flex justify-center mb-2">
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 px-2 py-1 flex items-center gap-1 rounded-md">
              <Trophy className="h-3 w-3" />
              {athlete.achievements[0]}
            </Badge>
          </div>
        )}
        {/* Pricing & Actions */}
        <div className="flex flex-col gap-2">
          <div className="text-center mb-1">
            <span className="text-2xl font-bold text-gray-900">${athlete.subscriptionPrice}</span>
            <span className="text-xs text-gray-500 ml-1">/month</span>
          </div>
          {isSubscribed(athlete.id) ? (
            <Button
              variant="outline"
              onClick={() => onUnsubscribe(athlete.id)}
              className="w-full text-blue-600 border-blue-500 hover:bg-blue-500 hover:text-white h-11 font-bold rounded-lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Subscribed
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/member-browse/subscription/${athlete.id}`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11 font-bold rounded-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewProfile(athlete)}
            className="w-full text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MemberDiscoverPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const {
    subscribedCreators,
    subscribeToCreator,
    unsubscribeFromCreator,
    isFollowing,
    followCreator,
    unfollowCreator,
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
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [athletes, setAthletes] = useState(CREATORS)
  const [subscriptions, setSubscriptions] = useState<{[athleteId: string]: any}>({})

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
      if (selectedSport !== "all" && athlete.sport !== selectedSport) return false;
      // Type filter
      if (selectedType !== "all" && athlete.type !== selectedType) return false;
      // Rating filter
      if (selectedRating !== "all") {
        const minRating = Number.parseFloat(selectedRating);
        if (athlete.rating < minRating) return false;
      }
      // Price filter
      if (selectedPrice !== "all") {
        const price = athlete.subscriptionPrice;
        switch (selectedPrice) {
          case "under-25":
            if (price >= 25) return false;
            break;
          case "25-40":
            if (price < 25 || price > 40) return false;
            break;
          case "over-40":
            if (price <= 40) return false;
            break;
        }
      }
      // Experience filter
      if (selectedExperience !== "all" && athlete.experience !== selectedExperience) return false;
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!(
          athlete.name.toLowerCase().includes(query) ||
          athlete.sport.toLowerCase().includes(query) ||
          athlete.specialty.toLowerCase().includes(query) ||
          athlete.bio.toLowerCase().includes(query) ||
          athlete.location.toLowerCase().includes(query)
        )) {
          return false;
        }
      }
      // NEW: Hide if already subscribed (array version)
      if (Array.isArray(subscriptions) && subscriptions.includes(athlete.id)) return false;
      return true;
    });
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price":
          return a.subscriptionPrice - b.subscriptionPrice;
        case "students":
          return b.totalStudents - a.totalStudents;
        case "newest":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default:
          return 0;
      }
    });
    return filtered;
  }, [selectedSport, selectedType, selectedRating, selectedPrice, selectedExperience, searchQuery, sortBy, athletes, subscriptions]);

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

  const handleCreatorClick = useCallback((creator: (typeof CREATORS)[0]) => {
    router.push(`/creator/${creator.id}`);
  }, [router]);

  const handleSubscribeClick = useCallback((creator: (typeof CREATORS)[0]) => {
    setSubscriptionDialogOpen(true)
  }, [])

  const moveAthleteToTop = (athleteId: string) => {
    setAthletes((prev) => {
      const idx = prev.findIndex((a: any) => a.id === athleteId);
      if (idx === -1) return prev;
      const updated = [...prev];
      const [athlete] = updated.splice(idx, 1);
      return [athlete, ...updated];
    });
  };

  const fetchSubscriptions = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSubscriptions(userData.subscriptions || {});
      }
    }
  };

  const handleConfirmSubscription = useCallback(() => {
    setSubscriptionDialogOpen(false);
  }, [subscribeToCreator]);

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

  // Real-time listeners for athletes and subscriptions
  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for user subscriptions
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setSubscriptions(userData.subscriptions || {});
      }
    });

    // Real-time listener for athletes collection
    const athletesRef = collection(db, "athletes");
    const unsubscribeAthletes = onSnapshot(athletesRef, (snapshot) => {
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
      });
      
      // Merge fetched with static by id
      const merged = [
        ...fetched,
        ...CREATORS.filter(staticAthlete => !fetched.some(f => f.id === staticAthlete.id))
      ];
      setAthletes(merged);
    });

    // Real-time listener for member subscriptions
    const memberRef = doc(db, "members", auth.currentUser.uid);
    const unsubscribeMember = onSnapshot(memberRef, (doc) => {
      if (doc.exists()) {
        const memberData = doc.data();
        const memberSubscriptions = memberData.subscriptions || {};
        const subscriptionIds = Object.keys(memberSubscriptions).filter(
          key => memberSubscriptions[key]?.status === "active"
        );
        setSubscriptions(memberSubscriptions);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeAthletes();
      unsubscribeMember();
    };
  }, [auth.currentUser]);

  // Legacy fetch for initial load (fallback)
  // Real-time listeners for athletes and subscriptions
  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for athletes collection
    const athletesRef = collection(db, "athletes");
    const unsubscribeAthletes = onSnapshot(athletesRef, (snapshot) => {
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
      });
      
      // Merge fetched with static by id
      const merged = [
        ...fetched,
        ...CREATORS.filter(staticAthlete => !fetched.some(f => f.id === staticAthlete.id))
      ];
      setAthletes(merged);
    });

    // Real-time listener for member subscriptions
    const memberRef = doc(db, "members", auth.currentUser.uid);
    const unsubscribeMember = onSnapshot(memberRef, (doc) => {
      if (doc.exists()) {
        const memberData = doc.data();
        const memberSubscriptions = memberData.subscriptions || {};
        const subscriptionIds = Object.keys(memberSubscriptions).filter(
          key => memberSubscriptions[key]?.status === "active"
        );
        setSubscriptions(memberSubscriptions);
      }
    });

    return () => {
      unsubscribeAthletes();
      unsubscribeMember();
    };
  }, [auth.currentUser]);

  // Legacy fetch for initial load (fallback)
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

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const isSubscribed = (athleteId: string) => {
    return subscriptions[athleteId] && subscriptions[athleteId].status === "active";
  };

  // Filter Section Component
  const FilterSection = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full mb-4"
        >
          Clear All Filters
        </Button>
      </div>

      {/* Sport Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Sport</label>
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
        >
          <option value="all">All Sports</option>
          {availableSports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
        >
          <option value="all">All Types</option>
          <option value="athlete">Athlete</option>
          <option value="coach">Coach</option>
          <option value="mentor">Mentor</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Minimum Rating</label>
        <select
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
        >
          <option value="all">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
        </select>
      </div>

      {/* Price Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
        <select
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
        >
          <option value="all">Any Price</option>
          <option value="under-25">Under $25</option>
          <option value="25-40">$25 - $40</option>
          <option value="over-40">Over $40</option>
        </select>
      </div>

      {/* Experience Filter */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Experience Level</label>
        <select
          value={selectedExperience}
          onChange={(e) => setSelectedExperience(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
        >
          <option value="all">Any Experience</option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  ), [selectedSport, selectedType, selectedRating, selectedPrice, selectedExperience, availableSports, clearAllFilters]);

  // Athlete Card Component (Grid View)
  const AthleteCard = useCallback(
    ({ athlete }: { athlete: (typeof CREATORS)[0] }) => (
      <AthleteBrowseCard
        key={athlete.id}
        athlete={athlete}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribeClick}
        onUnsubscribe={unsubscribeFromCreator}
        onViewProfile={handleCreatorClick}
      />
    ),
    [handleSubscribeClick, unsubscribeFromCreator, handleCreatorClick, isSubscribed]
  );

  // Athlete List Item Component
  const AthleteListItem = useCallback(
    ({ athlete }: { athlete: (typeof CREATORS)[0] }) => (
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div
              className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:ring-4 hover:ring-prologue-electric/20 transition-all"
              onClick={() => handleCreatorClick(athlete)}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-900 text-lg cursor-pointer hover:text-prologue-electric transition-colors mb-1"
                    onClick={() => handleCreatorClick(athlete)}
                  >
                    {athlete.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {athlete.sport} • {athlete.location}
                    {athlete.university && <span className="text-gray-500"> • {athlete.university}</span>}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{athlete.bio}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 ml-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{athlete.rating}</p>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{athlete.totalStudents}</p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">${athlete.subscriptionPrice}</p>
                    <p className="text-xs text-gray-600">/month</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4">
                <Button
                  onClick={() => handleCreatorClick(athlete)}
                  className="bg-prologue-electric hover:bg-prologue-electric/90 text-white"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [handleCreatorClick]
  );

  // Subscription Dialog Component
  const SubscriptionDialog = useMemo(() => (
    <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            Get access to exclusive content, personalized training plans, and direct messaging.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-lg">Subscription</p>
            <p className="text-sm text-gray-600">Cancel anytime</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleConfirmSubscription}
              className="flex-1 bg-prologue-electric hover:bg-prologue-electric/90 text-white"
            >
              Confirm Subscription
            </Button>
            <Button
              variant="outline"
              onClick={() => setSubscriptionDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ), [subscriptionDialogOpen, handleConfirmSubscription]);

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
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
