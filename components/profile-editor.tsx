"use client"

import { useState, useEffect, useCallback, useMemo, type FC, useImperativeHandle, forwardRef } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { User, Trophy, Award, Target, Plus, Trash2, CheckCircle, Star } from "lucide-react"

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
  profilePhotoUrl?: string
  coverPhotoUrl?: string
}

interface ProfileEditorProps {
  isEditing: boolean
  isLoading: boolean
  initialData: ProfileData
  onSave: (data: ProfileData) => void
}

const ProfileEditor = forwardRef(({ isEditing, isLoading, initialData, onSave }: ProfileEditorProps, ref) => {
  const [editingData, setEditingData] = useState<ProfileData>(initialData)

  /* -------------------------------------------------------------------------- */
  /*                                Side Effects                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    setEditingData(initialData)
  }, [initialData])

  useImperativeHandle(ref, () => ({
    save: () => {
      onSave(editingData)
    }
  }))

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

  // Memoize the display data to prevent unnecessary re-renders
  const displayData = useMemo(() => {
    return isEditing ? editingData : initialData
  }, [isEditing, editingData, initialData])

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      <Tabs defaultValue="overview" className="w-full">
        {/* ------------------------------ Tab Header ----------------------------- */}
        <TabsList className="grid w-full grid-cols-4 mb-4 lg:mb-6">
          <TabsTrigger value="overview" className="text-xs lg:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs lg:text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs lg:text-sm">
            Certs
          </TabsTrigger>
          <TabsTrigger value="specialties" className="text-xs lg:text-sm">
            Skills
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------ Overview ------------------------------ */}
        <TabsContent value="overview" className="space-y-4 lg:space-y-6">
          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>About Me</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={displayData.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  placeholder="Tell athletes about your coaching philosophy..."
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{displayData.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Key Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(displayData.achievements || []).map((achievement, index) => (
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
        </TabsContent>

        {/* ----------------------------- Profile Tab ----------------------------- */}
        <TabsContent value="profile" className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={displayData.firstName}
                    onChange={(e) => handleFieldChange("firstName", e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={displayData.lastName}
                    onChange={(e) => handleFieldChange("lastName", e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={displayData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={displayData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={displayData.location}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="school">School/Institution</Label>
                  <Input
                    id="school"
                    value={displayData.school}
                    onChange={(e) => handleFieldChange("school", e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sport">Primary Sport</Label>
                  <Select
                    value={displayData.sport}
                    onValueChange={(value) => handleFieldChange("sport", value)}
                    disabled={!isEditing || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Soccer">Soccer</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Track & Field">Track & Field</SelectItem>
                      <SelectItem value="Golf">Golf</SelectItem>
                      <SelectItem value="Baseball">Baseball</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position/Role</Label>
                  <Input
                    id="position"
                    value={displayData.position}
                    onChange={(e) => handleFieldChange("position", e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={displayData.experience}
                    onChange={(e) => handleFieldChange("experience", e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------- Certifications Tab -------------------------- */}
        <TabsContent value="certifications" className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Professional Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(displayData.certifications || []).map((cert, index) => (
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
        </TabsContent>

        {/* --------------------------- Specialties Tab --------------------------- */}
        <TabsContent value="specialties" className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Areas of Expertise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(displayData.specialties || []).map((specialty, index) => (
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
        </TabsContent>
      </Tabs>

      {/* Hidden save button for parent to trigger programmatically */}
      {isEditing && (
        <button id="save-profile-button" onClick={() => onSave(displayData)} className="hidden" disabled={isLoading}>
          Save
        </button>
      )}
    </>
  )
})

export default ProfileEditor 