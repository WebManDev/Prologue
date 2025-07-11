"use client"

import { useState, useEffect, useCallback, useMemo, type FC, forwardRef, useImperativeHandle } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  User,
  Trophy,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  Star,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
} from "lucide-react"

export type ProfileData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  school: string
  graduationYear: string
  sport: string
  position: string
  certifications: string[]
  specialties: string[]
  experience: string
  achievements: string[]
}

interface ProfileEditorProps {
  isEditing: boolean
  isLoading: boolean
  initialData: ProfileData
  onSave: (data: ProfileData) => void
}

// Mock recent posts data
const allPosts = [
  {
    id: 1,
    content:
      "Just finished an amazing training session with my junior athletes. The mental game is just as important as the physical technique. Remember: confidence comes from preparation! 🎾",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    image: null,
  },
  {
    id: 2,
    content:
      "Tournament season is approaching! Here are my top 3 tips for peak performance: 1) Consistent practice routine 2) Mental visualization 3) Proper nutrition and rest. What's your game plan?",
    timestamp: "1 day ago",
    likes: 42,
    comments: 15,
    image: null,
  },
  {
    id: 3,
    content:
      "Proud to announce that Sarah just committed to play Division I tennis at Stanford! Hard work and dedication always pay off. Congratulations! 🏆",
    timestamp: "3 days ago",
    likes: 67,
    comments: 23,
    image: null,
  },
  {
    id: 4,
    content:
      "Mental performance tip: Before every match, take 5 minutes to visualize your success. See yourself executing perfect shots, staying calm under pressure, and celebrating your wins.",
    timestamp: "5 days ago",
    likes: 31,
    comments: 12,
    image: null,
  },
  {
    id: 5,
    content:
      "Great session today working on serve technique with my advanced players. The key is consistency in your toss and follow-through. Small adjustments make big differences!",
    timestamp: "1 week ago",
    likes: 28,
    comments: 9,
    image: null,
  },
  {
    id: 6,
    content:
      "Nutrition plays a huge role in athletic performance. Here's what I recommend for my athletes: balanced meals, proper hydration, and strategic timing of nutrients around training.",
    timestamp: "1 week ago",
    likes: 35,
    comments: 14,
    image: null,
  },
  {
    id: 7,
    content:
      "Recovery is just as important as training. Make sure you're getting quality sleep, doing proper cool-downs, and listening to your body. Rest days are growth days!",
    timestamp: "2 weeks ago",
    likes: 41,
    comments: 18,
    image: null,
  },
  {
    id: 8,
    content:
      "Working with young athletes is incredibly rewarding. Seeing them develop not just their skills but their confidence and character is what coaching is all about.",
    timestamp: "2 weeks ago",
    likes: 52,
    comments: 21,
    image: null,
  },
]

export interface ProfileEditorHandle {
  getFormData: () => ProfileData;
}

const ProfileEditor = forwardRef<ProfileEditorHandle, ProfileEditorProps>(({ isEditing, isLoading, initialData, onSave }, ref) => {
  const [editingData, setEditingData] = useState<ProfileData>(initialData)
  const [visiblePosts, setVisiblePosts] = useState(4)

  /* -------------------------------------------------------------------------- */
  /*                                Side Effects                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // Reset local state whenever initialData changes
    setEditingData(initialData)
  }, [initialData])

  useImperativeHandle(ref, () => ({
    getFormData: () => editingData,
  }));

  /* -------------------------------------------------------------------------- */
  /*                              Helper Functions                              */
  /* -------------------------------------------------------------------------- */

  const handleFieldChange = useCallback(<K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setEditingData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleListChange = useCallback(
    (field: "certifications" | "specialties" | "achievements", index: number, value: string) => {
      setEditingData((prev) => {
        const updated = [...prev[field]]
        updated[index] = value
        return { ...prev, [field]: updated }
      })
    },
    [],
  )

  const addListItem = useCallback((field: "certifications" | "specialties" | "achievements") => {
    setEditingData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }, [])

  const removeListItem = useCallback((field: "certifications" | "specialties" | "achievements", index: number) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }, [])

  const loadMorePosts = useCallback(() => {
    setVisiblePosts((prev) => Math.min(prev + 4, allPosts.length))
  }, [])

  // Memoize the display data to prevent unnecessary re-renders
  const displayData = useMemo(() => {
    return isEditing ? editingData : initialData
  }, [isEditing, editingData, initialData])

  const PostCard = ({ post }: { post: (typeof allPosts)[0] }) => (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-gray-900">
              {displayData.firstName} {displayData.lastName}
            </span>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-500 text-sm">{post.timestamp}</span>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
          <div className="flex items-center space-x-6 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
              <Share className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
            <button className="ml-auto hover:text-gray-700 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Recent Posts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Recent Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allPosts.slice(0, visiblePosts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {visiblePosts < allPosts.length && (
              <Button variant="outline" onClick={loadMorePosts} className="w-full bg-transparent" disabled={isLoading}>
                Load More
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Key Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayData.achievements.map((achievement, index) => (
              <div key={`achievement-${index}`} className="flex items-start space-x-3">
                {isEditing ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={achievement}
                      onChange={(e) => handleListChange("achievements", index, e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem("achievements", index)}
                      className="p-2"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Award className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm lg:text-base">{achievement}</p>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => addListItem("achievements")}
                className="w-full bg-transparent"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Professional Certifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayData.certifications.map((cert, index) => (
              <div key={`cert-${index}`} className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <Input
                      value={cert}
                      onChange={(e) => handleListChange("certifications", index, e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem("certifications", index)}
                      className="p-2"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm lg:text-base">{cert}</span>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => addListItem("certifications")}
                className="w-full bg-transparent"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Areas of Expertise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayData.specialties.map((specialty, index) => (
              <div key={`specialty-${index}`} className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <Input
                      value={specialty}
                      onChange={(e) => handleListChange("specialties", index, e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem("specialties", index)}
                      className="p-2"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm lg:text-base">{specialty}</span>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => addListItem("specialties")}
                className="w-full bg-transparent"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specialty
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden save button for parent to trigger programmatically */}
      {isEditing && (
        <button id="save-profile-button" onClick={() => onSave(editingData)} className="hidden" disabled={isLoading}>
          Save
        </button>
      )}
    </div>
  )
})

export default ProfileEditor
