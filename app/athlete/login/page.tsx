"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AthleteLoginPage from "./AthleteLoginPage";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  smartSignIn,
  saveAthleteProfile,
  auth,
} from "@/lib/firebase";

const AthleteLoginPageContainer: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      if (isSignUp) {
        // Sign up logic
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        // Save athlete profile (add more fields as needed)
        await saveAthleteProfile(userCredential.user.uid, {
          email: formData.email,
          // Add more default fields if needed
        });
        router.push("/athlete/dashboard");
      } else {
        // Sign in logic
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        router.push("/athlete/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    window.history.back();
  };

  const onGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(undefined);
    try {
      const provider = new GoogleAuthProvider();
      const result = await smartSignIn(provider);
      if (result && result.user) {
        // Optionally, create athlete profile if new user
        // await saveAthleteProfile(result.user.uid, { email: result.user.email });
        router.push("/athlete/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const onToggleSignUp = () => {
    setIsSignUp((prev) => !prev);
    setError(undefined);
  };

  return (
    <AthleteLoginPage
      isSignUp={isSignUp}
      loading={loading}
      error={error}
      formData={formData}
      setFormData={setFormData}
      onSubmit={onSubmit}
      onBack={onBack}
      onGoogleSignIn={onGoogleSignIn}
      googleLoading={googleLoading}
      onToggleSignUp={onToggleSignUp}
    />
  );
};

export default AthleteLoginPageContainer; 