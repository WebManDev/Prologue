"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CoachDashboard } from "@/components/coach-dashboard";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";

export default function AthleteDashboardPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run auth check if we're on client side and auth is available
    if (!isClient || !auth) {
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