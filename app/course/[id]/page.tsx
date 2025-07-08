// Copy of app/content/course/[id]/page.tsx for /course/[id] route
// If any imports use relative paths, update them to work from this new location.

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, Clock, Users, Star, BookOpen, Video, FileText, Download, Share2, ThumbsUp, ThumbsDown, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { auth } from "@/lib/firebase"

interface CoursePageProps {
  params: {
    id: string
  }
}

export default function MemberCoursePage({ params }: CoursePageProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const [currentLesson, setCurrentLesson] = useState<string | null>(null)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [userLiked, setUserLiked] = useState<boolean | null>(null) // null = no action, true = liked, false = disliked
  const [isRatingLoading, setIsRatingLoading] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true)
      const courseRef = doc(db, "courses", params.id)
      const courseSnap = await getDoc(courseRef)
      if (courseSnap.exists()) {
        const courseData = courseSnap.data()
        // Ensure lessons have completed field for UI
        const lessons = Array.isArray(courseData.lessons)
          ? courseData.lessons.map((lesson: any) => ({ ...lesson, completed: lesson.completed ?? false }))
          : []
        setCourse({ ...courseData, lessons })
        setCurrentLesson(lessons[0]?.id || null)
      } else {
        setCourse(null)
      }
      setLoading(false)
    }
    fetchCourse()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/member-training">
            <Button>Back to Training</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentLessonData = course.lessons.find((lesson: any) => lesson.id === currentLesson)
  const completedLessons = course.lessons.filter((lesson: any) => lesson.completed).length
  const progressPercentage = (completedLessons / course.lessons.length) * 100

  const markLessonComplete = (lessonId: string) => {
    setCourse((prev: any) => ({
      ...prev,
      lessons: prev.lessons.map((lesson: any) => (lesson.id === lessonId ? { ...lesson, completed: true } : lesson)),
    }))
  }

  // Handle star rating
  const handleStarRating = async (rating: number) => {
    if (isRatingLoading) return
    setIsRatingLoading(true)
    try {
      setUserRating(rating)
      const courseRef = doc(db, "courses", params.id)
      await updateDoc(courseRef, {
        rating: rating, // For simplicity, we'll just update with the new rating
        // In a real app, you'd want to calculate average rating
      })
      setCourse((prev: any) => ({ ...prev, rating: rating }))
    } catch (error) {
      console.error("Error updating rating:", error)
    }
    setIsRatingLoading(false)
  }

  // Handle like/dislike
  const handleLikeDislike = async (isLike: boolean) => {
    try {
      const courseRef = doc(db, "courses", params.id)
      
      if (userLiked === isLike) {
        // User clicked the same action, so remove it
        setUserLiked(null)
        await updateDoc(courseRef, {
          likes: increment(isLike ? -1 : 0),
          dislikes: increment(isLike ? 0 : -1),
        })
      } else {
        // User clicked a different action or first time
        const prevLiked = userLiked
        setUserLiked(isLike)
        
        if (prevLiked === null) {
          // First time action
          await updateDoc(courseRef, {
            likes: increment(isLike ? 1 : 0),
            dislikes: increment(isLike ? 0 : 1),
          })
        } else {
          // Switching from like to dislike or vice versa
          await updateDoc(courseRef, {
            likes: increment(isLike ? 1 : -1),
            dislikes: increment(isLike ? -1 : 1),
          })
        }
      }
    } catch (error) {
      console.error("Error updating like/dislike:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/member-training">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Training
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">{course.title}</h1>
                <p className="text-sm text-gray-600">
                  {completedLessons} of {course.lessons.length} lessons completed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`${isMobile ? "p-4" : "max-w-7xl mx-auto px-6 py-8"}`}>
        <div className={`grid ${isMobile ? "grid-cols-1 gap-6" : "grid-cols-3 gap-8"}`}>
          {/* Course Sidebar */}
          <div className={`${isMobile ? "order-2" : "order-1"} space-y-6`}>
            {/* Course Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{course.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{course.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{course.participants || 0} enrolled</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Rating Section */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Rate this course</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarRating(star)}
                        disabled={isRatingLoading}
                        className="transition-colors"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleLikeDislike(true)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                        userLiked === true ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-green-50"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{course.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleLikeDislike(false)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                        userLiked === false ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600 hover:bg-red-50"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{course.dislikes || 0}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Lessons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.lessons.map((lesson: any, index: number) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentLesson === lesson.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : lesson.type === "video" ? (
                          <Video className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-gray-600">{lesson.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className={`${isMobile ? "order-1 col-span-1" : "order-2 col-span-2"} space-y-6`}>
            {currentLessonData && (
              <>
                {/* Lesson Header */}
                <div>
                  <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900 mb-2`}>
                    {currentLessonData.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{currentLessonData.description}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{currentLessonData.type === "video" ? "Video Lesson" : "Article"}</Badge>
                    <span className="text-sm text-gray-600">{currentLessonData.duration}</span>
                    {currentLessonData.completed && (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Lesson Content */}
                <Card>
                  <CardContent className="p-0">
                    {currentLessonData.type === "video" ? (
                      <div className="aspect-video">
                        <iframe
                          src={currentLessonData.videoUrl}
                          title={currentLessonData.title}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="prose max-w-none">
                          {currentLessonData.content?.split("\n").map((line: string, index: number) => {
                            if (line.startsWith("# ")) {
                              return (
                                <h1 key={index} className="text-2xl font-bold mb-4">
                                  {line.substring(2)}
                                </h1>
                              )
                            } else if (line.startsWith("## ")) {
                              return (
                                <h2 key={index} className="text-xl font-semibold mb-3 mt-6">
                                  {line.substring(3)}
                                </h2>
                              )
                            } else if (line.startsWith("### ")) {
                              return (
                                <h3 key={index} className="text-lg font-medium mb-2 mt-4">
                                  {line.substring(4)}
                                </h3>
                              )
                            } else if (line.startsWith("- ")) {
                              return (
                                <li key={index} className="ml-4">
                                  {line.substring(2)}
                                </li>
                              )
                            } else if (line.startsWith("1. ") || line.match(/^\d+\. /)) {
                              return (
                                <li key={index} className="ml-4 list-decimal">
                                  {line.replace(/^\d+\. /, "")}
                                </li>
                              )
                            } else if (line.startsWith("**") && line.endsWith("**")) {
                              return (
                                <p key={index} className="font-semibold mb-2">
                                  {line.slice(2, -2)}
                                </p>
                              )
                            } else if (line.trim() === "") {
                              return <br key={index} />
                            } else {
                              return (
                                <p key={index} className="mb-3">
                                  {line}
                                </p>
                              )
                            }
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lesson Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {!currentLessonData.completed && (
                      <Button onClick={() => markLessonComplete(currentLessonData.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {course.lessons.findIndex((l: any) => l.id === currentLesson) > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = course.lessons.findIndex((l: any) => l.id === currentLesson)
                          setCurrentLesson(course.lessons[currentIndex - 1].id)
                        }}
                      >
                        Previous
                      </Button>
                    )}
                    {course.lessons.findIndex((l: any) => l.id === currentLesson) < course.lessons.length - 1 && (
                      <Button
                        onClick={() => {
                          const currentIndex = course.lessons.findIndex((l: any) => l.id === currentLesson)
                          setCurrentLesson(course.lessons[currentIndex + 1].id)
                        }}
                      >
                        Next Lesson
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 