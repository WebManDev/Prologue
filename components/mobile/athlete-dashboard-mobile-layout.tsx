"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import AthleteMobileNavigation from "@/components/mobile/athlete-mobile-navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, Settings, Search, LogOut, Bell, ChevronDown, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"

interface AthleteDashboardMobileLayoutProps {
  children: React.ReactNode
  currentPath: string
  showBottomNav?: boolean
  unreadNotifications?: number
  unreadMessages?: number
  hasNewContent?: boolean
}

export default function AthleteDashboardMobileLayout({
  children,
  currentPath,
  showBottomNav = true,
  unreadNotifications = 0,
  unreadMessages = 0,
  hasNewContent = false,
}: AthleteDashboardMobileLayoutProps) {
  const pathname = usePathname()

  const isAthleteDashboard = useMemo(() => pathname === "/dashboard", [pathname])
  const isMemberDashboard = useMemo(() => pathname === "/member-dashboard", [pathname])
  const { logout, loadingState } = useUnifiedLogout()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header - Enhanced for better mobile UX */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo - Optimized for mobile */}
          <Link
            href="/home"
            className="flex items-center space-x-2 touch-target"
          >
            <div className="w-7 h-7 relative flex-shrink-0">
              <Image
                src="/prologue-main-logo.png"
                alt="PROLOGUE"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-base font-athletic font-bold text-gray-900 tracking-wider">PROLOGUE</span>
          </Link>

          {/* Right Actions - Improved spacing and touch targets */}
          <div className="flex items-center space-x-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="touch-target p-2 h-10 w-10"
              onClick={() => console.log("Search button clicked")}
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Notification Bell */}
            <Link href="/notifications" className="relative">
              <Button variant="ghost" size="sm" className="touch-target p-2 h-10 w-10 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    {unreadNotifications > 9 ? (
                      <span className="text-xs text-white font-bold">9+</span>
                    ) : (
                      <span className="text-xs text-white font-bold">{unreadNotifications}</span>
                    )}
                  </div>
                )}
              </Button>
            </Link>

            {/* User Dropdown - Enhanced for mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 p-2 touch-target h-10">
                  <div className="w-7 h-7 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                    <User className="w-full h-full text-gray-500 p-1" />
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mr-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/promote"
                    className="flex items-center w-full cursor-pointer py-3"
                  >
                    <TrendingUp className="h-4 w-4 mr-3" />
                    <span className="text-sm">Promote</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center w-full cursor-pointer py-3"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => { await logout(); }}
                  className="cursor-pointer py-3"
                  disabled={loadingState.isLoading}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="text-sm">{loadingState.isLoading ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      {/* Mobile Bottom Navigation - Enhanced for better UX */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <AthleteMobileNavigation
            currentPath={currentPath}
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
            hasNewContent={hasNewContent}
          />
        </div>
      )}
    </div>
  )
} 