/**
 * Fact Families Step 6: Quiz
 * Test both directions in mixed order
 * 
 * @spec BRAINLIFT.md - "Quiz - Test both directions in mixed order"
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
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
  const [audioReady, setAudioReady] = useState(false);
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

  // Play instruction on mount
  useEffect(() => {
    playAudio(getInstructionAudio('type-answer-for-each-fact'));
  }, []);

  useEffect(() => {
    if (!currentQuestion) return;
    setAudioReady(false);
    
    if (currentQuestion.type === 'sum') {
      playAudio(getFactAudio(currentFact.id, 'question'));
      setAudioReady(true);
    } else {
      // Turnaround question - wait for initial instruction to finish
      const delay = currentQuestionIndex === 0 ? 2500 : 0;
      setTimeout(async () => {
        await playAudio(getFactAudio(currentFact.id, 'statement'));
        await new Promise(r => setTimeout(r, 500));
        await playAudio({
          filename: 'instructions/whats-turnaround.mp3',
          text: "What's its turnaround?"
        });
        setAudioReady(true);
      }, delay);
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
          <div className={`text-center mb-3 p-4 rounded-xl transition-all ${
            showFeedback 
              ? isCorrect ? 'bg-green-200' : 'bg-red-200'
              : 'bg-gray-50'
          }`}>
            {/* Show different display for each question type */}
            {currentQuestion.type === 'sum' ? (
              <div className="flex items-center justify-center gap-3">
                {/* Left placeholder for alignment */}
                <span className="text-4xl invisible" aria-hidden="true">✓</span>
                <span className={`text-5xl font-bold ${
                  showFeedback && isCorrect ? 'text-green-800' : 
                  showFeedback && !isCorrect ? 'text-red-800' : 'text-green-600'
                }`}>
                  {currentFact.operand1} + {currentFact.operand2} = {showFeedback ? currentFact.result : (answer || '?')}
                </span>
                {/* Right checkmark - always present, visible only when showing feedback */}
                <span className={`text-4xl ${showFeedback ? '' : 'invisible'} ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold font-mono text-teal-600 mb-2">
                  <span className="invisible" aria-hidden="true">✓</span>
                  <span>{currentFact.operand1} + {currentFact.operand2} = {currentFact.result}</span>
                  <span className="invisible" aria-hidden="true">✓</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Turnaround?</p>
                <div className="flex items-center justify-center gap-2">
                  {/* Left placeholder for alignment */}
                  <span className="text-3xl invisible" aria-hidden="true">✓</span>
                  <span className={`text-3xl font-bold font-mono ${
                    showFeedback && isCorrect ? 'text-green-800' : 
                    showFeedback && !isCorrect ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {showFeedback && operandsConfirmed
                      ? `${currentQuestion.turnaroundAnswer!.num1} + ${currentQuestion.turnaroundAnswer!.num2} = ${currentFact.result}`
                      : showFeedback && !operandsConfirmed
                        ? `${answer1} + ${answer2} = ?`
                        : operandsConfirmed 
                          ? `${answer1} + ${answer2} = ${sumAnswer || '?'}`
                          : `${answer1 || '_'} + ${answer2 || '_'} = ?`
                    }
                  </span>
                  {/* Right checkmark - always present, visible only when showing feedback */}
                  <span className={`text-3xl ${showFeedback ? '' : 'invisible'} ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                </div>
                {showFeedback && !isCorrect && (
                  <div className="text-sm text-red-700 mt-2">
                    The turnaround is {currentQuestion.turnaroundAnswer!.num1} + <span className="underline">{currentQuestion.turnaroundAnswer!.num2}</span> = {currentFact.result}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Number pad - blocked until audio finishes */}
              <NumberPad 
              value={currentQuestion.type === 'sum' ? answer : (operandsConfirmed ? sumAnswer : '')}
              hideDisplay
              disabled={!audioReady || showFeedback}
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
        </div>
      </div>
    </div>
  );
}

