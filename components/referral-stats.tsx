"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar } from "lucide-react"
import { getReferralStats } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

interface ReferralStatsProps {
  athleteId?: string
}

export function ReferralStats({ athleteId }: ReferralStatsProps) {
  const [stats, setStats] = useState<{
    totalReferrals: number
    lastReferralAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentUserId = athleteId || auth.currentUser?.uid
        if (!currentUserId) {
          setLoading(false)
          return
        }

        const referralStats = await getReferralStats(currentUserId)
        setStats(referralStats)
      } catch (error) {
        console.error("Error fetching referral stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [athleteId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Referral Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Referral Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Referrals</span>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            {stats.totalReferrals}
          </Badge>
        </div>
        
        {stats.lastReferralAt && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Last Referral</span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(stats.lastReferralAt).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {stats.totalReferrals === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              No referrals yet. Share your profile to start earning!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Your referral link: {typeof window !== 'undefined' ? `${window.location.origin}/${auth.currentUser?.displayName || 'yourname'}` : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 