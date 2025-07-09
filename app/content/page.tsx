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
  Plus,
  Video,
  FileText,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Eye,
  TrendingUp,
  X,
  ImageIcon,
  Save,
  Trash2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useRef, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"
import { AthleteHeader } from "@/components/navigation/athlete-header"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { db } from "@/lib/firebase"
import { getAuth } from "firebase/auth"
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"
import LexicalRichTextEditor from "@/components/LexicalRichTextEditor"
import { getMemberProfile, getAthleteProfile } from "@/lib/firebase"
import { format } from "date-fns"

// Mock data for content
const CONTENT_DATA = {
  videos: [
    {
      id: 1,
      title: "Advanced Basketball Shooting Form",
      description: "Master the perfect shooting technique with detailed form analysis and practice drills.",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "15:30",
      views: 1234,
      rating: 4.8,
      category: "Basketball",
      instructor: "Coach Mike Johnson",
      uploadedAt: "2 days ago",
      tags: ["Basketball", "Shooting", "Technique"],
    },
    {
      id: 2,
      title: "Mental Performance Visualization",
      description: "Learn powerful visualization techniques used by Olympic athletes to enhance performance.",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "22:15",
      views: 892,
      rating: 4.9,
      category: "Mental Training",
      instructor: "Dr. Sarah Chen",
      uploadedAt: "5 days ago",
      tags: ["Mental", "Visualization", "Performance"],
    },
    {
      id: 3,
      title: "Injury Prevention Warm-up Routine",
      description: "Essential warm-up exercises to prevent common sports injuries.",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "12:45",
      views: 2156,
      rating: 4.7,
      category: "Training",
      instructor: "Alex Rodriguez",
      uploadedAt: "1 week ago",
      tags: ["Injury Prevention", "Warm-up", "Safety"],
    },
  ],
  articles: [
    {
      id: 1,
      title: "Understanding Pressure in Competition",
      description: "Learn to identify and manage high-pressure scenarios in competitive sports.",
      readTime: "8 min read",
      views: 567,
      rating: 4.6,
      category: "Mental Performance",
      author: "Dr. Sarah Mitchell",
      publishedAt: "3 days ago",
      tags: ["Mental", "Competition", "Pressure"],
      excerpt:
        "Pressure situations are inevitable in competitive sports. The key to success lies not in avoiding pressure, but in learning how to thrive under it...",
    },
    {
      id: 2,
      title: "Nutrition for Peak Athletic Performance",
      description: "Comprehensive guide to fueling your body for optimal athletic performance and recovery.",
      readTime: "12 min read",
      views: 1089,
      rating: 4.8,
      category: "Nutrition",
      author: "Lisa Martinez",
      publishedAt: "1 week ago",
      tags: ["Nutrition", "Performance", "Recovery"],
      excerpt:
        "What you eat directly impacts your athletic performance. This guide covers everything from pre-workout nutrition to recovery meals...",
    },
  ],
  courses: [
    {
      id: 1,
      title: "Elite Mindset Training Course",
      description:
        "Master the mental aspects of athletic performance with proven techniques used by elite athletes worldwide.",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "6 weeks",
      lessons: 5,
      participants: 450,
      rating: 4.8,
      category: "Mental Performance",
      instructor: "Dr. Sarah Mitchell",
      price: "Free",
      tags: ["Mental", "Elite", "Mindset"],
      progress: 0,
    },
    {
      id: 2,
      title: "Injury Prevention Masterclass",
      description:
        "Comprehensive guide to preventing sports injuries through proper warm-up, technique, and recovery protocols.",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "4 weeks",
      lessons: 3,
      participants: 320,
      rating: 4.9,
      category: "Training",
      instructor: "Coach Mike Rodriguez",
      price: "Free",
      tags: ["Injury Prevention", "Safety", "Training"],
      progress: 0,
    },
  ],
}

// Helper to get video duration as mm:ss
function getVideoDuration(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      const seconds = video.duration;
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
      resolve(formatted);
    };
    video.onerror = function () {
      reject('Failed to load video metadata.');
    };
    video.src = URL.createObjectURL(file);
  });
}

// Content Creation Modal Component
const CreateContentModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1) // 1: Type selection, 2: Content creation
  const [contentType, setContentType] = useState<string>("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [lessons, setLessons] = useState<any[]>([])
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [articleContent, setArticleContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [videoDuration, setVideoDuration] = useState<string>("");

  // Lesson form state
  const [lessonType, setLessonType] = useState("video")
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDescription, setLessonDescription] = useState("")
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null)
  const [lessonImageFile, setLessonImageFile] = useState<File | null>(null)
  const [lessonContent, setLessonContent] = useState("")

  const { isMobile } = useMobileDetection()

  const resetForm = () => {
    setStep(1)
    setContentType("")
    setTitle("")
    setCategory("")
    setDescription("")
    setLessons([])
    setVideoFile(null)
    setImageFile(null)
    setArticleContent("")
    setShowAddLesson(false)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      try {
        const duration = await getVideoDuration(file);
        setVideoDuration(duration);
      } catch {
        setVideoDuration("");
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  const handleLessonVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setLessonVideoFile(file)
  }

  const handleLessonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setLessonImageFile(file)
  }

  const addLesson = () => {
    if (!lessonTitle.trim()) return

    const newLesson = {
      id: Date.now().toString(),
      type: lessonType,
      title: lessonTitle,
      description: lessonDescription,
      content: lessonContent,
      videoFile: lessonVideoFile,
      imageFile: lessonImageFile,
      duration: lessonType === "video" ? "15:30" : "8 min read",
    }

    setLessons([...lessons, newLesson])

    // Reset lesson form
    setLessonTitle("")
    setLessonDescription("")
    setLessonContent("")
    setLessonVideoFile(null)
    setLessonImageFile(null)
    setShowAddLesson(false)
  }

  const removeLesson = (lessonId: string) => {
    setLessons(lessons.filter((lesson) => lesson.id !== lessonId))
  }

  const handleCreateContent = async () => {
    setIsUploading(true)
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user ? user.uid : "anonymous";
    const storage = getStorage();

    // Parse category as tags array
    const tags = category.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);

    try {
      let contentDoc = null;
      let videoUrl = null;
      let imageUrl = null;

      // Upload video file if present
      if (contentType === "video" && videoFile) {
        const videoRef = ref(storage, `videos/${userId}/${Date.now()}_${videoFile.name}`);
        await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoRef);
      }

      // Upload image file if present
      if ((contentType === "article" || contentType === "course") && imageFile) {
        const imageRef = ref(storage, `images/${userId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Prepare lessons for course (upload files if needed)
      let courseLessons = [];
      if (contentType === "course") {
        for (const lesson of lessons) {
          let lessonVideoUrl = null;
          let lessonImageUrl = null;
          if (lesson.videoFile) {
            const lessonVideoRef = ref(storage, `lessons/${userId}/${Date.now()}_${lesson.videoFile.name}`);
            await uploadBytes(lessonVideoRef, lesson.videoFile);
            lessonVideoUrl = await getDownloadURL(lessonVideoRef);
          }
          if (lesson.imageFile) {
            const lessonImageRef = ref(storage, `lessons/${userId}/${Date.now()}_${lesson.imageFile.name}`);
            await uploadBytes(lessonImageRef, lesson.imageFile);
            lessonImageUrl = await getDownloadURL(lessonImageRef);
          }
          // Only include serializable fields in Firestore
          courseLessons.push({
            id: lesson.id,
            type: lesson.type,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            duration: lesson.duration,
            videoUrl: lessonVideoUrl,
            imageUrl: lessonImageUrl,
          });
        }
      }

      // After uploading and preparing courseLessons, clear File objects from lessons state
      if (contentType === "course") {
        setLessons(lessons.map(lesson => ({
          ...lesson,
          videoFile: undefined,
          imageFile: undefined,
        })));
      }

      // Save to Firestore
      if (contentType === "video") {
        console.log("Creating video content:", {
          type: contentType,
          title,
          category,
          description,
          videoUrl,
        })

        // Create video document in Firestore
        const videoDoc = await addDoc(collection(db, "videos"), {
          title,
          category,
          description,
          videoUrl,
          imageUrl,
          authorId: userId,
          createdAt: serverTimestamp(),
          views: 0,
          rating: 0,
          tags,
          duration: videoDuration,
        })

        console.log("Video document created with ID:", videoDoc.id)
        setIsUploading(false)
        resetForm()
        onClose()
      } else if (contentType === "article") {
        console.log("Creating article content:", {
          type: contentType,
          title,
          category,
          description,
          articleContent,
        })

        // Create article document in Firestore
        const articleDoc = await addDoc(collection(db, "articles"), {
          title,
          category,
          description,
          content: articleContent,
          imageUrl,
          authorId: userId,
          createdAt: serverTimestamp(),
          views: 0,
          rating: 0,
          tags,
        })

        console.log("Article document created with ID:", articleDoc.id)
        setIsUploading(false)
        resetForm()
        onClose()
      } else if (contentType === "course") {
        console.log("Creating course content:", {
          type: contentType,
          title,
          category,
          description,
          lessons: courseLessons,
        })

        // Create course document in Firestore
        const courseDoc = await addDoc(collection(db, "courses"), {
          title,
          category,
          description,
          imageUrl,
          lessons: courseLessons,
          authorId: userId,
          createdAt: serverTimestamp(),
          participants: 0,
          rating: 0,
          tags,
        })

        console.log("Course document created with ID:", courseDoc.id)
        setIsUploading(false)
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error("Error creating content:", error);
      setIsUploading(false);
      // Optionally show an error message to the user
    }
  }

  const contentTypeOptions = [
    {
      type: "video",
      title: "Video",
      description: "Upload and share video content",
      icon: Video,
      color: "bg-red-500",
    },
    {
      type: "article",
      title: "Article",
      description: "Write and publish articles",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      type: "course",
      title: "Course",
      description: "Create structured learning courses",
      icon: BookOpen,
      color: "bg-blue-500",
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={showAddLesson ? undefined : onClose} />
      <div
        className={`relative bg-white rounded-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl ${
          isMobile ? "max-w-full h-full" : "max-w-2xl"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
            {step === 1 ? "Create New Content" : `Create ${contentType}`}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 ? (
            // Step 1: Content Type Selection
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 mb-6">Choose the type of content you want to create:</p>
              <div className="grid gap-4">
                {contentTypeOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => {
                      setContentType(option.type)
                      setStep(2)
                    }}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mr-4`}>
                      <option.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Step 2: Content Creation Form
            <div className="p-4 sm:p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <Input
                  placeholder={`Enter ${contentType} title...`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <Input
                  placeholder="e.g., Basketball, Mental Training, Nutrition"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {/* Description */}
              {contentType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    placeholder="Describe your content..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Content-specific fields */}
              {contentType === "video" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Video className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                          {videoFile ? videoFile.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-500">MP4, MOV, AVI up to 500MB</p>
                        {videoDuration && (
                          <span className="text-xs text-gray-700 mt-2">Duration: {videoDuration}</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Article Content */}
              {contentType === "article" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Article Content *</label>
                  <LexicalRichTextEditor value={articleContent} onChange={setArticleContent} />
                </div>
              )}

              {contentType === "course" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Course Lessons</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddLesson(true)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                  </div>

                  {lessons.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              {lesson.type === "video" ? (
                                <Video className="h-4 w-4 text-blue-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {index + 1}. {lesson.title}
                              </p>
                              <p className="text-xs text-gray-600">{lesson.duration}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(lesson.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Lesson Modal */}
                  {showAddLesson && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddLesson(false)} />
                      <div
                        className={`relative bg-white rounded-xl shadow-xl ${
                          isMobile
                            ? "w-full max-w-full h-full overflow-y-auto"
                            : "max-w-md w-full max-h-[80vh] overflow-y-auto"
                        }`}
                      >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold">Add Course Lesson</h3>
                          <Button variant="ghost" size="sm" onClick={() => setShowAddLesson(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setLessonType("video")}
                                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                                  lessonType === "video" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}
                              >
                                <Video className="h-5 w-5" />
                                <span className="text-sm">Video</span>
                              </button>
                              <button
                                onClick={() => setLessonType("article")}
                                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                                  lessonType === "article" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                }`}
                              >
                                <FileText className="h-5 w-5" />
                                <span className="text-sm">Article</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                            <Input
                              placeholder="Enter lesson title..."
                              value={lessonTitle}
                              onChange={(e) => setLessonTitle(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                              rows={2}
                              placeholder="Describe this lesson..."
                              value={lessonDescription}
                              onChange={(e) => setLessonDescription(e.target.value)}
                            />
                          </div>

                          {lessonType === "video" ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={handleLessonVideoUpload}
                                  className="hidden"
                                  id="lesson-video-upload"
                                />
                                <label htmlFor="lesson-video-upload" className="cursor-pointer">
                                  <Video className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-600">
                                    {lessonVideoFile ? lessonVideoFile.name : "Upload video file"}
                                  </p>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Cover Image (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLessonImageUpload}
                                    className="hidden"
                                    id="lesson-image-upload"
                                  />
                                  <label htmlFor="lesson-image-upload" className="cursor-pointer">
                                    <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-600">
                                      {lessonImageFile ? lessonImageFile.name : "Upload cover image"}
                                    </p>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                                  rows={4}
                                  placeholder="Write lesson content..."
                                  value={lessonContent}
                                  onChange={(e) => setLessonContent(e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowAddLesson(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addLesson} disabled={!lessonTitle.trim()}>
                            Add Lesson
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {step === 2 && (
          <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateContent}
              disabled={!title.trim() || !category.trim() || !description.trim() || isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create {contentType}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Utility to allow only <b>, <strong>, <i>, <em> tags in HTML
function sanitizeDescription(html: string) {
  if (!html) return "";
  // Remove all tags except <b>, <strong>, <i>, <em>
  return html
    .replace(/<(?!\/?(b|strong|i|em)\b)[^>]*>/gi, "")
    .replace(/<\/?(script|style)[^>]*>/gi, "");
}

function ContentPageContent() {
  const { isMobile, isTablet } = useMobileDetection()
  const [activeTab, setActiveTab] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)

  // Real content state
  const [videos, setVideos] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loadingContent, setLoadingContent] = useState(true)

  const auth = typeof window !== "undefined" ? getAuth() : null;
  const [currentAthleteId, setCurrentAthleteId] = useState<string | null>(null);

  // Header state for AthleteHeader
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [hasNewTrainingContent, setHasNewTrainingContent] = useState(false)

  // Fetch content from Firestore
  const fetchContent = async () => {
    setLoadingContent(true)
    try {
      const videosSnap = await getDocs(query(collection(db, "videos"), orderBy("createdAt", "desc")))
      const articlesSnap = await getDocs(query(collection(db, "articles"), orderBy("createdAt", "desc")))
      const coursesSnap = await getDocs(query(collection(db, "courses"), orderBy("createdAt", "desc")))
      setVideos(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "video" })))
      setArticles(articlesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "article" })))
      setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "course" })))
    } catch (err) {
      console.error("Error fetching content:", err)
    }
    setLoadingContent(false)
  }

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    // Fetch current user's athlete document
    const fetchAthleteId = async () => {
      if (!auth?.currentUser?.uid) return;
      const q = query(collection(db, "athletes"), where("email", "==", auth.currentUser.email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCurrentAthleteId(snapshot.docs[0].id);
      }
    };
    fetchAthleteId();
  }, [auth?.currentUser?.uid]);

  // Fetch profile data for header
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth?.currentUser?.uid) return;
      
      try {
        const athleteProfile = await getAthleteProfile(auth.currentUser.uid);
        if (athleteProfile) {
          setProfileData(athleteProfile);
          setProfileImageUrl(athleteProfile.profileImageUrl || athleteProfile.profilePicture || null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    
    fetchProfileData();
  }, [auth?.currentUser?.uid]);

  // Combine all content for "All" tab
  const allContent = useMemo(() => {
    return [...videos, ...articles, ...courses]
  }, [videos, articles, courses])

  // Filter content based on active tab and search
  const filteredContent = useMemo(() => {
    let content =
      activeTab === "all"
        ? allContent
        : activeTab === "videos"
          ? videos
          : activeTab === "articles"
            ? articles
            : courses

    if (searchQuery) {
      content = content.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return content
  }, [activeTab, searchQuery, allContent, videos, articles, courses])

  // After creating content, refetch
  const handleModalClose = () => {
    setShowCreateModal(false)
    fetchContent()
  }

  // Quick search suggestions
  const quickSearches = [
    "Navigate Recruitment",
    "Nutrition",
    "NIL",
    "Training Programs",
    "Mental Performance",
    "Injury Prevention",
    "Sports Psychology",
    "Athletic Scholarships",
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
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
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

  // Author profile cache
  const [authorProfiles, setAuthorProfiles] = useState<{ [uid: string]: { firstName?: string; lastName?: string } }>({});

  // Fetch author profile if not cached (athletes only)
  const fetchAuthorProfile = async (uid: string) => {
    if (!uid || authorProfiles[uid]) return;
    const profile = await getAthleteProfile(uid);
    if (profile) {
      setAuthorProfiles(prev => ({ ...prev, [uid]: { firstName: profile.firstName || "", lastName: profile.lastName || "" } }));
    } else {
      setAuthorProfiles(prev => ({ ...prev, [uid]: { firstName: "Unknown", lastName: "" } }));
    }
  };

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

    const getContentMeta = () => {
      switch (item.type) {
        case "video":
          return (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{item.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{item.views}</span>
              </div>
            </div>
          )
        case "article":
          return (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{item.readTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{item.views}</span>
              </div>
            </div>
          )
        case "course":
          return (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{Array.isArray(item.lessons) ? item.lessons.length : 0} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{item.participants}</span>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
              {item.type === "article" ? (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-white" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <Play className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>
            <Badge className="absolute top-3 left-3 flex items-center space-x-1">
              {getContentIcon()}
              <span className="capitalize">{item.type}</span>
            </Badge>
            {item.type === "video" && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {item.duration}
              </div>
            )}
            {/* Three-dot menu in top right for user's own content */}
            {item.authorId && currentAthleteId && item.authorId === currentAthleteId && (
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-600 focus:text-red-700">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="p-4">
            {/* Tags as badges */}
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              {/* Optionally keep category badge if needed, or remove if redundant with tags */}
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{item.rating}</span>
              </div>
            </div>
            <Link href={getContentLink()}>
              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                {item.title}
              </h3>
            </Link>
            <p
              className="text-sm text-gray-600 mb-3 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: sanitizeDescription(item.description) }}
            />
            {getContentMeta()}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">by {author || item.instructor || item.author || "Unknown"}</p>
              <div className="flex items-center space-x-2">
                <Link href={getContentLink()}>
                  <Button size="sm">View</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // State for edit/delete modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Delete handler (Firestore logic to be added)
  const handleDelete = async () => {
    if (!selectedItem) return;
    // TODO: Add Firestore delete logic here
    setDeleteModalOpen(false);
    setSelectedItem(null);
    // Refetch content after delete
    fetchContent();
  };

  // Edit handler (open modal)
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  // Delete handler (open modal)
  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  // Edit Modal (skeleton)
  const EditModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${editModalOpen ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/40" onClick={() => setEditModalOpen(false)} />
      <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-lg z-10">
        <h2 className="text-xl font-bold mb-4">Edit Content</h2>
        {/* TODO: Add edit form here */}
        <Button onClick={() => setEditModalOpen(false)}>Close</Button>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${deleteModalOpen ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteModalOpen(false)} />
      <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-md z-10">
        <h2 className="text-xl font-bold mb-4">Delete Content</h2>
        <p className="mb-6">Are you sure you want to delete this content? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );

  const MainContent = (
    <div className={`${isMobile ? "p-4" : "max-w-7xl mx-auto px-6 py-4"}`}>
      {/* Mobile Create Button */}
      {isMobile && (
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Content
          </Button>
        </div>
      )}

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
          {!isMobile && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          )}
          <div className={`relative ${isMobile ? "flex-1" : ""}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isMobile ? "w-full" : "w-64"}`}
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"} gap-6`}
        >
          {filteredContent.map((item) => (
            <ContentCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No content found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateContentModal isOpen={showCreateModal} onClose={handleModalClose} />
    </div>
  )

  const { logout } = useUnifiedLogout()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/content"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={0}
        hasNewContent={false}
      >
        {MainContent}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AthleteHeader
        currentPath="/content"
        onLogout={handleLogout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profileImageUrl={profileImageUrl}
        profileData={profileData}
      />
      <div className="max-w-7xl mx-auto px-6 py-4">{MainContent}</div>
      <EditModal />
      <DeleteModal />
    </div>
  )
}

export default function ContentPage() {
  return (
    <AdvancedNotificationProvider>
      <ContentPageContent />
    </AdvancedNotificationProvider>
  )
} 