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
  X,
  Home,
  Image,
} from "lucide-react"
import { CoachStripeOnboarding } from "./coach-stripe-onboarding"
import { signOut, auth, getAthleteProfile, saveAthletePost, getSubscribersForAthlete, updateAthletePost, deleteAthletePost, saveAthleteProfile, likePost, addCommentToPost, sendMessage, getChatId } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestore, collection, query, where, getDocs, Timestamp, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, limit, increment, arrayUnion } from "firebase/firestore"
import { CoachMessagingInterface } from "./coach-messaging-interface"
import { STRIPE_CONFIG } from "@/lib/stripe"
import { format } from 'date-fns'
import StarRating from "./star-rating"
import { useRouter } from 'next/navigation';
import { Logo } from "@/components/logo"

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
  pricing?: {
    pro?: number;
    premium?: number;
  };
}

interface PostData {
  title: string;
  content: string;
  description?: string;
  videoLink?: string;
  type: "blog" | "workout" | "community";
  images?: string[];
  visibility: "public" | "subscribers";
  tags: string[];
  userId: string;
  createdAt: any;
  views?: number;
  likes?: number;
  comments?: number;
}

interface PostUpdate {
  title?: string;
  content?: string;
  description?: string;
  videoLink?: string;
  type?: "blog" | "workout" | "community";
  images?: string[];
  visibility?: "public" | "subscribers";
  tags?: string[];
}

// Helper to get next payout date (first day of next month)
function getNextPayoutDate() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return format(nextMonth, 'MMM dd');
}

export function CoachDashboard({ onLogout }: AthleteDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard")
  const [creatingPost, setCreatingPost] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false); 
  const [postType, setPostType] = useState<"workout" | "blog" | "community">("workout")
  const [stripeAccountId, setStripeAccountId] = useState<string | null>("acct_athlete_example")
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false)
  const [earnings, setEarnings] = useState<any>(null)
  const [newPost, setNewPost] = useState<PostData>({
    title: "",
    description: "",
    content: "",
    videoLink: "",
    type: "community",
    images: [],
    visibility: "public",
    tags: [],
    userId: "",
    createdAt: null,
  });
  const [newPrivatePost, setNewPrivatePost] = useState<PostData>({
    title: "",
    description: "",
    content: "",
    videoLink: "",
    type: "blog",
    images: [],
    visibility: "subscribers",
    tags: [],
    userId: "",
    createdAt: null,
  });
  const [newWorkoutPost, setNewWorkoutPost] = useState<PostData>({
    title: "",
    description: "",
    content: "",
    videoLink: "",
    type: "workout",
    images: [],
    visibility: "subscribers",
    tags: [],
    userId: "",
    createdAt: null,
  });

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
    pricing: {
      pro: 9.99,
      premium: 19.99
    }
  })
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newBlogPost, setNewBlogPost] = useState({
    title: "",
    content: "",
    images: [] as string[],
    visibility: "subscribers" as "public" | "subscribers",
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
  const [ownPosts, setOwnPosts] = useState<any[]>([]);
  const [messagingMember, setMessagingMember] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [showFeedbackRequests, setShowFeedbackRequests] = useState(false);
  const [feedbackRequests, setFeedbackRequests] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedbackPage, setFeedbackPage] = useState(1)
  const [hasMoreFeedback, setHasMoreFeedback] = useState(true)
  const FEEDBACK_PER_PAGE = 5
  const [feedbackInputs, setFeedbackInputs] = useState<{[id: string]: {rating: number, text: string, submitting: boolean}}>({});
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [commentOpen, setCommentOpen] = useState<{ [postId: string]: boolean }>({});
  const [postComments, setPostComments] = useState<{ [postId: string]: any[] }>({});
  const currentUserId = auth.currentUser?.uid;
  const [memberProfiles, setMemberProfiles] = useState<{ [userId: string]: any }>({});
  const [athleteProfiles, setAthleteProfiles] = useState<{ [userId: string]: any }>({});
  const [showMessagingDialog, setShowMessagingDialog] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

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

  // Add this new function to handle view tracking
  const trackPostView = async (postId: string) => {
    if (!auth.currentUser) return;
    
    const postRef = doc(db, "athletePosts", postId);
    try {
      await updateDoc(postRef, {
        views: increment(1),
        viewedBy: arrayUnion(auth.currentUser.uid)
      });
    } catch (error) {
      console.error("Error tracking post view:", error);
    }
  };

  // Add this useEffect to track views when posts are loaded
  useEffect(() => {
    if (!coachPosts || !auth.currentUser) return;

    const viewedPosts = new Set();
    coachPosts.forEach(post => {
      if (!post.viewedBy?.includes(auth.currentUser?.uid)) {
        trackPostView(post.id);
        viewedPosts.add(post.id);
      }
    });
  }, [coachPosts]);

  // Helper function to render feed posts
  const getFeedPosts = () => {
    if (!profile || !auth.currentUser) return [];

    return (coachPosts || []).map((post: any) => {
      let author = profile;
      let authorAvatar = profileData.profilePicture;

      // If the post is not by the current user, try to get the author's profile
      if (post.userId !== auth.currentUser?.uid) {
        author = athleteProfiles[post.userId] || memberProfiles[post.userId] || {};
        authorAvatar = (author as any).profilePicture || "/placeholder.svg";
      }

      return {
        ...post,
        authorName: author.name || "User",
        authorSport: author.sport || "Sport",
        authorAvatar,
        isLiked: post.likedBy?.includes(auth.currentUser?.uid) || false,
        visibility: post.visibility || "public",
        tags: post.tags || [],
      };
    }).map((post) => (
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
                {post.userId === auth.currentUser?.uid && (
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
            {post.userId === auth.currentUser?.uid && (
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
              {post.content && (
                <div className="text-gray-800 mt-2 whitespace-pre-line">{post.content}</div>
              )}
              {/* Render video for any post with videoLink */}
              {post.videoLink && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <video
                    src={post.videoLink}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {/* Render images for blog or workout posts */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {post.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
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
            <div className="flex items-center space-x-4 text-sm text-gray-600 border-t pt-3 mt-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  post.isLiked
                    ? "bg-orange-100 text-orange-600"
                    : "hover:bg-orange-50 text-gray-600 hover:text-orange-600"
                }`}
              >
                <Star className={`h-4 w-4 ${post.isLiked ? "fill-orange-600" : ""}`} />
                <span className="font-medium">
                  {post.likes || 0} Like{(post.likes || 0) !== 1 ? "s" : ""}
                </span>
              </button>
              <button
                onClick={() => {
                  setCommentOpen((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                  fetchComments(post.id)
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">
                  {post.comments || 0} Comment{(post.comments || 0) !== 1 ? "s" : ""}
                </span>
              </button>
              <span className="flex items-center space-x-1 text-gray-500 ml-auto">
                <Eye className="h-4 w-4" />
                <span>{post.views || 0} views</span>
              </span>
            </div>
            {commentOpen[post.id] && (
              <div className="mt-4 border-t pt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <img
                    src={profileData.profilePicture || "/placeholder.svg"}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="w-full border border-gray-300 rounded-full px-4 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
                {(postComments[post.id] || []).length > 0 && (
                  <div className="space-y-3">
                    {(postComments[post.id] || []).map((c) => {
                      const isCoach = c.userId === auth.currentUser?.uid;
                      const commenter = isCoach
                        ? profileData
                        : (athleteProfiles?.[c.userId] || memberProfiles[c.userId] || {});
                      const likedBy = c.likedBy || [];
                      const isLiked = likedBy.includes(auth.currentUser?.uid);
                      const likeCount = likedBy.length;
                      return (
                        <div key={c.id} className="flex items-start space-x-3">
                          <img
                            src={commenter.profilePicture || "/placeholder.svg"}
                            alt="Commenter avatar"
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-white rounded-lg px-3 py-2 border">
                              <div className="font-semibold text-sm text-gray-900">
                                {commenter.name || "User"}
                              </div>
                              <div className="text-sm text-gray-700 mt-1">{c.comment}</div>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <button
                                className={`hover:text-orange-600 transition-colors flex items-center space-x-1 ${isLiked ? 'text-orange-600 font-bold' : ''}`}
                                onClick={async () => {
                                  if (!auth.currentUser) return;
                                  const commentRef = doc(db, "athletePosts", post.id, "comments", c.id);
                                  let updatedLikedBy = [...likedBy];
                                  if (isLiked) {
                                    updatedLikedBy = updatedLikedBy.filter((id) => id !== auth.currentUser.uid);
                                  } else {
                                    updatedLikedBy.push(auth.currentUser.uid);
                                  }
                                  await updateDoc(commentRef, { likedBy: updatedLikedBy });
                                  // Refresh comments
                                  fetchComments(post.id);
                                }}
                              >
                                <Star className={`h-3 w-3 ${isLiked ? 'fill-orange-600' : ''}`} />
                                <span>{likeCount > 0 ? likeCount : 'Like'}</span>
                              </button>
                              <button className="hover:text-orange-600 transition-colors">Reply</button>
                              <span>Just now</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
              pricing: profileDataFromDb.pricing || { pro: 9.99, premium: 19.99 }
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
      
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let thisWeekContent = 0;
      let thisWeekViews = 0;
      let thisWeekRevenue = 0;
      const now = new Date();
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

      // Fetch all posts from the current coach
      const ownPostsQuery = query(
        collection(db, "athletePosts"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const ownPostsSnap = await getDocs(ownPostsQuery);
      const ownPosts = ownPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as PostData[];

      // Fetch all public posts from everyone
      const publicPostsQuery = query(
        collection(db, "athletePosts"),
        where("visibility", "==", "public"),
        orderBy("createdAt", "desc")
      );
      const publicPostsSnap = await getDocs(publicPostsQuery);
      const publicPosts = publicPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as PostData[];

      // Set public posts for the community feed
      setCoachPosts(publicPosts);

      // Set subscriber posts for the content section
      setOwnPosts(ownPosts.filter(post => post.visibility === "subscribers"));

      // Calculate stats using subscriber-only posts
      ownPosts.filter(post => post.visibility === "subscribers").forEach(post => {
        totalViews += post.views || 0;
        totalLikes += post.likes || 0;
        totalComments += post.comments || 0;
        const createdAt = post.createdAt && post.createdAt.toDate ? post.createdAt.toDate() : post.createdAt ? new Date(post.createdAt) : null;
        if (createdAt && createdAt > weekAgo) {
          thisWeekContent++;
          thisWeekViews += post.views || 0;
          thisWeekRevenue += 10; // Assume $10 per post for this example
        }
      });

      // Fetch subscribers from profile
      if (auth.currentUser) {
        const profileData = await getAthleteProfile(auth.currentUser.uid);
        setDashboardStats({
          subscribers: profileData?.subscribers || 0,
          totalPosts: ownPosts.filter(post => post.visibility === "subscribers").length,
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
      } else {
        setDashboardStats({
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
      }
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
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
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
      if (workoutVideo && auth.currentUser) {
        const storage = getStorage();
        const fileRef = storageRef(storage, `workout-videos/${auth.currentUser.uid}/${Date.now()}_${workoutVideo.name}`);
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
        tags: newPost.tags,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        visibility: newPost.visibility || "public", // Set the actual visibility
      };
      await saveAthletePost(auth.currentUser.uid, postData);

      // Reset form
      setNewPost({ 
        title: "", 
        description: "", 
        content: "", 
        videoLink: "", 
        type: "community",
        images: [],
        visibility: "public",
        tags: [],
        userId: "",
        createdAt: null,
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
        tags: [],
        visibility: newBlogPost.visibility || "public",
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      })
      setBlogDialogOpen(false)
      setNewBlogPost({ title: "", content: "", images: [], visibility: "subscribers" })
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
      userId: post.userId,
      createdAt: post.createdAt,
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
      const updates: PostUpdate = {
        title: newPost.title,
        description: newPost.description,
        content: newPost.content,
        videoLink: videoUrl,
        images: newPost.images,
        type: newPost.type,
        visibility: newPost.visibility,
        tags: newPost.tags,
      };
      await updateAthletePost(editingPost.id, updates);

      // Reset form and state
      setNewPost({
        title: "",
        description: "",
        content: "",
        videoLink: "",
        type: "community",
        images: [],
        visibility: "public",
        tags: [],
        userId: "",
        createdAt: null,
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
      // Update both states to remove the deleted post
      setCoachPosts((prev) => prev.filter((p) => p.id !== post.id));
      setOwnPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMoreFeedback = () => {
    setFeedbackPage(prev => prev + 1);
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    const postRef = collection(db, "athletePosts", postId, "comments");
    const q = query(postRef, orderBy("createdAt", "desc"), limit(3));
    const snap = await getDocs(q);
    const comments = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    setPostComments(prev => ({ ...prev, [postId]: comments }));

    // Find userIds that are not in athleteProfiles or memberProfiles
    const missingUserIds = comments
      .map(c => c.userId)
      .filter(
        (userId) =>
          !athleteProfiles?.[userId] &&
          !memberProfiles[userId]
      );
    // Fetch missing member profiles
    if (missingUserIds.length > 0) {
      const { getMemberProfile } = await import("@/lib/firebase");
      const newProfiles: { [userId: string]: any } = {};
      await Promise.all(
        missingUserIds.map(async (userId: string) => {
          try {
            const profile = await getMemberProfile(userId);
            if (profile) newProfiles[userId] = profile;
          } catch {}
        })
      );
      if (Object.keys(newProfiles).length > 0) {
        setMemberProfiles(prev => ({ ...prev, ...newProfiles }));
      }
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;
    await likePost(postId, currentUserId);
    // Refresh the posts to update the like status
    const publicPostsQuery = query(
      collection(db, "athletePosts"),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc")
    );
    const publicPostsSnap = await getDocs(publicPostsQuery);
    const publicPosts = publicPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCoachPosts(publicPosts);
  };

  const handleComment = async (postId: string) => {
    if (!currentUserId || !commentInputs[postId]?.trim()) return;
    await addCommentToPost(postId, currentUserId, commentInputs[postId]);
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    fetchComments(postId);
  };

  // Fetch and cache missing author profiles for posts in the feed
  useEffect(() => {
    if (!coachPosts) return;

    // Find userIds that are not in athleteProfiles or memberProfiles
    const missingUserIds = coachPosts
      .map((post: any) => post.userId)
      .filter(
        userId =>
          userId !== auth.currentUser?.uid &&
          !athleteProfiles[userId] &&
          !memberProfiles[userId]
      );

    if (missingUserIds.length > 0) {
      (async () => {
        const { getAthleteProfile, getMemberProfile } = await import('@/lib/firebase');
        const newAthletes: Record<string, any> = {};
        const newMembers: Record<string, any> = {};
        await Promise.all(
          missingUserIds.map(async (userId: string) => {
            try {
              let profile = await getAthleteProfile(userId);
              if (profile) {
                newAthletes[userId] = profile;
              } else {
                profile = await getMemberProfile(userId);
                if (profile) newMembers[userId] = profile;
              }
            } catch {}
          })
        );
        if (Object.keys(newAthletes).length > 0) setAthleteProfiles(prev => ({ ...prev, ...newAthletes }));
        if (Object.keys(newMembers).length > 0) setMemberProfiles(prev => ({ ...prev, ...newMembers }));
      })();
    }
  }, [coachPosts]);

  // Add this function to handle sending messages
  const handleSendMessage = async (memberId: string) => {
    if (!auth.currentUser || !messageInput.trim()) return;
    
    try {
      await sendMessage({
        memberId,
        athleteId: auth.currentUser.uid,
        senderId: auth.currentUser.uid,
        senderRole: "coach",
        content: messageInput.trim()
      });
      setMessageInput("");
      // Refresh messages
      fetchMessages(memberId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Add this function to fetch messages
  const fetchMessages = async (memberId: string) => {
    if (!auth.currentUser) return;
    
    const chatId = getChatId(memberId, auth.currentUser.uid);
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(messages);
    });
    return unsubscribe;
  };

  // Update the messaging button click handler
  const handleMessagingClick = () => {
    setShowMessagingDialog(true);
  };

  // Update the feedback requests button click handler
  const handleFeedbackRequestsClick = () => {
    setActiveTab("feedback");
  };

  // Handler for community (public) post
  const handleCreateCommunityPost = async () => {
    if (!auth.currentUser) return;
    await saveAthletePost(auth.currentUser.uid, {
      title: newPost.title,
      description: newPost.description,
      content: newPost.content,
      videoLink: newPost.videoLink,
      type: newPost.type as "community",
      images: newPost.images,
      tags: newPost.tags,
    });
    setNewPost({
      title: "",
      description: "",
      content: "",
      videoLink: "",
      type: "community" as "community",
      images: [],
      visibility: "public" as "public",
      tags: [],
      userId: "",
      createdAt: null,
    });
    setCreatingPost(false);
  };

  // Handler for private blog post
  const handleCreatePrivateBlogPost = async () => {
    if (!auth.currentUser) return;
    await saveAthletePost(auth.currentUser.uid, {
      title: newPrivatePost.title,
      description: newPrivatePost.description,
      content: newPrivatePost.content,
      videoLink: newPrivatePost.videoLink,
      type: newPrivatePost.type as "blog",
      images: newPrivatePost.images,
      tags: newPrivatePost.tags,
    });
    setNewPrivatePost({
      title: "",
      description: "",
      content: "",
      videoLink: "",
      type: "blog" as "blog",
      images: [],
      tags: [],
      userId: "",
      createdAt: null,
    });
    setCreatingPost(false);
  };

  // Handler for private workout post
  const handleCreateWorkoutPost = async () => {
    if (!auth.currentUser) return;
    await saveAthletePost(auth.currentUser.uid, {
      title: newWorkoutPost.title,
      description: newWorkoutPost.description,
      content: newWorkoutPost.content,
      videoLink: newWorkoutPost.videoLink,
      type: newWorkoutPost.type,
      images: newWorkoutPost.images,
      tags: newWorkoutPost.tags,
    });
    setNewWorkoutPost({
      title: "",
      description: "",
      content: "",
      videoLink: "",
      type: "workout" as "workout",
      images: [],
      visibility: "subscribers" as "subscribers",
      tags: [],
      userId: "",
      createdAt: null,
    });
    setCreatingPost(false);
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
    return <CoachMessagingInterface coach={messagingMember} onBack={() => setMessagingMember(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />

          <div className="flex items-center space-x-4">
          
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
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "content" ? "default" : "outline"}
                onClick={() => setActiveTab("content")}
              >
                <FileText className="h-5 w-5 mr-2" />
                Content
              </Button>
              <Button
                variant={activeTab === "subscribers" ? "default" : "outline"}
                onClick={() => setActiveTab("subscribers")}
              >
                <Users className="h-5 w-5 mr-2" />
                Subscribers
              </Button>
              <Button
                variant={activeTab === "earnings" ? "default" : "outline"}
                onClick={() => setActiveTab("earnings")}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Earnings
              </Button>
              <Button
                variant={activeTab === "profile" ? "default" : "outline"}
                onClick={() => setActiveTab("profile")}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
              <Button
                variant={activeTab === "feedback" ? "default" : "outline"}
                onClick={handleFeedbackRequestsClick}
              >
                <Star className="h-5 w-5 mr-2" />
                Feedback Requests
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "outline"}
                onClick={() => router.push('/coach/settings')}
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard">
            <div className="max-w-3xl mx-auto">
              {/* Quick Actions at the top */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-orange-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => setCreatingPost(true)}
                      className="h-20 bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center space-y-2"
                    >
                      <FileText className="h-6 w-6" />
                      <span>New Post</span>
                    </Button>
                    <Button
                      onClick={() => setCreatingPost(true)}
                      className="h-20 bg-blue-500 hover:bg-blue-600 text-white flex flex-col items-center justify-center space-y-2"
                    >
                      <Video className="h-6 w-6" />
                      <span>New Workout</span>
                    </Button>
                    <Button
                      onClick={() => setShowMessagingDialog(true)}
                      className="h-20 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center space-y-2"
                    >
                      <MessageSquare className="h-6 w-6" />
                      <span>Message</span>
                    </Button>
                    <Button
                      onClick={() => setShowFeedbackRequests(true)}
                      className="h-20 bg-purple-500 hover:bg-purple-600 text-white flex flex-col items-center justify-center space-y-2"
                    >
                      <Star className="h-6 w-6" />
                      <span>Feedback Requests</span>
                      {feedbackRequests.length > 0 && (
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          {feedbackRequests.length}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Exclusive Content */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-orange-500" />
                    <span>Latest Exclusive Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ownPosts.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>{post.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Feed */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
              </div>

              {/* Feed Composer */}
              <Card className="mb-8">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={profileData.profilePicture || "/placeholder.svg"}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full mt-1"
                    />
                    <div className="flex-1">
                      <div className="border rounded-lg p-4">
                        <textarea
                          value={newPost.content}
                          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Share something with your community..."
                          className="w-full border-none focus:ring-0 resize-none min-h-[100px]"
                        />
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              <Image className="h-4 w-4 mr-2" />
                              Add Images
                            </Button>
                            <input
                              id="image-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('video-upload')?.click()}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Add Video
                            </Button>
                            <input
                              id="video-upload"
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={handleWorkoutVideoUpload}
                            />
                            {postImages.length > 0 && (
                              <span className="text-xs text-gray-600">{postImages.length} images selected</span>
                            )}
                            {workoutVideo && (
                              <span className="text-xs text-gray-600">{workoutVideo.name}</span>
                            )}
                          </div>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              // Always set type to 'community' before posting to the community feed
                              setNewPost(prev => ({ ...prev, type: 'community' }));
                              setTimeout(() => handleCreatePost(), 0); // Ensure state is updated before posting
                            }}
                            disabled={!newPost.content.trim() && postImages.length === 0 && !workoutVideo}
                          >
                            {isUploadingVideo || isUploadingImages ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Divider between post creation and feed */}
              <hr className="my-6 border-t border-gray-300" />

              {/* Feed Content */}
              <div className="space-y-4">
                {getFeedPosts()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Content</h1>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setPostType("workout")
                      setNewPost({
                        ...newPost,
                        type: "workout",
                        visibility: "subscribers",
                        userId: "",
                        createdAt: null,
                      })
                      setCreatingPost(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    New Workout
                  </Button>
                  <Button
                    onClick={() => {
                      setBlogDialogOpen(true)
                      setNewBlogPost({
                        ...newBlogPost,
                        visibility: "subscribers",
                      })
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Blog Post
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {ownPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Video className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No content yet</h3>
                    <p className="text-gray-500 mb-4">Create your first workout or blog post to share with your subscribers.</p>
                    <div className="flex gap-2">
                      <Button onClick={() => { setPostType("workout"); setNewPost({ ...newPost, type: "workout", visibility: "subscribers", userId: "", createdAt: null }); setCreatingPost(true); }} className="bg-orange-500 text-white">New Workout</Button>
                      <Button onClick={() => { setBlogDialogOpen(true); setNewBlogPost({ ...newBlogPost, visibility: "subscribers" }); }} className="bg-blue-500 text-white">New Blog Post</Button>
                    </div>
                  </div>
                ) : (
                  ownPosts.map((post) => (
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
                            {post.content && (
                              <div className="text-gray-800 mt-2 whitespace-pre-line">{post.content}</div>
                            )}
                            {/* Render video for workout posts */}
                            {post.type === "workout" && post.videoLink && (
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                                <video
                                  src={post.videoLink}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {/* Render images for blog or workout posts */}
                            {post.images && post.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                {post.images.map((image: string, index: number) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Post image ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                            {post.videoLink && post.type !== "workout" && (
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
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Subscribers ({dashboardStats.subscribers})</h1>
              {subscribers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No subscribers yet</h3>
                  <p className="text-gray-500">Share your profile link to start gaining subscribers!</p>
                </div>
              ) : (
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
              )}
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
                  onClick={async () => {
                    if (editingProfile) {
                      if (!auth.currentUser) return;
                      // 1. Save to Firestore
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
                        pricing: profileData.pricing
                      };
                      await saveAthleteProfile(auth.currentUser.uid, payload);

                      // 2. Call Stripe pricing API
                      try {
                        const res = await fetch("/api/stripe/update-coach-pricing", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: auth.currentUser.uid,
                            proPrice: profileData.pricing?.pro || 9.99,
                            premiumPrice: profileData.pricing?.premium || 19.99,
                            coachName: profileData.name,
                          }),
                        });
                        const data = await res.json();
                        if (data.stripePriceIds) {
                          // 3. Update Firestore with Stripe Price IDs (merge)
                          await saveAthleteProfile(auth.currentUser.uid, {
                            stripePriceIds: data.stripePriceIds,
                          });
                        }
                      } catch (err) {
                        console.error("Failed to sync Stripe pricing:", err);
                      }

                      // 4. Refetch profile to ensure UI is up to date
                      const updatedProfile = await getAthleteProfile(auth.currentUser.uid);
                      if (updatedProfile) {
                        setProfile(updatedProfile as AthleteProfile);
                        setProfileData(prev => ({
                          ...prev,
                          ...updatedProfile,
                          specialties: updatedProfile.specialties || [],
                          certifications: updatedProfile.certifications || [],
                          pricing: updatedProfile.pricing || { pro: 9.99, premium: 19.99 }
                        }));
                      }
                    }
                    setEditingProfile(!editingProfile);
                  }}
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
                      {editingProfile ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Pro Tier Price ($/month)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <Input
                                  type="number"
                                  min="5"
                                  max="50"
                                  step="0.01"
                                  value={profileData.pricing?.pro || 9.99}
                                  onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    pricing: {
                                      ...prev.pricing,
                                      pro: e.target.value === "" ? 9.99 : parseFloat(e.target.value)
                                    }
                                  }))}
                                  className="pl-7"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Premium Tier Price ($/month)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <Input
                                  type="number"
                                  min="10"
                                  max="100"
                                  step="0.01"
                                  value={profileData.pricing?.premium || 19.99}
                                  onChange={(e) => setProfileData(prev => ({
                                    ...prev,
                                    pricing: {
                                      ...prev.pricing,
                                      premium: e.target.value === "" ? 19.99 : parseFloat(e.target.value)
                                    }
                                  }))}
                                  className="pl-7"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-orange-800">
                              <strong>Note:</strong> Your pricing will be visible to potential subscribers. Consider your expertise, 
                              content quality, and market rates when setting your prices.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-2">Pro: ${profileData.pricing?.pro || 9.99} / Premium: ${profileData.pricing?.premium || 19.99}</div>
                          <div className="text-sm text-green-800">per month</div>
                          <div className="text-xs text-gray-600 mt-2">Set your own rates for Pro and Premium tiers</div>
                        </div>
                      )}
                      <div className="mt-4 text-sm text-gray-600">
                        <p>
                          Members will see your current prices when subscribing.
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
                </div>
              </div>
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
                  <p className="text-gray-600 text-lg">No feedback requests yet.</p>
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
            <div>
              <Label htmlFor="visibility" className="mb-2 block">
                Visibility
              </Label>
              <select
                id="visibility"
                name="visibility"
                value="subscribers"
                disabled
                className="border rounded-md px-2 py-1 text-sm bg-gray-100 cursor-not-allowed"
              >
                <option value="subscribers">Subscribers Only</option>
              </select>
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

      {/* Add Messaging Dialog */}
      {showMessagingDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-none">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Messages</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMessagingDialog(false);
                    setMessagingMember(null);
                    setChatMessages([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex">
              {/* Subscribers List */}
              <div className="w-1/3 border-r pr-4 overflow-y-auto">
                <div className="space-y-2">
                  {subscribers.length === 0 ? (
                    <div className="text-gray-500 text-sm p-4">No subscribers to message yet.</div>
                  ) : (
                    subscribers.map((member: any) => (
                      <div
                        key={member.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 p-3 rounded-lg cursor-pointer transition-colors ${
                          messagingMember?.id === member.id ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setMessagingMember({
                            id: member.id,
                            name: member.name,
                            email: member.email,
                            sport: member.sport || "Sport"
                          });
                          fetchMessages(member.id);
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium mx-auto sm:mx-0">
                          {member.name?.[0] || "M"}
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <p className="font-medium text-sm truncate">{member.name || "Member"}</p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{member.sport || "Sport"}</Badge>
                            <Badge variant="default" className="text-xs bg-green-600">Subscribed</Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate mt-1">{member.email}</p>
                          <p className="text-sm text-gray-500 mt-1">Click to start a conversation</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col pl-4">
                {messagingMember ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {messagingMember.name?.[0] || "M"}
                      </div>
                      <div>
                        <p className="font-medium">{messagingMember.name}</p>
                        <p className="text-sm text-gray-600">{messagingMember.sport}</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === auth.currentUser?.uid
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {message.timestamp?.toDate ? formatDate(message.timestamp.toDate()) : 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex-none pt-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(messagingMember.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleSendMessage(messagingMember.id)}
                          disabled={!messageInput.trim()}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a subscriber to start messaging
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}