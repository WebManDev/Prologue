import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { referrerName } = await request.json()

    if (!referrerName) {
      return NextResponse.json({ error: 'Referrer name is required' }, { status: 400 })
    }

    // Check if the referrer exists in the athletes collection
    const athletesRef = adminDb.collection('athletes')
    const query = athletesRef.where('name', '==', referrerName)
    const snapshot = await query.get()

    if (!snapshot.empty) {
      // Referrer exists as an athlete
      const referrerDoc = snapshot.docs[0]
      const referrerData = referrerDoc.data()

      return NextResponse.json({
        valid: true,
        isAthlete: true,
        referrer: {
          id: referrerDoc.id,
          name: referrerData.name,
          sport: referrerData.sport,
          profileImageUrl: referrerData.profileImageUrl || referrerData.profilePicture || '',
          totalReferrals: referrerData.totalReferrals || 0
        }
      })
    } else {
      // Referrer doesn't exist as an athlete, but we'll still allow it
      return NextResponse.json({
        valid: true,
        isAthlete: false,
        referrer: {
          name: referrerName,
          sport: 'Unknown',
          profileImageUrl: '',
          totalReferrals: 0
        }
      })
    }

  } catch (error) {
    console.error('Error validating referral:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 