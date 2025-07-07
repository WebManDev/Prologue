import type { NextApiRequest, NextApiResponse } from "next";
import { doc, updateDoc } from "firebase/firestore";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, stripeSubscriptionId } = req.body;
  if (!userId || !stripeSubscriptionId) return res.status(400).json({ error: "Missing parameters" });

  try {
    // Cancel subscription in Stripe
    await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });

    // Update Firestore
    const memberRef = doc(db, "members", userId);
    await updateDoc(memberRef, {
      [`subscriptions.${stripeSubscriptionId}.status`]: "canceled",
    });

    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
} 