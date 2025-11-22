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
    'excellent-work': 'Excellent work!',
    'keep-going': 'Keep going!',
    'try-again': 'Not quite. Let\'s try again.',
    'listen-carefully': 'Listen carefully.',
    'your-turn': 'Your turn!',
    'practice-more': 'Let\'s practice this one more time.',
    'doing-great': 'You\'re doing great!'
  };
  
  return {
    filename: `instructions/${key}.mp3`,
    text: instructions[key] || key
  };
}

