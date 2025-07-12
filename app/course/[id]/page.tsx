"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Star,
  FileText,
  Share2,
  Play,
  Heart,
  MessageCircle,
  Bookmark,
  User,
  Eye,
  Lock,
  Crown,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { auth } from "@/lib/firebase"

interface CoursePageProps {
  params: {
    id: string
  }
}

interface CourseData {
  id: string
  title: string
  description: string
  category?: string
  thumbnailUrl?: string
  athleteId?: string
  views?: number
  likes?: number
  comments?: number
  videos?: Array<{
    id: string
    title: string
    description?: string
    videoUrl?: string
    thumbnailUrl?: string
    duration?: string
    completed?: boolean
  }>
}

export default function CoursePage({ params }: CoursePageProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const [currentLesson, setCurrentLesson] = useState<string | null>(null)
  const [course, setCourse] = useState<CourseData | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creatorProfile, setCreatorProfile] = useState<any>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const db = getFirestore()
        const courseDoc = await getDoc(doc(db, "courses", params.id))
        
        if (courseDoc.exists()) {
          const courseData = { id: courseDoc.id, ...courseDoc.data() } as CourseData
          setCourse(courseData)
          
          // Set first lesson as current by default
          if (courseData.videos && courseData.videos.length > 0) {
            setCurrentLesson(courseData.videos[0]?.id || null)
          }
          
          // Fetch creator profile
          if (courseData.athleteId) {
            try {
              const creatorDoc = await getDoc(doc(db, "athletes", courseData.athleteId))
              if (creatorDoc.exists()) {
                setCreatorProfile({ id: creatorDoc.id, ...creatorDoc.data() })
              }
            } catch (error) {
              console.error("Error fetching creator profile:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/content">
            <Button>Back to Content Library</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentLessonData = course.videos?.find((video: any) => video.id === currentLesson)
  const completedLessons = course.videos?.filter((video: any) => video.completed).length || 0
  const progressPercentage = course.videos ? (completedLessons / course.videos.length) * 100 : 0

  const markLessonComplete = (lessonId: string) => {
    setCourse((prev: any) => ({
      ...prev,
      videos: prev.videos.map((video: any) => 
        video.id === lessonId ? { ...video, completed: true } : video
      ),
    }))
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    // Implement share functionality
    console.log("Share course")
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-3 w-3" />
      case "course":
        return <BookOpen className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isMobile ? "Back" : "Back to Library"}
                </Button>
              </Link>
              {!isMobile && (
                <>
                  <div className="h-6 w-px bg-gray-300" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">{course.title}</h1>
                    <p className="text-sm text-gray-600">
                      {completedLessons} of {course.videos?.length || 0} lessons completed
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsBookmarked(!isBookmarked)}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-blue-600" : "text-gray-600"}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className={`grid ${isMobile ? "grid-cols-1 gap-6" : "grid-cols-4 gap-8"}`}>
          {/* Course Sidebar */}
          <div className={`${isMobile ? "order-2" : "order-1"} space-y-6`}>
            {/* Course Info Card */}
            <Card className="overflow-hidden">
              <div className="relative">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      {course.videos && (
                        <Badge className="bg-black/70 text-white text-xs">
                          {course.videos.length} lessons
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Category Badge */}
                <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                  {course.category || "Training"}
                </Badge>
                
                {/* Content Type Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/70 text-white text-xs flex items-center space-x-1">
                    {getContentTypeIcon("course")}
                    <span className="capitalize">Course</span>
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center space-x-3 py-3 border-t border-gray-100">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                      {creatorProfile?.profileImageUrl ? (
                        <Image 
                          src={creatorProfile.profileImageUrl} 
                          alt="Profile" 
                          width={32} 
                          height={32} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-full h-full text-gray-500 p-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">
                          {creatorProfile?.firstName || creatorProfile?.lastName
                            ? `${creatorProfile?.firstName || ""} ${creatorProfile?.lastName || ""}`.trim()
                            : "Anonymous"}
                        </span>
                        {creatorProfile?.isVerified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{creatorProfile?.title || "Athlete"}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{(course.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{(course.likes || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{(course.comments || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      onClick={handleLike} 
                      variant="ghost" 
                      size="sm" 
                      className={`${isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-green-600"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Content</CardTitle>
                <p className="text-sm text-gray-600">
                  {course.videos?.length || 0} lessons
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.videos && course.videos.map((video: any, index: number) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentLesson(video.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      currentLesson === video.id
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        {video.thumbnailUrl ? (
                          <div className="relative">
                            <Image
                              src={video.thumbnailUrl}
                              alt={video.title}
                              width={60}
                              height={40}
                              className="rounded object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-15 h-10 bg-blue-100 rounded flex items-center justify-center">
                            <Play className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {video.completed && (
                          <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {index + 1}. {video.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Video
                          </Badge>
                          <span className="text-xs text-gray-500">{video.duration || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className={`${isMobile ? "order-1 col-span-1" : "order-2 col-span-3"} space-y-6`}>
            {currentLessonData ? (
              <>
                {/* Lesson Header */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900 mb-2`}>
                        {currentLessonData.title}
                      </h1>
                      <p className="text-gray-600 mb-4">{currentLessonData.description}</p>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Video Lesson
                        </Badge>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {currentLessonData.duration || "Unknown"}
                        </span>
                        {currentLessonData.completed && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <Card className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {currentLessonData.videoUrl ? (
                        <iframe
                          src={currentLessonData.videoUrl}
                          title={currentLessonData.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Video not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Actions */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!currentLessonData.completed && (
                        <Button
                          onClick={() => markLessonComplete(currentLessonData.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {course.videos && course.videos.findIndex((v: any) => v.id === currentLesson) > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const currentIndex = course.videos!.findIndex((v: any) => v.id === currentLesson)
                            setCurrentLesson(course.videos![currentIndex - 1].id)
                          }}
                        >
                          Previous
                        </Button>
                      )}
                      {course.videos && course.videos.findIndex((v: any) => v.id === currentLesson) < course.videos.length - 1 && (
                        <Button
                          onClick={() => {
                            const currentIndex = course.videos!.findIndex((v: any) => v.id === currentLesson)
                            setCurrentLesson(course.videos![currentIndex + 1].id)
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Next Lesson
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons available</h3>
                <p className="text-gray-600">This course doesn't have any lessons yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 