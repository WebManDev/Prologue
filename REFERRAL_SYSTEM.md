# Referral System Documentation

## Overview

This referral system allows athletes to refer new users to the Prologue platform. When someone visits a referral link, the referrer is stored and tracked when the new user signs up.

## Features

### 1. Dynamic Referral Routes
- **Route**: `/[referrerName]` (e.g., `/bm`, `/john`, `/sarah`)
- **Function**: Stores the referrer name in localStorage and redirects to the landing page
- **File**: `app/[referrer]/page.tsx`
- **URLs**: 
  - Local: `localhost:3000/bm`
  - Production: `www.prologuehq.com/bm`

### 2. Referral Tracking
- **Storage**: Referrer information stored in localStorage as `prologue_referrer`
- **Processing**: Handled during user signup (both email and Google sign-in)
- **Protection**: Prevents self-referrals and ensures one-time rewards

### 3. Database Integration
- **User Profiles**: Referrer information added to both athlete and member profiles
- **Referrer Stats**: Tracks total referrals and last referral date for athletes
- **Flexible Referrers**: Any name can be used as a referrer (not just registered athletes)
- **Fields Added**:
  - `referrer`: Referrer name
  - `referrerId`: Referrer's user ID (null if referrer is not a registered athlete)
  - `referredAt`: Timestamp of referral
  - `totalReferrals`: Count of referrals (for athletes)
  - `lastReferralAt`: Last referral timestamp (for athletes)

## Implementation Details

### Firebase Functions

#### `handleReferral(userId: string, referrerName: string)`
- Accepts any name as a referrer (not just registered athletes)
- Prevents self-referrals
- Ensures one-time reward (no duplicate referrers)
- Updates both user and referrer profiles
- If referrer is a registered athlete, updates their stats

#### `getReferralStats(athleteId: string)`
- Returns referral statistics for an athlete
- Includes total referrals and last referral date

### API Endpoints

#### `POST /api/referral/validate`
- Validates if a referrer exists
- Returns referrer information if valid
- Used for testing and validation

### Components

#### `ReferralStats`
- Displays referral statistics for athletes
- Shows total referrals and last referral date
- Includes referral link generation

## Usage Examples

### Creating a Referral Link
```
# Local development
http://localhost:3000/bm

# Production
https://www.prologuehq.com/bm
```

### Testing the System
1. Visit `/test-referral` to test the referral system
2. Enter a valid athlete name
3. Generate and test referral links
4. Simulate the referral flow

### Integration in Athlete Dashboard
```tsx
import { ReferralStats } from "@/components/referral-stats"

// In athlete dashboard
<ReferralStats athleteId={currentUserId} />
```

## Security Features

### Abuse Prevention
1. **Self-Referral Protection**: Users cannot refer themselves
2. **One-Time Reward**: Users can only have one referrer
3. **Flexible Referrer System**: Any name can be used as a referrer
4. **Server-Side Validation**: API endpoint validates referrers

### Data Protection
- Referrer information cleared from localStorage after processing
- Error handling prevents signup failures due to referral issues
- Graceful degradation if referral processing fails

## Database Schema

### Athletes Collection
```typescript
{
  // ... existing fields
  totalReferrals: number,
  lastReferralAt: string,
  // ... other fields
}
```

### Members Collection
```typescript
{
  // ... existing fields
  referrer: string,
  referrerId: string,
  referredAt: string,
  // ... other fields
}
```

## Testing

### Manual Testing
1. Create an athlete account
2. Generate a referral link: `/[referrerName]` (e.g., `/bm`)
3. Visit the link in an incognito window
4. Sign up a new account
5. Verify the referrer is stored in the new user's profile

### Automated Testing
- Use the test page at `/test-referral`
- Validate referrer existence
- Test referral link generation
- Simulate the complete referral flow

## Future Enhancements

### Potential Features
1. **Referral Rewards**: Points, credits, or benefits for successful referrals
2. **Referral Analytics**: Detailed tracking and reporting
3. **Multi-Level Referrals**: Track referral chains
4. **Referral Campaigns**: Time-limited referral programs
5. **Email Notifications**: Notify referrers of successful referrals

### Technical Improvements
1. **Rate Limiting**: Prevent abuse of referral system
2. **Analytics Dashboard**: Comprehensive referral analytics
3. **A/B Testing**: Test different referral strategies
4. **Mobile Optimization**: Better mobile referral experience

## Troubleshooting

### Common Issues

1. **Referrer Not Found**
   - Ensure the athlete name exists in the database
   - Check for exact name matching
   - Verify the athlete has completed onboarding

2. **Referral Not Processing**
   - Check browser console for errors
   - Verify localStorage is available
   - Ensure Firebase functions are properly imported

3. **Self-Referral Attempts**
   - System automatically prevents self-referrals
   - Check user authentication state
   - Verify user profile data

### Debug Steps
1. Check browser localStorage for `prologue_referrer`
2. Verify Firebase function calls in console
3. Check user profile in Firestore for referral fields
4. Use the test page to validate referrer existence

## Configuration

### Environment Variables
No additional environment variables required. The system uses existing Firebase configuration.

### Firebase Rules
Ensure Firestore rules allow reading athlete profiles for referral validation:
```javascript
match /athletes/{athleteId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == athleteId;
}
```

## Performance Considerations

1. **Caching**: Consider caching referrer validation results
2. **Batch Operations**: Use Firebase batch writes for multiple updates
3. **Indexing**: Ensure proper Firestore indexes for name queries
4. **Rate Limiting**: Implement rate limiting for referral validation API

## Monitoring

### Key Metrics to Track
1. **Referral Conversion Rate**: Signups from referral links
2. **Top Referrers**: Athletes with most successful referrals
3. **Referral Link Clicks**: Traffic to referral URLs
4. **Error Rates**: Failed referral processing attempts

### Logging
- Log all referral attempts (successful and failed)
- Track referrer validation requests
- Monitor self-referral attempts
- Log referral processing errors 