import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '@/lib/firebase-admin'
import { adminAuth } from '@/lib/firebase-admin'

const MAX_CHANGES = 2;
const WINDOW_DAYS = 14;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const athleteId = decodedToken.uid

    const { pricing } = req.body
    if (!pricing) {
      return res.status(400).json({ error: 'Missing pricing data' })
    }

    // Validate pricing structure
    const { basic, pro, premium } = pricing
    if (typeof basic !== 'number' || typeof pro !== 'number' || typeof premium !== 'number') {
      return res.status(400).json({ error: 'Invalid pricing data' })
    }

    // Enforce minimums and order
    if (basic < 4.99) {
      return res.status(400).json({ error: 'Basic tier must be at least $4.99' })
    }
    if (pro <= basic) {
      return res.status(400).json({ error: 'Pro tier must be greater than Basic tier' })
    }
    if (premium <= pro) {
      return res.status(400).json({ error: 'Premium tier must be greater than Pro tier' })
    }

    // Enforce 2 changes per 14 days
    const docRef = adminDb.collection('athletes').doc(athleteId)
    const docSnap = await docRef.get()
    const athleteData = docSnap.data()
    const now = Date.now()
    let pricingChangeHistory: string[] = (athleteData && athleteData.pricingChangeHistory) || []
    // Remove timestamps older than 14 days
    pricingChangeHistory = pricingChangeHistory.filter(ts => {
      const t = new Date(ts).getTime()
      return now - t < WINDOW_MS
    })
    if (pricingChangeHistory.length >= MAX_CHANGES) {
      // Find when the next change will be allowed
      const oldest = new Date(pricingChangeHistory[0]).getTime()
      const msUntilNext = WINDOW_MS - (now - oldest)
      const daysUntilNext = Math.ceil(msUntilNext / (24 * 60 * 60 * 1000))
      return res.status(400).json({ error: `You can only change your pricing twice every 14 days. Please try again in ${daysUntilNext} day(s).`, changesLeft: 0, nextChangeAllowed: new Date(now + msUntilNext).toISOString() })
    }
    // Add this change
    pricingChangeHistory.push(new Date().toISOString())

    // Save the pricing and update pricingChangeHistory
    await docRef.update({
      pricing: {
        basic: parseFloat(basic.toFixed(2)),
        pro: parseFloat(pro.toFixed(2)),
        premium: parseFloat(premium.toFixed(2)),
      },
      pricingChangeHistory,
      lastPricingUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    res.status(200).json({ 
      success: true,
      message: 'Pricing updated successfully',
      pricing: {
        basic: parseFloat(basic.toFixed(2)),
        pro: parseFloat(pro.toFixed(2)),
        premium: parseFloat(premium.toFixed(2)),
      },
      lastPricingUpdate: new Date().toISOString(),
      pricingChangeHistory,
      changesLeft: MAX_CHANGES - pricingChangeHistory.length,
      nextChangeAllowed: pricingChangeHistory.length >= MAX_CHANGES ? pricingChangeHistory[0] : null
    })
  } catch (error: any) {
    console.error('Error saving pricing:', error)
    res.status(500).json({ error: error.message || 'Failed to save pricing' })
  }
} 