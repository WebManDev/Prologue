"use client"
import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  User,
  Star,
  MapPin,
  Users,
  ArrowLeft,
  Crown,
  Zap,
  UserPlus,
  UserCheck,
  CheckCircle,
  Trophy,
  Award,
  Target,
  MessageCircle,
  Share2,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Verified,
  Languages,
} from "lucide-react"
import Link from "next/link"
import { useMemberSubscriptions } from "@/contexts/member-subscription-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CREATORS } from "@/lib/creators"

export default function AthleteProfilePage() {
  const params = useParams() || {}
  const athleteId = (params.id as string) || ""
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount } = useMemberNotifications()
  const { isFollowing, isSubscribed, followCreator, unfollowCreator, subscribeToCreator, unsubscribeFromCreator } =
    useMemberSubscriptions()
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [athlete, setAthlete] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAthlete() {
      // First, check static creators
      const staticAthlete = CREATORS.find((a) => a.id === athleteId)
      if (staticAthlete) {
        setAthlete(staticAthlete)
        setLoading(false)
        return
      }
      // Otherwise, fetch from Firebase
      try {
        const docRef = doc(db, "athletes", athleteId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setAthlete({ id: docSnap.id, ...docSnap.data() })
        } else {
          setAthlete(null)
        }
      } catch (e) {
        setAthlete(null)
      }
      setLoading(false)
    }
    if (athleteId) {
      setLoading(true)
      fetchAthlete()
    }
  }, [athleteId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Athlete Not Found</h1>
          <p className="text-gray-600 mb-6">The athlete you're looking for doesn't exist.</p>
          <Link href="/member-browse">
            <Button className="bg-prologue-electric hover:bg-prologue-blue text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleFollowToggle = () => {
    if (isFollowing(athlete.id)) {
      unfollowCreator(athlete.id)
    } else {
      followCreator(athlete)
    }
  }

  const handleSubscribeClick = () => {
    setSubscriptionDialogOpen(true)
  }

  const handleConfirmSubscription = () => {
    subscribeToCreator(athlete)
    setSubscriptionDialogOpen(false)
  }

  const handleUnsubscribe = () => {
    unsubscribeFromCreator(athlete.id)
  }

  const MainContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <Link href="/member-browse">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Cover Image */}
        <div className="relative h-48 lg:h-64 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center space-x-3">
              <Badge className="bg-prologue-electric text-white">{athlete.sport}</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {athlete.type}
              </Badge>
              {athlete.isVerified && (
                <Badge className="bg-green-500 text-white">
                  <Verified className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
            {/* Avatar and Actions */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden border-4 border-white -mt-16 relative z-10">
                  <User className="w-full h-full text-gray-400 p-8" />
                </div>
                {athlete.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-prologue-electric rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full space-y-3">
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing(athlete.id) ? "secondary" : "outline"}
                  className={`w-full transition-all duration-200 ${
                    isFollowing(athlete.id)
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "hover:bg-prologue-electric hover:text-white border-prologue-electric text-prologue-electric"
                  }`}
                >
                  {isFollowing(athlete.id) ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>

                {isSubscribed(athlete.id) ? (
                  <Button
                    onClick={handleUnsubscribe}
                    className="w-full transition-all duration-200 bg-prologue-fire text-white hover:bg-prologue-fire/90"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribed
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubscribeClick}
                    className="w-full transition-all duration-200 bg-prologue-electric hover:bg-prologue-blue text-white"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Subscribe ${athlete.subscriptionPrice}/mo
                  </Button>
                )}

                <Button variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>

                <Button variant="outline" className="w-full bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{athlete.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{athlete.rating}</span>
                    <span className="text-gray-500">({athlete.totalStudents} students)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{athlete.followers} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{athlete.location}</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">{athlete.bio}</p>

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-semibold text-gray-900">Specialty:</span>
                    <span className="ml-2 text-prologue-electric font-medium">{athlete.specialty}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Experience:</span>
                    <span className="ml-2 text-gray-700">{athlete.experience}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Response Rate:</span>
                    <span className="ml-2 text-green-600 font-medium">{athlete.responseRate}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Languages:</span>
                    <div className="inline-flex flex-wrap gap-1 ml-2">
                      {Array.isArray(athlete.languages) && athlete.languages.length > 0 ? (
                        athlete.languages.map((language: string) => (
                          <Badge key={language} variant="outline" className="text-xs">
                            <Languages className="h-3 w-3 mr-1" />
                            {language}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-prologue-electric">
                    {athlete.stats?.totalContent ?? "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Content</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-prologue-electric">
                    {athlete.stats?.totalViews ?? "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-prologue-electric">
                    {athlete.stats?.totalHoursCoached ?? "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Hours Coached</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-prologue-electric">{athlete.stats?.successStories ?? "N/A"}</div>
                  <div className="text-sm text-gray-600">Success Stories</div>
                </div>
              </div>

              {/* Connect Section */}
              {athlete.socialMedia && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Connect</h4>
                  <div className="flex flex-wrap gap-3">
                    {athlete.socialMedia.instagram && (
                      <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                        <Instagram className="h-4 w-4" />
                        <span>Instagram</span>
                      </Button>
                    )}
                    {athlete.socialMedia.twitter && (
                      <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                        <Twitter className="h-4 w-4" />
                        <span>Twitter</span>
                      </Button>
                    )}
                    {athlete.socialMedia.youtube && (
                      <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                        <Youtube className="h-4 w-4" />
                        <span>YouTube</span>
                      </Button>
                    )}
                    {athlete.socialMedia.website && (
                      <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(athlete.achievements) && athlete.achievements.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                      {athlete.achievements.slice(0, 2).map((achievement: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 px-2 py-1"
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                      {athlete.achievements.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{athlete.achievements.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Achievements</h4>
                    <span className="text-xs text-gray-500">N/A</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-prologue-electric" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Student Satisfaction</span>
                <span className="font-semibold text-green-600">{athlete.stats?.studentSatisfaction ?? "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold text-blue-600">
                  {athlete.stats?.completionRate ?? "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Session</span>
                <span className="font-semibold text-gray-900">{athlete.stats?.avgSessionLength ?? "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Students</span>
                <span className="font-semibold text-prologue-electric">{athlete.stats?.monthlyActiveStudents ?? "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {athlete.stats?.avgRating ?? "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Subscribe to {athlete.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
                <User className="w-full h-full text-gray-500 p-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{athlete.name}</h3>
              <p className="text-gray-600">
                {athlete.sport} • {athlete.specialty}
              </p>
            </div>

            <div className="bg-gradient-to-r from-prologue-electric to-prologue-blue text-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">${athlete.subscriptionPrice}</div>
              <div className="text-blue-100">per month</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Access to all premium content</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Direct messaging with athlete</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Personalized training plans</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support and feedback</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setSubscriptionDialogOpen(false)}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubscription}
                className="flex-1 bg-prologue-electric hover:bg-prologue-blue text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath={`/athlete/${athleteId}`}
        showBottomNav={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={false}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return <MainContent />
}
