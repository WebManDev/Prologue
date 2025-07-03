import React from "react";
import { BookOpen, Video, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseData } from "./CourseCreationForm";

export function CoursePreview({ course }: { course: CourseData }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-3 mb-4">
        <BookOpen className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">{course.title}</h2>
        <Badge className="ml-2 capitalize">{course.category}</Badge>
      </div>
      <p className="text-gray-700 mb-6">{course.description}</p>
      <div>
        <h3 className="text-lg font-semibold mb-2">Lessons</h3>
        {course.lessons.length === 0 ? (
          <div className="text-gray-500">No lessons in this course yet.</div>
        ) : (
          <ul className="space-y-3">
            {course.lessons.map((lesson, idx) => (
              <li key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {lesson.type === "video" ? (
                  <Video className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-green-500" />
                )}
                <span className="font-medium text-gray-900">{idx + 1}. {lesson.title}</span>
                <span className="text-xs text-gray-500 ml-auto">{lesson.duration}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 