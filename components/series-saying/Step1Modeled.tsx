/**
 * Series Saying Step 1: Modeled Instruction
 * Student listens to teacher model the facts
 * 
 * @spec BRAINLIFT.md - "Modeled Instruction - Student just listens"
 * @spec CLIENT-REQUIREMENTS.md - Auto-start after 2s delay, no buttons
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
import { isFirstPlusOne, isFirstPlusZero, getPlusOneRule, getPlusZeroRule } from '@/lib/lessonRules';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step1Modeled({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];

  // Auto-start after 2s delay
  useEffect(() => {
    const timer = setTimeout(() => {
      playAllFacts();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const playAllFacts = async () => {
    setIsPlaying(true);
    
    // Introduction: "Listen and remember the facts."
    await playAudio(getInstructionAudio('listen-and-remember'));
    await new Promise(r => setTimeout(r, 500));
    
    // Play all facts
    for (let i = 0; i < lesson.facts.length; i++) {
      setCurrentFactIndex(i);
      
      // Check if we need to teach a rule first (Plus 1 or Plus 0)
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
    setAllComplete(true);
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
                    : index < currentFactIndex
                    ? 'bg-green-100 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="text-6xl font-bold">
                  {fact.operand1} + {fact.operand2} = {fact.result}
                </div>
              </div>
            ))}
          </div>

          {/* Show Next button when all complete */}
          {allComplete && (
            <button
              onClick={onComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              Next →
            </button>
          )}
          
          {/* Loading indicator while playing */}
          {isPlaying && !allComplete && (
            <div className="text-center text-gray-500 text-xl">
              🔊 Listen carefully...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

