/**
 * Generate all audio files for Math Fact Acquisition
 * 
 * Generates MP3s for all facts and instructional phrases
 * Uses OpenAI TTS or Deepgram (configure via env var)
 * 
 * Usage:
 *   npm run generate-audio
 *   npm run generate-audio -- --provider=deepgram
 *   npm run generate-audio -- --voice=nova
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { lessons } from '../lib/lessonData';
import { Fact } from '../types';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio');
const PROVIDER = process.argv.find(arg => arg.startsWith('--provider='))?.split('=')[1] || 'openai';
const VOICE = process.argv.find(arg => arg.startsWith('--voice='))?.split('=')[1] || 'nova';

console.log(`🎙️  Audio Generation Script`);
console.log(`Provider: ${PROVIDER}`);
console.log(`Voice: ${VOICE}`);
console.log(`Output: ${AUDIO_DIR}\n`);

// Ensure audio directory exists
mkdirSync(AUDIO_DIR, { recursive: true });

/**
 * Generate audio file using OpenAI TTS
 */
async function generateWithOpenAI(text: string, filename: string) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',  // or 'tts-1-hd' for better quality
      voice: VOICE,    // nova (female), onyx (male), etc.
      input: text,
      speed: 0.85      // Slightly slower for kids
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI TTS failed: ${response.statusText}`);
  }
  
  const audioBuffer = await response.arrayBuffer();
  const filePath = join(AUDIO_DIR, filename);
  writeFileSync(filePath, Buffer.from(audioBuffer));
  
  console.log(`✅ Generated: ${filename}`);
}

/**
 * Generate audio file using Deepgram TTS
 */
async function generateWithDeepgram(text: string, filename: string) {
  const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY;
  
  if (!DEEPGRAM_KEY) {
    throw new Error('DEEPGRAM_API_KEY not set');
  }
  
  // Use voice from command line arg (e.g., aura-2-athena-en)
  const model = VOICE || 'aura-athena-en';
  
  const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${DEEPGRAM_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deepgram TTS failed: ${response.status} - ${error}`);
  }
  
  const audioBuffer = await response.arrayBuffer();
  const filePath = join(AUDIO_DIR, filename);
  writeFileSync(filePath, Buffer.from(audioBuffer));
  
  console.log(`✅ Generated: ${filename}`);
}

/**
 * Generate audio file using Google AI Studio TTS (accepts API keys!)
 */
async function generateWithGoogle(text: string, filename: string) {
  const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GOOGLE_KEY) {
    throw new Error('GOOGLE_API_KEY not set');
  }
  
  // Use the v1beta API endpoint that accepts API keys
  const response = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GOOGLE_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: VOICE  // e.g., 'en-US-Wavenet-F' or 'Laomedeia'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: 2.0
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google TTS failed: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  const audioContent = Buffer.from(data.audioContent, 'base64');
  
  const filePath = join(AUDIO_DIR, filename);
  writeFileSync(filePath, audioContent);
  
  console.log(`✅ Generated: ${filename}`);
}

/**
 * Generate audio file (provider-agnostic)
 */
async function generateAudio(text: string, filename: string) {
  if (PROVIDER === 'google') {
    return generateWithGoogle(text, filename);
  } else if (PROVIDER === 'deepgram') {
    return generateWithDeepgram(text, filename);
  } else {
    return generateWithOpenAI(text, filename);
  }
}

/**
 * Sanitize filename
 */
function sanitizeFilename(text: string): string {
  return text
    .replace(/\+/g, '-plus-')
    .replace(/=/g, '-equals-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase();
}

/**
 * Generate all phrases for a fact
 */
async function generateFactAudio(fact: Fact) {
  const factName = sanitizeFilename(fact.id);
  
  // 1. Statement: "2 plus 1 equals 3"
  await generateAudio(
    `${fact.operand1} plus ${fact.operand2} equals ${fact.result}`,
    `${factName}-statement.mp3`
  );
  
  // 2. Question: "What is 2 plus 1?"
  await generateAudio(
    `What is ${fact.operand1} plus ${fact.operand2}?`,
    `${factName}-question.mp3`
  );
  
  // 3. Correction: "Listen. 2 plus 1 equals 3"
  await generateAudio(
    `Listen. ${fact.operand1} plus ${fact.operand2} equals ${fact.result}`,
    `${factName}-correction.mp3`
  );
  
  // 4. Model: "Say it with me. 2 plus 1 equals 3"
  await generateAudio(
    `Say it with me. ${fact.operand1} plus ${fact.operand2} equals ${fact.result}`,
    `${factName}-model.mp3`
  );
  
  // 5. Confirm: "That's right! Remember, 2 plus 1 equals 3"
  await generateAudio(
    `That's right! Remember, ${fact.operand1} plus ${fact.operand2} equals ${fact.result}`,
    `${factName}-confirm.mp3`
  );
  
  // Add small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Generate instructional phrases (used across lessons)
 */
async function generateInstructionalAudio() {
  console.log('\n📢 Generating instructional phrases...');
  
  const phrases = [
    { text: 'Listen and remember the facts.', file: 'listen-and-remember.mp3' },
    { text: 'Great job!', file: 'great-job.mp3' },
    { text: 'Excellent work!', file: 'excellent-work.mp3' },
    { text: 'Keep going!', file: 'keep-going.mp3' },
    { text: 'Not quite. Let\'s try again.', file: 'try-again.mp3' },
    { text: 'Listen carefully.', file: 'listen-carefully.mp3' },
    { text: 'Your turn!', file: 'your-turn.mp3' },
    { text: 'Let\'s practice this one more time.', file: 'practice-more.mp3' },
    { text: 'You\'re doing great!', file: 'doing-great.mp3' },
    { text: 'They have the same sum. They\'re a fact family!', file: 'fact-family.mp3' },
    { text: 'Your turn', file: 'your-turn-short.mp3' },
  ];
  
  for (const phrase of phrases) {
    await generateAudio(phrase.text, `instructions/${phrase.file}`);
  }
}

/**
 * Main generation function
 */
async function main() {
  console.log(`🎙️  Audio Generation Script`);
  console.log(`Provider: ${PROVIDER}`);
  console.log(`Voice: ${VOICE}`);
  console.log(`Output: ${AUDIO_DIR}\n`);
  
  // Create subdirectories
  mkdirSync(join(AUDIO_DIR, 'instructions'), { recursive: true });
  
  try {
    // Generate instructional phrases
    await generateInstructionalAudio();
    
    // Generate audio for all facts
    console.log('\n🔢 Generating fact audio...');
    
    let totalFacts = 0;
    
    for (const lesson of lessons) {
      console.log(`\nLesson ${lesson.id} (Set ${lesson.set}): ${lesson.facts.length} facts`);
      
      for (const fact of lesson.facts) {
        await generateFactAudio(fact);
        totalFacts++;
      }
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`Generated audio for ${totalFacts} facts`);
    console.log(`Total files: ${totalFacts * 5 + 8} MP3s`);
    console.log(`\nEstimated cost: $${((totalFacts * 5 * 25) / 1000 * 0.015).toFixed(2)}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();

