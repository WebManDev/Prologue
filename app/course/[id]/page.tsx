"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  ChevronDown,
  LogOut,
  MessageSquare,
  Search,
  X,
  Home,
  MessageCircle,
  Bell,
  FileText,
  LayoutDashboard,
  Crown,
  MoreHorizontal,
  Play,
  Bookmark,
  Heart,
  Eye,
  TrendingUp,
  Filter,
  Grid,
  List,
  Clock,
  BookOpen,
  Share2,
  CheckCircle,
  Users,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { useOptimizedLogout } from "@/lib/auth-utils"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

export default function CoursesPage() {
  // Mobile detection
  const { isMobile, isTablet } = useMobileDetection()

  // Optimized logout hook
  const { logout, isLoggingOut } = useOptimizedLogout()

  // Contexts
  const { unreadCount } = useNotifications()

  // Search dropdown state
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [likedCourses, setLikedCourses] = useState<Set<string>>(new Set())
  const [savedCourses, setSavedCourses] = useState<Set<string>>(new Set())

  // Course categories
  const categories = useMemo(
    () => [
      "Mental Performance",
      "Training",
      "Nutrition",
      "Recovery",
      "Technique",
      "Strategy",
      "Equipment",
      "Motivation",
      "Injury Prevention",
      "Performance Analysis",
    ],
    [],
  )

  // Mock courses data
  const mockCourses = useMemo(
    () => [
      {
        id: "course-1",
        title: "Elite Mindset Training Course",
        creator: "Dr. Sarah Mitchell",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        thumbnail: "/placeholder.svg?height=200&width=300",
        lessons: 12,
        duration: "6 weeks",
        totalDuration: "8h 45m",
        views: 3240,
        likes: 298,
        comments: 67,
        publishedAt: "3 weeks ago",
        category: "Mental Performance",
        isPremium: true,
        isNew: false,
        rating: 4.8,
        totalRatings: 324,
        participants: 450,
        description:
          "Master the mental aspects of athletic performance with proven techniques used by elite athletes worldwide.",
        price: "$99",
      },
      {
        id: "course-2",
        title: "Injury Prevention Masterclass",
        creator: "Coach Mike Rodriguez",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        thumbnail: "/placeholder.svg?height=200&width=300",
        lessons: 8,
        duration: "4 weeks",
        totalDuration: "6h 20m",
        views: 2100,
        likes: 156,
        comments: 43,
        publishedAt: "1 week ago",
        category: "Injury Prevention",
        isPremium: true,
        isNew: true,
        rating: 4.9,
        totalRatings: 198,
        participants: 320,
        description:
          "Comprehensive guide to preventing sports injuries through proper warm-up, technique, and recovery protocols.",
        price: "$79",
      },
      {
        id: "course-3",
        title: "Advanced Basketball Techniques",
        creator: "Jordan Smith",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        thumbnail: "/placeholder.svg?height=200&width=300",
        lessons: 15,
        duration: "8 weeks",
        totalDuration: "12h 30m",
        views: 4580,
        likes: 412,
        comments: 89,
        publishedAt: "2 weeks ago",
        category: "Technique",
        isPremium: false,
        isNew: false,
        rating: 4.7,
        totalRatings: 267,
        participants: 680,
        description: "Master advanced basketball skills including shooting, dribbling, defense, and game strategy.",
        price: "Free",
      },
      {
        id: "course-4",
        title: "Nutrition for Peak Performance",
        creator: "Dr. Emma Wilson",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        thumbnail: "/placeholder.svg?height=200&width=300",
        lessons: 10,
        duration: "5 weeks",
        totalDuration: "7h 15m",
        views: 1890,
        likes: 234,
        comments: 56,
        publishedAt: "4 days ago",
        category: "Nutrition",
        isPremium: true,
        isNew: true,
        rating: 4.6,
        totalRatings: 145,
        participants: 280,
        description: "Learn how to fuel your body for optimal athletic performance and faster recovery.",
        price: "$89",
      },
      {
        id: "course-5",
        title: "Recovery and Rest Optimization",
        creator: "Alex Rodriguez",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: false,
        thumbnail: "/placeholder.svg?height=200&width=300",
        lessons: 6,
        duration: "3 weeks",
        totalDuration: "4h 50m",
        views: 1560,
        likes: 189,
        comments: 34,
        publishedAt: "1 month ago",
        category: "Recovery",
        isPremium: false,
        isNew: false,
        rating: 4.5,
        totalRatings: 112,
        participants: 220,
        description: "Discover the science of recovery and how to optimize your rest for peak performance.",
        price: "Free",
      },
      {
        id: "course-6",
        title: "Strength Training Fundamentals",
        creator: "Lisa Chen",
        creatorAvatar: "/placeholder.svg?height=40&width=40",
        creatorVerified: true,
        thumbnail: "/placeholder.svg?height=200&width=300",
        lessons: 14,
        duration: "7 weeks",
        totalDuration: "10h 25m",
        views: 3890,
        likes: 356,
        comments: 78,
        publishedAt: "2 months ago",
        category: "Training",
        isPremium: true,
        isNew: false,
        rating: 4.8,
        totalRatings: 289,
        participants: 520,
        description: "Build a solid foundation in strength training with proper form, programming, and progression.",
        price: "$119",
      },
    ],
    [],
  )

  // The rest of the UI is exactly as provided by the user, using mockCourses for display.
  // ... existing code ...
} 