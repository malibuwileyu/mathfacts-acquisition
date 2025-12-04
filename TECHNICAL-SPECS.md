# Math Facts Acquisition - Technical Specification

**Version:** 1.0  
**Status:** Production-Ready  
**Deployed:** https://mathfacts-acquisition-production.up.railway.app  
**Last Updated:** November 2025

---

## Overview

Standalone Next.js application teaching 26 lessons of addition facts (sums to 20) using Direct Instruction methodology. Integrates with TimeBack platform for authentication and result tracking.

---

## Architecture

**Tech Stack:**
- Framework: Next.js 15 (React 19, TypeScript)
- Styling: Tailwind CSS 4
- Database: PostgreSQL (Neon) with Drizzle ORM
- Authentication: better-auth with Cognito OAuth
- Deployment: Railway
- Audio: Pre-generated MP3s (OpenAI TTS/Deepgram)

**Data Flow:**
- Progress: localStorage (client-side, immediate)
- Authentication: better-auth sessions (database)
- Results: Submitted to TimeBack AssessmentResults API
- Audio: Static files served from `/public/audio/`

---

## Features

### Core Teaching (26 Lessons)

**Series Saying Format (Odd Lessons: 1,3,5,7,9,11,13,15,17,19,21,23,25)**
- 5-6 Steps depending on lesson
- Special rule introductions (Plus 1, Plus 0)
- Steps: Modeled → Read Together → Type Sums → Recall (B) → Recall (C) → Quiz

**Fact Families Format (Even Lessons: 2,4,6,8,10,12,14,16,18,20,22,24,26)**
- 7 Steps total
- Teaches commutative property explicitly
- Steps: Intro → Review → Turnarounds → Practice → Quiz Intro → Turnaround Quiz → Mixed Review

**All Lessons:**
- 85% mastery threshold on final quiz
- Audio-guided instruction
- Number pad input
- Visual feedback (✓/✗)
- Progress tracking

### Comprehensive Assessment
- 26 questions total
- Questions 1-13: Sum questions from odd lessons
- Questions 14-26: Turnaround questions from even lessons
- Weighted towards 6,7,8,9 facts
- Tracks which lessons had wrong answers
- Submits to TimeBack on completion

### Authentication
- Cognito OAuth via better-auth
- Demo mode (guest access for testing)
- Session management in PostgreSQL
- Automatic user provisioning

### TimeBack Integration
- 27 AssessmentLineItems (26 lessons + 1 comprehensive)
- AssessmentResults submitted on lesson/assessment completion
- Organization ID: f251f08b-61de-4ffa-8ff3-3e56e1d75a60
- Component ID: c0d87431-33ee-4c87-a2f2-1a847dfd53c3

### Demo Mode
- Guest access without authentication
- All 26 lessons visible
- Quick navigation controls:
  - Start Fresh (clear progress)
  - Skip to Final Assessment (complete all 26)
- Perfect for client demos

---

## Data Models

### Lesson Structure
```typescript
interface Lesson {
  id: number;                          // 1-26
  set: string;                         // 'A'-'Z'
  format: 'series_saying' | 'fact_families';
  operation: Operation;                // ADDITION
  facts: Fact[];                       // 3-9 facts per lesson
  quizOrder: string[];                 // Randomized for quiz
  commutativePairs?: [string, string][]; // For Fact Families
}
```

### Progress Tracking
```typescript
interface Progress {
  lessons: {
    [lessonId: number]: {
      currentStep: number;
      completed: boolean;
      passed: boolean;
      quizScore: number;
      startedAt: string;
      completedAt?: string;
    }
  };
  facts: {
    [factId: string]: {
      attempts: number;
      correct: number;
      timeSpent: number;
      accuracyRate: number;
    }
  };
}
```

### Auth Tables (PostgreSQL)
- `user` - User accounts (Cognito-linked)
- `session` - Active sessions (24hr expiry)
- `account` - OAuth account linkage
- `verification` - Email verification tokens

---

## API Endpoints

### Authentication
- `POST /api/auth/sign-in/social` - Initiate Cognito OAuth
- `GET /api/auth/callback/cognito` - OAuth callback
- `GET /api/auth/get-session` - Check session status
- `POST /api/auth/sign-out` - Logout

### Assessment Submission
- `POST /api/submit-result` - Submit lesson/assessment result to TimeBack
  - Body: `{lessonId, score, passed, completedAt}`
  - Returns: `{success: boolean, resultId?: string}`

---

## Audio System

**Total Files:** 600+ MP3s
- Fact audio: 5 types per fact (statement, question, correction, model, confirm)
- Instructions: 20+ reusable phrases
- Generated using: OpenAI TTS (shimmer) or Deepgram (aura-2-athena-en)

**Generation:**
```bash
npm run generate-audio -- --provider=deepgram --voice=aura-2-athena-en
npm run generate-ff-audio  # Fact Family specific
npm run generate-rules      # Rule introduction audio
```

---

## Environment Variables

**Required:**
```bash
# Auth
COGNITO_CLIENT_ID=3bu9iphl652rnv27b2khaoipso
COGNITO_CLIENT_SECRET=<secret>
COGNITO_DOMAIN=https://prod-beyond-timeback-api-2-idp.auth.us-east-1.amazoncognito.com
COGNITO_REGION=us-east-1
COGNITO_USERPOOL_ID=us-east-1_3uhuoRM3R

# Better-Auth
BETTER_AUTH_URL=https://mathfacts-acquisition-production.up.railway.app
BETTER_AUTH_SECRET=<random-32-char-string>
NEXT_PUBLIC_APP_URL=https://mathfacts-acquisition-production.up.railway.app

# Database
DATABASE_URL=postgresql://...

# TimeBack
TIMEBACK_COGNITO_BASE_URL=https://prod-beyond-timeback-api-2-idp.auth.us-east-1.amazoncognito.com
TIMEBACK_CLIENT_ID=jia4lm59utns9hgs8g4du8j13
TIMEBACK_CLIENT_SECRET=<secret>
TIMEBACK_ONEROSTER_BASE_URL=https://api.alpha-1edtech.ai
TIMEBACK_QTI_BASE_URL=https://qti.alpha-1edtech.ai/api
TIMEBACK_PHASE0_ORG_ID=f251f08b-61de-4ffa-8ff3-3e56e1d75a60
TIMEBACK_PHASE0_COMPONENT_ID=c0d87431-33ee-4c87-a2f2-1a847dfd53c3
```

---

## Deployment

**Current:** Railway (main branch)
**Demo:** Railway (demo-mode branch) - includes guest access

**Deploy Process:**
1. Push to GitHub
2. Railway auto-deploys
3. Migrations run automatically
4. Audio files included in deployment

---

## Key Design Decisions

1. **localStorage for Progress** - Immediate saves, no database lag during lessons
2. **Pre-generated Audio** - No runtime TTS calls, consistent voice
3. **Two-Input System** - For turnaround questions (? + ? = ?)
4. **Demo Mode** - Bypasses auth for testing/demos
5. **Weight 6,7,8,9** - Harder facts appear 3x more in reviews/assessment
6. **Fact Families Pull Same Format** - Review includes previous turnarounds
7. **Session-Based Auth** - Cognito OAuth with better-auth
8. **Server-Side Submission** - Results submitted via API route (not client-side)

---

## Success Metrics

- 85% quiz mastery required to advance
- 26 lessons completed → Comprehensive assessment unlocked
- Comprehensive assessment 85%+ → Ready for fluency (TimeBack notified)
- All results tracked per lesson for teacher dashboard

---

## Future Enhancements

- Teacher dashboard (view all student progress)
- Multiple operations (subtraction, multiplication, division)
- Mobile app (React Native)
- Spanish translation
- Custom voice recording option

