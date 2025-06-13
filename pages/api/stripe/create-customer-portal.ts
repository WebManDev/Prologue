import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the Firebase ID token from cookies (or headers)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      const userId = decoded.uid;
      console.log("Authenticated user:", userId);

      // Get the member's Stripe customer ID from Firestore
      const memberRef = adminDb.collection("members").doc(userId);
      const memberSnap = await memberRef.get();
      
      if (!memberSnap.exists) {
        console.error("Member not found:", userId);
        return res.status(404).json({ error: "Member not found" });
      }
      
      const member = memberSnap.data();
      console.log("Member data:", member);
      
      const stripeCustomerId = member?.stripeCustomerId;
      if (!stripeCustomerId) {
        console.error("No Stripe customer ID found for member:", userId);
        return res.status(400).json({ error: "No Stripe customer ID found for this member." });
      }

      // Get the athlete's Stripe account ID
      const { athleteId } = req.body;
      if (!athleteId) {
        console.error("Missing athleteId in request body");
        return res.status(400).json({ error: "Athlete ID is required" });
      }

      const athleteRef = adminDb.collection("athletes").doc(athleteId);
      const athleteSnap = await athleteRef.get();
      
      if (!athleteSnap.exists) {
        console.error("Athlete not found:", athleteId);
        return res.status(404).json({ error: "Athlete not found" });
      }
      
      const athlete = athleteSnap.data();
      console.log("Athlete data:", athlete);
      
      const athleteStripeAccountId = athlete?.stripeAccountId;
      if (!athleteStripeAccountId) {
        console.error("Athlete has no Stripe account:", athleteId);
        return res.status(400).json({ error: "Athlete has not set up their payment account" });
      }

      // Create a Stripe customer portal session
      console.log("Creating portal session for customer:", stripeCustomerId);
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/member/settings`,
      });

      console.log("Portal session created:", portalSession.url);
      return res.status(200).json({ url: portalSession.url });
    } catch (authError) {
      console.error("Error verifying ID token:", authError);
      return res.status(401).json({ error: "Invalid authentication token" });
    }
  } catch (err: any) {
    console.error("Error creating Stripe customer portal session:", err);
    return res.status(500).json({ 
      error: err.message || "Internal server error",
      details: err.stack
    });
  }
} 