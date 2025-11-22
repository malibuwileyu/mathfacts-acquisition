/**
 * Series Saying Step 1: Modeled Instruction
 * Student listens to teacher model the facts
 * 
 * @spec BRAINLIFT.md - "Modeled Instruction - Student just listens"
 * @spec CLIENT-REQUIREMENTS.md - Computer-mediated with pre-generated audio
 */

'use client';

import { Lesson } from '@/types';
import { useState } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import { isFirstPlusOne, isFirstPlusZero, getPlusOneRule, getPlusZeroRule } from '@/lib/lessonRules';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step1Modeled({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasHeardCurrent, setHasHeardCurrent] = useState(false);
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];

  const handlePlayCurrent = async () => {
    setIsPlaying(true);
    
    // Check if we need to teach a rule first
    if (isFirstPlusOne(lesson, currentFactIndex)) {
      const rule = getPlusOneRule();
      await playAudio({ filename: rule.audioFile, text: rule.text });
      await new Promise(r => setTimeout(r, 1000));
    } else if (isFirstPlusZero(lesson, currentFactIndex)) {
      const rule = getPlusZeroRule();
      await playAudio({ filename: rule.audioFile, text: rule.text });
      await new Promise(r => setTimeout(r, 1000));
    }
    
    const audioFile = getFactAudio(currentFact.id, 'statement');
    await playAudio(audioFile);
    
    setIsPlaying(false);
    setHasHeardCurrent(true);
    
    // Move to next fact if not at end
    if (currentFactIndex < lesson.facts.length - 1) {
      setTimeout(() => {
        setCurrentFactIndex(currentFactIndex + 1);
        setHasHeardCurrent(false);
      }, 500);
    }
  };

  const handlePlayAll = async () => {
    setIsPlaying(true);
    setCurrentFactIndex(0);
    
    for (let i = 0; i < lesson.facts.length; i++) {
      setCurrentFactIndex(i);
      
      // Check if we need to teach a rule first
      if (isFirstPlusOne(lesson, i)) {
        const rule = getPlusOneRule();
        await playAudio({ filename: rule.audioFile, text: rule.text });
        await new Promise(r => setTimeout(r, 1000));
      } else if (isFirstPlusZero(lesson, i)) {
        const rule = getPlusZeroRule();
        await playAudio({ filename: rule.audioFile, text: rule.text });
        await new Promise(r => setTimeout(r, 1000));
      }
      
      const fact = lesson.facts[i];
      const audioFile = getFactAudio(fact.id, 'statement');
      
      await playAudio(audioFile);
      
      // Pause between facts
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setCurrentFactIndex(lesson.facts.length - 1);
    setIsPlaying(false);
    setHasHeardCurrent(true);  // Enable Next Step button
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          
          {/* Show ALL facts vertically, highlight current */}
          <div className="space-y-3 mb-6">
            {lesson.facts.map((fact, index) => (
              <div
                key={fact.id}
                className={`text-center p-4 rounded-xl transition-all ${
                  index === currentFactIndex
                    ? 'bg-blue-500 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="text-6xl font-bold">
                  {fact.operand1} + {fact.operand2} = {fact.result}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <button
              onClick={handlePlayCurrent}
              disabled={isPlaying}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              🔊 Hear This
            </button>

            <button
              onClick={handlePlayAll}
              disabled={isPlaying}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              🔊 Hear All
            </button>

            {currentFactIndex === lesson.facts.length - 1 && hasHeardCurrent && !isPlaying && (
              <button
                onClick={onComplete}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

