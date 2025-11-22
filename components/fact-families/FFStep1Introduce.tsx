/**
 * Fact Families Step 1: Introduce Commutative Pairs
 * Show both directions make the same sum
 * 
 * @spec BRAINLIFT.md - "Introduce - Show commutative pairs together"
 */

'use client';

import { Lesson } from '@/types';
import { useState } from 'react';
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

  const currentPair = lesson.commutativePairs![currentPairIndex];
  const fact1 = lesson.facts.find(f => f.id === currentPair[0])!;
  
  // Get turn-around fact
  const [a, b] = currentPair[1].split('+').map(Number);
  const fact2 = { id: currentPair[1], operand1: a, operand2: b, result: a + b, display: `${a} + ${b}` };

  const handleListenCurrent = async () => {
    setIsPlaying(true);
    
    await playAudio(getFactAudio(fact1.id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    await playAudio(getFactAudio(fact2.id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    
    // Reinforcement message ONLY on first pair
    if (currentPairIndex === 0) {
      await playAudio({
        filename: 'instructions/fact-family.mp3',
        text: `They have the same sum. They're a fact family!`
      });
    }
    
    setIsPlaying(false);
    
    // Wait before showing button (let student process)
    await new Promise(r => setTimeout(r, 3000));
    setHasHeard(true);
    
    // Auto-advance to next pair or complete
    await new Promise(r => setTimeout(r, 2000));
    if (currentPairIndex < lesson.commutativePairs!.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
      setHasHeard(false);
    }
    // If at last pair, Next Step button stays visible
  };

  const handleListenAll = async () => {
    setIsPlaying(true);
    setCurrentPairIndex(0);
    
    for (let i = 0; i < lesson.commutativePairs!.length; i++) {
      setCurrentPairIndex(i);
      
      const pair = lesson.commutativePairs![i];
      const f1 = lesson.facts.find(f => f.id === pair[0])!;
      const [a1, b1] = pair[1].split('+').map(Number);
      
      await playAudio(getFactAudio(f1.id, 'statement'));
      await new Promise(r => setTimeout(r, 500));
      await playAudio(getFactAudio(pair[1], 'statement'));
      await new Promise(r => setTimeout(r, 500));
      
      // Reinforcement message ONLY on first pair
      if (i === 0) {
        await playAudio({
          filename: 'instructions/fact-family.mp3',
          text: `They have the same sum. They're a fact family!`
        });
        await new Promise(r => setTimeout(r, 500));
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
    
    setCurrentPairIndex(lesson.commutativePairs!.length - 1);
    setIsPlaying(false);
    setHasHeard(true);
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
            <div className="text-3xl text-gray-500 mb-4 text-center">
              ↕️
            </div>
            <div className="text-6xl font-bold text-pink-600 mb-4 text-center">
              {fact2.operand1} + {fact2.operand2} = {fact2.result}
            </div>
            <div className="text-2xl font-bold text-green-600 text-center">
              Same sum!
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <button
              onClick={handleListenCurrent}
              disabled={isPlaying}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              🔊 Hear This Pair
            </button>

            <button
              onClick={handleListenAll}
              disabled={isPlaying}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              🔊 Hear All Families
            </button>

            {hasHeard && (
              <button
                onClick={handleNext}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
              >
                {currentPairIndex < lesson.commutativePairs!.length - 1 ? 'Next Pair →' : 'Next Step →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

