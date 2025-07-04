# PrologueIsReal

A platform connecting athletes with members for coaching and training content.

## Stripe Connect Integration for Athletes

### Overview
Athletes can set up Stripe Connect accounts to receive payments from platform subscriptions. The integration provides:

1. **Initial Setup**: Athletes can create a Stripe Connect account through the onboarding flow
2. **Dashboard Access**: Existing accounts can access their Stripe dashboard for payout management
3. **Automatic Account Linking**: Stripe account IDs are automatically saved to athlete profiles

### Implementation Details

#### API Routes
- `POST /api/stripe/create-connect-account` - Creates a new Stripe Connect account
- `POST /api/stripe/create-account-link` - Creates onboarding links for new accounts
- `POST /api/stripe/create-login-link` - Creates dashboard access links for existing accounts
- `POST /api/athlete/save-stripe-id` - Saves Stripe account ID to athlete profile
- `GET /api/athlete/profile` - Retrieves athlete profile including Stripe account ID

#### Components
- `AthleteStripeConnect` - Dedicated component for Stripe Connect functionality
- Integrated into athlete settings page under the Banking tab

#### Flow
1. Athlete clicks "Set Up Stripe Connect" button
2. System creates Stripe Connect account with athlete's information
3. Athlete is redirected to Stripe onboarding flow
4. Upon completion, athlete returns to settings with success message
5. For subsequent access, button changes to "Access Stripe Dashboard"
6. Clicking provides direct access to Stripe Connect dashboard

### Environment Variables
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Usage
Athletes can access Stripe Connect functionality through:
- Athlete Settings → Banking tab → Manage Payment section

The system automatically detects whether an athlete has an existing Stripe account and provides appropriate actions (setup vs. dashboard access).

## Features

### Member Training Hub
- **Content Discovery**: Members can view articles, videos, and courses from subscribed creators
- **Subscription Management**: Easy access to content from creators they follow
- **Content Organization**: Tabbed interface for different content types (Articles, Videos, Courses)
- **Creator Profiles**: Display creator information with each piece of content
- **Real-time Updates**: Content is sorted by creation date with latest content first

### Key Components
- **Overview Tab**: Training statistics, progress tracking, and latest content from creators
- **Articles Tab**: Text-based content with reading time and creator information
- **Videos Tab**: Video content with duration, views, and creator details
- **Courses Tab**: Structured learning programs with lesson breakdowns

### Technical Features
- **Firebase Integration**: Real-time content fetching from Firestore
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Loading States**: Smooth loading indicators and error handling
- **Content Navigation**: Click-through to detailed content views
- **Creator Information**: Profile images, names, and specialties displayed

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase configuration in `lib/firebase.ts`

3. Run the development server:
```bash
npm run dev
```

## Content Structure

The platform supports three main content types:
- **Articles**: Text-based content with cover images and reading time
- **Videos**: Video content with thumbnails and duration
- **Courses**: Structured programs with multiple lessons

Each content type includes:
- Creator information (name, profile image, specialty)
- Creation date and engagement metrics
- Category classification
- Rating system

## Database Schema

### Members Collection
- `subscriptions`: Object containing subscribed creator IDs
- `firstName`, `lastName`: Member profile information
- `profileImageUrl`: Member profile image

### Content Collections (articles, videos, courses)
- `createdBy`: Creator ID reference
- `title`, `description`: Content metadata
- `createdAt`: Timestamp for sorting
- `category`, `rating`: Classification and ratings
- Content-specific fields (duration, readTime, lessons, etc.)

### Athletes Collection
- `firstName`, `lastName`: Creator profile information
- `profileImageUrl`: Creator profile image
- `sport`, `specialty`: Creator specialization
