import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, proPrice, premiumPrice, coachName } = req.body;
    if (!userId || !proPrice || !premiumPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Find or create a Stripe Product for this coach
    let productId;
    const coachDoc = await adminDb.collection('athletes').doc(userId).get();
    let coachData = coachDoc.exists ? coachDoc.data() : {};
    if (coachData && coachData.stripeProductId) {
      productId = coachData.stripeProductId;
    } else {
      const product = await stripe.products.create({
        name: `Coaching Subscription - ${coachName || userId}`,
        metadata: { userId },
      });
      productId = product.id;
      await adminDb.collection('athletes').doc(userId).update({ stripeProductId: productId });
    }

    // 2. Create new Stripe Price objects for pro and premium
    const proPriceObj = await stripe.prices.create({
      unit_amount: Math.round(Number(proPrice) * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      product: productId,
      nickname: 'Pro',
    });
    const premiumPriceObj = await stripe.prices.create({
      unit_amount: Math.round(Number(premiumPrice) * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      product: productId,
      nickname: 'Premium',
    });

    // 3. Save Stripe Price IDs in Firestore
    await adminDb.collection('athletes').doc(userId).update({
      stripePriceIds: {
        pro: proPriceObj.id,
        premium: premiumPriceObj.id,
      },
      pricing: {
        pro: Number(proPrice),
        premium: Number(premiumPrice),
      },
    });

    res.status(200).json({
      success: true,
      stripeProductId: productId,
      stripePriceIds: {
        pro: proPriceObj.id,
        premium: premiumPriceObj.id,
      },
    });
  } catch (error: any) {
    console.error('Error updating coach pricing:', error);
    res.status(500).json({ error: error.message || 'Failed to update coach pricing' });
  }
} 