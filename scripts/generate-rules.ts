/**
 * Generate rule explanation audio for +1 and +0 facts
 * 
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   tsx scripts/generate-rules.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio', 'instructions');
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const VOICE = 'nova';

mkdirSync(AUDIO_DIR, { recursive: true });

async function generateAudio(text: string, filename: string) {
  if (!OPENAI_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }
  
  console.log(`🎙️  Generating: ${filename}`);
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: VOICE,
      input: text,
      speed: 0.80
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI TTS failed: ${response.statusText}`);
  }
  
  const audioBuffer = await response.arrayBuffer();
  const filePath = join(AUDIO_DIR, filename);
  writeFileSync(filePath, Buffer.from(audioBuffer));
  
  console.log(`✅ Generated: ${filePath}\n`);
}

async function main() {
  console.log('📢 Generating Rule Audio\n');
  
  // Plus One Rule
  await generateAudio(
    `Here's a trick for plus one facts: Just say the next number! Five plus one? Six. Seven plus one? Eight. Easy!`,
    'rule-plus-one.mp3'
  );
  
  // Plus Zero Rule
  await generateAudio(
    `Here's a trick for plus zero facts: Just say the same number! Five plus zero? Five. Seven plus zero? Seven. Easy!`,
    'rule-plus-zero.mp3'
  );
  
  console.log('✅ Complete!');
  console.log('Generated 2 rule audio files');
  console.log('Cost: ~$0.002\n');
}

main().catch(console.error);

