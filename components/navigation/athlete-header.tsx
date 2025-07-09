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
  FileText,
  TrendingUp,
} from "lucide-react"
import SearchBar from "@/components/SearchBar"

interface AthleteHeaderProps {
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
    profileImageUrl?: string | null
    profilePic?: string | null
    profilePicture?: string | null
  }
}

export function AthleteHeader({
  currentPath,
  onLogout,
  showSearch = false,
  unreadNotifications = 0,
  unreadMessages = 0,
  hasNewContent = false,
  profileImageUrl,
  profileData,
}: AthleteHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 flex-1 min-w-0">
            <Link href="/home" className="flex items-center space-x-2 lg:space-x-3 group cursor-pointer flex-shrink-0">
              <div className="w-7 h-7 lg:w-8 lg:h-8 relative transition-transform group-hover:scale-110">
                <Image
                  src="/Prologue LOGO-1.png"
                  alt="PROLOGUE"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg lg:text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                PROLOGUE
              </span>
            </Link>
            
            {/* Search Bar */}
            {showSearch && (
              <div className="w-32 sm:w-48 md:w-64 lg:w-80 flex-shrink min-w-0">
                <SearchBar 
                  onSearch={(term) => console.log("Searching:", term)} 
                  placeholder="Search athletes, content..." 
                  delay={1000} 
                  initialValue="" 
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Navigation Items - Hidden on mobile since bottom nav exists */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                href="/home"
                className={`flex flex-col items-center space-y-1 transition-colors group ${
                  currentPath === "/home" ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-medium">Home</span>
                <div className={`w-full h-0.5 bg-blue-500 transition-opacity ${
                  currentPath === "/home" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}></div>
              </Link>
              <Link
                href="/content"
                className={`flex flex-col items-center space-y-1 transition-colors group ${
                  currentPath === "/content" ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs font-medium">Content</span>
                <div className={`w-full h-0.5 bg-blue-500 transition-opacity ${
                  currentPath === "/content" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}></div>
              </Link>
              <Link
                href="/feedback"
                className={`flex flex-col items-center space-y-1 transition-colors group ${
                  currentPath === "/feedback" ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs font-medium">Feedback</span>
                <div className={`w-full h-0.5 bg-blue-500 transition-opacity ${
                  currentPath === "/feedback" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}></div>
              </Link>
              <Link
                href="/messaging"
                className={`flex flex-col items-center space-y-1 transition-colors group ${
                  currentPath === "/messaging" ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-medium">Messages</span>
                <div className={`w-full h-0.5 bg-blue-500 transition-opacity ${
                  currentPath === "/messaging" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}></div>
              </Link>
              <Link
                href="/notifications"
                className={`flex flex-col items-center space-y-1 transition-colors group ${
                  currentPath === "/notifications" ? "text-blue-500" : "text-gray-700 hover:text-blue-500"
                }`}
              >
                <Bell className="h-5 w-5" />
                <span className="text-xs font-medium">Notifications</span>
                <div className={`w-full h-0.5 bg-blue-500 transition-opacity ${
                  currentPath === "/notifications" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}></div>
                {unreadNotifications > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
              </Link>
            </nav>

            {/* Profile and Notification */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 lg:space-x-2 p-1 lg:p-2">
                    <Avatar className="w-7 h-7 lg:w-8 lg:h-8">
                      {(() => {
                        const profileImageUrl = profileData && profileData.profileImageUrl && profileData.profileImageUrl.trim() !== '' ? profileData.profileImageUrl : (profileData && profileData.profilePic && profileData.profilePic.trim() !== '' ? profileData.profilePic : (profileData && profileData.profilePicture && profileData.profilePicture.trim() !== '' ? profileData.profilePicture : null));
                        if (profileImageUrl) {
                          return <AvatarImage src={profileImageUrl} alt={profileData ? `${profileData.firstName} ${profileData.lastName}` : 'User'} />;
                        } else {
                          return <AvatarFallback>{profileData && profileData.firstName && profileData.lastName ? `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase() : <User className="w-full h-full text-gray-500 p-1" />}</AvatarFallback>;
                        }
                      })()}
                    </Avatar>
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
                    <Link href="/athlete-settings" className="flex items-center w-full">
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

              {/* Notification Bell */}
              <Link href="/notifications" className="relative">
                <Button variant="ghost" size="icon" className="p-1 lg:p-2">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-700" />
                  {unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 