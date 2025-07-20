"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
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
  Plus,
  Trash2,
  Trophy,
  Award,
  Star,
  CheckCircle,
  Share2,
  MoreHorizontal,
  Heart,
  Edit3,
  Save,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useNotifications } from "@/contexts/notification-context"
import { toast } from "@/components/ui/use-toast"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import ProfileHeader, { type ProfileHeaderHandle } from "@/components/dashboard/profile-header"
import ProfileEditor, { type ProfileEditorHandle } from "@/components/dashboard/profile-editor"
import Sidebar from "@/components/dashboard/sidebar"
import { ProfileEditorMobile } from "@/components/dashboard/mobile-profile-layout"
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "@/lib/firebase";
import AthleteDashboardMobileLayout from "@/components/mobile/athlete-dashboard-mobile-layout"
import { AthleteHeader } from "@/components/navigation/athlete-header"

const initialProfileData = {
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
  achievements: [],
  profilePhotoUrl: "",
  coverPhotoUrl: "",
  stripeAccountId: "",
};

export type ProfileData = typeof initialProfileData

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

  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState(initialProfileData)

  const headerRef = useRef<ProfileHeaderHandle>(null)
  const editorRef = useRef<ProfileEditorHandle>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (!user) {
        // Optionally redirect or show login
        return;
      }
      const docRef = doc(db, "athletes", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          ...initialProfileData,
          ...data
        });
        // Stripe is now optional - no blocking required
        // Athletes can set up Stripe later through settings if needed
      }
    });
    return () => unsubscribe();
  }, []);

  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout()

  const handleLogout = useCallback(async () => {
    await logout({
      onComplete: () => {
        toast({
          title: "Logged Out Successfully",
          description: "You have been securely logged out.",
          duration: 2000,
        })
      },
      onError: () => {
        toast({
          title: "Logout Failed",
          description: "There was an issue logging you out. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      },
    })
  }, [logout])

  // Add refs for file inputs at the top of DashboardPage
  const profilePicFileRef = useRef<File | null>(null);
  const coverFileRef = useRef<File | null>(null);

  // Add handler for file input changes
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    profilePicFileRef.current = e.target.files?.[0] || null;
  };
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    coverFileRef.current = e.target.files?.[0] || null;
  };

  // Add this function inside DashboardPage, after hooks and before handlers
  const saveProfileData = useCallback(async (newProfileData: ProfileData, files?: { profilePhotoFile?: File | null, coverPhotoFile?: File | null }) => {
    setIsSaving(true);
    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive",
        duration: 3000,
      });
      setIsSaving(false);
      return;
    }
    try {
      let profilePhotoUrl = newProfileData.profilePhotoUrl || "";
      let coverPhotoUrl = newProfileData.coverPhotoUrl || "";
      // Upload profile photo if provided
      if (files?.profilePhotoFile) {
        const storage = getStorage();
        const profileRef = ref(storage, `athlete-profile-pics/${uid}-${Date.now()}`);
        await uploadBytes(profileRef, files.profilePhotoFile);
        profilePhotoUrl = await getDownloadURL(profileRef);
      }
      // Upload cover photo if provided
      if (files?.coverPhotoFile) {
        const storage = getStorage();
        const coverRef = ref(storage, `athlete-cover-pics/${uid}-${Date.now()}`);
        await uploadBytes(coverRef, files.coverPhotoFile);
        coverPhotoUrl = await getDownloadURL(coverRef);
      }
      const updatedProfile = {
        ...newProfileData,
        profilePhotoUrl,
        coverPhotoUrl,
      };
      await setDoc(doc(db, 'athletes', uid), updatedProfile, { merge: true });
      setProfileData(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
        duration: 3000,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update handleSaveProfile for desktop to use saveProfileData
  const handleSaveProfile = useCallback(async (data: ProfileData) => {
    setIsSaving(true);
    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive",
        duration: 3000,
      });
      setIsSaving(false);
      return;
    }
    try {
      const updatedProfile = { ...profileData, ...data };
      await setDoc(doc(db, 'athletes', uid), updatedProfile, { merge: true });
      setProfileData(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save profile to Firebase. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [profileData, toast]);

  // Add a handler for mobile save
  const handleMobileSave = useCallback(
    async (newProfileData: ProfileData) => {
      await saveProfileData(newProfileData);
    },
    [saveProfileData]
  );

  const handleEditToggle = useCallback(() => {
    setIsEditing((prev) => !prev)
  }, [])

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

  const DesktopContent = () => (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="relative">
        <ProfileHeader
          ref={headerRef}
          profileData={{
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            sport: profileData.sport,
            experience: profileData.experience,
            location: profileData.location,
            school: profileData.school,
            bio: profileData.bio,
            profilePhotoUrl: profileData.profilePhotoUrl,
            coverPhotoUrl: profileData.coverPhotoUrl,
            isVerified: !!profileData.stripeAccountId,
          }}
          isEditing={isEditing}
          isLoading={isSaving}
          onEditToggle={handleEditToggle}
          onSave={(data) => {
            const updatedData = {
              ...profileData,
              firstName: data.firstName,
              lastName: data.lastName,
              sport: data.sport,
              experience: data.experience,
              location: data.location,
              school: data.school,
              bio: data.bio,
            };
            handleSaveProfile(updatedData);
          }}
          onProfilePicChange={handleProfilePicChange}
          onCoverChange={handleCoverChange}
        />
        {isEditing && (
          <div className="flex space-x-2 mt-4">
            <Button onClick={() => {
              const headerData = headerRef.current?.getFormData();
              const editorData = editorRef.current?.getFormData();
              if (headerData && editorData) {
                const merged = { 
                  ...profileData,
                  firstName: headerData.firstName,
                  lastName: headerData.lastName,
                  sport: headerData.sport,
                  experience: headerData.experience,
                  location: headerData.location,
                  school: headerData.school,
                  bio: headerData.bio,
                  email: editorData.email,
                  phone: editorData.phone,
                  graduationYear: editorData.graduationYear,
                  position: editorData.position,
                  certifications: editorData.certifications,
                  specialties: editorData.specialties,
                  achievements: editorData.achievements,
                };
                handleSaveProfile(merged);
              }
            }} disabled={isSaving} size="sm" className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="ml-2">Save Changes</span>
            </Button>
            <Button variant="outline" onClick={handleEditToggle} disabled={isSaving} size="sm" className="bg-transparent">
              Cancel
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mt-8">
        <div className="lg:col-span-2">
          <ProfileEditor 
            ref={editorRef} 
            isEditing={isEditing} 
            initialData={profileData} 
            isLoading={isSaving}
            onSave={handleSaveProfile}
          />
        </div>
        <Sidebar profileData={profileData} />
      </div>
    </main>
  )

  if (isMobile) {
    return (
      <AthleteDashboardMobileLayout
        currentPath="/athleteDashboard"
        unreadNotifications={hasUnreadMessages ? 1 : 0}
        unreadMessages={hasUnreadMessages ? 1 : 0}
        hasNewContent={false}
        profilePhotoUrl={profileData.profilePhotoUrl}
      >
        <ProfileEditorMobile
          profileData={profileData}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditToggle={() => setIsEditing((v) => !v)}
          onSave={saveProfileData}
        />
      </AthleteDashboardMobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AthleteHeader
        currentPath="/athleteDashboard"
        onLogout={handleLogout}
        unreadNotifications={hasUnreadMessages ? 1 : 0}
        unreadMessages={hasUnreadMessages ? 1 : 0}
        profileImageUrl={profileData.profilePhotoUrl}
        profileData={profileData}
      />
      <DesktopContent />
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
  )
}

