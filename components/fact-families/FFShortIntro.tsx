/**
 * Shortened Fact Family Reminder (Lessons 6, 8, 10)
 * Brief reminder before starting
 */

'use client';

import { useState } from 'react';
import { useAudio } from '@/lib/useAudio';

interface Props {
  onComplete: () => void;
}

export default function FFShortIntro({ onComplete }: Props) {
  const [hasHeard, setHasHeard] = useState(false);
  const { playAudio } = useAudio();

  const playReminder = async () => {
    await playAudio({
      filename: 'instructions/turnaround-reminder.mp3',
      text: 'Two plus one equals three. Its turnaround is one plus two equals three. Let\'s work on turnarounds.'
    });
    setHasHeard(true);
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          
          <h2 className="text-3xl font-bold text-purple-600 mb-6">
            Turnarounds!
          </h2>

          {/* Quick reminder */}
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-3">
              2 + 1 = 3
            </div>
            <div className="text-2xl text-gray-500 mb-3">↕️</div>
            <div className="text-5xl font-bold text-pink-600 mb-3">
              1 + 2 = 3
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <button
              onClick={playReminder}
              className="w-full bg-purple-400 hover:bg-purple-500 text-white text-xl font-bold py-4 rounded-xl shadow-lg"
            >
              🔊 Hear Reminder
            </button>

            {hasHeard && (
              <button
                onClick={onComplete}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
              >
                Let's Go →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

