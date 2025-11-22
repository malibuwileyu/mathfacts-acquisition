/**
 * Quick script to generate just the "Your turn" audio file
 * Run this to avoid browser TTS for this one phrase
 * 
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   npm run tsx scripts/generate-your-turn.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio', 'instructions');
const OPENAI_KEY = process.env.OPENAI_API_KEY;

mkdirSync(AUDIO_DIR, { recursive: true });

async function generateYourTurn() {
  if (!OPENAI_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }
  
  console.log('🎙️  Generating "Your turn" audio...\n');
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'nova',  // Female, kid-friendly
      input: 'Your turn',
      speed: 0.85
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI TTS failed: ${response.statusText}`);
  }
  
  const audioBuffer = await response.arrayBuffer();
  const filePath = join(AUDIO_DIR, 'your-turn-short.mp3');
  writeFileSync(filePath, Buffer.from(audioBuffer));
  
  console.log(`✅ Generated: ${filePath}`);
  console.log('\nCost: ~$0.0001 (basically free)\n');
}

generateYourTurn().catch(console.error);

