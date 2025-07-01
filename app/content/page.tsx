"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Search,
  TrendingUp,
  Play,
  BookOpen,
  Video,
  FileText,
  Users,
  Clock,
  Star,
  Filter,
  X,
  Plus,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Camera } from "lucide-react"
import { AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"

// Static data to prevent recreation on every render
const QUICK_SEARCHES = [
  "Navigate Recruitment",
  "Nutrition",
  "NIL",
  "Training Programs",
  "Mental Performance",
  "Injury Prevention",
  "Sports Psychology",
  "Athletic Scholarships",
]

const CONTENT_DATA = {
  videos: [
    {
      id: 1,
      title: "Mental Performance in High-Pressure Situations",
      duration: "12:34",
      views: 1250,
      rating: 4.8,
      thumbnail: "/placeholder.svg?height=200&width=300",
      category: "Mental Performance",
    },
    {
      id: 2,
      title: "Nutrition for Peak Athletic Performance",
      duration: "18:45",
      views: 2100,
      rating: 4.9,
      thumbnail: "/placeholder.svg?height=200&width=300",
      category: "Nutrition",
    },
    {
      id: 3,
      title: "NIL Opportunities and Brand Building",
      duration: "25:12",
      views: 890,
      rating: 4.7,
      thumbnail: "/placeholder.svg?height=200&width=300",
      category: "NIL",
    },
  ],
  articles: [
    {
      id: 1,
      title: "The Complete Guide to College Recruitment",
      readTime: "8 min read",
      views: 3200,
      rating: 4.9,
      category: "Recruitment",
    },
    {
      id: 2,
      title: "Building Your Athletic Brand on Social Media",
      readTime: "6 min read",
      views: 1800,
      rating: 4.6,
      category: "NIL",
    },
  ],
  courses: [
    {
      id: 1,
      title: "Elite Mindset Training Course",
      sessions: 12,
      duration: "6 weeks",
      participants: 450,
      rating: 4.8,
      category: "Mental Performance",
    },
    {
      id: 2,
      title: "Injury Prevention Masterclass",
      sessions: 8,
      duration: "4 weeks",
      participants: 320,
      rating: 4.9,
      category: "Training",
    },
  ],
}

export default function ContentPage() {
  return (
    <AdvancedNotificationProvider>
      <ContentPageContent />
    </AdvancedNotificationProvider>
  )
}

function ContentPageContent() {
  const { isMobile, isTablet } = useMobileDetection()

  // Separate state for different inputs to prevent interference
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [contentType, setContentType] = useState("video")
  const [contentTitle, setContentTitle] = useState("")
  const [contentDescription, setContentDescription] = useState("")
  const [contentCategory, setContentCategory] = useState("")

  // Refs for maintaining focus
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

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

  // Stable search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Stable content form handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContentTitle(e.target.value)
  }, [])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentDescription(e.target.value)
  }, [])

  const handleCreateContent = useCallback(() => {
    console.log("Creating content:", {
      type: contentType,
      title: contentTitle,
      description: contentDescription,
      category: contentCategory,
    })
    setShowCreateDialog(false)
    // Reset form
    setContentTitle("")
    setContentDescription("")
    setContentCategory("")
    setContentType("video")
  }, [contentType, contentTitle, contentDescription, contentCategory])

  // Memoized search dropdown to prevent recreation
  const SearchDropdown = useMemo(() => {
    if (!showSearchDropdown) return null

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
          <div className="space-y-1">
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-500 rounded transition-colors"
                onClick={() => handleSearchSelect(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [showSearchDropdown, handleSearchSelect])

  // Memoized header component
  const DesktopHeader = useMemo(
    () => (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-main-logo.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search content..."
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
                {SearchDropdown}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <AthleteNav currentPath="/content" />

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
                      <Link href="/promote" className="flex items-center w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/analytics" className="flex items-center w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
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
    ),
    [searchQuery, SearchDropdown, handleSearchChange, handleSearchFocus, clearSearch],
  )

  // Memoized create content dialog
  const CreateContentDialog = useMemo(
    () => (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button
            className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? "flex-1" : ""}`}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Create" : "Create Content"}
          </Button>
        </DialogTrigger>
        <DialogContent className={`${isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-2xl"}`}>
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Content Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="course">Training Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                ref={titleInputRef}
                id="title"
                placeholder="Enter content title..."
                value={contentTitle}
                onChange={handleTitleChange}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={contentCategory} onValueChange={setContentCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental-performance">Mental Performance</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="nil">NIL</SelectItem>
                  <SelectItem value="recruitment">Recruitment</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="injury-prevention">Injury Prevention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                ref={descriptionInputRef}
                id="description"
                placeholder="Describe your content..."
                value={contentDescription}
                onChange={handleDescriptionChange}
                rows={3}
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>
                {contentType === "video"
                  ? "Video File"
                  : contentType === "article"
                    ? "Cover Image"
                    : "Course Materials"}
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex flex-col items-center space-y-2">
                  {contentType === "video" ? (
                    <Camera className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    {contentType === "video"
                      ? "MP4, MOV up to 500MB"
                      : contentType === "article"
                        ? "PNG, JPG up to 10MB"
                        : "PDF, DOC up to 50MB"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateContent}>
                Create Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    ),
    [
      showCreateDialog,
      isMobile,
      contentType,
      contentTitle,
      contentDescription,
      contentCategory,
      handleTitleChange,
      handleDescriptionChange,
      handleCreateContent,
    ],
  )

  // Memoized main content
  const MainContent = useMemo(
    () => (
      <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
        {/* Page Header */}
        <div className="mb-6">
          <div className={`flex ${isMobile ? "flex-col space-y-4" : "items-center justify-between"}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>
                  {isMobile ? "Content" : "Content Library"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isMobile ? "Videos, articles & courses" : "Educational videos, articles, and training courses"}
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
                  <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Content</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("recent")}>Recently Added</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("popular")}>Most Popular</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("rated")}>Highest Rated</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {CreateContentDialog}
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div
          className={`grid ${isMobile ? "grid-cols-2 gap-3" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-4 gap-6"} mb-6`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Videos</CardTitle>
              <Video className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{CONTENT_DATA.videos.length}</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Educational videos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Articles</CardTitle>
              <FileText className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{CONTENT_DATA.articles.length}</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Written guides</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Courses</CardTitle>
              <BookOpen className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{CONTENT_DATA.courses.length}</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Training courses</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Subscribers</CardTitle>
              <Users className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>1,247</div>
              <p className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>Active subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className={`${isMobile ? "space-y-2" : ""}`}>
            <TabsList className={`${isMobile ? "grid w-full grid-cols-2 h-auto" : "grid w-full grid-cols-4"}`}>
              <TabsTrigger
                value="all"
                className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
              >
                <BookOpen className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                <span className={`${isMobile ? "text-xs" : ""}`}>All</span>
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className={`flex items-center space-x-1 ${isMobile ? "flex-col space-x-0 space-y-1 py-3" : "space-x-2"}`}
              >
                <Video className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                <span className={`${isMobile ? "text-xs" : ""}`}>Videos</span>
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="articles" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Articles</span>
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Courses</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {isMobile && (
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="articles" className="flex items-center flex-col space-y-1 py-3">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">Articles</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center flex-col space-y-1 py-3">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Courses</span>
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          {/* All Content */}
          <TabsContent value="all" className="space-y-6">
            {/* Videos Section */}
            <div>
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-4`}>Latest Videos</h3>
              <div
                className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-3 gap-6"}`}
              >
                {CONTENT_DATA.videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {video.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className={`${isMobile ? "text-sm" : "text-base"} font-semibold mb-2 line-clamp-2`}>
                        {video.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>{video.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{video.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Articles Section */}
            <div>
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-4`}>Recent Articles</h3>
              <div
                className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-1 gap-4" : "md:grid-cols-2 gap-6"}`}
              >
                {CONTENT_DATA.articles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {article.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{article.rating}</span>
                        </div>
                      </div>
                      <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}>{article.title}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{article.readTime}</span>
                        </div>
                        <span>{article.views} views</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <div
              className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-2 gap-4" : "md:grid-cols-3 gap-6"}`}
            >
              {CONTENT_DATA.videos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <Image
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {video.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className={`${isMobile ? "text-sm" : "text-base"} font-semibold mb-2 line-clamp-2`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            <div
              className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-1 gap-4" : "md:grid-cols-2 gap-6"}`}
            >
              {CONTENT_DATA.articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {article.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                    <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}>{article.title}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                      <span>{article.views} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div
              className={`grid ${isMobile ? "grid-cols-1 gap-4" : isTablet ? "grid-cols-1 gap-4" : "md:grid-cols-2 gap-6"}`}
            >
              {CONTENT_DATA.courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {course.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <h4 className={`${isMobile ? "text-base" : "text-lg"} font-semibold mb-2`}>{course.title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.sessions} sessions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{course.participants} enrolled</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    ),
    [isMobile, isTablet, activeTab, selectedFilter, CreateContentDialog],
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/content"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={0}
        hasNewContent={false}
      >
        {MainContent}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {DesktopHeader}
      {MainContent}
    </div>
  )
} 