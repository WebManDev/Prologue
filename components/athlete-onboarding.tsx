"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, User, Trophy, Target, ArrowLeft, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth, saveAthleteProfile, uploadProfilePicture } from "@/lib/firebase"

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
    referralCode: "", // Add referral code field
  })
  const [showStripeChoice, setShowStripeChoice] = useState(false)

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

  const handleSetupStripeNow = () => {
    router.push("/athlete/onboarding/stripe")
  }

  const handleGoToDashboard = () => {
    router.push("/athleteDashboard")
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

      // Save profile data to Firestore under 'athletes' collection
      await saveAthleteProfile(auth.currentUser.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
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

      // Show choice between setting up Stripe now or going to dashboard
      setShowStripeChoice(true)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: "#0f172a" }}>
      {/* Fixed background layer */}
      <div className="fixed inset-0 bg-slate-900" style={{ backgroundColor: "#0f172a", zIndex: -2 }}></div>
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{ zIndex: -1 }}
      ></div>

      {/* Header */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between backdrop-blur-md border-b border-gray-700/50 relative z-10">
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
          <span className="text-xl font-athletic font-bold text-white group-hover:text-prologue-electric transition-colors tracking-wider">
            PROLOGUE
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            href="/home"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">BACK TO HOME</span>
          </Link>
          <Button onClick={onLogout} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-2xl w-full relative">
          <div className="bg-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
              <div className="flex items-center space-x-8 justify-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-prologue-electric text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    1
                  </div>
                  <span className="text-prologue-electric font-semibold text-sm">Profile Setup</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 max-w-16"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-gray-500 font-semibold text-sm">Dashboard</span>
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center px-8 py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Build Your Champion Profile</h1>
              <p className="text-sm lg:text-base text-gray-600 max-w-xl mx-auto">
                Create your professional profile to start sharing your expertise and connecting with aspiring athletes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8">
              {/* Athlete Profile Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Athlete Profile</h2>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                      {formData.profileImage ? (
                        <Image
                          src={URL.createObjectURL(formData.profileImage) || "/placeholder.svg"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-prologue-electric hover:bg-prologue-blue rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg border-4 border-white">
                      <Upload className="h-4 w-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">Upload Your Profile Picture</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName" className="text-xs font-semibold text-gray-900 mb-2 block">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="w-full h-12 px-4 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-prologue-electric focus:border-transparent text-xs shadow-sm"
                      style={{ backgroundColor: "#ffffff" }}
                      required
                    />
                  </div>
                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName" className="text-xs font-semibold text-gray-900 mb-2 block">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="w-full h-12 px-4 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-prologue-electric focus:border-transparent text-xs shadow-sm"
                      style={{ backgroundColor: "#ffffff" }}
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio" className="text-xs font-semibold text-gray-900 mb-2 block">
                      Bio <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell potential students about your background, achievements, and coaching philosophy..."
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      className="min-h-[100px] text-xs resize-none border-0 bg-white rounded-3xl focus:ring-2 focus:ring-prologue-electric focus:border-transparent px-4 py-3 shadow-sm"
                      style={{ backgroundColor: "#ffffff" }}
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                  </div>

                  {/* Sports Specialties */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-900 mb-2 block">
                      Sports Specialties <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-2xl p-3 bg-white">
                      {sports.map((sport) => (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => handleSportToggle(sport)}
                          className={`p-2 text-xs border rounded-xl text-center font-medium transition-all duration-200 ${
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
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-prologue-fire to-prologue-orange rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Subscription Pricing</h2>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Set your custom pricing for all tiers. <b>Basic tier must be at least $4.99/month.</b>
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="basicTierPrice" className="text-xs font-semibold text-gray-900 mb-2 block">
                      Basic Tier Price ($/month)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-xs">
                        $
                      </span>
                      <Input
                        id="basicTierPrice"
                        type="number"
                        step="0.01"
                        min="4.99"
                        value={formData.basicTierPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, basicTierPrice: e.target.value }))}
                        className="w-full h-12 pl-8 pr-4 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-prologue-electric focus:border-transparent text-xs shadow-sm"
                        style={{ backgroundColor: "#ffffff" }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="proTierPrice" className="text-xs font-semibold text-gray-900 mb-2 block">
                      Pro Tier Price ($/month)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-xs">
                        $
                      </span>
                      <Input
                        id="proTierPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.proTierPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, proTierPrice: e.target.value }))}
                        className="w-full h-12 pl-8 pr-4 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-prologue-electric focus:border-transparent text-xs shadow-sm"
                        style={{ backgroundColor: "#ffffff" }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="premiumTierPrice" className="text-xs font-semibold text-gray-900 mb-2 block">
                      Premium Tier Price ($/month)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-xs">
                        $
                      </span>
                      <Input
                        id="premiumTierPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.premiumTierPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, premiumTierPrice: e.target.value }))}
                        className="w-full h-12 pl-8 pr-4 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-prologue-electric focus:border-transparent text-xs shadow-sm"
                        style={{ backgroundColor: "#ffffff" }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-3 mb-6">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> Your pricing will be visible to potential subscribers. Consider your
                    expertise, content quality, and market rates when setting your prices.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="submit"
                  className="w-full h-12 text-xs font-bold rounded-3xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white shadow-lg hover:shadow-xl mb-4"
                  disabled={!formData.firstName || !formData.lastName || !formData.bio || formData.selectedSports.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving Profile...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>

                <p className="text-xs text-gray-500">
                  You can always update your profile information later from your dashboard
                </p>
              </div>
            </form>

            {/* Stripe Choice Modal */}
            {showStripeChoice && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-prologue-electric to-prologue-fire rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Payment Processing</h2>
                    <p className="text-sm text-gray-600">
                      Would you like to set up Stripe Connect now to receive payments, or skip this step and set it up later?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleSetupStripeNow}
                      className="w-full h-12 bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white font-semibold rounded-2xl"
                    >
                      Set Up Stripe Now
                    </Button>
                    <Button
                      onClick={handleGoToDashboard}
                      variant="outline"
                      className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-2xl"
                    >
                      Skip for Now
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    You can always set up payment processing later in your settings
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
