"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Award,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Save,
  Share2,
  Star,
  Trash2,
  Trophy,
  User,
} from "lucide-react"
import type { ProfileData } from "@/app/dashboard/page"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { Bell, ChevronDown, User as UserIcon } from "lucide-react"

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

interface MobileProfileLayoutProps {
  profileData: ProfileData
  isEditing: boolean
  isSaving: boolean
  onEditToggle: () => void
  onSave: (data: ProfileData) => void
}

export function MobileProfileLayout({
  profileData,
  isEditing,
  isSaving,
  onEditToggle,
  onSave,
}: MobileProfileLayoutProps) {
  const [editingData, setEditingData] = useState(profileData)
  const [visiblePosts, setVisiblePosts] = useState(2)

  const handleInputChange = useCallback((field: keyof ProfileData, value: string) => {
    setEditingData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleListChange = useCallback(
    (field: "certifications" | "specialties" | "achievements", index: number, value: string) => {
      setEditingData((prev) => {
        const updatedList = [...prev[field]]
        updatedList[index] = value
        return { ...prev, [field]: updatedList }
      })
    },
    [],
  )

  const addListItem = useCallback((field: "certifications" | "specialties" | "achievements") => {
    setEditingData((prev) => ({ ...prev, [field]: [...prev[field], ""] }))
  }, [])

  const removeListItem = useCallback((field: "certifications" | "specialties" | "achievements", index: number) => {
    setEditingData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }, [])

  const handleSaveClick = () => {
    onSave(editingData)
  }

  const currentData = isEditing ? editingData : profileData

  const ListEditor: React.FC<{
    title: string
    field: "achievements" | "certifications" | "specialties"
    Icon: React.ElementType
    ItemIcon: React.ElementType
    iconColor: string
  }> = ({ title, field, Icon, ItemIcon, iconColor }) => (
    <div className="bg-white mt-2 px-4 py-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Icon className="h-5 w-5 mr-2" />
        {title}
      </h3>
      <div className="space-y-3">
        {currentData[field].map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            {isEditing ? (
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => handleListChange(field, index, e.target.value)}
                  className="flex-1 text-sm"
                  disabled={isSaving}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeListItem(field, index)}
                  className="p-2"
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <ItemIcon className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5`} />
                <p className="text-gray-700 text-sm">{item}</p>
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
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header - exactly matches MemberHeader */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 flex-1 min-w-0">
              <Link href="/home" className="flex items-center space-x-2 lg:space-x-3 group cursor-pointer flex-shrink-0">
                <div className="w-7 h-7 lg:w-8 lg:h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/Prologue LOGO-1.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg lg:text-xl font-athletic font-bold text-gray-900 group-hover:text-prologue-electric transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              {/* Avatar and dropdown (no dropdown for now) */}
              <Button variant="ghost" className="flex items-center space-x-1 lg:space-x-2 p-1 lg:p-2">
                <Avatar className="w-7 h-7 lg:w-8 lg:h-8">
                  {currentData.profileImageUrl && currentData.profileImageUrl.trim() !== '' ? (
                    <AvatarImage src={currentData.profileImageUrl} alt={currentData.firstName && currentData.lastName ? `${currentData.firstName} ${currentData.lastName}` : 'User'} />
                  ) : (
                    <AvatarFallback>{currentData.firstName && currentData.lastName ? `${currentData.firstName[0]}${currentData.lastName[0]}`.toUpperCase() : <UserIcon className="w-full h-full text-gray-500 p-1" />}</AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
              {/* Notification Bell */}
              <Link href="/notifications" className="relative">
                <Button variant="ghost" size="icon" className="p-1 lg:p-2">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-700" />
                  {/* Always show notification dot for demo; replace with logic if needed */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Existing content below */}

      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="bg-white -mt-16 relative z-10 rounded-t-3xl px-4 pt-6 pb-4">
        <div className="flex items-start space-x-4 -mt-12 mb-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-4 border-white overflow-hidden">
              <User className="w-full h-full text-white p-5" />
            </div>
            {isEditing && (
              <Button
                size="sm"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex-1 pt-8">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={currentData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="First Name"
                    className="text-lg font-bold"
                    disabled={isSaving}
                  />
                  <Input
                    value={currentData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Last Name"
                    className="text-lg font-bold"
                    disabled={isSaving}
                  />
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={currentData.sport}
                    onChange={(e) => handleInputChange("sport", e.target.value)}
                    placeholder="Sport"
                    className="text-sm"
                    disabled={isSaving}
                  />
                  <Input
                    value={currentData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="Experience"
                    className="text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {currentData.firstName} {currentData.lastName}
                </h1>
                <p className="text-gray-600 text-sm mb-2">
                  {currentData.sport} Coach • {currentData.experience} Experience
                </p>
              </>
            )}
            <div className="flex items-center space-x-3 text-xs text-gray-600 flex-wrap">
              {isEditing ? (
                <>
                  <Input
                    value={currentData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Location"
                    className="text-xs h-6 px-2 py-1 flex-1 min-w-0"
                    disabled={isSaving}
                  />
                  <Input
                    value={currentData.school}
                    onChange={(e) => handleInputChange("school", e.target.value)}
                    placeholder="School"
                    className="text-xs h-6 px-2 py-1 flex-1 min-w-0"
                    disabled={isSaving}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{currentData.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{currentData.school}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>4.9/5.0</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          {isEditing ? (
            <Textarea
              value={currentData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Bio..."
              className="min-h-[80px] resize-none text-sm"
              disabled={isSaving}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed text-sm text-left">{currentData.bio}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {!isEditing ? (
            <Button variant="outline" onClick={onEditToggle} size="sm" className="bg-transparent">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSaveClick} disabled={isSaving} size="sm" className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
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
              <Button variant="outline" onClick={onEditToggle} size="sm" className="bg-transparent">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white mt-2 px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Recent Posts
        </h3>
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
                      {currentData.firstName} {currentData.lastName}
                    </span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mb-3 leading-relaxed text-sm">{post.content}</p>
                  <div className="flex items-center space-x-6 text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {visiblePosts < allPosts.length && (
            <Button
              variant="outline"
              onClick={() => setVisiblePosts((prev) => prev + 2)}
              className="w-full bg-transparent"
              disabled={isSaving}
            >
              Load More
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white mt-2 px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <span>{currentData.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-5 w-5 text-gray-500" />
            <span>{currentData.school}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span>Class of {currentData.graduationYear}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Trophy className="h-5 w-5 text-gray-500" />
            <span>{currentData.experience} experience</span>
          </div>
        </div>
      </div>

      <ListEditor
        title="Key Achievements"
        field="achievements"
        Icon={Trophy}
        ItemIcon={Award}
        iconColor="text-yellow-500"
      />
      <ListEditor
        title="Professional Certifications"
        field="certifications"
        Icon={Award}
        ItemIcon={CheckCircle}
        iconColor="text-green-500"
      />
      <ListEditor
        title="Areas of Expertise"
        field="specialties"
        Icon={Star}
        ItemIcon={Star}
        iconColor="text-blue-500"
      />
    </div>
  )
} 