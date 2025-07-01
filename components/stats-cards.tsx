"use client"

import { Card } from "@/components/ui/card"
import { Users, Clock, Activity, Star } from "lucide-react"

const coachingStats = {
  totalAthletes: 24,
  thisWeek: 12,
  totalSessions: 342,
  avgRating: 4.9,
}

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
      <Card className="p-3 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">Total Athletes</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{coachingStats.totalAthletes}</p>
          </div>
          <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-3 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">This Week</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{coachingStats.thisWeek}</p>
          </div>
          <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-3 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{coachingStats.totalSessions}</p>
          </div>
          <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-3 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">Avg Rating</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{coachingStats.avgRating}</p>
          </div>
          <Star className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-500" />
        </div>
      </Card>
    </div>
  )
} 