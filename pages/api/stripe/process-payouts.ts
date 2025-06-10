import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const stripe = new Stripe("sk_test_51PpW7M07FzlgJpkLj0eE78um0sZSgMsxlodjrVcadztEQmNSSogUJrVgO5nCIBcpY9mceEzUFH2jK2xEFlZPXXpR00tvDZqghd");

interface AthleteData {
  id: string;
  stripeAccountId: string | null;
  subscribers: number;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get all athletes with active Stripe accounts
    const athletesQuery = query(
      collection(db, "athletes"),
      where("stripeAccountId", "!=", null)
    );
    const athletesSnapshot = await getDocs(athletesQuery);
    const athletes = athletesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AthleteData[];

    const results = [];

    for (const athlete of athletes) {
      if (!athlete.stripeAccountId) continue;

      try {
        // Get the athlete's balance
        const balance = await stripe.balance.retrieve({
          stripeAccount: athlete.stripeAccountId,
        });

        // Calculate available amount (excluding pending amounts)
        const availableAmount = balance.available.reduce((sum, bal) => {
          if (bal.currency === 'usd') {
            return sum + bal.amount;
          }
          return sum;
        }, 0);

        if (availableAmount > 0) {
          // Create payout
          const payout = await stripe.payouts.create(
            {
              amount: availableAmount,
              currency: 'usd',
            },
            {
              stripeAccount: athlete.stripeAccountId,
            }
          );

          results.push({
            athleteId: athlete.id,
            amount: availableAmount / 100, // Convert from cents to dollars
            status: 'success',
            payoutId: payout.id
          });
        }
      } catch (error: any) {
        results.push({
          athleteId: athlete.id,
          error: error.message,
          status: 'error'
        });
      }
    }

    res.status(200).json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
} 