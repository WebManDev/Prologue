"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Settings,
  User,
  Bell,
  Home,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Search,
  Lock,
  BookOpen,
  Save,
  CreditCard,
  Compass,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { auth, db } from "@/lib/firebase"
import { doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail, fetchSignInMethodsForEmail, verifyBeforeUpdateEmail } from "firebase/auth"
import React from "react"
import { collection, getDoc as getDocFromCollection } from "firebase/firestore";

function MemberSubscriptions({ members }: { members: any }) {
  const [athleteData, setAthleteData] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAthletes() {
      if (!members || !members.subscriptions) return;
      setLoading(true);
      const athleteIds = Object.keys(members.subscriptions);
      const newAthleteData: Record<string, any> = {};
      for (const athleteId of athleteIds) {
        try {
          const docRef = doc(db, "athletes", athleteId);
          const docSnap = await getDocFromCollection(docRef);
          if (docSnap.exists()) {
            newAthleteData[athleteId] = docSnap.data();
          }
        } catch (e) {
          // Optionally handle error
        }
      }
      setAthleteData(newAthleteData);
      setLoading(false);
    }
    fetchAthletes();
  }, [members]);

  const handleManage = async (stripeSubscriptionId: string | undefined, stripeCustomerId: string | undefined) => {
    if (!stripeCustomerId) {
      alert("No Stripe customer ID found for this subscription.");
      return;
    }
    try {
      const res = await fetch("/api/stripe/create-customer-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          subscriptionId: stripeSubscriptionId,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Failed to open Stripe portal");
    } catch (err: any) {
      alert(err.message || "Failed to open Stripe portal");
    }
  };

  if (!members || !members.subscriptions) return <div>Loading...</div>;
  if (loading) return <div>Loading subscriptions...</div>;

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Your Subscriptions</h3>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Athlete</th>
            <th className="text-left p-2">Plan</th>
            <th className="text-left p-2">Status</th>
            <th className="text-right p-2">Manage</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(members.subscriptions).map(([athleteId, sub]: [string, any]) => {
            const athlete = athleteData[athleteId];
            return (
              <tr key={athleteId} className="border-t">
                <td className="p-2 flex items-center gap-2">
                  {athlete?.profilePicture && (
                    <img src={athlete.profilePicture} alt={athlete.name} className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <span>{athlete?.name || athleteId}</span>
                </td>
                <td className="p-2 capitalize">{sub.plan}</td>
                <td className="p-2">{sub.status}</td>
                <td className="p-2 text-right">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    onClick={() => handleManage(sub.stripeSubscriptionId, sub.stripeCustomerId)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function MemberSettingsPage() {
  const { unreadMessagesCount, unreadNotificationsCount } = useMemberNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Settings state
  const [settings, setSettings] = useState({
    // Profile settings
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)

  // Email change state
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailChangeData, setEmailChangeData] = useState({
    currentPassword: "",
    newEmail: "",
  })
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)

  // Quick search suggestions
  const quickSearches = [
    "Navigate Recruitment",
    "Nutrition",
    "NIL",
    "Training Programs",
    "Mental Performance",
    "Injury Prevention",
    "Sports Psychology",
    "Athletic Scholarships",
  ]

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const { logout, loadingState } = useUnifiedLogout()
  const isLoggingOut = loadingState.isLoading

  const handleLogout = async () => {
    try {
      await logout({
        onError: (error: unknown) => {
          console.error("Logout error:", error);
        }
      });
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  }

  const handleSaveSettings = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Not Logged In",
        description: "Please log in to save settings.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setSaving(true)
    try {
      const memberRef = doc(db, "members", auth.currentUser.uid)
      await updateDoc(memberRef, {
        firstName: settings.firstName,
        lastName: settings.lastName,
        phone: settings.phone,
        // Email is always synced from Firebase Auth automatically
        email: auth.currentUser.email || "",
        updatedAt: new Date().toISOString()
      })
      toast({
        title: "Settings Saved",
        description: "Your profile settings have been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Not Logged In",
        description: "Please log in to change your password.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords don't match. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setChangingPassword(true)

    try {
      // Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        passwordData.currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update the password
      await updatePassword(auth.currentUser, passwordData.newPassword)

      // Reset form and close dialog
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordDialog(false)

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      let errorMessage = "Failed to change password. Please try again."
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak. Please choose a stronger password."
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in, then try changing your password again."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setChangingPassword(false)
    }
  }



  const handleChangeEmail = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Not Logged In",
        description: "Please log in to change your email.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailChangeData.newEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (emailChangeData.newEmail === auth.currentUser.email) {
      toast({
        title: "Same Email",
        description: "This is already your current email address.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setChangingEmail(true)

    try {
      // First, check if the new email is already taken
      const signInMethods = await fetchSignInMethodsForEmail(auth, emailChangeData.newEmail)
      if (signInMethods.length > 0) {
        toast({
          title: "Email Already Taken",
          description: "This email address is already associated with another account.",
          variant: "destructive",
          duration: 4000,
        })
        return
      }

      // Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        emailChangeData.currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Send verification email for the new email address
      await verifyBeforeUpdateEmail(auth.currentUser, emailChangeData.newEmail)

      // Reset form and close dialog
      setEmailChangeData({ currentPassword: "", newEmail: "" })
      setShowEmailDialog(false)

      toast({
        title: "Verification Email Sent",
        description: `A verification email has been sent to ${emailChangeData.newEmail}. Please check your inbox and click the link to complete the email change. Your new email will automatically appear here once verified.`,
        duration: 8000,
      })
    } catch (error: any) {
      console.error("Error changing email:", error)
      let errorMessage = "Failed to change email. Please try again."
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect."
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email address is already associated with another account."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is invalid."
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in, then try changing your email again."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email change is not allowed. Please contact support."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many email change requests. Please try again later."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setChangingEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      alert("Not logged in!");
      return;
    }
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      // Delete Firestore document
      await deleteDoc(doc(db, "members", auth.currentUser.uid));
      // Delete Auth user
      await auth.currentUser.delete();
      // Log out and redirect
      await logout();
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        alert("Please re-authenticate and try again.");
      } else {
        alert(error.message || "Account deletion failed. Please try again.");
      }
    }
  }

  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscriptions = async () => {
    setPortalLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const res = await fetch("/api/stripe/create-customer-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message || "Failed to open Stripe portal");
    } finally {
      setPortalLoading(false);
    }
  };

  async function openPortal(userId: string, athleteId: string) {
    const res = await fetch('/api/stripe/create-customer-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, athleteId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  const [members, setMembers] = useState<any>(null);
  
  // Load member data - email always comes from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true)
        try {
          // Reload user to get latest auth state
          await user.reload()
          
          const docRef = doc(db, "members", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const memberData = docSnap.data()
            setMembers({ id: user.uid, ...memberData });
            
            // Always use Firebase Auth email as the source of truth
            const authEmail = user.email || ""
            
            // Always keep Firestore in sync with Auth email
            if (authEmail) {
              await updateDoc(docRef, {
                email: authEmail,
                updatedAt: new Date().toISOString()
              })
            }
            
            // Update settings with member data (email always from Firebase Auth)
            setSettings({
              firstName: memberData.firstName || "",
              lastName: memberData.lastName || "",
              email: authEmail,
              phone: memberData.phone || "",
            })
          }
        } catch (error) {
          console.error("Error loading member data:", error)
        } finally {
          setLoading(false)
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/member-home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-logo.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-prologue-electric transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search coaches, content..."
                    className="w-80 pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20 transition-all"
                    onFocus={() => setShowSearchDropdown(true)}
                  />
                </div>

                {showSearchDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
                      <div className="space-y-1">
                        {quickSearches.map((search, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                            onClick={() => setShowSearchDropdown(false)}
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/member-home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-training"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">Training</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-browse"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <Compass className="h-5 w-5" />
                  <span className="text-xs font-medium">Discover</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-feedback"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors relative group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {unreadMessagesCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={isLoggingOut}>
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-500 p-1" />
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/member-dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/member-settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={isLoggingOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and privacy settings</p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={settings.firstName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, firstName: e.target.value })}
                          disabled={saving}
                          placeholder="Enter your first name"
                        />
                        {!settings.firstName && (
                          <p className="text-sm text-gray-500 mt-1">📝 Add your first name</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={settings.lastName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, lastName: e.target.value })}
                          disabled={saving}
                          placeholder="Enter your last name"
                        />
                        {!settings.lastName && (
                          <p className="text-sm text-gray-500 mt-1">📝 Add your last name</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={auth.currentUser?.email || settings.email}
                        disabled={true}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This email is directly linked to your authentication account. To change it, use the secure change option below.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, phone: e.target.value })}
                        disabled={saving}
                        placeholder="Enter your phone number"
                      />
                      {!settings.phone && (
                        <p className="text-sm text-gray-500 mt-1">📞 Add your phone number for coaches to contact you</p>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Security</h4>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent"
                    onClick={() => setShowEmailDialog(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Change Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Payments</h4>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleManageSubscriptions} disabled={portalLoading}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {portalLoading ? "Loading..." : "Manage Subscriptions"}
                  </Button>
                </div>
                <MemberSubscriptions members={members} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSaveSettings} 
            className="bg-prologue-electric hover:bg-prologue-blue"
            disabled={saving || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one. Your password must be at least 6 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  disabled={changingPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  disabled={changingPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  disabled={changingPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordDialog(false)
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
              }}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                changingPassword ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Change Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your current password and your new email address. A verification email will be sent to the new address to complete the change securely.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentEmailPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentEmailPassword"
                  type={showEmailPassword ? "text" : "password"}
                  value={emailChangeData.currentPassword}
                  onChange={(e) => setEmailChangeData({ ...emailChangeData, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                >
                  {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailChangeData.newEmail}
                onChange={(e) => setEmailChangeData({ ...emailChangeData, newEmail: e.target.value })}
                placeholder="Enter your new email address"
              />
              <p className="text-sm text-gray-500 mt-1">A verification link will be sent to this email address</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={changingEmail}>
              Cancel
            </Button>
            <Button onClick={handleChangeEmail} disabled={changingEmail || !emailChangeData.currentPassword || !emailChangeData.newEmail}>
              {changingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {changingEmail ? "Sending Verification..." : "Send Verification Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
} 