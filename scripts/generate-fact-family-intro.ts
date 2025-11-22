/**
 * Generate fact family introduction audio
 * Explains what fact families and turnarounds are
 * 
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   tsx scripts/generate-fact-family-intro.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio', 'instructions');
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const VOICE = 'nova';  // Female, kid-friendly

mkdirSync(AUDIO_DIR, { recursive: true });

async function generateAudio(text: string, filename: string) {
  if (!OPENAI_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }
  
  console.log(`🎙️  Generating: ${filename}`);
  console.log(`   Text: "${text}"\n`);
  
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
      speed: 0.80  // Slower for young learners
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
  console.log('📢 Generating Fact Family Audio\n');
  
  // Introduction explanation (plays on introduction screen)
  await generateAudio(
    `Two plus one equals three. But guess what? One plus two also equals three! The numbers switched places, but the answer stayed the same. We call this a turnaround. And when two facts are turnarounds, they make a fact family.`,
    'fact-family-intro.mp3'
  );
  
  // "Your turn" cue (plays in Step 2)
  await generateAudio(
    `Your turn`,
    'your-turn-short.mp3'
  );
  
  // Fact family reinforcement (plays after each pair)
  await generateAudio(
    `They have the same sum. They're a fact family!`,
    'fact-family.mp3'
  );
  
  // Turnaround question (Step 3)
  await generateAudio(
    `What's its turnaround?`,
    'whats-turnaround.mp3'
  );
  
  // Short reminder (Lessons 6, 8, 10)
  await generateAudio(
    `Two plus one equals three. Its turnaround is one plus two equals three. Let's work on turnarounds.`,
    'turnaround-reminder.mp3'
  );
  
  // "Now say the turnaround" (Step 2 - first prompt)
  await generateAudio(
    `Now say the turnaround`,
    'say-turnaround.mp3'
  );
  
  // "Now complete the turnaround" (Step 2 - second prompt, enables typing)
  await generateAudio(
    `Now complete the turnaround`,
    'complete-turnaround.mp3'
  );
  
  console.log('✅ Complete!');
  console.log('Generated 7 audio files');
  console.log('Cost: ~$0.006\n');
}

main().catch(console.error);

