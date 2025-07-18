import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
}

const relevantEvents = new Set([
  'customer.subscription.deleted',
  'customer.subscription.updated',
])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed')
  }

  // IMMEDIATE DEBUG: Create a simple test document to verify webhook is running
  try {
    await adminDb.collection('webhook_test').add({
      timestamp: new Date().toISOString(),
      message: 'Webhook started executing',
      headers: req.headers,
      method: req.method
    });
  } catch (testError) {
    console.error('Failed to create test document:', testError);
  }

  // Safety check for Firebase Admin
  try {
    if (!adminDb) {
      console.error('❌ Firebase Admin not properly initialized');
      return res.status(500).send('Firebase Admin not initialized')
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization check failed:', error);
    return res.status(500).send('Firebase Admin initialization error')
  }

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET env var not set');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret)
    
    // DEBUG: Webhook signature verified successfully
    await adminDb.collection('webhook_test').add({
      timestamp: new Date().toISOString(),
      message: 'Webhook signature verified, event received',
      eventType: event.type,
      eventId: event.id
    });
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (relevantEvents.has(event.type)) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer;
    const stripeSubscriptionId = subscription.id;
    const status = subscription.status;
    const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    // DEBUG: Log webhook data
    console.log('=== WEBHOOK DEBUG ===');
    console.log('Event type:', event.type);
    console.log('Subscription ID:', stripeSubscriptionId);
    console.log('Customer ID:', customerId);
    console.log('Status:', status);
    console.log('Cancel at period end:', cancelAtPeriodEnd);
    console.log('Cancel at:', cancelAt);
    
    // ADD DEBUG LOG TO FIREBASE
    try {
      await adminDb.collection('webhook_logs').add({
        timestamp: new Date().toISOString(),
        eventType: event.type,
        subscriptionId: stripeSubscriptionId,
        customerId: customerId,
        status: status,
        cancelAtPeriodEnd: cancelAtPeriodEnd,
        cancelAt: cancelAt
      });
    } catch (logError) {
      console.error('Failed to log to Firebase:', logError);
    }
    
    let shouldDeactivate = false;
    if (event.type === 'customer.subscription.deleted') {
      shouldDeactivate = true;
      console.log('Should deactivate: true (subscription deleted)');
    } else if (event.type === 'customer.subscription.updated') {
      // Deactivate if cancel_at_period_end is true or status is not 'active'
      if (cancelAtPeriodEnd || status !== 'active') {
        shouldDeactivate = true;
        console.log('Should deactivate: true (cancelAtPeriodEnd:', cancelAtPeriodEnd, ', status:', status, ')');
      } else {
        console.log('Should deactivate: false (cancelAtPeriodEnd:', cancelAtPeriodEnd, ', status:', status, ')');
      }
    }
    
    // LOG DECISION TO FIREBASE
    try {
      await adminDb.collection('webhook_logs').add({
        timestamp: new Date().toISOString(),
        eventType: event.type,
        subscriptionId: stripeSubscriptionId,
        customerId: customerId,
        shouldDeactivate: shouldDeactivate,
        reason: shouldDeactivate ? 
          (event.type === 'customer.subscription.deleted' ? 'subscription_deleted' : 
           `updated_${cancelAtPeriodEnd ? 'cancel_at_period_end' : 'status_not_active'}`) : 
          'conditions_not_met'
      });
    } catch (logError) {
      console.error('Failed to log decision to Firebase:', logError);
    }
    
    if (shouldDeactivate) {
      try {
        console.log('Starting member search...');
        // Search all members for a matching subscription
        const membersSnap = await adminDb.collection('members').get();
        let found = false;
        let searchCount = 0;
        
        for (const memberDoc of membersSnap.docs) {
          searchCount++;
          const memberData = memberDoc.data();
          let subscriptions = memberData.subscriptions || {};
          let athleteIdToRemove: string | null = null;
          
          console.log(`Checking member ${memberDoc.id} (${searchCount}/${membersSnap.docs.length})`);
          console.log('Member subscriptions:', Object.keys(subscriptions));
          
          for (const [athleteId, sub] of Object.entries(subscriptions) as [string, any][]) {
            console.log(`  Checking athlete ${athleteId}:`, {
              stripeCustomerId: sub.stripeCustomerId,
              stripeSubscriptionId: sub.stripeSubscriptionId
            });
            
            if (sub.stripeCustomerId === customerId || sub.stripeSubscriptionId === stripeSubscriptionId) {
              console.log('✅ MATCH FOUND! Updating subscription...');
              athleteIdToRemove = athleteId;
              
              // LOG MATCH FOUND TO FIREBASE
              try {
                await adminDb.collection('webhook_logs').add({
                  timestamp: new Date().toISOString(),
                  action: 'match_found',
                  memberId: memberDoc.id,
                  athleteId: athleteId,
                  subscriptionId: stripeSubscriptionId,
                  customerId: customerId,
                  foundBy: sub.stripeCustomerId === customerId ? 'customerId' : 'subscriptionId'
                });
              } catch (logError) {
                console.error('Failed to log match to Firebase:', logError);
              }
              
              // Explicitly update only the relevant subscription fields
              await memberDoc.ref.update({
                [`subscriptions.${athleteIdToRemove}.status`]: 'inactive',
                [`subscriptions.${athleteIdToRemove}.cancelAt`]: cancelAt,
              });
              console.log('✅ Status updated to inactive for athlete:', athleteIdToRemove);
              
              // LOG SUCCESSFUL UPDATE TO FIREBASE
              try {
                await adminDb.collection('webhook_logs').add({
                  timestamp: new Date().toISOString(),
                  action: 'status_updated',
                  memberId: memberDoc.id,
                  athleteId: athleteIdToRemove,
                  newStatus: 'inactive',
                  cancelAt: cancelAt
                });
              } catch (logError) {
                console.error('Failed to log update to Firebase:', logError);
              }
              
              // Optionally update activeAthletes/trainingAthletes arrays
              let memberUpdate: any = {};
              if (Array.isArray(memberData.activeAthletes)) {
                memberUpdate.activeAthletes = memberData.activeAthletes.filter((id: string) => id !== athleteIdToRemove)
              }
              if (Array.isArray(memberData.trainingAthletes)) {
                memberUpdate.trainingAthletes = memberData.trainingAthletes.filter((id: string) => id !== athleteIdToRemove)
              }
              if (Array.isArray(memberData.feedbackAthletes)) {
                memberUpdate.feedbackAthletes = memberData.feedbackAthletes.filter((id: string) => id !== athleteIdToRemove)
              }
              if (Array.isArray(memberData.messagingAthletes)) {
                memberUpdate.messagingAthletes = memberData.messagingAthletes.filter((id: string) => id !== athleteIdToRemove)
              }
              if (Object.keys(memberUpdate).length > 0) {
                await memberDoc.ref.update(memberUpdate);
                console.log('✅ Member arrays updated');
              }
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) {
          console.warn('❌ No matching member found for customerId', customerId, 'or subscriptionId', stripeSubscriptionId);
          console.log('Searched', searchCount, 'members total');
          
          // LOG NO MATCH FOUND TO FIREBASE
          try {
            await adminDb.collection('webhook_logs').add({
              timestamp: new Date().toISOString(),
              action: 'no_match_found',
              customerId: customerId,
              subscriptionId: stripeSubscriptionId,
              membersSearched: searchCount,
              error: 'No matching subscription found in any member document'
            });
          } catch (logError) {
            console.error('Failed to log no match to Firebase:', logError);
          }
        }
      } catch (err) {
        console.error('❌ Error updating subscription status and cleaning up:', err)
        return res.status(500).send('Webhook handler failed')
      }
    } else {
      console.log('❌ Subscription not deactivated - conditions not met');
    }
  } else {
    console.log('Event type not relevant:', event.type);
  }
  res.status(200).json({ received: true })
} 