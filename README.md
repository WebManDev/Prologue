# Prologue - Athletic Training Platform

A modern platform connecting athletes with coaches and trainers for personalized training content.

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
