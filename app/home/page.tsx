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
  FileText,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth, getMemberProfile, db, getAthleteProfile, likePost, addCommentToPost } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc, setDoc, where, getDocs } from "firebase/firestore"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import LexicalRichTextEditor from "@/components/LexicalRichTextEditor"
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import CommentSection from "@/components/ui/comment-section"
import MobileLayout from "@/components/mobile/mobile-layout"
import { AthleteHeader } from "@/components/navigation/athlete-header"
import AthleteMobileNavigation from "@/components/mobile/athlete-mobile-navigation"
import AthleteDashboardMobileLayout from "@/components/mobile/athlete-dashboard-mobile-layout"
import { AutoplayVideo } from "@/components/ui/autoplay-video"

export default function MemberHomePage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // User type detection
  const [userType, setUserType] = useState<"member" | "athlete" | null>(null)

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
    await likePost(postId, user.uid)
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

  // Detect user type
  useEffect(() => {
    const detectUserType = async () => {
      if (!auth.currentUser) return
      
      try {
        // Check if user is an athlete first
        const athleteProfile = await getAthleteProfile(auth.currentUser.uid)
        if (athleteProfile) {
          setUserType("athlete")
          return
        }
        
        // Check if user is a member
        const memberProfile = await getMemberProfile(auth.currentUser.uid)
        if (memberProfile) {
          setUserType("member")
          return
        }
      } catch (error) {
        console.error("Error detecting user type:", error)
      }
    }
    
    detectUserType()
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
  const [refreshing, setRefreshing] = useState(false)

  // Function to manually refresh posts
  const handleRefreshFeed = async () => {
    setRefreshing(true)
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      setFirebasePosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      console.error("Failed to refresh feed:", err)
    } finally {
      setRefreshing(false)
    }
  }

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

  const [profileData, setProfileData] = useState<{ firstName: string; lastName: string; profileImageUrl: string | null; profilePic?: string; profilePicture?: string }>({ firstName: "", lastName: "", profileImageUrl: null });
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      // Try member profile first
      const memberProfile = await getMemberProfile(auth.currentUser.uid);
      if (memberProfile) {
        setProfileData({
          firstName: memberProfile.firstName || "",
          lastName: memberProfile.lastName || "",
          profileImageUrl: memberProfile.profileImageUrl || null,
        });
        setProfileImageUrl(memberProfile.profileImageUrl || null);
        return;
      }
      // If not a member, try athlete profile
      const athleteProfile = await getAthleteProfile(auth.currentUser.uid);
      if (athleteProfile) {
        const athletePhoto = athleteProfile.profilePhotoUrl || athleteProfile.profileImageUrl || athleteProfile.profilePicture || athleteProfile.avatar || null;
        setProfileData({
          firstName: athleteProfile.firstName || "",
          lastName: athleteProfile.lastName || "",
          profileImageUrl: athletePhoto,
        });
        setProfileImageUrl(athletePhoto);
      }
    };
    loadProfile();
  }, []);

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
    
    if (parentId) {
      // For replies, use the direct approach since addCommentToPost doesn't support replies yet
      const commentsRef = collection(db, "posts", postId, "comments");
      await addDoc(commentsRef, {
        content,
        createdBy: user.uid,
        userType: "member",
        createdAt: serverTimestamp(),
        profileImageUrl: profileImageUrl,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        parentId: parentId,
        likes: [],
      });
      // Increment comment count on the post
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      await updateDoc(postRef, { commentsCount: (postSnap.data()?.commentsCount || 0) + 1 });
    } else {
      // For top-level comments, use the enhanced function that creates notifications
      await addCommentToPost(postId, user.uid, content);
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

  const mainContent = (
    <div className="min-h-screen bg-gray-50">
      {!(isMobile || isTablet) && (
        <AthleteHeader
          currentPath="/home"
          onLogout={logout}
          showSearch={false}
          unreadNotifications={unreadNotificationsCount}
          unreadMessages={unreadMessagesCount}
          hasNewContent={hasNewTrainingContent}
          profileImageUrl={profileImageUrl}
          profileData={profileData}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 pb-24 sm:pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {/* Refresh Feed Button */}
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshFeed}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RotateCcw className={refreshing ? "animate-spin h-4 w-4 mr-2" : "h-4 w-4 mr-2"} />
                <span>{refreshing ? "Refreshing..." : "Refresh Feed"}</span>
              </Button>
            </div>
            {/* Stories Section */}

            {/* Create Post Section */}
            <Card className="bg-white border border-gray-200 mb-4 sm:mb-6">
              <CardContent className="p-3 sm:p-4">
                <form onSubmit={handlePostSubmit}>
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      {(() => {
                        const profileImageUrl = profileData.profileImageUrl && profileData.profileImageUrl.trim() !== '' ? profileData.profileImageUrl : (profileData.profilePic && profileData.profilePic.trim() !== '' ? profileData.profilePic : (profileData.profilePicture && profileData.profilePicture.trim() !== '' ? profileData.profilePicture : null));
                        if (profileImageUrl) {
                          return <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />;
                        } else if (profileData.firstName && profileData.lastName) {
                          const initials = `${profileData.firstName[0] || ''}${profileData.lastName[0] || ''}`.toUpperCase();
                          return <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">{initials}</span>;
                        } else {
                          return <User className="w-full h-full text-gray-500 p-2" />;
                        }
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="What's on your mind?"
                        className="w-full bg-gray-100 rounded-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        disabled={posting}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-prologue-electric px-2 sm:px-3"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">Photo/Video</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={e => setPostFile(e.target.files?.[0] || null)}
                        disabled={posting}
                      />
                      <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-600 hover:text-prologue-electric">
                        <Target className="h-4 w-4 mr-2" />
                        Train
                      </Button>
                      {postFile && (
                        <span className="text-xs text-gray-500 ml-2 truncate">{postFile.name}</span>
                      )}
                    </div>
                    <div className="flex-1 flex justify-end ml-2 sm:ml-0">
                      <Button
                        type="submit"
                        className="bg-prologue-electric hover:bg-prologue-blue text-white px-4 sm:px-6 text-sm"
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
            <div className="flex items-center space-x-1 mb-4 sm:mb-8 bg-white/50 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "feed"
                    ? "bg-white text-prologue-electric shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Feed</span>
                </div>
              </button>
              {/*
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
              */}
            </div>

            {/* Content Feed */}
            <div className="space-y-4 sm:space-y-6">
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
                const likeCount = item.likes || 0
                const isLiked = item.likedBy && auth.currentUser ? item.likedBy.includes(auth.currentUser.uid) : false
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
                                <img src={profile.profileImageUrl} alt={profile.firstName || "User"} className="w-full h-full object-cover" />
                              ) : profile.firstName && profile.lastName ? (
                                <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">{`${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()}</span>
                              ) : (
                                <User className="w-full h-full text-gray-500 p-2" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {profile.firstName && profile.lastName
                                  ? `${profile.firstName} ${profile.lastName}`
                                  : profile.firstName || profile.name || item.createdBy}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>
                                  {item.createdAt
                                    ? (() => {
                                        let date;
                                        if (item.createdAt.toDate) {
                                          date = item.createdAt.toDate(); // Firestore Timestamp
                                        } else if (typeof item.createdAt === "string") {
                                          date = parseISO(item.createdAt);
                                        } else {
                                          date = item.createdAt;
                                        }
                                        return isValid(date)
                                          ? date.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                                          : "";
                                      })()
                                    : ""}
                                </span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{item.views || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isNew && (
                                <Badge className="bg-prologue-electric text-white text-xs">New</Badge>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded hover:bg-gray-100">
                                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {isOwner && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleStartEditPost(item.id, item.content || "")}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        {/* Text content above media */}
                        <div className="px-4 pb-3">
                          {editingPost === item.id ? (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleEditPost(item.id, editPostContent[item.id] || "");
                            }}>
                              <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prologue-electric/20 resize-none"
                                rows={3}
                                value={editPostContent[item.id] || ""}
                                onChange={(e) => setEditPostContent(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Edit your post..."
                              />
                              <div className="flex items-center justify-end space-x-2 mt-2">
                                <Button type="button" variant="outline" size="sm" onClick={handleCancelEditPost}>
                                  Cancel
                                </Button>
                                <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                  Save
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div className="text-gray-700 leading-relaxed">
                              <div dangerouslySetInnerHTML={{ __html: item.content || "" }} />
                              {item.editedAt && (
                                <span className="text-xs text-gray-500 ml-2">(edited)</span>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Media display */}
                        {item.mediaUrl && item.mediaType === 'image' && (
                          <div className="w-full max-h-96 bg-black flex items-center justify-center">
                            <img src={item.mediaUrl} alt="Post media" className="object-contain max-h-96 w-full" />
                          </div>
                        )}
                        {item.mediaUrl && item.mediaType === 'video' && (
                          <div className="w-full max-h-96 bg-black flex items-center justify-center">
                            <AutoplayVideo 
                              src={item.mediaUrl} 
                              controls={true}
                              autoplay={false}
                              muted={true}
                              playsInline={true}
                              className="object-contain max-h-96 w-full"
                            />
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
                              <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-prologue-electric hover:bg-prologue-electric/10" onClick={() => handleShare(item.id)}>
                                <Share className="h-5 w-5 mr-2" />
                                <span className="hidden sm:inline">Share</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {/* Replace old comment input and list with new CommentSection */}
                        <div className="px-4 pb-4">
                          <CommentSection
                            postId={item.id}
                            comments={(comments[item.id] || []).map(comment => mapCommentWithProfile(comment, profileCache))}
                            onAddComment={handleAddComment}
                            onLikeComment={(commentId) => handleLikeComment(item.id, commentId)}
                            onEditComment={(commentId, newContent) => handleEditComment(item.id, commentId, newContent)}
                            onDeleteComment={(commentId) => handleDeleteComment(item.id, commentId)}
                            currentUserId={auth.currentUser?.uid}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/*
              {activeTab === "subscribed" && (
                <>
                  {filteredSubscribed.length > 0 &&
                    filteredSubscribed.map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-white border transition-all duration-300 hover:shadow-lg ${
                          item.isNew ? "border-prologue-electric/30 shadow-md" : "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Regular Content Card */}
                          {/*
                          <div className="space-y-0">
                            {/* Post Header */}
                            {/*
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
                                                return !isValid(date) ? "Just now" : formatDistanceToNow(date, { addSuffix: true });
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
                            {/*
                            <div className="px-4 pb-3">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{item.content}</p>
                            </div>

                            {/* Media Content */}
                            {/*
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
                            {/*
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
                            {/*
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
                            {/*
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
                  }
                </>
              )}
              */}
            </div>
          </div>

          {/* Right Sidebar */}
          {/* Removed: Spaces Near You, Trending Topics, Who to Follow */}
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

    </div>
  )

  // Return with conditional mobile/desktop layout
  if (isMobile || isTablet) {
    return (
      <AthleteDashboardMobileLayout
        currentPath="/home"
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profilePhotoUrl={profileImageUrl || undefined}
        firstName={profileData.firstName}
        lastName={profileData.lastName}
      >
        {mainContent}
      </AthleteDashboardMobileLayout>
    )
  }

  return mainContent
}
