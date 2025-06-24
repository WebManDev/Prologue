"use client"

import { useState, useEffect } from "react"
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, saveAthleteProfile, saveMemberProfile, getAthleteProfile, initializeFirebase, smartSignIn, handleRedirectResult, GoogleAuthProvider } from "@/lib/firebase"

interface LoginPageProps {
  onBack: () => void
  initialIsSignUp: boolean
}

export default function LoginPage({ onBack, initialIsSignUp }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState(true)
  const [name, setName] = useState("")
  const [selectedSport, setSelectedSport] = useState("")

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

  useEffect(() => {
    const init = async () => {
      await initializeFirebase()
      await handleRedirectResult()
    }
    init()
  }, [])

  const handleRoleSelect = (role: string) => {
    setUserRole(role)
    setShowRoleSelection(false)
  }

  const handleBackToRoleSelection = () => {
    setShowRoleSelection(true)
    setUserRole(null)
    setIsSignUp(false)
    setError("")
    setEmail("")
    setPassword("")
    setName("")
    setSelectedSport("")
    setLoading(false)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      if (userRole === "member") {
        // Redirect to member dashboard
        window.location.href = "/member/dashboard"
      } else if (userRole === "athlete") {
        // Check if athlete has completed their profile
        const profile = await getAthleteProfile(userCredential.user.uid)
        if (!profile) {
          // No profile exists, show onboarding
          window.location.href = "/coach/onboarding"
        } else if (profile.name && profile.bio && profile.specialties?.length > 0) {
          // Profile is complete, go straight to dashboard
          window.location.href = "/coach/dashboard"
        } else {
          // Profile exists but is incomplete, show onboarding
          window.location.href = "/coach/onboarding"
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (userRole === "member" && !selectedSport) {
      setError("Please select a sport")
      setLoading(false)
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
        window.location.href = "/coach/onboarding"
      } else if (userRole === "member") {
        await saveMemberProfile(userCredential.user.uid, {
          name,
          email,
          sport: selectedSport,
          role: "member"
        });
        window.location.href = "/member/dashboard"
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!userRole) {
      setError("Please select a role first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await smartSignIn(provider);
      
      if (result) {
        // Handle successful popup sign-in
        if (userRole === "member") {
          window.location.href = "/member/dashboard";
        } else if (userRole === "athlete") {
          const profile = await getAthleteProfile(result.user.uid);
          if (!profile) {
            window.location.href = "/coach/onboarding";
          } else if (profile.name && profile.bio && profile.specialties?.length > 0) {
            window.location.href = "/coach/dashboard";
          } else {
            window.location.href = "/coach/onboarding";
          }
        }
      }
      // If result is null, it means we're using redirect and the page will reload
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Screen (shown first for both login and signup)
  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">I am a...</h1>
              <p className="text-gray-600">
                Choose your role to access the right features and dashboard for your needs.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("member")}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">🏀</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Member</h3>
                    <p className="text-sm text-gray-600">I want to learn from athletes and improve my skills</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("athlete")}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Athlete/Coach</h3>
                    <p className="text-sm text-gray-600">I want to share my expertise and earn income</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Login/Signup Form (shown after role selection)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
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

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 py-3 rounded-lg"
              disabled={loading || !userRole}
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
            </button>

            <button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
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
            <button
              onClick={handleBackToRoleSelection}
              className="w-full text-gray-600 hover:text-gray-700 py-2"
            >
              ← Change role
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 