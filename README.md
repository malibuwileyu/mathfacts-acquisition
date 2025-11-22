# Math Fact Acquisition App

**Standalone teaching module for addition fact mastery**

## What This Does

Teaches 26 lessons of addition facts using Direct Instruction methodology:
- **Series Saying** format (5 steps)
- **Fact Families** format (6 steps)
- 85% mastery threshold
- Computer-mediated delivery with text-to-speech

## Current Status

### ✅ Built:
- [x] Project structure
- [x] Type definitions with `external_id` field
- [x] Integration config (sync toggle)
- [x] Lesson data (first 10 lessons from CSV)
- [x] Home page (lesson selector)
- [x] Lesson page container
- [x] NumberPad component
- [x] Step 1 (Modeled Instruction)

### ⏳ TODO:
- [ ] Series Saying Steps 2-5
- [ ] Fact Families Steps 1-6
- [ ] Error correction component
- [ ] Progress tracking (localStorage or DB)
- [ ] Remaining lessons 11-26
- [ ] Sync service (with mapping placeholder)

## Run the App

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Integration

### Standalone Mode (Current):

```bash
# No sync to fastmath
NEXT_PUBLIC_SYNC_ENABLED=false
```

App works independently with CSV format ("2+1").

### Integrated Mode (When Ready):

```bash
# Enable sync
NEXT_PUBLIC_SYNC_ENABLED=true
NEXT_PUBLIC_ADDITION_TRACK=TRACK6

# Generate fact mapping first:
npm run generate-mapping

# Then sync works automatically
```

## Architecture

```
acquisition/
├── app/
│   ├── page.tsx              # Lesson selector
│   └── lesson/[id]/page.tsx  # Lesson container
├── components/
│   ├── series-saying/        # 5-step format
│   ├── fact-families/        # 6-step format
│   └── shared/
│       └── NumberPad.tsx
├── lib/
│   └── lessonData.ts         # 26 lessons from CSV
├── types/
│   └── index.ts              # Fact, Lesson, etc.
└── config/
    └── integration.ts        # Sync config + mapping
```

## Fact Mapping

Facts use CSV format internally (`"2+1"`).

The `external_id` field stores fastmath's ID when mapping is loaded:

```typescript
{
  id: "2+1",           // CSV format (always)
  external_id: "FACT534"  // fastmath ID (when mapped)
}
```

**To generate mapping:**
1. Get API access to https://server.fastmath.pro
2. Run: `npm run generate-mapping TRACK6`
3. Creates `public/factMappings.json`
4. App auto-loads and populates `external_id` fields

## Integration with fastmath

When sync enabled, after each lesson:

```typescript
POST https://server.fastmath.pro/users/{userId}/progress/TRACK6
{
  facts: {
    "FACT534": { status: "accuracyPractice", attempts: 5, correct: 5, timeSpent: 12000 },
    // ... more facts
  }
}
```

Their system marks facts as ready for fluency practice.

## Audio Setup

**Current:** Using browser text-to-speech (works, but robotic)

**To upgrade to pre-generated audio:**

```bash
# 1. Get API key (OpenAI or Deepgram)
export OPENAI_API_KEY=sk-...
# or
export DEEPGRAM_API_KEY=...

# 2. Generate all audio files (~10 mins, ~$0.25 cost)
npm install
npm run generate-audio

# 3. Audio files saved to public/audio/
# 4. App automatically uses them (fallback to TTS if missing)
```

See `AUDIO-GENERATION.md` for full details.

---

## Development

```bash
# Install
npm install

# Dev server
npm run dev

# Type check
npm run build

# Lint
npm run lint

# Generate audio files (optional)
npm run generate-audio
```

## Specs

- **BRAINLIFT.md** - Complete instructional hierarchy
- **CLIENT-REQUIREMENTS.md** - Client answers to critical questions
- **ACQUISITION-APP-PLAN.md** - Full technical plan
- **CSV** - 26 lesson sequence

## Next Steps

1. Build remaining teaching components (Steps 2-6)
2. Add progress tracking
3. Test with demo students
4. Get API access for mapping
5. Enable sync and test integration
