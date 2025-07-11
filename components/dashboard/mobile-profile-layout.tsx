"use client"

import { useState, useEffect, useCallback } from "react"
import type { ProfileData } from "@/app/dashboard/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Camera,
  Edit3,
  Save,
  Loader2,
  MessageCircle,
  User,
  Heart,
  Share2,
  MapPin,
  GraduationCap,
  Trophy,
  CheckCircle,
  Award,
  Star,
  Plus,
  Trash2,
} from "lucide-react"

interface ProfileEditorMobileProps {
  profileData: ProfileData
  isEditing: boolean
  isSaving: boolean
  onEditToggle: () => void
  onSave: (data: ProfileData, files?: { profilePhotoFile?: File; coverPhotoFile?: File }) => void
}

export function ProfileEditorMobile({
  profileData,
  isEditing,
  isSaving,
  onEditToggle,
  onSave,
}: ProfileEditorMobileProps) {
  const [localData, setLocalData] = useState(profileData)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing) {
      setLocalData(profileData)
      setProfilePhotoFile(null)
      setCoverPhotoFile(null)
      setProfilePhotoPreview(null)
      setCoverPhotoPreview(null)
    }
  }, [profileData, isEditing])

  // Handle file selection and preview
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setProfilePhotoFile(file)
    setProfilePhotoPreview(file ? URL.createObjectURL(file) : null)
  }
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCoverPhotoFile(file)
    setCoverPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleFieldChange = useCallback((field: keyof ProfileData, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleListChange = useCallback(
    (field: "certifications" | "specialties" | "achievements", index: number, value: string) => {
      setLocalData((prev) => {
        const updatedList = [...prev[field]]
        updatedList[index] = value
        return { ...prev, [field]: updatedList }
      })
    },
    [],
  )

  const addListItem = useCallback((field: "certifications" | "specialties" | "achievements") => {
    setLocalData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }, [])

  const removeListItem = useCallback((field: "certifications" | "specialties" | "achievements", index: number) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }, [])

  const currentData = isEditing ? localData : profileData

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      <div className="w-full">
        {/* Cover Photo Section */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Show cover photo preview or current cover photo if available */}
          {(coverPhotoPreview || currentData.coverPhotoUrl) && (
            <img
              src={coverPhotoPreview || currentData.coverPhotoUrl}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                id="cover-photo-input"
                style={{ display: "none" }}
                onChange={handleCoverPhotoChange}
                disabled={isSaving}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                onClick={() => document.getElementById("cover-photo-input")?.click()}
                disabled={isSaving}
              >
                <Camera className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-white -mt-4 relative z-10 pt-2 pb-2 w-full">
          {/* Profile Photo and Info */}
          <div className="flex items-start space-x-2 -mt-2 mb-2">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-4 border-white overflow-hidden relative">
                {/* Show profile photo preview or current profile photo if available */}
                {(profilePhotoPreview || currentData.profilePhotoUrl) ? (
                  <img
                    src={profilePhotoPreview || currentData.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full text-white p-5" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-photo-input"
                    style={{ display: "none" }}
                    onChange={handleProfilePhotoChange}
                    disabled={isSaving}
                  />
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
                    onClick={() => document.getElementById("profile-photo-input")?.click()}
                    disabled={isSaving}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex-1 pt-8">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={localData.firstName}
                      onChange={(e) => handleFieldChange("firstName", e.target.value)}
                      placeholder="First Name"
                      className="text-lg font-bold"
                      disabled={isSaving}
                    />
                    <Input
                      value={localData.lastName}
                      onChange={(e) => handleFieldChange("lastName", e.target.value)}
                      placeholder="Last Name"
                      className="text-lg font-bold"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={localData.sport}
                      onChange={(e) => handleFieldChange("sport", e.target.value)}
                      placeholder="Sport"
                      className="text-sm"
                      disabled={isSaving}
                    />
                    <Input
                      value={localData.experience}
                      onChange={(e) => handleFieldChange("experience", e.target.value)}
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
                      value={localData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      placeholder="Location"
                      className="text-xs h-6 px-2 py-1 flex-1 min-w-0"
                      disabled={isSaving}
                    />
                    <Input
                      value={localData.school}
                      onChange={(e) => handleFieldChange("school", e.target.value)}
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

          {/* Bio Section */}
          <div className="mb-2">
            {isEditing ? (
              <Textarea
                value={localData.bio}
                onChange={(e) => handleFieldChange("bio", e.target.value)}
                placeholder="Tell athletes about your coaching philosophy..."
                className="min-h-[80px] resize-none text-sm px-3"
                disabled={isSaving}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed text-sm text-left px-3">{currentData.bio}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1 mb-2">
            {!isEditing ? (
              <Button variant="outline" onClick={onEditToggle} size="sm" className="bg-transparent ml-4">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={() => onSave(localData, { profilePhotoFile, coverPhotoFile })}
                  disabled={isSaving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 ml-4"
                >
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

        {/* Recent Posts Section */}
        <div className="bg-white mt-1 py-2 w-full px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Recent Posts
          </h3>
          <div className="text-center text-gray-500 text-sm my-4">
            Recent posts are coming soon!
          </div>
        </div>

        {/* Sport Details Section */}
        <div className="bg-white mt-1 py-2 w-full px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Sport Details
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-sm">
              <span className="font-medium w-32">Primary Sport</span>
              <span className="text-gray-700">{currentData.sport || <span className="text-gray-400">N/A</span>}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium w-32">Position</span>
              <span className="text-gray-700">{currentData.position || <span className="text-gray-400">N/A</span>}</span>
            </div>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="bg-white mt-1 py-2 w-full px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Key Achievements
          </h3>
          <div className="space-y-3">
            {currentData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-3 mb-1">
                {isEditing ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={achievement}
                      onChange={(e) => handleListChange("achievements", index, e.target.value)}
                      className="w-full min-w-0 text-xs py-1"
                      disabled={isSaving}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem("achievements", index)}
                      className="p-2"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Award className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5 ml-2" />
                    <p className="text-gray-700 text-sm">{achievement}</p>
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
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            )}
          </div>
        </div>

        {/* Professional Certifications */}
        <div className="bg-white mt-1 py-2 w-full px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Professional Certifications
          </h3>
          <div className="space-y-3">
            {currentData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-3 mb-1">
                {isEditing ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={cert}
                      onChange={(e) => handleListChange("certifications", index, e.target.value)}
                      className="w-full min-w-0 text-xs py-1"
                      disabled={isSaving}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem("certifications", index)}
                      className="p-2"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                    <span className="text-gray-700 text-sm">{cert}</span>
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
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            )}
          </div>
        </div>

        {/* Areas of Expertise */}
        <div className="bg-white mt-1 py-2 w-full px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Areas of Expertise
          </h3>
          <div className="space-y-3">
            {currentData.specialties.map((specialty, index) => (
              <div key={index} className="flex items-center space-x-3 mb-1">
                {isEditing ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={specialty}
                      onChange={(e) => handleListChange("specialties", index, e.target.value)}
                      className="w-full min-w-0 text-xs py-1"
                      disabled={isSaving}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem("specialties", index)}
                      className="p-2"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Star className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                    <span className="text-gray-700 text-sm">{specialty}</span>
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
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specialty
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
