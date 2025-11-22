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

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-4">
          
          {/* Audio indicator only */}
          <div className="text-center mb-4">
            <div className="text-6xl mb-3">🎧</div>
            <p className="text-lg text-gray-700">Listen...</p>
          </div>

          {/* Answer input */}
          {(answer1 || answer2) && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 text-center">
              <div className="text-4xl font-bold text-gray-900">
                {answer1 || '_'} + {answer2 || '_'}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback ? (
            <div className={`text-center mb-2 text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
          ) : null}

          {/* Number pad */}
          {!showFeedback && (
            <>
              <NumberPad 
                value=""
                onChange={(val) => {
                  if (val === '') {
                    setAnswer1('');
                    setAnswer2('');
                  } else {
                    if (!answer1) {
                      setAnswer1(val);
                    } else if (!answer2) {
                      setAnswer2(val);
                    } else {
                      setAnswer2(val);
                    }
                  }
                }}
              />
              
              <button
                onClick={handleSubmit}
                disabled={!answer1 || !answer2}
                className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

