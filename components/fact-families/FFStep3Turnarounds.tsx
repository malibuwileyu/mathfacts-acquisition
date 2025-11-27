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
  const [hasHeardOnce, setHasHeardOnce] = useState(false);
  const { playAudio } = useAudio();

  const currentPair = lesson.commutativePairs![currentPairIndex];
  const baseFact = lesson.facts.find(f => f.id === currentPair[0])!;
  
  // The turnaround is the reverse
  const [turnA, turnB] = currentPair[1].split('+').map(Number);

  // Determine expected digits for each operand
  const expectedDigits1 = turnA < 10 ? 1 : 2;
  const expectedDigits2 = turnB < 10 ? 1 : 2;

  // Auto-play on mount and when moving to next pair
  useEffect(() => {
    setHasHeardOnce(false);
    playQuestion();
  }, [currentPairIndex]);

  const playQuestion = async () => {
    await playAudio(getFactAudio(baseFact.id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    
    await playAudio({
      filename: 'instructions/whats-turnaround.mp3',
      text: "What's its turnaround?"
    });
    
    setHasHeardOnce(true);
  };

  const handleSubmit = () => {
    if (!answer1 || !answer2 || showFeedback) return;
    
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
  
  // Auto-submit when both answers are complete
  useEffect(() => {
    if (answer1.length === expectedDigits1 && answer2.length === expectedDigits2 && !showFeedback) {
      handleSubmit();
    }
  }, [answer1, answer2]);

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
          <div className={`text-center mb-3 p-6 rounded-xl transition-all ${
            showFeedback 
              ? isCorrect 
                ? 'bg-green-100' 
                : 'bg-red-100'
              : ''
          }`}>
            {/* Given equation - aligned */}
            <div className="text-4xl font-bold font-mono text-teal-600 mb-2">
              {String(baseFact.operand1).padStart(2, '\u00A0')} + {String(baseFact.operand2).padStart(2, '\u00A0')} = {String(baseFact.result).padStart(2, '\u00A0')}
            </div>
            
            {/* Hear button (only shows after first play) */}
            {hasHeardOnce && !showFeedback && (
            <button
              onClick={playQuestion}
                className="bg-teal-400 hover:bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-lg mb-3"
            >
                🔊 Hear Again
            </button>
            )}

            {/* Answer input - aligned vertically */}
            {!showFeedback && (
              <div className="mt-3">
                <div className="text-4xl font-bold font-mono text-gray-900 flex items-center justify-center gap-2">
              <input
                type="text"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                    className="w-16 h-16 text-center border-3 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-3xl font-mono"
                    placeholder="__"
                maxLength={2}
                autoFocus
              />
                  <span>+</span>
              <input
                type="text"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                    className="w-16 h-16 text-center border-3 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-3xl font-mono"
                    placeholder="__"
                maxLength={2}
              />
                  <span>= {String(baseFact.result).padStart(2, '\u00A0')}</span>
                </div>
              </div>
            )}

            {/* Feedback - inline */}
            {showFeedback && (
              <div className="mt-4">
                {isCorrect ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-6xl text-green-600">✓</div>
                    <div className="text-2xl font-bold text-green-700">Great job!</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-6xl text-red-600">✗</div>
                    <div className="text-xl text-red-700">Listen. The turnaround is</div>
                    <div className="text-3xl font-bold font-mono text-red-700">
                      {String(turnA).padStart(2, '\u00A0')} + <span className="underline">{String(turnB).padStart(2, '\u00A0')}</span> = {String(baseFact.result).padStart(2, '\u00A0')}
                    </div>
                  </div>
                )}
            </div>
            )}
          </div>

          {/* Number pad */}
          {!showFeedback && (
              <NumberPad 
                value=""  // Display shows current state in inputs, not here
                onChange={(val) => {
                  if (val === '') {
                    // Clear button pressed - clear both
                    setAnswer1('');
                    setAnswer2('');
                  } else {
                    // Number pressed - auto-fill first empty box
                  if (!answer1 || answer1.length < expectedDigits1) {
                    setAnswer1(answer1 + val);
                  } else if (!answer2 || answer2.length < expectedDigits2) {
                    setAnswer2(answer2 + val);
                    } else {
                      // Both full, replace second
                      setAnswer2(val);
                    }
                  }
                }}
              />
          )}
        </div>
      </div>
    </div>
  );
}

