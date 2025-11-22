# TimeBack Integration Setup

**Complete integration with TimeBack for assessment result tracking**

---

## Prerequisites

✅ TimeBack credentials (already in `.env.local`):
- `TIMEBACK_COGNITO_BASE_URL`
- `TIMEBACK_CLIENT_ID`
- `TIMEBACK_CLIENT_SECRET`
- `TIMEBACK_ONEROSTER_BASE_URL`
- `TIMEBACK_PHASE0_COMPONENT_ID`

---

## Step 1: Setup TimeBack (One-Time)

**This creates 26 AssessmentLineItems in TimeBack** (one per lesson):

```bash
npm run setup-timeback
```

**What this does:**
1. Authenticates with TimeBack
2. Creates AssessmentLineItem for each lesson
3. Saves mapping to `lib/timeback/lineItemMappings.json`

**Takes:** ~30 seconds

**Output:**
```
🚀 Setting up TimeBack Integration

🔐 Getting auth token...
✅ Authenticated

Creating AssessmentLineItem for Lesson 1...
✅ Created LineItem abc-123 for Lesson 1
Creating AssessmentLineItem for Lesson 2...
✅ Created LineItem def-456 for Lesson 2
...
✅ Setup Complete!
Created 26 AssessmentLineItems
```

**Only run this ONCE!** It creates resources in TimeBack.

---

## Step 2: Enable Result Submission

Results are automatically submitted when:
- Student completes a lesson
- Score ≥ 85% (passed)
- TimeBack integration is active

**No code changes needed!** It just works once setup is complete.

---

## How It Works

### When Student Completes Lesson:

```typescript
// Automatically called in app/lesson/[id]/page.tsx
submitLessonResult(studentId, {
  lessonId: 1,
  score: 92,
  passed: true,
  completedAt: '2024-11-21T...'
})
```

### What Gets Sent to TimeBack:

```json
{
  "assessmentResult": {
    "student": { "sourcedId": "student-abc" },
    "assessmentLineItem": { "sourcedId": "lineitem-123" },
    "score": 92,
    "scoreStatus": "fully graded",
    "scoreDate": "2024-11-21T...",
    "metadata": {
      "appName": "math-facts-acquisition",
      "lessonId": 1,
      "passed": true,
      "trackId": "TRACK6"
    }
  }
}
```

### FastMath Can Read:

```typescript
// FastMath polls TimeBack
GET /ims/oneroster/gradebook/v1p2/assessmentResults?filter=student.sourcedId='student-abc'

// Finds our results
results.filter(r => r.metadata?.appName === 'math-facts-acquisition')

// Sees which lessons student passed
// Can mark track as ready based on completed lessons
```

---

## Student Authentication

**Current:** Using demo student ID (`'demo-student'`)

**TODO:** Implement TimeBack OAuth login:
1. Student clicks "Login with TimeBack"
2. Redirects to TimeBack
3. Returns with student `sourcedId`
4. Store in session
5. Use real ID for result submission

---

## Verification

**After setup, verify in TimeBack:**

```bash
# Get auth token
curl -X POST https://prod-beyond-timeback-api-2-idp.auth.us-east-1.amazoncognito.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=$TIMEBACK_CLIENT_ID&client_secret=$TIMEBACK_CLIENT_SECRET&scope=https://purl.imsglobal.org/spec/or/v1p1/scope/admin"

# List assessment line items
curl -X GET "https://api.alpha-1edtech.ai/ims/oneroster/gradebook/v1p2/assessmentLineItems?filter=metadata.appName='math-facts-acquisition'" \
  -H "Authorization: Bearer <token>"
```

**Should see 26 line items!**

---

## Troubleshooting

**Error: "No LineItem found for Lesson X"**
- Run `npm run setup-timeback`
- Check `lib/timeback/lineItemMappings.json` exists

**Error: "TimeBack auth failed: 401"**
- Check credentials in `.env.local`
- Verify client ID/secret are correct

**Error: "Component not found"**
- Check `TIMEBACK_PHASE0_COMPONENT_ID` is valid
- Ask TimeBack team for correct component ID

---

## Next Steps

1. **Run setup:** `npm run setup-timeback`
2. **Test:** Complete a lesson, check console for "✅ Submitted to TimeBack"
3. **Implement real auth:** Replace `'demo-student'` with actual student ID
4. **Coordinate with FastMath:** They need to poll for results

---

**Integration is ready! Just needs setup script to run.** 🚀

