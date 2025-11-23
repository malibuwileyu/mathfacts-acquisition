/**
 * Mixed Review Step
 * 6-10 questions from current + previous lessons
 * 
 * Rules:
 * - 50% current lesson (weight turnarounds 60/40)
 * - 50% previous lessons (even spread, max 1-2 per lesson)
 * - Weight 6,7,8,9 heavily
 * - Odd pulls from odd, even from even
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
  const [answer1, setAnswer1] = useState('');  // For turnaround first operand
  const [answer2, setAnswer2] = useState('');  // For turnaround second operand
  const [answers, setAnswers] = useState<boolean[]>([]);  // Track correct/incorrect
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  const currentQuestion = questions[currentQuestionIndex];
  const currentFact = currentQuestion.fact;

  useEffect(() => {
    const playQuestionAudio = async () => {
      if (currentQuestion.askAsTurnaround && currentQuestion.turnaroundOf) {
        // Play base fact, then ask for turnaround
        await playAudio(getFactAudio(currentQuestion.turnaroundOf.id, 'statement'));
        await playAudio({ filename: 'instructions/whats-turnaround.mp3', text: "What's its turnaround?" });
      } else {
        // Normal question
        playAudio(getFactAudio(currentFact.id, 'question'));
      }
    };
    
    playQuestionAudio();
  }, [currentQuestionIndex, currentQuestion, currentFact.id, playAudio]);

  const handleSubmit = () => {
    let correct: boolean;
    
    if (currentQuestion.askAsTurnaround) {
      // Check turnaround: both operands must match
      const userOp1 = parseInt(answer1);
      const userOp2 = parseInt(answer2);
      correct = userOp1 === currentFact.operand1 && userOp2 === currentFact.operand2;
    } else {
      // Check sum
      const userAnswer = parseInt(answer);
      correct = userAnswer === currentFact.result;
    }
    
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
      setAnswer1('');
      setAnswer2('');
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
            
            {currentQuestion.askAsTurnaround && currentQuestion.turnaroundOf ? (
              <>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {currentQuestion.turnaroundOf.operand1} + {currentQuestion.turnaroundOf.operand2} = {currentQuestion.turnaroundOf.result}
                </div>
                <div className="text-2xl text-gray-600 mb-2">
                  What&apos;s its turnaround?
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-center gap-2 text-4xl font-bold text-gray-900">
                    <input
                      type="text"
                      value={answer1}
                      readOnly
                      className="w-16 h-16 text-center border-3 border-gray-400 rounded-lg text-3xl bg-white"
                      placeholder="?"
                    />
                    <span className="text-gray-800">+</span>
                    <input
                      type="text"
                      value={answer2}
                      readOnly
                      className="w-16 h-16 text-center border-3 border-gray-400 rounded-lg text-3xl bg-white"
                      placeholder="?"
                    />
                    <span className="text-gray-800">= ?</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl font-bold text-orange-600">
                  {currentFact.operand1} + {currentFact.operand2} = ?
                </div>
                {answer && (
                  <div className="text-4xl font-bold text-gray-800 mt-2">
                    {answer}
                  </div>
                )}
              </>
            )}
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
              {currentQuestion.askAsTurnaround ? (
                <>
                  <NumberPad 
                    value=""
                    onChange={(val) => {
                      if (val === '') {
                        setAnswer1('');
                        setAnswer2('');
                      } else {
                        // Auto-fill first empty box
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
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
                  >
                    Submit
                  </button>
                </>
              ) : (
                <>
                  <NumberPad value={answer} onChange={setAnswer} />
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!answer}
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
                  >
                    Submit
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

