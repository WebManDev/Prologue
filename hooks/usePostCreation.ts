import { useState } from 'react'
import { auth, saveAthletePost } from "@/lib/firebase"
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore"

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

interface UsePostCreationProps {
  newPost: PostData;
  setNewPost: (post: PostData) => void;
  setCreatingPost: (creating: boolean) => void;
  setSuccessMessage: (message: string | null) => void;
  publicPostCount: number;
  setPublicPostCount: (count: number) => void;
  publicPostWindowStart: string | null;
  setPublicPostWindowStart: (start: string | null) => void;
  setCanPostPublic: (canPost: boolean) => void;
  setShowPostLimitModal: (show: boolean) => void;
}

export const usePostCreation = ({
  newPost,
  setNewPost,
  setCreatingPost,
  setSuccessMessage,
  publicPostCount,
  setPublicPostCount,
  publicPostWindowStart,
  setPublicPostWindowStart,
  setCanPostPublic,
  setShowPostLimitModal
}: UsePostCreationProps) => {
  const db = getFirestore()

  const handleCreatePost = async () => {
    if (!auth.currentUser) return;
    
    const now = new Date();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;
    
    // Check if this is a public post
    const isPublicPost = newPost.visibility === "public";
    
    if (isPublicPost) {
      // If this is the first public post in a new window, set the window start
      if (!publicPostWindowStart) {
        setPublicPostWindowStart(now.toISOString());
      }
      
      // Check if we've hit the limit
      if (publicPostCount >= 5) {
        setShowPostLimitModal(true);
        return;
      }
      
      // Increment public post count
      const newPostCount = publicPostCount + 1;
      setPublicPostCount(newPostCount);
      
      // Update Firestore with new post count and window start
      await updateDoc(doc(db, "athletes", auth.currentUser.uid), {
        publicPostCount: newPostCount,
        publicPostWindowStart: publicPostWindowStart || now.toISOString()
      });
      
      // Update local state
      setCanPostPublic(newPostCount < 5);
    }

    // Continue with post creation
    const postData = {
      ...newPost,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await saveAthletePost(auth.currentUser.uid, postData);
      setCreatingPost(false);
      
      // Show success message based on post type
      if (newPost.type === "workout") {
        setSuccessMessage("Successfully made a workout!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      
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
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  return { handleCreatePost };
}; 