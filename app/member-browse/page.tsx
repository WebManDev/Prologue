"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { MemberHeader } from "@/components/navigation/member-header"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock athletes data - Enhanced with more comprehensive athlete profiles
const mockAthletes = [
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

// Mock content data
const getCreatorContent = (creatorId: string, isSubscribed: boolean) => {
  const allContent = [
    {
      id: "1",
      title: "Perfect Serve Technique Breakdown",
      description: "Learn the fundamentals of a powerful and accurate tennis serve",
      type: "video",
      duration: "12:34",
      isPremium: false,
      thumbnail: "/placeholder.svg?height=200&width=300",
      views: 15420,
      likes: 892,
      publishedAt: "2 days ago",
    },
    {
      id: "2",
      title: "Mental Preparation for Big Matches",
      description: "Strategies to stay calm and focused during important competitions",
      type: "article",
      readTime: "8 min read",
      isPremium: false,
      thumbnail: "/placeholder.svg?height=200&width=300",
      views: 8934,
      likes: 567,
      publishedAt: "5 days ago",
    },
    {
      id: "3",
      title: "Advanced Serve Variations (Premium)",
      description: "Master kick serves, slice serves, and power serves with detailed analysis",
      type: "video",
      duration: "25:18",
      isPremium: true,
      thumbnail: "/placeholder.svg?height=200&width=300",
      views: 3421,
      likes: 234,
      publishedAt: "1 week ago",
    },
    {
      id: "4",
      title: "Personalized Training Plan Template (Premium)",
      description: "Downloadable training plan customized for your skill level",
      type: "download",
      isPremium: true,
      thumbnail: "/placeholder.svg?height=200&width=300",
      views: 2156,
      likes: 189,
      publishedAt: "2 weeks ago",
    },
  ]

  return allContent.filter((content) => !content.isPremium || isSubscribed)
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
    isSubscribed,
  } = useMemberSubscriptions()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()
  const router = useRouter();

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
  const [selectedCreator, setSelectedCreator] = useState<(typeof mockAthletes)[0] | null>(null)
  const [showCreatorProfile, setShowCreatorProfile] = useState(false)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)

  // Get unique sports and other filter options
  const availableSports = useMemo(() => {
    const sports = [...new Set(mockAthletes.map((athlete) => athlete.sport))]
    return sports.sort()
  }, [])

  const experienceLevels = ["1-3 years", "3-5 years", "5-8 years", "8+ years"]

  // Enhanced filtering logic
  const filteredAthletes = useMemo(() => {
    const filtered = mockAthletes.filter((athlete) => {
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
  }, [selectedSport, selectedType, selectedRating, selectedPrice, selectedExperience, searchQuery, sortBy])

  const handleUnsubscribe = useCallback(
    (athleteId: string) => {
      unsubscribeFromCreator(athleteId)
    },
    [unsubscribeFromCreator],
  )
  
  const handleCreatorClick = useCallback((creator: (typeof mockAthletes)[0]) => {
    window.location.href = `/creator/${creator.id}`
  }, [])

  const handleFollowToggle = useCallback(
    (creatorId: string) => {
      const creator = mockAthletes.find((a) => a.id === creatorId)
      if (!creator) return

      if (isFollowing(creatorId)) {
        unfollowCreator(creatorId)
      } else {
        followCreator(creator)
      }
    },
    [isFollowing, followCreator, unfollowCreator],
  )

  const handleSubscribeClick = useCallback((creatorId: string) => {
    router.push(`/member-browse/subscription/${creatorId}`)
  }, [router])

  const handleConfirmSubscription = useCallback(() => {
    if (selectedCreator) {
      subscribeToCreator(selectedCreator)
    }
    setSubscriptionDialogOpen(false)
  }, [selectedCreator, subscribeToCreator])

  const clearAllFilters = () => {
    setSelectedSport("all")
    setSelectedType("all")
    setSelectedRating("all")
    setSelectedPrice("all")
    setSelectedExperience("all")
    setSearchQuery("")
  }

  const hasActiveFilters =
    selectedSport !== "all" ||
    selectedType !== "all" ||
    selectedRating !== "all" ||
    selectedPrice !== "all" ||
    selectedExperience !== "all" ||
    searchQuery

  // Enhanced Athlete Card Component
  const AthleteCard = ({ athlete }: { athlete: (typeof mockAthletes)[0] }) => (
    <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-prologue-electric/30 group">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            {athlete.isVerified && (
              <Badge className="bg-prologue-electric text-white text-xs">
                <Verified className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
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

        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-4 border-white -mt-8 relative z-10 cursor-pointer hover:ring-2 hover:ring-prologue-electric transition-all"
                onClick={() => handleCreatorClick(athlete)}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3
                    className="font-semibold text-gray-900 text-lg cursor-pointer hover:text-prologue-electric transition-colors"
                    onClick={() => handleCreatorClick(athlete)}
                  >
                    {athlete.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {athlete.sport}
                    </Badge>
                    {athlete.university && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {athlete.university}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{athlete.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">{athlete.followers} followers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio and Specialty */}
          <div className="mb-4">
            <p className="text-sm font-medium text-prologue-electric mb-1">{athlete.specialty}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{athlete.bio}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{athlete.totalStudents}</p>
              <p className="text-xs text-gray-600">Students</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{athlete.responseRate}</p>
              <p className="text-xs text-gray-600">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{athlete.experience}</p>
              <p className="text-xs text-gray-600">Experience</p>
            </div>
          </div>

          {/* Recent Activity */}
          {athlete.recentActivity && athlete.recentActivity.length > 0 && (
            <div className="mb-4 p-3 bg-prologue-electric/5 rounded-lg border border-prologue-electric/20">
              <h4 className="text-sm font-medium text-prologue-electric mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {athlete.recentActivity.slice(0, 1).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-prologue-electric/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === "video" ? (
                        <Play className="h-3 w-3 text-prologue-electric" />
                      ) : (
                        <MessageSquare className="h-3 w-3 text-prologue-electric" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{activity.title}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{activity.timestamp}</span>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{activity.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
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
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Achievements</h4>
              <div className="flex flex-wrap gap-1">
                {athlete.achievements.slice(0, 2).map((achievement, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    {achievement}
                  </Badge>
                ))}
                {athlete.achievements.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{athlete.achievements.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Pricing and Action */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-lg font-bold text-gray-900">${athlete.subscriptionPrice}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-prologue-electric">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-prologue-electric">
                <Share2 className="h-4 w-4" />
              </Button>
              {isSubscribed(athlete.id) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnsubscribe(athlete.id)}
                  className="text-prologue-electric border-prologue-electric hover:bg-prologue-electric hover:text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Subscribed
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleSubscribeClick(athlete.id)}
                  className="bg-prologue-electric hover:bg-prologue-blue text-white"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Subscribe
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Enhanced List View Component
  const AthleteListItem = ({ athlete }: { athlete: (typeof mockAthletes)[0] }) => (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-prologue-electric transition-all"
              onClick={() => handleCreatorClick(athlete)}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-600" />
              </div>
            </div>
            {athlete.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-prologue-electric rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3
                  className="font-semibold text-gray-900 text-lg mb-1 cursor-pointer hover:text-prologue-electric transition-colors"
                  onClick={() => handleCreatorClick(athlete)}
                >
                  {athlete.name}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {athlete.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {athlete.sport}
                  </Badge>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{athlete.location}</span>
                </div>
                <p className="text-sm font-medium text-prologue-electric mb-1">{athlete.specialty}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{athlete.bio}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{athlete.rating}</span>
                  <span className="text-sm text-gray-500">({athlete.totalStudents} students)</span>
                </div>
                <p className="text-sm text-gray-500">{athlete.followers} followers</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>{athlete.responseRate} response</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{athlete.avgSessionLength}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{athlete.experience}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">${athlete.subscriptionPrice}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                {isSubscribed(athlete.id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsubscribe(athlete.id)}
                    className="text-prologue-electric border-prologue-electric hover:bg-prologue-electric hover:text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Subscribed
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSubscribeClick(athlete.id)}
                    className="bg-prologue-electric hover:bg-prologue-blue text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
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

  // Enhanced Filter Section
  const FilterSection = () => (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-prologue-electric">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Sport Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  {selectedType === "all" ? "All Types" : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  {selectedExperience === "all" ? "Any Experience" : selectedExperience}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setSelectedExperience("all")}>Any Experience</DropdownMenuItem>
                {experienceLevels.map((level) => (
                  <DropdownMenuItem key={level} onClick={() => setSelectedExperience(level)}>
                    {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
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
  )

  // Creator Profile Modal
  // Subscription Dialog

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/member-discover"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
      >
        <div className="p-4 space-y-6">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search athletes, coaches, mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-0 focus:ring-2 focus:ring-prologue-electric/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Mobile Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Mobile Filters */}
              {showFilters && (
                <div className="space-y-4">
                  <FilterSection />
                </div>
              )}

              {/* Mobile Sort and View Controls */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} found
                </p>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-1" />
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
                    <Badge variant="secondary" className="bg-prologue-electric/10 text-prologue-electric">
                      Filtered
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mobile Athlete Cards */}
              <div className="space-y-4">
                {filteredAthletes.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>

              {filteredAthletes.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No athletes found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-4">
              <div className="grid gap-4">
                {filteredAthletes
                  .filter((athlete) => athlete.isVerified)
                  .slice(0, 6)
                  .map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <div className="grid gap-4">
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
              href="/member-discover"
              className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors"
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
        currentPath="/member-discover"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        onLogout={() => {}}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="browse">Browse All</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-3">
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

          <div className="grid grid-cols-12 gap-8">
            {/* Enhanced Sidebar Filters */}
            <div className="col-span-3">
              <FilterSection />
            </div>

            {/* Main Content Area */}
            <div className="col-span-9">
              <TabsContent value="browse" className="space-y-6">
                {/* Search and Results Header */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search athletes by name, sport, specialty, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border border-gray-200 focus:ring-2 focus:ring-prologue-electric/20 focus:border-prologue-electric"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} found
                    </p>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="bg-prologue-electric/10 text-prologue-electric">
                        Filtered Results
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Athletes Display */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAthletes.map((athlete) => (
                      <AthleteCard key={athlete.id} athlete={athlete} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAthletes.map((athlete) => (
                      <AthleteListItem key={athlete.id} athlete={athlete} />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {filteredAthletes.length === 0 && (
                  <div className="text-center py-16">
                    <User className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No athletes found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      We couldn't find any athletes matching your current filters. Try adjusting your search criteria.
                    </p>
                    <Button onClick={clearAllFilters} variant="outline" className="mr-4 bg-transparent">
                      Clear All Filters
                    </Button>
                    <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                      Browse All Athletes
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="featured" className="space-y-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAthletes
                      .filter((athlete) => athlete.isVerified)
                      .map((athlete) => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAthletes
                      .filter((athlete) => athlete.isVerified)
                      .map((athlete) => (
                        <AthleteListItem key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAthletes
                      .sort((a, b) => b.totalStudents - a.totalStudents)
                      .map((athlete) => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAthletes
                      .sort((a, b) => b.totalStudents - a.totalStudents)
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
    </div>
  )
}
