import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe("sk_test_51RTKV905oLGlYeZ0Xn4UdqK51tP3a8yUFs0fqHUQr56s7AKx2uUeNjbgb9K2g0EL4suY05tfROpWYhasGgL3Rec400yiOHmTON", {
  apiVersion: "2025-05-28.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Create a Stripe Connect account with required settings
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      settings: {
        payouts: {
          schedule: {
            interval: "manual"
          }
        }
      }
    });

    if (!account || !account.id) {
      throw new Error("Failed to create Stripe account");
    }

    res.status(200).json({ 
      account: account.id
    });
  } catch (error: any) {
    console.error("Error creating Stripe Connect account:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create Stripe Connect account"
    });
  }
} 