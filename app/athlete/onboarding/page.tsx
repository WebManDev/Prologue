"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { auth, saveAthleteProfile } from "@/lib/firebase"

export default function AthleteOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    experience: "",
    bio: "",
    achievements: "",
    specialties: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No user found")
      }

      await saveAthleteProfile(user.uid, {
        ...formData,
        email: user.email,
        role: "athlete",
        createdAt: new Date().toISOString(),
        isOnboarded: true,
      })

      // Redirect to athlete dashboard
      router.push("/athlete/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.sport
      case 2:
        return formData.experience && formData.bio
      case 3:
        return true // Optional fields
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col" style={{ backgroundColor: '#0f172a' }}>
      {/* Fixed background layers */}
      <div className="fixed inset-0 bg-slate-900" style={{ backgroundColor: "#0f172a", zIndex: -2 }}></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ zIndex: -1 }}></div>
      {/* Radial Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-red-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-red-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      {/* Header */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-gray-700/50 relative z-10 bg-transparent">
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
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
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-300 hover:text-white group bg-transparent border-none outline-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">BACK</span>
        </button>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Complete Your Profile</h1>
              <p className="text-base text-gray-600 leading-relaxed">Step {currentStep} of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-center items-center space-x-2">
                <div className={`w-8 h-2 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <div className={`w-8 h-2 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <div className={`w-8 h-2 rounded-full transition-all duration-300 ${currentStep >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sport" className="text-sm font-medium text-gray-700">
                    Primary Sport
                  </Label>
                  <Input
                    id="sport"
                    type="text"
                    placeholder="e.g., Basketball, Soccer, Tennis"
                    value={formData.sport}
                    onChange={(e) => handleInputChange("sport", e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="text"
                    placeholder="e.g., 5+ years playing professionally"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your athletic background and coaching philosophy..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="achievements" className="text-sm font-medium text-gray-700">
                    Key Achievements
                  </Label>
                  <Textarea
                    id="achievements"
                    placeholder="List your major accomplishments, awards, or certifications..."
                    value={formData.achievements}
                    onChange={(e) => handleInputChange("achievements", e.target.value)}
                    className="min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialties" className="text-sm font-medium text-gray-700">
                    Coaching Specialties
                  </Label>
                  <Input
                    id="specialties"
                    type="text"
                    placeholder="e.g., Shooting, Defense, Mental Game"
                    value={formData.specialties}
                    onChange={(e) => handleInputChange("specialties", e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-4 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={`flex-1 h-12 rounded-xl font-semibold tracking-wide transition-all duration-200 ${
                    isStepValid()
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      : 'bg-orange-100 text-orange-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold tracking-wide transition-all duration-200"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></span>
                  ) : null}
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 