/**
 * Audio playback hook for pre-generated MP3 files
 * Based on fastmath's useKAudio.ts pattern
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';

export interface AudioFile {
  filename: string;
  text: string;  // Fallback text for TTS if file missing
}

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  
  // Stop audio on unmount (when navigating away)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();  // Stop TTS fallback too
    };
  }, []);
  
  /**
   * Stop any currently playing audio
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
  }, []);
  
  /**
   * Play audio file from /public/audio/
   */
  const playAudio = useCallback(async (audioFile: AudioFile): Promise<void> => {
    // Stop any existing audio
    stopAudio();
    
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`/audio/${audioFile.filename}`);
        audioRef.current = audio;
        isPlayingRef.current = true;
        
        audio.onended = () => {
          isPlayingRef.current = false;
          audioRef.current = null;
          resolve();
        };
        
        audio.onerror = () => {
          console.warn(`Audio file not found: ${audioFile.filename}, falling back to TTS`);
          isPlayingRef.current = false;
          audioRef.current = null;
          
          // Fallback to browser TTS if file missing
          fallbackToTTS(audioFile.text).then(resolve).catch(reject);
        };
        
        audio.oncanplaythrough = () => {
          audio.play()
            .then(() => console.log(`🔊 Playing: ${audioFile.filename}`))
            .catch((error) => {
              console.error('Play failed:', error);
              // Fallback to TTS
              fallbackToTTS(audioFile.text).then(resolve).catch(reject);
            });
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }, [stopAudio]);
  
  /**
   * Play audio with callback when finished
   */
  const playAudioWithCallback = useCallback(
    (audioFile: AudioFile, callback: () => void): Promise<void> => {
      return playAudio(audioFile).then(callback);
    },
    [playAudio]
  );
  
  /**
   * Fallback to browser TTS if audio file missing
   */
  const fallbackToTTS = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);
  
  return {
    playAudio,
    playAudioWithCallback,
    stopAudio,
    isPlaying: () => isPlayingRef.current
  };
};

/**
 * Helper to create audio file references
 */
export function getFactAudio(factId: string, type: 'statement' | 'question' | 'correction' | 'model' | 'confirm'): AudioFile {
  const filename = `${factId.replace('+', '-plus-')}-${type}.mp3`;
  
  // Fallback text if file missing
  const [operand1, operand2] = factId.split('+').map(Number);
  const result = operand1 + operand2;
  
  const texts = {
    statement: `${operand1} plus ${operand2} equals ${result}`,
    question: `What is ${operand1} plus ${operand2}?`,
    correction: `Listen. ${operand1} plus ${operand2} equals ${result}`,
    model: `Say it with me. ${operand1} plus ${operand2} equals ${result}`,
    confirm: `That's right! Remember, ${operand1} plus ${operand2} equals ${result}`
  };
  
  return {
    filename,
    text: texts[type]
  };
}

/**
 * Get instructional audio
 */
export function getInstructionAudio(key: string): AudioFile {
  const instructions: Record<string, string> = {
    'great-job': 'Great job!',
    'good-job': 'Good job!',
    'excellent-work': 'Excellent work!',
    'keep-going': 'Keep going!',
    'try-again': 'Not quite. Let\'s try again.',
    'listen-carefully': 'Listen carefully.',
    'listen-and-remember': 'Listen and remember the facts.',
    'your-turn': 'Your turn!',
    'your-turn-read-it': 'Your turn to read it.',
    'read-together-intro': 'This time, I\'ll read it, then you read it.',
    'great-job-reading': 'Great job reading the facts!',
    'practice-more': 'Let\'s practice this one more time.',
    'doing-great': 'You\'re doing great!',
    // Plus 1 rule (3 parts)
    'plus-one-rule-part1': 'Here\'s a rule for plus 1 facts. When you plus one, you say the next number.',
    'plus-one-rule-part2': '2+1 = 3 because 3 is the next number after 2.',
    'plus-one-rule-part3': 'Remember the rule: When you plus one, you say the next number.',
    // Plus 0 rule (3 parts)
    'plus-zero-rule-part1': 'Here\'s a rule for plus 0 facts. When you plus zero, the number stays the same.',
    'plus-zero-rule-part2': '2+0 = 2 because when you add zero, nothing changes.',
    'plus-zero-rule-part3': 'Remember the rule: When you plus zero, the number stays the same.',
    // Quiz
    'quiz-time': 'Quiz time! Type the answer for each fact.',
    // Step 3 cue
    'read-fact-answer': 'Read the fact and answer it.'
  };
  
  return {
    filename: `instructions/${key}.mp3`,
    text: instructions[key] || key
  };
}

