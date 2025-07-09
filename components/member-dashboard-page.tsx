"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  ChevronDown,
  Edit3,
  Plus,
  Trash2,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Star,
  Award,
  MapPin,
  School,
  Camera,
  Upload,
  Clock,
  Activity,
  CheckCircle,
  Circle,
  ChevronRight,
  Save,
  Loader2,
  Home,
  BookOpen,
  Search,
  MessageSquare,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth, saveMemberProfile, getMemberProfile, uploadProfilePicture, uploadCoverPhoto } from "@/lib/firebase"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"

// Helper function defined outside the component to prevent re-creation
const getActivityIcon = (type: string) => {
  switch (type) {
    case "session":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "achievement":
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case "feedback":
      return <Star className="h-4 w-4 text-green-500" />
    case "milestone":
      return <Award className="h-4 w-4 text-orange-500" />
    case "goal":
      return <Target className="h-4 w-4 text-purple-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}



// Extracted MainContent component
const MainContent = React.memo(
  ({
    isMobile,
    isTablet,
    isEditing,
    setIsEditing,
    isLoading,
    handleSaveProfile,
    profileData,
    handleProfileChange,
    handleSportChange,
    addGoal,
    removeGoal,
    updateGoal,
    addAchievement,
    removeAchievement,
    updateAchievement,
    addInterest,
    removeInterest,
    updateInterest,
    profileChecklist,
    completionPercentage,
    completedItems,
    totalItems,
    showProfileChecklist,
    setShowProfileChecklist,
    memberStats,
    recentActivity,
    profileImageInputRef,
    coverImageInputRef,
    isUploadingProfile,
    isUploadingCover,
    handleProfileImageChange,
    handleCoverImageChange,
  }: any) => (
    <main className={`max-w-7xl mx-auto px-6 py-8 ${isMobile || isTablet ? "pb-20" : ""}`}>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 lg:mb-8 overflow-hidden">
        <div className="h-24 lg:h-32 bg-gradient-to-r from-prologue-electric to-prologue-blue relative">
          {/* Cover Image */}
          {profileData.coverImageUrl ? (
            <img src={profileData.coverImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-black/10"></div>
          {isEditing && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 text-xs lg:text-sm"
                onClick={() => coverImageInputRef.current?.click()}
                disabled={isUploadingCover}
              >
                <Camera className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">{isUploadingCover ? "Uploading..." : "Change Cover"}</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={coverImageInputRef}
                className="hidden"
                onChange={handleCoverImageChange}
                disabled={isUploadingCover}
              />
            </>
          )}
        </div>

        <div className="px-4 lg:px-8 pb-4 lg:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between -mt-12 lg:-mt-16">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              <div className="relative self-center lg:self-auto">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-prologue-electric to-prologue-blue rounded-full border-4 border-white overflow-hidden">
                  {profileData.profileImageUrl ? (
                    <img src={profileData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full text-white p-4 lg:p-6" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 rounded-full p-0 bg-prologue-electric hover:bg-prologue-blue"
                      onClick={() => profileImageInputRef.current?.click()}
                      disabled={isUploadingProfile}
                    >
                      <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={profileImageInputRef}
                      className="hidden"
                      onChange={handleProfileImageChange}
                      disabled={isUploadingProfile}
                    />
                  </>
                )}
              </div>

              <div className="pt-4 lg:pt-16 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <Badge className="bg-prologue-electric/10 text-prologue-electric text-xs lg:text-sm w-fit mx-auto lg:mx-0">
                    Student Athlete
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2 text-sm lg:text-base">
                  {profileData.sport} Player • Class of {profileData.graduationYear}
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
                    <span>{profileData.gpa} GPA</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    {memberStats.activeCoaches} Active Coaches
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    {memberStats.hoursTraining} Hours Training
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                    {memberStats.goalsCompleted} Goals Completed
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 lg:pt-16 flex flex-col items-center lg:items-end space-y-3">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full lg:w-auto">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  {completionPercentage < 100 && (
                    <div
                      className="flex flex-col items-center lg:items-end space-y-2 p-3 bg-prologue-electric/10 rounded-lg border border-prologue-electric/20 cursor-pointer hover:bg-prologue-electric/20 transition-colors w-full lg:w-auto"
                      onClick={() => setShowProfileChecklist(!showProfileChecklist)}
                    >
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-prologue-electric" />
                        <span className="text-sm font-medium text-prologue-electric">Profile Completion</span>
                        {showProfileChecklist ? (
                          <ChevronDown className="h-4 w-4 text-prologue-electric" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-prologue-electric" />
                        )}
                      </div>
                      <div className="w-full lg:w-48">
                        <Progress value={completionPercentage} className="h-2" />
                        <p className="text-xs text-prologue-electric mt-1 text-center lg:text-right">
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
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="flex-1 lg:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={isLoading} className="flex-1 lg:flex-none">
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
          {showProfileChecklist && completionPercentage < 100 && (
            <div className="mt-6 p-4 bg-prologue-electric/10 rounded-lg border border-prologue-electric/20">
              <h3 className="text-sm font-semibold text-prologue-electric mb-3">Complete Your Profile</h3>
              <div className="space-y-2">
                {profileChecklist.map((item: any) => (
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Active Coaches</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.activeCoaches}</p>
            </div>
            <User className="h-6 w-6 lg:h-8 lg:w-8 text-prologue-electric" />
          </div>
        </Card>

        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">This Week</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.thisWeek}</p>
            </div>
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{memberStats.totalSessions}</p>
            </div>
            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-3 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Improvement</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">+{memberStats.improvement}%</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 lg:mb-6">
              <TabsTrigger value="overview" id="overview-tab" className="text-xs lg:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" id="profile-tab" className="text-xs lg:text-sm">
                Profile
              </TabsTrigger>
              <TabsTrigger value="goals" id="goals-tab" className="text-xs lg:text-sm">
                Goals
              </TabsTrigger>
              <TabsTrigger value="achievements" id="achievements-tab" className="text-xs lg:text-sm">
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
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
                      id="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell coaches about your athletic journey and goals..."
                      className="min-h-[120px] resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{profileData.bio}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.interests.map((interest: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        {isEditing ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <Input
                              value={interest}
                              onChange={(e) => updateInterest(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={() => removeInterest(index)} className="p-2">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Star className="h-4 w-4 text-prologue-electric mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 text-sm lg:text-base">{interest}</p>
                          </>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addInterest} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Interest
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profileData.phone} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        value={profileData.school}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sport">Primary Sport</Label>
                      <Select value={profileData.sport} onValueChange={handleSportChange} disabled={!isEditing}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={profileData.position}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={profileData.graduationYear}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gpa">GPA</Label>
                    <Input id="gpa" value={profileData.gpa} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Athletic Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.goals.map((goal: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        {isEditing ? (
                          <>
                            <Input
                              value={goal}
                              onChange={(e) => updateGoal(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={() => removeGoal(index)} className="p-2">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Target className="h-4 w-4 text-prologue-electric flex-shrink-0" />
                            <span className="text-gray-700 text-sm lg:text-base">{goal}</span>
                          </>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addGoal} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Athletic Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.achievements.map((achievement: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        {isEditing ? (
                          <>
                            <Input
                              value={achievement}
                              onChange={(e) => updateAchievement(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAchievement(index)}
                              className="p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm lg:text-base">{achievement}</span>
                          </>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addAchievement} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Training Hours</span>
                <span className="text-sm font-medium text-gray-900">{memberStats.hoursTraining}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Goals Completed</span>
                <span className="text-sm font-medium text-gray-900">{memberStats.goalsCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Improvement Rate</span>
                <span className="text-sm font-medium text-green-600">+{memberStats.improvement}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="text-sm font-medium text-gray-900">{memberStats.avgRating}/5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  ),
)
MainContent.displayName = "MainContent"

export default function MemberDashboardPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfileChecklist, setShowProfileChecklist] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  // Quick search suggestions
  const quickSearches = useMemo(
    () => [
      "Navigate Recruitment",
      "Nutrition",
      "NIL",
      "Training Programs",
      "Mental Performance",
      "Injury Prevention",
      "Sports Psychology",
      "Athletic Scholarships",
    ],
    [],
  )

  // Mock search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const mockResults = [
      {
        type: "coach",
        name: "Jordan Smith",
        sport: "Tennis",
        rating: 4.9,
        experience: "8+ years",
        location: "Los Angeles, CA",
      },
      {
        type: "coach",
        name: "Alex Rodriguez",
        sport: "Basketball",
        rating: 4.8,
        experience: "12+ years",
        location: "Miami, FL",
      },
      {
        type: "content",
        title: "College Recruitment Guide",
        creator: "PROLOGUE Team",
        views: "45K",
        duration: "12 min",
      },
      {
        type: "content",
        title: "NIL Deal Strategies",
        creator: "Sports Business Pro",
        views: "32K",
        duration: "18 min",
      },
    ].filter(
      (result) =>
        result.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.creator?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return mockResults
  }, [searchQuery])

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 987-6543",
    bio: "Dedicated high school tennis player with aspirations to compete at the collegiate level. Currently ranked #15 in state and actively seeking coaching to improve my mental game and technical skills. Passionate about continuous improvement and committed to excellence both on and off the court.",
    location: "Miami, FL",
    school: "Miami Prep Academy",
    graduationYear: "2025",
    sport: "Tennis",
    position: "Singles Player",
    gpa: "3.8",
    goals: [
      "Improve state ranking to top 10",
      "Secure Division I tennis scholarship",
      "Develop stronger mental game",
      "Enhance serve consistency",
      "Improve fitness and conditioning",
      "Build college recruitment profile",
    ],
    achievements: [
      "State Championship Semifinalist 2023",
      "Regional Tournament Winner 2023",
      "Team Captain - Varsity Tennis",
      "Academic Honor Roll",
      "Community Service Award",
      "Junior Tournament Circuit Top 20",
    ],
    interests: [
      "Tennis Strategy & Tactics",
      "Sports Psychology",
      "Nutrition & Fitness",
      "College Recruitment",
      "Mental Performance",
      "Injury Prevention",
    ],
    coverImageUrl: null as string | null,
    profileImageUrl: null as string | null,
  })

  // Memoized handlers for profile form
  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setProfileData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }, [])

  const handleSportChange = useCallback((value: string) => {
    setProfileData((prevData) => ({
      ...prevData,
      sport: value,
    }))
  }, [])

  const addGoal = useCallback(() => {
    setProfileData((prevData) => ({
      ...prevData,
      goals: [...prevData.goals, "New goal"],
    }))
  }, [])

  const removeGoal = useCallback((index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      goals: prevData.goals.filter((_, i) => i !== index),
    }))
  }, [])

  const updateGoal = useCallback((index: number, value: string) => {
    setProfileData((prevData) => {
      const newGoals = [...prevData.goals]
      newGoals[index] = value
      return { ...prevData, goals: newGoals }
    })
  }, [])

  const addAchievement = useCallback(() => {
    setProfileData((prevData) => ({
      ...prevData,
      achievements: [...prevData.achievements, "New achievement"],
    }))
  }, [])

  const removeAchievement = useCallback((index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      achievements: prevData.achievements.filter((_, i) => i !== index),
    }))
  }, [])

  const updateAchievement = useCallback((index: number, value: string) => {
    setProfileData((prevData) => {
      const newAchievements = [...prevData.achievements]
      newAchievements[index] = value
      return { ...prevData, achievements: newAchievements }
    })
  }, [])

  const addInterest = useCallback(() => {
    setProfileData((prevData) => ({
      ...prevData,
      interests: [...prevData.interests, "New interest"],
    }))
  }, [])

  const removeInterest = useCallback((index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      interests: prevData.interests.filter((_, i) => i !== index),
    }))
  }, [])

  const updateInterest = useCallback((index: number, value: string) => {
    setProfileData((prevData) => {
      const newInterests = [...prevData.interests]
      newInterests[index] = value
      return { ...prevData, interests: newInterests }
    })
  }, [])

  const profileChecklist = useMemo(() => [
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
      description: "Tell coaches about your athletic journey and goals",
      completed: profileData.bio.length > 50,
      action: () => document.getElementById("overview-tab")?.click(),
    },
    {
      id: "goals",
      title: "Set Your Goals",
      description: "Define what you want to achieve in your sport",
      completed: profileData.goals.length >= 3,
      action: () => document.getElementById("goals-tab")?.click(),
    },
    {
      id: "achievements",
      title: "Add Achievements",
      description: "Showcase your athletic accomplishments",
      completed: profileData.achievements.length >= 3,
      action: () => document.getElementById("achievements-tab")?.click(),
    },
    {
      id: "profile-photo",
      title: "Upload Profile Photo",
      description: "Add a professional photo to build trust with coaches",
      completed: !!profileData.profileImageUrl,
      action: () => toast({ title: "Photo Upload", description: "Click the upload icon to upload your photo" }),
    },
  ], [profileData])

  const { completedItems, totalItems, completionPercentage } = useMemo(() => {
    const completed = profileChecklist.filter((item) => item.completed).length
    const total = profileChecklist.length
    return {
      completedItems: completed,
      totalItems: total,
      completionPercentage: Math.round((completed / total) * 100),
    }
  }, [profileChecklist])

  // Get subscribed creators (active coaches)
  const { subscribedCreators } = useMemberSubscriptions()

  const memberStats = useMemo(
    () => ({
      activeCoaches: Array.isArray(subscribedCreators) ? subscribedCreators.length : 0,
      totalSessions: 18,
      thisWeek: 3,
      thisMonth: 12,
      avgRating: 4.8,
      hoursTraining: 45,
      goalsCompleted: 8,
      improvement: 15,
    }),
    [subscribedCreators.length],
  )

  const recentActivity = useMemo(
    () => [
      { type: "session", title: "Training session with Jordan Smith", time: "2 hours ago", coach: "Jordan S." },
      { type: "achievement", title: "Completed serve consistency goal", time: "1 day ago" },
      { type: "feedback", title: "Received feedback from Alex Rodriguez", time: "2 days ago", coach: "Alex R." },
      { type: "session", title: "Mental performance session", time: "3 days ago", coach: "Jordan S." },
      { type: "milestone", title: "Reached 40 hours of training", time: "4 days ago" },
      { type: "goal", title: "Set new fitness improvement goal", time: "5 days ago" },
    ],
    [],
  )

  // Load profile data from Firebase on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!auth.currentUser) {
        return
      }

      try {
        const memberProfile = await getMemberProfile(auth.currentUser.uid)
        if (memberProfile) {
          setProfileData({
            firstName: memberProfile.firstName || "",
            lastName: memberProfile.lastName || "",
            email: memberProfile.email || "",
            phone: memberProfile.phone || "",
            bio: memberProfile.bio || "",
            location: memberProfile.location || "",
            school: memberProfile.school || "",
            graduationYear: memberProfile.graduationYear || "",
            sport: memberProfile.sport || "",
            position: memberProfile.position || "",
            gpa: memberProfile.gpa || "",
            goals: memberProfile.goals || [],
            achievements: memberProfile.achievements || [],
            interests: memberProfile.interests || [],
            coverImageUrl: memberProfile.coverImageUrl || null,
            profileImageUrl: memberProfile.profileImageUrl || null,
          })
          if (memberProfile.profileImageUrl) {
            setProfileImageUrl(memberProfile.profileImageUrl)
          }
          if (memberProfile.coverImageUrl) {
            setCoverImageUrl(memberProfile.coverImageUrl)
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please refresh the page.",
          variant: "destructive",
          duration: 3000,
        })
      }
    }

    loadProfileData()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  const handleLogout = useCallback(async () => {
    console.log("🔄 Member logout initiated from dashboard")
    await logout({
      customMessage: "Securing your member account and logging out...",
      onComplete: () => {
        console.log("✅ Member logout completed successfully from dashboard")
        toast({
          title: "Logged Out Successfully",
          description: "You have been securely logged out. Redirecting to login page...",
          duration: 2000,
        })
      },
      onError: (error) => {
        console.error("❌ Member logout failed from dashboard:", error)
        toast({
          title: "Logout Failed",
          description: "There was an issue logging you out. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      },
    })
  }, [logout])

  const handleSaveProfile = useCallback(async () => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    
    setIsLoading(true)
    try {
      console.log("Saving profile to Firebase:", profileData)
      
      const profileDataForFirebase = {
        ...profileData,
        name: profileData.firstName + ' ' + profileData.lastName,
        email: profileData.email,
        sport: profileData.sport,
        role: 'member',
        onboardingCompleted: true,
        profileImageUrl: profileImageUrl,
        coverImageUrl: coverImageUrl,
        updatedAt: new Date().toISOString(),
      }
      
      await saveMemberProfile(auth.currentUser.uid, profileDataForFirebase)
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully to Firebase.",
        duration: 3000,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile to Firebase:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save profile to Firebase. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [profileData, profileImageUrl, coverImageUrl])

  // Handler for profile image upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return
    setIsUploadingProfile(true)
    try {
      const url = await uploadProfilePicture(auth.currentUser.uid, file)
      setProfileImageUrl(url)
      setProfileData((prev) => ({ ...prev, profileImageUrl: url }))
      toast({ title: "Profile picture updated!" })
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload profile picture.", variant: "destructive" })
    } finally {
      setIsUploadingProfile(false)
    }
  }

  // Handler for cover image upload
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return
    setIsUploadingCover(true)
    try {
      const url = await uploadCoverPhoto(auth.currentUser.uid, file)
      setCoverImageUrl(url)
      setProfileData((prev) => ({ ...prev, coverImageUrl: url }))
      toast({ title: "Cover photo updated!" })
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload cover photo.", variant: "destructive" })
    } finally {
      setIsUploadingCover(false)
    }
  }

  const mainContentProps = {
    isMobile,
    isTablet,
    isEditing,
    setIsEditing,
    isLoading,
    handleSaveProfile,
    profileData,
    handleProfileChange,
    handleSportChange,
    addGoal,
    removeGoal,
    updateGoal,
    addAchievement,
    removeAchievement,
    updateAchievement,
    addInterest,
    removeInterest,
    updateInterest,
    profileChecklist,
    completionPercentage,
    completedItems,
    totalItems,
    showProfileChecklist,
    setShowProfileChecklist,
    memberStats,
    recentActivity,
    profileImageInputRef,
    coverImageInputRef,
    isUploadingProfile,
    isUploadingCover,
    handleProfileImageChange,
    handleCoverImageChange,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MemberHeader
        currentPath="/member-dashboard"
        onLogout={logout}
        showSearch={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={hasNewTrainingContent}
        profileImageUrl={profileImageUrl || profileData.profileImageUrl}
        profileData={profileData}
      />
      <MainContent {...mainContentProps} />
      <LogoutNotification
        isVisible={loadingState.isVisible}
        userType={loadingState.userType}
        stage={loadingState.stage}
        message={loadingState.message}
        error={loadingState.error}
        canRetry={loadingState.canRetry}
        onRetry={retryLogout}
        onCancel={cancelLogout}
      />

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around h-20 px-6">
            <Link
              href="/member-dashboard"
              className="flex flex-col items-center space-y-2 text-prologue-electric transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/member-training"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Training</span>
            </Link>
            <Link
              href="/member-browse"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link
              href="/member-feedback"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Feedback</span>
            </Link>
            <Link
              href="/member-messaging"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-prologue-electric transition-colors relative"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
              {unreadMessagesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
