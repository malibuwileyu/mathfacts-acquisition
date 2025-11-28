/**
 * Fact Families Step 6: Quiz
 * Test both directions in mixed order
 * 
 * @spec BRAINLIFT.md - "Quiz - Test both directions in mixed order"
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';

interface Props {
  lesson: Lesson;
  onComplete: (score: number) => void;
}

interface QuizQuestion {
  type: 'sum' | 'turnaround';
  fact: Fact;
  turnaroundAnswer?: { num1: number, num2: number };
}

interface QuizAnswer {
  factId: string;
  correct: boolean;
}

export default function FFStep6Quiz({ lesson, onComplete }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [sumAnswer, setSumAnswer] = useState('');
  const [operandsConfirmed, setOperandsConfirmed] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { playAudio } = useAudio();

  // Build quiz: ALL turnaround questions
  const [quizQuestions] = useState(() => {
    const questions: QuizQuestion[] = [];
    
    // Go through each pair and ask for turnaround
    lesson.commutativePairs!.forEach(pair => {
      const baseFact = lesson.facts.find(f => f.id === pair[0])!;
      const [turnA, turnB] = pair[1].split('+').map(Number);
      
      questions.push({
        type: 'turnaround',
        fact: baseFact,
        turnaroundAnswer: { num1: turnA, num2: turnB }
      });
    });
    
    return questions;
  });

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const currentFact = currentQuestion?.fact;
  
  // Determine expected digits
  const expectedDigitsSingle = currentFact ? (currentFact.result < 10 ? 1 : 2) : 1;
  const expectedDigits1 = currentQuestion?.turnaroundAnswer ? (currentQuestion.turnaroundAnswer.num1 < 10 ? 1 : 2) : 1;
  const expectedDigits2 = currentQuestion?.turnaroundAnswer ? (currentQuestion.turnaroundAnswer.num2 < 10 ? 1 : 2) : 1;

  useEffect(() => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'sum') {
      playAudio(getFactAudio(currentFact.id, 'question'));
    } else {
      // Turnaround question
      playAudio(getFactAudio(currentFact.id, 'statement'));
      setTimeout(() => {
        playAudio({
          filename: 'instructions/whats-turnaround.mp3',
          text: "What's its turnaround?"
        });
      }, 2000);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = () => {
    if (showFeedback) return;
    
    if (currentQuestion.type === 'sum') {
      // Sum question - simple answer check
      if (!answer) return;
      const userAnswer = parseInt(answer);
      const correct = userAnswer === currentFact.result;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    const newAnswers = [...answers, { factId: currentFact.id, correct }];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
        
        if (currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          const correctCount = newAnswers.filter(a => a.correct).length;
          const score = Math.round((correctCount / newAnswers.length) * 100);
          onComplete(score);
        }
      }, 1000);
    } else {
      // Turnaround question - two-part answer
      if (!operandsConfirmed) {
        // Part 1: Check operands
        if (!answer1 || !answer2) return;
        const num1 = parseInt(answer1);
        const num2 = parseInt(answer2);
        const correct = num1 === currentQuestion.turnaroundAnswer!.num1 && 
                      num2 === currentQuestion.turnaroundAnswer!.num2;
        
        if (correct) {
          // Operands correct! Show checkmark and move to sum entry
          setIsCorrect(true);
          setShowFeedback(true);
          
          setTimeout(() => {
            setShowFeedback(false);
            setOperandsConfirmed(true);
          }, 800);
        } else {
          // Operands wrong - fail and move on
          setIsCorrect(false);
          setShowFeedback(true);
          
          const newAnswers = [...answers, { factId: currentFact.id, correct: false }];
          setAnswers(newAnswers);

          setTimeout(() => {
            resetQuestion();
            
            if (currentQuestionIndex < quizQuestions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
              const correctCount = newAnswers.filter(a => a.correct).length;
              const score = Math.round((correctCount / newAnswers.length) * 100);
              onComplete(score);
            }
          }, 1500);
        }
      } else {
        // Part 2: Check sum
        if (!sumAnswer) return;
        const userSum = parseInt(sumAnswer);
        const correct = userSum === currentFact.result;
        
        setIsCorrect(correct);
        setShowFeedback(true);

        const newAnswers = [...answers, { factId: currentFact.id, correct }];
        setAnswers(newAnswers);

        setTimeout(() => {
          resetQuestion();
      
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const correctCount = newAnswers.filter(a => a.correct).length;
        const score = Math.round((correctCount / newAnswers.length) * 100);
        onComplete(score);
      }
    }, 1000);
      }
    }
  };
  
  const resetQuestion = () => {
    setShowFeedback(false);
    setAnswer('');
    setAnswer1('');
    setAnswer2('');
    setSumAnswer('');
    setOperandsConfirmed(false);
  };
  
  // Auto-submit when answer is complete
  useEffect(() => {
    if (!currentQuestion || showFeedback) return;
    
    if (currentQuestion.type === 'sum' && answer.length === expectedDigitsSingle) {
      handleSubmit();
    } else if (currentQuestion.type === 'turnaround') {
      if (!operandsConfirmed && answer1.length === expectedDigits1 && answer2.length === expectedDigits2) {
        handleSubmit();
      } else if (operandsConfirmed && sumAnswer.length === expectedDigitsSingle) {
        handleSubmit();
      }
    }
  }, [answer, answer1, answer2, sumAnswer]);

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-5">
          
          {/* Question display */}
          <div className="text-center mb-3">
            <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
              QUIZ
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
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
            {/* Show different display for each question type */}
            {currentQuestion.type === 'sum' ? (
              <>
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {currentFact.operand1} + {currentFact.operand2} = {showFeedback ? currentFact.result : '?'}
                </div>
                {answer && !showFeedback && (
                  <div className="text-4xl font-bold text-gray-800">
                    {answer}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl font-bold font-mono text-teal-600 mb-2">
                  {String(currentFact.operand1).padStart(2, '\u00A0')} + {String(currentFact.operand2).padStart(2, '\u00A0')} = {String(currentFact.result).padStart(2, '\u00A0')}
                </div>
                <p className="text-base text-gray-700 mb-2">Turnaround?</p>
                {!showFeedback && (
                  <div className="text-3xl font-bold font-mono text-gray-800">
                    {operandsConfirmed 
                      ? `${String(answer1).padStart(2, '\u00A0')} + ${String(answer2).padStart(2, '\u00A0')} = ${sumAnswer ? String(sumAnswer).padStart(2, '\u00A0') : '__'}`
                      : `${answer1 ? String(answer1).padStart(2, '\u00A0') : '__'} + ${answer2 ? String(answer2).padStart(2, '\u00A0') : '__'} = __`
                    }
                  </div>
                )}
              </>
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
                    {currentQuestion.type === 'sum' ? (
                      <>
                        <div className="text-xl text-red-700">Listen.</div>
                        <div className="text-3xl font-bold text-red-700">
                          {currentFact.operand1} + {currentFact.operand2} = <span className="underline">{currentFact.result}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl text-red-700">Listen. The turnaround is</div>
                        <div className="text-3xl font-bold font-mono text-red-700">
                          {String(currentQuestion.turnaroundAnswer!.num1).padStart(2, '\u00A0')} + <span className="underline">{String(currentQuestion.turnaroundAnswer!.num2).padStart(2, '\u00A0')}</span> = {String(currentFact.result).padStart(2, '\u00A0')}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Number pad */}
          {!showFeedback && (
              <NumberPad 
              value={currentQuestion.type === 'sum' ? answer : (operandsConfirmed ? sumAnswer : '')}
                onChange={(val) => {
                  if (currentQuestion.type === 'sum') {
                    setAnswer(val);
                } else {
                  // Turnaround question
                  if (operandsConfirmed) {
                    // Part 2: Entering sum
                    setSumAnswer(val);
                  } else {
                    // Part 1: Entering operands
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

