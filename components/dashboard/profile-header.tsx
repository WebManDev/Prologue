"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Edit3, GraduationCap, Loader2, MapPin, Save, Star, Upload, User, CheckCircle } from "lucide-react"

export type ProfileHeaderData = {
  firstName: string
  lastName: string
  sport: string
  experience: string
  location: string
  school: string
  bio: string
  profilePhotoUrl?: string
  coverPhotoUrl?: string
  isVerified?: boolean
}

export interface ProfileHeaderHandle {
  getFormData: () => ProfileHeaderData
}

interface ProfileHeaderProps {
  profileData: ProfileHeaderData
  isEditing: boolean
  isLoading: boolean
  onEditToggle: () => void
  onSave: (data: ProfileHeaderData) => void
  onProfilePicChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCoverChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ProfileHeader = forwardRef<ProfileHeaderHandle, ProfileHeaderProps>(
  ({ profileData, isEditing, isLoading, onEditToggle, onSave, onProfilePicChange, onCoverChange }, ref) => {
    const [formData, setFormData] = useState<ProfileHeaderData>({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      sport: profileData.sport,
      experience: profileData.experience,
      location: profileData.location,
      school: profileData.school,
      bio: profileData.bio,
    })
    const [editingField, setEditingField] = useState<string | null>(null)
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setFormData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        sport: profileData.sport,
        experience: profileData.experience,
        location: profileData.location,
        school: profileData.school,
        bio: profileData.bio,
      })
    }, [profileData])

    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
    }))

    const handleInputChange = useCallback((field: keyof ProfileHeaderData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }, [])

    const handleFieldBlur = () => {
      setEditingField(null)
    }

    const handleFieldKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        setEditingField(null)
      }
    }

    const isAnyFieldEditing = editingField !== null

    return (
      <div className="relative">
        {/* Always-visible Edit Profile button */}
        <div className="flex justify-end px-4 py-2">
          {isEditing && (
            <Button variant="outline" onClick={onEditToggle} size="sm" className="bg-transparent">
              <Edit3 className="h-4 w-4 mr-2" />
              Exit Edit Mode
            </Button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[220px]">
          {/* Cover Photo */}
          <div className="relative h-40 sm:h-56 bg-gradient-to-r from-blue-500 to-indigo-600">
            {/* Show cover photo if available */}
            {profileData.coverPhotoUrl && (
              <img
                src={profileData.coverPhotoUrl}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {isEditing && (
              <button
                className="absolute bottom-2 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 px-3 py-1 rounded shadow flex items-center text-sm z-10"
                type="button"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-1" /> Change Cover
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              style={{ display: 'none' }}
              onChange={onCoverChange}
            />
          </div>
          {/* Main Card Area Below Cover */}
          <div className="pt-8 px-8 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0 flex justify-center lg:block mb-6 lg:mb-0 relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow relative overflow-hidden">
                  {/* Show profile photo if available */}
                  {profileData.profilePhotoUrl ? (
                    <img
                      src={profileData.profilePhotoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-20 h-20 text-white" />
                  )}
                  {isEditing && (
                    <button
                      className="absolute bottom-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow flex items-center z-10"
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    style={{ display: 'none' }}
                    onChange={onProfilePicChange}
                  />
                </div>
              </div>
              {/* Info Group */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-wrap items-center space-x-2 min-h-[40px]">
                    {isEditing ? (
                      <Input
                        ref={el => { inputRefs.current["firstName"] = el }}
                        value={formData.firstName}
                        onChange={e => handleInputChange("firstName", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleFieldKeyDown}
                        className="text-2xl font-bold h-10"
                        disabled={isLoading}
                        placeholder="First Name"
                      />
                    ) : (
                      <span className="text-2xl font-bold h-10">
                        {formData.firstName || <span className="text-gray-400">First Name</span>}
                      </span>
                    )}
                    {isEditing ? (
                      <Input
                        ref={el => { inputRefs.current["lastName"] = el }}
                        value={formData.lastName}
                        onChange={e => handleInputChange("lastName", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleFieldKeyDown}
                        className="text-2xl font-bold h-10"
                        disabled={isLoading}
                        placeholder="Last Name"
                      />
                    ) : (
                      <span className="text-2xl font-bold h-10">
                        {formData.lastName || <span className="text-gray-400">Last Name</span>}
                      </span>
                    )}
                    {/* Verification Badge */}
                    {!isEditing && profileData.isVerified && (
                      <div className="flex items-center ml-2">
                        <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </div>
                      </div>
                    )}
                    {/* Action Buttons (right of name, always in same row) */}
                    {!isEditing && (
                      <Button
                        variant="outline"
                        onClick={onEditToggle}
                        size="sm"
                        className="ml-4 bg-transparent"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    {isEditing ? (
                      <Input
                        ref={el => { inputRefs.current["sport"] = el }}
                        value={formData.sport}
                        onChange={e => handleInputChange("sport", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleFieldKeyDown}
                        className="text-sm"
                        disabled={isLoading}
                        placeholder="Sport"
                      />
                    ) : (
                      <span className="text-sm">{formData.sport || <span className="text-gray-400">Sport</span>}</span>
                    )}
                    <span className="text-sm">Coach</span>
                    <span className="text-sm text-gray-400">•</span>
                    {isEditing ? (
                      <Input
                        ref={el => { inputRefs.current["experience"] = el }}
                        type="number"
                        min={0}
                        value={formData.experience}
                        onChange={e => handleInputChange("experience", e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleFieldKeyDown}
                        className="text-sm"
                        disabled={isLoading}
                        placeholder="Experience"
                      />
                    ) : (
                      <span className="text-sm">{formData.experience || <span className="text-gray-400">Experience</span>} Experience</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600 flex-wrap">
                    {isEditing ? (
                      <Input
                        ref={el => { inputRefs.current["location"] = el }}
                        value={formData.location}
                        onChange={e => handleInputChange("location", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleFieldKeyDown}
                        className="text-xs h-6 px-2 py-1 flex-1 min-w-0"
                        disabled={isLoading}
                        placeholder="Location"
                      />
                    ) : (
                      <div className="flex items-center space-x-1"> <MapPin className="h-3 w-3" /> <span>{formData.location}</span> </div>
                    )}
                    <span>•</span>
                    {isEditing ? (
                      <Input
                        ref={el => { inputRefs.current["school"] = el }}
                        value={formData.school}
                        onChange={e => handleInputChange("school", e.target.value)}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleFieldKeyDown}
                        className="text-xs h-6 px-2 py-1 flex-1 min-w-0"
                        disabled={isLoading}
                        placeholder="School"
                      />
                    ) : (
                      <div className="flex items-center space-x-1"> <GraduationCap className="h-3 w-3" /> <span>{formData.school}</span> </div>
                    )}
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>4.9/5.0</span>
                    </div>
                  </div>
                </div>
                {/* Bio */}
                <div className="mb-4 mt-4">
                  {isEditing ? (
                    <Textarea
                      ref={el => { inputRefs.current["bio"] = el as any }}
                      value={formData.bio}
                      onChange={e => handleInputChange("bio", e.target.value)}
                      onBlur={handleFieldBlur}
                      onKeyDown={handleFieldKeyDown}
                      className="min-h-[80px]"
                      disabled={isLoading}
                      placeholder="Bio..."
                    />
                  ) : (
                    <p className="text-gray-700 text-base whitespace-pre-line cursor-pointer" onClick={() => setEditingField("bio")}>{formData.bio || <span className="text-gray-400">About Me</span>}</p>
                  )}
                </div>
                {/* Buttons (unchanged) */}
                {isAnyFieldEditing && (
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" onClick={() => { setEditingField(null); setFormData(profileData); }} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => onSave(formData)} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span className="ml-2">Save Changes</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

ProfileHeader.displayName = "ProfileHeader"
export default ProfileHeader 