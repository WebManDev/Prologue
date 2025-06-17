import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const stripe = new Stripe('sk_test_51RTKV905oLGlYeZ0j3Dl8jKIYNYIFU1kuNMLZhvXECRhTVNIqdAHQTe5Dq5AEZ0eVMI7HRyopowo34ZAtFWp8V9H00pznHlYqu', {
  apiVersion: '2025-05-28.basil',
});

interface AthleteData {
  id: string;
  stripeAccountId: string | null;
  subscribers: number;
  [key: string]: any;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get all athletes with active Stripe accounts
    const athletesSnapshot = await db.collection('athletes')
      .where('stripeAccountId', '!=', null)
      .get();

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export async function processPayouts() {
  try {
    // Get all athletes with active Stripe accounts
    const athletesSnapshot = await db.collection('athletes')
      .where('stripeAccountId', '!=', null)
      .get();

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

    return { results };
  } catch (error: any) {
    return { error: error.message };
  }
} 