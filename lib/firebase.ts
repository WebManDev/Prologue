import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, isSignInWithEmailLink, sendSignInLinkToEmail } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, Timestamp, getDocs, CollectionReference, arrayUnion, updateDoc, serverTimestamp, onSnapshot, orderBy, query, deleteDoc, increment, enableIndexedDbPersistence, arrayRemove, writeBatch, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeAuthPersistence, getRecommendedPersistence, signInWithGooglePersistence } from "./auth-persistence";

const firebaseConfig = {
  apiKey: "AIzaSyBYUD1AZoCCLBGpICzMJ7dvwrsFeF0UWwQ",
  authDomain: "prologue-16d46.firebaseapp.com",
  projectId: "prologue-16d46",
  storageBucket: "prologue-16d46.firebasestorage.app",
  messagingSenderId: "454158631172",
  appId: "1:454158631172:web:36fcc7c7bf1c731b835051",
  measurementId: "G-B7FZLZJBDY"
};

// Check if we're in a browser environment and not during build
const isBrowser = typeof window !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.NODE_ENV === 'production' && typeof window === 'undefined';

// Initialize Firebase only in browser environment
let app: any = null;
let auth: any = null;
let db: any = null;

// Prevent Firebase initialization during build or server-side rendering
if (isBrowser && !isBuild) {
  try {
    // Initialize Firebase
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Firebase client-side features only when in browser environment
    // Enable offline persistence with modern API
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firebase persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser doesn't support persistence
          console.warn('Firebase persistence not supported by browser');
        }
      });
    } catch (error) {
      console.warn('Firebase persistence initialization failed:', error);
    }

    // Initialize auth persistence with user preference or recommended setting
    initializeAuthPersistence(auth).catch((error) => {
      console.error("Error initializing auth persistence:", error);
      // Fallback to local persistence if initialization fails
      setPersistence(auth, browserLocalPersistence).catch((fallbackError) => {
        console.error("Error setting fallback auth persistence:", fallbackError);
      });
    });
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // Set to null if initialization fails
    auth = null;
    db = null;
  }
} else {
  // Create mock objects for server-side rendering and build time
  console.log('Firebase not initialized in server environment or during build');
  auth = null;
  db = null;
}

// Initialize connection state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const initializeFirebase = async () => {
  if (isInitialized) return;
  
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        // Only initialize in browser environment
        if (typeof window !== 'undefined') {
          // Wait for auth to be ready
          await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(() => {
              unsubscribe();
              resolve(true);
            });
          });
        }
        
        isInitialized = true;
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
      }
    })();
  }
  
  return initializationPromise;
};

// Function to save athlete profile
const saveAthleteProfile = async (userId: string, profileData: Record<string, any>) => {
  try {
    await setDoc(doc(db, "athletes", userId), {
      ...profileData,
      lastProfileEdit: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving athlete profile:", error);
    throw error;
  }
};

// Function to get athlete profile
const getAthleteProfile = async (userId: string) => {
  try {
    const docRef = doc(db, "athletes", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting athlete profile:", error);
    throw error;
  }
};

// Enhanced function to get comprehensive athlete profile with all possible fields
const getComprehensiveAthleteProfile = async (userId: string) => {
  try {
    const docRef = doc(db, "athletes", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Return comprehensive athlete data with all possible fields
      return {
        // Basic Identity
        id: userId,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        name: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        email: data.email || "",
        phone: data.phone || "",
        
        // Visual Assets
        profileImageUrl: data.profileImageUrl || data.profilePicture || data.profilePhotoUrl || "",
        coverImage: data.coverImage || data.coverPhotoUrl || "",
        avatar: data.avatar || data.profileImageUrl || data.profilePicture || "",
        
        // Professional Information
        sport: data.sport || "",
        specialty: data.specialty || "",
        specialties: data.specialties || [],
        position: data.position || "",
        type: data.type || data.role || "athlete",
        role: data.role || "athlete",
        bio: data.bio || "",
        experience: data.experience || "",
        
        // Location & Education
        location: data.location || "",
        university: data.university || data.school || "",
        school: data.school || "",
        graduationYear: data.graduationYear || "",
        
        // Achievements & Certifications
        achievements: data.achievements || [],
        certifications: data.certifications || [],
        
        // Ratings & Statistics
        rating: data.rating || 0,
        ratings: data.ratings || {},
        subscribers: data.subscribers || 0,
        posts: data.posts || 0,
        totalStudents: data.totalStudents || 0,
        totalLessons: data.totalLessons || 0,
        followers: data.followers || 0,
        following: data.following || 0,
        views: data.views || 0,
        
        // Subscription & Business
        pricing: data.pricing || { pro: 0, premium: 0 },
        subscriptionPrice: data.subscriptionPrice || data.pricing?.pro || 0,
        stripeAccountId: data.stripeAccountId || null,
        
        // Verification & Quality Indicators
        isVerified: data.isVerified || false,
        responseRate: data.responseRate || "95%",
        avgSessionLength: data.avgSessionLength || "30 min",
        completionRate: data.completionRate || "90%",
        studentSatisfaction: data.studentSatisfaction || "95%",
        
        // Languages & Social Media
        languages: data.languages || ["English"],
        socialMedia: data.socialMedia || {},
        
        // Advanced Statistics
        stats: {
          totalContent: data.stats?.totalContent || data.totalContent || (data.posts || 0),
          totalViews: data.stats?.totalViews || data.totalViews || "0",
          totalHoursCoached: data.stats?.totalHoursCoached || data.totalHoursCoached || 0,
          successStories: data.stats?.successStories || data.successStories || 0,
          avgRating: data.stats?.avgRating || data.rating || 0,
          totalLessons: data.stats?.totalLessons || data.totalLessons || 0,
          studentSatisfaction: data.stats?.studentSatisfaction || data.studentSatisfaction || "95%",
          completionRate: data.stats?.completionRate || data.completionRate || "90%"
        },
        
        // Recent Activity & Engagement
        recentActivity: data.recentActivity || [],
        
        // Timestamps
        joinedDate: data.joinedDate || data.createdAt || "",
        lastProfileEdit: data.lastProfileEdit || "",
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || "",
        
        // Edit tracking
        editCount: data.editCount || 0,
        editWindowStart: data.editWindowStart || "",
        
        // Additional metadata that might exist
        tags: data.tags || [],
        categories: data.categories || [],
        availability: data.availability || {},
        timezone: data.timezone || "",
        website: data.website || "",
        linkedIn: data.linkedIn || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        youtube: data.youtube || "",
        
        // Course/Content specific
        totalVideos: data.totalVideos || 0,
        totalCourses: data.totalCourses || 0,
        totalArticles: data.totalArticles || 0,
        
        // Performance metrics
        engagementRate: data.engagementRate || "0%",
        averageWatchTime: data.averageWatchTime || "0 min",
        contentRating: data.contentRating || 0,
        
        // Subscription tiers info
        subscriptionTiers: data.subscriptionTiers || {},
        
        // Communication preferences
        communicationPreferences: data.communicationPreferences || {},
        notificationSettings: data.notificationSettings || {},
        
        // Coach/Mentor specific fields
        coachingStyle: data.coachingStyle || "",
        trainingPhilosophy: data.trainingPhilosophy || "",
        targetAudience: data.targetAudience || "",
        sessionTypes: data.sessionTypes || [],
        
        // Additional business fields
        businessHours: data.businessHours || {},
        timeSlots: data.timeSlots || [],
        bookingCalendar: data.bookingCalendar || "",
        
        // Raw data for any additional fields not mapped above
        ...data
      };
    } else {
      console.log("No athlete document found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting comprehensive athlete profile:", error);
    throw error;
  }
};

// Enhanced function to get multiple comprehensive athlete profiles
const getComprehensiveAthletesByIds = async (athleteIds: string[]) => {
  if (!athleteIds.length) return [];
  
  try {
    const promises = athleteIds.map(id => getComprehensiveAthleteProfile(id));
    const results = await Promise.all(promises);
    return results.filter(profile => profile !== null);
  } catch (error) {
    console.error("Error fetching comprehensive athlete profiles:", error);
    return [];
  }
};

// Enhanced function to get all athletes with comprehensive data
const getAllComprehensiveAthletes = async () => {
  try {
    const snapshot = await getDocs(collection(db, "athletes"));
    const athletes = await Promise.all(
      snapshot.docs.map(async (doc) => {
        return await getComprehensiveAthleteProfile(doc.id);
      })
    );
    return athletes.filter(athlete => athlete !== null);
  } catch (error) {
    console.error("Error fetching all comprehensive athletes:", error);
    throw error;
  }
};

// Function to get athlete statistics and engagement metrics
const getAthleteAnalytics = async (athleteId: string) => {
  try {
    // Fetch additional analytics from related collections
    const postsSnapshot = await getDocs(
      query(collection(db, "athletePosts"), where("userId", "==", athleteId))
    );
    
    const videosSnapshot = await getDocs(
      query(collection(db, "videos"), where("authorId", "==", athleteId))
    );
    
    const articlesSnapshot = await getDocs(
      query(collection(db, "articles"), where("authorId", "==", athleteId))
    );
    
    const coursesSnapshot = await getDocs(
      query(collection(db, "courses"), where("authorId", "==", athleteId))
    );
    
    // Calculate engagement metrics
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    
    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalViews += data.views || 0;
      totalLikes += data.likes || 0;
      totalComments += data.comments || 0;
    });
    
    videosSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalViews += data.views || 0;
      totalLikes += data.likes || 0;
      totalComments += data.comments || 0;
    });
    
    return {
      totalPosts: postsSnapshot.size,
      totalVideos: videosSnapshot.size,
      totalArticles: articlesSnapshot.size,
      totalCourses: coursesSnapshot.size,
      totalContent: postsSnapshot.size + videosSnapshot.size + articlesSnapshot.size + coursesSnapshot.size,
      totalViews,
      totalLikes,
      totalComments,
      engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) + "%" : "0%"
    };
  } catch (error) {
    console.error("Error fetching athlete analytics:", error);
    return {
      totalPosts: 0,
      totalVideos: 0,
      totalArticles: 0,
      totalCourses: 0,
      totalContent: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      engagementRate: "0%"
    };
  }
};

// Function to save member profile
const saveMemberProfile = async (userId: string, profileData: {
  name: string;
  email: string;
  sport: string;
  role: string;
  [key: string]: any; // Allow additional properties
}) => {
  try {
    await setDoc(doc(db, "members", userId), {
      ...profileData,
      lastProfileEdit: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving member profile:", error);
    throw error;
  }
};

// Function to get member profile
const getMemberProfile = async (userId: string) => {
  try {
    const docRef = doc(db, "members", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting member profile:", error);
    throw error;
  }
};

// Function to upload profile picture
const uploadProfilePicture = async (userId: string, file: File) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `profile-pictures/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Function to upload cover photo
export const uploadCoverPhoto = async (userId: string, file: File) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `cover-photos/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    throw error;
  }
};

// Function to save athlete post (blog, workout, or community)
const saveAthletePost = async (
  userId: string,
  post: { 
    title: string; 
    content: string; 
    description?: string;
    videoLink?: string;
    type: "blog" | "workout" | "community";
    images?: string[];
    tags: string[];
  }
) => {
  try {
    // Force visibility based on post type
    let enforcedVisibility: "public" | "subscribers" = "subscribers";
    if (post.type === "community") {
      enforcedVisibility = "public";
    }
    // Add the post
    const postRef = await addDoc(collection(db, "athletePosts"), {
      ...post,
      visibility: enforcedVisibility, // Override any provided visibility
      userId,
      createdAt: Timestamp.now(),
      views: 0,
      likes: 0,
      comments: 0,
    });
    // Increment the posts count in the athlete profile
    const athleteRef = doc(db, "athletes", userId);
    await updateDoc(athleteRef, {
      posts: (await getDoc(athleteRef)).data()?.posts + 1 || 1
    });
    
    // Notify subscribers if this is a subscriber-only post
    if (enforcedVisibility === "subscribers") {
      await notifySubscribersOfNewPost(userId, {
        id: postRef.id,
        title: post.title,
        type: post.type,
        description: post.description
      });
    }
    
    return postRef;
  } catch (error) {
    console.error("Error saving athlete post:", error);
    throw error;
  }
};

// Function to get all athletes
const getAllAthletes = async () => {
  try {
    const snapshot = await getDocs(collection(db, "athletes"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all athletes:", error);
    throw error;
  }
};

// Add athleteId to member's subscriptions
const addSubscriptionForMember = async (
  userId: string,
  athleteId: string,
  plan: 'basic' | 'pro' | 'premium',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) => {
  const userRef = doc(db, "members", userId);
  const userSnap = await getDoc(userRef);
  const member = userSnap.data() || {};
  const now = new Date().toISOString();
  const newSub: any = {
    status: "active",
    lastPaymentDate: now,
    cancelAt: null,
    plan,
  };
  if (stripeCustomerId) newSub.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) newSub.stripeSubscriptionId = stripeSubscriptionId;
  await updateDoc(userRef, {
    [`subscriptions.${athleteId}`]: newSub,
    [`subscriptionDates.${athleteId}`]: now,
    [`subscriptionPlans.${athleteId}`]: plan
  });
  // Increment the athlete's subscribers count
  const athleteRef = doc(db, "athletes", athleteId);
  const athleteSnap = await getDoc(athleteRef);
  const currentSubscribers = athleteSnap.data()?.subscribers || 0;
  await updateDoc(athleteRef, {
    subscribers: currentSubscribers + 1
  });
};

// Fetch multiple athlete profiles by IDs
const getAthletesByIds = async (athleteIds: string[]) => {
  if (!athleteIds.length) return [];
  const docsSnap = await Promise.all(
    athleteIds.map(id => getDoc(doc(db, "athletes", id)))
  );
  return docsSnap.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }));
};

// Add this function
const rateAthlete = async (athleteId: string, userId: string, rating: number) => {
  const athleteRef = doc(db, "athletes", athleteId);
  const athleteSnap = await getDoc(athleteRef);
  const data = athleteSnap.data() || {};
  const ratings = data.ratings || {};
  ratings[userId] = rating;
  // Calculate new average
  const ratingValues = Object.values(ratings).map(Number);
  const avgRating = ratingValues.length > 0 ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) : 0;
  await updateDoc(athleteRef, {
    ratings,
    rating: Math.round(avgRating * 10) / 10 // one decimal
  });
};

// Get chat document ID (order IDs for uniqueness)
export function getChatId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

// Send a message
export async function sendMessage({ memberId, athleteId, senderId, senderRole, content, type = "text" }: {
  memberId: string,
  athleteId: string,
  senderId: string,
  senderRole: string,
  content: string,
  type?: string,
}) {
  const chatId = getChatId(memberId, athleteId);
  const messagesRef = collection(db, "chats", chatId, "messages");
  
  // Add the message to the chat
  await addDoc(messagesRef, {
    senderId,
    senderRole,
    content,
    type,
    timestamp: serverTimestamp(),
  });

  // Create notification for the recipient
  try {
    const recipientId = senderId === memberId ? athleteId : memberId;
    const recipientCollection = senderRole === "member" ? "athletes" : "members";
    const senderCollection = senderRole === "member" ? "members" : "athletes";
    
    // Get sender info for notification
    const senderDoc = await getDoc(doc(db, senderCollection, senderId));
    const senderData = senderDoc.exists() ? senderDoc.data() : {};
    const senderName = senderData.firstName ? 
      `${senderData.firstName} ${senderData.lastName || ""}` : 
      (senderData.name || (senderRole === "member" ? "Member" : "Athlete"));

    // Create notification
    await addDoc(collection(db, "notifications"), {
      type: "message",
      title: `New Message from ${senderRole === "member" ? "Member" : "Coach"}`,
      message: `${senderName} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      recipientId,
      senderId,
      senderName,
      priority: "high",
      category: "Direct Message",
      actionType: "view_message",
      actionUrl: senderRole === "member" ? `/messaging?member=${senderId}` : `/member-messaging?coach=${senderId}`,
      metadata: {
        messagePreview: content.substring(0, 100),
        conversationId: chatId,
        messageType: type
      },
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error("Error creating message notification:", error);
    // Don't throw error here - message was still sent successfully
  }
}

// Listen for messages (real-time)
export function listenForMessages({ memberId, athleteId, callback }: {
  memberId: string,
  athleteId: string,
  callback: (messages: any[]) => void,
}) {
  const chatId = getChatId(memberId, athleteId);
  const messagesRef = collection(db, "chats", chatId, "messages");
  return onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

// Fetch all members who are subscribed to a given athlete
export const getSubscribersForAthlete = async (athleteId: string) => {
  const membersRef = collection(db, "members");
  const snapshot = await getDocs(membersRef);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(member => 
      (member as any).subscriptions &&
      typeof (member as any).subscriptions === "object" &&
      (member as any).subscriptions[athleteId] &&
      (member as any).subscriptions[athleteId].status === "active"
    );
};

// Utility function to ensure athlete document exists in Firebase
export const ensureAthleteDocumentExists = async (athleteId: string, athleteData?: any) => {
  try {
    const athleteRef = doc(db, "athletes", athleteId);
    const athleteSnap = await getDoc(athleteRef);
    
    if (!athleteSnap.exists()) {
      // Create the document with default values
      await setDoc(athleteRef, {
        ...athleteData,
        followers: 0,
        subscribers: 0,
        posts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error ensuring athlete document exists:", error);
  }
};

// Follow/Unfollow functionality
export const followCreator = async (memberId: string, creatorId: string) => {
  try {
    if (!auth?.currentUser || auth.currentUser.uid !== memberId) {
      throw new Error("User not authenticated");
    }

    // Ensure athlete document exists
    await ensureAthleteDocumentExists(creatorId);

    const batch = writeBatch(db);
    
    // Add to member's following list
    const memberRef = doc(db, "members", memberId);
    batch.update(memberRef, {
      [`following.${creatorId}`]: {
        followedAt: serverTimestamp(),
        status: "active"
      }
    });
    
    // Increment athlete's followers count
    const athleteRef = doc(db, "athletes", creatorId);
    batch.update(athleteRef, {
      followers: increment(1)
    });
    
    await batch.commit();
    console.log(`Successfully followed creator: ${creatorId}`);

    // Get member profile for notification
    try {
      const memberProfile = await getMemberProfile(memberId);
      const athleteProfile = await getAthleteProfile(creatorId);
      
      if (memberProfile && athleteProfile) {
        const followerName = `${memberProfile.firstName || ""} ${memberProfile.lastName || ""}`.trim() || memberProfile.name || "Someone";
        
        // Create notification for the athlete
        await createNotification({
          type: "social",
          title: "New Follower",
          message: `${followerName} started following you!`,
          recipientId: creatorId,
          senderId: memberId,
          senderName: followerName,
          priority: "low",
          category: "New Follower",
          actionType: "view_profile",
          actionUrl: `/member/${memberId}`,
          metadata: {
            followerId: memberId,
            followerName: followerName
          }
        });
      }
    } catch (notificationError) {
      // Don't fail the follow if notification fails
      console.log("Could not send follow notification:", notificationError);
    }
  } catch (error) {
    console.error("Error following creator:", error);
    throw error;
  }
};

export const unfollowCreator = async (memberId: string, creatorId: string) => {
  try {
    if (!auth?.currentUser || auth.currentUser.uid !== memberId) {
      throw new Error("User not authenticated");
    }

    // Ensure athlete document exists
    await ensureAthleteDocumentExists(creatorId);

    const batch = writeBatch(db);
    
    // Remove from member's following list
    const memberRef = doc(db, "members", memberId);
    batch.update(memberRef, {
      [`following.${creatorId}`]: null
    });
    
    // Decrement athlete's followers count (ensure it doesn't go below 0)
    const athleteRef = doc(db, "athletes", creatorId);
    const athleteSnap = await getDoc(athleteRef);
    const currentFollowers = athleteSnap.data()?.followers || 0;
    
    batch.update(athleteRef, {
      followers: Math.max(0, currentFollowers - 1)
    });
    
    await batch.commit();
    console.log(`Successfully unfollowed creator: ${creatorId}`);
  } catch (error) {
    console.error("Error unfollowing creator:", error);
    throw error;
  }
};

export const getMemberFollowing = async (memberId: string) => {
  try {
    const memberRef = doc(db, "members", memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      const memberData = memberSnap.data();
      const following = memberData.following || {};
      
      // Return array of creator IDs that user is following
      return Object.keys(following).filter(creatorId => 
        following[creatorId] && following[creatorId].status === "active"
      );
    }
    
    return [];
  } catch (error) {
    console.error("Error getting member following:", error);
    return [];
  }
};

export const isFollowing = async (memberId: string, creatorId: string) => {
  try {
    const memberRef = doc(db, "members", memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      const memberData = memberSnap.data();
      const following = memberData.following || {};
      return !!(following[creatorId] && following[creatorId].status === "active");
    }
    
    return false;
  } catch (error) {
    console.error("Error checking if following:", error);
    return false;
  }
};

export const getFollowersForCreator = async (creatorId: string) => {
  try {
    const memberDocs = await getDocs(collection(db, "members"));
    const followers = [];
    
    for (const memberDoc of memberDocs.docs) {
      const memberData = memberDoc.data();
      const following = memberData.following || {};
      
      if (following[creatorId] && following[creatorId].status === "active") {
        followers.push({
          id: memberDoc.id,
          ...memberData,
          followedAt: following[creatorId].followedAt
        });
      }
    }
    
    return followers;
  } catch (error) {
    console.error("Error getting followers for creator:", error);
    return [];
  }
};

// Function to update athlete post
const updateAthletePost = async (
  postId: string,
  updates: {
    title?: string;
    content?: string;
    description?: string;
    videoLink?: string;
    type?: "blog" | "workout" | "community";
    images?: string[];
    visibility?: "public" | "subscribers";
    tags?: string[];
  }
) => {
  try {
    const postRef = doc(db, "athletePosts", postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating athlete post:", error);
    throw error;
  }
};

// Function to delete athlete post
const deleteAthletePost = async (postId: string, userId: string) => {
  try {
    // Delete the post
    const postRef = doc(db, "athletePosts", postId);
    await deleteDoc(postRef);
    
    // Decrement the posts count in the athlete profile
    const athleteRef = doc(db, "athletes", userId);
    await updateDoc(athleteRef, {
      posts: increment(-1)
    });
  } catch (error) {
    console.error("Error deleting athlete post:", error);
    throw error;
  }
};

// Smart authentication function that uses popup with fallback to redirect
const smartSignIn = async (provider: GoogleAuthProvider) => {
  try {
    // Use the persistence-aware Google sign-in
    const result = await signInWithGooglePersistence(auth, 'local', true);
    return result;
  } catch (error: any) {
    // If popup fails (e.g., blocked by browser), fall back to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log('Popup blocked or closed, falling back to redirect...');
      await signInWithGooglePersistence(auth, 'local', false);
      // Note: The redirect result will be handled when the page reloads
      return null;
    }
    throw error;
  }
};

// Handle redirect result
const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result;
    }
  } catch (error) {
    console.error('Error handling redirect result:', error);
    throw error;
  }
  return null;
};

// Create a notification
export const createNotification = async (notificationData: {
  type: string;
  title: string;
  message: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  priority: "high" | "medium" | "low";
  category: string;
  actionType?: string;
  actionUrl?: string;
  metadata?: any;
}) => {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Like/Unlike a post (supports both athletePosts and posts collections)
export const likePost = async (postId: string, userId: string) => {
  try {
    // Try athletePosts first
    let postRef = doc(db, "athletePosts", postId);
    let postSnap = await getDoc(postRef);
    let isAthletePost = postSnap.exists();
    
    // If not found in athletePosts, try posts collection
    if (!isAthletePost) {
      postRef = doc(db, "posts", postId);
      postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        console.error("Post not found in either collection");
        return;
      }
    }
    
    const data = postSnap.data();
    if (!data) return;
    
    const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
    
    if (likedBy.includes(userId)) {
      // Unlike the post
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: Math.max((data.likes || 0) - 1, 0)
      });
    } else {
      // Like the post
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: (data.likes || 0) + 1
      });
      
      // Create notification for the post author if not liking own post
      const postAuthorId = data.userId || data.createdBy;
      if (postAuthorId && userId !== postAuthorId) {
        // Get user profile to get the name
        let userProfile;
        try {
          userProfile = await getMemberProfile(userId);
          if (!userProfile) {
            userProfile = await getAthleteProfile(userId);
          }
        } catch (error) {
          console.error("Error getting user profile:", error);
        }

        const userName = userProfile 
          ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || userProfile.name || "Someone"
          : "Someone";

        await createNotification({
          type: "social",
          title: "New Like on Your Post",
          message: `${userName} liked your post "${data.title || data.content?.substring(0, 50) || "your post"}".`,
          recipientId: postAuthorId,
          senderId: userId,
          senderName: userName,
          priority: "low",
          category: "Post Like",
          actionType: "view_post",
          actionUrl: isAthletePost ? `/post/${postId}` : `/member-home#post-${postId}`,
          metadata: {
            postId: postId,
            postTitle: data.title || "Untitled",
            likeCount: (data.likes || 0) + 1
          }
        });
      }
    }
  } catch (error) {
    console.error("Error liking post:", error);
  }
};

// Add a comment to a post (supports both athletePosts and posts collections)
export const addCommentToPost = async (postId: string, userId: string, comment: string) => {
  try {
    // Try athletePosts first
    let postRef = doc(db, "athletePosts", postId);
    let postSnap = await getDoc(postRef);
    let isAthletePost = postSnap.exists();
    
    // If not found in athletePosts, try posts collection
    if (!isAthletePost) {
      postRef = doc(db, "posts", postId);
      postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        console.error("Post not found in either collection");
        return;
      }
    }
    
    const postData = postSnap.data();
    if (!postData) return;
    
    const commentsRef = collection(postRef, "comments");
    
    // Add the comment
    await addDoc(commentsRef, {
      userId,
      createdBy: userId, // Support both field names
      comment,
      content: comment, // Support both field names
      createdAt: serverTimestamp(),
    });
    
    // Increment comment count
    await updateDoc(postRef, {
      comments: increment(1)
    });
    
    // Create notification for the post author if not commenting on own post
    const postAuthorId = postData.userId || postData.createdBy;
    if (postAuthorId && userId !== postAuthorId) {
      // Get user profile to get the name
      let userProfile;
      try {
        userProfile = await getMemberProfile(userId);
        if (!userProfile) {
          userProfile = await getAthleteProfile(userId);
        }
      } catch (error) {
        console.error("Error getting user profile:", error);
      }

      const userName = userProfile 
        ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || userProfile.name || "Someone"
        : "Someone";

      await createNotification({
        type: "social",
        title: "New Comment on Your Post",
        message: `${userName} commented on your post "${postData.title || postData.content?.substring(0, 50) || "your post"}": "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        recipientId: postAuthorId,
        senderId: userId,
        senderName: userName,
        priority: "medium",
        category: "Post Comment",
        actionType: "view_post",
        actionUrl: isAthletePost ? `/post/${postId}` : `/member-home#post-${postId}`,
        metadata: {
          postId: postId,
          postTitle: postData.title || "Untitled",
          commentPreview: comment.substring(0, 100),
          commentCount: (postData.comments || 0) + 1
        }
      });
    }
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};

// Function to create a notification for a member
const createMemberNotification = async (
  memberId: string,
  notification: {
    type: 'new_post' | 'new_workout' | 'new_blog' | 'new_feedback' | 'new_feed';
    title: string;
    message: string;
    coachId: string;
    coachName: string;
    postId?: string;
    feedbackRequestId?: string;
    data?: any;
  }
) => {
  try {
    await addDoc(collection(db, "members", memberId, "notifications"), {
      ...notification,
      createdAt: Timestamp.now(),
      read: false,
    });
  } catch (error) {
    console.error("Error creating member notification:", error);
    throw error;
  }
};

// Function to get member notifications
const getMemberNotifications = async (memberId: string) => {
  try {
    const notificationsRef = collection(db, "members", memberId, "notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting member notifications:", error);
    throw error;
  }
};

// Function to mark notification as read
const markNotificationAsRead = async (memberId: string, notificationId: string) => {
  try {
    const notificationRef = doc(db, "members", memberId, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Function to mark all notifications as read
const markAllNotificationsAsRead = async (memberId: string) => {
  try {
    const notificationsRef = collection(db, "members", memberId, "notifications");
    const q = query(notificationsRef, where("read", "==", false));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Function to notify all subscribers when a coach creates a post
const notifySubscribersOfNewPost = async (
  coachId: string,
  post: {
    id: string;
    title: string;
    type: "blog" | "workout" | "community";
    description?: string;
  }
) => {
  try {
    // Get all subscribers for this coach
    const subscribers = await getSubscribersForAthlete(coachId);
    const coachProfile = await getAthleteProfile(coachId);
    
    if (!subscribers.length || !coachProfile) return;
    
    // Create notifications for all subscribers
    const notificationPromises = subscribers.map(subscriber => {
      const notificationType = post.type === "workout" ? "new_workout" : 
                              post.type === "blog" ? "new_blog" : "new_feed";
      
      const title = post.type === "workout" ? "New Workout Available" :
                   post.type === "blog" ? "New Blog Post" : "New Community Post";
      
      const message = post.type === "workout" ? `${coachProfile.name} posted a new workout: ${post.title}` :
                     post.type === "blog" ? `${coachProfile.name} published a new blog: ${post.title}` :
                     `${coachProfile.name} shared a new post: ${post.title}`;
       
       return createMemberNotification(subscriber.id, {
         type: notificationType,
         title,
         message,
         coachId,
         coachName: coachProfile.name || "Coach",
         postId: post.id,
         data: {
           postTitle: post.title,
           postDescription: post.description,
           postType: post.type
         }
       });
     });
     
     await Promise.all(notificationPromises);
   } catch (error) {
     console.error("Error notifying subscribers of new post:", error);
   }
 };
 
 // Function to notify member when coach provides video feedback
 const notifyMemberOfFeedback = async (
   memberId: string,
   coachId: string,
   feedbackRequestId: string,
   feedbackText: string
 ) => {
   try {
     const coachProfile = await getAthleteProfile(coachId);
     
     await createMemberNotification(memberId, {
       type: "new_feedback",
       title: "Video Feedback Received",
       message: `${coachProfile?.name || "Coach"} has provided feedback on your video submission`,
       coachId,
       coachName: coachProfile?.name || "Coach",
       feedbackRequestId,
       data: {
         feedbackText: feedbackText.substring(0, 100) + (feedbackText.length > 100 ? "..." : "")
       }
     });
   } catch (error) {
     console.error("Error notifying member of feedback:", error);
   }
 };
 
 // Platform Feedback
 export async function addFeedback({ type, title, message, userId }: { type: string; title: string; message: string; userId?: string }) {
   if (!db) return null;
   console.log("addFeedback called", { type, title, message, userId });
   const docRef = await addDoc(collection(db, "platformFeedback"), {
     type,
     title,
     message,
     userId: userId || null,
     createdAt: serverTimestamp(),
     status: "new",
     response: null,
     respondedAt: null,
   });
   console.log("addFeedback docRef:", docRef);
   return docRef;
 }
 
 export async function getAllFeedback() {
   if (!db) return [];
   const snapshot = await getDocs(collection(db, "platformFeedback"))
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
 }
 
 export async function respondToFeedback(feedbackId: string, response: string) {
   if (!db) return null;
   const feedbackRef = doc(db, "platformFeedback", feedbackId)
   return await updateDoc(feedbackRef, {
     response,
     status: "responded",
     respondedAt: serverTimestamp(),
   })
 }
 
 // Platform Updates
 export async function addUpdate({ title, message, createdBy }: { title: string; message: string; createdBy: string }) {
   if (!db) return null;
   return await addDoc(collection(db, "platformUpdates"), {
     title,
     message,
     createdBy,
     createdAt: serverTimestamp(),
   })
 }
 
 export async function getAllUpdates() {
   if (!db) return [];
   const snapshot = await getDocs(collection(db, "platformUpdates"))
   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
 }
 
 // Export everything in a single statement
export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  saveAthleteProfile,
  getAthleteProfile,
  saveMemberProfile,
  getMemberProfile,
  uploadProfilePicture,
  saveAthletePost,
  getAllAthletes,
  addSubscriptionForMember,
  getAthletesByIds,
  rateAthlete,
  updateAthletePost,
  deleteAthletePost,
  GoogleAuthProvider,
  smartSignIn,
  handleRedirectResult,
  initializeFirebase,
  db,
  createMemberNotification,
  getMemberNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  notifySubscribersOfNewPost,
  notifyMemberOfFeedback,
  app,
  getComprehensiveAthleteProfile,
  getComprehensiveAthletesByIds,
  getAllComprehensiveAthletes,
  getAthleteAnalytics
};