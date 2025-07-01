"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, GraduationCap, Trophy, Users, MessageCircle, Heart, Share2, Clock } from "lucide-react"
import type { ProfileData } from "./profile-editor"

interface SidebarProps {
  profileData: ProfileData
}

export default function Sidebar({ profileData }: SidebarProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Quick Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Quick Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{profileData.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <GraduationCap className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{profileData.school}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Class of {profileData.graduationYear}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Trophy className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{profileData.experience} experience</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-600">{profileData.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Phone</p>
            <p className="text-sm text-gray-600">{profileData.phone}</p>
          </div>
          <div className="pt-2">
            <Button size="sm" className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: "content",
                action: "Published new training video",
                time: "2 hours ago",
                icon: Trophy,
              },
              {
                type: "interaction",
                action: "Received 15 new subscribers",
                time: "5 hours ago",
                icon: Users,
              },
              {
                type: "engagement",
                action: "Content liked 42 times",
                time: "1 day ago",
                icon: Heart,
              },
              {
                type: "share",
                action: "Training tips shared 8 times",
                time: "2 days ago",
                icon: Share2,
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <activity.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sport & Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Sport Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Primary Sport</span>
            <Badge variant="secondary">{profileData.sport}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Position</span>
            <Badge variant="outline">{profileData.position}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 