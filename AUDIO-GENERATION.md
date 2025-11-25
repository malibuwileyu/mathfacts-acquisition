# Audio Generation Guide

**How to generate audio files for the acquisition app**

---

## Overview

Generate all audio files once, then use them forever (like fastmath does).

**Generates:**
- 121 facts × 5 phrases = **605 audio files**
- 8 instructional phrases
- **Total: 613 MP3 files**

**Cost:** ~$2-5 one-time (depending on provider)

---

## Setup

### Option 1: OpenAI TTS (Recommended)

```bash
# 1. Get API key from platform.openai.com
export OPENAI_API_KEY=sk-...

# 2. Install dependencies
npm install

# 3. Generate audio
npm run generate-audio

# Uses voice "nova" by default (female, kid-friendly)
# To use different voice:
npm run generate-audio -- --voice=onyx  # Male voice
```

**Available voices:** nova, alloy, echo, fable, onyx, shimmer

---

### Option 2: Deepgram TTS (What fastmath likely used)

```bash
# 1. Get API key from deepgram.com
export DEEPGRAM_API_KEY=...

# 2. Generate audio
npm run generate-audio -- --provider=deepgram

# Uses aura-asteria-en model (female voice)
```

---

## What Gets Generated

### Per Fact (5 files each):

```
2-plus-1-statement.mp3      # "2 plus 1 equals 3"
2-plus-1-question.mp3       # "What is 2 plus 1?"
2-plus-1-correction.mp3     # "Listen. 2 plus 1 equals 3"
2-plus-1-model.mp3          # "Say it with me. 2 plus 1 equals 3"
2-plus-1-confirm.mp3        # "That's right! Remember, 2 plus 1 equals 3"
```

### Instructional Phrases:

```
instructions/great-job.mp3
instructions/good-job.mp3              # NEW: "Good job!"
instructions/excellent-work.mp3
instructions/keep-going.mp3
instructions/try-again.mp3
instructions/listen-carefully.mp3
instructions/listen-and-remember.mp3   # NEW: "Listen and remember the facts."
instructions/your-turn.mp3
instructions/your-turn-read-it.mp3     # NEW: "Your turn to read it."
instructions/read-together-intro.mp3   # NEW: "This time, I'll read it, then you read it."
instructions/great-job-reading.mp3     # NEW: "Great job reading the facts!"
instructions/practice-more.mp3
instructions/doing-great.mp3
instructions/fact-family.mp3           # "They have the same sum. They're a fact family!"
instructions/plus-one-rule-part1.mp3   # NEW: Plus 1 rule intro (~4s)
instructions/plus-one-rule-part2.mp3   # NEW: Plus 1 rule example (~4s)
instructions/plus-one-rule-part3.mp3   # NEW: Plus 1 rule reminder (~3s)
instructions/plus-zero-rule-part1.mp3  # NEW: Plus 0 rule intro (~4s)
instructions/plus-zero-rule-part2.mp3  # NEW: Plus 0 rule example (~4s)
instructions/plus-zero-rule-part3.mp3  # NEW: Plus 0 rule reminder (~3s)
```

**Note:** The new instruction files marked "NEW" need to be generated for the updated Series Saying steps.

### Rule Audio Scripts:

**Plus One Rule (3 separate files):**

```
instructions/plus-one-rule-part1.mp3
"Here's a rule for plus 1 facts. When you plus one, you say the next number."

instructions/plus-one-rule-part2.mp3
"2+1 = 3 because 3 is the next number after 2."

instructions/plus-one-rule-part3.mp3
"Remember the rule: When you plus one, you say the next number."
```

**Plus Zero Rule (3 separate files):**

```
instructions/plus-zero-rule-part1.mp3
"Here's a rule for plus 0 facts. When you plus zero, the number stays the same."

instructions/plus-zero-rule-part2.mp3
"2+0 = 2 because when you add zero, nothing changes."

instructions/plus-zero-rule-part3.mp3
"Remember the rule: When you plus zero, the number stays the same."
```

**How it works:**
- Generate 3 separate MP3 files per rule (6 total)
- Code adds 1.5 second pauses between each file automatically
- Arrow appears 2 seconds into part 2 (when "because [result]" is said)
- Total duration: ~14 seconds with pauses

**OR (alternative):**
You can generate ONE MP3 per rule with 1.5s silences baked in, named:
- `instructions/plus-one-rule.mp3`
- `instructions/plus-zero-rule.mp3`

But the 3-file approach is more flexible for editing.

---

## Usage in Components

```typescript
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';

export default function MyComponent() {
  const { playAudio } = useAudio();
  
  // Play a fact statement
  const audioFile = getFactAudio('2+1', 'statement');
  await playAudio(audioFile);
  // Plays: /audio/2-plus-1-statement.mp3
  
  // Play instruction
  const instruction = getInstructionAudio('great-job');
  await playAudio(instruction);
  // Plays: /audio/instructions/great-job.mp3
  
  // Automatic fallback to browser TTS if file missing!
}
```

---

## Cost Breakdown

### OpenAI TTS:
```
121 facts × 5 phrases = 605 files
Average ~25 chars per phrase = 15,125 chars
Cost: $0.015 per 1k = $0.23 total

Instructional phrases = 8 files × ~15 chars = 120 chars
Cost: ~$0.002

Total: ~$0.25 (basically free!)
```

### Deepgram TTS:
```
Same pricing: $0.015 per 1k chars
$200 free credit = enough for 13M characters
= enough for 520k phrases
= enough for ALL audio × 848 times

Free tier = plenty!
```

---

## Generation Time

**Estimated:** ~5-10 minutes for all 613 files

```
API rate limits:
- OpenAI: ~50 requests/min
- Deepgram: ~100 requests/min

Script adds 100ms delay between requests
Total time: ~10 minutes
```

---

## Fallback Strategy

The audio hook **automatically falls back to browser TTS** if file missing:

```typescript
audio.onerror = () => {
  // File not found, use browser TTS instead
  fallbackToTTS(audioFile.text);
};
```

**This means:**
- ✅ App works before audio generated
- ✅ App works if some files missing
- ✅ Graceful degradation
- ✅ Can test with TTS, upgrade to real audio later

---

## Quality Comparison

**Browser TTS:** 5/10 (robotic, varies by browser)  
**OpenAI TTS:** 8/10 (very natural, consistent)  
**OpenAI TTS-HD:** 9/10 (near-human, $0.030 per 1k)  
**Deepgram Aura:** 8/10 (natural, fast generation)  
**ElevenLabs:** 10/10 (best quality, more expensive)

---

## Next Steps

1. **Choose provider** (OpenAI or Deepgram)
2. **Get API key**
3. **Run:** `npm run generate-audio`
4. **Wait:** ~10 minutes
5. **Done:** 613 MP3 files in `/public/audio/`

Then the app automatically uses them!

---

## Regenerating

If you need to regenerate (voice change, better quality, etc.):

```bash
# Delete old files
rm -rf public/audio/*

# Generate with different settings
npm run generate-audio -- --voice=alloy --provider=openai
```

---

**Recommendation:** Start with browser TTS (works now), generate real audio when you have API key.

