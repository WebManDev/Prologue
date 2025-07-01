"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Settings,
  User,
  Bell,
  Home,
  BookOpen,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Compass,
} from "lucide-react"
import SearchBar from "@/components/SearchBar"

interface MemberHeaderProps {
  currentPath: string
  onLogout: () => void
  showSearch?: boolean
  unreadNotifications?: number
  unreadMessages?: number
  hasNewContent?: boolean
  profileImageUrl?: string | null
  profileData?: {
    firstName: string
    lastName: string
  }
}

export function MemberHeader({
  currentPath,
  onLogout,
  showSearch = false,
  unreadNotifications = 0,
  unreadMessages = 0,
  hasNewContent = false,
  profileImageUrl,
  profileData,
}: MemberHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/member-home" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                <Image
                  src="/Prologue LOGO-1.png"
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
            
            {/* Search Bar */}
            {showSearch && (
              <div className="w-80">
                <SearchBar 
                  onSearch={(term) => console.log("Searching:", term)} 
                  placeholder="Search coaches, content..." 
                  delay={1000} 
                  initialValue="" 
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {/* Navigation Items */}
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
                className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group relative"
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-medium">Training</span>
                <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {hasNewContent && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Link>
              <Link
                href="/member-browse"
                className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
              >
                <Compass className="h-5 w-5" />
                <span className="text-xs font-medium">Browse</span>
                <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/member-feedback"
                className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors group"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs font-medium">Feedback</span>
                <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/member-messaging"
                className="flex flex-col items-center space-y-1 text-gray-700 hover:text-prologue-electric transition-colors relative group"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-medium">Messages</span>
                <div className="w-full h-0.5 bg-prologue-electric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {unreadMessages > 0 && (
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
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Link>
            </nav>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profileImageUrl || undefined} alt={profileData ? `${profileData.firstName} ${profileData.lastName}` : 'User'} />
                    <AvatarFallback>
                      {profileData && profileData.firstName && profileData.lastName
                        ? `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase()
                        : <User className="w-full h-full text-gray-500 p-1" />}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/member-dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/member-settings" className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
} 