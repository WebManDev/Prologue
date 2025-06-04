"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Video,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
  Lock,
  Shield,
  CheckCircle,
  Upload,
  User,
  Target,
  CreditCard,
  ArrowRight,
  Play,
  Settings,
  LogOut,
  ImageIcon,
  Loader2,
  AlertCircle,
  Share2,
} from "lucide-react"
import { CoachStripeOnboarding } from "./coach-stripe-onboarding"
import { signOut, auth, getAthleteProfile, saveAthletePost, getSubscribersForAthlete, updateAthletePost, deleteAthletePost, saveAthleteProfile } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestore, collection, query, where, getDocs, Timestamp, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, limit } from "firebase/firestore"
import { MemberMessagingInterface } from "./member-messaging-interface"
import { STRIPE_CONFIG } from "@/lib/stripe"
import { format } from 'date-fns'

interface AthleteDashboardProps {
  onLogout: () => void
}

interface AthleteProfile {
  name: string;
  email: string;
  sport: string;
  role: string;
  subscribers: number;
  posts: number;
  rating: number;
  stripeAccountId: string | null;
  subscriptionStatus: string;
  specialties: string[];
  certifications: string[];
}

interface PostData {
  title: string;
  content: string;
  description?: string;
  videoLink?: string;
  type: "blog" | "workout";
  images?: string[];
  visibility: "public" | "subscribers";
  tags: string[];
}

function StarRating({ value, onChange, disabled = false }: { value: number, onChange: (v: number) => void, disabled?: boolean }) {
  return (
    <div className="flex items-center space-x-1">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          aria-label={`Rate ${star}`}
          style={{ background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 0 }}
        >
          <Star className={`h-5 w-5 ${value >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )
}

// Helper to get next payout date (first day of next month)
function getNextPayoutDate() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return format(nextMonth, 'MMM dd');
}

export function CoachDashboard({ onLogout }: AthleteDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [creatingPost, setCreatingPost] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false); 
  const [postType, setPostType] = useState<"workout" | "blog">("workout")
  const [stripeAccountId, setStripeAccountId] = useState<string | null>("acct_athlete_example")
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false)
  const [earnings, setEarnings] = useState<any>(null)
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    videoLink: "",
    type: "workout" as "workout" | "blog",
    images: [] as string[],
    visibility: "public" as "public" | "subscribers",
    tags: [] as string[],
  })
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [workoutVideo, setWorkoutVideo] = useState<File | null>(null)
  const [postImages, setPostImages] = useState<File[]>([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    bio: "Former college tennis player with 8 years of coaching experience. Specializing in serve technique and mental game strategies for players of all levels.",
    specialties: ["Tennis", "Serve Technique", "Mental Game"],
    profilePicture: "/placeholder.svg?height=120&width=120",
    email: "sarah.johnson@example.com",
    location: "Los Angeles, CA",
    experience: "8 years",
    certifications: ["USPTA Certified", "Mental Performance Coach"],
  })
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newBlogPost, setNewBlogPost] = useState({
    title: "",
    content: "",
    images: [] as string[],
  })
  const [blogImageFiles, setBlogImageFiles] = useState<File[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    subscribers: 0,
    totalPosts: 0,
    totalViews: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeSubscriptions: 0,
    thisWeek: {
      newSubscribers: 0,
      contentPublished: 0,
      totalViews: 0,
      revenue: 0,
    },
  });
  const [coachPosts, setCoachPosts] = useState<any[]>([]);
  const [messagingMember, setMessagingMember] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<any[]>([])
  const [loadingFeedback, setLoadingFeedback] = useState(true)
  const [feedbackPage, setFeedbackPage] = useState(1)
  const [hasMoreFeedback, setHasMoreFeedback] = useState(true)
  const FEEDBACK_PER_PAGE = 5
  const [feedbackInputs, setFeedbackInputs] = useState<{[id: string]: {rating: number, text: string, submitting: boolean}}>({});
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedExpanded, setFeedExpanded] = useState(false);

  const db = getFirestore();

  const formatDate = (timestamp: Timestamp | Date | string | null) => {
    if (!timestamp) return 'N/A';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Helper function to render feed posts
  const getFeedPosts = () => {
    if (!profile) return [];
    
    return [
      {
        id: "sample-1",
        title: "Advanced Tennis Serve Technique",
        description: "Master the perfect serve with these professional tips",
        content: "Focus on your toss placement and follow-through for maximum power and accuracy...",
        type: "workout",
        authorName: "Marcus Rodriguez",
        authorSport: "Tennis",
        authorAvatar: "/placeholder.svg?height=40&width=40",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        views: 156,
        likes: 23,
        comments: 8,
        isLiked: false,
        videoLink: "https://example.com/tennis-serve",
        visibility: "public",
        tags: ["tennis", "serve", "technique"],
      },
      {
        id: "sample-2",
        title: "Mental Preparation for Competition",
        description: "How to stay focused and confident during high-pressure moments",
        content:
          "Visualization techniques and breathing exercises that have helped me win championships...",
        type: "blog",
        authorName: "Sarah Chen",
        authorSport: "Swimming",
        authorAvatar: "/placeholder.svg?height=40&width=40",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        views: 89,
        likes: 15,
        comments: 12,
        isLiked: true,
        images: ["/placeholder.svg?height=200&width=300"],
        visibility: "public",
        tags: ["mental", "competition", "preparation"],
      },
      ...(coachPosts || []).map((post: any) => ({
        ...post,
        authorName: profile.name,
        authorSport: profile.sport || "Sport",
        authorAvatar: profileData.profilePicture,
        isLiked: false,
        visibility: "public",
        tags: post.tags || [],
      })),
    ].map((post) => (
      <Card key={post.id}>
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={post.authorAvatar || "/placeholder.svg"}
              alt={post.authorName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
                <Badge variant="outline" className="text-xs">
                  {post.authorSport}
                </Badge>
                {post.authorName === profile.name && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
                <Badge variant={post.visibility === "public" ? "default" : "outline"} className="text-xs">
                  {post.visibility === "public" ? "Public" : "Subscribers Only"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
            {post.authorName === profile.name && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPost(post)}
                  disabled={isDeleting}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeletePost(post)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {/* Post Content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-gray-600">{post.description}</p>
            </div>
            {post.type === "workout" && post.videoLink && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  src={post.videoLink}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {post.type === "blog" && post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {post.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Blog image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button
                className={`flex items-center space-x-1 ${
                  post.isLiked ? "text-red-600" : "hover:text-red-600"
                }`}
              >
                <Star className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likes}</span>
              </button>
              <span className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </span>
              <Button variant="ghost" size="sm" className="ml-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // All useEffect hooks moved here, after all useState declarations
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          const profileDataFromDb = await getAthleteProfile(auth.currentUser.uid);
          if (profileDataFromDb) {
            setProfile(profileDataFromDb as AthleteProfile);
            setProfileData(prev => ({
              ...prev,
              ...profileDataFromDb,
              specialties: profileDataFromDb.specialties || [],
              certifications: profileDataFromDb.certifications || [],
            }));
          }
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
    async function fetchSubscribers() {
      if (!auth.currentUser) return;
      const subs = await getSubscribersForAthlete(auth.currentUser.uid);
      setSubscribers(subs);
    }
    fetchSubscribers();
  }, []);

  useEffect(() => {
    async function fetchCoachDashboardData() {
      if (!auth.currentUser) return;
      // Fetch posts
      const postsQuery = query(collection(db, "athletePosts"), where("userId", "==", auth.currentUser.uid));
      const postsSnap = await getDocs(postsQuery);
      const posts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoachPosts(posts);
      // Calculate stats
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let thisWeekContent = 0;
      let thisWeekViews = 0;
      let thisWeekRevenue = 0;
      const now = new Date();
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      posts.forEach(post => {
        totalViews += (post as any).views || 0;
        totalLikes += (post as any).likes || 0;
        totalComments += (post as any).comments || 0;
        const createdAt = (post as any).createdAt && (post as any).createdAt.toDate ? (post as any).createdAt.toDate() : ((post as any).createdAt ? new Date((post as any).createdAt) : null);
        if (createdAt && createdAt > weekAgo) {
          thisWeekContent++;
          thisWeekViews += (post as any).views || 0;
          thisWeekRevenue += 10; // Assume $10 per post for this example
        }
      });
      // Fetch subscribers from profile
      const profileData = await getAthleteProfile(auth.currentUser.uid);
      setDashboardStats({
        subscribers: profileData?.subscribers || 0,
        totalPosts: posts.length,
        totalViews,
        monthlyEarnings: (profileData?.subscribers || 0) * 10,
        totalEarnings: ((profileData?.subscribers || 0) * 10) * 5, // Example: 5 months
        activeSubscriptions: profileData?.subscribers || 0,
        thisWeek: {
          newSubscribers: 3, // Placeholder, replace with real logic if available
          contentPublished: thisWeekContent,
          totalViews: thisWeekViews,
          revenue: thisWeekRevenue,
        },
      });
    }
    fetchCoachDashboardData();
  }, [profile]);

  useEffect(() => {
    if (stripeAccountId) {
      fetchEarnings()
    }
  }, [stripeAccountId])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    async function fetchFeedbackRequests() {
      if (!auth.currentUser || activeTab !== "feedback") return;
      
      setLoadingFeedback(true);
      const requestsQuery = query(
        collection(db, "videoFeedbackRequests"),
        where("coachId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(FEEDBACK_PER_PAGE * feedbackPage)
      );
      
      unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setFeedbackRequests(requests);
        setHasMoreFeedback(requests.length === FEEDBACK_PER_PAGE * feedbackPage);
        setLoadingFeedback(false);
      });
    }
    
    fetchFeedbackRequests();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab, feedbackPage]);

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`/api/stripe/athlete-earnings?accountId=${stripeAccountId}`)
      const data = await response.json()
      setEarnings(data)
    } catch (error) {
      console.error("Failed to fetch earnings:", error)
    }
  }

  const handleWorkoutVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }
    
    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be less than 100MB');
      return;
    }
    
    setWorkoutVideo(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });

    setPostImages(prev => [...prev, ...validFiles]);
  };

  const handleCreatePost = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to create a post');
      return;
    }

    setIsUploadingVideo(true);
    setIsUploadingImages(true);
    try {
      let videoUrl = '';
      let imageUrls: string[] = [];
      
      // Upload video if one was selected
      if (workoutVideo) {
        const storage = getStorage();
        const fileRef = storageRef(storage, `workout-videos/${auth.currentUser!.uid}/${Date.now()}_${workoutVideo.name}`);
        await uploadBytes(fileRef, workoutVideo);
        videoUrl = await getDownloadURL(fileRef);
      }

      // Upload images if any were selected
      if (postImages.length > 0) {
        const storage = getStorage();
        const uploadPromises = postImages.map(async (file) => {
          const fileRef = storageRef(storage, `post-images/${auth.currentUser!.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      // Save post to Firebase
      const postData: PostData = {
        title: newPost.title,
        description: newPost.description,
        content: newPost.content,
        videoLink: videoUrl,
        images: imageUrls,
        type: newPost.type,
        visibility: newPost.visibility,
        tags: newPost.tags,
      };
      await saveAthletePost(auth.currentUser.uid, postData);

      // Reset form
      setNewPost({ 
        title: "", 
        description: "", 
        content: "", 
        videoLink: "", 
        type: "workout",
        images: [],
        visibility: "public",
        tags: [],
      });
      setWorkoutVideo(null);
      setPostImages([]);
      setCreatingPost(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsUploadingVideo(false);
      setIsUploadingImages(false);
    }
  };

  const requestPayout = async () => {
    if (!stripeAccountId) {
      setShowStripeOnboarding(true)
      return
    }

    try {
      const response = await fetch("/api/stripe/create-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: stripeAccountId,
          amount: dashboardStats.monthlyEarnings * STRIPE_CONFIG.platformFeePercentage,
        }),
      })

      const result = await response.json()
      if (result.error) {
        alert(result.error)
      } else {
        alert("Payout requested successfully!")
      }
    } catch (error) {
      alert("Failed to request payout")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleBlogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewBlogPost((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBlogImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return;
    setIsUploadingImage(true);
    try {
      const storage = getStorage();
      const urls: string[] = [];
      for (const file of files) {
        const fileRef = storageRef(storage, `blog-covers/${auth.currentUser?.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }
      setNewBlogPost((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      setBlogImageFiles((prev) => [...prev, ...files]);
    } catch (err) {
      alert("Failed to upload image(s)");
      console.error(err);
    } finally {
      setIsUploadingImage(false);
    }
  }

  const handleCreateBlogPost = async () => {
    setIsSubmitting(true)
    try {
      if (!auth.currentUser) throw new Error("Not logged in")
      await saveAthletePost(auth.currentUser.uid, {
        title: newBlogPost.title,
        content: newBlogPost.content,
        images: newBlogPost.images,
        type: "blog",
        description: newBlogPost.title,
        videoLink: "",
        visibility: "public",
        tags: [],
      })
      setBlogDialogOpen(false)
      setNewBlogPost({ title: "", content: "", images: [] })
      setBlogImageFiles([])
    } catch (e: any) {
      console.error("Failed to create blog post:", e)
      alert(e.message || "Unexpected error")
    } finally {
      setIsSubmitting(false)
    }
  }
  

  // Update handleFeedbackResponse to accept rating and text
  const handleFeedbackResponse = async (requestId: string, rating: number, text: string) => {
    if (!auth.currentUser) return;
    setFeedbackInputs((prev) => ({ ...prev, [requestId]: { ...prev[requestId], submitting: true } }));
    await updateDoc(doc(db, "videoFeedbackRequests", requestId), {
      status: "completed",
      response: text,
      rating,
      respondedAt: serverTimestamp()
    });
    setFeedbackInputs((prev) => ({ ...prev, [requestId]: { rating: 0, text: "", submitting: false } }));
  };

  const handleEditPost = async (post: any) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      description: post.description || "",
      content: post.content,
      videoLink: post.videoLink || "",
      type: post.type,
      images: post.images || [],
      visibility: post.visibility,
      tags: post.tags || [],
    });
    setPostType(post.type);
    setCreatingPost(true);
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !auth.currentUser) return;
    
    setIsUploadingVideo(true);
    try {
      let videoUrl = editingPost.videoLink;
      
      // Upload new video if one was selected
      if (workoutVideo) {
        const storage = getStorage();
        const fileRef = storageRef(storage, `workout-videos/${auth.currentUser.uid}/${Date.now()}_${workoutVideo.name}`);
        await uploadBytes(fileRef, workoutVideo);
        videoUrl = await getDownloadURL(fileRef);
      }

      // Update post in Firebase
      await updateAthletePost(editingPost.id, {
        title: newPost.title,
        description: newPost.description,
        content: newPost.content,
        videoLink: videoUrl,
        images: newPost.images,
        type: newPost.type,
        visibility: newPost.visibility,
        tags: newPost.tags,
      });

      // Reset form and state
      setNewPost({ 
        title: "", 
        description: "", 
        content: "", 
        videoLink: "", 
        type: "workout",
        images: [],
        visibility: "public",
        tags: [],
      });
      setWorkoutVideo(null);
      setPostImages([]);
      setCreatingPost(false);
      setEditingPost(null);
      
      // Refresh posts
      const postsQuery = query(collection(db, "athletePosts"), where("userId", "==", auth.currentUser.uid));
      const postsSnap = await getDocs(postsQuery);
      const posts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoachPosts(posts);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeletePost = async (post: any) => {
    if (!auth.currentUser) return;
    setIsDeleting(true);
    try {
      await deleteAthletePost(post.id, auth.currentUser.uid);
      setCoachPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMoreFeedback = () => {
    setFeedbackPage(prev => prev + 1);
  };

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

  if (messagingMember) {
    return <MemberMessagingInterface coach={messagingMember} onBack={() => setMessagingMember(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-700">
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "outline"}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === "content" ? "default" : "outline"}
                onClick={() => setActiveTab("content")}
              >
                Content
              </Button>
              <Button
                variant={activeTab === "subscribers" ? "default" : "outline"}
                onClick={() => setActiveTab("subscribers")}
              >
                Subscribers
              </Button>
              <Button
                variant={activeTab === "earnings" ? "default" : "outline"}
                onClick={() => setActiveTab("earnings")}
              >
                Earnings
              </Button>
              <Button
                variant={activeTab === "profile" ? "default" : "outline"}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </Button>
              <Button
                variant={activeTab === "feedback" ? "default" : "outline"}
                onClick={() => setActiveTab("feedback")}
              >
                Feedback Requests
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard">
            {feedExpanded ? (
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4 mt-8">
                  <h2 className="text-2xl font-bold text-gray-900">Feed</h2>
                  <Button variant="outline" size="sm" onClick={() => setFeedExpanded(false)}>
                    Collapse Feed
                  </Button>
                </div>
                {/* Feed Composer */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={profileData.profilePicture || "/placeholder.svg"}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setPostType("workout")
                          setCreatingPost(true)
                        }}
                      >
                        Share a workout, article, or update...
                      </Button>
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
                        <Video className="h-5 w-5 mr-2" />
                        Video
                      </Button>
                      <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
                        <ImageIcon className="h-5 w-5 mr-2" />
                        Photo
                      </Button>
                      <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
                        <FileText className="h-5 w-5 mr-2" />
                        Article
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {/* Feed Content */}
                <div className="space-y-4 mt-4">
                  {getFeedPosts()}
                </div>
              </div>
            ) : (
              <>
                {/* Quick Actions at the top */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5 text-orange-500" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          setPostType("workout")
                          setCreatingPost(true)
                        }}
                        className="h-20 bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center space-y-2"
                      >
                        <Video className="h-6 w-6" />
                        <span>Post Workout</span>
                      </Button>
                      <Button
                        onClick={() => setBlogDialogOpen(true)}
                        className="h-20 bg-blue-500 hover:bg-blue-600 text-white flex flex-col items-center justify-center space-y-2"
                      >
                        <FileText className="h-6 w-6" />
                        <span>Write Blog Post</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Row: Messages | Feedback Requests */}
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
                        {subscribers.length === 0 ? (
                          <div className="text-gray-500 text-sm">No subscribers to message yet.</div>
                        ) : (
                          subscribers.map((member: any) => (
                            <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => setMessagingMember({ id: member.id, name: member.name, coach: profileData.name, coachAvatar: profileData.profilePicture, sport: member.sport || "Sport" })}>
                              <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">{member.name?.[0] || "M"}</span>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{member.name || `Member`}</p>
                                <p className="text-xs text-gray-600">{member.email}</p>
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

                  {/* Feedback Requests Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        <span>Feedback Requests</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* ...existing feedback requests rendering... */}
                    </CardContent>
                  </Card>
                </div>

                {/* Feed Section below Quick Actions and row */}
                <div className="space-y-4 mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Feed</h2>
                    <Button variant="outline" size="sm" onClick={() => setFeedExpanded(true)}>
                      Expand Feed
                    </Button>
                  </div>
                  {/* Feed Composer */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={profileData.profilePicture || "/placeholder.svg"}
                          alt={profile.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setPostType("workout")
                            setCreatingPost(true)
                          }}
                        >
                          Share a workout, article, or update...
                        </Button>
                      </div>
                      <div className="flex justify-between mt-4 pt-4 border-t">
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
                          <Video className="h-5 w-5 mr-2" />
                          Video
                        </Button>
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Photo
                        </Button>
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-700">
                          <FileText className="h-5 w-5 mr-2" />
                          Article
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Feed Content */}
                  <div className="space-y-4 mt-4">
                    {getFeedPosts()}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Content</h1>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setPostType("workout")
                      setCreatingPost(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    New Workout
                  </Button>
                  <Button
                    onClick={() => setBlogDialogOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Blog Post
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {coachPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                            <Badge variant={post.type === "workout" ? "default" : "secondary"}>
                              {post.type === "workout" ? "Workout" : "Blog"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Subscribers Only
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{post.description}</p>
                          {post.videoLink && (
                            <div className="flex items-center space-x-2 mb-3">
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                              <a
                                href={post.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {post.videoLink}
                              </a>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">{formatDate(post.createdAt)}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} views</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPost(post)}
                            disabled={isDeleting}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeletePost(post)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Subscribers ({dashboardStats.subscribers})</h1>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscribers.map((member: any) => {
                  let subDate = null;
                  if (member.subscriptionDates) {
                    const coachId = auth.currentUser?.uid;
                    subDate = coachId && member.subscriptionDates[coachId]
                      ? member.subscriptionDates[coachId]
                      : Object.values(member.subscriptionDates)[0];
                  }
                  return (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">M{member.id}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{member.name || `Member ${member.id}`}</h4>
                            <p className="text-sm text-gray-600">
                              Subscribed {formatDate(subDate || null)}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              Active • $10/month
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>
                <Button className="bg-green-600 hover:bg-green-700" onClick={requestPayout}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </div>

              {/* Earnings Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-green-600">${dashboardStats.monthlyEarnings}</p>
                        <p className="text-xs text-green-600">{dashboardStats.subscribers} × $10</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Subscriptions</p>
                        <p className="text-2xl font-bold text-purple-600">{dashboardStats.activeSubscriptions}</p>
                        <p className="text-xs text-gray-600">Paying subscribers</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Next Payout</p>
                        <p className="text-2xl font-bold text-orange-600">{getNextPayoutDate()}</p>
                        <p className="text-xs text-gray-600">Automatic</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Earnings Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Subscription Revenue ({dashboardStats.subscribers} × $10)</span>
                      <span className="font-bold text-green-600">${dashboardStats.monthlyEarnings}.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span>Platform Fee (15%)</span>
                      <span className="font-bold text-red-600">
                        -${(dashboardStats.monthlyEarnings - (dashboardStats.monthlyEarnings * STRIPE_CONFIG.platformFeePercentage)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium">Your Net Earnings</span>
                      <span className="font-bold text-blue-600">
                        ${((dashboardStats.monthlyEarnings * STRIPE_CONFIG.platformFeePercentage)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Subscription Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscribers
                      .map(member => {
                        let subDate = null;
                        if (member.subscriptionDates) {
                          const coachId = auth.currentUser?.uid;
                          subDate = coachId && member.subscriptionDates[coachId]
                            ? member.subscriptionDates[coachId]
                            : Object.values(member.subscriptionDates)[0];
                        }
                        return {
                          name: member.name,
                          date: subDate,
                        };
                      })
                      .filter(e => e.date)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">New subscription</p>
                            <p className="text-xs text-gray-600">
                              {event.name} • {formatDate(event.date)}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-green-600">+${STRIPE_CONFIG.monthlySubscriptionPrice}</span>
                        </div>
                      ))}
                    {subscribers.length === 0 && (
                      <div className="text-center text-gray-500 py-4">No recent activity</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <Button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className={editingProfile ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {editingProfile ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <img
                            src={profileData.profilePicture || "/placeholder.svg"}
                            alt={profileData.name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          {editingProfile && (
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                              <Upload className="h-4 w-4 text-white" />
                              <input type="file" accept="image/*" className="hidden" />
                            </label>
                          )}
                        </div>
                        <div className="flex-1">
                          {editingProfile ? (
                            <Input
                              value={profileData.name}
                              onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                              className="text-xl font-semibold"
                              placeholder="Your full name"
                            />
                          ) : (
                            <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
                          )}
                          <p className="text-gray-600">Professional Athlete & Coach</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        {editingProfile ? (
                          <Textarea
                            value={profileData.bio}
                            onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                            rows={4}
                            placeholder="Tell your subscribers about your background and expertise..."
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{profileData.bio}</p>
                        )}
                      </div>

                      {/* Contact Information */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          {editingProfile ? (
                            <Input
                              type="email"
                              value={profileData.email}
                              onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                            />
                          ) : (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          {editingProfile ? (
                            <Input
                              value={profileData.location}
                              onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                              placeholder="City, State"
                            />
                          ) : (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        {editingProfile ? (
                          <Input
                            value={profileData.experience}
                            onChange={e => setProfileData({ ...profileData, experience: e.target.value })}
                            placeholder="e.g., 8 years"
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profileData.experience}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sports Played/Playing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span>Sports Played/Playing</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingProfile ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">Select your areas of expertise:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {[
                              "Tennis",
                              "Soccer",
                              "Swimming",
                              "Basketball",
                              "Volleyball",
                              "Track & Field",
                              "Golf",
                              "Baseball",
                              "Softball",
                              "Wrestling",
                              "Gymnastics",
                              "Cross Country",
                              "Football",
                              "Hockey",
                              "Lacrosse",
                              "Serve Technique",
                              "Mental Game",
                              "Fitness",
                            ].map((specialty) => (
                              <button
                                key={specialty}
                                type="button"
                                onClick={() => {
                                  const newSpecialties = profileData.specialties.includes(specialty)
                                    ? profileData.specialties.filter((s) => s !== specialty)
                                    : [...profileData.specialties, specialty]
                                  setProfileData({ ...profileData, specialties: newSpecialties })
                                }}
                                className={`p-2 text-sm border rounded-lg transition-all ${
                                  profileData.specialties.includes(specialty)
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                                }`}
                              >
                                {specialty}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.specialties.map((specialty) => (
                            <Badge key={specialty} className="bg-orange-100 text-orange-800">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-purple-500" />
                        <span>Certifications & Credentials</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingProfile ? (
                        <div className="space-y-3">
                          {profileData.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={cert}
                                onChange={(e) => {
                                  const newCerts = [...profileData.certifications]
                                  newCerts[index] = e.target.value
                                  setProfileData({ ...profileData, certifications: newCerts })
                                }}
                                placeholder="Certification name"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCerts = profileData.certifications.filter((_, i) => i !== index)
                                  setProfileData({ ...profileData, certifications: newCerts })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setProfileData({
                                ...profileData,
                                certifications: [...profileData.certifications, ""],
                              })
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {profileData.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">{cert}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Subscription Pricing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span>Subscription Pricing</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">$10</div>
                        <div className="text-sm text-green-800">per month</div>
                        <div className="text-xs text-gray-600 mt-2">Fixed rate for all athletes</div>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p>
                          All athletes on PROLOGUE charge the same monthly rate, ensuring fair and accessible pricing
                          for members.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profile Views</span>
                          <span className="font-semibold">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Conversion Rate</span>
                          <span className="font-semibold">0%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profile Completeness</span>
                          <span className="font-semibold text-green-600">0%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Notification Preferences
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setMessagingMember({
                        name: "Test Member",
                        coach: profileData.name,
                        coachAvatar: profileData.profilePicture,
                        sport: profileData.specialties[0] || "Sport"
                      })}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {editingProfile && (
                <Button
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    // Ensure required fields are present
                    const payload = {
                      name: profileData.name,
                      email: profileData.email,
                      sport: profile?.sport || '',
                      role: profile?.role || '',
                      bio: profileData.bio,
                      specialties: profileData.specialties,
                      profilePicture: profileData.profilePicture,
                      location: profileData.location,
                      experience: profileData.experience,
                      certifications: profileData.certifications,
                    };
                    await saveAthleteProfile(auth.currentUser.uid, payload);
                    // Refetch profile to ensure UI is up to date
                    const updatedProfile = await getAthleteProfile(auth.currentUser.uid);
                    if (updatedProfile) {
                      setProfile(updatedProfile as AthleteProfile);
                      setProfileData(prev => ({
                        ...prev,
                        ...updatedProfile,
                        specialties: updatedProfile.specialties || [],
                        certifications: updatedProfile.certifications || [],
                      }));
                    }
                    setEditingProfile(false);
                  }}
                >
                  Save Changes
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Video Feedback Requests</h1>
              </div>

              {loadingFeedback && feedbackPage === 1 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading feedback requests...</h3>
                </div>
              ) : feedbackRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback requests yet</h3>
                  <p className="text-gray-600">When members request video feedback, they'll appear here</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6">
                    {feedbackRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  Video Feedback Request
                                </h3>
                                <Badge variant={
                                  request.status === "pending_payment" ? "destructive" :
                                  request.status === "pending" ? "default" :
                                  request.status === "completed" ? "secondary" : "outline"
                                }>
                                  {request.status === "pending_payment" ? "Payment Pending" :
                                   request.status === "pending" ? "Pending Review" :
                                   request.status === "completed" ? "Completed" : request.status}
                                </Badge>
                                {request.feedbackType && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                                    {request.feedbackType === "priority" ? "Priority" : "Standard"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 mb-4">{request.feedbackText}</p>
                              
                              {request.videoUrl && (
                                <div className="mb-4">
                                  <video 
                                    controls 
                                    className="w-full rounded-lg"
                                    src={request.videoUrl}
                                  />
                                </div>
                              )}

                              {request.status === "pending_payment" ? (
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                  <p className="text-yellow-800">
                                    <AlertCircle className="h-4 w-4 inline mr-2" />
                                    Waiting for payment confirmation
                                  </p>
                                </div>
                              ) : request.status === "pending" ? (
                                <div className="space-y-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                  <StarRating
                                    value={feedbackInputs[request.id]?.rating || 0}
                                    onChange={(v) => setFeedbackInputs((prev) => ({ ...prev, [request.id]: { ...prev[request.id], rating: v } }))}
                                    disabled={feedbackInputs[request.id]?.submitting}
                                  />
                                  <Textarea
                                    placeholder="Enter your feedback response..."
                                    rows={4}
                                    value={feedbackInputs[request.id]?.text || ""}
                                    onChange={(e) => setFeedbackInputs((prev) => ({ ...prev, [request.id]: { ...prev[request.id], text: e.target.value } }))}
                                    disabled={feedbackInputs[request.id]?.submitting}
                                  />
                                  <Button
                                    onClick={() => handleFeedbackResponse(request.id, feedbackInputs[request.id]?.rating || 0, feedbackInputs[request.id]?.text || "")}
                                    disabled={feedbackInputs[request.id]?.submitting || !(feedbackInputs[request.id]?.rating && feedbackInputs[request.id]?.text)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {feedbackInputs[request.id]?.submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Send
                                  </Button>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-2">Your Response</h4>
                                  <p className="text-gray-700">{request.response}</p>
                                  <p className="text-sm text-gray-500 mt-2">
                                    Responded on {formatDate(request.respondedAt)}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Requested on {formatDate(request.createdAt)}
                              </p>
                              {request.feedbackType === "priority" && (
                                <Badge variant="outline" className="mt-2 bg-orange-100 text-orange-700 border-orange-200">
                                  Priority Request
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {hasMoreFeedback && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="outline" 
                        onClick={loadMoreFeedback}
                        disabled={loadingFeedback}
                      >
                        {loadingFeedback ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Post Modal */}
      {creatingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') setCreatingPost(false); }}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* X Close Button */}
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setCreatingPost(false)}
              tabIndex={0}
            >
              ×
            </button>
            <CardHeader>
              <CardTitle>
                {editingPost ? "Edit" : "Create"} Post
                <Badge variant="outline" className="ml-2">
                  {newPost.visibility === "public" ? "Public" : "Subscribers Only"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="Brief description of your post..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <Input
                  value={newPost.tags.join(', ')}
                  onChange={(e) => setNewPost({ 
                    ...newPost, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., tennis, technique, training"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video (Optional)</label>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="icon" className="shrink-0" asChild>
                      <label>
                        <Video className="h-4 w-4" />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleWorkoutVideoUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <span className="text-sm text-gray-600">
                      {workoutVideo ? workoutVideo.name : "No video selected"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI up to 100MB</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="icon" className="shrink-0" asChild>
                      <label>
                        <ImageIcon className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <span className="text-sm text-gray-600">
                      {postImages.length} image{postImages.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB each</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Visibility:</label>
                <select
                  value={newPost.visibility}
                  onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value as "public" | "subscribers" })}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="subscribers">Subscribers Only</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Public posts are visible to everyone, while subscriber-only posts are only visible to your paying subscribers.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={editingPost ? handleUpdatePost : handleCreatePost}
                disabled={isUploadingVideo || isUploadingImages}
              >
                {isUploadingVideo || isUploadingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingPost ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingPost ? "Update Post" : "Create Post"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {showStripeOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <CoachStripeOnboarding
              onComplete={(accountId) => {
                setStripeAccountId(accountId)
                setShowStripeOnboarding(false)
              }}
            />
            <Button variant="ghost" onClick={() => setShowStripeOnboarding(false)} className="w-full mt-4">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
            <DialogDescription>Share your knowledge and insights with your subscribers.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={newBlogPost.title}
                onChange={handleBlogInputChange}
                placeholder="Enter a compelling title for your blog post"
              />
            </div>
            <div>
              <Label htmlFor="blogImages" className="mb-2 block">
                Images (optional, multiple allowed)
              </Label>
              <div className="flex gap-2 items-center flex-wrap">
                <Button variant="outline" size="icon" className="shrink-0" asChild>
                  <label>
                    <ImageIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBlogImages}
                      className="hidden"
                    />
                  </label>
                </Button>
                {newBlogPost.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Blog Preview ${idx}`} className="mt-2 max-h-20 rounded" />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="content" className="mb-2 block">
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                value={newBlogPost.content}
                onChange={handleBlogInputChange}
                placeholder="Write your blog post content here..."
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBlogPost} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
