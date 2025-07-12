"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Play, Eye, Clock, ThumbsUp, Share2, Bookmark, MoreVertical } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { getAthleteProfile, getMemberProfile } from "@/lib/firebase"
import React from "react"
import { AutoplayVideo } from "@/components/ui/autoplay-video"

interface VideoPageProps {
  params: {
    id: string
  }
}

export default function VideoPage({ params }: VideoPageProps) {
  const { isMobile } = useMobileDetection()
  // @ts-expect-error Next.js experimental params API
  const { id } = React.use(params)
  const [video, setVideo] = useState<any>(null)
  const [instructor, setInstructor] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true)
      const db = getFirestore()
      const videoRef = doc(db, "videos", id)
      const videoSnap = await getDoc(videoRef)
      if (videoSnap.exists()) {
        const videoData = { id: videoSnap.id, ...videoSnap.data() }
        setVideo(videoData)
        // Fetch instructor profile if authorId exists
        if (videoData.authorId) {
          let profile = await getAthleteProfile(videoData.authorId)
          if (!profile) {
            profile = await getMemberProfile(videoData.authorId)
          }
          setInstructor(profile)
        } else {
          setInstructor(null)
        }
      } else {
        setVideo(null)
        setInstructor(null)
      }
      setLoading(false)
    }
    fetchVideo()
  }, [id])

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num?.toString?.() ?? "0"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video not found</h2>
          <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
          <Link href="/content">
            <Button>Back to Content Library</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Library</span>
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleBookmark}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-blue-600" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-8`}>
          {/* Video Player and Details */}
          <div className={`${isMobile ? "col-span-1" : "col-span-2"} space-y-6`}>
            {/* Video Player */}
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <AutoplayVideo
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    controls={true}
                    autoplay={false}
                    muted={false}
                    playsInline={true}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Info */}
            <div className="space-y-6">
              {/* Title and Badges */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {video.category}
                  </Badge>
                  {video.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
                  {Array.isArray(video.tags) &&
                    video.tags.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                </div>
                <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900 mb-4`}>{video.title}</h1>
              </div>

              {/* Video Stats and Actions */}
              <div className="flex items-center justify-between py-4 border-y border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(video.views)} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{video.duration}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>{video.uploadedAt}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${isLiked ? "text-blue-600" : ""}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span>{formatNumber(video.likes + (isLiked ? 1 : 0))}</span>
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-700 leading-relaxed">{video.description}</p>
              </div>

              {/* Instructor Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={instructor?.avatar || "/placeholder.svg"} alt={instructor?.name || video.authorName} />
                                             <AvatarFallback>
                         {instructor?.name
                           .split(" ")
                           .map((n: string) => n[0])
                           .join("")}
                       </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{instructor?.name || video.authorName}</h3>
                        {instructor?.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{instructor?.title || video.authorTitle}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {formatNumber(
                          Number.parseInt(instructor?.subscribers?.replace("K", "000").replace(".", "")),
                        )}{" "}
                        subscribers
                      </p>
                      <p className="text-sm text-gray-700">{instructor?.bio}</p>
                    </div>

                    <Button
                      onClick={handleSubscribe}
                      className={`${isSubscribed ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 hover:bg-blue-700"} px-6`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          {!isMobile && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Videos</h3>
                  <div className="space-y-4">
                    {/* Assuming VIDEO_DATA is replaced by a similar structure or removed */}
                    {/* For now, we'll just show a placeholder or remove if not needed */}
                    {/* Example: If you had a list of related videos, you'd map over them here */}
                    {/* For now, we'll just show a placeholder */}
                    <p>Related videos feature coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Mobile Related Videos */}
        {isMobile && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Videos</h3>
                <div className="space-y-4">
                  {/* Assuming VIDEO_DATA is replaced by a similar structure or removed */}
                  {/* For now, we'll just show a placeholder or remove if not needed */}
                  {/* Example: If you had a list of related videos, you'd map over them here */}
                  {/* For now, we'll just show a placeholder */}
                  <p>Related videos feature coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 