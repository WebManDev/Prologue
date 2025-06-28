"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Trophy, Eye, EyeOff, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordMatchTimeout, setPasswordMatchTimeout] = useState<NodeJS.Timeout | null>(null)

  const router = useRouter()

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (passwordMatchTimeout) {
        clearTimeout(passwordMatchTimeout)
      }
    }
  }, [passwordMatchTimeout])

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role)
    setErrorMessage(null) // Clear any existing errors
  }

  const handleNext = () => {
    if (currentStep === 1 && selectedRole) {
      setCurrentStep(2)
      setErrorMessage(null) // Clear any existing errors
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setErrorMessage(null) // Clear any existing errors
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrorMessage(null) // Clear error when user starts typing
  }

  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }))

    // Clear any existing error when user starts typing
    setErrorMessage(null)

    // Clear existing timeout if user is still typing
    if (passwordMatchTimeout) {
      clearTimeout(passwordMatchTimeout)
    }

    // Only validate if both fields have content
    if (value && formData.password) {
      // Set a new timeout to validate after user stops typing
      const timeoutId = setTimeout(() => {
        if (value !== formData.password) {
          setErrorMessage("Passwords do not match")
        }
        setPasswordMatchTimeout(null)
      }, 800) // Wait 800ms after user stops typing

      setPasswordMatchTimeout(timeoutId)
    }
  }

  const smoothScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all fields")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address")
      return false
    }

    // Password length validation
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long")
      return false
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match")
      return false
    }

    return true
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate email already exists error for demo purposes
      if (formData.email === "existing@example.com") {
        throw new Error("An account with this email already exists")
      }

      // Handle signup logic here
      console.log("Signup with:", formData, "Role:", selectedRole)

      // Redirect to profile setup based on role with smooth scroll
      if (selectedRole === "member") {
        router.push("/member-profile-setup")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      } else if (selectedRole === "athlete") {
        router.push("/profile-setup")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      }
    } catch (error) {
      console.error("Signup error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Account creation failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Simulate Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Handle Google signup logic here
      console.log("Google signup for:", selectedRole)

      // Redirect to profile setup based on role with smooth scroll
      if (selectedRole === "member") {
        router.push("/member-profile-setup")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      } else if (selectedRole === "athlete") {
        router.push("/profile-setup")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      }
    } catch (error) {
      console.error("Google signup error:", error)
      setErrorMessage("Google signup failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const dismissError = () => {
    setErrorMessage(null)
  }

  const isFormValid =
    formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

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

        <Link
          href="/"
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">BACK TO HOME</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-lg w-full relative">
          <div className="bg-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="px-8 py-10">
                {/* Title Section */}
                <div className="text-center mb-8">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                    I AM A...
                  </h1>
                  <p className="text-xs sm:text-xs lg:text-sm text-gray-600 leading-relaxed px-2">
                    Choose your role to get started with PROLOGUE
                  </p>
                </div>

                {/* Role Selection Cards */}
                <div className="space-y-4 mb-8">
                  {/* Member Card */}
                  <button
                    onClick={() => handleRoleSelection("member")}
                    className={`w-full p-6 border rounded-2xl transition-all duration-300 text-left transform hover:scale-[1.02] ${
                      selectedRole === "member"
                        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedRole === "member"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <User className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 mb-1 leading-tight">
                          MEMBER
                        </h3>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          I want to learn from elite athletes and improve my skills.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Athlete Card */}
                  <button
                    onClick={() => handleRoleSelection("athlete")}
                    className={`w-full p-6 border rounded-2xl transition-all duration-300 text-left transform hover:scale-[1.02] ${
                      selectedRole === "athlete"
                        ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20"
                        : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedRole === "athlete"
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <Trophy className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 mb-1 leading-tight">
                          ATHLETE
                        </h3>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          I want to share my expertise and coach others.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Links */}
                <div className="text-center mb-6">
                  <p className="text-xs text-gray-600 font-medium">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-300 hover:underline text-xs"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Account Creation Form - Matching Reference Design */}
            {currentStep === 2 && (
              <div className="px-8 py-10">
                {/* Title Section - Exact match to reference */}
                <div className="text-center mb-8">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                    Create {selectedRole === "member" ? "Member" : "Athlete"} Account
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                    {selectedRole === "member"
                      ? "Start your athletic journey"
                      : "Share your expertise and coach others"}
                  </p>
                </div>

                {/* Google Signup Button - Exact match to reference */}
                <div className="mb-6">
                  <Button
                    onClick={handleGoogleSignup}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-12 text-xs sm:text-sm font-medium rounded-3xl border-2 border-gray-900 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </div>

                {/* Divider - Exact match to reference */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-400"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-gray-50 text-gray-500 font-medium">Or continue with email</span>
                  </div>
                </div>

                {/* Signup Form - Exact match to reference */}
                <div className="space-y-5 mb-6">
                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-900 mb-2 block leading-tight">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onFocus={() => setErrorMessage(null)}
                      className="w-full h-12 px-4 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs shadow-sm"
                      placeholder="Enter your email"
                      style={{ backgroundColor: "#ffffff" }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-xs font-semibold text-gray-900 mb-2 block leading-tight">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onFocus={() => setErrorMessage(null)}
                        className="w-full h-12 px-4 pr-12 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs shadow-sm"
                        placeholder="Create a password"
                        style={{ backgroundColor: "#ffffff" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold text-gray-900 mb-2 block leading-tight"
                    >
                      Confirm Password
                    </Label>
                    <div
                      className={`relative ${
                        errorMessage === "Passwords do not match" ? "ring-1 ring-red-300 rounded-3xl" : ""
                      }`}
                    >
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        onFocus={() => setErrorMessage(null)}
                        onBlur={() => {
                          // Validate immediately when user leaves the field
                          if (
                            formData.confirmPassword &&
                            formData.password &&
                            formData.confirmPassword !== formData.password
                          ) {
                            setErrorMessage("Passwords do not match")
                          }
                        }}
                        className={`w-full h-12 px-4 pr-12 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs shadow-sm ${
                          errorMessage === "Passwords do not match" ? "ring-red-300" : ""
                        }`}
                        placeholder="Confirm your password"
                        style={{ backgroundColor: "#ffffff" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div
                      className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${
                        errorMessage === "Passwords do not match"
                          ? "bg-red-50 border-red-300"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            errorMessage === "Passwords do not match" ? "bg-red-600" : "bg-red-500"
                          }`}
                        >
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <p
                          className={`text-xs font-medium leading-tight ${
                            errorMessage === "Passwords do not match" ? "text-red-800" : "text-red-700"
                          }`}
                        >
                          {errorMessage}
                        </p>
                      </div>
                      <button
                        onClick={dismissError}
                        className="text-red-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Create Account Button - Exact match to reference */}
                <Button
                  onClick={handleSignup}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full h-12 text-xs sm:text-sm font-bold rounded-3xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="px-8 pb-8">
              {currentStep === 2 && !isSubmitting && (
                <div className="mb-6">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="w-full h-11 text-xs font-semibold rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    Back
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div className="mb-6">
                  <Button
                    onClick={handleNext}
                    disabled={!selectedRole}
                    className={`w-full h-11 text-xs font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                      selectedRole
                        ? selectedRole === "member"
                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="flex justify-center items-center space-x-2">
                <div
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    currentStep >= 1
                      ? selectedRole === "member"
                        ? "bg-blue-500"
                        : selectedRole === "athlete"
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      : "bg-gray-300"
                  }`}
                />
                <div
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    currentStep >= 2 ? (selectedRole === "member" ? "bg-blue-500" : "bg-orange-500") : "bg-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 