"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import {
  User,
  Edit3,
  Target,
  Star,
  MapPin,
  School,
  Camera,
  Upload,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  CheckCircle,
  Circle,
} from "lucide-react"

type ProfileData = {
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

interface ProfileHeaderProps {
  profileData: ProfileData
  isEditing: boolean
  isLoading: boolean
  onEditToggle: () => void
  onSave: (data: ProfileData) => void // This will be used by the parent editor component
}

const coachingStats = {
  activeAthletes: 18,
  avgRating: 4.9,
  responseTime: "< 2 hours",
  successRate: 94,
}

export default function ProfileHeader({ profileData, isEditing, isLoading, onEditToggle, onSave }: ProfileHeaderProps) {
  const [showProfileChecklist, setShowProfileChecklist] = useState(false)

  const profileChecklist = [
    {
      id: "basic-info",
      title: "Complete Basic Information",
      description: "Add your contact details and personal information",
      completed: !!(profileData.firstName && profileData.lastName && profileData.email && profileData.phone),
      action: () => document.getElementById("profile-tab")?.click(),
    },
    {
      id: "bio",
      title: "Write Your Bio",
      description: "Tell athletes about your coaching philosophy and experience",
      completed: (profileData.bio?.length || 0) > 50,
      action: () => document.getElementById("overview-tab")?.click(),
    },
    {
      id: "certifications",
      title: "Add Certifications",
      description: "Showcase your professional qualifications",
      completed: (profileData.certifications?.length || 0) >= 3,
      action: () => document.getElementById("certifications-tab")?.click(),
    },
    {
      id: "specialties",
      title: "List Your Specialties",
      description: "Highlight your areas of expertise",
      completed: (profileData.specialties?.length || 0) >= 3,
      action: () => document.getElementById("specialties-tab")?.click(),
    },
    {
      id: "profile-photo",
      title: "Upload Profile Photo",
      description: "Add a professional photo to build trust with athletes",
      completed: false, // This would be based on actual photo upload
      action: () => toast({ title: "Photo Upload", description: "Click the camera icon to upload your photo" }),
    },
  ]

  const completedItems = profileChecklist.filter((item) => item.completed).length
  const totalItems = profileChecklist.length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 lg:mb-8 overflow-hidden">
      <div className="h-24 lg:h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        {isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 text-xs lg:text-sm"
          >
            <Camera className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Change Cover</span>
          </Button>
        )}
      </div>

      <div className="px-4 lg:px-8 pb-4 lg:pb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between -mt-12 lg:-mt-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
            <div className="relative self-center lg:self-auto">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-4 border-white overflow-hidden">
                <User className="w-full h-full text-white p-4 lg:p-6" />
              </div>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
                >
                  <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              )}
            </div>

            <div className="pt-4 lg:pt-16 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <Badge className="bg-blue-100 text-blue-700 text-xs lg:text-sm w-fit mx-auto lg:mx-0">
                  Professional Coach
                </Badge>
              </div>
              <p className="text-gray-600 mb-2 text-sm lg:text-base">
                {profileData.sport} Coach • {profileData.experience} Experience
              </p>
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 text-xs lg:text-sm text-gray-600 mb-4 space-y-1 lg:space-y-0">
                <div className="flex items-center justify-center lg:justify-start space-x-1">
                  <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-1">
                  <School className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{profileData.school}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-1">
                  <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />
                  <span>{coachingStats.avgRating}/5.0 Rating</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  {coachingStats.activeAthletes} Active Athletes
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  {coachingStats.responseTime} Response Time
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  {coachingStats.successRate}% Success Rate
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 lg:pt-16 flex flex-col items-center lg:items-end space-y-3">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={onEditToggle} className="w-full lg:w-auto bg-transparent">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>

                {completionPercentage < 100 && (
                  <div
                    className="flex flex-col items-center lg:items-end space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors w-full lg:w-auto"
                    onClick={() => setShowProfileChecklist(!showProfileChecklist)}
                  >
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                      {showProfileChecklist ? (
                        <ChevronDown className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="w-full lg:w-48">
                      <Progress value={completionPercentage} className="h-2" />
                      <p className="text-xs text-blue-700 mt-1 text-center lg:text-right">
                        {completedItems}/{totalItems} completed ({completionPercentage}%)
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex space-x-2 w-full lg:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditToggle}
                  disabled={isLoading}
                  className="flex-1 lg:flex-none bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSave(profileData)}
                  disabled={isLoading}
                  className="flex-1 lg:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion Checklist */}
        {showProfileChecklist && completionPercentage < 100 && !isEditing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Complete Your Profile</h3>
            <div className="space-y-2">
              {profileChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                  onClick={item.action}
                >
                  <div className="flex items-center space-x-3">
                    {item.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 