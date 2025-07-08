"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Eye, Clock, ThumbsUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import React from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { db, getAthleteProfile } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface VideoPageProps {
  params: {
    id: string
  }
}

// Utility to allow only <b>, <strong>, <i>, <em> tags in HTML
function sanitizeDescription(html: string) {
  if (!html) return "";
  // Remove all tags except <b>, <strong>, <i>, <em>
  return html
    .replace(/<(?!\/?(b|strong|i|em)\b)[^>]*>/gi, "")
    .replace(/<\/?(script|style)[^>]*>/gi, "");
}

export default function VideoPage({ params }: VideoPageProps) {
  const { isMobile } = useMobileDetection()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  // @ts-expect-error Next.js experimental params API
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true)
      const videoRef = doc(db, "videos", id)
      const videoSnap = await getDoc(videoRef)
      if (videoSnap.exists()) {
        const videoData: any = { id: videoSnap.id, ...videoSnap.data() }
        setVideo(videoData)
        // Fetch instructor profile
        if (videoData.authorId) {
          const profile = await getAthleteProfile(videoData.authorId)
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/content">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`${isMobile ? "p-4" : "max-w-4xl mx-auto px-4 py-6"}`}>
        <div className="space-y-6">
          {/* Video Player */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video">
                {/* If videoUrl is a YouTube embed, use iframe. Otherwise, use video tag. */}
                {video.videoUrl && video.videoUrl.includes("youtube.com") ? (
                  <iframe src={video.videoUrl} title={video.title} className="w-full h-full rounded-lg" allowFullScreen />
                ) : (
                  <video src={video.videoUrl} controls className="w-full h-full rounded-lg" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {video.category && <Badge variant="outline">{video.category}</Badge>}
                {Array.isArray(video.tags) && video.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900 mb-4`}>{video.title}</h2>
              <p
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeDescription(video.description) }}
              />
            </div>

            {/* Video Stats (Read-only) */}
            <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.views?.toLocaleString?.() ?? video.views ?? 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>
                    {video.rating} ({video.totalRatings ?? 0} ratings)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{video.likes ?? 0} likes</span>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Image
                    src={instructor?.profilePicture || instructor?.profileImageUrl || "/placeholder.svg"}
                    alt={instructor?.firstName || "Instructor"}
                    width={60}
                    height={60}
                    className="rounded-full w-[60px] h-[60px] object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown"}</h3>
                    <p className="text-sm text-gray-600 mb-2">Athlete</p>
                    <p className="text-sm text-gray-700">{instructor?.bio || ""}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 