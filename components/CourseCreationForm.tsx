import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Video, FileText, Trash2, GripVertical, Plus, Upload, Camera } from "lucide-react";

// Types for course content
export interface CourseLesson {
  id: string;
  type: "video" | "article";
  title: string;
  description?: string;
  videoFile?: File;
  coverImage?: File;
  articleContent?: string;
  duration?: string;
  order: number;
}

export interface CourseData {
  title: string;
  description: string;
  category: string;
  lessons: CourseLesson[];
}

export function CourseCreationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: CourseData) => void;
  initialData?: CourseData;
}) {
  const [courseData, setCourseData] = useState<CourseData>(
    initialData || { title: "", description: "", category: "", lessons: [] }
  );
  const [currentLesson, setCurrentLesson] = useState<Partial<CourseLesson>>({
    type: "video",
    title: "",
    description: "",
    videoFile: undefined,
    coverImage: undefined,
    articleContent: "",
  });
  const [showAddLessonDialog, setShowAddLessonDialog] = useState(false);

  // Lesson handlers
  const addLesson = useCallback(() => {
    if (!currentLesson.title) return;
    const newLesson: CourseLesson = {
      id: Date.now().toString(),
      type: currentLesson.type || "video",
      title: currentLesson.title,
      description: currentLesson.description,
      videoFile: currentLesson.videoFile,
      coverImage: currentLesson.coverImage,
      articleContent: currentLesson.articleContent,
      duration: currentLesson.type === "video" ? "0:00" : "0 min read",
      order: courseData.lessons.length,
    };
    setCourseData((prev) => ({ ...prev, lessons: [...prev.lessons, newLesson] }));
    setCurrentLesson({ type: "video", title: "", description: "", videoFile: undefined, coverImage: undefined, articleContent: "" });
    setShowAddLessonDialog(false);
  }, [currentLesson, courseData.lessons.length]);

  const removeLesson = useCallback((lessonId: string) => {
    setCourseData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
    }));
  }, []);

  // Form handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseData((prev) => ({ ...prev, title: e.target.value }));
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCourseData((prev) => ({ ...prev, description: e.target.value }));
  };
  const handleCategoryChange = (value: string) => {
    setCourseData((prev) => ({ ...prev, category: value }));
  };

  // File upload handlers
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentLesson((prev) => ({ ...prev, videoFile: file }));
    }
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentLesson((prev) => ({ ...prev, coverImage: file }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={courseData.title} onChange={handleTitleChange} placeholder="Enter course title..." />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={courseData.category} onValueChange={handleCategoryChange}>
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
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={courseData.description} onChange={handleDescriptionChange} placeholder="Describe your course..." rows={3} />
        </div>
        {/* Lessons Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Course Lessons</Label>
            <Dialog open={showAddLessonDialog} onOpenChange={setShowAddLessonDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Course Lesson</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Lesson Type</Label>
                    <Select
                      value={currentLesson.type}
                      onValueChange={(value: "video" | "article") => setCurrentLesson((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Lesson</SelectItem>
                        <SelectItem value="article">Article Lesson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lesson Title</Label>
                    <Input
                      placeholder="Enter lesson title..."
                      value={currentLesson.title}
                      onChange={(e) => setCurrentLesson((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this lesson..."
                      value={currentLesson.description}
                      onChange={(e) => setCurrentLesson((prev) => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  {/* Video URL */}
                  {currentLesson.type === "video" && (
                    <div className="space-y-2">
                      <Label>Video File</Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById("video-upload")?.click()}
                      >
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center space-y-2">
                          <Camera className="h-6 w-6 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            {currentLesson.videoFile ? (
                              <span className="text-green-600 font-medium">{currentLesson.videoFile.name}</span>
                            ) : (
                              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">Click to upload video</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">MP4, MOV, AVI up to 500MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {currentLesson.type === "article" && (
                    <>
                      <div className="space-y-2">
                        <Label>Cover Image (Optional)</Label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="h-5 w-5 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              {currentLesson.coverImage ? (
                                <span className="text-green-600 font-medium">{currentLesson.coverImage.name}</span>
                              ) : (
                                <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">Upload cover image</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Article Content</Label>
                        <Textarea
                          placeholder="Write your article content..."
                          value={currentLesson.articleContent}
                          onChange={(e) => setCurrentLesson((prev) => ({ ...prev, articleContent: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </>
                  )}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddLessonDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addLesson} disabled={!currentLesson.title}>
                      Add Lesson
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Lessons List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {courseData.lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No lessons added yet</p>
                <p className="text-sm">Click \"Add Lesson\" to get started</p>
              </div>
            ) : (
              courseData.lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <div className="flex-shrink-0">
                    {lesson.type === "video" ? (
                      <Video className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {index + 1}. {lesson.title}
                    </p>
                    {lesson.description && <p className="text-xs text-gray-500 truncate">{lesson.description}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{lesson.type}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLesson(lesson.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => onSubmit(courseData)} disabled={courseData.lessons.length === 0 || !courseData.title}>
            Save as Draft
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => onSubmit(courseData)}
            disabled={courseData.lessons.length === 0 || !courseData.title}
          >
            Create Course
          </Button>
        </div>
      </div>
    </div>
  );
} 