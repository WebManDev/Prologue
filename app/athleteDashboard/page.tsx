"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  Bell,
  Home,
  FileText,
  MessageSquare,
  MessageCircle,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Search,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import ProfileHeader from "@/components/profile-header"
import StatsCards from "@/components/stats-cards"
import ProfileEditor, { ProfileData } from "@/components/profile-editor"
import Sidebar from "@/components/sidebar"
import { NotificationProvider } from "@/contexts/notification-context"
import { saveAthleteProfile, auth, getAthleteProfile } from "@/lib/firebase"

// Static quick searches to prevent re-creation
const QUICK_SEARCHES = [
  "Navigate Recruitment",
  "Nutrition",
  "NIL",
  "Training Programs",
  "Mental Performance",
  "Injury Prevention",
  "Sports Psychology",
  "Athletic Scholarships",
]

export default function DashboardPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { hasUnreadMessages } = useNotifications()

  // Search state - isolated to prevent re-renders
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    school: "",
    graduationYear: "",
    sport: "",
    position: "",
    certifications: [],
    specialties: [],
    experience: "",
    achievements: []
  })

  const profileEditorRef = useRef<any>(null)

  // Stable search handlers
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleQuickSearchSelect = useCallback((searchTerm: string) => {
    setSearchQuery(searchTerm)
    setShowSearchDropdown(false)
    console.log("Searching for:", searchTerm)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  const handleLogout = useCallback(async () => {
    console.log("🔄 Athlete logout initiated from dashboard")

    try {
      const success = await logout({
        customMessage: "Securing your athlete account and logging out...",
        onComplete: () => {
          console.log("✅ Athlete logout completed successfully from dashboard")
          toast({
            title: "Logged Out Successfully",
            description: "You have been securely logged out. Redirecting to login page...",
            duration: 2000,
          })
        },
        onError: (error) => {
          console.error("❌ Athlete logout failed from dashboard:", error)
          toast({
            title: "Logout Failed",
            description: "There was an issue logging you out. Please try again.",
            variant: "destructive",
            duration: 3000,
          })
        },
      })

      if (!success) {
        console.warn("⚠️ Athlete logout was not successful, attempting emergency logout")
        setTimeout(() => {
          window.location.href = "/login"
        }, 3000)
      }
    } catch (error) {
      console.error("Logout error:", error)
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    }
  }, [logout])

  const handleEditToggle = useCallback(() => {
    setIsEditing((prev) => !prev)
  }, [])

  const handleSaveProfile = useCallback(async (newProfileData: ProfileData) => {
    setIsSaving(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("User not authenticated")
      await saveAthleteProfile(user.uid, newProfileData)
      const updatedProfile = await getAthleteProfile(user.uid)
      if (updatedProfile) {
        setProfileData({
          firstName: updatedProfile.firstName || "",
          lastName: updatedProfile.lastName || "",
          email: updatedProfile.email || "",
          phone: updatedProfile.phone || "",
          bio: updatedProfile.bio || "",
          location: updatedProfile.location || "",
          school: updatedProfile.school || "",
          graduationYear: updatedProfile.graduationYear || "",
          sport: updatedProfile.sport || "",
          position: updatedProfile.position || "",
          certifications: updatedProfile.certifications || [],
          specialties: updatedProfile.specialties || [],
          experience: updatedProfile.experience || "",
          achievements: updatedProfile.achievements || []
        })
      }
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Fetch athlete profile on mount and when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getAthleteProfile(user.uid).then((profile) => {
          if (profile) {
            setProfileData({
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              email: profile.email || "",
              phone: profile.phone || "",
              bio: profile.bio || "",
              location: profile.location || "",
              school: profile.school || "",
              graduationYear: profile.graduationYear || "",
              sport: profile.sport || "",
              position: profile.position || "",
              certifications: profile.certifications || [],
              specialties: profile.specialties || [],
              experience: profile.experience || "",
              achievements: profile.achievements || []
            })
          }
        })
      }
    })
    return () => unsubscribe()
  }, [])

  // Memoized search component to prevent re-renders
  const SearchComponent = useMemo(
    () => (
      <div className="flex items-center space-x-1 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search athletes, content..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchFocus}
            className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showSearchDropdown && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
              <div className="space-y-1">
                {QUICK_SEARCHES.map((search) => (
                  <button
                    key={search}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                    onClick={() => handleQuickSearchSelect(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    [
      searchQuery,
      showSearchDropdown,
      handleSearchInputChange,
      handleSearchFocus,
      handleClearSearch,
      handleQuickSearchSelect,
    ],
  )

  const DesktopHeader = useMemo(
    () => (
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/Prologue LOGO-1.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>

              {SearchComponent}
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/content"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Content</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/feedback"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 p-2"
                      disabled={loadingState.isLoading}
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-500 p-1" />
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/athleteDashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/promote" className="flex items-center w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/athlete-settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                      disabled={loadingState.isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {loadingState.isLoading ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
    ),
    [SearchComponent, hasUnreadMessages, loadingState.isLoading, handleLogout],
  )

  const MainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      <ProfileHeader
        profileData={profileData}
        isEditing={isEditing}
        isLoading={isSaving}
        onEditToggle={handleEditToggle}
        onSave={() => profileEditorRef.current?.save()}
      />

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2">
          <ProfileEditor
            ref={profileEditorRef}
            isEditing={isEditing}
            initialData={profileData}
            onSave={handleSaveProfile}
            isLoading={isSaving}
          />
        </div>

        <Sidebar profileData={profileData} />
      </div>
    </main>
  )

  if (isMobile || isTablet) {
    return (
      <NotificationProvider>
        <MobileLayout
          userType="athlete"
          currentPath="/dashboard"
          showBottomNav={true}
          unreadNotifications={hasUnreadMessages ? 1 : 0}
          unreadMessages={0}
          hasNewContent={false}
        >
          <MainContent />
        </MobileLayout>
      </NotificationProvider>
    )
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {DesktopHeader}
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
      </div>
    </NotificationProvider>
  )
}
