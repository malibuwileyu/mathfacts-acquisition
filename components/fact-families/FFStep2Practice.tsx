/**
 * Fact Families Step 2: Practice Both Directions
 * @spec BRAINLIFT.md - "Practice - Read both directions out loud"
 */

'use client';

import { Lesson } from '@/types';
import { useState } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function FFStep2Practice({ lesson, onComplete }: Props) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [hasRead, setHasRead] = useState(false);
  const { playAudio } = useAudio();

  const currentPair = lesson.commutativePairs![currentPairIndex];

  const handleRead = async () => {
    // Play BOTH facts first
    const fact1Id = currentPair[0];
    const fact2Id = currentPair[1];
    
    await playAudio(getFactAudio(fact1Id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    await playAudio(getFactAudio(fact2Id, 'statement'));
    
    // "Your turn" cue AFTER both facts
    await new Promise(r => setTimeout(r, 300));
    await playAudio({
      filename: 'instructions/your-turn-short.mp3',
      text: 'Your turn'
    });
    
    // Wait 5 seconds for student to read before showing button
    await new Promise(r => setTimeout(r, 5000));
    setHasRead(true);
  };

  const handleNext = () => {
    // Move to next pair
    if (currentPairIndex < lesson.commutativePairs!.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
      setHasRead(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          
          {/* Show CURRENT pair - both facts visible */}
          <div className="bg-purple-50 rounded-xl p-6 mb-5">
            <div className="text-6xl font-bold text-purple-600 mb-4 text-center">
              {lesson.facts.find(f => f.id === currentPair[0])!.operand1} + {lesson.facts.find(f => f.id === currentPair[0])!.operand2} = {lesson.facts.find(f => f.id === currentPair[0])!.result}
            </div>
            <div className="text-3xl text-gray-500 mb-4 text-center">
              ↕️
            </div>
            <div className="text-6xl font-bold text-pink-600 text-center">
              {currentPair[1].split('+')[0]} + {currentPair[1].split('+')[1]} = {parseInt(currentPair[1].split('+')[0]) + parseInt(currentPair[1].split('+')[1])}
            </div>
          </div>

          {/* Instruction */}
          <div className="bg-pink-50 rounded-lg p-4 mb-4 text-center">
            <p className="text-lg text-gray-700">
              👄 Read both facts out loud
            </p>
          </div>

          {/* Pair indicator */}
          <div className="text-center mb-5">
            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              Fact Family {currentPairIndex + 1} of {lesson.commutativePairs!.length}
            </span>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <button
              onClick={handleRead}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              🔊 Hear Both
            </button>

            {hasRead && (
              <button
                onClick={handleNext}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
              >
                {currentPairIndex === lesson.commutativePairs!.length - 1 ? 'Next Step →' : 'Next Pair →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

