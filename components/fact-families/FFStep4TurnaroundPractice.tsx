/**
 * Fact Families Step 4: Turnaround Practice (Audio Only)
 * Hear equation, identify turnaround - no visual cue
 * 
 * Combines old Steps 4-5 into focused turnaround practice
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function FFStep4TurnaroundPractice({ lesson, onComplete }: Props) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  const currentPair = lesson.commutativePairs![currentPairIndex];
  const baseFact = lesson.facts.find(f => f.id === currentPair[0])!;
  const [turnA, turnB] = currentPair[1].split('+').map(Number);

  // Determine expected digits
  const expectedDigits1 = turnA < 10 ? 1 : 2;
  const expectedDigits2 = turnB < 10 ? 1 : 2;

  useEffect(() => {
    playQuestion();
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
    if (!answer1 || !answer2 || showFeedback) return;
    
    const num1 = parseInt(answer1);
    const num2 = parseInt(answer2);
    const correct = num1 === turnA && num2 === turnB;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track both facts in the pair
    updateFactProgress(lesson.id, baseFact.id, {
      factId: baseFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer1('');
      setAnswer2('');
      setQuestionStartTime(Date.now());
      
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
          
          <div className={`text-center mb-4 p-6 rounded-xl transition-all ${
            showFeedback 
              ? isCorrect 
                ? 'bg-green-100' 
                : 'bg-red-100'
              : ''
          }`}>
          {/* Audio indicator only */}
            {!showFeedback && (
              <>
            <div className="text-6xl mb-3">🎧</div>
            <p className="text-lg text-gray-700">Listen...</p>
              </>
            )}

          {/* Answer input */}
            {(answer1 || answer2) && !showFeedback && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <div className="text-4xl font-bold font-mono text-gray-900">
                  {answer1 ? String(answer1).padStart(2, ' ') : '__'} + {answer2 ? String(answer2).padStart(2, ' ') : '__'}
                </div>
              </div>
            )}

            {/* Feedback - inline */}
            {showFeedback && (
              <div>
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
                      {String(turnA).padStart(2, ' ')} + <span className="underline">{String(turnB).padStart(2, ' ')}</span> = {String(baseFact.result).padStart(2, ' ')}
                    </div>
                  </div>
                )}
            </div>
          )}
            </div>

          {/* Number pad */}
          {!showFeedback && (
              <NumberPad 
                value=""
                onChange={(val) => {
                  if (val === '') {
                    setAnswer1('');
                    setAnswer2('');
                  } else {
                  if (!answer1 || answer1.length < expectedDigits1) {
                    setAnswer1(answer1 + val);
                  } else if (!answer2 || answer2.length < expectedDigits2) {
                    setAnswer2(answer2 + val);
                    } else {
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

