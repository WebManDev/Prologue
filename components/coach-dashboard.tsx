"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Video,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
  Lock,
  Shield,
  CheckCircle,
  Upload,
  User,
  Target,
  CreditCard,
} from "lucide-react"
import { CoachStripeOnboarding } from "./coach-stripe-onboarding"
import { signOut, auth } from "@/lib/firebase"

interface AthleteDashboardProps {
  onLogout: () => void
}

export function CoachDashboard({ onLogout }: AthleteDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [creatingPost, setCreatingPost] = useState(false)
  const [postType, setPostType] = useState<"workout" | "blog">("workout")
  const [stripeAccountId, setStripeAccountId] = useState<string | null>("acct_athlete_example")
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false)
  const [earnings, setEarnings] = useState<any>(null)
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    videoLink: "",
    type: "workout" as "workout" | "blog",
  })

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    bio: "Former college tennis player with 8 years of coaching experience. Specializing in serve technique and mental game strategies for players of all levels.",
    specialties: ["Tennis", "Serve Technique", "Mental Game"],
    profilePicture: "/placeholder.svg?height=120&width=120",
    email: "sarah.johnson@example.com",
    location: "Los Angeles, CA",
    experience: "8 years",
    certifications: ["USPTA Certified", "Mental Performance Coach"],
  })

  // Sample data - in real app this would come from database
  const athleteStats = {
    subscribers: 47,
    totalPosts: 23,
    totalViews: 1240,
    monthlyEarnings: 470, // 47 subscribers * $10
    totalEarnings: 2350,
    activeSubscriptions: 47,
  }

  const posts = [
    {
      id: 1,
      title: "Perfect Your Tennis Serve",
      description:
        "Learn the key mechanics for a powerful and accurate serve. Focus on ball toss consistency and follow-through.",
      content: "In this comprehensive workout, we'll break down the tennis serve into its fundamental components...",
      videoLink: "https://youtube.com/watch?v=example1",
      type: "workout" as const,
      views: 156,
      likes: 23,
      comments: 8,
      createdAt: "2 days ago",
      subscribersOnly: true,
    },
    {
      id: 2,
      title: "Mental Game: Staying Focused Under Pressure",
      description: "Develop mental toughness and focus techniques used by professional athletes.",
      content:
        "Mental preparation is just as important as physical training. Here are my top strategies for maintaining focus during high-pressure situations...",
      videoLink: "",
      type: "blog" as const,
      views: 203,
      likes: 31,
      comments: 12,
      createdAt: "5 days ago",
      subscribersOnly: true,
    },
    {
      id: 3,
      title: "Footwork Fundamentals",
      description: "Master the basic footwork patterns that will improve your court positioning and shot preparation.",
      content: "Good footwork is the foundation of every great tennis player...",
      videoLink: "https://youtube.com/watch?v=example2",
      type: "workout" as const,
      views: 89,
      likes: 15,
      comments: 4,
      createdAt: "1 week ago",
      subscribersOnly: true,
    },
  ]

  // Fetch earnings data
  useEffect(() => {
    if (stripeAccountId) {
      fetchEarnings()
    }
  }, [stripeAccountId])

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`/api/stripe/athlete-earnings?accountId=${stripeAccountId}`)
      const data = await response.json()
      setEarnings(data)
    } catch (error) {
      console.error("Failed to fetch earnings:", error)
    }
  }

  const handleCreatePost = () => {
    // Here you would save the post to your database
    console.log("Creating post:", newPost)
    setNewPost({ title: "", description: "", content: "", videoLink: "", type: "workout" })
    setCreatingPost(false)
  }

  const requestPayout = async () => {
    if (!stripeAccountId) {
      setShowStripeOnboarding(true)
      return
    }

    try {
      const response = await fetch("/api/stripe/create-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: stripeAccountId,
          amount: athleteStats.monthlyEarnings * 0.85, // After platform fee
        }),
      })

      const result = await response.json()
      if (result.error) {
        alert(result.error)
      } else {
        alert("Payout requested successfully!")
      }
    } catch (error) {
      alert("Failed to request payout")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`transition-colors ${activeTab === "dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`transition-colors ${activeTab === "content" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              My Content
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`transition-colors ${activeTab === "subscribers" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`transition-colors ${activeTab === "earnings" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`transition-colors ${activeTab === "profile" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Profile
            </button>
          </nav>

          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Sarah!</h1>
              <p className="text-gray-600">Share exclusive content with your subscribers and grow your community.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5 text-orange-500" />
                      <span>Create Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          setPostType("workout")
                          setCreatingPost(true)
                        }}
                        className="h-20 bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center space-y-2"
                      >
                        <Video className="h-6 w-6" />
                        <span>Post Workout</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setPostType("blog")
                          setCreatingPost(true)
                        }}
                        className="h-20 bg-blue-500 hover:bg-blue-600 text-white flex flex-col items-center justify-center space-y-2"
                      >
                        <FileText className="h-6 w-6" />
                        <span>Write Blog Post</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Revenue */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Subscription Revenue</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">${athleteStats.monthlyEarnings}</div>
                        <div className="text-sm text-gray-600">Gross Monthly</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${Math.round(athleteStats.monthlyEarnings * 0.85)}
                        </div>
                        <div className="text-sm text-gray-600">Net Monthly</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{athleteStats.activeSubscriptions}</div>
                        <div className="text-sm text-gray-600">Active Subs</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">${athleteStats.totalEarnings}</div>
                        <div className="text-sm text-gray-600">Total Earned</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Platform Fee:</strong> 15% • <strong>Your Share:</strong> 85% •{" "}
                        <strong>Next Payout:</strong> Dec 15th
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-blue-600" />
                        <span>Recent Subscriber Content</span>
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("content")}>
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post) => (
                        <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{post.title}</h3>
                              <Badge variant={post.type === "workout" ? "default" : "secondary"}>
                                {post.type === "workout" ? "Workout" : "Blog"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Subscribers Only
                              </Badge>
                            </div>
                            <Badge variant="secondary">{post.createdAt}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{post.views}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Star className="h-4 w-4" />
                                <span>{post.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{athleteStats.subscribers}</div>
                        <div className="text-sm text-gray-600">Subscribers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-500 mb-1">{athleteStats.totalPosts}</div>
                        <div className="text-sm text-gray-600">Total Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {athleteStats.totalViews.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">${athleteStats.monthlyEarnings}</div>
                        <div className="text-sm text-gray-600">This Month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New Subscribers</span>
                        <span className="font-semibold">+3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Content Published</span>
                        <span className="font-semibold">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Views</span>
                        <span className="font-semibold">245</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-semibold text-green-600">$470</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Content</h1>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setPostType("workout")
                      setCreatingPost(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    New Workout
                  </Button>
                  <Button
                    onClick={() => {
                      setPostType("blog")
                      setCreatingPost(true)
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Blog Post
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                            <Badge variant={post.type === "workout" ? "default" : "secondary"}>
                              {post.type === "workout" ? "Workout" : "Blog"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Subscribers Only
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{post.description}</p>
                          {post.videoLink && (
                            <div className="flex items-center space-x-2 mb-3">
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                              <a
                                href={post.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {post.videoLink}
                              </a>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">{post.createdAt}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} views</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{post.likes} likes</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments} comments</span>
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Subscribers ({athleteStats.subscribers})</h1>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: athleteStats.subscribers }, (_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">M{i + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Member {i + 1}</h4>
                          <p className="text-sm text-gray-600">
                            Subscribed {Math.floor(Math.random() * 30) + 1} days ago
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            Active • $10/month
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>
                <Button className="bg-green-600 hover:bg-green-700" onClick={requestPayout}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </div>

              {/* Earnings Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-green-600">${athleteStats.monthlyEarnings}</p>
                        <p className="text-xs text-green-600">{athleteStats.subscribers} × $10</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Your Share (85%)</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${Math.round(athleteStats.monthlyEarnings * 0.85)}
                        </p>
                        <p className="text-xs text-blue-600">After platform fee</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Subscriptions</p>
                        <p className="text-2xl font-bold text-purple-600">{athleteStats.activeSubscriptions}</p>
                        <p className="text-xs text-gray-600">Paying subscribers</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Next Payout</p>
                        <p className="text-2xl font-bold text-orange-600">Dec 15</p>
                        <p className="text-xs text-gray-600">Automatic</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Earnings Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Subscription Revenue ({athleteStats.subscribers} × $10)</span>
                      <span className="font-bold text-green-600">${athleteStats.monthlyEarnings}.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span>Platform Fee (15%)</span>
                      <span className="font-bold text-red-600">
                        -${Math.round(athleteStats.monthlyEarnings * 0.15)}.00
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium">Your Net Earnings</span>
                      <span className="font-bold text-blue-600">
                        ${Math.round(athleteStats.monthlyEarnings * 0.85)}.00
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Subscription Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: "New subscription", member: "Marcus H.", amount: "+$10", date: "2 hours ago" },
                      { action: "Subscription renewed", member: "Sarah C.", amount: "+$10", date: "1 day ago" },
                      { action: "New subscription", member: "Tyler J.", amount: "+$10", date: "2 days ago" },
                      { action: "Subscription canceled", member: "Alex M.", amount: "-$10", date: "3 days ago" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-600">
                            {activity.member} • {activity.date}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            activity.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {activity.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <Button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className={editingProfile ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {editingProfile ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <img
                            src={profileData.profilePicture || "/placeholder.svg"}
                            alt={profileData.name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          {editingProfile && (
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                              <Upload className="h-4 w-4 text-white" />
                              <input type="file" accept="image/*" className="hidden" />
                            </label>
                          )}
                        </div>
                        <div className="flex-1">
                          {editingProfile ? (
                            <Input
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="text-xl font-semibold"
                              placeholder="Your full name"
                            />
                          ) : (
                            <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
                          )}
                          <p className="text-gray-600">Professional Athlete & Coach</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        {editingProfile ? (
                          <Textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            rows={4}
                            placeholder="Tell your subscribers about your background and expertise..."
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{profileData.bio}</p>
                        )}
                      </div>

                      {/* Contact Information */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          {editingProfile ? (
                            <Input
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            />
                          ) : (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          {editingProfile ? (
                            <Input
                              value={profileData.location}
                              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                              placeholder="City, State"
                            />
                          ) : (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        {editingProfile ? (
                          <Input
                            value={profileData.experience}
                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                            placeholder="e.g., 8 years"
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.experience}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specialties */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span>Sports Specialties</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingProfile ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">Select your areas of expertise:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {[
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
                              "Serve Technique",
                              "Mental Game",
                              "Fitness",
                            ].map((specialty) => (
                              <button
                                key={specialty}
                                type="button"
                                onClick={() => {
                                  const newSpecialties = profileData.specialties.includes(specialty)
                                    ? profileData.specialties.filter((s) => s !== specialty)
                                    : [...profileData.specialties, specialty]
                                  setProfileData({ ...profileData, specialties: newSpecialties })
                                }}
                                className={`p-2 text-sm border rounded-lg transition-all ${
                                  profileData.specialties.includes(specialty)
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                                }`}
                              >
                                {specialty}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.specialties.map((specialty) => (
                            <Badge key={specialty} className="bg-orange-100 text-orange-800">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-purple-500" />
                        <span>Certifications & Credentials</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingProfile ? (
                        <div className="space-y-3">
                          {profileData.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={cert}
                                onChange={(e) => {
                                  const newCerts = [...profileData.certifications]
                                  newCerts[index] = e.target.value
                                  setProfileData({ ...profileData, certifications: newCerts })
                                }}
                                placeholder="Certification name"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCerts = profileData.certifications.filter((_, i) => i !== index)
                                  setProfileData({ ...profileData, certifications: newCerts })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setProfileData({
                                ...profileData,
                                certifications: [...profileData.certifications, ""],
                              })
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {profileData.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">{cert}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Subscription Pricing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span>Subscription Pricing</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">$10</div>
                        <div className="text-sm text-green-800">per month</div>
                        <div className="text-xs text-gray-600 mt-2">Fixed rate for all athletes</div>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p>
                          All athletes on PROLOGUE charge the same monthly rate, ensuring fair and accessible pricing
                          for members.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profile Views</span>
                          <span className="font-semibold">1,247</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Conversion Rate</span>
                          <span className="font-semibold">12.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profile Completeness</span>
                          <span className="font-semibold text-green-600">95%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Notification Preferences
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Post Modal */}
      {creatingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                Create {postType === "workout" ? "Workout" : "Blog Post"}
                <Badge variant="outline" className="ml-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Subscribers Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder={`Enter ${postType} title...`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="Brief description that will be visible to subscribers..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {postType === "workout" ? "Workout Content" : "Blog Content"}
                </label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder={
                    postType === "workout"
                      ? "Detailed workout instructions, sets, reps, tips..."
                      : "Write your blog post content here..."
                  }
                  rows={8}
                />
              </div>

              {postType === "workout" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Link (Optional)</label>
                  <Input
                    value={newPost.videoLink}
                    onChange={(e) => setNewPost({ ...newPost, videoLink: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Subscriber Content:</strong> This content will only be visible to your paying subscribers
                  ($10/month).
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => setCreatingPost(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.description || !newPost.content}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Publish {postType === "workout" ? "Workout" : "Blog Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showStripeOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <CoachStripeOnboarding
              onComplete={(accountId) => {
                setStripeAccountId(accountId)
                setShowStripeOnboarding(false)
              }}
            />
            <Button variant="ghost" onClick={() => setShowStripeOnboarding(false)} className="w-full mt-4">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
