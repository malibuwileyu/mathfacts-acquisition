/**
 * Fact Families Step 3: Identify Turnarounds
 * Student sees/hears one equation and identifies the turnaround
 * 
 * Audio: "one plus two equals three. What's its turnaround?"
 * Student enters: 2+1
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function FFStep3Turnarounds({ lesson, onComplete }: Props) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { playAudio } = useAudio();

  const currentPair = lesson.commutativePairs![currentPairIndex];
  const baseFact = lesson.facts.find(f => f.id === currentPair[0])!;
  
  // The turnaround is the reverse
  const [turnA, turnB] = currentPair[1].split('+').map(Number);

  useEffect(() => {
    // Don't auto-play on load (causes TTS fallback)
    // Student will click button to hear question
  }, [currentPairIndex]);

  const playQuestion = async () => {
    await playAudio(getFactAudio(baseFact.id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    
    await playAudio({
      filename: 'instructions/whats-turnaround.mp3',
      text: "What's its turnaround?"
    });
  };

  const handleSubmit = () => {
    const num1 = parseInt(answer1);
    const num2 = parseInt(answer2);
    const correct = num1 === turnA && num2 === turnB;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer1('');
      setAnswer2('');
      
      if (currentPairIndex < lesson.commutativePairs!.length - 1) {
        setCurrentPairIndex(currentPairIndex + 1);
      } else {
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-4">
          
          {/* Pair indicator */}
          <div className="text-center mb-2">
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Fact Family {currentPairIndex + 1} of {lesson.commutativePairs!.length}
            </span>
          </div>

          {/* Base fact + question (combined) */}
          <div className="text-center mb-3">
            <div className="text-4xl font-bold text-teal-600 mb-2">
              {baseFact.operand1} + {baseFact.operand2} = {baseFact.result}
            </div>
            <button
              onClick={playQuestion}
              className="bg-teal-400 hover:bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-lg"
            >
              🔊 Hear
            </button>
          </div>

          {/* Answer input */}
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
              <input
                type="text"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                className="w-16 h-16 text-center border-3 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-2xl"
                maxLength={2}
                autoFocus
              />
              <span className="text-gray-900">+</span>
              <input
                type="text"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                className="w-16 h-16 text-center border-3 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-2xl"
                maxLength={2}
              />
              <span className="text-gray-900">= {baseFact.result}</span>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback ? (
            <div className={`text-center mb-2 text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
          ) : null}

          {/* Number pad */}
          {!showFeedback && (
            <>
              <NumberPad 
                value=""  // Display shows current state in inputs, not here
                onChange={(val) => {
                  if (val === '') {
                    // Clear button pressed - clear both
                    setAnswer1('');
                    setAnswer2('');
                  } else {
                    // Number pressed - auto-fill first empty box
                    if (!answer1) {
                      setAnswer1(val);
                    } else if (!answer2) {
                      setAnswer2(val);
                    } else {
                      // Both full, replace second
                      setAnswer2(val);
                    }
                  }
                }}
              />
              
              <button
                onClick={handleSubmit}
                disabled={!answer1 || !answer2}
                className="w-full mt-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white text-lg font-bold py-3 rounded-xl transition shadow-lg"
              >
                Check
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

