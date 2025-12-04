/**
 * Series Saying Step 4: Guided Practice B
 * Student sees facts, recalls answers with error correction
 * 
 * @spec BRAINLIFT.md - "Student sees the facts, has to recall the answers in order"
 * @spec CLIENT-REQUIREMENTS.md - Simplified error correction
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step4GuidedB({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();
  
  // Play instruction audio on mount
  useEffect(() => {
    playAudio(getInstructionAudio('type-answer-for-each-fact'));
  }, []);

  const currentFact = lesson.facts[currentFactIndex];
  
  // Determine expected number of digits
  const expectedDigits = currentFact.result < 10 ? 1 : 2;

  const handleSubmit = async () => {
    if (!answer || showFeedback) return;
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track fact progress (for fastmath sync)
    updateFactProgress(lesson.id, currentFact.id, {
      factId: currentFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0  // Will be calculated in progressStore
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      // Correct! Play audio and move on quickly
      await playAudio(getInstructionAudio('great-job'));
      
      setTimeout(() => {
        moveToNext();
      }, 1000);
    } else {
      // Wrong - show correction inline, play audio
      await playAudio(getInstructionAudio('try-again'));
      
      // Wait a bit, then move on
      setTimeout(() => {
        moveToNext();
      }, 2500);
    }
  };

  // Auto-submit when answer is complete
  useEffect(() => {
    if (answer.length === expectedDigits && !showFeedback) {
      handleSubmit();
    }
  }, [answer]);

  const moveToNext = () => {
    setShowFeedback(false);
    setAnswer('');
    setQuestionStartTime(Date.now());  // Reset timer for next question
    
    if (currentFactIndex < lesson.facts.length - 1) {
      setCurrentFactIndex(currentFactIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6">
          
          {/* Progress dots at top */}
          <div className="flex justify-center gap-2 mb-4">
            {lesson.facts.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentFactIndex ? 'bg-orange-500' :
                  index < currentFactIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Current question with inline feedback */}
          <div className={`text-center mb-4 p-4 rounded-xl transition-all ${
            showFeedback 
              ? isCorrect 
                ? 'bg-green-200' 
                : 'bg-red-200'
              : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center gap-3">
              {/* Invisible placeholder for checkmark (keeps alignment stable) */}
              <span className="text-4xl invisible" aria-hidden="true">✓</span>
              <span className={`text-5xl font-bold ${
                showFeedback && isCorrect ? 'text-green-800' : 
                showFeedback && !isCorrect ? 'text-red-800' : 'text-gray-800'
              }`}>
                {currentFact.operand1} + {currentFact.operand2} = {showFeedback ? currentFact.result : (answer || '?')}
              </span>
              {/* Checkmark/X - always takes space, visible only when showing feedback */}
              <span className={`text-4xl ${showFeedback ? '' : 'invisible'} ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✓' : '✗'}
              </span>
            </div>
          </div>

          {/* Number pad - always visible, no display since answer shows in equation */}
          <NumberPad value={answer} onChange={setAnswer} maxValue={20} hideDisplay />
        </div>
      </div>
    </div>
  );
}

