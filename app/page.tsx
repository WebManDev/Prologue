"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, Play, Users, Trophy, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MemberDashboard } from "../components/member-dashboard"
import { CoachDashboard } from "../components/coach-dashboard"
import { AthleteOnboarding } from "../components/athlete-onboarding"
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, saveAthleteProfile, saveMemberProfile, getAthleteProfile, initializeFirebase, smartSignIn, handleRedirectResult, GoogleAuthProvider } from "@/lib/firebase"

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleLoginClick = () => {
    setShowLogin(true)
    setIsSignUp(false)
  }

  const handleSignUpClick = () => {
    setShowLogin(true)
    setIsSignUp(true)
  }

  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} initialIsSignUp={isSignUp} />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#courses" className="text-gray-600 hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <Link href="#coaches" className="text-gray-600 hover:text-blue-600 transition-colors">
              Coaches
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleLoginClick} className="text-blue-600 hover:text-blue-700">
              Log in
            </Button>
            <Button onClick={handleSignUpClick} className="bg-orange-500 hover:bg-orange-600 text-white">
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Every star athlete has a story — this is where yours begins
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Join millions of others who are learning directly from elite coaches and athletes across all sports.
            </p>
            <Button
              size="lg"
              onClick={handleSignUpClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Athletes Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Learn From Elite Athletes</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Train with world-class athletes and coaches from various sports disciplines.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                sport: "Tennis",
                expertise: "Serve & Volley Technique",
                image: "/placeholder.svg?height=400&width=300",
              },
              {
                name: "Marcus Rodriguez",
                sport: "Soccer",
                expertise: "Ball Control & Passing",
                image: "/placeholder.svg?height=400&width=300",
              },
              {
                name: "Emma Chen",
                sport: "Swimming",
                expertise: "Stroke Technique & Endurance",
                image: "/placeholder.svg?height=400&width=300",
              },
            ].map((athlete, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <Image src={athlete.image || "/placeholder.svg"} alt={athlete.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{athlete.name}</h3>
                    <p className="text-sm opacity-90">{athlete.sport}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Expertise: {athlete.expertise}</p>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    View Training Programs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Get Expert Feedback on Your Performance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Submit your training clips and receive personalized feedback from professional coaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Detailed breakdown of your technique and form
                  </h3>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Sport-specific advice from coaches who specialize in your discipline
                  </h3>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Suggested drills and exercises to address specific weaknesses
                  </h3>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleSignUpClick}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Submit Your Clip Now
              </Button>
            </div>

            <div className="relative">
              <Card className="bg-orange-500 text-white p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm mb-2">
                      "Great improvement on your technique! Focus on maintaining consistent form throughout the movement
                      for better performance."
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div>
                        <p className="text-sm font-semibold">Coach Williams</p>
                        <p className="text-xs opacity-90">Former Olympic Coach</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Featured Courses</h2>
              <p className="text-lg text-gray-600">
                High-quality courses designed by professional coaches for various sports and skill levels.
              </p>
            </div>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View all courses →
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Tennis Fundamentals Masterclass",
                instructor: "Sarah Johnson",
                rating: 4.9,
                reviews: 128,
                modules: 12,
                level: "Intermediate",
                category: "Tennis",
              },
              {
                title: "Soccer Skills & Tactics",
                instructor: "Marcus Rodriguez",
                rating: 4.7,
                reviews: 96,
                modules: 8,
                level: "All Levels",
                category: "Soccer",
              },
              {
                title: "Swimming Technique Mastery",
                instructor: "Emma Chen",
                rating: 4.8,
                reviews: 84,
                modules: 10,
                level: "Advanced",
                category: "Swimming",
              },
              {
                title: "Athletic Performance & Conditioning",
                instructor: "Coach Thompson",
                rating: 4.6,
                reviews: 72,
                modules: 7,
                level: "Intermediate",
                category: "Fitness",
              },
            ].map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-600">
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/20 text-white border-0">{course.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-blue-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">By {course.instructor}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                    <span>{course.reviews} reviews</span>
                    <span>{course.modules} modules</span>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start Course</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">What Our Athletes Say</h2>
            <p className="text-lg text-gray-600">
              Hear from players who have transformed their game with our position-specific training programs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Since using PROLOGUE, my tennis serve and overall game have improved dramatically. The sport-specific drills are exactly what I needed!",
                name: "Marcus Hill",
                role: "College Tennis Player",
                avatar: "/placeholder.svg?height=60&width=60",
              },
              {
                quote:
                  "The video feedback was a game-changer for my swimming technique. I implemented the coach's suggestions and saw results within weeks.",
                name: "Jasmine Torres",
                role: "High School Swimmer",
                avatar: "/placeholder.svg?height=60&width=60",
              },
              {
                quote:
                  "As a soccer player, I've always struggled with certain skills. PROLOGUE's specialized training has helped me excel on the field!",
                name: "Tyler Bennett",
                role: "Amateur League Player",
                avatar: "/placeholder.svg?height=60&width=60",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 border-l-4 border-orange-500">
                <div className="mb-4">
                  <div className="text-orange-500 text-4xl mb-2">"</div>
                  <p className="text-gray-700 italic">{testimonial.quote}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-blue-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Elevate Your Game?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of athletes who are taking their skills to the next level with sport-specific training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleSignUpClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4"
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4"
            >
              View Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="text-xl font-bold">PROLOGUE</span>
              </div>
              <p className="text-gray-400">
                Elevating athletes through expert coaching and personalized training programs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Coaches
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Athletes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PROLOGUE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LoginPage({ onBack, initialIsSignUp }: { onBack: () => void; initialIsSignUp: boolean }) {
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
  useEffect(() => {
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
    setUserRole(role)
    setShowRoleSelection(false)
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
    if (!userRole) {
      setError("Please select a role first");
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Handle redirect result on component mount
  useEffect(() => {
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

  // Role Selection Screen (shown first for both login and signup)
  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
              </div>
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
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Athlete</h3>
                    <p className="text-sm text-gray-600">I want to share my expertise and coach others</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8">
              <Button variant="ghost" onClick={onBack} className="w-full text-gray-600 hover:text-gray-700">
                ← Back to homepage
              </Button>
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
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
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
