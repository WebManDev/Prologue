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
  MessageSquare,
  Search,
  X,
  Home,
  MessageCircle,
  Bell,
  FileText,
  LayoutDashboard,
  Lock,
  Crown,
  MoreHorizontal,
  Play,
  Bookmark,
  Heart,
  Eye,
  TrendingUp,
  Filter,
  Grid,
  List,
  Clock,
  BookOpen,
  PlayCircle,
  Headphones,
  Share2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { auth } from "@/lib/firebase"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { getAthleteProfile, getMemberProfile } from "@/lib/firebase"
import AthleteMobileNavigation from "@/components/mobile/athlete-mobile-navigation"
import { usePathname } from "next/navigation"
import { AutoplayVideo } from "@/components/ui/autoplay-video"

// Helper: Upload a file to Firebase Storage and return the download URL
async function uploadFileToStorage(path: string, file: File): Promise<string> {
  const storage = getStorage();
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

export default function ContentPage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()
  const pathname = usePathname()

  // Optimized logout hook
  const { logout, loadingState } = useUnifiedLogout()

  // Contexts
  const { hasUnreadMessages } = useNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"all" | "videos" | "courses">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [likedContent, setLikedContent] = useState<Set<string>>(new Set())
  const [savedContent, setSavedContent] = useState<Set<string>>(new Set())

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "video" as "video" | "course",
    isPrivate: false,
    file: null as File | File[] | null, // allow array for courses
    thumbnail: null as File | null,
  })
  const [isUploading, setIsUploading] = useState(false)

  const [showCourseModal, setShowCourseModal] = useState(false)
  // Update courseForm.videos to use files: File[]
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail: null as File | null,
    videos: [] as Array<{
      id: string
      title: string
      files: File[]
      existingVideoId?: string
      order: number
    }>,
  })
  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  // Define type for existing videos
  type ExistingVideo = { id: string; title: string; duration: string };
  const [existingVideos, setExistingVideos] = useState<ExistingVideo[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editUploading, setEditUploading] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      // Try member profile first
      const memberProfile = await getMemberProfile(auth.currentUser.uid);
      if (memberProfile) {
        setUserProfile({
          ...memberProfile,
          profileImageUrl: memberProfile.profileImageUrl || null,
        });
        setProfileImageUrl(memberProfile.profileImageUrl || null);
        return;
      }
      // If not a member, try athlete profile
      const athleteProfile = await getAthleteProfile(auth.currentUser.uid);
      if (athleteProfile) {
        const athletePhoto = athleteProfile.profilePhotoUrl || athleteProfile.profileImageUrl || athleteProfile.profilePicture || athleteProfile.avatar || null;
        setUserProfile({
          ...athleteProfile,
          profileImageUrl: athletePhoto,
        });
        setProfileImageUrl(athletePhoto);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const fetchExistingVideos = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const db = getFirestore();
      const videosQ = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const videosSnapshot = await getDocs(videosQ);
      const userVideos = videosSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((video: any) => video.authorId === user.uid);
      setExistingVideos(userVideos.map((v: any) => ({
        id: v.id,
        title: v.title || "Untitled Video",
        duration: v.duration || "",
      })));
    };
    fetchExistingVideos();
  }, [showCourseModal]);

  // Content categories
  const categories = useMemo(
    () => [
      "Training",
      "Nutrition",
      "Mental Health",
      "Recovery",
      "Technique",
      "Strategy",
      "Equipment",
      "Motivation",
      "Injury Prevention",
      "Performance Analysis",
    ],
    [],
  )

  // State for real content
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Creator profile cache: { [userId]: { firstName, lastName, profileImageUrl, isVerified } }
  const [creatorProfiles, setCreatorProfiles] = useState<Record<string, any>>({});

  // Fetch videos and courses from Firestore
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const db = getFirestore();
      // Fetch videos
      const videosQ = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const videosSnapshot = await getDocs(videosQ);
      const videos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Fetch courses
      const coursesQ = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const coursesSnapshot = await getDocs(coursesQ);
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "course" }));
      // Combine
      setContent([...videos, ...courses]);
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Remove mockContent and use real content
  // Filter content based on active tab and selected categories
  const filteredContent = useMemo(() => {
    const userId = auth && auth.currentUser ? auth.currentUser.uid : null;
    let filtered = content;

    if (!userId) return [];

    // Only show content created by the current user
    if (userId) {
      filtered = filtered.filter((item) => {
        if (item.type === "video" || !item.type) {
          return item.authorId === userId;
        } else if (item.type === "course") {
          // Accept both authorId and athleteId for course ownership
          return item.athleteId === userId || item.authorId === userId;
        }
        return false;
      });
    }

    // Filter by content type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => {
        switch (activeTab) {
          case "videos":
            return item.type === "video" || !item.type; // fallback for old docs
          case "courses":
            return item.type === "course";
          default:
            return true;
        }
      });
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) => selectedCategories.includes(item.category));
    }

    // Sort content
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "trending":
          return (b.likes || 0) - (a.likes || 0);
        case "recent":
        default:
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return filtered;
  }, [content, activeTab, selectedCategories, sortBy]);

  // Quick search suggestions
  const quickSearches = useMemo(
    () => [
      "Training techniques",
      "Nutrition tips",
      "Mental performance",
      "Recovery methods",
      "Injury prevention",
      "Equipment reviews",
      "Workout routines",
      "Sports psychology",
    ],
    [],
  )

  // Social media interaction handlers
  const handleLike = useCallback((contentId: string) => {
    setLikedContent((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(contentId)) {
        newSet.delete(contentId)
      } else {
        newSet.add(contentId)
      }
      return newSet
    })
  }, [])

  const handleSave = useCallback((contentId: string) => {
    setSavedContent((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(contentId)) {
        newSet.delete(contentId)
      } else {
        newSet.add(contentId)
      }
      return newSet
    })
  }, [])

  const handleShare = useCallback((contentId: string) => {
    console.log("Sharing content:", contentId)
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

  // Category filter handlers
  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedCategories([])
    setFilterOpen(false)
  }, [])

  const handleCreateContent = useCallback(() => {
    setShowCreateModal(true)
  }, [])

  const handleCreateFormChange = useCallback((field: string, value: any) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleFileUpload = useCallback((field: "file" | "thumbnail", file: File | File[] | null) => {
    setCreateForm((prev) => ({ ...prev, [field]: file }))
  }, [])

  const handleSubmitContent = useCallback(async () => {
    if (!createForm.title || !createForm.description || !createForm.category || !createForm.file) {
      alert("Please fill in all required fields and upload a file")
      return
    }

    setIsUploading(true)
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create content.");
        throw new Error("Not logged in");
      }
      const athleteId = user.uid;
      const db = getFirestore();

      if (createForm.type === "video" && createForm.file instanceof File) {
        // Video upload logic (single file)
        const videoUrl = await uploadFileToStorage(
          `videos/${athleteId}_${Date.now()}_${createForm.file.name}`,
          createForm.file
        );
        // Get video duration
        const getVideoDuration = (file: File): Promise<string> => {
          return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
              window.URL.revokeObjectURL(video.src);
              const duration = video.duration;
              const minutes = Math.floor(duration / 60);
              const seconds = Math.floor(duration % 60);
              resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            };
            video.src = URL.createObjectURL(file);
          });
        };
        const duration = await getVideoDuration(createForm.file);
        let thumbnailUrl = null;
        if (createForm.thumbnail) {
          thumbnailUrl = await uploadFileToStorage(
            `video-thumbnails/${athleteId}_${Date.now()}_${createForm.thumbnail.name}`,
            createForm.thumbnail
          );
        }
        const videoDoc = await addDoc(collection(db, "videos"), {
          title: createForm.title,
          description: createForm.description,
          category: createForm.category,
          type: createForm.type,
          videoUrl,
          thumbnailUrl,
          duration,
          authorId: athleteId,
          isPrivate: createForm.isPrivate,
          createdAt: serverTimestamp(),
          views: 0,
          likes: 0,
          comments: 0,
          creator: userProfile && userProfile.firstName && userProfile.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : "Anonymous",
          creatorProfileImageUrl: userProfile?.profileImageUrl || null,
          creatorVerified: false,
          publishedAt: new Date().toLocaleDateString(),
          isNew: true,
          isPremium: createForm.isPrivate,
        });
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContent(videos);
        setCreateForm({
          title: "",
          description: "",
          category: "",
          type: "video",
          isPrivate: false,
          file: null,
          thumbnail: null,
        })
        setShowCreateModal(false)
        alert("Video created successfully!")
      } else if (createForm.type === "course" && Array.isArray(createForm.file)) {
        // Course upload logic (multiple files)
        let thumbnailUrl = null;
        if (createForm.thumbnail) {
          thumbnailUrl = await uploadFileToStorage(
            `course-thumbnails/${athleteId}_${Date.now()}_${createForm.thumbnail.name}`,
            createForm.thumbnail
          );
        }
        const fileUrls = [];
        for (const file of createForm.file) {
          const ext = file.name.split('.').pop();
          const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'other';
          const fileUrl = await uploadFileToStorage(
            `course-materials/${athleteId}_${Date.now()}_${file.name}`,
            file
          );
          fileUrls.push({ url: fileUrl, type: fileType, name: file.name, ext });
        }
        const courseDoc = await addDoc(collection(db, "courses"), {
          title: createForm.title,
          description: createForm.description,
          category: createForm.category,
          type: "course",
          files: fileUrls,
          thumbnailUrl,
          authorId: athleteId,
          isPrivate: createForm.isPrivate,
          createdAt: serverTimestamp(),
          creator: userProfile && userProfile.firstName && userProfile.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : "Anonymous",
          creatorProfileImageUrl: userProfile?.profileImageUrl || null,
        });
        setCreateForm({
          title: "",
          description: "",
          category: "",
          type: "video",
          isPrivate: false,
          file: null,
          thumbnail: null,
        })
        setShowCreateModal(false)
        alert("Course created successfully!")
      } else {
        alert("Invalid file selection.");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Content creation failed:", error.message, error.stack)
        alert("Content creation failed: " + error.message)
      } else {
        console.error("Content creation failed:", error)
        alert("Content creation failed. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }, [createForm])

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false)
    setCreateForm({
      title: "",
      description: "",
      category: "",
      type: "video",
      isPrivate: false,
      file: null,
      thumbnail: null,
    })
  }, [])

  const handleCreateCourse = useCallback(() => {
    setShowCourseModal(true)
  }, [])

  const handleCourseFormChange = useCallback((field: string, value: any) => {
    setCourseForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCourseThumbnailUpload = useCallback((file: File | null) => {
    setCourseForm((prev) => ({ ...prev, thumbnail: file }))
  }, [])

  // Update addVideoToCourse to use files: []
  const addVideoToCourse = useCallback(() => {
    const newVideo = {
      id: `video-${Date.now()}`,
      title: "",
      files: [],
      order: courseForm.videos.length + 1,
    }
    setCourseForm((prev) => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }))
  }, [courseForm.videos.length])

  const addExistingVideoToCourse = useCallback(
    (videoId: string, videoTitle: string) => {
      const newVideo = {
        id: `existing-${Date.now()}`,
        title: videoTitle,
        files: [],
        existingVideoId: videoId,
        order: courseForm.videos.length + 1,
      }
      setCourseForm((prev) => ({
        ...prev,
        videos: [...prev.videos, newVideo],
      }))
    },
    [courseForm.videos.length],
  )

  // Update courseForm.videos to use files: File[]
  const updateCourseVideo = useCallback((videoId: string, field: string, value: any) => {
    setCourseForm((prev) => ({
      ...prev,
      videos: prev.videos.map((video) => (video.id === videoId ? { ...video, [field]: value } : video)),
    }))
  }, [])

  const removeCourseVideo = useCallback((videoId: string) => {
    setCourseForm((prev) => ({
      ...prev,
      videos: prev.videos
        .filter((video) => video.id !== videoId)
        .map((video, index) => ({
          ...video,
          order: index + 1,
        })),
    }))
  }, [])

  const reorderCourseVideos = useCallback((fromIndex: number, toIndex: number) => {
    setCourseForm((prev) => {
      const newVideos = [...prev.videos]
      const [movedVideo] = newVideos.splice(fromIndex, 1)
      newVideos.splice(toIndex, 0, movedVideo)
      return {
        ...prev,
        videos: newVideos.map((video, index) => ({ ...video, order: index + 1 })),
      }
    })
  }, [])

  // Refactor handleSubmitCourse to accept a course object
  const handleSubmitCourse = useCallback(async (courseData?: typeof courseForm) => {
    const course = courseData || courseForm;
    if (!course.title || !course.description || course.videos.length === 0) {
      alert("Please fill in all required fields and add at least one video");
      return;
    }
    setIsCreatingCourse(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create a course.");
        throw new Error("Not logged in");
      }
      const athleteId = user.uid;
      let thumbnailUrl = null;
      if (course.thumbnail) {
        thumbnailUrl = await uploadFileToStorage(`course-thumbnails/${athleteId}_${Date.now()}_${course.thumbnail.name}`, course.thumbnail);
      }
      const db = getFirestore();
      const videoRefs: Array<{ videoId: string; order: number; title: string }> = [];
      for (const video of course.videos) {
        if (video.existingVideoId) {
          videoRefs.push({ videoId: video.existingVideoId, order: video.order, title: video.title });
        } else if (video.files && video.files.length > 0) {
          const fileUrls = [];
          for (const file of video.files) {
            const ext = file.name.split('.').pop();
            const fileType = file.type.startsWith('image/') ? 'image' : 'video';
            const fileUrl = await uploadFileToStorage(`course-materials/${athleteId}_${Date.now()}_${file.name}`, file);
            fileUrls.push({ url: fileUrl, type: fileType, name: file.name, ext });
          }
          const videoDoc = await addDoc(collection(db, "videos"), {
            title: video.title,
            files: fileUrls,
            authorId: athleteId,
            createdAt: serverTimestamp(),
            order: video.order,
          });
          videoRefs.push({ videoId: videoDoc.id, order: video.order, title: video.title });
        }
      }
      const courseDoc = await addDoc(collection(db, "courses"), {
        title: course.title,
        description: course.description,
        thumbnailUrl,
        athleteId,
        createdAt: serverTimestamp(),
        videos: videoRefs,
      });
      setCourseForm({
        title: "",
        description: "",
        thumbnail: null,
        videos: [],
      });
      setShowCreateModal(false);
      alert("Course created successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Course creation failed:", error.message, error.stack);
        alert("Course creation failed: " + error.message);
      } else {
        console.error("Course creation failed:", error);
        alert("Course creation failed. Please try again.");
      }
    } finally {
      setIsCreatingCourse(false);
    }
  }, [courseForm]);

  const closeCourseModal = useCallback(() => {
    setShowCourseModal(false)
    setCourseForm({
      title: "",
      description: "",
      thumbnail: null,
      videos: [],
    })
  }, [])

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

  // Optimized logout handler
  const handleLogout = async () => {
    try {
      await logout({
        onComplete: () => {
          window.location.href = "/"
        },
        onError: (error: any) => {
          console.error("Logout error:", error)
        },
      })
    } catch (error) {
      console.error("Logout failed:", error)
      window.location.href = "/"
    }
  }

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />
      case "article":
        return <FileText className="h-4 w-4" />
      case "course":
        return <BookOpen className="h-4 w-4" />
      case "podcast":
        return <Headphones className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get content duration/read time
  const getContentDuration = (item: any) => {
    if (item.duration) return item.duration
    if (item.readTime) return item.readTime
    if (item.lessons) return `${item.lessons} lessons`
    return ""
  }

  // Fetch creator profiles for all unique authorIds in filteredContent
  useEffect(() => {
    const fetchCreators = async () => {
      // Get all unique authorIds from filteredContent
      const ids = Array.from(new Set(filteredContent.map(item => item.authorId).filter(Boolean)));
      // Only fetch if not already cached
      const idsToFetch = ids.filter(id => !creatorProfiles[id]);
      if (idsToFetch.length === 0) return;
      const newProfiles: Record<string, any> = {};
      for (const id of idsToFetch) {
        let profile = await getAthleteProfile(id);
        if (!profile) profile = await getMemberProfile(id);
        if (profile) {
          let profileImageUrl = null;
          if (profile.profilePhotoUrl) profileImageUrl = profile.profilePhotoUrl;
          else if (profile.profileImageUrl) profileImageUrl = profile.profileImageUrl;
          else if (profile.profilePicture) profileImageUrl = profile.profilePicture;
          else if (profile.avatar) profileImageUrl = profile.avatar;
          else if (profile.coverPhotoUrl) profileImageUrl = profile.coverPhotoUrl;
          newProfiles[id] = {
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            profileImageUrl,
            isVerified: profile.isVerified || false,
          };
        } else {
          newProfiles[id] = {
            firstName: "",
            lastName: "",
            profileImageUrl: "",
            isVerified: false,
          };
        }
      }
      setCreatorProfiles(prev => ({ ...prev, ...newProfiles }));
    };
    fetchCreators();
    // Only run when filteredContent or creatorProfiles changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredContent]);

  // Add delete handler
  const handleDeleteContent = useCallback(async (item: any) => {
    if (!window.confirm("Are you sure you want to permanently delete this content?")) return;
    const db = getFirestore();
    if (item.type === "video" || !item.type) {
      await deleteDoc(doc(db, "videos", item.id));
      // Optionally: delete from Firebase Storage as well
    } else if (item.type === "course") {
      await deleteDoc(doc(db, "courses", item.id));
    }
    setContent((prev) => prev.filter((c) => c.id !== item.id));
  }, []);

  const handleEditContent = useCallback((item: any) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      type: item.type || 'video',
      file: null,
      thumbnail: null,
      isPrivate: item.isPrivate || false,
    });
    setShowEditModal(true);
  }, []);

  const handleEditFormChange = useCallback((field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingItem) return;
    setEditUploading(true);
    const db = getFirestore();
    const docRef = doc(db, editingItem.type === 'course' ? 'courses' : 'videos', editingItem.id);
    let updateData: any = {
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      isPrivate: editForm.isPrivate,
    };
    // If video, handle file and thumbnail re-upload
    if ((editingItem.type === 'video' || !editingItem.type)) {
      if (editForm.file && editForm.file instanceof File) {
        // Upload new video file
        const videoUrl = await uploadFileToStorage(
          `videos/${editingItem.authorId}_${Date.now()}_${editForm.file.name}`,
          editForm.file
        );
        // Get duration
        const getVideoDuration = (file: File): Promise<string> => {
          return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
              window.URL.revokeObjectURL(video.src);
              const duration = video.duration;
              const minutes = Math.floor(duration / 60);
              const seconds = Math.floor(duration % 60);
              resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            };
            video.src = URL.createObjectURL(file);
          });
        };
        updateData.videoUrl = videoUrl;
        updateData.duration = await getVideoDuration(editForm.file);
      }
      if (editForm.thumbnail && editForm.thumbnail instanceof File) {
        const thumbnailUrl = await uploadFileToStorage(
          `video-thumbnails/${editingItem.authorId}_${Date.now()}_${editForm.thumbnail.name}`,
          editForm.thumbnail
        );
        updateData.thumbnailUrl = thumbnailUrl;
      }
    }
    await updateDoc(docRef, updateData);
    setContent((prev) => prev.map((c) => c.id === editingItem.id ? { ...c, ...editForm, ...updateData } : c));
    setShowEditModal(false);
    setEditingItem(null);
    setEditUploading(false);
  }, [editForm, editingItem]);

  // Add state for video modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Fixed Navigation */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/Prologue LOGO-1.png"
                alt="PROLOGUE"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-lg font-athletic font-bold text-gray-900 tracking-wider">PROLOGUE</span>
          </Link>

          {/* Right Actions - Search, Bell, Dropdown */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowSearchDropdown(true)}>
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Notification Bell */}
            <Link href="/notifications" className="relative">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {hasUnreadMessages && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </Button>
            </Link>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={loadingState.isLoading}>
                  <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                    {userProfile?.profileImageUrl || userProfile?.coverPhotoUrl ? (
                      <Image src={userProfile.profileImageUrl || userProfile.coverPhotoUrl} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full text-gray-500 p-1" />
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/athleteDashboard" className="flex items-center w-full cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/promote" className="flex items-center w-full cursor-pointer">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Promote
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center w-full cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={loadingState.isLoading}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {loadingState.isLoading ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearchDropdown && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Button variant="ghost" size="sm" className="p-2 mr-2" onClick={() => setShowSearchDropdown(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Searches</h3>
              <div className="space-y-2">
                {quickSearches.slice(0, 8).map((search, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => handleSearchSelect(search)}
                  >
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
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

              <div className="flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onFocus={handleSearchFocus}
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

                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
                      <div className="space-y-1">
                        {quickSearches.slice(0, 8).map((search, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                            onClick={() => handleSearchSelect(search)}
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/content"
                  className="flex flex-col items-center space-y-1 text-blue-500 transition-colors group relative"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Content</span>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                </Link>
                <Link
                  href="/feedback"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
                <Link
                  href="/notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={loadingState.isLoading}>
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        {userProfile?.profileImageUrl || userProfile?.coverPhotoUrl ? (
                          <Image src={userProfile.profileImageUrl || userProfile.coverPhotoUrl} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-full h-full text-gray-500 p-1" />
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/athleteDashboard" className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/promote" className="flex items-center w-full cursor-pointer">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={loadingState.isLoading}>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Page Header */}

        {/* Content Type Tabs with Create Content Button */}
        <div className="flex items-center justify-between mb-6 bg-white/50 backdrop-blur-sm rounded-lg p-1">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "all" ? "bg-white text-blue-500 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "videos" ? "bg-white text-blue-500 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-4 w-4" />
                <span>Videos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "courses" ? "bg-white text-blue-500 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
              </div>
            </button>
          </div>

          {/* Create Content/Course Buttons - Desktop */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Remove Create Course Button */}
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium"
              onClick={handleCreateContent}
            >
              Create Video
            </Button>
          </div>
        </div>

        {/* Create Content/Course Buttons - Mobile */}
        <div className="sm:hidden flex flex-col space-y-2 mb-6">
          {/* Remove Create Course Button */}
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-base font-semibold w-full max-w-xs mx-auto"
            onClick={handleCreateContent}
          >
            Create Video
          </Button>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`${selectedCategories.length > 0 ? "bg-blue-50 border-blue-500 text-blue-600" : ""}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {selectedCategories.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs">{selectedCategories.length}</Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  {sortBy === "recent" ? "Recent" : sortBy === "popular" ? "Popular" : "Trending"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("trending")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <Card className="mb-6 bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filter by Category</h3>
                {selectedCategories.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-500">
                    Clear All
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Grid/List */}
        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
            {filteredContent.map((item) => (
              <Card
                key={item.id}
                className={`bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  item.isNew ? "border-blue-500/30 shadow-md" : ""
                } ${viewMode === "list" ? "flex" : ""}`}
              >
                <CardContent className={`p-0 ${viewMode === "list" ? "flex w-full" : ""}`}>
                  {/* Thumbnail */}
                  <div
                    className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-video"} bg-gray-200 overflow-hidden ${viewMode === "grid" ? "rounded-t-lg" : "rounded-l-lg"}`}
                  >
                    {item.type === "video" && item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title || "Video thumbnail"}
                        fill
                        className="object-cover w-full h-full"
                        style={{ objectFit: 'cover' }}
                        priority={false}
                      />
                    ) : (item.type === "course" && item.thumbnailUrl) ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title || "Course thumbnail"}
                        fill
                        className="object-cover w-full h-full"
                        style={{ objectFit: 'cover' }}
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        {item.type === "video" ? (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center mb-2 mx-auto">
                              <Play className="h-6 w-6 text-white ml-0.5" />
                            </div>
                            {item.duration && (
                              <Badge className="bg-black/70 text-white text-xs">{typeof item.duration === 'string' || typeof item.duration === 'number' ? item.duration : ''}</Badge>
                            )}
                          </div>
                        ) : item.type === "course" ? (
                          <div className="text-center">
                            <BookOpen className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                            {item.lessons && (
                              <Badge className="bg-black/70 text-white text-xs">{typeof item.lessons === 'string' || typeof item.lessons === 'number' ? `${item.lessons} lessons` : ''}</Badge>
                            )}
                          </div>
                        ) : item.type === "podcast" ? (
                          <div className="text-center">
                            <Headphones className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                            {item.duration && (
                              <Badge className="bg-black/70 text-white text-xs">{typeof item.duration === 'string' || typeof item.duration === 'number' ? item.duration : ''}</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                            {item.readTime && (
                              <Badge className="bg-black/70 text-white text-xs">{typeof item.readTime === 'string' || typeof item.readTime === 'number' ? item.readTime : ''}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Premium Overlay */}
                    {item.isPremium && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-xs font-medium">Premium</p>
                        </div>
                      </div>
                    )}

                    {/* New Badge */}
                    {item.isNew && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                      </div>
                    )}

                    {/* Content Type Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-white text-xs flex items-center space-x-1">
                        {getContentTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-gray-900 hover:text-blue-500 transition-colors ${viewMode === "list" ? "text-lg" : "text-base"} line-clamp-2`}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
                            {creatorProfiles[item.authorId]?.profileImageUrl ? (
                              <Image src={creatorProfiles[item.authorId].profileImageUrl} alt="Profile" width={24} height={24} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-full h-full text-gray-500 p-1" />
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600 group-hover:text-blue-500">
                              {creatorProfiles[item.authorId]?.firstName || creatorProfiles[item.authorId]?.lastName
                                ? `${creatorProfiles[item.authorId]?.firstName || ""} ${creatorProfiles[item.authorId]?.lastName || ""}`.trim()
                                : "Anonymous"}
                            </span>
                            {creatorProfiles[item.authorId]?.isVerified && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <span><MoreHorizontal className="h-4 w-4 cursor-pointer" /></span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.authorId === auth.currentUser?.uid && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditContent(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteContent(item)} className="text-red-600">Delete</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Button>
                    </div>

                    {/* Description */}
                    <p
                      className={`text-gray-600 mb-3 ${viewMode === "list" ? "line-clamp-2" : "line-clamp-3"} text-sm leading-relaxed`}
                    >
                      {item.description}
                    </p>

                    {/* Category and Stats */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gray-100 text-gray-700 text-xs">{typeof item.category === 'string' ? item.category : '[No Category]'}</Badge>
                        <span className="text-xs text-gray-500">{item.publishedAt}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{(item.views ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{(item.likes ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{(item.comments ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${likedContent.has(item.id) ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                          onClick={() => handleLike(item.id)}
                        >
                          <Heart className={`h-4 w-4 ${likedContent.has(item.id) ? "fill-current" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-green-600"
                          onClick={() => handleShare(item.id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`${savedContent.has(item.id) ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
                          onClick={() => handleSave(item.id)}
                        >
                          <Bookmark className={`h-4 w-4 ${savedContent.has(item.id) ? "fill-current" : ""}`} />
                        </Button>
                        {item.isPremium ? (
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            Subscribe
                          </Button>
                        ) : (
                          item.type === 'course' ? (
                            <Link href={`/course/${item.id}`}>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/video/${item.id}`}>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No content found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms to find the content you're looking for.
              </p>
              <Button onClick={clearFilters} className="bg-blue-500 hover:bg-blue-600 text-white">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Content Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {createForm.type === "video" ? "Create Video" : "Create Content"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={closeCreateModal}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Content Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleCreateFormChange("type", "video")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                          createForm.type === "video"
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <PlayCircle className="h-4 w-4" />
                        <span>Video</span>
                      </button>
                      <button
                        onClick={() => handleCreateFormChange("type", "course")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                          createForm.type === "course"
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Course</span>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => handleCreateFormChange("title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter content title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => handleCreateFormChange("description", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your content"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => handleCreateFormChange("category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File Upload or Course Videos Section */}
                  {createForm.type === "video" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload("file", e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="space-y-2">
                            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <span className="text-blue-500 hover:text-blue-600">Click to upload</span>
                              <span className="text-gray-500"> or drag and drop</span>
                            </div>
                            {createForm.file && (
                              <p className="text-sm text-green-600">Selected: {(createForm.file as File).name}</p>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    // Course Videos Section for Course Type
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Videos *</label>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVideoToCourse}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add New Video
                        </Button>
                        <span className="text-sm text-gray-500">or add from existing:</span>
                        {existingVideos.map((video) => (
                          <Button
                            key={video.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addExistingVideoToCourse(video.id, video.title)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            {video.title} ({video.duration})
                          </Button>
                        ))}
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {courseForm.videos.map((video, index) => (
                          <div key={video.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                {video.order}
                              </div>
                              <div className="flex-1 space-y-3">
                                <input
                                  type="text"
                                  value={video.title}
                                  onChange={(e) => updateCourseVideo(video.id, "title", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Video title"
                                  disabled={!!video.existingVideoId}
                                />
                                {!video.existingVideoId && (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                                    <input
                                      type="file"
                                      accept="video/*"
                                      multiple={false}
                                      onChange={(e) => updateCourseVideo(video.id, "files", Array.from(e.target.files || []))}
                                      className="hidden"
                                      id={`video-upload-${video.id}`}
                                    />
                                    <label htmlFor={`video-upload-${video.id}`} className="cursor-pointer">
                                      <div className="text-center">
                                        <PlayCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                        <span className="text-sm text-blue-500 hover:text-blue-600">
                                          {video.files && video.files.length > 0 && (
                                            <ul className="mt-2 text-left">
                                              {video.files.map((file, idx) => (
                                                <li key={idx} className="flex items-center space-x-2 text-xs text-gray-700">
                                                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Play className="w-3 h-3 text-green-500" />
                                                  </span>
                                                  <span>{file.name}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                )}
                                {video.existingVideoId && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                      <PlayCircle className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm text-blue-600">Using existing video</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col space-y-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => reorderCourseVideos(index, Math.max(0, index - 1))}
                                  disabled={index === 0}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => reorderCourseVideos(index, Math.min(courseForm.videos.length - 1, index + 1))}
                                  disabled={index === courseForm.videos.length - 1}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCourseVideo(video.id)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {courseForm.videos.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No videos added yet. Add videos to create your course.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload("thumbnail", e.target.files?.[0] || null)}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <div className="mx-auto w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-blue-500 hover:text-blue-600 text-sm">Upload thumbnail</span>
                          </div>
                          {createForm.thumbnail && (
                            <p className="text-xs text-green-600">Selected: {createForm.thumbnail.name}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Privacy Setting */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="private-content"
                      checked={createForm.isPrivate}
                      onChange={(e) => handleCreateFormChange("isPrivate", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="private-content" className="text-sm text-gray-700">
                      Make this content private (only visible to subscribers)
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={closeCreateModal}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={isUploading || isCreatingCourse}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (createForm.type === "course") {
                          handleSubmitCourse({
                            title: createForm.title,
                            description: createForm.description,
                            thumbnail: createForm.thumbnail,
                            videos: courseForm.videos,
                          });
                        } else {
                          handleSubmitContent();
                        }
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isUploading || isCreatingCourse}
                    >
                      {(isUploading || isCreatingCourse) ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{createForm.type === "course" ? "Creating Course..." : "Uploading Video..."}</span>
                        </div>
                      ) : (
                        createForm.type === "course" ? "Create Course" : "Create Video"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Creation Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create Training Course</h2>
                  <Button variant="ghost" size="sm" onClick={closeCourseModal}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Course Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => handleCourseFormChange("title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter course title"
                    />
                  </div>

                  {/* Course Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Description *</label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => handleCourseFormChange("description", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe what students will learn in this course"
                    />
                  </div>

                  {/* Course Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCourseThumbnailUpload(e.target.files?.[0] || null)}
                        className="hidden"
                        id="course-thumbnail-upload"
                      />
                      <label htmlFor="course-thumbnail-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <div className="mx-auto w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <span className="text-green-500 hover:text-green-600 text-sm">Upload course thumbnail</span>
                          </div>
                          {courseForm.thumbnail && (
                            <p className="text-xs text-green-600">Selected: {courseForm.thumbnail.name}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Course Videos Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Course Videos *</label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVideoToCourse}
                          className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add New Video
                        </Button>
                      </div>
                    </div>

                    {/* Existing Videos to Add */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Add from existing videos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {existingVideos.map((video) => (
                          <Button
                            key={video.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addExistingVideoToCourse(video.id, video.title)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            {video.title} ({video.duration})
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Course Video List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {courseForm.videos.map((video, index) => (
                        <div key={video.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {video.order}
                            </div>
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                value={video.title}
                                onChange={(e) => updateCourseVideo(video.id, "title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Video title"
                                disabled={!!video.existingVideoId}
                              />
                              {!video.existingVideoId && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    multiple={false}
                                    onChange={(e) => updateCourseVideo(video.id, "files", Array.from(e.target.files || []))}
                                    className="hidden"
                                    id={`video-upload-${video.id}`}
                                  />
                                  <label htmlFor={`video-upload-${video.id}`} className="cursor-pointer">
                                    <div className="text-center">
                                      <PlayCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                      <span className="text-sm text-blue-500 hover:text-blue-600">
                                        {video.files && video.files.length > 0 && (
                                          <ul className="mt-2 text-left">
                                            {video.files.map((file, idx) => (
                                              <li key={idx} className="flex items-center space-x-2 text-xs text-gray-700">
                                                {file.type.startsWith('image/') ? (
                                                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                  </span>
                                                ) : file.type.startsWith('video/') ? (
                                                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Play className="w-3 h-3 text-green-500" />
                                                  </span>
                                                ) : (
                                                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <FileText className="w-3 h-3 text-gray-400" />
                                                  </span>
                                                )}
                                                <span>{file.name}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </span>
                                    </div>
                                  </label>
                                </div>
                              )}
                              {video.existingVideoId && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <PlayCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-blue-600">Using existing video</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => reorderCourseVideos(index, Math.max(0, index - 1))}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  reorderCourseVideos(index, Math.min(courseForm.videos.length - 1, index + 1))
                                }
                                disabled={index === courseForm.videos.length - 1}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCourseVideo(video.id)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {courseForm.videos.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No videos added yet. Add videos to create your course.</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={closeCourseModal}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={isCreatingCourse}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitCourse}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      disabled={isCreatingCourse}
                      type="button"
                    >
                      {isCreatingCourse ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Course...</span>
                        </div>
                      ) : (
                        "Create Course"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Content Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit {editingItem?.type === 'course' ? 'Course' : 'Video'}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleEditFormChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => handleEditFormChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(editingItem?.type === 'video' || !editingItem?.type) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleEditFormChange('file', e.target.files?.[0] || null)}
                            className="hidden"
                            id="edit-file-upload"
                          />
                          <label htmlFor="edit-file-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <FileText className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <span className="text-blue-500 hover:text-blue-600">Click to upload</span>
                                <span className="text-gray-500"> or drag and drop</span>
                              </div>
                              {editForm.file && (
                                <p className="text-sm text-green-600">Selected: {editForm.file.name}</p>
                              )}
                              {!editForm.file && editingItem?.videoUrl && (
                                <a href={editingItem.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">Current Video</a>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditFormChange('thumbnail', e.target.files?.[0] || null)}
                            className="hidden"
                            id="edit-thumbnail-upload"
                          />
                          <label htmlFor="edit-thumbnail-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="mx-auto w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-blue-500 hover:text-blue-600 text-sm">Upload thumbnail</span>
                              </div>
                              {editForm.thumbnail && (
                                <p className="text-xs text-green-600">Selected: {editForm.thumbnail.name}</p>
                              )}
                              {!editForm.thumbnail && editingItem?.thumbnailUrl && (
                                <a href={editingItem.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">Current Thumbnail</a>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="edit-private-content"
                          checked={editForm.isPrivate}
                          onChange={(e) => handleEditFormChange('isPrivate', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="edit-private-content" className="text-sm text-gray-700">
                          Make this content private (only visible to subscribers)
                        </label>
                      </div>
                    </>
                  )}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={() => setShowEditModal(false)}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={editUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={editUploading}
                    >
                      {editUploading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation - Athlete Style */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
          <AthleteMobileNavigation currentPath={String(pathname)} unreadMessages={0} />
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowVideoModal(false)}>
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-lg font-semibold mb-4">{selectedVideo.title}</h2>
            <AutoplayVideo 
              src={selectedVideo.videoUrl} 
              controls={true}
              autoplay={false}
              muted={true}
              playsInline={true}
              className="w-full rounded-lg"
              style={{ maxHeight: 400 }}
            />
            <p className="mt-2 text-gray-600">{selectedVideo.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
