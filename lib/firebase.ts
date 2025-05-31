import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, Timestamp, getDocs, CollectionReference, arrayUnion, updateDoc, serverTimestamp, onSnapshot, orderBy, query, deleteDoc, increment } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Function to save athlete profile
const saveAthleteProfile = async (userId: string, profileData: {
  name: string;
  email: string;
  sport: string;
  role: string;
  bio?: string;
  specialties?: string[];
  location?: string;
  experience?: string;
  certifications?: string[];
  achievements?: string;
  profilePicture?: string;
}) => {
  try {
    await setDoc(doc(db, "athletes", userId), {
      ...profileData,
      createdAt: new Date().toISOString(),
      subscribers: 0,
      posts: 0,
      rating: 0,
      stripeAccountId: null,
      subscriptionStatus: "inactive"
    });
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
}) => {
  try {
    await setDoc(doc(db, "members", userId), {
      ...profileData,
      createdAt: new Date().toISOString(),
      subscriptions: [],
      savedContent: [],
      preferences: {
        notifications: true,
        emailUpdates: true
      }
    });
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

// Function to save athlete post (blog or workout)
const saveAthletePost = async (
  userId: string,
  post: { 
    title: string; 
    content: string; 
    description?: string;
    videoLink?: string;
    type: "blog" | "workout";
    coverImage?: string;
  }
) => {
  try {
    // Add the post
    const postRef = await addDoc(collection(db, "athletePosts"), {
      ...post,
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
const addSubscriptionForMember = async (userId: string, athleteId: string) => {
  const userRef = doc(db, "members", userId);
  const userSnap = await getDoc(userRef);
  const member = userSnap.data() || {};
  await updateDoc(userRef, {
    subscriptions: arrayUnion(athleteId),
    subscriptionDates: { ...(member.subscriptionDates || {}), [athleteId]: new Date().toISOString() }
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
export async function sendMessage({ memberId, athleteId, senderId, senderRole, content }: {
  memberId: string,
  athleteId: string,
  senderId: string,
  senderRole: string,
  content: string,
}) {
  const db = getFirestore();
  const chatId = getChatId(memberId, athleteId);
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    senderRole,
    content,
    timestamp: serverTimestamp(),
  });
}

// Listen for messages (real-time)
export function listenForMessages({ memberId, athleteId, callback }: {
  memberId: string,
  athleteId: string,
  callback: (messages: any[]) => void,
}) {
  const db = getFirestore();
  const chatId = getChatId(memberId, athleteId);
  const messagesRef = collection(db, "chats", chatId, "messages");
  return onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

// Fetch all members who are subscribed to a given athlete
export const getSubscribersForAthlete = async (athleteId: string) => {
  const db = getFirestore();
  const membersRef = collection(db, "members");
  const snapshot = await getDocs(membersRef);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(member => Array.isArray((member as any).subscriptions) && (member as any).subscriptions.includes(athleteId));
};

// Function to update athlete post
const updateAthletePost = async (
  postId: string,
  updates: {
    title?: string;
    content?: string;
    description?: string;
    videoLink?: string;
    type?: "blog" | "workout";
    coverImage?: string;
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
}; 