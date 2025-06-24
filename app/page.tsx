"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, Play, Users, Trophy, Target, ArrowLeft, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MemberDashboard } from "../components/member-dashboard"
import { CoachDashboard } from "../components/coach-dashboard"
import { AthleteOnboarding } from "../components/athlete-onboarding"
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, saveAthleteProfile, saveMemberProfile, getAthleteProfile, initializeFirebase, smartSignIn, handleRedirectResult, GoogleAuthProvider } from "@/lib/firebase"
import { Logo } from "@/components/logo"
import PrologueLanding from "./components/prologue-landing"
import AthleteLoginPage from "./athlete/login/page"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState(true)

  const handleBackToLanding = () => {
    setShowLogin(false);
    setIsSignUp(false);
    setUserRole(null);
    setShowRoleSelection(true);
  };

  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} initialIsSignUp={isSignUp} onBackToLanding={handleBackToLanding} />
  }

  return <PrologueLanding onLoginClick={() => setShowLogin(true)} onSignUpClick={() => { setShowLogin(true); setIsSignUp(true); }} />
}

function LoginPage({ onBack, initialIsSignUp, onBackToLanding }: { onBack: () => void; initialIsSignUp: boolean; onBackToLanding: () => void }) {
  const [showDashboard, setShowDashboard] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [selectedSport, setSelectedSport] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter();

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

  // Initialize Firebase when component mounts
  React.useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        setError('Failed to initialize the application. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleRoleSelect = (role: string) => {
    if (role === "member") {
      router.push("/member/login");
    } else {
      setUserRole(role);
      setShowRoleSelection(false);
    }
  }

  const handleBackToRoleSelection = () => {
    setShowRoleSelection(true)
    setUserRole(null)
    setIsSignUp(false)
    setError("")
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      if (userRole === "member") {
        setShowDashboard("member")
      } else if (userRole === "athlete") {
        // Check if athlete has completed their profile
        const profile = await getAthleteProfile(userCredential.user.uid)
        if (!profile) {
          // No profile exists, show onboarding
          setShowDashboard("athlete")
        } else if (profile.name && profile.bio && profile.specialties?.length > 0) {
          // Profile is complete, go straight to dashboard
          setShowDashboard("athlete-dashboard")
        } else {
          // Profile exists but is incomplete, show onboarding
          setShowDashboard("athlete")
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (userRole === "member" && !selectedSport) {
      setError("Please select a sport")
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Save profile to Firestore based on role
      if (userRole === "athlete") {
        await saveAthleteProfile(userCredential.user.uid, {
          name: "", // Will be set during onboarding
          email,
          sport: "", // Will be set during onboarding
          role: "athlete"
        });
      } else if (userRole === "member") {
        await saveMemberProfile(userCredential.user.uid, {
          name,
          email,
          sport: selectedSport,
          role: "member"
        });
      }

      if (userRole === "member") {
        setShowDashboard("member")
      } else if (userRole === "athlete") {
        setShowDashboard("athlete")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await smartSignIn(provider);
      if (result) {
        // Handle successful popup sign-in
        if (userRole === "member") {
          setShowDashboard("member");
        } else if (userRole === "athlete") {
          const profile = await getAthleteProfile(result.user.uid);
          if (!profile) {
            setShowDashboard("athlete");
          } else if (profile.name && profile.bio && profile.specialties?.length > 0) {
            setShowDashboard("athlete-dashboard");
          } else {
            setShowDashboard("athlete");
          }
        }
      }
      // If result is null, it means we're using redirect and the page will reload
    } catch (error: any) {
      setError(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle redirect result on component mount
  React.useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          // Handle successful redirect sign-in
          if (userRole === "member") {
            setShowDashboard("member");
          } else if (userRole === "athlete") {
            const profile = await getAthleteProfile(result.user.uid);
            if (!profile) {
              setShowDashboard("athlete");
            } else if (profile.name && profile.bio && profile.specialties?.length > 0) {
              setShowDashboard("athlete-dashboard");
            } else {
              setShowDashboard("athlete");
            }
          }
        }
      } catch (error: any) {
        setError(error.message);
      }
    };

    checkRedirectResult();
  }, [userRole]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show Dashboard after successful login
  if (showDashboard === "member") {
    return (
      <MemberDashboard
        onLogout={() => {
          setShowDashboard(null)
          onBack()
        }}
      />
    )
  }

  if (showDashboard === "athlete") {
    return (
      <AthleteOnboarding
        onComplete={() => {
          setShowDashboard("athlete-dashboard")
        }}
        onLogout={() => {
          setShowDashboard(null)
          onBack()
        }}
      />
    )
  }

  if (showDashboard === "athlete-dashboard") {
    return (
      <CoachDashboard
        onLogout={() => {
          setShowDashboard(null)
          onBack()
        }}
      />
    )
  }

  // Role Selection Screen (shown first for both login and signup) - NEW DESIGN
  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Athletic Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

          {/* Diagonal Energy Lines */}
          <div className="absolute top-32 -left-20 w-96 h-2 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent rotate-12 animate-pulse"></div>
          <div className="absolute bottom-40 -right-20 w-80 h-1 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent -rotate-12 animate-pulse animation-delay-500"></div>
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
            <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-wider">
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
        <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-12 relative z-10">
          <div className="max-w-2xl w-full">
            {/* Logo and Title Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-8">
                <div className="w-12 h-12 relative mr-4">
                  <Image
                    src="/Prologue LOGO-1.png"
                    alt="PROLOGUE"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-3xl font-black text-white tracking-wider">PROLOGUE</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                I AM A<span className="text-blue-400">...</span>
              </h1>

              <p className="text-lg text-gray-300 max-w-lg mx-auto leading-relaxed">
                Choose your role to access the right features and dashboard for your athletic journey.
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="space-y-6 mb-12">
              {/* Member Card */}
              <button
                onClick={() => router.push("/member/login")}
                className={`w-full p-8 rounded-none border-2 transition-all duration-300 group text-left ${
                  userRole === "member"
                    ? "border-blue-400 bg-white/10 backdrop-blur-sm shadow-2xl scale-105"
                    : "border-gray-600/50 bg-white/5 backdrop-blur-sm hover:border-blue-400/50 hover:bg-white/8 hover:scale-102"
                }`}
              >
                <div className="flex items-start space-x-6">
                  <div
                    className={`w-16 h-16 rounded-none flex items-center justify-center transition-all duration-300 ${
                      userRole === "member"
                        ? "bg-gradient-to-r from-blue-400 to-purple-600 shadow-xl"
                        : "bg-gradient-to-r from-gray-600 to-gray-500 group-hover:from-blue-400 group-hover:to-purple-600"
                    }`}
                  >
                    <User className="h-8 w-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">MEMBER</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      I want to learn from elite athletes and improve my skills through personalized coaching.
                    </p>
                  </div>

                  {userRole === "member" && (
                    <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Athlete Card */}
              <button
                onClick={() => setUserRole("athlete")}
                className={`w-full p-8 rounded-none border-2 transition-all duration-300 group text-left ${
                  userRole === "athlete"
                    ? "border-orange-400 bg-white/10 backdrop-blur-sm shadow-2xl scale-105"
                    : "border-gray-600/50 bg-white/5 backdrop-blur-sm hover:border-orange-400/50 hover:bg-white/8 hover:scale-102"
                }`}
              >
                <div className="flex items-start space-x-6">
                  <div
                    className={`w-16 h-16 rounded-none flex items-center justify-center transition-all duration-300 ${
                      userRole === "athlete"
                        ? "bg-gradient-to-r from-orange-400 to-red-500 shadow-xl"
                        : "bg-gradient-to-r from-gray-600 to-gray-500 group-hover:from-orange-400 group-hover:to-red-500"
                    }`}
                  >
                    <Trophy className="h-8 w-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">ATHLETE</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      I want to share my expertise and coach others to reach their athletic potential.
                    </p>
                  </div>

                  {userRole === "athlete" && (
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <Button
                size="lg"
                disabled={!userRole}
                onClick={() => {
                  if (userRole === "member") {
                    router.push("/member/login");
                  } else if (userRole === "athlete") {
                    setShowRoleSelection(false);
                  }
                }}
                className={`px-12 py-6 text-lg font-black tracking-wider rounded-none shadow-2xl transition-all duration-300 border-2 ${
                  userRole
                    ? userRole === "member"
                      ? "bg-gradient-to-r from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700 text-white border-transparent hover:border-white/30 hover:scale-110 hover:shadow-3xl"
                      : "bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-transparent hover:border-white/30 hover:scale-110 hover:shadow-3xl"
                    : "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed"
                }`}
              >
                {userRole ? (
                  <>
                    CONTINUE AS {userRole.toUpperCase()}
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </>
                ) : (
                  "SELECT YOUR ROLE"
                )}
              </Button>
            </div>

            {/* Back Link */}
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 group font-medium tracking-wide bg-transparent border-none outline-none cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>BACK TO HOMEPAGE</span>
              </button>
            </div>
          </div>
        </main>

        {/* Athletic Accent Elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-orange-400/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
      </div>
    )
  }

  // Restore the athlete/coach modal login flow as before
  if (userRole === "athlete" && !showRoleSelection) {
    return (
      <AthleteLoginPage
        isSignUp={isSignUp}
        loading={isLoading}
        error={error}
        formData={{ email, password }}
        setFormData={({ email, password }) => {
          setEmail(email);
          setPassword(password);
        }}
        onSubmit={isSignUp ? handleSignUp : handleLoginSubmit}
        onBack={handleBackToRoleSelection}
        onGoogleSignIn={handleGoogleSignIn}
        googleLoading={googleLoading}
        onToggleSignUp={() => setIsSignUp((prev) => !prev)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp
                ? `Create your ${userRole === "athlete" ? "coach" : "member"} account`
                : `Welcome back, ${userRole === "athlete" ? "Coach" : "Member"}!`}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? "Start your journey to athletic excellence" : "Sign in to continue your training"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={isSignUp ? handleSignUp : handleLoginSubmit}>
            {isSignUp && userRole === "member" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignUp && userRole === "member" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your primary sport</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
              disabled={isLoading || !userRole}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 hover:text-blue-700 font-medium">
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>

          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={handleBackToRoleSelection}
              className="w-full text-gray-600 hover:text-gray-700"
            >
              ← Change role
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Remove the existing MemberDashboard and CoachDashboard functions since we're importing them
