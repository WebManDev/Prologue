"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Trophy, Eye, EyeOff, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { resetPassword } from "@/lib/firebase"

export default function RoleSelectionLogin() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

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

  const smoothScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all fields")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate login validation - for demo purposes, reject certain credentials
      if (formData.email === "test@example.com" && formData.password === "wrongpassword") {
        throw new Error("Invalid email or password")
      }
      if (formData.email === "invalid@test.com") {
        throw new Error("Invalid email or password")
      }

      // Handle login logic here
      console.log("Login with:", formData, "Role:", selectedRole)

      // Redirect to appropriate dashboard based on role with smooth scroll
      if (selectedRole === "member") {
        router.push("/member-dashboard")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      } else if (selectedRole === "athlete") {
        router.push("/dashboard")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Login failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordMessage("Please enter a valid email address")
      return
    }

    try {
      await resetPassword(forgotPasswordEmail)
      setForgotPasswordSuccess(true)
      setForgotPasswordMessage("Password reset email sent! Check your inbox.")
    } catch (error) {
      console.error("Password reset error:", error)
      setForgotPasswordMessage("Failed to send reset email. Please try again.")
    }
  }

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotPasswordEmail("")
    setForgotPasswordMessage(null)
    setForgotPasswordSuccess(false)
  }

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Simulate Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Handle Google login logic here
      console.log("Google login for:", selectedRole)

      // Redirect to appropriate dashboard based on role with smooth scroll
      if (selectedRole === "member") {
        router.push("/member-dashboard")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      } else if (selectedRole === "athlete") {
        router.push("/dashboard")
        // Smooth scroll after navigation
        setTimeout(smoothScrollToTop, 100)
      }
    } catch (error) {
      console.error("Google login error:", error)
      setErrorMessage("Google login failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const dismissError = () => {
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between backdrop-blur-md border-b border-gray-700/50">
        <div className="flex items-center">
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
        </div>

        <Link
          href="/"
          className="text-sm font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 hover:scale-105 tracking-wide"
        >
          ← BACK TO HOME
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-md w-full relative">
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
                  <div>
                    <span className="text-xs text-gray-600">Don't have an account? </span>
                    <Link
                      href="/signup"
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors text-xs"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNext}
                  disabled={!selectedRole}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Step 2: Login Form - Matching Reference Design */}
            {currentStep === 2 && (
              <div className="px-8 py-10">
                {/* Title Section - Exact match to reference */}
                <div className="text-center mb-8">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                    {selectedRole === "member" ? "Member Login" : "Athlete Login"}
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                    {selectedRole === "member" ? "Start your athletic journey" : "Share your expertise"}
                  </p>
                </div>

                {/* Google Login Button - Exact match to reference */}
                <div className="mb-6">
                  <Button
                    onClick={handleGoogleLogin}
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

                {/* Login Form - Exact match to reference */}
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
                        placeholder="Enter your password"
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

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-700 font-medium">{errorMessage}</span>
                    </div>
                    <button
                      onClick={dismissError}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                {/* Back Button */}
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-2xl transition-all duration-300"
                >
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-600">Enter your email to receive a reset link</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="forgot-email" className="text-sm font-semibold text-gray-900 mb-2 block">
                  Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {forgotPasswordMessage && (
                <div className={`p-3 rounded-2xl text-sm ${
                  forgotPasswordSuccess 
                    ? "bg-green-50 border border-green-200 text-green-700" 
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  {forgotPasswordMessage}
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={handleBackFromForgotPassword}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-2xl transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-300"
                >
                  Send Reset Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 