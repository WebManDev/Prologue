import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

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

export { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  saveAthleteProfile
}; 