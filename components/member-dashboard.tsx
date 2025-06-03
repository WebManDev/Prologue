"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Play,
  Target,
  Star,
  Video,
  TrendingUp,
  Search,
  Users,
  MessageSquare,
  Plus,
  Eye,
  Lock,
  FileText,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { MemberMessagingInterface } from "./member-messaging-interface"
import { SubscriptionCheckout } from "./subscription-checkout"
import { signOut, auth, getMemberProfile, getAllAthletes, getAthletesByIds, rateAthlete } from "@/lib/firebase"
import { getFirestore, collection, query, where, getDocs, Timestamp, orderBy, onSnapshot } from "firebase/firestore"

interface MemberDashboardProps {
  onLogout: () => void
}

interface MemberProfile {
  name: string;
  email: string;
  sport: string;
  role: string;
  subscriptions: any[];
  savedContent: any[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
  };
}

function formatDate(ts: any) {
  if (!ts) return "";
  if (typeof ts === "string") return new Date(ts).toLocaleDateString();
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  return "";
}

export function MemberDashboard({ onLogout }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewingCourse, setViewingCourse] = useState<any>(null)
  const [messagingCoach, setMessagingCoach] = useState<any>(null)
  const [viewingAthleteProfile, setViewingAthleteProfile] = useState<any>(null)
  const [showSubscriptionCheckout, setShowSubscriptionCheckout] = useState<any>(null)
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableAthletes, setAvailableAthletes] = useState<any[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [subscribedAthletes, setSubscribedAthletes] = useState<any[]>([]);
  const [loadingSubscribed, setLoadingSubscribed] = useState(true);
  const [feedbackRequests, setFeedbackRequests] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedExpanded, setFeedExpanded] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          const profileData = await getMemberProfile(auth.currentUser.uid);
          setProfile(profileData as MemberProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const athletes = await getAllAthletes();
        setAvailableAthletes(athletes);
      } catch (error) {
        setAvailableAthletes([]);
      } finally {
        setLoadingAthletes(false);
      }
    };
    fetchAthletes();
  }, []);

  useEffect(() => {
    async function fetchSubscribedAthletes() {
      if (!auth.currentUser) return;
      const profileData = await getMemberProfile(auth.currentUser.uid);
      const subscriptions = profileData?.subscriptions || [];
      if (subscriptions.length === 0) {
        setSubscribedAthletes([]);
        setLoadingSubscribed(false);
        return;
      }
      const athletes = await getAthletesByIds(subscriptions);
      setSubscribedAthletes(athletes);
      setLoadingSubscribed(false);
    }
    fetchSubscribedAthletes();
  }, [profile]);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoadingFeedback(true);
    const db = getFirestore();
    const requestsQuery = query(
      collection(db, "videoFeedbackRequests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setFeedbackRequests(requests);
      setLoadingFeedback(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshSubscribedAthletes = async () => {
    if (!auth.currentUser) return;
    const profileData = await getMemberProfile(auth.currentUser.uid);
    const subscriptions = profileData?.subscriptions || [];
    if (subscriptions.length === 0) {
      setSubscribedAthletes([]);
      setLoadingSubscribed(false);
      return;
    }
    const athletes = await getAthletesByIds(subscriptions);
    setSubscribedAthletes(athletes);
    setLoadingSubscribed(false);
  };

  const subscribedIds = new Set(subscribedAthletes.map((a) => a.id));
  const filteredAthletes = availableAthletes.filter(
    (athlete) =>
      (athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        athlete.sport.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !subscribedIds.has(athlete.id)
  );

  const handleSubscribe = (athlete: any) => {
    setShowSubscriptionCheckout(athlete)
  }

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionCheckout(null)
    // In real app, refresh subscribed athletes list
    alert("Successfully subscribed! You now have access to all content.")
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleViewAthleteProfile = async (athlete: any) => {
    // Check if the user is subscribed to this athlete
    const isSubscribed = subscribedAthletes.some((sub) => sub.id === athlete.id);
    if (isSubscribed) {
      // Fetch posts for this athlete
      const postsQuery = query(collection(db, "athletePosts"), where("userId", "==", athlete.id));
      const postsSnap = await getDocs(postsQuery);
      const posts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setViewingAthleteProfile({ ...athlete, recentPosts: posts });
    } else {
      setViewingAthleteProfile(athlete);
    }
  };

  function StarDisplay({ value }: { value: number }) {
    return (
      <div className="flex items-center space-x-1">
        {[1,2,3,4,5].map((star) => (
          <Star key={star} className={`h-5 w-5 ${value >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading profile. Please try again.</p>
          <Button onClick={handleLogout} className="mt-4">Logout</Button>
        </div>
      </div>
    );
  }

  // Show subscription checkout
  if (showSubscriptionCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SubscriptionCheckout
          athlete={showSubscriptionCheckout}
          memberEmail={profile.email}
          memberName={profile.name}
          onSuccess={async () => {
            await refreshSubscribedAthletes();
            setShowSubscriptionCheckout(null);
            alert("Successfully subscribed! You now have access to all content.");
          }}
          onCancel={() => setShowSubscriptionCheckout(null)}
        />
      </div>
    )
  }

  // Show athlete profile if viewing one
  if (viewingAthleteProfile) {
    return (
      <AthleteProfileView
        athlete={viewingAthleteProfile}
        isSubscribed={subscribedAthletes.some((sub) => sub.id === viewingAthleteProfile.id)}
        onBack={() => setViewingAthleteProfile(null)}
        onMessage={setMessagingCoach}
        onSubscribe={handleSubscribe}
      />
    )
  }

  // Show messaging interface
  if (messagingCoach) {
    return <MemberMessagingInterface coach={messagingCoach} onBack={() => setMessagingCoach(null)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`transition-colors ${activeTab === "dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("athletes")}
              className={`transition-colors ${activeTab === "athletes" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              My Athletes
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`transition-colors ${activeTab === "discover" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`transition-colors ${activeTab === "messages" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              Messages
            </button>
          </nav>

          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard">
            {feedExpanded ? (
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4 mt-8">
                  <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
                  <Button variant="outline" size="sm" onClick={() => setFeedExpanded(false)}>
                    Collapse Feed
                  </Button>
                </div>
                {[
                  {
                    id: "sample-1",
                    title: "How I Improved My Serve",
                    description: "Sharing my journey and tips for a better tennis serve.",
                    authorName: "Alex Kim",
                    authorAvatar: "/placeholder.svg?height=40&width=40",
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    content: "Practice, video analysis, and feedback from my coach made all the difference!",
                    likes: 12,
                    comments: 3,
                    views: 45,
                  },
                  {
                    id: "sample-2",
                    title: "Nutrition Tips for Swimmers",
                    description: "What I eat before and after practice.",
                    authorName: "Jamie Lee",
                    authorAvatar: "/placeholder.svg?height=40&width=40",
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    content: "Carbs before, protein after! Hydration is key.",
                    likes: 8,
                    comments: 2,
                    views: 30,
                  },
                ].map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
                          <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{post.title}</h3>
                        <p className="text-gray-600 mb-2">{post.description}</p>
                        <p className="text-gray-700">{post.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-500" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => setActiveTab("discover")}
                        className="h-20 bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center space-y-2"
                      >
                        <Plus className="h-6 w-6" />
                        <span>Find Athletes</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("athletes")}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Users className="h-6 w-6" />
                        <span>My Athletes</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("messages")}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <MessageSquare className="h-6 w-6" />
                        <span>Messages</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Row: Messages | My Feedback Requests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Messages Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span>Messages</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {subscribedAthletes.length === 0 ? (
                          <div className="text-gray-500 text-sm">No athletes to message yet.</div>
                        ) : (
                          subscribedAthletes.map((athlete) => (
                            <div key={athlete.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => setMessagingCoach(athlete)}>
                              <Image src={athlete.profilePic || "/placeholder.svg"} alt={athlete.name} width={32} height={32} className="rounded-full" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{athlete.name}</p>
                                <p className="text-xs text-gray-600">{athlete.sport}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* My Feedback Requests Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        <span>My Feedback Requests</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingFeedback ? (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <h3 className="text-base font-medium text-gray-900 mb-1">Loading feedback requests...</h3>
                        </div>
                      ) : feedbackRequests.length === 0 ? (
                        <div className="text-center py-6">
                          <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <h3 className="text-base font-medium text-gray-900 mb-1">No feedback requests yet</h3>
                          <p className="text-gray-600 text-xs">When you request video feedback, it will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {feedbackRequests.map((request) => (
                            <Card key={request.id} className="bg-gray-50">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-gray-900 text-sm">Video Feedback Request</span>
                                      <Badge variant={
                                        request.status === "pending_payment" ? "destructive" :
                                        request.status === "pending" ? "default" :
                                        request.status === "completed" ? "secondary" : "outline"
                                      }>
                                        {request.status === "pending_payment" ? "Payment Pending" :
                                         request.status === "pending" ? "Pending Review" :
                                         request.status === "completed" ? "Completed" : request.status}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-600 text-xs mb-1 line-clamp-2">{request.feedbackText}</p>
                                    {request.status === "completed" && (
                                      <div className="bg-green-50 p-2 rounded-lg border border-green-200 mt-1">
                                        <span className="font-medium text-green-700 text-xs">Coach's Feedback:</span>
                                        <p className="text-xs text-gray-700 mt-1">{request.response}</p>
                                        <div className="flex items-center mt-2">
                                          <span className="text-xs text-gray-600 mr-2">Rating:</span>
                                          {request.rating ? (
                                            <div className="flex items-center space-x-1">
                                              {[1,2,3,4,5].map((star) => (
                                                <Star key={star} className={`h-4 w-4 ${request.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                              ))}
                                              <span className="ml-1 text-xs text-gray-700">({request.rating})</span>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-gray-400">Not rated</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      {formatDate(request.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Community Feed Section below Quick Actions */}
                <div className={`space-y-4 mt-8 ${feedExpanded ? '' : 'mb-8'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
                    <Button variant="outline" size="sm" onClick={() => setFeedExpanded(f => !f)}>
                      {feedExpanded ? 'Collapse Feed' : 'Expand Feed'}
                    </Button>
                  </div>
                  {/* Example feed posts, replace with real data as needed */}
                  {[
                    {
                      id: "sample-1",
                      title: "How I Improved My Serve",
                      description: "Sharing my journey and tips for a better tennis serve.",
                      authorName: "Alex Kim",
                      authorAvatar: "/placeholder.svg?height=40&width=40",
                      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                      content: "Practice, video analysis, and feedback from my coach made all the difference!",
                      likes: 12,
                      comments: 3,
                      views: 45,
                    },
                    {
                      id: "sample-2",
                      title: "Nutrition Tips for Swimmers",
                      description: "What I eat before and after practice.",
                      authorName: "Jamie Lee",
                      authorAvatar: "/placeholder.svg?height=40&width=40",
                      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                      content: "Carbs before, protein after! Hydration is key.",
                      likes: 8,
                      comments: 2,
                      views: 30,
                    },
                  ].map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
                            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                          </div>
                        </div>
                        <div className="mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-gray-600 mb-2">{post.description}</p>
                          <p className="text-gray-700">{post.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Hide the rest of the dashboard widgets if feed is expanded */}
                {!feedExpanded && (
                  <>
                    {/* Latest Content from Subscribed Athletes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-blue-600" />
                            <span>Latest Exclusive Content</span>
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("athletes")}>
                            View All
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{subscribedAthletes.length}</div>
                            <div className="text-sm text-gray-600">Active Subscriptions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-500 mb-1">
                              {subscribedAthletes.reduce((sum, athlete) => sum + athlete.posts, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Content</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="athletes">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">My Athletes ({subscribedAthletes.length})</h1>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscribedAthletes.map((athlete) => (
                  <Card
                    key={athlete.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewAthleteProfile(athlete)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Image
                          src={athlete.profilePic || "/placeholder.svg"}
                          alt={athlete.name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{athlete.name}</h3>
                          <Badge variant="outline">{athlete.sport}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{athlete.bio}</p>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{athlete.subscribers}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Video className="h-4 w-4" />
                          <span>{athlete.posts} posts</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{athlete.rating}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="default" className="bg-green-600">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Subscribed
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {athlete.subscriptionStatus === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMessagingCoach(athlete)
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Athletes</h1>
                  <p className="text-gray-600">
                    Find expert athletes and coaches to subscribe to for exclusive content
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search athletes, sports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>

              {loadingAthletes ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading athletes...</h3>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAthletes.map((athlete) => (
                    <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Image
                            src={athlete.profilePicture || "/placeholder.svg"}
                            alt={athlete.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{athlete.name}</h3>
                            <Badge variant="outline">{athlete.sport}</Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{athlete.bio}</p>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{athlete.subscribers}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Video className="h-4 w-4" />
                            <span>{athlete.posts} posts</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{athlete.rating}</span>
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            onClick={() => handleSubscribe(athlete)}
                          >
                            Subscribe 
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewAthleteProfile(athlete)}>
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredAthletes.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No athletes found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              </div>

              <div className="grid gap-4">
                {subscribedAthletes.map((athlete) => (
                  <Card
                    key={athlete.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setMessagingCoach(athlete)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={athlete.profilePic || "/placeholder.svg"}
                            alt={athlete.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{athlete.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {athlete.sport}
                              </Badge>
                              <Badge variant="default" className="text-xs bg-green-600">
                                Subscribed
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">Click to start a conversation</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Athlete Profile View Component
function AthleteProfileView({
  athlete,
  isSubscribed,
  onBack,
  onMessage,
  onSubscribe,
}: {
  athlete: any
  isSubscribed: boolean
  onBack: () => void
  onMessage: (athlete: any) => void
  onSubscribe: (athlete: any) => void
}) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number>(athlete.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.currentUser && athlete.ratings && athlete.ratings[auth.currentUser.uid]) {
      setUserRating(athlete.ratings[auth.currentUser.uid]);
    }
    setAvgRating(athlete.rating || 0);
  }, [athlete]);

  const handleRate = async (rating: number) => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    await rateAthlete(athlete.id, auth.currentUser.uid, rating);
    setUserRating(rating);
    // Optimistically update UI
    const ratings = { ...(athlete.ratings || {}), [auth.currentUser.uid]: rating };
    const values = Object.values(ratings).map(Number);
    setAvgRating(values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Athletes
          </Button>
          <div className="flex space-x-2">
            {isSubscribed ? (
              <>
                <Badge variant="default" className="bg-green-600 px-3 py-1">
                  <CreditCard className="h-3 w-3 mr-1" />
                </Badge>
              </>
            ) : (
              <Button onClick={() => onSubscribe(athlete)} className="bg-orange-500 hover:bg-orange-600">
                Subscribe $10/month
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Athlete Header */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="flex items-start space-x-6">
            <Image
              src={athlete.profilePic || "/placeholder.svg"}
              alt={athlete.name}
              width={120}
              height={120}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{athlete.name}</h1>
                <Badge className="bg-orange-500">{athlete.sport}</Badge>
              </div>
              <p className="text-gray-600 mb-4">{athlete.bio}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{athlete.subscribers} subscribers</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Video className="h-4 w-4" />
                  <span>{athlete.posts} posts</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{avgRating} rating</span>
                  {isSubscribed && (
                    <span className="ml-2 flex items-center">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(star)}
                          disabled={isSubmitting}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          aria-label={`Rate ${star}`}
                        >
                          <Star className={`h-4 w-4 ${userRating && userRating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">{isSubscribed ? "Exclusive Content" : "Content Preview"}</h2>

          {isSubscribed ? (
            // Show full content for subscribers
            <div className="grid gap-6">
              {athlete.recentPosts?.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                          <Badge variant={post.type === "workout" ? "default" : "secondary"}>
                            {post.type === "workout" ? "Workout" : "Blog"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{post.description}</p>
                        {/* Render blog images if present */}
                        {post.images && post.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.images.map((img: string, idx: number) => (
                              <img key={idx} src={img} alt={`Blog image ${idx + 1}`} className="max-h-40 rounded" />
                            ))}
                          </div>
                        )}
                        <div className="prose max-w-none text-gray-700 mb-3">{post.content}</div>
                        {post.videoLink && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Play className="h-4 w-4 text-blue-600" />
                            <a
                              href={post.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Watch Video
                            </a>
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary">{formatDate(post.createdAt)}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views} views</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Show locked content preview for non-subscribers
            <div className="grid gap-6">
              {athlete.previewPosts?.map((post: any, index: number) => (
                <Card key={index} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                          <Badge variant={post.type === "workout" ? "default" : "secondary"}>
                            {post.type === "workout" ? "Workout" : "Blog"}
                          </Badge>
                          <Badge variant="outline">
                            <Lock className="h-3 w-3 mr-1" />
                            Subscribers Only
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{post.description}</p>
                        {/* Render blog images if present */}
                        {post.images && post.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.images.map((img: string, idx: number) => (
                              <img key={idx} src={img} alt={`Blog image ${idx + 1}`} className="max-h-40 rounded" />
                            ))}
                          </div>
                        )}
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <Lock className="h-5 w-5" />
                            <span>Subscribe to view full content</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Subscribe CTA */}
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardContent className="p-8 text-center">
                  <Lock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock All Content</h3>
                  <p className="text-gray-600 mb-6">
                    Subscribe to {athlete.name} for $10/month to access all exclusive workouts, blog posts, and direct
                    messaging.
                  </p>
                  <Button onClick={() => onSubscribe(athlete)} className="bg-orange-500 hover:bg-orange-600 px-8 py-3">
                    Subscribe Now - $10/month
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
