"use client"

import type React from "react"
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  Trash2,
  Trophy,
  Award,
  Star,
  CheckCircle,
  MessageCircle,
  User,
  Heart,
  Share2,
  MoreHorizontal,
} from "lucide-react"
import type { ProfileData } from "@/app/dashboard/page"

type ProfileEditorData = Pick<ProfileData, "achievements" | "certifications" | "specialties">

export interface ProfileEditorHandle {
  getFormData: () => ProfileEditorData
}

interface ProfileEditorProps {
  isEditing: boolean
  initialData: ProfileData
  isLoading: boolean
}

const allPosts = [
  { id: 1, content: "Just finished an amazing training session...", timestamp: "2 hours ago", likes: 24, comments: 8 },
  { id: 2, content: "Tournament season is approaching!...", timestamp: "1 day ago", likes: 42, comments: 15 },
  {
    id: 3,
    content: "Proud to announce that Sarah just committed...",
    timestamp: "3 days ago",
    likes: 67,
    comments: 23,
  },
]

const ProfileEditor = forwardRef<ProfileEditorHandle, ProfileEditorProps>(
  ({ isEditing, initialData, isLoading }, ref) => {
    const [formData, setFormData] = useState<ProfileEditorData>({
      achievements: initialData.achievements,
      certifications: initialData.certifications,
      specialties: initialData.specialties,
    })
    const [visiblePosts, setVisiblePosts] = useState(3)

    useEffect(() => {
      setFormData({
        achievements: initialData.achievements,
        certifications: initialData.certifications,
        specialties: initialData.specialties,
      })
    }, [initialData, isEditing])

    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
    }))

    const handleListChange = useCallback((field: keyof ProfileEditorData, index: number, value: string) => {
      setFormData((prev) => {
        const updatedList = [...prev[field]]
        updatedList[index] = value
        return { ...prev, [field]: updatedList }
      })
    }, [])

    const addListItem = useCallback((field: keyof ProfileEditorData) => {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }))
    }, [])

    const removeListItem = useCallback((field: keyof ProfileEditorData, index: number) => {
      setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
    }, [])

    const loadMorePosts = useCallback(() => {
      setVisiblePosts((prev) => prev + 3)
    }, [])

    const ListSection: React.FC<{
      title: string
      field: keyof ProfileEditorData
      Icon: React.ElementType
      ItemIcon: React.ElementType
      iconColor: string
    }> = ({ title, field, Icon, ItemIcon, iconColor }) => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData[field].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <Input
                      value={item}
                      onChange={(e) => handleListChange(field, index, e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem(field, index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <ItemIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
                    <p className="text-gray-700 text-sm lg:text-base">{item}</p>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => addListItem(field)}
                className="w-full bg-transparent"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {title.slice(0, -1)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )

    return (
      <div className="space-y-6">
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
                <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {initialData.firstName} {initialData.lastName}
                        </span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm">{post.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                      <div className="flex items-center space-x-6 text-gray-500">
                        <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                        <button className="ml-auto hover:text-gray-700 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {visiblePosts < allPosts.length && (
                <Button
                  variant="outline"
                  onClick={loadMorePosts}
                  className="w-full bg-transparent"
                  disabled={isLoading}
                >
                  Load More
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <ListSection
          title="Key Achievements"
          field="achievements"
          Icon={Trophy}
          ItemIcon={Award}
          iconColor="text-yellow-500"
        />
        <ListSection
          title="Professional Certifications"
          field="certifications"
          Icon={Award}
          ItemIcon={CheckCircle}
          iconColor="text-green-500"
        />
        <ListSection
          title="Areas of Expertise"
          field="specialties"
          Icon={Star}
          ItemIcon={Star}
          iconColor="text-blue-500"
        />
      </div>
    )
  },
)

ProfileEditor.displayName = "ProfileEditor"
export default ProfileEditor 