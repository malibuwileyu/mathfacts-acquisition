/**
 * Series Saying Step 5: Guided Practice C
 * Student recalls from memory (audio prompt only, no visual)
 * 
 * @spec BRAINLIFT.md - "Student says facts and answers in order from memory"
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step5GuidedC({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasHeardQuestion, setHasHeardQuestion] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];
  
  // Determine expected digits for auto-submit
  const expectedDigits = currentFact.result < 10 ? 1 : 2;

  useEffect(() => {
    // Auto-play question when fact changes
    if (!hasHeardQuestion) {
      playQuestion();
    }
  }, [currentFactIndex]);

  const playQuestion = async () => {
    const audioFile = getFactAudio(currentFact.id, 'question');
    await playAudio(audioFile);
    setHasHeardQuestion(true);
  };

  const handleSubmit = async () => {
    if (!answer || showFeedback) return;
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track fact progress
    updateFactProgress(lesson.id, currentFact.id, {
      factId: currentFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      await playAudio(getInstructionAudio('great-job'));
      setTimeout(() => moveToNext(), 1000);
    } else {
      await playAudio(getInstructionAudio('try-again'));
      await playAudio(getFactAudio(currentFact.id, 'correction'));
      setTimeout(() => moveToNext(), 2000);
    }
  };

  const moveToNext = () => {
    setShowFeedback(false);
    setAnswer('');
    setHasHeardQuestion(false);
    setQuestionStartTime(Date.now());
    
    if (currentFactIndex < lesson.facts.length - 1) {
      setCurrentFactIndex(currentFactIndex + 1);
    } else {
      onComplete();
    }
  };

  // Auto-submit when answer is complete
  useEffect(() => {
    if (answer.length === expectedDigits && !showFeedback) {
      handleSubmit();
    }
  }, [answer]);

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
                  index === currentFactIndex ? 'bg-indigo-500' :
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
              <span className={`text-5xl font-bold ${
                showFeedback && isCorrect ? 'text-green-800' : 
                showFeedback && !isCorrect ? 'text-red-800' : 'text-gray-800'
              }`}>
                {currentFact.operand1} + {currentFact.operand2} = {showFeedback ? currentFact.result : (answer || '?')}
              </span>
              {showFeedback && (
                <span className={`text-4xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          {/* Number pad - always visible, no display */}
          <NumberPad value={answer} onChange={setAnswer} maxValue={20} hideDisplay />
        </div>
      </div>
    </div>
  );
}

