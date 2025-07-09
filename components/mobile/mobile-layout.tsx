"use client"

import React from "react"
import { Bell, Home, BookOpen, MessageCircle, User, Search, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface MobileLayoutProps {
  children: React.ReactNode
  userType: "member" | "athlete" | "coach"
  currentPath: string
  showBottomNav?: boolean
  unreadNotifications?: number
  unreadMessages?: number
  hasNewContent?: boolean
}

export default function MobileLayout({
  children,
  userType,
  currentPath,
  showBottomNav = true,
  unreadNotifications = 0,
  unreadMessages = 0,
  hasNewContent = false,
}: MobileLayoutProps) {
  const getNavItems = () => {
    if (userType === "member") {
      return [
        {
          href: "/member-home",
          icon: Home,
          label: "Home",
          badge: null,
        },
        {
          href: "/member-training",
          icon: BookOpen,
          label: "Training",
          badge: null, // Removed badge for training
        },
        {
          href: "/member-browse",
          icon: Search,
          label: "Discover",
          badge: null,
        },
        {
          href: "/member-feedback",
          icon: MessageSquare,
          label: "Feedback",
          badge: null,
        },
        {
          href: "/member-messaging",
          icon: MessageCircle,
          label: "Messages",
          badge: null, // Removed badge for messages
        },
      ]
    }
    
    if (userType === "athlete") {
      return [
        {
          href: "/home",
          icon: Home,
          label: "Home",
          badge: null,
        },
        {
          href: "/content",
          icon: BookOpen,
          label: "Content",
          badge: null,
        },
        {
          href: "/feedback",
          icon: MessageSquare,
          label: "Feedback",
          badge: null,
        },
        {
          href: "/messaging",
          icon: MessageCircle,
          label: "Messages",
          badge: unreadMessages > 0 ? unreadMessages : null,
        },
        {
          href: "/notifications",
          icon: Bell,
          label: "Notifications",
          badge: unreadNotifications > 0 ? unreadNotifications : null,
        },
      ]
    }
    
    // Add other user types as needed
    return []
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={userType === "member" ? "/member-home" : "/home"} className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-prologue-electric rounded"></div>
              <span className="text-lg font-bold text-gray-900">PROLOGUE</span>
            </Link>
            
            <Link href={userType === "member" ? "/member-notifications" : "/notifications"} className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  {unreadNotifications}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[99999]">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-prologue-electric bg-prologue-electric/10"
                      : "text-gray-600 hover:text-prologue-electric"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs bg-red-500">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
} 