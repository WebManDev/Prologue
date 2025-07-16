"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Search,
  TrendingUp,
  Share2,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Copy,
  Download,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
  Users,
  Target,
  Filter,
  X,
  Plus,
  Calendar,
  Send,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PromotePage() {
  const { isMobile, isTablet } = useMobileDetection()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [postContent, setPostContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"])
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [promotionType, setPromotionType] = useState("boost")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Quick search suggestions for athletes
  const quickSearches = [
    "Navigate Recruitment",
    "Nutrition",
    "NIL",
    "Training Programs",
    "Mental Performance",
    "Injury Prevention",
    "Sports Psychology",
    "Athletic Scholarships",
  ]

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Mock promotion data
  const promotionStats = {
    totalReach: 15420,
    engagement: 8.7,
    clicks: 1240,
    conversions: 89,
  }

  const socialPosts = [
    {
      id: 1,
      platform: "instagram",
      content: "Just dropped a new video on mental performance! 🧠💪 Link in bio",
      image: "/placeholder.svg?height=200&width=300",
      likes: 234,
      comments: 18,
      shares: 12,
      timestamp: "2 hours ago",
      status: "published",
    },
    {
      id: 2,
      platform: "twitter",
      content:
        "The key to peak performance isn't just physical training - it's mental preparation. New content coming soon! 🎯",
      likes: 89,
      comments: 7,
      shares: 23,
      timestamp: "1 day ago",
      status: "published",
    },
    {
      id: 3,
      platform: "youtube",
      content: "Complete Guide to College Recruitment - Everything You Need to Know",
      image: "/placeholder.svg?height=200&width=300",
      likes: 456,
      comments: 34,
      shares: 67,
      timestamp: "3 days ago",
      status: "scheduled",
    },
  ]

  const contentTemplates = [
    {
      id: 1,
      title: "Instagram Story Template",
      description: "Promote your latest content with this engaging story template",
      image: "/placeholder.svg?height=200&width=300",
      platform: "instagram",
      type: "story",
    },
    {
      id: 2,
      title: "YouTube Thumbnail",
      description: "Eye-catching thumbnail for your training videos",
      image: "/placeholder.svg?height=200&width=300",
      platform: "youtube",
      type: "thumbnail",
    },
    {
      id: 3,
      title: "Twitter Post Template",
      description: "Professional template for sharing insights",
      image: "/placeholder.svg?height=200&width=300",
      platform: "twitter",
      type: "post",
    },
  ]

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchFocus = () => {
    setShowSearchDropdown(true)
  }

  const handleSearchSelect = (search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const handleSchedulePost = () => {
    console.log("Scheduling post:", { content: postContent, platforms: selectedPlatforms })
    setPostContent("")
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "bg-pink-100 text-pink-700"
      case "twitter":
        return "bg-blue-100 text-blue-700"
      case "facebook":
        return "bg-blue-100 text-blue-700"
      case "youtube":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handlePromotePayment = async () => {
    setIsProcessingPayment(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123', // In a real app, get this from auth context
          amount: 20,
          description: `${promotionType.charAt(0).toUpperCase() + promotionType.slice(1)} Promotion`,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Payment error: ${error}`)
        setIsProcessingPayment(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  const DesktopHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
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
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                PROLOGUE
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search promotion tools..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  onFocus={handleSearchFocus}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showSearchDropdown && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
                    <div className="space-y-1">
                      {quickSearches.map((search, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                          onClick={() => handleSearchSelect(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <AthleteNav currentPath="/promote" />

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-1" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/athleteDashboard" className="flex items-center w-full">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )

  const MainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"}`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>
                {isMobile ? "Promote" : "Promotion Center"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isMobile ? "Grow your audience" : "Grow your audience and promote your content"}
              </p>
            </div>
          </div>
          <div className={`flex ${isMobile ? "w-full space-x-2" : "space-x-3"}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={isMobile ? "flex-1" : ""} size={isMobile ? "sm" : "default"}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Posts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("published")}>Published</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("scheduled")}>Scheduled</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("draft")}>Drafts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className={`bg-purple-600 hover:bg-purple-700 ${isMobile ? "flex-1" : ""}`}
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? "Create" : "Create Post"}
            </Button>
            <Button
              className={`bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white ${isMobile ? "flex-1" : ""}`}
              size={isMobile ? "sm" : "default"}
              onClick={() => setShowPromoteModal(true)}
            >
              Promote
            </Button>
          </div>
        </div>
      </div>

      {/* Promotion Stats */}
      <div
        className={`grid ${isMobile ? "grid-cols-2 gap-3" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-4 gap-6"} mb-6`}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Total Reach</CardTitle>
            <Eye className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
              {promotionStats.totalReach.toLocaleString()}
            </div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>People reached</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Engagement</CardTitle>
            <Heart className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{promotionStats.engagement}%</div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Engagement rate</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Clicks</CardTitle>
            <Target className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
              {promotionStats.clicks.toLocaleString()}
            </div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Link clicks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Conversions</CardTitle>
            <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{promotionStats.conversions}</div>
            <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>New subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Promotion Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className={`${isMobile ? "space-y-2" : ""}`}>
          <TabsList className={`${isMobile ? "grid w-full grid-cols-2 h-auto" : "grid w-full grid-cols-4"}`}>
            <TabsTrigger
              value="overview"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <BarChart3 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
            >
              <Share2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              <span className={`${isMobile ? "text-xs" : ""}`}>Posts</span>
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="templates" className="flex items-center space-x-2">
                  <Copy className="h-4 w-4" />
                  <span>Templates</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {isMobile && (
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="templates" className="flex items-center flex-col space-y-1 py-3">
                <Copy className="h-3 w-3" />
                <span className="text-xs">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center flex-col space-y-1 py-3">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Schedule</span>
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-1 gap-4" : "md:grid-cols-2 gap-6"}`}
          >
            <Card>
              <CardHeader>
                <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>Recent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Instagram Posts</span>
                    <span className="font-semibold">+12% engagement</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">YouTube Videos</span>
                    <span className="font-semibold">+8% views</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Twitter Posts</span>
                    <span className="font-semibold">+15% retweets</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <p className={`${isMobile ? "text-sm" : "text-base"} font-medium`}>Mental Performance Tips</p>
                      <p className="text-sm text-gray-600">2.3k views • 89% engagement</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <p className={`${isMobile ? "text-sm" : "text-base"} font-medium`}>Nutrition Guide</p>
                      <p className="text-sm text-gray-600">1.8k views • 76% engagement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="space-y-4">
            {socialPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {post.image && (
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt="Post preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={getPlatformColor(post.platform)}>
                            {getPlatformIcon(post.platform)}
                            <span className="ml-1 capitalize">{post.platform}</span>
                          </Badge>
                          <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                      </div>
                      <p className={`${isMobile ? "text-sm" : "text-base"} text-gray-900 mb-3`}>{post.content}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="h-4 w-4" />
                          <span>{post.shares}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-3 gap-6"}`}
          >
            {contentTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <Image
                    src={template.image || "/placeholder.svg"}
                    alt={template.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className={getPlatformColor(template.platform)}>
                      {getPlatformIcon(template.platform)}
                      <span className="ml-1 capitalize">{template.platform}</span>
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className={`${isMobile ? "text-sm" : "text-base"} font-semibold mb-2`}>{template.title}</h4>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 mb-4`}>{template.description}</p>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>Schedule New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="What would you like to share?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {["instagram", "twitter", "facebook", "youtube"].map((platform) => (
                    <Button
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle(platform)}
                      className="flex items-center space-x-2"
                    >
                      {getPlatformIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input id="schedule-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input id="schedule-time" type="time" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSchedulePost} className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Post
                </Button>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Post Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promote Your Content</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="promotion-type">Promotion Type</Label>
              <select
                id="promotion-type"
                value={promotionType}
                onChange={(e) => setPromotionType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="boost">Content Boost ($20)</option>
                <option value="featured">Featured Post ($20)</option>
                <option value="sponsored">Sponsored Content ($20)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Boost your content visibility and reach more athletes with our promotion service.
              </p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-lg font-semibold text-gray-900">$20.00</p>
                <p className="text-sm text-gray-600">One-time payment</p>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPromoteModal(false)}
                className="flex-1"
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePromotePayment}
                disabled={isProcessingPayment}
                className="flex-1 bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white"
              >
                {isProcessingPayment ? "Processing..." : "Pay $20"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/promote"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={0}
        hasNewContent={false}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopHeader />
      <MainContent />
    </div>
  )
} 