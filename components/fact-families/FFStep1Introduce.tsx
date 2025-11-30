/**
 * Fact Families Step 1: Introduce Commutative Pairs
 * Show both directions make the same sum
 * 
 * @spec BRAINLIFT.md - "Introduce - Show commutative pairs together"
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function FFStep1Introduce({ lesson, onComplete }: Props) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [hasHeard, setHasHeard] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playAudio } = useAudio();
  const hasStartedRef = useRef(false);

  const currentPair = lesson.commutativePairs![currentPairIndex];
  const fact1 = lesson.facts.find(f => f.id === currentPair[0])!;
  
  // Get turn-around fact
  const [a, b] = currentPair[1].split('+').map(Number);
  const fact2 = { id: currentPair[1], operand1: a, operand2: b, result: a + b, display: `${a} + ${b}` };

  // Auto-play when pair changes
  useEffect(() => {
    if (hasStartedRef.current && currentPairIndex > 0) {
      // Auto-play for subsequent pairs
      playCurrentPair();
    } else if (!hasStartedRef.current) {
      // First pair - auto-start after short delay
      hasStartedRef.current = true;
      const timer = setTimeout(() => {
        playCurrentPair();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPairIndex]);

  const playCurrentPair = async () => {
    setIsPlaying(true);
    setHasHeard(false);
    
    // Get current pair facts
    const pair = lesson.commutativePairs![currentPairIndex];
    const f1 = lesson.facts.find(f => f.id === pair[0])!;
    const [pa, pb] = pair[1].split('+').map(Number);
    
    await playAudio(getFactAudio(f1.id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    await playAudio(getFactAudio(pair[1], 'statement'));
    await new Promise(r => setTimeout(r, 500));
    
    // Reinforcement message ONLY on first pair
    if (currentPairIndex === 0) {
      await playAudio({
        filename: 'instructions/fact-family.mp3',
        text: `They have the same sum. They're a fact family!`
      });
    }
    
    setIsPlaying(false);
    setHasHeard(true);
  };

  const handleReplay = () => {
    if (!isPlaying) {
      playCurrentPair();
    }
  };

  const handleNext = () => {
    if (currentPairIndex < lesson.commutativePairs!.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
      setHasHeard(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          
          {/* Pair indicator */}
          <div className="text-center mb-4">
            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              Fact Family {currentPairIndex + 1} of {lesson.commutativePairs!.length}
            </span>
          </div>

          {/* Show CURRENT pair only */}
          <div className="bg-purple-50 rounded-xl p-6 mb-5">
            <div className="text-6xl font-bold text-purple-600 mb-4 text-center">
              {fact1.operand1} + {fact1.operand2} = {fact1.result}
            </div>
            <div className="text-6xl font-bold text-pink-600 text-center">
              {fact2.operand1} + {fact2.operand2} = {fact2.result}
            </div>
          </div>

          {/* Controls - only show after audio finishes */}
          {hasHeard && (
            <div className="flex gap-4 justify-center">
              {/* Replay button (blue microphone) */}
              <button
                onClick={handleReplay}
                disabled={isPlaying}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-3xl font-bold p-5 rounded-xl transition shadow-lg"
                title="Hear Again"
              >
                🎤
              </button>

              {/* Advance button (green arrow) */}
              <button
                onClick={handleNext}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-5xl font-bold py-5 px-8 rounded-xl transition shadow-lg flex items-center justify-center"
              >
                →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

