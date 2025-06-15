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
    const { account } = req.body;
    if (!account) {
      return res.status(400).json({ error: "Missing account ID" });
    }

    const accountLink = await stripe.accountLinks.create({
      account: account,
      return_url: `${req.headers.origin}/coach/settings/return/${account}`,
      refresh_url: `${req.headers.origin}/coach/settings/refresh/${account}`,
      type: "account_onboarding",
    });

    res.json(accountLink);
  } catch (error: any) {
    console.error("Error creating account link:", error);
    res.status(500).json({ error: error.message });
  }
} 