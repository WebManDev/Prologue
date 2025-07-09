"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Video,
  FileText,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Eye,
  ChevronDown,
  TrendingUp,
  X,
  Home,
  MessageCircle,
  MessageSquare,
  Filter,
  Grid3X3,
  List,
  Compass,
  Lock,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth, getMemberProfile } from "@/lib/firebase"
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Image from "next/image"
import { doc, getDoc } from "firebase/firestore"

export default function MemberTrainingPage() {
  console.log("[DEBUG] MemberTrainingPage mounted")
  
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // Unified logout hook
  const { logout } = useUnifiedLogout()

  // Contexts
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent, markTrainingAsVisited } =
    useMemberNotifications()

  // State management
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Firebase state
  const [articles, setArticles] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [creators, setCreators] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  // Mark training as visited on mount
  useEffect(() => {
    if (hasNewTrainingContent) {
      markTrainingAsVisited()
    }
  }, [hasNewTrainingContent, markTrainingAsVisited])

  // Quick search suggestions
  const quickSearches = [
    "Basketball Training",
    "Mental Performance",
    "Nutrition",
    "Injury Prevention",
    "Strength Training",
    "Sports Psychology",
    "Elite Fundamentals",
    "Competition Prep",
  ]

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchFocus = () => {
    setShowSearchDropdown(true)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }

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

  // Search dropdown content
  const searchDropdownContent = (
    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
        <div className="space-y-1">
          {quickSearches.map((search, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
              onClick={() => {
                setSearchQuery(search)
                setShowSearchDropdown(false)
              }}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

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
      setCreators({})
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribes: (() => void)[] = []

    function listenToBatch(
      ids: string[],
      collectionName: "articles" | "videos" | "courses",
      setter: React.Dispatch<any[]>
    ) {
      // Fetch all documents in the collection, no filter
      const q = query(collection(db, collectionName))
      const unsub = onSnapshot(q, (snap) => {
        setter(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      }, (err) => {
        console.error("Listen error:", err)
        setError(`Failed to load ${collectionName}`)
        setLoading(false)
      })
      unsubscribes.push(unsub)
    }

    for (let i = 0; i < athleteIds.length; i += 10) {
      const batch = athleteIds.slice(i, i + 10)
      listenToBatch(batch, "articles", setArticles)
      listenToBatch(batch, "videos", setVideos)
      listenToBatch(batch, "courses", setCourses)
    }

    // Fetch creator profiles from 'athletes' collection
    async function fetchCreators() {
      try {
        const newCreators: {[key: string]: any} = {}
        await Promise.all(
          athleteIds.map(async (id: string) => {
            const docRef = doc(db, "athletes", id)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
              newCreators[id] = { id, ...docSnap.data() }
            }
          })
        )
        setCreators(newCreators)
      } catch (err) {
        console.error("Error fetching creator profiles:", err)
        setError("Failed to load creator profiles")
      }
    }
    fetchCreators()

    return () => {
      unsubscribes.forEach(u => u())
    }
  }, [athleteIds])

  // Fetch only content from subscribed creators (authorId in athleteIds)
  useEffect(() => {
    if (!athleteIds.length) {
      setArticles([])
      setVideos([])
      setCourses([])
      setLoading(false)
      return
    }
    setLoading(true)
    async function fetchContent() {
      try {
        // Firestore 'in' queries support up to 10 values, so batch if needed
        let allVideos: any[] = []
        let allArticles: any[] = []
        let allCourses: any[] = []
        for (let i = 0; i < athleteIds.length; i += 10) {
          const batch = athleteIds.slice(i, i + 10)
          const videosSnap = await getDocs(query(collection(db, "videos"), where("authorId", "in", batch), orderBy("createdAt", "desc")))
          const articlesSnap = await getDocs(query(collection(db, "articles"), where("authorId", "in", batch), orderBy("createdAt", "desc")))
          const coursesSnap = await getDocs(query(collection(db, "courses"), where("authorId", "in", batch), orderBy("createdAt", "desc")))
          allVideos = allVideos.concat(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "video" })))
          allArticles = allArticles.concat(articlesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "article" })))
          allCourses = allCourses.concat(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "course" })))
        }
        setVideos(allVideos)
        setArticles(allArticles)
        setCourses(allCourses)
      } catch (err) {
        console.error("Error fetching content:", err)
        setError("Failed to load content")
      }
      setLoading(false)
    }
    fetchContent()
  }, [athleteIds])

  // Fetch all content from Firestore (like content page)
  useEffect(() => {
    setLoading(true)
    async function fetchContent() {
      try {
        const videosSnap = await getDocs(query(collection(db, "videos"), orderBy("createdAt", "desc")))
        const articlesSnap = await getDocs(query(collection(db, "articles"), orderBy("createdAt", "desc")))
        const coursesSnap = await getDocs(query(collection(db, "courses"), orderBy("createdAt", "desc")))
        setVideos(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "video" })))
        setArticles(articlesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "article" })))
        setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "course" })))
      } catch (err) {
        console.error("Error fetching content:", err)
        setError("Failed to load content")
      }
      setLoading(false)
    }
    fetchContent()
  }, [])

  // Author profile cache (like content page)
  const [authorProfiles, setAuthorProfiles] = useState<{ [uid: string]: { firstName?: string; lastName?: string } }>({});
  const fetchAuthorProfile = async (uid: string) => {
    if (!uid || authorProfiles[uid]) return;
    const docRef = doc(db, "athletes", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setAuthorProfiles(prev => ({ ...prev, [uid]: { firstName: data.firstName || "", lastName: data.lastName || "" } }));
    } else {
      setAuthorProfiles(prev => ({ ...prev, [uid]: { firstName: "Unknown", lastName: "" } }));
    }
  };

  // Helper function to get creator info
  const getCreatorInfo = (creatorId: string) => {
    return creators[creatorId] || { firstName: "Unknown", lastName: "Creator" }
  }

  // Helper function to format dates
  const formatDate = (date: any) => {
    if (!date) return "Recently"
    const d = date instanceof Date ? date : date?.toDate ? date.toDate() : new Date(date)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  // Handle content click
  const handleContentClick = (type: string, id: string, creatorId: string) => {
    // Navigate to the appropriate content page
    window.location.href = `/${type}/${id}`
  }

  // All combined content for display
  const allContent = useMemo(() => [...articles, ...videos, ...courses], [articles, videos, courses])

  // Filter content based on active tab and search
  const filteredContent = useMemo(() => {
    let content =
      activeTab === "all"
        ? allContent
        : activeTab === "videos"
          ? videos.map((item) => ({ ...item, type: "video" }))
          : activeTab === "articles"
            ? articles.map((item) => ({ ...item, type: "article" }))
            : courses.map((item) => ({ ...item, type: "course" }))

    // Only show content from creators with active subscriptions
    content = content.filter((item) => {
      if (!item.authorId) return false
      return hasContentAccess(item.authorId, 'training')
    })

    if (selectedFilter !== "all") {
      if (selectedFilter === "enrolled" && activeTab === "courses") {
        content = content.filter((item: any) => item.isEnrolled)
      } else if (selectedFilter === "completed" && activeTab === "courses") {
        content = content.filter((item: any) => item.progress === 100)
      } else if (selectedFilter === "in-progress" && activeTab === "courses") {
        content = content.filter((item: any) => item.progress > 0 && item.progress < 100)
      }
    }

    if (searchQuery) {
      content = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return content
  }, [activeTab, selectedFilter, searchQuery, allContent, hasContentAccess])

  // Helper function to sanitize and convert HTML to plain text
  function sanitizeDescription(html: string) {
    if (!html) return "No description."
    // Remove HTML tags and decode entities
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || "No description."
  }

  const ContentCard = ({ item }: { item: any }) => {
    // Fetch author profile on mount
    useEffect(() => {
      if (item.authorId) fetchAuthorProfile(item.authorId);
    }, [item.authorId]);
    const author = item.authorId && authorProfiles[item.authorId]
      ? `${authorProfiles[item.authorId].firstName || ""} ${authorProfiles[item.authorId].lastName || ""}`.trim()
      : "";

    const getContentLink = () => {
      switch (item.type) {
        case "video":
          return `/video/${item.id}`
        case "article":
          return `/article/${item.id}`
        case "course":
          return `/course/${item.id}`
        default:
          return "#"
      }
    }

    const getContentIcon = () => {
      switch (item.type) {
        case "video":
          return <Video className="h-4 w-4" />
        case "article":
          return <FileText className="h-4 w-4" />
        case "course":
          return <BookOpen className="h-4 w-4" />
        default:
          return null
      }
    }

    const getActionButton = () => {
      if (item.type === "course") {
        if (item.isEnrolled) {
          if (item.progress === 100) {
            return (
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
              >
                Completed
              </Button>
            )
          } else if (item.progress > 0) {
            return (
              <Button size="sm" className="bg-prologue-electric hover:bg-prologue-blue text-white">
                Continue
              </Button>
            )
          } else {
            return (
              <Button size="sm" className="bg-prologue-electric hover:bg-prologue-blue text-white">
                Start
              </Button>
            )
          }
        } else {
          return (
            <Button
              size="sm"
              variant="outline"
              className="border-prologue-electric text-prologue-electric hover:bg-prologue-electric hover:text-white bg-transparent"
            >
              Enroll
            </Button>
          )
        }
      }
      return (
        <Button size="sm" className="bg-prologue-electric hover:bg-prologue-blue text-white">
          View
        </Button>
      )
    }

    const creator = getCreatorInfo(item.createdBy)

    return (
      <Card className={`hover:shadow-lg transition-shadow`}>
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
              {item.type === "article" ? (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-white" />
                </div>
              ) : item.type === "video" && item.videoUrl ? (
                <video src={item.videoUrl} className="w-full h-full object-cover" />
              ) : item.type === "course" && item.coverImage ? (
                <Image 
                  src={item.coverImage} 
                  alt={item.title} 
                  width={300} 
                  height={200} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <Play className="h-12 w-12 text-gray-600" />
                </div>
              )}
              
            </div>
            <Badge className="absolute top-3 left-3 flex items-center space-x-1 bg-prologue-electric text-white">
              {getContentIcon()}
              <span className="capitalize">{item.type}</span>
            </Badge>
            {item.type === "video" && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {item.duration || "10:30"}
              </div>
            )}
            {item.type === "course" && item.isEnrolled && (
              <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs">Enrolled</div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-prologue-electric flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {creator.firstName ? creator.firstName.charAt(0) : "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {creator.firstName} {creator.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{author || "Creator"}</p>
                </div>
              </div>
              <Link href={getContentLink()}>
                <Button size="sm" variant="ghost" className="p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <Link href={getContentLink()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-prologue-electric transition-colors">
                {item.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {item.description ? sanitizeDescription(item.description) : "No description available."}
            </p>
            
            {/* Content metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
              {item.type === "video" && (
                <>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{item.duration || "10:30"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{item.views || 0} views</span>
                  </div>
                </>
              )}
              {item.type === "article" && (
                <>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{item.readTime || "5 min read"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{item.reads || 0} reads</span>
                  </div>
                </>
              )}
              {item.type === "course" && (
                <>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{item.lessons?.length || item.sessions || 0} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{item.participants || 0} enrolled</span>
                  </div>
                  {item.isEnrolled && item.progress > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-prologue-electric font-medium">
                        {item.progress || 0}% complete
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Action button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{item.rating || "4.5"}</span>
                <Badge variant="outline" className="ml-2 text-xs border-prologue-electric text-prologue-electric">
                  {item.category || "Training"}
                </Badge>
              </div>
              {getActionButton()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MemberHeader
        currentPath="/member-training"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        onLogout={logout}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Content</h1>
          <p className="text-gray-600">Explore videos, articles, and courses to enhance your athletic performance</p>
        </div>

        {/* Filters and Search */}
        <div className={`flex items-center justify-between mb-8 ${isMobile ? "flex-col space-y-4" : ""}`}>
          <div className={`${isMobile ? "w-full" : "flex-1"} flex justify-center`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>All</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </TabsTrigger>
                <TabsTrigger value="articles" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Articles</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Courses</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className={`flex items-center space-x-3 ${isMobile ? "w-full" : ""}`}>
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

            {activeTab === "courses" && (
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
                  <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Courses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("enrolled")}>Enrolled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("in-progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>Completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className={`relative ${isMobile ? "flex-1" : ""}`} ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className={`pl-10 ${isMobile ? "w-full" : "w-64"} bg-white`}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showSearchDropdown && searchDropdownContent}
            </div>

            <Link href="/member-browse">
              <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                <Compass className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Discover</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prologue-electric mx-auto mb-4"></div>
              <p className="text-gray-600">Loading training content...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading content</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredContent.length > 0 ? (
          viewMode === "grid" ? (
            <div
              className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"} gap-6`}
            >
              {filteredContent.map((item) => (
                <ContentCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.type === "article" ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                        ) : item.type === "video" && item.videoUrl ? (
                          <video src={item.videoUrl} className="w-full h-full object-cover" />
                        ) : item.type === "course" && item.coverImage ? (
                          <Image 
                            src={item.coverImage} 
                            alt={item.title} 
                            width={96} 
                            height={64} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <Play className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className="bg-prologue-electric text-white text-xs flex items-center space-x-1">
                                {item.type === "video" && <Video className="h-3 w-3" />}
                                {item.type === "article" && <FileText className="h-3 w-3" />}
                                {item.type === "course" && <BookOpen className="h-3 w-3" />}
                                <span className="capitalize">{item.type}</span>
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs border-prologue-electric text-prologue-electric"
                              >
                                {item.category || "Training"}
                              </Badge>
                            </div>
                            <Link href={`/${item.type}/${item.id}`}>
                              <h3 className="font-semibold text-gray-900 mb-1 hover:text-prologue-electric transition-colors">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600">{getCreatorInfo(item.createdBy).firstName} {getCreatorInfo(item.createdBy).lastName}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{item.rating || "4.5"}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3 line-clamp-1">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {item.type === "video" && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{item.duration || "10:30"}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{item.views || 0}</span>
                                </div>
                              </>
                            )}
                            {item.type === "article" && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{item.readTime || "5 min read"}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{item.views || 0}</span>
                                </div>
                              </>
                            )}
                            {item.type === "course" && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{item.lessons?.length || item.sessions || 0} lessons</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{item.participants || 0}</span>
                                </div>
                                {item.isEnrolled && item.progress > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-prologue-electric font-medium">
                                      {item.progress || 0}% complete
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/${item.type}/${item.id}`}>
                              <Button size="sm" className="bg-prologue-electric hover:bg-prologue-blue text-white">
                                {item.type === "course" && item.isEnrolled
                                  ? item.progress === 100
                                    ? "Review"
                                    : item.progress > 0
                                      ? "Continue"
                                      : "Start"
                                  : item.type === "course"
                                    ? "Enroll"
                                    : "View"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              {athleteIds.length === 0 ? (
                <BookOpen className="h-10 w-10 text-gray-400" />
              ) : (
                <Search className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {athleteIds.length === 0 ? "No Training Content Available" : "No content found"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {athleteIds.length === 0 
                ? "You don't have any active subscriptions. Subscribe to creators to access their training content, courses, and exclusive materials."
                : searchQuery 
                  ? `No content matches "${searchQuery}". Try a different search term.`
                  : "No content available for the selected filters."
              }
            </p>
            {athleteIds.length === 0 ? (
              <Link href="/member-browse">
                <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                  Browse Creators
                </Button>
              </Link>
            ) : searchQuery ? (
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => setSelectedFilter("all")} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}
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
    </div>
  )
}
