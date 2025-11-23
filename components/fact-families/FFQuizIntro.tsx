/**
 * Quiz Introduction Screen - Transition before quiz
 * Prepares student for quiz mode
 */

'use client';

import { useEffect } from 'react';
import { useAudio } from '@/lib/useAudio';

interface FFQuizIntroProps {
  onNext: () => void;
}

export default function FFQuizIntro({ onNext }: FFQuizIntroProps) {
  const { playAudio, isPlaying } = useAudio();

  useEffect(() => {
    // Play intro audio (TTS - no pre-recorded file)
    playAudio({
      filename: '',
      text: "Now it's quiz time! I'll ask you some turnaround questions. Remember, you need 85% to move on. You've got this!"
    });
    
    // Auto-advance after 5 seconds
    const timer = setTimeout(() => {
      onNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onNext, playAudio]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="text-8xl mb-8">📝</div>
        
        <h2 className="text-6xl font-bold text-blue-600 mb-8">
          Quiz Time!
        </h2>
        
        <p className="text-3xl text-gray-700 mb-8">
          Let&apos;s see what you remember
        </p>
        
        <div className="text-2xl text-gray-600">
          Get ready...
        </div>

        {!isPlaying && (
          <button
            onClick={onNext}
            className="mt-8 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-4 px-8 rounded-xl transition shadow-lg"
          >
            Start Quiz →
          </button>
        )}
      </div>
    </div>
  );
}

