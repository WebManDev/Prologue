"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, User, DollarSign, CheckCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import { auth, saveAthleteProfile, uploadProfilePicture } from "@/lib/firebase"
import { Logo } from "@/components/logo"

interface AthleteOnboardingProps {
  onComplete: () => void
  onLogout: () => void
}

export function AthleteOnboarding({ onComplete, onLogout }: AthleteOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    specialties: [] as string[],
    profilePicture: null as File | null,
    pricing: {
      pro: 9.99,
      premium: 19.99
    }
  })

  const availableSports = [
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

  const handleSpecialtyToggle = (sport: string) => {
    setProfileData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(sport)
        ? prev.specialties.filter((s) => s !== sport)
        : [...prev.specialties, sport],
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileData((prev) => ({ ...prev, profilePicture: file }))
    }
  }

  const handleSaveAndContinue = async () => {
    if (!auth.currentUser) {
      console.error("No user logged in")
      return
    }

    try {
      let profilePictureUrl = ""
      
      // Upload profile picture if one was selected
      if (profileData.profilePicture) {
        profilePictureUrl = await uploadProfilePicture(auth.currentUser.uid, profileData.profilePicture)
      }

      // Save profile data to Firebase
      await saveAthleteProfile(auth.currentUser.uid, {
        name: profileData.name,
        email: auth.currentUser.email || "",
        sport: profileData.specialties[0] || "", // Using first specialty as primary sport
        role: "athlete",
        bio: profileData.bio,
        specialties: profileData.specialties,
        profilePicture: profilePictureUrl,
      })

      onComplete()
    } catch (error) {
      console.error("Error saving profile:", error)
      // You might want to show an error message to the user here
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-orange-600">Profile Setup</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-600">Dashboard</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Athlete Profile</h1>
              <p className="text-gray-600">
                Create your profile to start sharing your expertise and connecting with aspiring athletes
              </p>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-500" />
                <span>Athlete Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.profilePicture ? (
                      <Image
                        src={URL.createObjectURL(profileData.profilePicture) || "/placeholder.svg"}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-white" />
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2">Upload your profile picture</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="text-lg"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell potential students about your background, achievements, and coaching philosophy..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sports Specialties <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select the sports you specialize in (you can choose multiple)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSports.map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSpecialtyToggle(sport)}
                      className={`p-3 text-sm border rounded-lg transition-all ${
                        profileData.specialties.includes(sport)
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
                {profileData.specialties.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.specialties.map((sport) => (
                        <Badge key={sport} className="bg-orange-100 text-orange-800">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Pricing Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Subscription Pricing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set your custom pricing for Pro and Premium tiers. Basic tier remains at $4.99/month.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pro Tier Price ($/month)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        step="0.01"
                        value={profileData.pricing.pro}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            pro: e.target.value === "" ? 9.99 : parseFloat(e.target.value)
                          }
                        }))}
                        className="pl-7 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Premium Tier Price ($/month)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        step="0.01"
                        value={profileData.pricing.premium}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            premium: e.target.value === "" ? 19.99 : parseFloat(e.target.value)
                          }
                        }))}
                        className="pl-7 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Note:</strong> Your pricing will be visible to potential subscribers. Consider your expertise, 
                    content quality, and market rates when setting your prices.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveAndContinue}
                  disabled={!profileData.name || !profileData.bio || profileData.specialties.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Save & Continue to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  You can always update your profile information later from your dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
