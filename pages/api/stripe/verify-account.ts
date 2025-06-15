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

    // Retrieve the account from Stripe
    const account = await stripe.accounts.retrieve(accountId);

    // Check if the account exists and is valid
    if (!account || account.id !== accountId) {
      return res.status(400).json({ error: "Invalid Stripe account" });
    }

    // Check if the account has the required capabilities
    if (!account.capabilities?.card_payments || !account.capabilities?.transfers) {
      return res.status(400).json({ error: "Account missing required capabilities" });
    }

    // Check if the account's onboarding is complete
    const requirements = account.requirements;
    if (requirements?.disabled_reason || (requirements?.currently_due && requirements.currently_due.length > 0)) {
      return res.status(400).json({ 
        error: "Account onboarding not complete",
        details: requirements?.disabled_reason || "Additional information required",
        requirements: requirements?.currently_due || []
      });
    }

    // Return success if all checks pass
    res.status(200).json({ 
      verified: true,
      accountId: account.id,
      capabilities: account.capabilities,
      requirements: requirements || null
    });
  } catch (error: any) {
    console.error("Error verifying Stripe account:", error);
    res.status(400).json({ error: error.message });
  }
} 