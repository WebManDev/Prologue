import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.metadata?.type === 'course_purchase') {
          const { courseId, userId } = session.metadata
          
          // Record the course purchase
          await addDoc(collection(db, 'coursePurchases'), {
            courseId,
            userId,
            stripeSessionId: session.id,
            amount: session.amount_total,
            status: 'completed',
            purchasedAt: serverTimestamp(),
          })

          // Update user's purchased courses
          const userRef = doc(db, 'members', userId)
          await setDoc(userRef, {
            purchasedCourses: {
              [courseId]: {
                purchasedAt: serverTimestamp(),
                status: 'active'
              }
            }
          }, { merge: true })

          console.log(`Course purchase completed: ${courseId} for user ${userId}`)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
} 