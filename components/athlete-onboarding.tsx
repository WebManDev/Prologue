"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, User, Trophy, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth, saveAthleteProfile, uploadProfilePicture } from "@/lib/firebase"
import { Logo } from "@/components/logo"

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

interface AthleteOnboardingProps {
  onComplete: () => void
  onLogout: () => void
}

export function AthleteOnboarding({ onComplete, onLogout }: AthleteOnboardingProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    selectedSports: [] as string[],
    basicTierPrice: "4.99",
    proTierPrice: "9.99",
    premiumTierPrice: "19.99",
    profileImage: null as File | null,
  })

  const handleSportToggle = (sport: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sport)
        ? prev.selectedSports.filter((s) => s !== sport)
        : [...prev.selectedSports, sport],
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
    
    if (!auth.currentUser) {
      console.error("No user logged in")
      return
    }

    setIsSubmitting(true)

    try {
      let profilePictureUrl = ""
      
      // Upload profile picture if one was selected
      if (formData.profileImage) {
        profilePictureUrl = await uploadProfilePicture(auth.currentUser.uid, formData.profileImage)
      }

      // Save profile data to Firebase
      await saveAthleteProfile(auth.currentUser.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: auth.currentUser.email || "",
        phone: "",
        bio: formData.bio,
        location: "",
        school: "",
        graduationYear: "",
        sport: formData.selectedSports[0] || "",
        position: "",
        certifications: [],
        specialties: formData.selectedSports,
        experience: "",
        achievements: [],
        profilePicture: profilePictureUrl,
        role: "athlete",
        pricing: {
          basic: parseFloat(formData.basicTierPrice),
          pro: parseFloat(formData.proTierPrice),
          premium: parseFloat(formData.premiumTierPrice)
        }
      })

      // Call the onComplete callback to proceed to dashboard
      router.push("/athleteDashboard")
    } catch (error) {
      console.error("Error saving profile:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 group cursor-pointer">
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
            </div>
            <Button onClick={onLogout} variant="outline">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Build Your Champion Profile</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create your professional profile to start sharing your expertise and connecting with aspiring athletes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Athlete Profile Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Athlete Profile</h2>
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

            {/* Vertical Form Layout */}
            <div className="space-y-8">
              {/* First Name */}
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

              {/* Last Name */}
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

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-base font-semibold text-gray-900 mb-3 block">
                  Bio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell potential students about your background, achievements, and coaching philosophy..."
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[120px] text-base resize-none border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                  maxLength={500}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">{formData.bio.length}/500 characters</p>
              </div>

              {/* Sports Specialties */}
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-3 block">
                  Sports Specialties <span className="text-red-500">*</span>
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

          {/* Subscription Pricing Section */}
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-prologue-fire to-prologue-orange rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Subscription Pricing</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Set your custom pricing for all three subscription tiers. Consider your expertise, content quality, and market rates when setting your prices.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="basicTierPrice" className="text-base font-semibold text-gray-900 mb-3 block">
                  Basic Tier Price ($/month)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <Input
                    id="basicTierPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basicTierPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, basicTierPrice: e.target.value }))}
                    className="h-12 pl-8 text-base border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="proTierPrice" className="text-base font-semibold text-gray-900 mb-3 block">
                  Pro Tier Price ($/month)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <Input
                    id="proTierPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.proTierPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, proTierPrice: e.target.value }))}
                    className="h-12 pl-8 text-base border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="premiumTierPrice" className="text-base font-semibold text-gray-900 mb-3 block">
                  Premium Tier Price ($/month)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <Input
                    id="premiumTierPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.premiumTierPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, premiumTierPrice: e.target.value }))}
                    className="h-12 pl-8 text-base border-gray-300 focus:border-prologue-electric focus:ring-prologue-electric/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-8">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Your pricing will be visible to potential subscribers. Consider your expertise,
                content quality, and market rates when setting your prices.
              </p>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={!formData.firstName || !formData.lastName || !formData.bio || formData.selectedSports.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving Profile...
                  </>
                ) : (
                  "Save & Continue to Dashboard"
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
