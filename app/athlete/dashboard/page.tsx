"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CoachDashboard } from "@/components/coach-dashboard";
import type { User } from "firebase/auth";

// Dynamically import Firebase to prevent issues during build
let auth: any = null;

export default function AthleteDashboardPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side and initialize Firebase
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { auth: firebaseAuth } = await import("@/lib/firebase");
          auth = firebaseAuth;
          setIsClient(true);
        } catch (error) {
          console.error("Error loading Firebase:", error);
          setIsClient(true);
        }
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Only run auth check if we're on client side and auth is available
    if (!isClient || !auth) {
      if (isClient && !auth) {
        // If we're on client but auth is null, redirect to login
        router.push("/");
      }
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (!user) {
        router.push("/");
        return;
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router, isClient]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading while checking if we're on client side or checking auth
  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isClient ? "Loading..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  return <CoachDashboard onLogout={handleLogout} />;
} 