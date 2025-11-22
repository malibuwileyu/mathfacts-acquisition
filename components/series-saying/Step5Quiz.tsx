/**
 * Series Saying Step 5: Quiz
 * Final assessment in different order, 85% mastery required
 * 
 * @spec BRAINLIFT.md - "Problems presented one at a time in different but deliberate specific quiz order"
 * @spec BRAINLIFT.md - "85% minimum on quiz to pass"
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';

interface Props {
  lesson: Lesson;
  onComplete: (score: number) => void;
}

interface QuizAnswer {
  factId: string;
  correct: boolean;
}

export default function Step5Quiz({ lesson, onComplete }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  // Get facts in quiz order
  const orderedFacts = lesson.quizOrder.map(factId => 
    lesson.facts.find(f => f.id === factId)!
  );

  const currentFact = orderedFacts[currentQuestionIndex];

  useEffect(() => {
    // Play question audio when question changes
    playQuestion();
  }, [currentQuestionIndex]);

  const playQuestion = async () => {
    const audioFile = getFactAudio(currentFact.id, 'question');
    await playAudio(audioFile);
  };

  const handleSubmit = () => {
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track fact progress (for fastmath sync)
    updateFactProgress(lesson.id, currentFact.id, {
      factId: currentFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);

    // Record answer
    const newAnswers = [...answers, { factId: currentFact.id, correct }];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      setQuestionStartTime(Date.now());  // Reset timer
      
      if (currentQuestionIndex < orderedFacts.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const correctCount = newAnswers.filter(a => a.correct).length;
        const score = Math.round((correctCount / newAnswers.length) * 100);
        onComplete(score);
      }
    }, 1500);
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-5">
          
          {/* Question display */}
          <div className="text-center mb-3">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {currentFact.operand1} + {currentFact.operand2} = ?
            </div>
            
            {answer && (
              <div className="text-4xl font-bold text-gray-800">
                {answer}
              </div>
            )}
          </div>

          {/* Feedback (brief) */}
          {showFeedback ? (
            <div className={`text-center mb-2 text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
          ) : null}

          {/* Number pad */}
          {!showFeedback && (
            <>
              <NumberPad value={answer} onChange={setAnswer} />
              
              <button
                onClick={handleSubmit}
                disabled={!answer}
                className="w-full mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
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

