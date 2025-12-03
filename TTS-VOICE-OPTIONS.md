# TTS Voice Options & Testing

**Current:** OpenAI TTS with `nova` voice at 0.85 speed

**Issue:** Intonation problems, needs to be peppier

---

## Available TTS Providers & Voices

### 1. OpenAI TTS (Current) - $15/1M chars

**6 Voices Available:**

| Voice | Gender | Style | Good For |
|-------|--------|-------|----------|
| `alloy` | Neutral | Balanced | General purpose |
| `echo` | Male | Warm, clear | Instructions |
| `fable` | Neutral | Expressive | Storytelling |
| `onyx` | Male | Deep, authoritative | Formal |
| `nova` | Female | Warm, clear | **CURRENT** |
| `shimmer` | Female | Bright, energetic | **Kids content** |

**Models:**
- `tts-1` - Fast, cheaper (~$15/1M chars)
- `tts-1-hd` - Higher quality (~$30/1M chars)

**Speed:** Adjustable 0.25-4.0 (current: 0.85 = slower)

---

### 2. ElevenLabs - $5-99/mo (Best Quality)

**Pre-made Voices for Education:**
- **Rachel** - Professional female, clear enunciation
- **Domi** - Warm female, great for kids
- **Bella** - Energetic female, enthusiastic
- **Antoni** - Male, clear and friendly
- **Josh** - Male, warm and engaging

**Voice Cloning:** Can clone a specific teacher's voice

**Pros:**
- Best intonation/prosody
- Multiple languages
- Emotion control
- Speed/pitch control

**Cons:**
- More expensive
- Requires API key
- 10k char/month free tier

---

### 3. Google Cloud TTS - $16/1M chars

**WaveNet Voices (Best Quality):**
- `en-US-Wavenet-A` - Male
- `en-US-Wavenet-C` - Female, clear
- `en-US-Wavenet-D` - Male, warm
- `en-US-Wavenet-F` - Female, energetic **← Try this**
- `en-US-Wavenet-H` - Female, soft

**Neural2 Voices (Mid-tier):**
- `en-US-Neural2-A` through `en-US-Neural2-J`

**Pros:**
- Good quality
- Reasonable pricing
- SSML support (control pitch/speed)

**Cons:**
- Requires GCP setup
- Not as natural as ElevenLabs

---

### 4. Azure Cognitive Services - $16/1M chars

**Neural Voices:**
- `en-US-JennyNeural` - Female, friendly **← Good for kids**
- `en-US-GuyNeural` - Male, clear
- `en-US-AriaNeural` - Female, expressive
- `en-US-DavisNeural` - Male, warm
- `en-US-JaneNeural` - Female, cheerful

**Pros:**
- Excellent prosody
- Child-friendly voices
- Fine-grained control

**Cons:**
- Requires Azure account
- More complex setup

---

### 5. Amazon Polly - $16/1M chars

**Neural Voices:**
- `Joanna` - Female, clear and friendly
- `Matthew` - Male, warm
- `Ivy` - Child voice (sounds young) **← Interesting option**
- `Kendra` - Female, clear
- `Justin` - Child voice (sounds young)

**Pros:**
- Child voices available
- Good quality
- Reasonable pricing

**Cons:**
- Requires AWS account
- Less natural than ElevenLabs

---

## My Recommendations (Ranked)

### For K-3 Students (ages 5-8):

**1. ElevenLabs - `Bella` or `Domi`** ⭐ BEST
- Most natural, enthusiastic
- Best intonation
- Worth the cost for final product

**2. OpenAI - `shimmer`** ⭐ TRY FIRST (easiest)
- Already set up!
- Brighter/more energetic than nova
- Just change voice param

**3. Azure - `JennyNeural`**
- Very kid-friendly
- Great prosody
- Good middle ground

**4. Amazon Polly - `Ivy`**
- Actual child voice
- May sound more relatable
- But sometimes too young

---

## Quick Test Script

Test different OpenAI voices easily:

```bash
# Test shimmer (bright, energetic)
npm run generate-audio -- --voice=shimmer

# Test fable (expressive)
npm run generate-audio -- --voice=fable

# Test alloy (neutral)
npm run generate-audio -- --voice=alloy

# Test with HD model + faster speed
npm run generate-audio -- --voice=shimmer --model=tts-1-hd --speed=1.0
```

Just listen to a few files in `public/audio/` and compare!

---

## Recommendation

**Start with OpenAI `shimmer` voice:**
- Already configured
- Free to test (same API key)
- Just change `--voice=shimmer`
- More peppy than nova
- Good for kids

**If that's not enough:**
- Try ElevenLabs free tier (10k chars)
- Test `Bella` or `Domi` voices
- Best quality available

Want me to regenerate a few test files with `shimmer` so you can hear the difference? 🎙️
