/**
 * Series Saying Step 2: Guided Practice A
 * Student reads facts and answers together with teacher
 * 
 * @spec BRAINLIFT.md - "Read facts and answers together (simultaneous/repeat after me)"
 * @spec CLIENT-REQUIREMENTS.md - Interactive script, auto-advance, 1s delays
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step2GuidedA({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];

  // Auto-start on mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startReading();
    }
  }, []);

  const startReading = async () => {
    // Introduction
    await playAudio(getInstructionAudio('read-together-intro'));
    await new Promise(r => setTimeout(r, 500));
    
    // Read all facts with "Your turn to read it" cues
    for (let i = 0; i < lesson.facts.length; i++) {
      setCurrentFactIndex(i);
      setIsReading(true);
      
      const fact = lesson.facts[i];
      
      // Teacher reads the fact
      const audioFile = getFactAudio(fact.id, 'statement');
    await playAudio(audioFile);
    
      // "Your turn to read it" for first, "Your turn" for rest
    await new Promise(r => setTimeout(r, 300));
      await playAudio(getInstructionAudio(i === 0 ? 'your-turn-read-it' : 'your-turn'));
      
      // Give student time to say it (pause)
      await new Promise(r => setTimeout(r, 2000));
    
      setIsReading(false);
      
      // 1s delay before next fact
      if (i < lesson.facts.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    // "Great job reading the facts!"
    await playAudio(getInstructionAudio('great-job-reading'));
    
    // Small delay then complete
    setTimeout(() => {
      onComplete();
    }, 1500);
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
                    ? 'bg-purple-500 text-white shadow-xl scale-105'
                    : index < currentFactIndex
                    ? 'bg-green-100 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="text-6xl font-bold">
                  {fact.operand1} + {fact.operand2} = {fact.result}
                </div>
                
                {/* "Your turn!" indicator */}
                {index === currentFactIndex && isReading && (
                  <div className="mt-3 text-2xl font-bold animate-pulse">
                    👄 Your turn to read it!
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auto-playing indicator */}
          <div className="text-center text-gray-600 text-lg">
            🔊 Listen and repeat...
          </div>
        </div>
      </div>
    </div>
  );
}

