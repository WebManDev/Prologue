"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  ChevronDown,
  LogOut,
  Search,
  X,
  Home,
  MessageCircle,
  Bell,
  BookOpen,
  LayoutDashboard,
  Play,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Filter,
  Plus,
  Star,
  ChevronRight,
  Award,
  Activity,
  Users,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

export default function MemberTrainingPage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // Optimized logout hook
  const { logout, loadingState } = useUnifiedLogout()
  const isLoggingOut = loadingState.isLoading

  // Contexts
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent, markTrainingAsVisited } =
    useMemberNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "in-progress" | "completed" | "new">("all")

  // Mark training as visited on mount
  useEffect(() => {
    if (hasNewTrainingContent) {
      markTrainingAsVisited()
    }
  }, [hasNewTrainingContent, markTrainingAsVisited])

  // Mock training data
  const trainingPrograms = useMemo(
    () => [
      {
        id: 1,
        title: "Elite Basketball Fundamentals",
        instructor: "Coach Mike Johnson",
        duration: "8 weeks",
        progress: 75,
        status: "in-progress",
        difficulty: "Intermediate",
        rating: 4.8,
        students: 234,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: false,
        nextSession: "Tomorrow, 3:00 PM",
        completedLessons: 12,
        totalLessons: 16,
      },
      {
        id: 2,
        title: "Mental Performance Mastery",
        instructor: "Dr. Sarah Chen",
        duration: "6 weeks",
        progress: 45,
        status: "in-progress",
        difficulty: "Advanced",
        rating: 4.9,
        students: 156,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: true,
        nextSession: "Friday, 2:00 PM",
        completedLessons: 7,
        totalLessons: 12,
      },
      {
        id: 3,
        title: "Strength & Conditioning",
        instructor: "Alex Rodriguez",
        duration: "12 weeks",
        progress: 100,
        status: "completed",
        difficulty: "Beginner",
        rating: 4.7,
        students: 445,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: false,
        completedLessons: 24,
        totalLessons: 24,
      },
      {
        id: 4,
        title: "Nutrition for Athletes",
        instructor: "Lisa Martinez",
        duration: "4 weeks",
        progress: 0,
        status: "new",
        difficulty: "Beginner",
        rating: 4.6,
        students: 89,
        thumbnail: "/placeholder.svg?height=200&width=300",
        isNew: true,
        nextSession: "Monday, 10:00 AM",
        completedLessons: 0,
        totalLessons: 8,
      },
    ],
    [],
  )

  // Filter training programs
  const filteredPrograms = useMemo(() => {
    let filtered = trainingPrograms

    if (selectedFilter !== "all") {
      filtered = filtered.filter((program) => program.status === selectedFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.instructor.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [trainingPrograms, selectedFilter, searchQuery])

  // Quick search suggestions
  const quickSearches = useMemo(
    () => [
      "Basketball Training",
      "Mental Performance",
      "Strength Training",
      "Nutrition",
      "Conditioning",
      "Skills Development",
      "Recovery",
      "Injury Prevention",
    ],
    [],
  )

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setShowSearchDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((search: string) => {
    setSearchQuery(search)
    setShowSearchDropdown(false)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearchDropdown(false)
  }, [])

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

  // Optimized logout handler
  const handleLogout = async () => {
    try {
      await logout({
        clearAllData: true,
        onError: (error: unknown) => {
          console.error("Logout error:", error)
        },
      })
    } catch (error) {
      console.error("Logout failed:", error)
      window.location.href = "/"
    }
  }

  // Memoized search dropdown content
  const searchDropdownContent = useMemo(() => {
    return (
      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Searches</h4>
          <div className="space-y-1">
            {quickSearches.map((search, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-prologue-electric rounded transition-colors"
                onClick={() => handleSearchSelect(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }, [quickSearches, handleSearchSelect])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Fixed Navigation */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/member-home" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/prologue-logo.png"
                alt="PROLOGUE"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-lg font-athletic font-bold text-gray-900 tracking-wider">PROLOGUE</span>
          </Link>

          {/* Right Actions - Search, Bell, Dropdown */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowSearchDropdown(true)}>
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Notification Bell */}
            <Link href="/member-notifications" className="relative">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotificationsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </Button>
            </Link>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={isLoggingOut}>
                  <Link href="/member-dashboard">
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-prologue-electric/30 transition-all">
                      <User className="w-full h-full text-gray-500 p-1" />
                    </div>
                  </Link>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/member-dashboard" className="flex items-center w-full cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/member-settings" className="flex items-center w-full cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={isLoggingOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearchDropdown && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Button variant="ghost" size="sm" className="p-2 mr-2" onClick={() => setShowSearchDropdown(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search training programs..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Searches</h3>
              <div className="space-y-2">
                {quickSearches.map((search, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => handleSearchSelect(search)}
                  >
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/member-home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-logo.png"
                    alt="PROLOGUE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-prologue-electric transition-colors tracking-wider">
                  PROLOGUE
                </span>
              </Link>

              <div className="flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search training programs..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
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

                {/* Search Dropdown */}
                {showSearchDropdown && searchDropdownContent}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/member-home"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-training"
                  className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors group relative"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">Training</span>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-prologue-electric rounded-full"></div>
                </Link>
                <Link
                  href="/member-browse"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
                >
                  <Search className="h-5 w-5" />
                  <span className="text-xs font-medium">Browse</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/member-messaging"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors relative group"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {unreadMessagesCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
                <Link
                  href="/member-notifications"
                  className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors relative group"
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2" disabled={isLoggingOut}>
                      <Link href="/member-dashboard">
                        <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-prologue-electric/30 transition-all">
                          <User className="w-full h-full text-gray-500 p-1" />
                        </div>
                      </Link>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/member-dashboard" className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/member-settings" className="flex items-center w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={isLoggingOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Training Programs</h1>
            <p className="text-gray-600">Continue your athletic development journey</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  <span className="capitalize">
                    {selectedFilter === "all" ? "All Programs" : selectedFilter.replace("-", " ")}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Programs</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("new")}>New</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("in-progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>Completed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
              <Plus className="h-4 w-4 mr-2" />
              Browse Programs
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Programs</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-prologue-electric/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-prologue-electric" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours Trained</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                </div>
                <div className="w-12 h-12 bg-prologue-fire/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-prologue-fire" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-600" />
                    </div>
                  </div>
                  {program.isNew && (
                    <Badge className="absolute top-3 left-3 bg-prologue-electric text-white">New</Badge>
                  )}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{program.duration}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{program.title}</h3>
                      <p className="text-sm text-gray-600">{program.instructor}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {program.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{program.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{program.students}</span>
                    </div>
                  </div>

                  {program.status !== "new" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">
                          {program.completedLessons}/{program.totalLessons} lessons
                        </span>
                      </div>
                      <Progress value={program.progress} className="h-2" />
                    </div>
                  )}

                  {program.nextSession && program.status !== "completed" && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-prologue-electric" />
                        <span className="text-sm font-medium text-gray-700">Next Session:</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{program.nextSession}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 mr-2 hover:bg-prologue-electric hover:text-white bg-transparent"
                    >
                      {program.status === "completed" ? "Review" : program.status === "new" ? "Start" : "Continue"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-prologue-electric">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-prologue-electric hover:bg-prologue-electric/10">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {[
                {
                  type: "lesson",
                  title: "Completed: Advanced Shooting Techniques",
                  program: "Elite Basketball Fundamentals",
                  time: "2 hours ago",
                  icon: Target,
                  color: "text-green-600",
                  bgColor: "bg-green-100",
                },
                {
                  type: "achievement",
                  title: "Earned: Mental Toughness Badge",
                  program: "Mental Performance Mastery",
                  time: "1 day ago",
                  icon: Award,
                  color: "text-yellow-600",
                  bgColor: "bg-yellow-100",
                },
                {
                  type: "milestone",
                  title: "Reached 75% completion",
                  program: "Elite Basketball Fundamentals",
                  time: "3 days ago",
                  icon: TrendingUp,
                  color: "text-prologue-electric",
                  bgColor: "bg-prologue-electric/10",
                },
                {
                  type: "session",
                  title: "Attended live session",
                  program: "Mental Performance Mastery",
                  time: "1 week ago",
                  icon: Activity,
                  color: "text-prologue-fire",
                  bgColor: "bg-prologue-fire/10",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <activity.icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.program}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-prologue-electric">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16 px-4">
          <Link
            href="/member-home"
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/member-training"
            className="flex flex-col items-center space-y-1 text-prologue-electric transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-medium">Training</span>
          </Link>
          <Link
            href="/member-browse"
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
          >
            <Search className="h-5 w-5" />
            <span className="text-xs font-medium">Browse</span>
          </Link>
          <Link
            href="/member-messaging"
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors relative"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-medium">Messages</span>
            {unreadMessagesCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </Link>
          <Link
            href="/member-dashboard"
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-prologue-electric transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
} 