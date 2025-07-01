"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Share2,
  Trophy,
  Bell,
  DollarSign,
  FileText,
  User,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Reply,
  CheckCircle,
  Star,
  Crown,
  Zap,
  EyeOff,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/contexts/advanced-notification-context"

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onDelete: (id: string) => void
  onPerformAction: (notificationId: string, actionId: string) => void
  showDismissButton?: boolean
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDismiss,
  onDelete,
  onPerformAction,
  showDismissButton = true,
}: NotificationCardProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />
      case "mention":
        return <AtSign className="h-5 w-5 text-purple-500" />
      case "share":
        return <Share2 className="h-5 w-5 text-orange-500" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-600" />
      case "content":
        return <FileText className="h-5 w-5 text-indigo-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "elite":
        return <Crown className="h-3 w-3 text-purple-500" />
      case "pro":
        return <Star className="h-3 w-3 text-blue-500" />
      case "basic":
        return <Zap className="h-3 w-3 text-gray-500" />
      default:
        return null
    }
  }

  const formatTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Recently"
    }
  }

  const handleActionClick = (e: React.MouseEvent, actionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      onPerformAction(notification.id, actionId)
    } catch (error) {
      console.error("Error performing action:", error)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      if (!notification.read) {
        onMarkAsRead(notification.id)
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      onDismiss(notification.id)
    } catch (error) {
      console.error("Error dismissing notification:", error)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      onDelete(notification.id)
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      onMarkAsRead(notification.id)
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  // Determine card styling based on read/dismissed status
  const getCardStyling = () => {
    if (notification.dismissed) {
      return "opacity-60 bg-gray-50" // Dimmed for dismissed notifications
    }
    if (!notification.read) {
      return "bg-blue-50/30" // Highlighted for unread
    }
    return "bg-white" // Normal for read notifications
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md border-l-4 cursor-pointer ${getPriorityBorder(notification.priority)} ${getCardStyling()}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Notification Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* User Info */}
                {notification.user && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                      {notification.user.avatar ? (
                        <img
                          src={notification.user.avatar || "/placeholder.svg"}
                          alt={notification.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-full h-full text-gray-400 p-1" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900">{notification.user.name}</span>
                      {notification.user.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      {getTierBadge(notification.user.tier)}
                    </div>
                    <span className="text-xs text-gray-500">@{notification.user.username}</span>
                  </div>
                )}

                {/* Multiple Users */}
                {notification.users && notification.users.length > 1 && (
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex -space-x-2">
                      {notification.users.slice(0, 3).map((user, index) => (
                        <div key={user.id} className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white">
                          <User className="w-full h-full text-gray-400 p-0.5" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {notification.users[0].name}
                      {notification.users.length > 1 && ` and ${notification.users.length - 1} others`}
                    </span>
                  </div>
                )}

                {/* Title and Message */}
                <h4
                  className={`font-semibold mb-1 ${!notification.read && !notification.dismissed ? "text-gray-900" : "text-gray-700"}`}
                >
                  {notification.title}
                </h4>
                <p
                  className={`text-sm mb-2 ${!notification.read && !notification.dismissed ? "text-gray-700" : "text-gray-600"}`}
                >
                  {notification.message}
                </p>

                {/* Content Preview */}
                {notification.content && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                    {notification.content.thumbnail && (
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={notification.content.thumbnail || "/placeholder.svg"}
                          alt="Content preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.content.preview}</p>
                      <p className="text-xs text-gray-500 capitalize">{notification.content.type}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {notification.metadata && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    {notification.metadata.count && (
                      <span className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{notification.metadata.count} likes</span>
                      </span>
                    )}
                    {notification.metadata.amount && (
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${notification.metadata.amount}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Actions - Only show if not dismissed */}
                {!notification.dismissed && notification.actions && notification.actions.length > 0 && (
                  <div className="flex items-center space-x-2 mb-2">
                    {notification.actions.map((action) => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant={action.primary ? "default" : "outline"}
                        onClick={(e) => handleActionClick(e, action.id)}
                        className={`h-8 text-xs ${action.primary ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      >
                        {action.type === "like" && <Heart className="h-3 w-3 mr-1" />}
                        {action.type === "follow" && <UserPlus className="h-3 w-3 mr-1" />}
                        {action.type === "reply" && <Reply className="h-3 w-3 mr-1" />}
                        {action.type === "share" && <Share2 className="h-3 w-3 mr-1" />}
                        {action.type === "view" && <Eye className="h-3 w-3 mr-1" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Timestamp and Category */}
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{formatTimeAgo(notification.timestamp)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {notification.category}
                  </Badge>
                  {notification.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">
                      High Priority
                    </Badge>
                  )}
                  {notification.dismissed && (
                    <Badge variant="outline" className="text-xs text-gray-400">
                      Dismissed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <div className="flex items-center space-x-1 ml-2">
                {!notification.read && !notification.dismissed && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                {showDismissButton && !notification.dismissed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={handleDismiss}
                    title="Dismiss notification"
                  >
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!notification.read && (
                      <DropdownMenuItem onClick={handleMarkAsRead}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    {!notification.dismissed && (
                      <DropdownMenuItem onClick={handleDismiss}>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Dismiss
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 