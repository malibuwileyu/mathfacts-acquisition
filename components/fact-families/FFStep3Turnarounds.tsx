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
            {/* Equations aligned in table structure */}
            <div className="inline-block font-mono text-4xl font-bold">
              {/* Row 1: Given equation - with invisible placeholder for checkmark alignment */}
              <div className="flex items-center justify-center text-teal-600 mb-3">
                <span className="w-8 invisible" aria-hidden="true">✓</span>
                <span className="w-12 text-center">{baseFact.operand1}</span>
                <span className="w-8 text-center">+</span>
                <span className="w-12 text-center">{baseFact.operand2}</span>
                <span className="w-8 text-center">=</span>
                <span className="w-12 text-center">{baseFact.result}</span>
                <span className="w-8 invisible" aria-hidden="true">✓</span>
              </div>
              
              {/* Hear button (only shows after first play) */}
              {hasHeardOnce && !showFeedback && (
                <div className="flex justify-center mb-3">
                  <button
                    onClick={playQuestion}
                    className="bg-teal-400 hover:bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-lg"
                  >
                    🔊 Hear Again
                  </button>
                </div>
              )}

              {/* Row 2: Answer input or feedback - checkmark always present for alignment */}
              <div className="flex items-center justify-center text-gray-900">
                {/* Left placeholder - always present */}
                <span className="w-8 invisible" aria-hidden="true">✓</span>
                
                {!showFeedback ? (
                  <>
                    <span className="w-12 flex justify-center">
                      <div className="w-10 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-3xl font-mono bg-white">
                        {answer1 || <span className="text-gray-400">_</span>}
                      </div>
                    </span>
                    <span className="w-8 text-center">+</span>
                    <span className="w-12 flex justify-center">
                      <div className="w-10 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-3xl font-mono bg-white">
                        {answer2 || <span className="text-gray-400">_</span>}
                      </div>
                    </span>
                    <span className="w-8 text-center">=</span>
                    <span className="w-12 text-center">{baseFact.result}</span>
                  </>
                ) : (
                  <>
                    <span className="w-12 text-center">{answer1}</span>
                    <span className="w-8 text-center">+</span>
                    <span className="w-12 text-center">{answer2}</span>
                    <span className="w-8 text-center">=</span>
                    <span className="w-12 text-center">{baseFact.result}</span>
                  </>
                )}
                
                {/* Right checkmark - always present, visible only when showing feedback */}
                <span className={`w-8 text-3xl text-center ${showFeedback ? '' : 'invisible'} ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              </div>

              {/* Correction for wrong answer */}
              {showFeedback && !isCorrect && (
                <div className="mt-2 text-center text-red-700 text-sm">
                  The turnaround is {turnA} + <span className="underline">{turnB}</span> = {baseFact.result}
                </div>
              )}
            </div>
          </div>

          {/* Number pad - blocked until audio finishes */}
              <NumberPad 
                value=""
                hideDisplay
                onChange={(val) => {
                  if (!hasHeardOnce) return; // Block input until audio is done
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
        </div>
      </div>
    </div>
  );
}

