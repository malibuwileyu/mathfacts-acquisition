/**
 * Series Saying Step 2: Guided Practice A
 * Student reads facts and answers together with teacher
 * 
 * @spec BRAINLIFT.md - "Read facts and answers together (simultaneous/repeat after me)"
 * @spec CLIENT-REQUIREMENTS.md - Student speaks aloud, no recording needed
 */

'use client';

import { Lesson } from '@/types';
import { useState } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step2GuidedA({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [hasRead, setHasRead] = useState(false);
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];

  const handleRead = async () => {
    const audioFile = getFactAudio(currentFact.id, 'statement');
    await playAudio(audioFile);
    
    // "Your turn" cue (pre-generated audio)
    await new Promise(r => setTimeout(r, 300));
    await playAudio({
      filename: 'instructions/your-turn-short.mp3',
      text: 'Your turn'
    });
    
    setHasRead(true);
  };

  const handleNext = () => {
    if (currentFactIndex < lesson.facts.length - 1) {
      setCurrentFactIndex(currentFactIndex + 1);
      setHasRead(false);
    }
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
              onClick={handleRead}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
            >
              🔊 Read Together
            </button>

            {hasRead && (
              <>
                {currentFactIndex < lesson.facts.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={onComplete}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-5 rounded-xl transition shadow-lg"
                  >
                    Next Step →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

