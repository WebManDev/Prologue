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
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { NotificationProvider } from "@/contexts/notification-context"
import { LogoutNotification } from "@/components/ui/logout-notification"
import { auth, getMemberProfile, db, getAthleteProfile } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc, setDoc, where, getDocs } from "firebase/firestore"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import LexicalRichTextEditor from "@/components/LexicalRichTextEditor"
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import CommentSection from "@/components/ui/comment-section"
import ProfileHeader from "@/components/profile-header"
import StatsCards from "@/components/stats-cards"
import ProfileEditor from "@/components/profile-editor"
import Sidebar from "@/components/sidebar"

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
  const searchInputRef = useRef<HTMLInputElement>(null)
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
    const baseContent = [...followedContent, ...subscribedContent];
    return baseContent.sort((a, b) => {
      // Sort by timestamp, with "new" content first
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    });
  }, [followedContent, subscribedContent]);

  // Filtered feed for public posts only
  const filteredFeed = enhancedFeedContent.filter(
    post => (post.visibility === undefined || post.visibility === 'public') && post.creatorName !== "Premium Creator 1"
  );

  // Filtered subscribed content for non-public posts only
  const filteredSubscribed = enhancedFeedContent.filter(
    post => post.visibility && post.visibility !== 'public'
  );

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
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleQuickSearchSelect = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm)
    setShowSearchDropdown(false)
    console.log("Searching for:", searchTerm)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
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
  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

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

  // Memoized search component to prevent re-renders
  const SearchComponent = useMemo(
    () => (
      <div className="flex items-center space-x-1 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search athletes, content..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchFocus}
            className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showSearchDropdown && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
              <div className="space-y-1">
                {quickSearches.map((search) => (
                  <button
                    key={search}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                    onClick={() => handleQuickSearchSelect(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    [
      searchQuery,
      showSearchDropdown,
      handleSearchInputChange,
      handleSearchFocus,
      handleClearSearch,
      handleQuickSearchSelect,
      quickSearches,
    ],
  )

  // Extend profileData to match athleteDashboard
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    school: "",
    graduationYear: "",
    sport: "",
    position: "",
    certifications: [],
    specialties: [],
    experience: "",
    achievements: [],
    profilePhotoUrl: "",
    coverPhotoUrl: "",
  });
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      const memberProfile = await getMemberProfile(auth.currentUser.uid);
      if (memberProfile) {
        setProfileData({
          firstName: memberProfile.firstName || "",
          lastName: memberProfile.lastName || "",
          email: memberProfile.email || "",
          phone: memberProfile.phone || "",
          bio: memberProfile.bio || "",
          location: memberProfile.location || "",
          school: memberProfile.school || "",
          graduationYear: memberProfile.graduationYear || "",
          sport: memberProfile.sport || "",
          position: memberProfile.position || "",
          certifications: memberProfile.certifications || [],
          specialties: memberProfile.specialties || [],
          experience: memberProfile.experience || "",
          achievements: memberProfile.achievements || [],
          profilePhotoUrl: memberProfile.profilePhotoUrl || "",
          coverPhotoUrl: memberProfile.coverPhotoUrl || "",
        });
        setProfileImageUrl(memberProfile.profilePhotoUrl || null);
      }
    };
    loadProfile();
  }, []);

  const DesktopHeader = useMemo(
    () => (
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
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
                <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>

              {SearchComponent}
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/member-home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-training"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">Training</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-feedback"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {unreadNotificationsCount > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 p-2"
                      disabled={loadingState.isLoading}
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        {profileImageUrl ? (
                          <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-full h-full text-gray-500 p-1" />
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/member-dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/member-settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer"
                      disabled={loadingState.isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {loadingState.isLoading ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
    ),
    [SearchComponent, unreadNotificationsCount, loadingState.isLoading, logout, profileImageUrl],
  )

  const [postContent, setPostContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [postFile, setPostFile] = useState<File | null>(null)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState<{ [key: string]: string }>({})
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

  // Like a comment (toggle like)
  const handleLikeComment = useCallback(async (postId: string, commentId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const likes = commentSnap.data()?.likes || [];
    if (likes.includes(user.uid)) {
      await updateDoc(commentRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(commentRef, { likes: arrayUnion(user.uid) });
    }
  }, []);

  // Add a comment or reply
  const handleAddComment = useCallback(async (postId: string, content: string, parentId?: string) => {
    const user = auth.currentUser;
    if (!user || !content || !content.trim()) return;
    const commentsRef = collection(db, "posts", postId, "comments");
    await addDoc(commentsRef, {
      content,
      createdBy: user.uid,
      userType: "member",
      createdAt: serverTimestamp(),
      profileImageUrl: profileImageUrl,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      parentId: parentId || null,
      likes: [],
    });
    // Increment comment count on the post
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    await updateDoc(postRef, { commentsCount: (postSnap.data()?.commentsCount || 0) + 1 });
    // Optionally clear input for top-level comments
    if (!parentId) {
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  }, [profileImageUrl, profileData]);

  // Edit a comment
  const handleEditComment = useCallback(async (postId: string, commentId: string, newContent: string) => {
    const user = auth.currentUser;
    if (!user || !newContent || !newContent.trim()) return;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await updateDoc(commentRef, {
      content: newContent,
      editedAt: serverTimestamp(),
    });
  }, []);

  // Delete a comment
  const handleDeleteComment = useCallback(async (postId: string, commentId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    // First, get all replies to this comment recursively
    const getAllReplies = async (parentId: string): Promise<string[]> => {
      const repliesQuery = query(collection(db, "posts", postId, "comments"), where("parentId", "==", parentId));
      const repliesSnap = await getDocs(repliesQuery);
      let allIds = [parentId];
      
      for (const replyDoc of repliesSnap.docs) {
        const replyIds = await getAllReplies(replyDoc.id);
        allIds = allIds.concat(replyIds);
      }
      
      return allIds;
    };
    
    const commentIdsToDelete = await getAllReplies(commentId);
    
    // Delete all comments and replies
    for (const id of commentIdsToDelete) {
      const commentRef = doc(db, "posts", postId, "comments", id);
      await deleteDoc(commentRef);
    }
    
    // Decrement comment count on the post by the total number of comments deleted
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    await updateDoc(postRef, { 
      commentsCount: Math.max((postSnap.data()?.commentsCount || 0) - commentIdsToDelete.length, 0) 
    });
  }, []);

  // Edit a post
  const handleEditPost = useCallback(async (postId: string, newContent: string) => {
    const user = auth.currentUser;
    if (!user || !newContent || !newContent.trim()) return;
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      content: newContent,
      editedAt: serverTimestamp(),
    });
    setEditingPost(null);
    setEditPostContent((prev) => ({ ...prev, [postId]: "" }));
  }, []);

  const handleStartEditPost = useCallback((postId: string, currentContent: string) => {
    setEditingPost(postId);
    setEditPostContent((prev) => ({ ...prev, [postId]: currentContent }));
  }, []);

  const handleCancelEditPost = useCallback(() => {
    setEditingPost(null);
    setEditPostContent({});
  }, []);

  function mapCommentWithProfile(comment: any, profileCache: Record<string, any>): any {
    const profile = profileCache[comment.createdBy] || {};
    const likesArray = Array.isArray(comment.likes) ? comment.likes : [];
    const user = auth.currentUser;
    return {
      ...comment,
      userAvatar: profile.profileImageUrl || comment.profileImageUrl || '',
      likes: likesArray.length,
      isLiked: user ? likesArray.includes(user.uid) : false,
      // Don't try to map replies here - they will be handled by buildCommentTree in the component
    };
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {DesktopHeader}
        {!isMobile && (
          <main className="max-w-7xl mx-auto px-6 py-8">
            <ProfileHeader
              profileData={profileData}
              isEditing={false}
              isLoading={false}
              onEditToggle={() => {}}
              onSave={() => {}}
              onProfileImageChange={() => {}}
              onCoverImageChange={() => {}}
            />
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              <div className="lg:col-span-2">
                <ProfileEditor
                  ref={null}
                  isEditing={false}
                  isLoading={false}
                  initialData={profileData}
                  onSave={() => {}}
                />
              </div>
              <Sidebar profileData={profileData} />
            </div>
          </main>
        )}

        {/* Right Sidebar */}
        {isMobile && (
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
        )}

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
                    <p className="text-sm text-gray-600">
                      {selectedSpace.time
                        ? (() => {
                            const date =
                              typeof selectedSpace.time === "string"
                                ? parseISO(selectedSpace.time)
                                : selectedSpace.time;
                            return !isValid(date) ? "Just now" : formatDistanceToNow(date, { addSuffix: true });
                          })()
                        : "Just now"}
                    </p>
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
    </NotificationProvider>
  )
}
