"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, ArrowLeft, Plus, X, Upload } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Logo } from "@/components/logo"

interface CourseData {
  title: string;
  description: string;
  price: number;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  thumbnail?: string;
  lessons: LessonData[];
  userId: string;
  createdAt: any;
}

interface LessonData {
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  order: number;
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  const [course, setCourse] = useState<CourseData>({
    title: "",
    description: "",
    price: 0,
    duration: "",
    level: "beginner",
    category: "",
    thumbnail: "",
    lessons: [],
    userId: "",
    createdAt: null,
  })

  const [newLesson, setNewLesson] = useState<LessonData>({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    order: 0,
  })

  // Client-side check
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setThumbnailFile(file)
  }

  const handleAddLesson = () => {
    if (!newLesson.title.trim()) return
    
    const lesson: LessonData = {
      ...newLesson,
      order: course.lessons.length + 1,
    }
    
    setCourse(prev => ({
      ...prev,
      lessons: [...prev.lessons, lesson]
    }))
    
    setNewLesson({
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      order: 0,
    })
  }

  const handleRemoveLesson = (index: number) => {
    setCourse(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index).map((lesson, i) => ({
        ...lesson,
        order: i + 1
      }))
    }))
  }

  const handleCreateCourse = async () => {
    // Check if we're on client side and Firebase is available
    if (!isClient || !auth?.currentUser || !db) {
      console.error("Firebase not available or user not authenticated")
      return
    }
    
    setLoading(true)
    setUploadingThumbnail(true)
    
    try {
      let thumbnailUrl = course.thumbnail
      
      // Upload thumbnail if selected
      if (thumbnailFile) {
        const storage = getStorage()
        const fileRef = storageRef(storage, `course-thumbnails/${auth.currentUser.uid}/${Date.now()}_${thumbnailFile.name}`)
        await uploadBytes(fileRef, thumbnailFile)
        thumbnailUrl = await getDownloadURL(fileRef)
      }

      // Create course in Firestore
      const courseData = {
        ...course,
        thumbnail: thumbnailUrl,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      }
      
      await addDoc(collection(db, "courses"), courseData)
      
      // Redirect back to dashboard
      router.push('/coach/dashboard?tab=content')
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Failed to create course. Please try again.")
    } finally {
      setLoading(false)
      setUploadingThumbnail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button 
            variant="ghost" 
            onClick={() => router.push('/coach/dashboard')}
            className="text-gray-600 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
              <p className="text-gray-600 mt-2">Build a comprehensive course for your subscribers</p>
            </div>
            <Button
              onClick={handleCreateCourse}
              disabled={loading || !course.title.trim() || course.lessons.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4 mr-2" />
              )}
              Create Course
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <Input
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      placeholder="Enter course title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Textarea
                      value={course.description}
                      onChange={(e) => setCourse({ ...course, description: e.target.value })}
                      placeholder="Describe what students will learn..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                      <Input
                        type="number"
                        value={course.price}
                        onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <Input
                        value={course.duration}
                        onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                        placeholder="e.g., 2 hours, 4 weeks"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select
                        value={course.level}
                        onChange={(e) => setCourse({ ...course, level: e.target.value as "beginner" | "intermediate" | "advanced" })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <Input
                        value={course.category}
                        onChange={(e) => setCourse({ ...course, category: e.target.value })}
                        placeholder="e.g., Tennis, Fitness, Nutrition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                    <div className="flex gap-2 items-center">
                      <Button variant="outline" size="icon" className="shrink-0" asChild>
                        <label>
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      <span className="text-sm text-gray-600">
                        {thumbnailFile ? thumbnailFile.name : "No thumbnail selected"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </CardContent>
              </Card>

              {/* Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Lessons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Lesson Form */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Add New Lesson</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                        <Input
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                          placeholder="Enter lesson title..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Textarea
                          value={newLesson.description}
                          onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                          placeholder="Brief description of this lesson..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                          <Input
                            value={newLesson.videoUrl}
                            onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                            placeholder="YouTube or video link..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <Input
                            value={newLesson.duration}
                            onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                            placeholder="e.g., 15 min"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddLesson}
                        disabled={!newLesson.title.trim()}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div className="space-y-3">
                    {course.lessons.map((lesson, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{lesson.order}</Badge>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{lesson.duration}</span>
                            {lesson.videoUrl && <span>• Video included</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLesson(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {course.lessons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No lessons added yet. Add your first lesson above.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Course Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.thumbnail && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt="Course thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-lg">{course.title || "Course Title"}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.description || "Course description will appear here..."}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium capitalize">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lessons:</span>
                      <span className="font-medium">{course.lessons.length}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Course Content</h4>
                    <div className="space-y-1">
                      {course.lessons.map((lesson, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">{lesson.order}.</span>
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 