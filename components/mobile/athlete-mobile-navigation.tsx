"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  User,
  MessageSquare
} from "lucide-react"

interface AthleteMobileNavigationProps {
  currentPath: string
  unreadMessages?: number
  hasNewContent?: boolean
}

export default function AthleteMobileNavigation({
  currentPath,
  unreadMessages = 0,
  hasNewContent = false,
}: AthleteMobileNavigationProps) {
  const navigationItems = [
    {
      name: "Home",
      href: "/home",
      icon: Home,
      badge: null,
    },
    {
      name: "Content",
      href: "/content",
      icon: BookOpen,
      badge: null, // Remove 'New' badge
    },
    {
      name: "Messages",
      href: "/messaging",
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : null, // Only show number badge
    },
    {
      name: "Feedback",
      href: "/feedback",
      icon: MessageSquare,
      badge: null,
    },
    {
      name: "Profile",
      href: "/athleteDashboard",
      icon: User,
      badge: null,
    },
  ]

  return (
    <div className="flex items-center justify-around px-2 py-2">
      {navigationItems.map((item) => {
        const isActive = currentPath === item.href
        const Icon = item.icon
        // Prevent navigation if already on the profile page
        if (item.name === "Profile" && (currentPath === "/athleteDashboard" || currentPath === item.href)) {
          return (
            <button
              key={item.name}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors relative",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              )}
              type="button"
              tabIndex={-1}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold leading-none">{item.badge}</span>
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </button>
          )
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors relative",
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <Badge
                  variant="destructive"
                  className={cn(
                    "absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center",
                    typeof item.badge === "string" && "bg-green-500"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
} 