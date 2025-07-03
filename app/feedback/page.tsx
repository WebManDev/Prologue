"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Search,
  TrendingUp,
  MessageSquare,
  Star,
  ThumbsUp,
  Filter,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Plus,
  Play,
  Send,
  Home,
  FileText,
  MessageCircle,
  Bell,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { AdvancedNotificationProvider } from "@/contexts/advanced-notification-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ThumbsDown } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"
import { LogoutNotification } from "@/components/ui/logout-notification"

// Static data to prevent recreation on every render
const QUICK_SEARCHES = [
  "Training Content Feedback",
  "Nutrition Video Reviews",
  "Workout Program Effectiveness",
  "Mental Performance Content",
  "Recruitment Advice Quality",
  "NIL Content Feedback",
  "Coaching Style Review",
  "Content Improvement Ideas",
]

const FEEDBACK_DATA = {
  requested: [
    {
      id: 1,
      subject: "Training Program Effectiveness",
      description: "How effective has my 12-week strength program been for you?",
      recipients: 45,
      responses: 32,
      avgRating: 4.6,
      timestamp: "2 days ago",
      status: "active",
      category: "Training Content",
      deadline: "Dec 15, 2024",
    },
    {
      id: 2,
      subject: "Nutrition Content Quality",
      description: "Please rate the quality and usefulness of my nutrition guidance videos.",
      recipients: 28,
      responses: 28,
      avgRating: 4.8,
      timestamp: "1 week ago",
      status: "completed",
      category: "Nutrition",
      deadline: "Dec 1, 2024",
    },
    {
      id: 3,
      subject: "Mental Performance Series",
      description: "Feedback on my mental performance and mindset content series.",
      recipients: 67,
      responses: 23,
      avgRating: 4.4,
      timestamp: "3 days ago",
      status: "active",
      category: "Mental Performance",
      deadline: "Dec 20, 2024",
    },
  ],
  given: [
    {
      id: 1,
      to: "Alex Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      content: "Great collaboration on the NIL content. Your insights were valuable.",
      timestamp: "1 week ago",
      status: "delivered",
      category: "Collaboration",
    },
    {
      id: 2,
      to: "Sarah Mitchell",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      content: "Excellent training methodology. Really helped improve my content structure.",
      timestamp: "2 weeks ago",
      status: "delivered",
      category: "Training",
    },
  ],
}

export default function FeedbackPage() {
  return (
    <AdvancedNotificationProvider>
      <FeedbackPageContent />
    </AdvancedNotificationProvider>
  )
}

function FeedbackPageContent() {
  const { isMobile, isTablet } = useMobileDetection();
  const { hasUnreadMessages } = useNotifications();
  const { logout, loadingState, retryLogout, cancelLogout } = useUnifiedLogout();

  // Platform feedback form state
  const [platformFeedbackType, setPlatformFeedbackType] = useState("");
  const [platformFeedbackTitle, setPlatformFeedbackTitle] = useState("");
  const [platformFeedbackMessage, setPlatformFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback completion state
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isCompletingFeedback, setIsCompletingFeedback] = useState(false);

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Mock video-based feedback requests data
  const feedbackRequests = [
    {
      id: 1,
      title: "Training Program Effectiveness",
      subtitle: "Watch my 12-week strength program overview and share your thoughts",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Training Content",
      status: "active",
      sentTo: 45,
      responses: 32,
      averageRating: 4.6,
      dueDate: "Dec 15, 2024",
      createdAt: "2 days ago",
      completed: false,
    },
    {
      id: 2,
      title: "Nutrition Content Quality",
      subtitle: "Review my latest nutrition guidance video series",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Nutrition",
      status: "completed",
      sentTo: 28,
      responses: 28,
      averageRating: 4.8,
      dueDate: "Dec 1, 2024",
      createdAt: "1 week ago",
      completed: true,
      userRating: 5,
      userComment: "Excellent content! Very helpful for my nutrition planning.",
    },
    {
      id: 3,
      title: "Mental Performance Series",
      subtitle: "Provide feedback on my mental performance and mindset content",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Mental Performance",
      status: "active",
      sentTo: 67,
      responses: 43,
      averageRating: 4.4,
      dueDate: "Dec 20, 2024",
      createdAt: "3 days ago",
      completed: false,
    },
  ];

  // Mock platform feedback history
  const platformFeedbackHistory = [
    {
      id: 1,
      type: "suggestion",
      title: "Improve analytics dashboard",
      message: "The analytics dashboard could show more detailed engagement metrics for content creators.",
      status: "resolved",
      date: "2024-01-15",
      response:
        "Thank you for your feedback! We've added more detailed analytics including engagement rates, watch time, and subscriber growth metrics.",
      rating: 5,
    },
    {
      id: 2,
      type: "bug",
      title: "Video upload issues",
      message: "Sometimes videos fail to upload when they're longer than 30 minutes.",
      status: "in-progress",
      date: "2024-01-10",
      response: "We're working on fixing this issue. A patch will be released in the next update.",
      rating: null,
    },
    {
      id: 3,
      type: "feature",
      title: "Bulk messaging feature",
      message: "It would be helpful to send messages to multiple subscribers at once.",
      status: "under-review",
      date: "2024-01-05",
      response: null,
      rating: null,
    },
  ];

  const handleSubmitPlatformFeedback = async () => {
    if (!platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage) {
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPlatformFeedbackType("");
    setPlatformFeedbackTitle("");
    setPlatformFeedbackMessage("");
    setIsSubmitting(false);
    alert("Platform feedback submitted successfully!");
  };

  const handleCompleteFeedback = async () => {
    if (!selectedFeedback || feedbackRating === 0) {
      return;
    }
    setIsCompletingFeedback(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSelectedFeedback(null);
    setFeedbackRating(0);
    setFeedbackComment("");
    setIsCompletingFeedback(false);
    alert("Feedback completed successfully!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under-review":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "under-review":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Main content UI from user-provided code
  const mainContent = (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback Center</h1>
            <p className="text-gray-600">Request feedback from subscribers and give testimonials</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">All feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">From subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
                <p className="text-sm text-gray-600">Star rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">78%</p>
                <p className="text-sm text-gray-600">Response rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requested" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requested" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Requested (3)</span>
          </TabsTrigger>
          <TabsTrigger value="given" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Given (2)</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Platform Feedback</span>
          </TabsTrigger>
        </TabsList>

        {/* Requested Feedback Tab */}
        <TabsContent value="requested" className="space-y-6">
          <div className="space-y-6">
            {feedbackRequests.map((request) => {
              const videoId = getYouTubeVideoId(request.videoUrl);
              return (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          {getRequestStatusBadge(request.status)}
                          <Badge variant="outline" className="text-xs">
                            {request.category}
                          </Badge>
                          {request.completed && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{request.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-2">{request.createdAt}</p>
                      </div>
                    </div>
                    {/* Embedded Video Player */}
                    <div className="mb-6">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {videoId ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={request.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Video not available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Show completed feedback */}
                    {request.completed && request.userRating && (
                      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Your Feedback</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < request.userRating! ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({request.userRating}/5)</span>
                        </div>
                        {request.userComment && <p className="text-sm text-gray-700 mt-2">{request.userComment}</p>}
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      {!request.completed ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => setSelectedFeedback(request)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Complete Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Complete Feedback</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">{selectedFeedback?.title}</h4>
                                <p className="text-sm text-gray-600">{selectedFeedback?.subtitle}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Rate this content
                                </Label>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                      key={rating}
                                      onClick={() => setFeedbackRating(rating)}
                                      className="p-1 hover:scale-110 transition-transform"
                                    >
                                      <Star
                                        className={`h-6 w-6 ${rating <= feedbackRating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-200"}`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="feedback-comment" className="text-sm font-medium text-gray-700 mb-2 block">
                                  Additional Comments (Optional)
                                </Label>
                                <Textarea
                                  id="feedback-comment"
                                  value={feedbackComment}
                                  onChange={(e) => setFeedbackComment(e.target.value)}
                                  placeholder="Share your thoughts about this content..."
                                  rows={4}
                                />
                              </div>
                              <Button
                                onClick={handleCompleteFeedback}
                                disabled={feedbackRating === 0 || isCompletingFeedback}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isCompletingFeedback ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Feedback
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="outline" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Feedback Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        {/* Given Feedback Tab */}
        <TabsContent value="given" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback given yet</h3>
              <p className="text-gray-600">Feedback you've given to other creators will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Platform Feedback Tab */}
        <TabsContent value="platform" className="space-y-6">
          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
              <TabsTrigger value="history">Feedback History</TabsTrigger>
            </TabsList>
            {/* Submit Platform Feedback */}
            <TabsContent value="submit">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Platform Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="platform-feedback-type">Feedback Type</Label>
                    <Select value={platformFeedbackType} onValueChange={setPlatformFeedbackType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="compliment">Compliment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="platform-feedback-title">Title</Label>
                    <Input
                      id="platform-feedback-title"
                      value={platformFeedbackTitle}
                      onChange={(e) => setPlatformFeedbackTitle(e.target.value)}
                      placeholder="Brief description of your feedback"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform-feedback-message">Message</Label>
                    <Textarea
                      id="platform-feedback-message"
                      value={platformFeedbackMessage}
                      onChange={(e) => setPlatformFeedbackMessage(e.target.value)}
                      placeholder="Please provide detailed feedback..."
                      rows={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">{platformFeedbackMessage.length}/1000 characters</p>
                  </div>
                  <Button
                    onClick={handleSubmitPlatformFeedback}
                    disabled={
                      !platformFeedbackType || !platformFeedbackTitle || !platformFeedbackMessage || isSubmitting
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Platform Feedback History */}
            <TabsContent value="history">
              <div className="space-y-4">
                {platformFeedbackHistory.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                            <Badge variant="secondary" className={getStatusColor(feedback.status)}>
                              {getStatusIcon(feedback.status)}
                              <span className="ml-1 capitalize">{feedback.status.replace("-", " ")}</span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{feedback.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Type: {feedback.type}</span>
                            <span>•</span>
                            <span>{feedback.date}</span>
                          </div>
                        </div>
                      </div>
                      {feedback.response && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-600 mb-1">PROLOGUE Team Response</h4>
                              <p className="text-gray-800">{feedback.response}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {feedback.status === "resolved" && feedback.rating && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Your rating:</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < feedback.rating! ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {feedback.status === "resolved" && !feedback.rating && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">How satisfied are you with the resolution?</span>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Satisfied
                              </Button>
                              <Button variant="outline" size="sm">
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Not Satisfied
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {platformFeedbackHistory.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback submitted yet</h3>
                      <p className="text-gray-600">Your feedback history will appear here once you submit feedback.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </main>
  );

  // Top-level conditional rendering
  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/feedback"
        showBottomNav={true}
        unreadNotifications={hasUnreadMessages ? 1 : 0}
        unreadMessages={0}
        hasNewContent={false}
      >
        {mainContent}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DesktopHeader from athleteDashboard/content page */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                  <Image
                    src="/prologue-logo.png"
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
              {/* Memoized search component to prevent re-renders (adapted from athleteDashboard) */}
              {/* This part of the code was not provided in the edit_specification,
                  so it's kept as is, but the searchRef and searchInputRef are removed
                  as they are not defined in the new_code. */}
              {/* <div className="flex items-center space-x-1 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    className="w-80 pl-10 pr-10 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {SearchDropdown}
              </div> */}
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link href="/home" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group">
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-medium">Home</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/content" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Content</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/feedback" className="flex flex-col items-center space-y-1 text-blue-600 group">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Feedback</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/messaging" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors group">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Messages</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link href="/notifications" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-500 transition-colors relative group">
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                  <div className="w-full h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {hasUnreadMessages && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                </Link>
              </nav>
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 p-2"
                      disabled={loadingState.isLoading}
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                        <User className="w-full h-full text-gray-500 p-1" />
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/athleteDashboard" className="flex items-center w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/promote" className="flex items-center w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Promote
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/athlete-settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer"
                      disabled={loadingState.isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {loadingState.isLoading ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
      {mainContent}
      <LogoutNotification
        isVisible={loadingState.isVisible}
        userType={loadingState.userType}
        stage={loadingState.stage}
        message={loadingState.message}
        error={loadingState.error}
        canRetry={loadingState.canRetry}
        onRetry={retryLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
} 