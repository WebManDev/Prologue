"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Star, MapPin, Edit3, Heart, Trophy, Users, Save, X, Plus, Trash } from "lucide-react"
import { useState, useCallback, memo, useEffect, useRef, useMemo } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MemberHeader } from "@/components/navigation/member-header"
import { auth, getMemberProfile } from "@/lib/firebase"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import Link from 'next/link'
import { Home, BookOpen, Search, MessageSquare, MessageCircle } from 'lucide-react'
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Define interfaces at the top level
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  sport: string;
  position: string;
  experience: string;
  bio: string;
  avatar: string;
  coverImage: string;
  achievements: string[];
  trainingPrograms: string[];
  areasOfFocus: string[];
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedDate: string
  category: "training" | "competition" | "milestone" | "social"
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    verified: boolean
  }
  content: string
  media?: {
    type: "image" | "video"
    url: string
    thumbnail?: string
  }[]
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  tags: string[]
}

interface Following {
  id: string
  name: string
  avatar: string
  sport: string
  verified: boolean
  mutualConnections: number
}

// Memoized Edit Profile Form Component
const EditProfileForm = memo(
  ({
    initialData,
    onSave,
    onCancel,
    onUpdateAvatar,
    onUpdateCoverImage,
  }: {
    initialData: Omit<ProfileData, "avatar" | "coverImage">
    onSave: (data: Omit<ProfileData, "avatar" | "coverImage">) => void
    onCancel: () => void
    onUpdateAvatar: (url: string) => void
    onUpdateCoverImage: (url: string) => void
  }) => {
    const [editData, setEditData] = useState(initialData)

    const handleInputChange = useCallback((field: keyof typeof editData, value: string) => {
      setEditData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }, [])

    const handleListChange = useCallback(
      (listName: "achievements" | "trainingPrograms" | "areasOfFocus", index: number, value: string) => {
        setEditData((prev) => {
          const newList = [...prev[listName]]
          newList[index] = value
          return {
            ...prev,
            [listName]: newList,
          }
        })
      },
      [],
    )

    const addListItem = useCallback((listName: "achievements" | "trainingPrograms" | "areasOfFocus") => {
      setEditData((prev) => ({
        ...prev,
        [listName]: [...prev[listName], ""],
      }))
    }, [])

    const removeListItem = useCallback(
      (listName: "achievements" | "trainingPrograms" | "areasOfFocus", index: number) => {
        setEditData((prev) => {
          const newList = [...prev[listName]]
          newList.splice(index, 1)
          return {
            ...prev,
            [listName]: newList,
          }
        })
      },
      [],
    )

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, updater: (url: string) => void) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          updater(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    return (
      <div className="space-y-4">
            <div>
          <Label htmlFor="firstName">First Name</Label>
                              <Input
            id="firstName"
            value={editData.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Enter your first name"
          />
                            </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editData.lastName || ""}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
            value={editData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email"
            disabled
          />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
            value={editData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
            value={editData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Enter your location"
          />
                    </div>
                    <div>
          <Label htmlFor="sport">Primary Sport</Label>
                      <Input
            id="sport"
            value={editData.sport}
            onChange={(e) => handleInputChange("sport", e.target.value)}
            placeholder="Enter your primary sport"
          />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
            value={editData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            placeholder="Enter your position"
          />
                    </div>
                    <div>
          <Label htmlFor="experience">Experience</Label>
                      <Input
            id="experience"
            value={editData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            placeholder="Enter your experience"
          />
                    </div>
                  <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={editData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell coaches about your athletic journey and goals..."
            className="min-h-[120px] resize-none"
          />
                  </div>
        {/* <div>
          <Label htmlFor="avatar">Avatar</Label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={(e) => handleFileChange(e, onUpdateAvatar)}
            className="hidden"
          />
          <Button variant="outline" onClick={() => document.getElementById("avatar")?.click()} className="w-full">
            {editData.avatar ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={editData.avatar} alt="Avatar" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            ) : (
              "Upload Avatar"
            )}
                      </Button>
        </div> */}
        {/* <div>
          <Label htmlFor="coverImage">Cover Image</Label>
          <input
            type="file"
            id="coverImage"
            accept="image/*"
            onChange={(e) => handleFileChange(e, onUpdateCoverImage)}
            className="hidden"
          />
          <Button variant="outline" onClick={() => document.getElementById("coverImage")?.click()} className="w-full">
            {editData.coverImage ? (
              <img src={editData.coverImage} alt="Cover" className="h-20 w-full object-cover rounded-md" />
            ) : (
              "Upload Cover Image"
            )}
                      </Button>
        </div> */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2">Key Achievements</h4>
          <div className="space-y-2">
            {editData.achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center">
                <Input className="flex-1" value={achievement} onChange={e => handleListChange("achievements", idx, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeListItem("achievements", idx)} className="ml-2">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-3" onClick={() => addListItem("achievements")}> <Plus className="h-4 w-4 mr-2" /> Add Achievement </Button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2">Training Programs Completed</h4>
          <div className="space-y-2">
            {editData.trainingPrograms.map((program, idx) => (
              <div key={idx} className="flex items-center">
                <Input className="flex-1" value={program} onChange={e => handleListChange("trainingPrograms", idx, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeListItem("trainingPrograms", idx)} className="ml-2">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-3" onClick={() => addListItem("trainingPrograms")}> <Plus className="h-4 w-4 mr-2" /> Add Program </Button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2">Areas of Focus</h4>
          <div className="space-y-2">
            {editData.areasOfFocus.map((focus, idx) => (
              <div key={idx} className="flex items-center">
                <Input className="flex-1" value={focus} onChange={e => handleListChange("areasOfFocus", idx, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeListItem("areasOfFocus", idx)} className="ml-2">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-3" onClick={() => addListItem("areasOfFocus")}> <Plus className="h-4 w-4 mr-2" /> Add Focus </Button>
        </div>
        <div className="sticky bottom-0 bg-white py-4 flex justify-end space-x-2 border-t mt-8">
  <Button variant="outline" onClick={onCancel}>
    <X className="h-4 w-4 mr-2" />
    Cancel
  </Button>
  <Button onClick={() => onSave(editData)} className="bg-prologue-electric hover:bg-prologue-blue">
    <Save className="h-4 w-4 mr-2" />
    Save Changes
  </Button>
</div>
        </div>
    )
  },
)
EditProfileForm.displayName = "EditProfileForm"

// Add or update the saveMemberProfile function to save to the 'members' collection in Firestore
async function saveMemberProfile(uid: string, profileData: any) {
  await setDoc(doc(db, 'members', uid), profileData, { merge: true });
}

export default function MemberDashboardPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    sport: "Tennis",
    position: "Singles Player",
    experience: "5 years",
    bio: "Passionate tennis player focused on improving my game and connecting with other athletes. Always looking for new training opportunities and ways to grow. Currently training 6 days a week and competing in regional tournaments. My goal is to compete at the collegiate level and eventually turn professional.",
    avatar: "/placeholder.svg?height=120&width=120",
    coverImage: "/placeholder.svg?height=200&width=800",
    achievements: [
      "Completed first competitive tournament",
      "Achieved personal best in training metrics",
      "Maintained consistent training schedule for 3 months",
      "Improved technique scores by 25%",
      "Successfully completed beginner to intermediate program",
      "Earned team captain recognition",
    ],
    trainingPrograms: [
      "Fundamentals of Tennis Program",
      "Mental Toughness Training Course",
      "Youth Athletic Development Program",
      "Sports Nutrition Basics",
      "Injury Prevention Workshop",
      "Competition Preparation Course",
    ],
    areasOfFocus: [
      "Improving Technical Skills",
      "Building Mental Resilience",
      "Developing Match Strategy",
      "Enhancing Physical Fitness",
      "Learning Competition Tactics",
      "Setting and Achieving Goals",
    ],
  })

  // Firebase hydration logic
  useEffect(() => {
    const hydrateProfile = async () => {
      if (!auth.currentUser) return
      const firebaseProfile = await getMemberProfile(auth.currentUser.uid)
      if (firebaseProfile) {
        setProfile((prev) => ({
          firstName: firebaseProfile.firstName || prev.firstName,
          lastName: firebaseProfile.lastName || prev.lastName,
          email: firebaseProfile.email || prev.email,
          phone: firebaseProfile.phone || prev.phone,
          location: firebaseProfile.location || prev.location,
          sport: firebaseProfile.sport || prev.sport,
          position: firebaseProfile.position || prev.position,
          experience: firebaseProfile.experience || prev.experience,
          bio: firebaseProfile.bio || prev.bio,
          avatar: firebaseProfile.avatar || firebaseProfile.profileImageUrl || prev.avatar,
          coverImage: firebaseProfile.coverImage || prev.coverImage,
          achievements: firebaseProfile.achievements || prev.achievements,
          trainingPrograms: firebaseProfile.trainingPrograms || prev.trainingPrograms,
          areasOfFocus: firebaseProfile.areasOfFocus || prev.areasOfFocus,
        }))
      }
    }
    hydrateProfile()
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEffect(() => {
    const hydrateProfile = async () => {
      if (!auth.currentUser) return
      const firebaseProfile = await getMemberProfile(auth.currentUser.uid)
      if (firebaseProfile) {
        setProfileData(prev => ({
          ...prev,
          firstName: firebaseProfile.firstName || prev.firstName,
          lastName: firebaseProfile.lastName || prev.lastName,
          email: firebaseProfile.email || prev.email,
          phone: firebaseProfile.phone || prev.phone,
          bio: firebaseProfile.bio || prev.bio,
          location: firebaseProfile.location || prev.location,
          school: firebaseProfile.school || prev.school,
          graduationYear: firebaseProfile.graduationYear || prev.graduationYear,
          sport: firebaseProfile.sport || prev.sport,
          position: firebaseProfile.position || prev.position,
          gpa: firebaseProfile.gpa || prev.gpa,
          goals: firebaseProfile.goals || prev.goals,
          achievements: firebaseProfile.achievements || prev.achievements,
          interests: firebaseProfile.interests || prev.interests,
          coverImageUrl: firebaseProfile.coverImageUrl || prev.coverImageUrl,
          profileImageUrl: firebaseProfile.profileImageUrl || prev.profileImageUrl,
        }))
      }
    }
    hydrateProfile()
  }, [])

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
        });
      },
    })
  }, [logout])

  const handleSaveProfile = useCallback(async (data: Omit<ProfileData, "avatar" | "coverImage">) => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    try {
      const updatedProfile = { ...profile, ...data };
      console.log("Saving profile to Firebase:", updatedProfile);
      await saveMemberProfile(auth.currentUser.uid, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving profile to Firebase:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile to Firebase. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [profile, toast]);

  // Handler for profile image upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return
    setIsUploadingProfile(true)
    try {
      // const url = await uploadProfilePicture(auth.currentUser.uid, file)
      // setProfileImageUrl(url)
      // setProfileData((prev) => ({ ...prev, profileImageUrl: url }))
      toast({ title: "Photo Upload", description: "Click the upload icon to upload your photo" })
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
      // const url = await uploadCoverPhoto(auth.currentUser.uid, file)
      // setCoverImageUrl(url)
      // setProfileData((prev) => ({ ...prev, coverImageUrl: url }))
      toast({ title: "Cover photo updated!" })
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload cover photo.", variant: "destructive" })
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleLike = (postId: string) => {
    setSubscribedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Comments",
      description: "Comments feature coming soon!",
    });
  };

  const [subscribedPosts, setSubscribedPosts] = useState<Post[]>([
    {
      id: "post-1",
      author: { name: "Jordan Smith", avatar: "/placeholder.svg", verified: true },
      content: "Just completed a fantastic training session with Coach Johnson. Focused on improving my backhand technique and overall consistency. Highly recommend his training programs!",
      media: [],
      timestamp: "2 hours ago",
      likes: 15,
      comments: 3,
      shares: 2,
      isLiked: false,
      tags: ["Tennis", "Training"],
    },
    {
      id: "post-2",
      author: { name: "Alex Rodriguez", avatar: "/placeholder.svg", verified: false },
      content: "Excited to announce my latest NIL deal with Sports Pro Agency. It's been a long journey, but I'm proud of what I've achieved. #NIL #SportsBusiness",
      media: [],
      timestamp: "1 day ago",
      likes: 25,
      comments: 5,
      shares: 3,
      isLiked: false,
      tags: ["NIL", "Sports Business"],
    },
    {
      id: "post-3",
      author: { name: "Jordan Smith", avatar: "/placeholder.svg", verified: true },
      content: "Just finished a mental performance session with Coach Rodriguez. It was incredibly insightful and helped me gain a new perspective on my game. #SportsPsychology #MentalToughness",
      media: [],
      timestamp: "2 days ago",
      likes: 10,
      comments: 2,
      shares: 1,
      isLiked: false,
      tags: ["Sports Psychology", "Mental Performance"],
    },
    {
      id: "post-4",
      author: { name: "Alex Rodriguez", avatar: "/placeholder.svg", verified: false },
      content: "Completed my 40th hour of training this week. Feeling stronger and more confident. #TrainingProgress #Fitness",
      media: [],
      timestamp: "4 days ago",
      likes: 8,
      comments: 1,
      shares: 0,
      isLiked: false,
      tags: ["Training", "Fitness"],
    },
  ]);

  // Move MainContent definition here so it can access state/handlers
  const MainContent = () => (
    <div className={`${isMobile ? "px-4 py-4 pb-20" : "px-6 py-6"} min-h-screen`}>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 lg:mb-8 overflow-hidden">
        <div
          className="h-24 lg:h-32 relative bg-gradient-to-r from-blue-500 to-blue-600"
          style={
            profile.coverImage
              ? {
                  backgroundImage: `url(${profile.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="px-4 lg:px-8 pb-4 lg:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between -mt-12 lg:-mt-16">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              <div className="relative self-center lg:self-auto">
                <Avatar className="w-20 h-20 lg:w-24 lg:h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={`${profile.firstName} ${profile.lastName}`} />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    {[profile.firstName, profile.lastName].filter(Boolean).map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-4 lg:pt-16 text-center lg:text-left flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                </div>
                <p className="text-gray-600 mb-2 text-sm lg:text-base">
                  {profile.sport} • {profile.position} • {profile.experience} Experience
                </p>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 text-xs lg:text-sm text-gray-600 mb-4 space-y-1 lg:space-y-0">
                  <div className="flex items-center justify-center lg:justify-start space-x-1">
                    <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{profile.bio}</p>
                </div>
              </div>
            </div>
            <div className="pt-4 lg:pt-16 flex flex-col items-center lg:items-end space-y-3">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  {isEditing && (
                    <EditProfileForm
                      initialData={profile}
                      onSave={handleSaveProfile}
                      onCancel={() => setIsEditing(false)}
                      onUpdateAvatar={(url: string) => setProfile(prev => ({ ...prev, avatar: url }))}
                      onUpdateCoverImage={(url: string) => setProfile(prev => ({ ...prev, coverImage: url }))}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2">
          {/* Recent Posts Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold text-lg">Subscribed Content</span>
              </div>
              <div className="space-y-4">
                {subscribedPosts.slice(0, 4).map((post) => (
                  <div key={post.id} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback className="text-sm">
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{post.author.name}</span>
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-gray-500 text-sm">{post.timestamp}</span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                        <div className="flex items-center space-x-6 text-gray-500">
                          <button
                            className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current text-red-500" : ""}`} />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
                            onClick={() => handleComment(post.id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => toast({ title: "Posts", description: "Loading more posts..." })}
                >
                  Load More
                </Button>
              </div>
            </div>
          </div>
          {/* Key Achievements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold text-lg">Key Achievements</span>
              </div>
              <div className="space-y-3">
                {profile.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm lg:text-base">{achievement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Training Programs Completed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold text-lg">Training Programs Completed</span>
              </div>
              <div className="space-y-3">
                {profile.trainingPrograms.map((program, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm lg:text-base">{program}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Areas of Focus */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <div className="flex items-center space-x-2 mb-4">
                <Star className="h-5 w-5" />
                <span className="font-semibold text-lg">Areas of Focus</span>
              </div>
              <div className="space-y-3">
                {profile.areasOfFocus.map((focus, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm lg:text-base">{focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <h3 className="text-base lg:text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{profile.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{profile.experience} experience</span>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <h3 className="text-base lg:text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  {
                    type: "training",
                    action: "Completed training session",
                    time: "2 hours ago",
                    icon: Trophy,
                  },
                  {
                    type: "content",
                    action: "Watched new instructional video",
                    time: "5 hours ago",
                    icon: Users,
                  },
                  {
                    type: "progress",
                    action: "Updated training progress",
                    time: "1 day ago",
                    icon: Heart,
                  },
                  {
                    type: "achievement",
                    action: "Earned new achievement badge",
                    time: "2 days ago",
                    icon: Trophy,
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <activity.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Trophy className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sport & Position */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-4 lg:px-6 py-4 lg:py-6">
              <h3 className="text-base lg:text-lg font-semibold mb-4">Sport Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Primary Sport</span>
                  <Badge variant="secondary">{profile.sport}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Position</span>
                  <Badge variant="outline">{profile.position}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

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
      <MainContent />
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
          <div className="flex items-center justify-around h-16 px-4">
            <Link
              href="/member-dashboard"
              className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/member-training"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Training</span>
            </Link>
            <Link
              href="/member-browse"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link
              href="/member-feedback"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Feedback</span>
            </Link>
            <Link
              href="/member-messaging"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors relative"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
              {unreadMessagesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
