import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, Timestamp, getDocs, CollectionReference } from "firebase/firestore";
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
    return await addDoc(collection(db, "athletePosts"), {
      ...post,
      userId,
      createdAt: Timestamp.now(),
      views: 0,
      likes: 0,
      comments: 0,
    });
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
}; 