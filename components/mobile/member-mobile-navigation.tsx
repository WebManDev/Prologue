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
  Bell, 
  User 
} from "lucide-react"
import { useMemberNotifications } from "@/contexts/member-notification-context"

export default function MemberMobileNavigation() {
  const pathname = usePathname()
  const { unreadMessagesCount, unreadNotificationsCount, hasNewTrainingContent } = useMemberNotifications()

  const navigationItems = [
    {
      name: "Home",
      href: "/member-dashboard",
      icon: Home,
      badge: null,
    },
    {
      name: "Messages",
      href: "/member-messaging",
      icon: MessageCircle,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
    },
    {
      name: "Training",
      href: "/member-training",
      icon: BookOpen,
      badge: hasNewTrainingContent ? "New" : null,
    },
    {
      name: "Notifications",
      href: "/member-notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      name: "Profile",
      href: "/member/settings",
      icon: User,
      badge: null,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
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
    </div>
  )
} 