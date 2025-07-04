"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Search,
  TrendingUp,
  Play,
  BookOpen,
  Video,
  FileText,
  Users,
  Clock,
  Star,
  Filter,
  X,
  Plus,
  BarChart3,
  Camera,
  Upload,
  Loader2,
  Home,
  MessageSquare,
  MessageCircle,
  Bell,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"
import { db } from "@/lib/firebase"
import { collection, getCountFromServer, addDoc, getDocs, Timestamp, query, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import LexicalRichTextEditor from "@/components/LexicalRichTextEditor"
import "react-quill/dist/quill.snow.css"
import { useNotifications } from "@/contexts/notification-context"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import { ExactCourseCreationForm } from "@/components/ExactCourseCreationForm";
import { getAthleteProfile, getMemberProfile } from "@/lib/firebase";

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

const CONTENT_DATA = {
  videos: [
    {
      id: 1,
      title: "Mental Performance in High-Pressure Situations",
      duration: "12:34",
      views: 1250,
      rating: 4.8,
      thumbnail: "/placeholder.svg?height=200&width=300",
      category: "Mental Performance",
    },
    {
      id: 2,
      title: "Nutrition for Peak Athletic Performance",
      duration: "18:45",
      views: 2100,
      rating: 4.9,
      thumbnail: "/placeholder.svg?height=200&width=300",
      category: "Nutrition",
    },
    {
      id: 3,
      title: "NIL Opportunities and Brand Building",
      duration: "25:12",
      views: 890,
      rating: 4.7,
      thumbnail: "/placeholder.svg?height=200&width=300",
      category: "NIL",
    },
  ],
  articles: [
    {
      id: 1,
      title: "The Complete Guide to College Recruitment",
      readTime: "8 min read",
      views: 3200,
      rating: 4.9,
      category: "Recruitment",
    },
    {
      id: 2,
      title: "Building Your Athletic Brand on Social Media",
      readTime: "6 min read",
      views: 1800,
      rating: 4.6,
      category: "NIL",
    },
  ],
  courses: [
    {
      id: 1,
      title: "Elite Mindset Training Course",
      sessions: 12,
      duration: "6 weeks",
      participants: 450,
      rating: 4.8,
      category: "Mental Performance",
    },
    {
      id: 2,
      title: "Injury Prevention Masterclass",
      sessions: 8,
      duration: "4 weeks",
      participants: 320,
      rating: 4.9,
      category: "Training",
    },
  ],
}

export default function ContentPage() {
  return (
    <AdvancedNotificationProvider>
      <ContentPageContent />
    </AdvancedNotificationProvider>
  )
}

function ContentPageContent() {
  const { isMobile, isTablet } = useMobileDetection();
  const { hasUnreadMessages } = useNotifications();
  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout();
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth && auth.currentUser;
  const router = useRouter();

  // Separate state for different inputs to prevent interference
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [contentType, setContentType] = useState("video")
  const [contentTitle, setContentTitle] = useState("")
  const [contentDescription, setContentDescription] = useState("")
  const [contentCategory, setContentCategory] = useState("")
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isCreatingContent, setIsCreatingContent] = useState(false)

  // Refs for maintaining focus
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

  // Dynamic stats state
  const [videoCount, setVideoCount] = useState<number | null>(null)
  const [articleCount, setArticleCount] = useState<number | null>(null)
  const [courseCount, setCourseCount] = useState<number | null>(null)
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)
  const [firebaseArticles, setFirebaseArticles] = useState<any[]>([])
  const [firebaseVideos, setFirebaseVideos] = useState<any[]>([])
  const [firebaseCourses, setFirebaseCourses] = useState<any[]>([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [userRole, setUserRole] = useState<"athlete" | "member" | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [videosSnap, articlesSnap, coursesSnap, subscribersSnap] = await Promise.all([
          getCountFromServer(collection(db, "videos")),
          getCountFromServer(collection(db, "articles")),
          getCountFromServer(collection(db, "courses")),
          getCountFromServer(collection(db, "subscribers")),
        ])
        setVideoCount(videosSnap.data().count)
        setArticleCount(articlesSnap.data().count)
        setCourseCount(coursesSnap.data().count)
        setSubscriberCount(subscribersSnap.data().count)
      } catch (e) {
        setVideoCount(null)
        setArticleCount(null)
        setCourseCount(null)
        setSubscriberCount(null)
      }
    }
    fetchCounts()
  }, [])

  // Determine user role and fetch subscriptions if member
  useEffect(() => {
    async function fetchUserRoleAndSubs() {
      if (!user) return;
      const athleteProfile = await getAthleteProfile(user.uid);
      if (athleteProfile) {
        setUserRole("athlete");
        setSubscriptions([]); // not used for athletes
        return;
      }
      const memberProfile = await getMemberProfile(user.uid);
      if (memberProfile) {
        setUserRole("member");
        // Subscriptions can be an object or array; handle both
        let subs: string[] = [];
        if (Array.isArray(memberProfile.subscriptions)) {
          subs = memberProfile.subscriptions;
        } else if (memberProfile.subscriptions && typeof memberProfile.subscriptions === "object") {
          subs = Object.keys(memberProfile.subscriptions);
        }
        setSubscriptions(subs);
      }
    }
    fetchUserRoleAndSubs();
  }, [user]);

  // Fetch articles from Firebase
  useEffect(() => {
    async function fetchArticles() {
      if (!user) return;
      if (userRole === "athlete") {
        // Only own content
        const q = query(collection(db, "articles"), where("createdBy", "==", user.uid));
        const snap = await getDocs(q);
        setFirebaseArticles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (userRole === "member") {
        if (!subscriptions.length) { setFirebaseArticles([]); return; }
        // Batch queries if >10 subscriptions
        const batches = [];
        for (let i = 0; i < subscriptions.length; i += 10) {
          const batchIds = subscriptions.slice(i, i + 10);
          batches.push(query(collection(db, "articles"), where("createdBy", "in", batchIds)));
        }
        let allDocs: any[] = [];
        for (const q of batches) {
          const snap = await getDocs(q);
          allDocs = allDocs.concat(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        setFirebaseArticles(allDocs);
      }
    }
    fetchArticles();
  }, [user, userRole, subscriptions]);

  // Fetch videos from Firebase
  useEffect(() => {
    async function fetchVideos() {
      if (!user) return;
      if (userRole === "athlete") {
        const q = query(collection(db, "videos"), where("createdBy", "==", user.uid));
        const snap = await getDocs(q);
        setFirebaseVideos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (userRole === "member") {
        if (!subscriptions.length) { setFirebaseVideos([]); return; }
        const batches = [];
        for (let i = 0; i < subscriptions.length; i += 10) {
          const batchIds = subscriptions.slice(i, i + 10);
          batches.push(query(collection(db, "videos"), where("createdBy", "in", batchIds)));
        }
        let allDocs: any[] = [];
        for (const q of batches) {
          const snap = await getDocs(q);
          allDocs = allDocs.concat(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        setFirebaseVideos(allDocs);
      }
    }
    fetchVideos();
  }, [user, userRole, subscriptions]);

  // Fetch courses from Firebase
  useEffect(() => {
    async function fetchCourses() {
      if (!user) return;
      if (userRole === "athlete") {
        const q = query(collection(db, "courses"), where("createdBy", "==", user.uid));
        const snap = await getDocs(q);
        setFirebaseCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (userRole === "member") {
        if (!subscriptions.length) { setFirebaseCourses([]); return; }
        const batches = [];
        for (let i = 0; i < subscriptions.length; i += 10) {
          const batchIds = subscriptions.slice(i, i + 10);
          batches.push(query(collection(db, "courses"), where("createdBy", "in", batchIds)));
        }
        let allDocs: any[] = [];
        for (const q of batches) {
          const snap = await getDocs(q);
          allDocs = allDocs.concat(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        setFirebaseCourses(allDocs);
      }
    }
    fetchCourses();
  }, [user, userRole, subscriptions]);

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

  // Stable search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Stable content form handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContentTitle(e.target.value)
  }, [])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentDescription(e.target.value)
  }, [])

  // Handle cover image file selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  // Save new article to Firebase (with cover image upload)
  const handleCreateContent = useCallback(async () => {
    if (!user) return;
    setIsCreatingContent(true);
    try {
      if (contentType === "article") {
        let coverImageUrl = ""
        if (coverImageFile) {
          try {
            const storage = getStorage()
            const storageRef = ref(storage, `article-covers/${Date.now()}-${coverImageFile.name}`)
            await uploadBytes(storageRef, coverImageFile)
            coverImageUrl = await getDownloadURL(storageRef)
          } catch (e) {
            // Optionally show error toast
          }
        }
        try {
          await addDoc(collection(db, "articles"), {
            title: contentTitle,
            category: contentCategory,
            description: contentDescription,
            readTime: "1 min read",
            views: 0,
            rating: 0,
            coverImage: coverImageUrl,
            createdAt: Timestamp.now(),
            createdBy: user.uid,
          })
          // Re-fetch articles after creation
          const q = query(collection(db, "articles"), where("createdBy", "==", user.uid));
          const snap = await getDocs(q)
          const articles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setFirebaseArticles(articles)
        } catch (e) {
          // Optionally show error toast
        }
      }
      if (contentType === "video") {
        let videoUrl = ""
        if (videoFile) {
          try {
            const storage = getStorage()
            const storageRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`)
            await uploadBytes(storageRef, videoFile)
            videoUrl = await getDownloadURL(storageRef)
          } catch (e) {
            // Optionally show error toast
          }
        }
        try {
          await addDoc(collection(db, "videos"), {
            title: contentTitle,
            category: contentCategory,
            description: contentDescription,
            videoUrl,
            views: 0,
            rating: 0,
            createdAt: Timestamp.now(),
            createdBy: user.uid,
          })
          // Re-fetch videos after creation
          const q = query(collection(db, "videos"), where("createdBy", "==", user.uid));
          const snap = await getDocs(q)
          const videos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setFirebaseVideos(videos)
        } catch (e) {
          // Optionally show error toast
        }
      }
      setShowCreateDialog(false)
      setContentTitle("")
      setContentDescription("")
      setContentCategory("")
      setContentType("video")
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setVideoFile(null)
      setVideoPreview(null)
    } finally {
      setIsCreatingContent(false);
    }
  }, [contentType, contentTitle, contentDescription, contentCategory, coverImageFile, videoFile, user])

  // Save new course to Firebase (with file uploads for lessons)
  const handleCreateCourse = useCallback(async (courseData: any) => {
    if (!user) {
      window.alert("You must be logged in to create a course.");
      return;
    }
    setIsCreatingCourse(true);
    try {
      // Upload lesson files if present
      const storage = getStorage();
      const lessonsWithUrls = await Promise.all(
        (courseData.lessons || []).map(async (lesson: any) => {
          let videoUrl = "";
          let coverImageUrl = "";
          if (lesson.videoFile) {
            const storageRef = ref(storage, `course-videos/${Date.now()}-${lesson.videoFile.name}`);
            await uploadBytes(storageRef, lesson.videoFile);
            videoUrl = await getDownloadURL(storageRef);
          }
          if (lesson.coverImage) {
            const storageRef = ref(storage, `course-covers/${Date.now()}-${lesson.coverImage.name}`);
            await uploadBytes(storageRef, lesson.coverImage);
            coverImageUrl = await getDownloadURL(storageRef);
          }
          // Remove File objects
          const { videoFile, coverImage, ...rest } = lesson;
          const sanitizedLesson = {
            ...rest,
            videoUrl,
            coverImageUrl,
          };
          Object.keys(sanitizedLesson).forEach((key) => {
            if (sanitizedLesson[key] === undefined) {
              delete sanitizedLesson[key];
            }
          });
          return sanitizedLesson;
        })
      );
      const courseToSave: any = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        lessons: lessonsWithUrls,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
        views: 0,
        rating: 0,
      };
      // Remove undefined fields from course
      Object.keys(courseToSave).forEach((key) => {
        if (courseToSave[key] === undefined) {
          delete courseToSave[key];
        }
      });
      console.log("Saving course to Firestore", courseToSave);
      await addDoc(collection(db, "courses"), courseToSave);
      console.log("Course saved!");
      // Re-fetch courses after creation
      const q = query(collection(db, "courses"), where("createdBy", "==", user.uid));
      const snap = await getDocs(q);
      const courses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirebaseCourses(courses);
      setShowCreateDialog(false);
    } catch (e) {
      window.alert("Failed to create course. Please try again or check the console for details.");
      console.error("Failed to create course:", e);
    } finally {
      setIsCreatingCourse(false);
    }
  }, [user]);

  const handleCategoryChange = useCallback((category: string) => {
    setContentCategory(category);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push("/");
    }
  };

  // Memoized search dropdown to prevent recreation
  const SearchDropdown = useMemo(() => {
    if (!showSearchDropdown) return null

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
          <div className="space-y-1">
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                onClick={() => handleSearchSelect(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [showSearchDropdown, handleSearchSelect])

  // Memoized search component to prevent re-renders (adapted from athleteDashboard)
  const SearchComponent = useMemo(
    () => (
      <div className="flex items-center space-x-1 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {SearchDropdown}
      </div>
    ),
    [searchQuery, showSearchDropdown, handleSearchChange, handleSearchFocus, clearSearch, SearchDropdown]
  );

  // Full DesktopHeader from athleteDashboard
  const DesktopHeader = useMemo(
    () => (
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-logo.png"
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
                <Link href="/home" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group">
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/content" className="flex flex-col items-center space-y-1 text-blue-600 group">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Content</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/feedback" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/messaging" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/notifications" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group">
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
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
                        <User className="w-full h-full text-gray-500 p-1" />
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/athleteDashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/promote" className="flex items-center w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/athlete-settings" className="flex items-center w-full">
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
    [SearchComponent, hasUnreadMessages, loadingState.isLoading, logout]
  );

  // Memoized create content dialog
  const CreateContentDialog = useMemo(
    () => (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button
            className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? "flex-1" : ""}`}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Create" : "Create Content"}
          </Button>
        </DialogTrigger>
        <DialogContent
          className={`${isMobile ? "w-[95vw] max-w-[95vw] max-h-[90vh]" : "max-w-4xl max-h-[90vh]"} overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Content Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="course">Training Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* If Training Course, show ExactCourseCreationForm */}
            {contentType === "course" ? (
              <ExactCourseCreationForm onSubmit={handleCreateCourse} onSuccess={() => setShowCreateDialog(false)} />
            ) : (
              <>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    ref={titleInputRef}
                    id="title"
                    placeholder="Enter content title..."
                    value={contentTitle}
                    onChange={handleTitleChange}
                  />
                </div>
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={contentCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mental-performance">Mental Performance</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="nil">NIL</SelectItem>
                      <SelectItem value="recruitment">Recruitment</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="injury-prevention">Injury Prevention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <div className="bg-white rounded border border-input focus-within:ring-2 focus-within:ring-blue-500/20">
                    <LexicalRichTextEditor value={contentDescription} onChange={setContentDescription} />
                  </div>
                </div>
                {/* File Upload Area for non-course content */}
                <div className="space-y-2">
                  <Label>
                    {contentType === "video"
                      ? "Video File"
                      : contentType === "article"
                        ? "Cover Image"
                        : "Course Materials"}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      {contentType === "video" ? (
                        <Camera className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">
                        {contentType === "video"
                          ? "MP4, MOV up to 500MB"
                          : contentType === "article"
                            ? "PNG, JPG up to 10MB"
                            : "PDF, DOC up to 50MB"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateContent}
                    disabled={!contentTitle}
                  >
                    Create Content
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    ), [
      showCreateDialog,
      isMobile,
      contentType,
      contentTitle,
      contentDescription,
      contentCategory,
      handleTitleChange,
      handleDescriptionChange,
      handleCategoryChange,
      handleCreateContent,
      titleInputRef,
      descriptionInputRef,
      setShowCreateDialog,
    ]);

  // Merge Firebase and static articles for display
  const allArticles = [...firebaseArticles, ...CONTENT_DATA.articles]
  // Merge Firebase and static videos for display
  const allVideos = [...firebaseVideos, ...CONTENT_DATA.videos]
  // Merge Firebase and static courses for display
  const allCourses = [...firebaseCourses, ...CONTENT_DATA.courses];

  // Helper to merge and sort latest content
  const latestContent = [
    ...firebaseVideos.map(v => ({ ...v, type: 'video' })),
    ...firebaseArticles.map(a => ({ ...a, type: 'article' })),
    ...firebaseCourses.map(c => ({ ...c, type: 'course' }))
  ]
    .filter(item => item.createdAt)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 6);

  // Memoized main content
  const MainContent = useMemo(
    () => (
      <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
        {/* Page Header */}
        <div className="mb-6">
          <div className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>
                  {isMobile ? "Content" : "Content Library"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isMobile ? "Videos, articles & courses" : "Educational videos, articles, and training courses"}
                </p>
              </div>
            </div>
            <div className={`flex ${isMobile ? "w-full space-x-2" : "space-x-3"}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={isMobile ? "flex-1" : ""} size={isMobile ? "sm" : "default"}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Content</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("recent")}>Recently Added</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("popular")}>Most Popular</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("rated")}>Highest Rated</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {CreateContentDialog}
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div
          className={`grid ${isMobile ? "grid-cols-2 gap-3" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-4 gap-6"} mb-6`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Videos</CardTitle>
              <Video className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {videoCount !== null ? videoCount : 0}
              </div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Educational videos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Articles</CardTitle>
              <FileText className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {articleCount !== null ? articleCount : 0}
              </div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Written guides</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Courses</CardTitle>
              <BookOpen className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {courseCount !== null ? courseCount : 0}
              </div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Training courses</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Subscribers</CardTitle>
              <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {subscriberCount !== null ? subscriberCount.toLocaleString() : "0"}
              </div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Active subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className={`${isMobile ? "space-y-2" : ""}`}>
            <TabsList className={`${isMobile ? "grid w-full grid-cols-2 h-auto" : "grid w-full grid-cols-4"}`}>
              <TabsTrigger
                value="all"
                className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
              >
                <BookOpen className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                <span className={`${isMobile ? "text-xs" : ""}`}>All</span>
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
              >
                <Video className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                <span className={`${isMobile ? "text-xs" : ""}`}>Videos</span>
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="articles" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Articles</span>
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Courses</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {isMobile && (
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="articles" className="flex items-center flex-col space-y-1 py-3">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">Articles</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center flex-col space-y-1 py-3">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Courses</span>
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          {/* All Content */}
          <TabsContent value="all" className="space-y-8">
            {/* Show all videos and all articles (Firebase + static) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {allVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    {video.videoUrl ? (
                      <video src={video.videoUrl} controls className="w-full h-48 object-cover rounded-t-lg" />
                    ) : (
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {video.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className={`${isMobile ? "text-sm" : "text-base"} font-semibold mb-2 line-clamp-2`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allArticles.map((article) => (
                <Link key={article.id} href={`/article/${article.id}`} passHref legacyBehavior>
                  <a style={{ textDecoration: 'none' }}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      {article.coverImage && (
                        <div className="relative w-full h-48 mb-2">
                          <Image src={article.coverImage} alt={article.title} fill className="object-cover rounded-t-lg" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {article.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{article.rating}</span>
                          </div>
                        </div>
                        <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}>{article.title}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{article.readTime}</span>
                          </div>
                          <span>{article.views} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <div
              className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-3 gap-6"}`}
            >
              {allVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    {video.videoUrl ? (
                      <video src={video.videoUrl} controls className="w-full h-48 object-cover rounded-t-lg" />
                    ) : (
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {video.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className={`${isMobile ? "text-sm" : "text-base"} font-semibold mb-2 line-clamp-2`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allArticles.map((article) => (
                <Link key={article.id} href={`/article/${article.id}`} passHref legacyBehavior>
                  <a style={{ textDecoration: 'none' }}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      {article.coverImage && (
                        <div className="relative w-full h-48 mb-2">
                          <Image src={article.coverImage} alt={article.title} fill className="object-cover rounded-t-lg" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {article.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{article.rating}</span>
                          </div>
                        </div>
                        <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}>{article.title}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{article.readTime}</span>
                          </div>
                          <span>{article.views} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div
              className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-1 gap-4" : "md:grid-cols-2 gap-6"}`}
            >
              {allCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {course.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-3`}>{course.title}</h4>
                    {/* Course Lessons Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {course.lessons?.length || course.sessions} lessons:
                      </p>
                      <div className="space-y-1">
                        {course.lessons?.slice(0, 3).map((lesson: any, index: number) => (
                          <div key={lesson.id || index} className="flex items-center space-x-2 text-xs text-gray-500">
                            {lesson.type === "video" ? (
                              <Video className="h-3 w-3 text-blue-500" />
                            ) : (
                              <FileText className="h-3 w-3 text-green-500" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                            <span className="text-gray-400">•</span>
                            <span>{lesson.duration}</span>
                          </div>
                        ))}
                        {course.lessons && course.lessons.length > 3 && (
                          <p className="text-xs text-gray-400 pl-5">+{course.lessons.length - 3} more lessons</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration || ""}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{course.participants || 0} enrolled</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Latest Content (only show on All tab) */}
        {activeTab === "all" && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestContent.map((item) => (
                item.type === 'video' ? (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      {item.videoUrl ? (
                        <video src={item.videoUrl} controls className="w-full h-48 object-cover rounded-t-lg" />
                      ) : (
                        <Image
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className={`${isMobile ? "text-sm" : "text-base"} font-semibold mb-2 line-clamp-2`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>{item.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Link key={item.id} href={`/article/${item.id}`} passHref legacyBehavior>
                    <a style={{ textDecoration: 'none' }}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        {item.coverImage && (
                          <div className="relative w-full h-48 mb-2">
                            <Image src={item.coverImage} alt={item.title} fill className="object-cover rounded-t-lg" />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {item.category}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{item.rating}</span>
                            </div>
                          </div>
                          <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}>{item.title}</h4>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{item.readTime}</span>
                            </div>
                            <span>{item.views} views</span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </Link>
                )
              ))}
            </div>
          </section>
        )}
      </main>
    ),
    [isMobile, isTablet, activeTab, selectedFilter, CreateContentDialog, latestContent],
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/content"
        showBottomNav={true}
        unreadNotifications={hasUnreadMessages ? 1 : 0}
        unreadMessages={0}
        hasNewContent={false}
      >
        {MainContent}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {DesktopHeader}
      {MainContent}
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
  )
} 