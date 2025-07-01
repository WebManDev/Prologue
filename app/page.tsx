"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, Play, Users, Trophy, Target, ArrowLeft, User, Eye, EyeOff, Mail, Lock, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MemberDashboard } from "../components/member-dashboard"
import { CoachDashboard } from "../components/coach-dashboard"
import { AthleteOnboarding } from "../components/athlete-onboarding"
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, saveAthleteProfile, saveMemberProfile, getAthleteProfile, initializeFirebase, smartSignIn, handleRedirectResult, GoogleAuthProvider, getMemberProfile } from "@/lib/firebase"
import { Logo } from "@/components/logo"
import PrologueLanding from "./components/prologue-landing"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import MemberLoginPage from "./member/login/page"
import { signInWithPersistence } from "@/lib/auth-persistence"

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showDashboard, setShowDashboard] = useState<string | null>(null)
  const router = useRouter()

  // Check for reset parameter and reset state if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('reset') === 'true') {
        setShowLogin(true);
        setIsSignUp(false);
        setUserRole(null);
        setShowRoleSelection(true);
        setShowDashboard(null);
        // Clean up the URL
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  // Check authentication state on page load
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await initializeFirebase();
        
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          console.log("Auth state changed, user:", user?.uid)
          if (user) {
            // User is logged in, check their role and redirect accordingly
            try {
              // Check if user is an athlete
              const athleteProfile = await getAthleteProfile(user.uid);
              console.log("Athlete profile:", athleteProfile)
              if (athleteProfile) {
                if (athleteProfile.name && athleteProfile.bio && athleteProfile.specialties?.length > 0) {
                  setShowDashboard("athlete-dashboard");
                } else {
                  setShowDashboard("athlete");
                }
                return;
              }

              // Check if user is a member
              const memberProfile = await getMemberProfile(user.uid);
              console.log("Member profile:", memberProfile)
              if (memberProfile) {
                // Check if onboarding is completed
                console.log("Onboarding completed:", memberProfile.onboardingCompleted)
                if (memberProfile.onboardingCompleted) {
                  setShowDashboard("member");
                } else {
                  // Redirect to onboarding page
                  console.log("Redirecting to onboarding from auth check")
                  window.location.href = "/member/onboarding";
                }
                return;
              }

              // If no profile found, show role selection
              console.log("No profile found, showing role selection")
              setShowRoleSelection(true);
            } catch (error) {
              console.error("Error checking user profile:", error);
              setShowRoleSelection(true);
            }
          } else {
            // User is not logged in
            console.log("User not logged in")
            setShowDashboard(null);
            setShowRoleSelection(true);
          }
          setIsCheckingAuth(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing Firebase:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuthState();
  }, []);

  // Handle dashboard redirects
  useEffect(() => {
    if (showDashboard === "member") {
      router.replace("/member-dashboard");
    } else if (showDashboard === "athlete-dashboard") {
      router.replace("/athleteDashboard");
    }
  }, [showDashboard, router]);

  const handleBackToLanding = () => {
    setShowLogin(false);
    setIsSignUp(false);
    setUserRole(null);
    setShowRoleSelection(true);
    setShowDashboard(null);
  };

  const handleLoginClick = () => {
    setIsSignUp(false);
    setShowLogin(true);
  };

  const handleSignUpClick = () => {
    setIsSignUp(true);
    setShowLogin(true);
  };

  // Show loading state while checking authentication
  // if (isCheckingAuth) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Checking authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show appropriate dashboard if user is logged in
  if (showDashboard === "member") {
    return null;
  }

  if (showDashboard === "athlete") {
    return (
      <AthleteOnboarding
        onComplete={() => {
          setShowDashboard("athlete-dashboard")
        }}
        onLogout={() => {
          setShowDashboard(null)
          setShowRoleSelection(true)
        }}
      />
    )
  }

  if (showDashboard === "athlete-dashboard") {
    return null; // Will be redirected by useEffect
  }

  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} initialIsSignUp={isSignUp} onBackToLanding={handleBackToLanding} />
  }

   return <PrologueLanding onLoginClick={handleLoginClick} onSignUpClick={handleSignUpClick} />
}

function LoginPage({ onBack, initialIsSignUp, onBackToLanding }: { onBack: () => void; initialIsSignUp: boolean; onBackToLanding: () => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const router = useRouter()

  const sports = [
    "Basketball",
    "Football",
    "Soccer",
    "Tennis",
    "Swimming",
    "Volleyball",
    "Track & Field",
    "Golf",
    "Baseball",
    "Softball",
    "Wrestling",
    "Gymnastics",
    "Cross Country",
    "Hockey",
    "Lacrosse"
  ]

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
      // Use Firebase authentication instead of simulation
      const userCredential = await signInWithPersistence(auth, formData.email, formData.password, 'local')
      
      // After successful login, check role and route accordingly
      const athleteProfile = await getAthleteProfile(userCredential.user.uid)
      if (athleteProfile) {
        window.location.href = "/athleteDashboard"
        return
      }
      // Default: redirect to home page which will handle auth state
      window.location.href = "/"
    } catch (error: any) {
      console.error("Login error:", error)
      setErrorMessage(error.message || "Login failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all fields")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match")
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      
      // Save profile to Firestore based on role
      if (selectedRole === "athlete") {
        await saveAthleteProfile(userCredential.user.uid, {
          name: "", // Will be set during onboarding
          email: formData.email,
          sport: "", // Will be set during onboarding
          role: "athlete"
        });
      } else if (selectedRole === "member") {
        console.log("Saving member profile for user:", userCredential.user.uid)
        await saveMemberProfile(userCredential.user.uid, {
          name: "",
          email: formData.email,
          sport: "",
          role: "member",
          onboardingCompleted: false // Will be set to true after onboarding
        });
        console.log("Member profile saved successfully")
        
        // Add a small delay to ensure Firestore has time to save
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Verify the profile was saved
        const savedProfile = await getMemberProfile(userCredential.user.uid)
        console.log("Verified saved profile:", savedProfile)
        
        if (savedProfile && savedProfile.onboardingCompleted === false) {
          console.log("Redirecting to onboarding page")
          window.location.href = "/member/onboarding"
          return
        }
      }

      // After successful signup, redirect to home page which will handle auth state
      console.log("Redirecting to home page")
      window.location.href = "/"
    } catch (error: any) {
      console.error("Signup error:", error)
      setErrorMessage(error.message || "Signup failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Use Firebase Google authentication
      const provider = new GoogleAuthProvider();
      const result = await smartSignIn(provider);
      if (result) {
        // After successful Google sign-in, redirect to home page which will handle auth state
        window.location.href = "/"
      }
      // If result is null, it means we're using redirect and the page will reload
    } catch (error: any) {
      console.error("Google login error:", error)
      setErrorMessage(error.message || "Google login failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const dismissError = () => {
    setErrorMessage(null)
  }

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp)
    setCurrentStep(1)
    setSelectedRole(null)
    setErrorMessage(null)
    setFormData({
      email: "",
      password: "",
      confirmPassword: ""
    })
  }

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: "#0f172a" }}>
      {/* Fixed background layer */}
      <div className="fixed inset-0 bg-slate-900" style={{ backgroundColor: "#0f172a", zIndex: -2 }}></div>
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{ zIndex: -1 }}
      ></div>

      {/* Athletic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-red-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

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

        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group bg-transparent border-none outline-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">BACK TO HOME</span>
        </button>
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
                    <span className="text-xs text-gray-600">
                      {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    </span>
                    <button
                      onClick={toggleSignUpMode}
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors text-xs"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Login/Signup Form - Matching Reference Design */}
            {currentStep === 2 && (
              <div className="px-8 py-10">
                {/* Title Section - Exact match to reference */}
                <div className="text-center mb-8">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                    {isSignUp 
                      ? `Create your ${selectedRole === "member" ? "member" : "athlete"} account`
                      : `${selectedRole === "member" ? "Member" : "Athlete"} Login`
                    }
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                    {isSignUp 
                      ? "Start your journey to athletic excellence"
                      : selectedRole === "member" ? "Start your athletic journey" : "Share your expertise"
                    }
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

                {/* Login/Signup Form - Exact match to reference */}
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

                  {/* Confirm Password for signup members */}
                  {isSignUp && (selectedRole === "member" || selectedRole === "athlete") && (
                    <div>
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-900 mb-2 block leading-tight">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          onFocus={() => setErrorMessage(null)}
                          className="w-full h-12 px-4 pr-12 border-0 bg-white rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs shadow-sm"
                          placeholder="Confirm your password"
                          style={{ backgroundColor: "#ffffff" }}
                        />
                      </div>
                    </div>
                  )}

                  {!isSignUp && (
                    <div className="flex items-center justify-between pt-1">
                      <Link href="#" className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                        Forgot password?
                      </Link>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <p className="text-red-700 text-xs font-medium leading-tight">{errorMessage}</p>
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

                {/* Login/Signup Button - Exact match to reference */}
                <Button
                  onClick={isSignUp ? handleSignUp : handleLogin}
                  disabled={!formData.email || !formData.password || (isSignUp && selectedRole === "member" && !formData.confirmPassword) || isSubmitting}
                  className="w-full h-12 text-xs sm:text-sm font-bold rounded-3xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isSignUp ? "CREATING ACCOUNT..." : "SIGNING IN..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}</span>
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
