import { initializeApp } from "firebase/app";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('Firebase persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.warn('Firebase persistence not supported by browser');
  }
});

// Initialize auth persistence with user preference or recommended setting
initializeAuthPersistence(auth).catch((error) => {
  console.error("Error initializing auth persistence:", error);
  // Fallback to local persistence if initialization fails
  setPersistence(auth, browserLocalPersistence).catch((fallbackError) => {
    console.error("Error setting fallback auth persistence:", fallbackError);
  });
});

// Initialize connection state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const initializeFirebase = async () => {
  if (isInitialized) return;
  
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        // Wait for auth to be ready
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged(() => {
            unsubscribe();
            resolve(true);
          });
        });
        
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
const addSubscriptionForMember = async (userId: string, athleteId: string, plan: 'basic' | 'pro' | 'premium') => {
  const userRef = doc(db, "members", userId);
  const userSnap = await getDoc(userRef);
  const member = userSnap.data() || {};
  const now = new Date().toISOString();
  const newSub = {
    status: "active",
    lastPaymentDate: now,
    cancelAt: null,
    plan,
  };
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
  await addDoc(messagesRef, {
    senderId,
    senderRole,
    content,
    type,
    timestamp: serverTimestamp(),
  });
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

// Like/Unlike a post
export const likePost = async (postId: string, userId: string) => {
  const postRef = doc(db, "athletePosts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;
  const data = postSnap.data();
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
    // Send notification to coach if not liking own post
    if (data.userId && userId !== data.userId) {
      fetch('/api/coach-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: data.userId,
          type: 'like',
          message: `Someone liked your post: "${data.title || 'Untitled'}"`,
        }),
      });
    }
  }
};

// Add a comment to a post
export const addCommentToPost = async (postId: string, userId: string, comment: string) => {
  const postRef = doc(db, "athletePosts", postId);
  const commentsRef = collection(postRef, "comments");
  await addDoc(commentsRef, {
    userId,
    comment,
    createdAt: serverTimestamp(),
  });
  // Increment comment count
  await updateDoc(postRef, {
    comments: increment(1)
  });
  // Send notification to coach if not commenting on own post
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();
  if (postData?.userId && userId !== postData.userId) {
    fetch('/api/coach-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coachId: postData.userId,
        type: 'comment',
        message: `Someone commented on your post: "${postData.title || 'Untitled'}"`,
      }),
    });
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
  const snapshot = await getDocs(collection(db, "platformFeedback"))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function respondToFeedback(feedbackId: string, response: string) {
  const feedbackRef = doc(db, "platformFeedback", feedbackId)
  return await updateDoc(feedbackRef, {
    response,
    status: "responded",
    respondedAt: serverTimestamp(),
  })
}

// Platform Updates
export async function addUpdate({ title, message, createdBy }: { title: string; message: string; createdBy: string }) {
  return await addDoc(collection(db, "platformUpdates"), {
    title,
    message,
    createdBy,
    createdAt: serverTimestamp(),
  })
}

export async function getAllUpdates() {
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
  app
}; 