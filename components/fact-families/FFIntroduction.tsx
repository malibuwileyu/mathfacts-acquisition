/**
 * Fact Families Introduction Screen
 * Explains concept before starting Step 1
 */

'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/useAudio';

interface Props {
  onComplete: () => void;
}

export default function FFIntroduction({ onComplete }: Props) {
  const [hasHeard, setHasHeard] = useState(false);
  const { playAudio } = useAudio();

  const playExplanation = async () => {
    await playAudio({
      filename: 'instructions/fact-family-intro.mp3',
      text: `Two plus one equals three. But guess what? One plus two also equals three! The numbers switched places, but the answer stayed the same. We call this a turnaround. And when two facts are turnarounds, they make a fact family.`
    });
    setHasHeard(true);
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6">
          
          <h1 className="text-3xl font-bold text-purple-600 mb-5 text-center">
            What's a Fact Family?
          </h1>

          {/* Example */}
          <div className="bg-purple-50 rounded-xl p-5 mb-4">
            <div className="text-5xl font-bold text-purple-600 mb-3 text-center">
              2 + 1 = 3
            </div>
            <div className="text-2xl text-gray-500 mb-3 text-center">
              ↕️ switch
            </div>
            <div className="text-5xl font-bold text-pink-600 mb-3 text-center">
              1 + 2 = 3
            </div>
            <div className="text-xl font-bold text-green-600 text-center">
              Same answer!
            </div>
          </div>

          {/* Simple explanation */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-lg text-gray-800 mb-2">
              <span className="font-bold text-blue-600">Turnaround</span> = numbers switch places 🔄
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-bold text-purple-600">Fact Family</span> = two turnarounds 👨‍👩‍👧‍👦
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <button
              onClick={playExplanation}
              className="w-full bg-purple-400 hover:bg-purple-500 text-white text-xl font-bold py-4 rounded-xl shadow-lg"
            >
              🔊 Hear Explanation
            </button>

            {hasHeard && (
              <button
                onClick={onComplete}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
              >
                Got It! →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

