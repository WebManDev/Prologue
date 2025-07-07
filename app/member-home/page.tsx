"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  ChevronDown,
  LogOut,
  ThumbsUp,
  MessageSquare,
  Share,
  Search,
  X,
  Home,
  MessageCircle,
  Bell,
  BookOpen,
  LayoutDashboard,
  Lock,
  Crown,
  ImageIcon,
  MoreHorizontal,
  Play,
  Bookmark,
  Heart,
  Repeat2,
  Send,
  Camera,
  Video,
  Zap,
  Eye,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth, getMemberProfile, db, getAthleteProfile } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc, setDoc } from "firebase/firestore"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import LexicalRichTextEditor from "@/components/LexicalRichTextEditor"
import { formatDistanceToNow, parseISO } from "date-fns";

export default function MemberHomePage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // Contexts
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()
  const { getCreatorContent, getSubscribedContent, hasNewContent, hasNewSubscribedContent, markContentAsViewed } =
    useMemberSubscriptions()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [showNewContent, setShowNewContent] = useState(false)
  const [activeTab, setActiveTab] = useState<"feed" | "subscribed">("feed")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())

  const [selectedSpace, setSelectedSpace] = useState<any>(null)
  const [spaceDialogOpen, setSpaceDialogOpen] = useState(false)
  const [whoIsGoingDialogOpen, setWhoIsGoingDialogOpen] = useState(false)
  const [joinedSpaces, setJoinedSpaces] = useState<Set<string>>(new Set())

  const mockSpaces = useMemo(
    () => [
      {
        id: "space-1",
        title: "Morning Basketball Pickup",
        organizer: "Mike Chen",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Central Park Courts",
        time: "Tomorrow 8:00 AM",
        participants: 8,
        maxParticipants: 10,
        isPublic: true,
        sport: "Basketball",
        description: "Casual pickup game for all skill levels. Bring your own water!",
        attendees: ["Sarah M.", "Alex R.", "Jordan K.", "Emma D.", "Chris L.", "Maya P.", "Tyler W.", "Lisa C."],
      },
      {
        id: "space-2",
        title: "Tennis Training Session",
        organizer: "Sarah Martinez",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Riverside Tennis Club",
        time: "Today 6:00 PM",
        participants: 4,
        maxParticipants: 6,
        isPublic: false,
        sport: "Tennis",
        description: "Advanced tennis training focusing on serve technique and footwork.",
        attendees: ["Mike J.", "Alex K.", "Emma R.", "David L."],
      },
      {
        id: "space-3",
        title: "Swimming Workout Group",
        organizer: "Lisa Chen",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Aquatic Center Pool",
        time: "Friday 7:00 AM",
        participants: 6,
        maxParticipants: 8,
        isPublic: true,
        sport: "Swimming",
        description: "Early morning swim workout. All levels welcome. Pool entry fee required.",
        attendees: ["Jordan S.", "Maya T.", "Chris R.", "Tyler M.", "Emma K.", "Alex P."],
      },
      {
        id: "space-4",
        title: "Soccer Skills Training",
        organizer: "David Rodriguez",
        organizerAvatar: "/placeholder.svg?height=40&width=40",
        location: "Memorial Field",
        time: "Saturday 10:00 AM",
        participants: 12,
        maxParticipants: 16,
        isPublic: true,
        sport: "Soccer",
        description: "Technical skills training session focusing on ball control and passing.",
        attendees: [
          "Maria G.",
          "Carlos R.",
          "Sofia L.",
          "Diego M.",
          "Ana P.",
          "Luis K.",
          "Isabella R.",
          "Miguel S.",
          "Camila T.",
          "Roberto F.",
          "Lucia M.",
          "Fernando D.",
        ],
      },
    ],
    [],
  )

  // Trending topics
  const trendingTopics = useMemo(
    () => [
      { name: "College Recruitment", posts: "2.4K posts" },
      { name: "NIL Deals", posts: "1.8K posts" },
      { name: "Training Tips", posts: "3.2K posts" },
      { name: "Mental Health", posts: "1.5K posts" },
      { name: "Nutrition", posts: "2.1K posts" },
    ],
    [],
  )

  const handleSpaceClick = useCallback((space: any) => {
    setSelectedSpace(space)
    setSpaceDialogOpen(true)
  }, [])

  const handleJoinSpace = useCallback((spaceId: string) => {
    setJoinedSpaces((prev) => new Set([...prev, spaceId]))
    setSpaceDialogOpen(false)
  }, [])

  const handleRequestJoin = useCallback((spaceId: string) => {
    // Mock request functionality
    console.log("Requesting to join space:", spaceId)
    setSpaceDialogOpen(false)
  }, [])

  const handleWhoIsGoing = useCallback(() => {
    setWhoIsGoingDialogOpen(true)
  }, [])

  // Get content from subscriptions
  const followedContent = useMemo(() => getCreatorContent(), [getCreatorContent])
  const subscribedContent = useMemo(() => getSubscribedContent(), [getSubscribedContent])

  // Enhanced content with more variety and social media features
  const enhancedFeedContent = useMemo(() => {
    const baseContent = [...followedContent, ...subscribedContent]

    // Add variety of content types from creators
    const varietyContent = [
      {
        id: "variety-1",
        creatorId: "athlete-1",
        creatorName: "Sarah Martinez",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        type: "video" as const,
        title: "Morning Training Routine",
        content:
          "Starting my day with some serve practice and footwork drills. The key is consistency! 🎾 What's your morning routine looking like?",
        timestamp: "3 hours ago",
        likes: 234,
        comments: 18,
        shares: 12,
        views: 1240,
        isNew: true,
        isPremium: false,
        isRecommendation: false,
        media: {
          type: "video",
          thumbnail: "/placeholder.svg?height=300&width=400",
          duration: "2:45",
        },
      },
      {
        id: "variety-2",
        creatorId: "coach-1",
        creatorName: "Mike Johnson",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        type: "image" as const,
        title: "Mental Preparation Tips",
        content:
          "5 key strategies I use with my athletes before big competitions. Visualization is everything! 🧠💪 Save this post for your next big game.",
        timestamp: "6 hours ago",
        likes: 189,
        comments: 24,
        shares: 8,
        views: 892,
        isNew: false,
        isPremium: false,
        isRecommendation: false,
        media: {
          type: "image",
          thumbnail: "/placeholder.svg?height=300&width=400",
        },
      },
      {
        id: "variety-3",
        creatorId: "athlete-2",
        creatorName: "Alex Rodriguez",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: false,
        type: "blog" as const,
        title: "The Science Behind Perfect Shooting Form",
        content:
          "Breaking down the biomechanics of shooting - from foot placement to follow-through. This changed my game completely! 🏀 Link in bio for the full breakdown.",
        timestamp: "1 day ago",
        likes: 456,
        comments: 67,
        shares: 23,
        views: 2340,
        isNew: false,
        isPremium: true,
        isRecommendation: false,
      },
      {
        id: "variety-4",
        creatorId: "coach-2",
        creatorName: "Lisa Chen",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        type: "workout" as const,
        title: "Pool Workout: Building Endurance",
        content:
          "Today's training session focused on building cardiovascular endurance. 2000m mixed strokes! 🏊‍♀️ Drop your favorite pool workout below 👇",
        timestamp: "2 days ago",
        likes: 312,
        comments: 45,
        shares: 19,
        views: 1560,
        isNew: false,
        isPremium: true,
        isRecommendation: false,
        media: {
          type: "image",
          thumbnail: "/placeholder.svg?height=300&width=400",
        },
      },
    ]

    return [...baseContent, ...varietyContent].sort((a, b) => {
      // Sort by timestamp, with "new" content first
      if (a.isNew && !b.isNew) return -1
      if (!a.isNew && b.isNew) return 1
      return 0
    })
  }, [followedContent, subscribedContent])

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
        type: "athlete",
        name: "Alex Johnson",
        sport: "Tennis",
        school: "Miami Prep Academy",
        ranking: "#15 in state",
      },
      {
        type: "athlete",
        name: "Sarah Martinez",
        sport: "Soccer",
        school: "Elite Sports Academy",
        ranking: "#8 in region",
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
        result.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.creator?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return mockResults
  }, [searchQuery])

  // Social media interaction handlers
  const handleLike = useCallback(async (postId: string) => {
    const user = auth.currentUser
    if (!user) return
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    const likes = postSnap.data()?.likes || []
    if (likes.includes(user.uid)) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) })
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) })
    }
  }, [])

  const handleSave = useCallback((postId: string) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  const handleShare = useCallback((postId: string) => {
    // Mock share functionality
    console.log("Sharing post:", postId)
    // In a real app, this would open a share dialog
  }, [])

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
    console.log("Searching for:", search)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }, [])

  // Handle home visit
  useEffect(() => {
    if (hasNewContent || hasNewSubscribedContent) {
      setShowNewContent(true)
      // Mark content as viewed after a delay
      const timer = setTimeout(() => {
        markContentAsViewed()
        setShowNewContent(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [hasNewContent, hasNewSubscribedContent, markContentAsViewed])

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest(".mobile-menu")) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  // Optimized logout handler
  const { logout } = useUnifiedLogout()

  const [firebasePosts, setFirebasePosts] = useState<any[]>([])
  const [profileCache, setProfileCache] = useState<Record<string, any>>({})
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({})
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({})

  // Fetch posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snapshot) => {
      setFirebasePosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  // Fetch user profiles for posts
  useEffect(() => {
    const missingUids = firebasePosts
      .map(post => post.createdBy)
      .filter(uid => uid && !profileCache[uid])
    if (missingUids.length === 0) return
    missingUids.forEach(async (uid) => {
      let profile = null
      // Try member first
      profile = await getMemberProfile(uid)
      if (!profile) {
        profile = await getAthleteProfile(uid)
      }
      setProfileCache(prev => ({ ...prev, [uid]: profile }))
    })
  }, [firebasePosts])

  // Track post views (only once per user per post)
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    firebasePosts.forEach(async (item) => {
      if (!item.id) return
      const postRef = doc(db, "posts", item.id)
      const postSnap = await getDoc(postRef)
      const viewedBy = postSnap.data()?.viewedBy || []
      if (!viewedBy.includes(user.uid)) {
        await updateDoc(postRef, {
          views: (postSnap.data()?.views || 0) + 1,
          viewedBy: arrayUnion(user.uid),
        })
      }
    })
  }, [firebasePosts])

  // Listen for comments for each post
  useEffect(() => {
    firebasePosts.forEach((post) => {
      if (!post.id) return
      const commentsRef = collection(db, "posts", post.id, "comments")
      const q = query(commentsRef, orderBy("createdAt", "asc"))
      const unsub = onSnapshot(q, (snapshot) => {
        setComments((prev) => ({ ...prev, [post.id]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }))
      })
      return () => unsub()
    })
  }, [firebasePosts])

  // Memoized search dropdown content
  const searchDropdownContent = useMemo(() => {
    const displayItems = searchQuery ? searchResults : quickSearches.slice(0, 8)
    const isShowingResults = searchQuery && searchResults.length > 0
    const isShowingQuickSearches = !searchQuery

    return (
      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {isShowingResults ? `Results for "${searchQuery}"` : "Quick Searches"}
          </h4>
          <div className="space-y-1">
            {isShowingQuickSearches &&
              displayItems.map((search: string | { name?: string; title?: string }, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                  onClick={() => handleSearchSelect(typeof search === "string" ? search : (search.name || search.title || ""))}
                >
                  {typeof search === "string" ? search : (search.name || search.title || "")}
                </button>
              ))}

            {isShowingResults &&
              displayItems.map((result: string | { name?: string; title?: string; type?: string; sport?: string; school?: string; creator?: string; views?: string }, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleSearchSelect(typeof result === "string" ? result : (result.name || result.title || ""))}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{typeof result === "string" ? result : (result.name || result.title || "")}</h5>
                    <p className="text-xs text-gray-600">
                      {typeof result !== "string" && result.type === "athlete"
                        ? `${result.sport || ""} • ${result.school || ""}`
                        : typeof result !== "string" && result.creator && result.views
                          ? `${result.creator} • ${result.views} views`
                          : ""}
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
  }, [searchQuery, searchResults, quickSearches, handleSearchSelect])

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

  const [postContent, setPostContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [postFile, setPostFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Post submit handler
  async function handlePostSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!postContent.trim() && !postFile) return
    setPosting(true)
    try {
      const user = auth.currentUser
      let mediaUrl = null
      let mediaType = null
      if (postFile) {
        const storage = getStorage()
        const ext = postFile.name.split('.').pop()
        const fileType = postFile.type.startsWith('video') ? 'video' : 'image'
        const storageRef = ref(storage, `post-media/${user ? user.uid : 'anon'}-${Date.now()}.${ext}`)
        await uploadBytes(storageRef, postFile)
        mediaUrl = await getDownloadURL(storageRef)
        mediaType = fileType
      }
      await addDoc(collection(db, "posts"), {
        content: postContent,
        createdBy: user ? user.uid : "anon",
        userType: "member",
        createdAt: serverTimestamp(),
        mediaUrl,
        mediaType,
      })
      setPostContent("")
      setPostFile(null)
    } catch (err) {
      // Optionally show error toast
      console.error("Failed to post:", err)
    } finally {
      setPosting(false)
    }
  }

  // Comment submit handler
  const handleCommentSubmit = useCallback(async (postId: string) => {
    const user = auth.currentUser
    if (!user) return
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    const commentsRef = collection(db, "posts", postId, "comments")
    const newCommentRef = await addDoc(commentsRef, {
      content: commentInputs[postId],
      createdBy: user.uid,
      userType: "member",
      createdAt: serverTimestamp(),
      profileImageUrl: profileImageUrl,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    })
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
    // Optionally, update the main post's comment count
    await updateDoc(postRef, { commentsCount: (postSnap.data()?.commentsCount || 0) + 1 })
  }, [profileImageUrl, profileData])

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader
        currentPath="/member-home"
        onLogout={logout}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {/* Stories Section */}

            {/* Create Post Section */}
            <Card className="bg-white border border-gray-200 mb-6">
              <CardContent className="p-4">
                <form onSubmit={handlePostSubmit}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      {profileImageUrl ? (
                        <Image src={profileImageUrl} alt="Profile" width={40} height={40} />
                      ) : (
                        <User className="w-full h-full text-gray-500 p-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <LexicalRichTextEditor value={postContent} onChange={setPostContent} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-prologue-electric">
                        <Video className="h-4 w-4 mr-2" />
                        Live Video
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-prologue-electric"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Photo/Video
                      </Button>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={e => setPostFile(e.target.files?.[0] || null)}
                        disabled={posting}
                      />
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-prologue-electric">
                        <Target className="h-4 w-4 mr-2" />
                        Train
                      </Button>
                      {postFile && (
                        <span className="text-xs text-gray-500 ml-2">{postFile.name}</span>
                      )}
                    </div>
                    <div className="flex-1 flex justify-end">
                      <Button
                        type="submit"
                        className="bg-prologue-electric hover:bg-prologue-blue text-white px-6"
                        disabled={posting || (!postContent.trim() && !postFile)}
                      >
                        {posting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 mb-8 bg-white/50 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "feed"
                    ? "bg-white text-prologue-electric shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Feed</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("subscribed")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "subscribed"
                    ? "bg-white text-prologue-electric shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Subscribed</span>
                </div>
              </button>
            </div>

            {/* Content Feed */}
            <div className="space-y-6">
              {/* Firebase posts at the top */}
              {firebasePosts.map((item) => {
                const profile = profileCache[item.createdBy] || {}
                // Check if post is new (within 24 hours)
                let isNew = false
                if (item.createdAt && item.createdAt.toDate) {
                  const now = new Date()
                  const created = item.createdAt.toDate()
                  isNew = (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000
                }
                const isOwner = auth.currentUser && auth.currentUser.uid === item.createdBy
                const handleDelete = async () => {
                  if (!item.id) return
                  await deleteDoc(doc(db, "posts", item.id))
                }
                const likeCount = item.likes ? item.likes.length : 0
                const isLiked = item.likes && auth.currentUser ? item.likes.includes(auth.currentUser.uid) : false
                const postComments = comments[item.id] || []
                const commentCount = postComments.length
                const shareCount = item.shares || 0
                return (
                  <Card key={item.id} className="bg-white border transition-all duration-300 hover:shadow-lg border-prologue-electric/30 shadow-md">
                    <CardContent className="p-0">
                      <div className="space-y-0">
                        {/* Post Header */}
                        <div className="p-4 pb-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                              {profile.profileImageUrl ? (
                                <Image src={profile.profileImageUrl} alt={profile.firstName || "User"} width={48} height={48} />
                              ) : (
                                <User className="w-full h-full text-gray-500 p-2" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{profile.firstName || profile.name || item.createdBy}</h4>
                              <p className="text-sm text-gray-600">
                                {item.createdAt
                                  ? (() => {
                                      const date =
                                        typeof item.createdAt === "string"
                                          ? parseISO(item.createdAt)
                                          : item.createdAt;
                                      return isNaN(date) ? "Just now" : formatDistanceToNow(date, { addSuffix: true });
                                    })()
                                  : "Just now"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isNew && (
                                <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                              )}
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{item.views || 0}</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded hover:bg-gray-100">
                                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {isOwner && (
                                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        {/* Text content above media */}
                        <div className="px-4 pb-3">
                          <div
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.content || "" }}
                          />
                        </div>
                        {/* Media display */}
                        {item.mediaUrl && item.mediaType === 'image' && (
                          <div className="w-full max-h-96 bg-black flex items-center justify-center">
                            <Image src={item.mediaUrl} alt="Post media" width={600} height={400} className="object-contain max-h-96 w-full" />
                          </div>
                        )}
                        {item.mediaUrl && item.mediaType === 'video' && (
                          <div className="w-full max-h-96 bg-black flex items-center justify-center">
                            <video src={item.mediaUrl} controls className="object-contain max-h-96 w-full" />
                          </div>
                        )}
                        {/* Engagement Stats Row */}
                        <div className="px-4 py-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <div className="flex -space-x-1">
                                  <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <Heart className="h-2.5 w-2.5 text-white fill-current" />
                                  </div>
                                  <div className="w-5 h-5 bg-prologue-electric rounded-full border-2 border-white flex items-center justify-center">
                                    <ThumbsUp className="h-2.5 w-2.5 text-white fill-current" />
                                  </div>
                                </div>
                                <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
                              </div>
                              <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>
                              <span>{shareCount} {shareCount === 1 ? "share" : "shares"}</span>
                            </div>
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="px-4 py-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" className={`flex-1 ${isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`} onClick={() => handleLike(item.id)}>
                                <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
                                <span className="hidden sm:inline">Like</span>
                                <span className="ml-1">{likeCount}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                <span className="hidden sm:inline">Comment</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10">
                                <Share className="h-5 w-5 mr-2" />
                                <span className="hidden sm:inline">Share</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {/* Comment input and list */}
                        <div className="px-4 pb-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                              {profile.profileImageUrl ? (
                                <Image src={profile.profileImageUrl} alt={profile.firstName || "User"} width={32} height={32} />
                              ) : (
                                <User className="w-full h-full text-gray-500 p-1.5" />
                              )}
                            </div>
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                                value={commentInputs[item.id] || ""}
                                onChange={e => setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCommentSubmit(item.id) } }}
                              />
                              <Button size="sm" variant="ghost" onClick={() => handleCommentSubmit(item.id)}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            {postComments.map((comment) => (
                              <div key={comment.id} className="flex items-start space-x-2">
                                <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden">
                                  {comment.profileImageUrl ? (
                                    <Image src={comment.profileImageUrl} alt={comment.firstName || "User"} width={28} height={28} />
                                  ) : (
                                    <User className="w-full h-full text-gray-500 p-1" />
                                  )}
                                </div>
                                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-1">
                                  <span className="font-medium text-xs text-gray-900">{comment.firstName} {comment.lastName}</span>
                                  <p className="text-xs text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {/* Existing static/demo content below */}
              {activeTab === "feed" && (
                <>
                  {enhancedFeedContent.length > 0 ? (
                    enhancedFeedContent.map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-white border transition-all duration-300 hover:shadow-lg ${
                          item.isNew ? "border-prologue-electric/30 shadow-md" : "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Regular Content Card */}
                          <div className="space-y-0">
                            {/* Post Header */}
                            <div className="p-4 pb-3">
                              <div className="flex items-start space-x-3">
                                <Link href={`/creator/${item.creatorId}`}>
                                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden hover:ring-2 hover:ring-prologue-electric/30 transition-all cursor-pointer">
                                    <User className="w-full h-full text-gray-500 p-2" />
                                  </div>
                                </Link>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <Link href={`/creator/${item.creatorId}`}>
                                          <h4 className="font-semibold text-gray-900 hover:text-prologue-electric transition-colors cursor-pointer">
                                            {item.creatorName}
                                          </h4>
                                        </Link>
                                        {item.creatorVerified && (
                                          <div className="w-4 h-4 bg-prologue-electric rounded-full flex items-center justify-center">
                                            <svg
                                              className="w-2.5 h-2.5 text-white"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <span>
                                          {item.timestamp
                                            ? (() => {
                                                const date =
                                                  typeof item.timestamp === "string"
                                                    ? parseISO(item.timestamp)
                                                    : item.timestamp;
                                                return isNaN(date) ? "Just now" : formatDistanceToNow(date, { addSuffix: true });
                                              })()
                                            : "Just now"}
                                        </span>
                                        <span>•</span>
                                        <div className="flex items-center space-x-1">
                                          <Eye className="h-3 w-3" />
                                          <span>{item.views}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {item.isNew && (
                                        <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                                      )}
                                      {item.isPremium && (
                                        <Badge className="bg-prologue-fire text-white text-xs">
                                          <Crown className="h-3 w-3 mr-1" />
                                          Premium
                                        </Badge>
                                      )}
                                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div className="px-4 pb-3">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{item.content}</p>
                            </div>

                            {/* Media Content */}
                            {item.media && (
                              <div className="relative">
                                <div className="aspect-video bg-gray-200 overflow-hidden">
                                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                    {item.media.type === "video" ? (
                                      <div className="text-center">
                                        <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center mb-2 mx-auto">
                                          <Play className="h-8 w-8 text-white ml-1" />
                                        </div>
                                        {item.media.duration && (
                                          <Badge className="bg-black/70 text-white text-xs">
                                            {item.media.duration}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <ImageIcon className="h-12 w-12 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                                {item.isPremium && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-center text-white">
                                      <Lock className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-sm font-medium">Premium Content</p>
                                      <p className="text-xs opacity-90">Subscribe to unlock</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Engagement Stats */}
                            <div className="px-4 py-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <div className="flex -space-x-1">
                                      <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <Heart className="h-2.5 w-2.5 text-white fill-current" />
                                      </div>
                                      <div className="w-5 h-5 bg-prologue-electric rounded-full border-2 border-white flex items-center justify-center">
                                        <ThumbsUp className="h-2.5 w-2.5 text-white fill-current" />
                                      </div>
                                    </div>
                                    <span>{item.likes} likes</span>
                                  </div>
                                  <span>{item.comments} comments</span>
                                  <span>{item.shares} shares</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 py-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex-1 hover:bg-red-50 ${likedPosts.has(item.id) ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                                    onClick={() => handleLike(item.id)}
                                  >
                                    <Heart
                                      className={`h-5 w-5 mr-2 ${likedPosts.has(item.id) ? "fill-current" : ""}`}
                                    />
                                    <span className="hidden sm:inline">Like</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10"
                                  >
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    <span className="hidden sm:inline">Comment</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-gray-600 hover:text-green-600 hover:bg-green-50"
                                    onClick={() => handleShare(item.id)}
                                  >
                                    <Repeat2 className="h-5 w-5 mr-2" />
                                    <span className="hidden sm:inline">Share</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10"
                                    onClick={() => handleShare(item.id)}
                                  >
                                    <Send className="h-5 w-5 mr-2" />
                                    <span className="hidden sm:inline">Send</span>
                                  </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`${savedPosts.has(item.id) ? "text-prologue-electric" : "text-gray-600 hover:text-prologue-electric"}`}
                                    onClick={() => handleSave(item.id)}
                                  >
                                    <Bookmark className={`h-4 w-4 ${savedPosts.has(item.id) ? "fill-current" : ""}`} />
                                  </Button>
                                  {item.isPremium && (
                                    <Button size="sm" className="bg-prologue-fire hover:bg-prologue-fire/90 text-white">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Subscribe
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Comment Preview */}
                            <div className="px-4 pb-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                  <User className="w-full h-full text-gray-500 p-1.5" />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Home className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Your feed is empty</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Start following creators and subscribing to content to see updates in your feed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/member-browse">
                            <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                              Browse Creators
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {activeTab === "subscribed" && (
                <>
                  {subscribedContent.length > 0 ? (
                    subscribedContent.map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-white border transition-all duration-300 hover:shadow-lg ${
                          item.isNew ? "border-prologue-electric/30 shadow-md" : "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                              <Link href={`/creator/${item.creatorId}`}>
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden hover:ring-2 hover:ring-prologue-electric/30 transition-all cursor-pointer">
                                  <User className="w-full h-full text-gray-500 p-2" />
                                </div>
                              </Link>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Link href={`/creator/${item.creatorId}`}>
                                      <h4 className="font-semibold text-gray-900 hover:text-prologue-electric transition-colors cursor-pointer">
                                        {item.creatorName}
                                      </h4>
                                    </Link>
                                    <p className="text-sm text-gray-600">{formatDistanceToNow(typeof item.timestamp === "string" ? parseISO(item.timestamp) : item.timestamp, { addSuffix: true })}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {item.isNew && (
                                      <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                                    )}
                                    <Badge className="bg-prologue-fire text-white text-xs">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Premium
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{item.content}</p>
                            </div>

                            {item.media && (
                              <div className="relative">
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                    {item.media.type === "video" ? (
                                      <Play className="h-12 w-12 text-gray-600" />
                                    ) : (
                                      <ImageIcon className="h-12 w-12 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-6">
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-prologue-electric transition-colors">
                                  <ThumbsUp className="h-5 w-5" />
                                  <span className="text-sm">{item.likes}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-prologue-electric transition-colors">
                                  <MessageSquare className="h-5 w-5" />
                                  <span className="text-sm">{item.comments}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-prologue-electric transition-colors">
                                  <Share className="h-5 w-5" />
                                  <span className="text-sm">{item.shares}</span>
                                </button>
                              </div>
                              <Button size="sm" variant="ghost" className="text-gray-600 hover:text-prologue-electric">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white border border-gray-200">
                      <CardContent className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Crown className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No subscribed content</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Subscribe to creators to see their premium content and exclusive updates here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/member-browse">
                            <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
                              Find Creators to Subscribe
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            {/* Spaces Near You */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Spaces Near You</h3>
                  <Badge className="bg-prologue-electric text-white text-xs">Live</Badge>
                </div>
                <div className="space-y-4">
                  {mockSpaces.map((space) => (
                    <div
                      key={space.id}
                      className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100 hover:border-prologue-electric/30"
                      onClick={() => handleSpaceClick(space)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-prologue-electric text-white text-xs">{space.sport}</Badge>
                          {space.isPublic ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">Public</Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">Private</Badge>
                          )}
                          {joinedSpaces.has(space.id) && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">Joined</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{space.time}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1 hover:text-prologue-electric transition-colors">
                        {space.title}
                      </h4>
                      <p className="text-sm text-gray-600">{space.location}</p>
                      <span className="text-sm text-gray-500">
                        {space.participants}/{space.maxParticipants} going
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Trending Topics</h3>
                  <TrendingUp className="h-5 w-5 text-prologue-electric" />
                </div>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 hover:text-prologue-electric transition-colors">
                          #{topic.name}
                        </h4>
                        <p className="text-sm text-gray-600">{topic.posts}</p>
                      </div>
                      <div className="text-gray-400">
                        <span className="text-xs">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Who to Follow */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Who to Follow</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Sarah Martinez</h4>
                      <p className="text-sm text-gray-600">Tennis Coach</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Mike Johnson</h4>
                      <p className="text-sm text-gray-600">Basketball Trainer</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Alex Rodriguez</h4>
                      <p className="text-sm text-gray-600">Sports Psychologist</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Space Details Dialog */}
      {spaceDialogOpen && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className="bg-prologue-electric text-white text-xs">{selectedSpace.sport}</Badge>
                    {selectedSpace.isPublic ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Public</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 text-xs">Private</Badge>
                    )}
                    {joinedSpaces.has(selectedSpace.id) && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Joined</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedSpace.title}</h3>
                  <p className="text-sm text-gray-600">{formatDistanceToNow(typeof selectedSpace.time === "string" ? parseISO(selectedSpace.time) : parseISO(selectedSpace.time), { addSuffix: true })}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSpaceDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Organizer */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <User className="w-full h-full text-gray-500 p-1.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedSpace.organizer}</p>
                  <p className="text-xs text-gray-600">Organizer</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs">📍</span>
                  </div>
                  <span>{selectedSpace.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs">👥</span>
                  </div>
                  <span>
                    {selectedSpace.participants}/{selectedSpace.maxParticipants} participants
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-1">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedSpace.description}</p>
              </div>

              {/* Who's Going */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Who's Going</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWhoIsGoing}
                    className="text-prologue-electric hover:text-prologue-blue text-xs"
                  >
                    See all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSpace.attendees.slice(0, 6).map((attendee: string, index: number) => (
                    <div key={index} className="flex items-center space-x-1 bg-gray-50 rounded-full px-2 py-1">
                      <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-500 p-0.5" />
                      </div>
                      <span className="text-xs text-gray-700">{attendee}</span>
                    </div>
                  ))}
                  {selectedSpace.attendees.length > 6 && (
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                      <span className="text-xs text-gray-600">+{selectedSpace.attendees.length - 6}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {joinedSpaces.has(selectedSpace.id) ? (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled>
                    ✓ Joined
                  </Button>
                ) : selectedSpace.isPublic ? (
                  <Button
                    className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white"
                    onClick={() => handleJoinSpace(selectedSpace.id)}
                  >
                    Join Space
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white"
                    onClick={() => handleRequestJoin(selectedSpace.id)}
                  >
                    Request to Join
                  </Button>
                )}
                <Button variant="outline" size="sm" className="px-3 bg-transparent">
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Who's Going Dialog */}
      {whoIsGoingDialogOpen && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Who's Going</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWhoIsGoingDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3">
                {selectedSpace.attendees.map((attendee: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{attendee}</p>
                      <p className="text-sm text-gray-600">Member</p>
                    </div>
                    {index === 0 && <Badge className="bg-prologue-electric text-white text-xs">Organizer</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 mobile-menu">
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
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors relative"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Training</span>
              {hasNewTrainingContent && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
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
        </div>
      )}
    </div>
  )
}
