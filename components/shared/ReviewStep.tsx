/**
 * Mixed Review Step
 * 20 straight quiz questions from all previous lessons
 * 
 * NEW RULES (per client feedback):
 * - 20 questions total
 * - Only straight quiz questions (no turnaround questions)
 * - Weighted heavily toward 6-9 facts
 * - Random order
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';
import { generateReviewQuestions, ReviewQuestion } from '@/lib/reviewGenerator';

interface Props {
  lesson: Lesson;
  onComplete: (score: number) => void;
}

export default function ReviewStep({ lesson, onComplete }: Props) {
  const [questions] = useState(() => generateReviewQuestions(lesson));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<boolean[]>([]);  // Track correct/incorrect
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  const currentQuestion = questions[currentQuestionIndex];
  const currentFact = currentQuestion.fact;
  
  // Determine expected digits
  const expectedDigits = currentFact.result < 10 ? 1 : 2;

  useEffect(() => {
    // Play question audio
        playAudio(getFactAudio(currentFact.id, 'question'));
  }, [currentQuestionIndex, currentFact.id, playAudio]);

  const handleSubmit = () => {
    if (!answer || showFeedback) return;
    
      const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track progress
    updateFactProgress(lesson.id, currentFact.id, {
      factId: currentFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Track answer
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      setQuestionStartTime(Date.now());
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Calculate final score
        const correctCount = newAnswers.filter(a => a).length;
        const score = Math.round((correctCount / newAnswers.length) * 100);
        onComplete(score);
      }
    }, 1000);
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
        <div className="bg-white rounded-xl shadow-xl p-5">
          
          {/* Header */}
          <div className="text-center mb-3">
            <div className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
              MIXED REVIEW
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          {/* Question content with inline feedback */}
          <div className={`text-center mb-3 p-6 rounded-xl transition-all ${
            showFeedback 
              ? isCorrect 
                ? 'bg-green-100' 
                : 'bg-red-100'
              : ''
          }`}>
            <div className="text-5xl font-bold text-orange-600 mb-2">
              {currentFact.operand1} + {currentFact.operand2} = {showFeedback ? currentFact.result : '?'}
                </div>
            {answer && !showFeedback && (
              <div className="text-4xl font-bold text-gray-800 mt-2">
                {answer}
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
                    <div className="text-xl text-red-700">Listen.</div>
                    <div className="text-3xl font-bold text-red-700">
                      {currentFact.operand1} + {currentFact.operand2} = <span className="underline">{currentFact.result}</span>
                </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Number pad */}
          {!showFeedback && (
                  <NumberPad value={answer} onChange={setAnswer} />
          )}
        </div>
      </div>
    </div>
  );
}

