import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create a test document immediately
    await adminDb.collection('webhook_test').add({
      timestamp: new Date().toISOString(),
      message: 'TEST WEBHOOK REACHED',
      method: req.method,
      url: req.url,
      headers: req.headers
    });

    res.status(200).json({ 
      success: true, 
      message: 'Test webhook reached and Firebase document created',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({ 
      error: 'Failed to create Firebase document',
      details: error?.message || 'Unknown error'
    });
  }
} 