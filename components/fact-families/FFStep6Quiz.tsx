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
  const currentFact = currentQuestion.fact;

  useEffect(() => {
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
    let correct = false;
    
    if (currentQuestion.type === 'sum') {
      const userAnswer = parseInt(answer);
      correct = userAnswer === currentFact.result;
    } else {
      // Turnaround question
      const num1 = parseInt(answer1);
      const num2 = parseInt(answer2);
      correct = num1 === currentQuestion.turnaroundAnswer!.num1 && 
                num2 === currentQuestion.turnaroundAnswer!.num2;
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);

    const newAnswers = [...answers, { factId: currentFact.id, correct }];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      setAnswer1('');
      setAnswer2('');
      
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const correctCount = newAnswers.filter(a => a.correct).length;
        const score = Math.round((correctCount / newAnswers.length) * 100);
        onComplete(score);
      }
    }, 1000);
  };

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
            
            {/* Show different display for each question type */}
            {currentQuestion.type === 'sum' ? (
              <>
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {currentFact.operand1} + {currentFact.operand2} = ?
                </div>
                {answer && (
                  <div className="text-4xl font-bold text-gray-800">
                    {answer}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  {currentFact.operand1} + {currentFact.operand2} = {currentFact.result}
                </div>
                <p className="text-base text-gray-700 mb-2">Turnaround?</p>
                {(answer1 || answer2) && (
                  <div className="text-3xl font-bold text-gray-800">
                    {answer1 || '_'} + {answer2 || '_'}
                  </div>
                )}
              </>
            )}
          </div>

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
                value={currentQuestion.type === 'sum' ? answer : ''}
                onChange={(val) => {
                  if (currentQuestion.type === 'sum') {
                    setAnswer(val);
                  } else {
                    // Turnaround - auto-fill
                    if (val === '') {
                      setAnswer1('');
                      setAnswer2('');
                    } else {
                      if (!answer1) setAnswer1(val);
                      else if (!answer2) setAnswer2(val);
                      else setAnswer2(val);
                    }
                  }
                }}
              />
              
              <button
                onClick={handleSubmit}
                disabled={currentQuestion.type === 'sum' ? !answer : (!answer1 || !answer2)}
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

