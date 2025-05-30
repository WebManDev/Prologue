"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Video,
  FileText,
  Settings,
  Eye,
  Edit2,
  Save,
  X,
  Upload,
} from "lucide-react"

interface CoachDashboardProps {
  onLogout: () => void
}

export function CoachDashboard({ onLogout }: CoachDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    email: "sarah@example.com",
    bio: "Passionate tennis athlete dedicated to helping players of all levels reach their full potential. With 10+ years of experience, I specialize in technique refinement, strategic gameplay, and mental toughness training.",
    sport: "Tennis",
    experience: "8 years",
    location: "Los Angeles, CA",
    profilePicture: "/placeholder.svg?height=120&width=120",
  })

  // Sample data for the dashboard
  const stats = {
    totalEarnings: 2840,
    monthlyEarnings: 450,
    subscribers: 47,
    totalPosts: 23,
  }

  const recentPosts = [
    {
      id: 1,
      title: "Perfect Your Tennis Serve",
      type: "workout",
      views: 156,
      likes: 23,
      createdAt: "2 days ago",
    },
    {
      id: 2,
      title: "Mental Game Strategies",
      type: "blog",
      views: 89,
      likes: 15,
      createdAt: "5 days ago",
    },
    {
      id: 3,
      title: "Footwork Fundamentals",
      type: "workout",
      views: 134,
      likes: 28,
      createdAt: "1 week ago",
    },
  ]

  const subscribers = [
    {
      id: 1,
      name: "Marcus Hill",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "2 weeks ago",
      status: "active",
    },
    {
      id: 2,
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "1 month ago",
      status: "active",
    },
    {
      id: 3,
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "3 weeks ago",
      status: "active",
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setEditingProfile(false)
      alert("Profile updated successfully!")
    } catch (error) {
      alert("Failed to update profile. Please try again.")
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
              className={`transition-colors ${
                activeTab === "dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`transition-colors ${
                activeTab === "posts" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`transition-colors ${
                activeTab === "subscribers" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`transition-colors ${
                activeTab === "earnings" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`transition-colors ${
                activeTab === "profile" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Profile
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profileData.name}!</h1>
              <p className="text-gray-600">Here's how your coaching business is performing</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                          <p className="text-2xl font-bold text-green-600">${stats.totalEarnings}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">This Month</p>
                          <p className="text-2xl font-bold text-blue-600">${stats.monthlyEarnings}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Subscribers</p>
                          <p className="text-2xl font-bold text-orange-600">{stats.subscribers}</p>
                        </div>
                        <Users className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Posts</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.totalPosts}</p>
                        </div>
                        <FileText className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button className="h-20 bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center space-y-2">
                        <Plus className="h-6 w-6" />
                        <span>Create Workout</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <FileText className="h-6 w-6" />
                        <span>Write Blog Post</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Posts</span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("posts")}>
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {post.type === "workout" ? (
                                <Video className="h-5 w-5 text-gray-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{post.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{post.views}</span>
                                </span>
                                <span>{post.createdAt}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={post.type === "workout" ? "default" : "secondary"}>
                            {post.type === "workout" ? "Workout" : "Blog"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Profile</span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("profile")}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <img
                        src={profileData.profilePicture || "/placeholder.svg"}
                        alt={profileData.name}
                        className="w-16 h-16 rounded-full mx-auto mb-3"
                      />
                      <h3 className="font-semibold text-lg">{profileData.name}</h3>
                      <p className="text-gray-600">{profileData.sport} Athlete</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Subscribers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Subscribers</span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("subscribers")}>
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscribers.slice(0, 3).map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center space-x-3">
                          <img
                            src={subscriber.avatar || "/placeholder.svg"}
                            alt={subscriber.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{subscriber.name}</p>
                            <p className="text-xs text-gray-600">{subscriber.joinedDate}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                  <p className="text-gray-600">Manage your profile information and preferences</p>
                </div>
                {!editingProfile ? (
                  <Button onClick={() => setEditingProfile(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-8">
                {/* Profile Picture and Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
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
                          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                            <Upload className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                        <p className="text-gray-600">{profileData.sport} Athlete</p>
                        <p className="text-sm text-gray-500">{profileData.location}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sport">Primary Sport</Label>
                        <Select disabled={!editingProfile}>
                          <SelectTrigger>
                            <SelectValue placeholder={profileData.sport} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tennis">Tennis</SelectItem>
                            <SelectItem value="Soccer">Soccer</SelectItem>
                            <SelectItem value="Swimming">Swimming</SelectItem>
                            <SelectItem value="Basketball">Basketball</SelectItem>
                            <SelectItem value="Volleyball">Volleyball</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          name="experience"
                          value={profileData.experience}
                          onChange={handleInputChange}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          disabled={!editingProfile}
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        disabled={!editingProfile}
                        rows={4}
                        placeholder="Tell potential students about your background, achievements, and athletic philosophy..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs remain the same as before */}
          <TabsContent value="posts">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
              <p className="text-gray-600">Manage your workouts and blog posts</p>
            </div>
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
              <p className="text-gray-600">View and manage your subscribers</p>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
              <p className="text-gray-600">Track your earnings and payouts</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
