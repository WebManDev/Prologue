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
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: "Missing account ID" });
    }

    // Create a login link for the existing Stripe account
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    res.status(200).json({ 
      loginUrl: loginLink.url 
    });
  } catch (error: any) {
    console.error("Error creating Stripe login link:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create login link"
    });
  }
} 