import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe("sk_test_your_hardcoded_stripe_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, firstName, lastName, country } = req.body;

    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      business_type: "individual",
      individual: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3000/coach/stripe/refresh",
      return_url: "http://localhost:3000/coach/stripe/success",
      type: "account_onboarding",
    });

    res.status(200).json({ onboardingUrl: accountLink.url, accountId: account.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
} 