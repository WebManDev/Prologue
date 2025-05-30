"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, SkipForward, SkipBack, CheckCircle, Lock, Clock, BookOpen, ArrowLeft } from "lucide-react"

interface Lesson {
  id: number
  title: string
  duration: string
  description: string
  videoUrl: string
  isCompleted: boolean
  isLocked: boolean
}

interface Course {
  id: number
  title: string
  instructor: string
  description: string
  totalLessons: number
  completedLessons: number
  lessons: Lesson[]
}

interface VideoPlayerProps {
  course: Course
  onBack: () => void
}

export function VideoPlayer({ course, onBack }: VideoPlayerProps) {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const lesson = course.lessons[currentLesson]
  const progress = (course.completedLessons / course.totalLessons) * 100

  const handleLessonComplete = () => {
    // Mark current lesson as completed
    course.lessons[currentLesson].isCompleted = true

    // Unlock next lesson if it exists
    if (currentLesson + 1 < course.lessons.length) {
      course.lessons[currentLesson + 1].isLocked = false
    }

    // Move to next lesson
    if (currentLesson + 1 < course.lessons.length) {
      setCurrentLesson(currentLesson + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-sm text-gray-600">by {course.instructor}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {course.completedLessons} of {course.totalLessons} completed
              </p>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Video Container */}
                <div className="relative bg-black rounded-t-lg aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </div>
                      <p className="text-lg font-medium">{lesson.title}</p>
                      <p className="text-sm opacity-75">{lesson.duration}</p>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => currentLesson > 0 && setCurrentLesson(currentLesson - 1)}
                          disabled={currentLesson === 0}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() =>
                            currentLesson < course.lessons.length - 1 && setCurrentLesson(currentLesson + 1)
                          }
                          disabled={currentLesson === course.lessons.length - 1}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleLessonComplete}
                        disabled={lesson.isCompleted}
                      >
                        {lesson.isCompleted ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          "Mark Complete"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lesson Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
                  <p className="text-gray-600 mb-4">{lesson.description}</p>

                  {/* Lesson Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => currentLesson > 0 && setCurrentLesson(currentLesson - 1)}
                      disabled={currentLesson === 0}
                    >
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous Lesson
                    </Button>
                    <Button
                      onClick={() => {
                        if (currentLesson < course.lessons.length - 1) {
                          setCurrentLesson(currentLesson + 1)
                        }
                      }}
                      disabled={
                        currentLesson === course.lessons.length - 1 || course.lessons[currentLesson + 1]?.isLocked
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next Lesson
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.lessons.map((lessonItem, index) => (
                    <div
                      key={lessonItem.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        index === currentLesson
                          ? "bg-blue-50 border-blue-200"
                          : lessonItem.isLocked
                            ? "bg-gray-50 border-gray-200 opacity-50"
                            : "hover:bg-gray-50 border-gray-200"
                      }`}
                      onClick={() => !lessonItem.isLocked && setCurrentLesson(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {lessonItem.isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : lessonItem.isLocked ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Play className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium ${lessonItem.isLocked ? "text-gray-400" : "text-gray-900"}`}
                            >
                              {lessonItem.title}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{lessonItem.duration}</span>
                            </div>
                          </div>
                        </div>
                        {index === currentLesson && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{course.completedLessons}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        {course.totalLessons - course.completedLessons}
                      </div>
                      <div className="text-xs text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
