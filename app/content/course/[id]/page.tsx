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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

// Mock course data - in real app this would come from API/database
const COURSE_DATA = {
  1: {
    id: 1,
    title: "Elite Mindset Training Course",
    description:
      "Master the mental aspects of athletic performance with proven techniques used by elite athletes worldwide. This comprehensive course covers visualization, pressure management, focus techniques, and building unshakeable confidence.",
    category: "Mental Performance",
    rating: 4.8,
    totalRatings: 324,
    duration: "6 weeks",
    participants: 450,
    views: 3240,
    likes: 288,
    comments: 67,
    thumbnail: "/placeholder.svg?height=400&width=600",
    instructor: {
      name: "Dr. Sarah Mitchell",
      title: "Sports Psychologist",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    lessons: [
      {
        id: "1",
        type: "video" as const,
        title: "Introduction to Mental Performance",
        description: "Understanding the fundamentals of sports psychology and mental training",
        duration: "15:30",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg?height=200&width=300",
        completed: true,
      },
      {
        id: "2",
        type: "article" as const,
        title: "Understanding Pressure Situations",
        description: "Learn to identify and manage high-pressure scenarios in competition",
        duration: "8 min read",
        thumbnail: "/placeholder.svg?height=200&width=300",
        content: `# Understanding Pressure Situations

Pressure situations are inevitable in competitive sports. The key to success lies not in avoiding pressure, but in learning how to thrive under it.

## What Creates Pressure?

Pressure typically comes from:
- High stakes competitions
- Expectations from coaches, teammates, and fans
- Personal goals and aspirations
- Fear of failure or making mistakes

## The Physiology of Pressure

When we experience pressure, our body activates the fight-or-flight response:
- Increased heart rate
- Elevated breathing
- Muscle tension
- Heightened awareness

## Reframing Pressure as Opportunity

Elite athletes learn to view pressure as:
- A sign that the moment matters
- An opportunity to showcase their skills
- A chance to grow and improve
- Energy that can be channeled positively

## Practical Strategies

1. **Breathing Techniques**: Deep, controlled breathing helps regulate your nervous system
2. **Positive Self-Talk**: Replace negative thoughts with constructive, encouraging statements
3. **Visualization**: Mental rehearsal of successful performance under pressure
4. **Focus on Process**: Concentrate on what you can control rather than outcomes

Remember: Pressure is a privilege. It means you're in a position where your performance matters.`,
        completed: false,
      },
      {
        id: "3",
        type: "video" as const,
        title: "Breathing Techniques for Focus",
        description: "Master breathing exercises that enhance concentration and calm nerves",
        duration: "12:45",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg?height=200&width=300",
        completed: false,
      },
      {
        id: "4",
        type: "article" as const,
        title: "Visualization and Mental Rehearsal",
        description: "Learn powerful visualization techniques used by Olympic athletes",
        duration: "10 min read",
        thumbnail: "/placeholder.svg?height=200&width=300",
        content: `# Visualization and Mental Rehearsal

Mental rehearsal is one of the most powerful tools in an athlete's arsenal. It involves creating detailed mental images of successful performance.

## The Science Behind Visualization

Research shows that mental practice activates the same neural pathways as physical practice:
- Improves muscle memory
- Enhances confidence
- Reduces anxiety
- Increases focus

## Types of Visualization

### 1. Outcome Visualization
- Imagining successful results
- Seeing yourself winning or achieving goals
- Feeling the emotions of success

### 2. Process Visualization
- Mentally rehearsing specific techniques
- Visualizing perfect form and execution
- Practicing decision-making scenarios

## Creating Effective Mental Images

Your visualizations should be:
- **Vivid**: Use all five senses
- **Detailed**: Include specific movements and scenarios
- **Positive**: Focus on successful outcomes
- **Realistic**: Based on achievable goals
- **Regular**: Practice consistently

## Practical Exercise

Try this 5-minute visualization routine:
1. Find a quiet space and close your eyes
2. Take three deep breaths to relax
3. Visualize your upcoming performance in detail
4. See yourself executing perfectly
5. Feel the confidence and satisfaction of success

Practice this daily for best results.`,
        completed: false,
      },
      {
        id: "5",
        type: "video" as const,
        title: "Building Unshakeable Confidence",
        description: "Develop rock-solid self-belief that withstands any challenge",
        duration: "18:22",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg?height=200&width=300",
        completed: false,
      },
    ],
  },
  2: {
    id: 2,
    title: "Injury Prevention Masterclass",
    description:
      "Comprehensive guide to preventing sports injuries through proper warm-up, technique, and recovery protocols. Learn from certified athletic trainers and sports medicine experts.",
    category: "Training",
    rating: 4.9,
    totalRatings: 198,
    duration: "4 weeks",
    participants: 320,
    views: 2100,
    likes: 156,
    comments: 43,
    thumbnail: "/placeholder.svg?height=400&width=600",
    instructor: {
      name: "Coach Mike Rodriguez",
      title: "Certified Athletic Trainer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    lessons: [
      {
        id: "1",
        type: "video" as const,
        title: "Warm-up Fundamentals",
        description: "Essential warm-up routines for injury prevention",
        duration: "18:20",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg?height=200&width=300",
        completed: false,
      },
      {
        id: "2",
        type: "video" as const,
        title: "Proper Form and Technique",
        description: "Master correct movement patterns to avoid injury",
        duration: "22:15",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg?height=200&width=300",
        completed: false,
      },
      {
        id: "3",
        type: "article" as const,
        title: "Recovery and Rest Guidelines",
        description: "Understanding the importance of recovery in injury prevention",
        duration: "6 min read",
        thumbnail: "/placeholder.svg?height=200&width=300",
        content: `# Recovery and Rest Guidelines

Recovery is not just about taking time off - it's an active process that's crucial for injury prevention and performance optimization.

## Types of Recovery

### Active Recovery
- Light movement and exercise
- Promotes blood flow
- Helps remove metabolic waste
- Examples: walking, swimming, yoga

### Passive Recovery
- Complete rest from training
- Allows tissues to repair
- Mental break from competition stress
- Examples: sleep, massage, meditation

## Sleep: The Ultimate Recovery Tool

Quality sleep is essential for:
- Tissue repair and growth
- Hormone regulation
- Mental recovery
- Immune system function

**Recommendations:**
- 7-9 hours per night for adults
- Consistent sleep schedule
- Cool, dark sleeping environment
- Avoid screens before bedtime

## Nutrition for Recovery

Proper nutrition supports recovery through:
- Protein for muscle repair
- Carbohydrates for energy replenishment
- Hydration for cellular function
- Anti-inflammatory foods

## Warning Signs of Inadequate Recovery

Watch for these indicators:
- Persistent fatigue
- Declining performance
- Increased injury risk
- Mood changes
- Elevated resting heart rate

## Creating a Recovery Plan

1. **Schedule rest days** into your training program
2. **Monitor your body** for signs of overtraining
3. **Prioritize sleep** as much as training
4. **Use recovery tools** like foam rolling and stretching
5. **Listen to your body** and adjust accordingly

Remember: Recovery is when adaptation happens. Don't skip it!`,
        completed: false,
      },
    ],
  },
}

interface CoursePageProps {
  params: {
    id: string
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const [currentLesson, setCurrentLesson] = useState<string | null>(null)
  const [course, setCourse] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const courseId = Number.parseInt(params.id)
    const courseData = COURSE_DATA[courseId as keyof typeof COURSE_DATA]
    if (courseData) {
      setCourse(courseData)
      // Set first lesson as current by default
      setCurrentLesson(courseData.lessons[0]?.id || null)
    }
  }, [params.id])

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

  const currentLessonData = course.lessons.find((lesson: any) => lesson.id === currentLesson)
  const completedLessons = course.lessons.filter((lesson: any) => lesson.completed).length
  const progressPercentage = (completedLessons / course.lessons.length) * 100

  const markLessonComplete = (lessonId: string) => {
    setCourse((prev: any) => ({
      ...prev,
      lessons: prev.lessons.map((lesson: any) => (lesson.id === lessonId ? { ...lesson, completed: true } : lesson)),
    }))
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
                      {completedLessons} of {course.lessons.length} lessons completed
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsBookmarked(!isBookmarked)}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-blue-600" : "text-gray-600"}`} />
              </Button>
              <Button variant="ghost" size="sm">
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
                <Image
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                  {course.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center space-x-3 py-3 border-t border-gray-100">
                    <Image
                      src={course.instructor.avatar || "/placeholder.svg"}
                      alt={course.instructor.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <p className="text-sm font-medium text-gray-900">{course.instructor.name}</p>
                        {course.instructor.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-600">{course.instructor.title}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{course.totalRatings} ratings</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">{course.participants}</span>
                      </div>
                      <p className="text-xs text-gray-600">enrolled</p>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{course.views.toLocaleString()} views</span>
                      <span>{course.likes} likes</span>
                      <span>{course.comments} comments</span>
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
                    <Button onClick={() => setIsLiked(!isLiked)} variant="outline" size="sm" className="flex-1">
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current text-red-500" : ""}`} />
                      {isLiked ? "Liked" : "Like"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
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
                  {course.lessons.length} lessons • {course.duration}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.lessons.map((lesson: any, index: number) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      currentLesson === lesson.id
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        {lesson.type === "video" ? (
                          <div className="relative">
                            <Image
                              src={lesson.thumbnail || "/placeholder.svg"}
                              alt={lesson.title}
                              width={60}
                              height={40}
                              className="rounded object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-15 h-10 bg-green-100 rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {lesson.completed && (
                          <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {lesson.type === "video" ? "Video" : "Article"}
                          </Badge>
                          <span className="text-xs text-gray-500">{lesson.duration}</span>
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
            {currentLessonData && (
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
                          {currentLessonData.type === "video" ? "Video Lesson" : "Article"}
                        </Badge>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {currentLessonData.duration}
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
                    {currentLessonData.type === "video" ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={currentLessonData.videoUrl}
                          title={currentLessonData.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="p-6 lg:p-8">
                        <div className="prose prose-gray max-w-none">
                          {currentLessonData.content.split("\n").map((line: string, index: number) => {
                            if (line.startsWith("# ")) {
                              return (
                                <h1 key={index} className="text-3xl font-bold mb-6 text-gray-900">
                                  {line.substring(2)}
                                </h1>
                              )
                            } else if (line.startsWith("## ")) {
                              return (
                                <h2 key={index} className="text-2xl font-semibold mb-4 mt-8 text-gray-900">
                                  {line.substring(3)}
                                </h2>
                              )
                            } else if (line.startsWith("### ")) {
                              return (
                                <h3 key={index} className="text-xl font-medium mb-3 mt-6 text-gray-900">
                                  {line.substring(4)}
                                </h3>
                              )
                            } else if (line.startsWith("- ")) {
                              return (
                                <li key={index} className="ml-4 mb-1 text-gray-700">
                                  {line.substring(2)}
                                </li>
                              )
                            } else if (line.startsWith("1. ") || line.match(/^\d+\. /)) {
                              return (
                                <li key={index} className="ml-4 list-decimal mb-1 text-gray-700">
                                  {line.replace(/^\d+\. /, "")}
                                </li>
                              )
                            } else if (line.startsWith("**") && line.endsWith("**")) {
                              return (
                                <p key={index} className="font-semibold mb-3 text-gray-900">
                                  {line.slice(2, -2)}
                                </p>
                              )
                            } else if (line.trim() === "") {
                              return <br key={index} />
                            } else {
                              return (
                                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
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
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Next Lesson
                        </Button>
                      )}
                    </div>
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
