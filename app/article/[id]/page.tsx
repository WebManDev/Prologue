"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Clock,
  Eye,
  Star,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  User,
  Calendar,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

// Static articles fallback (same structure as in app/content/page.tsx)
const STATIC_ARTICLES: Record<string, any> = {
  "1": {
    id: "1",
    title: "The Complete Guide to College Recruitment",
    subtitle: "Everything you need to know about navigating the college recruitment process as a student-athlete",
    content: `...`, // (Omitted for brevity, copy from your static data)
    author: {
      name: "Coach Michael Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Former D1 Recruiter & Athletic Director",
      bio: "20+ years experience in college athletics recruitment",
    },
    category: "Recruitment",
    readTime: "8 min read",
    views: 3200,
    rating: 4.9,
    publishedAt: "2024-01-15",
    tags: ["College", "Recruitment", "Student-Athletes", "NCAA"],
    relatedArticles: [
      {
        id: "2",
        title: "Building Your Athletic Brand on Social Media",
        category: "NIL",
        readTime: "6 min read",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Building Your Athletic Brand on Social Media",
    subtitle: "A comprehensive guide to creating and maintaining a professional athletic presence online",
    content: `...`, // (Omitted for brevity, copy from your static data)
    author: {
      name: "Sarah Martinez",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Digital Marketing Specialist & Former D1 Athlete",
      bio: "Helping athletes build powerful personal brands",
    },
    category: "NIL",
    readTime: "6 min read",
    views: 1800,
    rating: 4.6,
    publishedAt: "2024-01-10",
    tags: ["Social Media", "Branding", "NIL", "Marketing"],
    relatedArticles: [
      {
        id: "1",
        title: "The Complete Guide to College Recruitment",
        category: "Recruitment",
        readTime: "8 min read",
      },
    ],
  },
}

export default function ArticlePage() {
  const { isMobile, isTablet } = useMobileDetection()
  const params = useParams() || {}
  const articleId = (params.id as string) || ""

  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true)
      // Try Firestore first
      try {
        const docRef = doc(db, "articles", articleId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setArticle({
            id: articleId,
            title: data.title,
            content: data.description || data.content || "",
            author: {
              name: data.authorName || "Unknown Author",
              avatar: data.authorAvatar || "/placeholder.svg?height=40&width=40",
              title: data.authorTitle || "",
              bio: data.authorBio || "",
            },
            category: data.category || "",
            readTime: data.readTime || "1 min read",
            views: data.views || 0,
            rating: data.rating || 0,
            publishedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : "",
            tags: data.tags || [],
            relatedArticles: [], // Optionally implement
            coverImage: data.coverImage || null,
          })
        } else {
          setArticle(STATIC_ARTICLES[articleId as string])
        }
      } catch (e) {
        setArticle(STATIC_ARTICLES[articleId as string])
      }
      setLoading(false)
    }
    fetchArticle()
    // Simulate random like count for demo
    setLikeCount(Math.floor(Math.random() * 100) + 50)
  }, [articleId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500 text-lg">Loading article...</span>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Link href="/content">
            <Button>Back to Content</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.subtitle,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const ArticleContent = (
    <div className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-4xl mx-auto px-6 py-8"}`}>
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/content">
          <Button variant="ghost" className="flex items-center space-x-2 p-0 h-auto">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Content</span>
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Hero Section */}
        {article.coverImage ? (
          <div className="relative h-64 md:h-80">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="bg-white/20 text-white border-white/30 mb-3">{article.category}</Badge>
              <h1 className={`${isMobile ? "text-2xl" : "text-4xl"} font-bold text-white mb-2 leading-tight`}>
                {article.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="bg-white/20 text-white border-white/30 mb-3">{article.category}</Badge>
              <h1 className={`${isMobile ? "text-2xl" : "text-4xl"} font-bold text-white mb-2 leading-tight`}>
                {article.title}
              </h1>
            </div>
          </div>
        )}

        {/* Article Meta */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={article.author.avatar || "/placeholder.svg"} alt={article.author.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{article.author.name}</h3>
                <p className="text-sm text-gray-600">{article.author.title}</p>
              </div>
            </div>

            {!isMobile && (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-gray-600"}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{likeCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`${isBookmarked ? "text-blue-500" : "text-gray-600"}`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-600">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Article Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{article.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{article.rating}</span>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          {isMobile && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-gray-600"}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`${isBookmarked ? "text-blue-500" : "text-gray-600"}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-600">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="p-6">
          {article.subtitle && (
            <p className={`${isMobile ? "text-base" : "text-lg"} text-gray-700 mb-6`}>{article.subtitle}</p>
          )}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-blue-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Tags */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={article.author.avatar || "/placeholder.svg"} alt={article.author.name} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{article.author.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{article.author.title}</p>
              <p className="text-sm text-gray-700">{article.author.bio}</p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h3>
          <div className="grid gap-4">
            {article.relatedArticles.map((related: any) => (
              <Link key={related.id} href={`/article/${related.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2">
                          {related.category}
                        </Badge>
                        <h4 className="font-semibold text-gray-900 mb-1">{related.title}</h4>
                        <p className="text-sm text-gray-600">{related.readTime}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-gray-400 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/content"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={0}
        hasNewContent={false}
      >
        {ArticleContent}
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/content" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                <Image
                  src="/prologue-main-logo.png"
                  alt="PROLOGUE"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                PROLOGUE
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </Button>
            </div>
          </div>
        </div>
      </header>

      {ArticleContent}
    </div>
  )
} 