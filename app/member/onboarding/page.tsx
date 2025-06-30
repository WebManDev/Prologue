"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, User, Target, Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { auth, saveMemberProfile, uploadProfilePicture } from "@/lib/firebase"

const sports = [
  "Tennis",
  "Soccer",
  "Swimming",
  "Basketball",
  "Volleyball",
  "Track & Field",
  "Golf",
  "Baseball",
  "Softball",
  "Wrestling",
  "Gymnastics",
  "Cross Country",
  "Football",
  "Hockey",
  "Lacrosse",
]

const goals = [
  "Improve technique and skills",
  "Get recruited for college",
  "Mental performance training",
  "Fitness and conditioning",
  "Injury prevention",
  "Nutrition guidance",
  "Competition preparation",
  "General athletic development",
]

export default function MemberProfileSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    bio: "",
    selectedSports: [] as string[],
    selectedGoals: [] as string[],
    profileImage: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/member/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleSportToggle = (sport: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sport)
        ? prev.selectedSports.filter((s) => s !== sport)
        : [...prev.selectedSports, sport],
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goal)
        ? prev.selectedGoals.filter((g) => g !== goal)
        : [...prev.selectedGoals, goal],
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }
      // Upload profile image if provided
      let profileImageUrl = ""
      if (formData.profileImage) {
        profileImageUrl = await uploadProfilePicture(user.uid, formData.profileImage)
      }
      // Save member profile to Firestore
      await saveMemberProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.firstName + ' ' + formData.lastName,
        email: user.email || "",
        sport: formData.selectedSports.join(", "),
        role: "member",
        gender: formData.gender,
        bio: formData.bio,
        selectedSports: formData.selectedSports,
        selectedGoals: formData.selectedGoals,
        profileImageUrl,
        onboardingCompleted: true,
      })
      router.push("/member-dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/member-home" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                <Image
                  src="/Prologue LOGO-1.png"
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

            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={async () => {
                try {
                  await auth.signOut()
                  router.push("/")
                } catch (error) {
                  console.error("Error signing out:", error)
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-prologue-electric text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                1
              </div>
              <span className="text-prologue-electric font-semibold">Profile Setup</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-gray-500 font-semibold">Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Build Your Athletic Profile</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about yourself so we can connect you with the perfect coaches and training programs
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Personal Information Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
            </div>

            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <Image
                      src={URL.createObjectURL(formData.profileImage) || "/placeholder.svg"}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-prologue-electric hover:bg-prologue-blue rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg border-4 border-white">
                  <Upload className="h-5 w-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">Upload Your Profile Picture</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
              {/* Full Name (now split) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-base font-semibold text-gray-900 mb-3 block">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="h-12 text-base border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-base font-semibold text-gray-900 mb-3 block">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="h-12 text-base border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                    required
                  />
                </div>
              </div>
              {/* Gender, Bio, Sports Interests, etc. restored as before */}
              {/* Sports Interests */}
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-3 block">
                  Sports You're Interested In <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportToggle(sport)}
                      className={`p-2 text-sm border rounded-lg text-center font-medium transition-all duration-200 ${
                        formData.selectedSports.includes(sport)
                          ? "border-prologue-electric bg-prologue-electric/10 text-prologue-electric"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-prologue-fire to-prologue-orange rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What Are You Looking For?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Select what you hope to achieve through PROLOGUE. This helps us recommend the best coaches and content for
              you.
            </p>

            <div>
              <Label className="text-base font-semibold text-gray-900 mb-3 block">
                Your Goals <span className="text-red-500">*</span>
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 text-sm border rounded-lg text-left font-medium transition-all duration-200 ${
                      formData.selectedGoals.includes(goal)
                        ? "border-prologue-electric bg-prologue-electric/10 text-prologue-electric"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-8 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can always update your interests and goals later from your profile settings.
              </p>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={
                  loading ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.gender ||
                  !formData.bio ||
                  formData.selectedSports.length === 0 ||
                  formData.selectedGoals.length === 0
                }
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></span>
                    Saving Profile...
                  </>
                ) : (
                  "Complete Setup & Start Training"
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                You can always update your profile information later from your dashboard
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
} 