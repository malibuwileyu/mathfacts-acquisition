/**
 * Rule Introduction Screen (Plus 1 and Plus 0)
 * Shows before Step 1 for lessons teaching Plus 1 or Plus 0 facts
 * 
 * @spec CLIENT-REQUIREMENTS.md - Rule screen for Plus 1 and Plus 0
 * 
 * Script:
 * "Here's a rule for plus 1 facts. When you plus one, you say the next number.
 * 2+1 = 3 because 3 (arrow appears) is the next number after 2.
 * Remember the rule: When you plus one, you say the next number."
 */

'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/useAudio';

interface Props {
  ruleType: 'plus-one' | 'plus-zero';
  onComplete: () => void;
}

export default function RuleIntroduction({ ruleType, onComplete }: Props) {
  const [showArrow, setShowArrow] = useState(false);
  const [audioComplete, setAudioComplete] = useState(false);
  const { playAudio } = useAudio();

  const isPlusOne = ruleType === 'plus-one';
  
  // Content based on rule type
  const example = isPlusOne 
    ? { operand1: 2, operand2: 1, result: 3 }
    : { operand1: 2, operand2: 0, result: 2 };

  // Three separate audio parts
  const audioParts = isPlusOne ? [
    {
      filename: 'instructions/plus-one-rule-part1.mp3',
      text: 'Here\'s a rule for plus 1 facts. When you plus one, you say the next number.'
    },
    {
      filename: 'instructions/plus-one-rule-part2.mp3',
      text: '2+1 = 3 because 3 is the next number after 2.'
    },
    {
      filename: 'instructions/plus-one-rule-part3.mp3',
      text: 'Remember the rule: When you plus one, you say the next number.'
    }
  ] : [
    {
      filename: 'instructions/plus-zero-rule-part1.mp3',
      text: 'Here\'s a rule for plus 0 facts. When you plus zero, the number stays the same.'
    },
    {
      filename: 'instructions/plus-zero-rule-part2.mp3',
      text: '2+0 = 2 because when you add zero, nothing changes.'
    },
    {
      filename: 'instructions/plus-zero-rule-part3.mp3',
      text: 'Remember the rule: When you plus zero, the number stays the same.'
    }
  ];

  useEffect(() => {
    // Auto-start after 1s
    const timer = setTimeout(() => {
      playRuleAudio();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const playRuleAudio = async () => {
    // Play 3 parts with 1.5s pauses between them
    
    // Part 1: "Here's a rule..." (~4s)
    await playAudio(audioParts[0]);
    await new Promise(r => setTimeout(r, 1500));
    
    // Part 2: "2+1=3 because 3..." (~4s)
    // Arrow appears mid-sentence (~2s into part 2)
    const part2Promise = playAudio(audioParts[1]);
    setTimeout(() => {
      setShowArrow(true);
    }, 2000);
    await part2Promise;
    await new Promise(r => setTimeout(r, 1500));
    
    // Part 3: "Remember the rule..." (~3s)
    await playAudio(audioParts[2]);
    
    setAudioComplete(true);
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-12">
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
            {isPlusOne ? 'Plus 1 Rule' : 'Plus 0 Rule'}
          </h2>

          {/* Example equation */}
          <div className="text-center mb-12">
            <div className="text-8xl font-bold text-gray-800 mb-4">
              {example.operand1} + {example.operand2} = {example.result}
            </div>

            {/* Arrow appears when audio says "because [result]" */}
            <div className={`transition-all duration-500 ${showArrow ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-col items-center">
                <div className="text-6xl text-blue-500 mb-2">↑</div>
                <div className="text-3xl font-semibold text-gray-700">
                  {isPlusOne 
                    ? `The next number after ${example.operand1}`
                    : 'The number stays the same'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Visual rule reminder */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <p className="text-2xl text-center font-semibold text-gray-700">
              {isPlusOne 
                ? '📝 When you plus one, you say the next number.'
                : '📝 When you plus zero, the number stays the same.'
              }
            </p>
          </div>

          {/* Continue button (appears when audio done) */}
          {audioComplete && (
            <button
              onClick={onComplete}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-6 rounded-xl transition shadow-lg transform hover:scale-105"
            >
              Got it! Let's Practice →
            </button>
          )}

          {/* Listening indicator */}
          {!audioComplete && (
            <div className="text-center text-gray-500 text-xl">
              🔊 Listen to the rule...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

