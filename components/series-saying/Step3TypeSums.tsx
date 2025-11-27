/**
 * Series Saying Step 3: Type the Sum in a Series
 * Student fills in the answers (sums) for all facts in order
 * 
 * @spec CLIENT-REQUIREMENTS.md - New intermediary activity after Read Together
 * Requirements:
 * - Display all equations vertically with blank sums
 * - Fill in order (top to bottom), can't skip ahead
 * - "Good job" on correct answer, move to next
 * - On any error: highlight failed equations, redo entire step
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getInstructionAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step3TypeSums({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<(number | null)[]>(Array(lesson.facts.length).fill(null));
  const [failedIndices, setFailedIndices] = useState<number[]>([]);
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];
  const allComplete = answers.every((a) => a !== null);
  
  // Determine expected number of digits
  const expectedDigits = currentFact.result < 10 ? 1 : 2;

  const handleSubmit = async () => {
    if (!answer) return;
    
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;

    if (correct) {
      // Correct! Play "Good job" and move to next
      await playAudio(getInstructionAudio('good-job'));
      
      const newAnswers = [...answers];
      newAnswers[currentFactIndex] = userAnswer;
      setAnswers(newAnswers);
      setAnswer('');

      // If all done, complete step
      if (currentFactIndex === lesson.facts.length - 1) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        // Move to next fact
        setCurrentFactIndex(currentFactIndex + 1);
      }
    } else {
      // Wrong! Highlight this equation and redo the step
      setFailedIndices([currentFactIndex]);
      
      await playAudio(getInstructionAudio('try-again'));
      
      setTimeout(() => {
        // Reset the entire step
        setCurrentFactIndex(0);
        setAnswer('');
        setAnswers(Array(lesson.facts.length).fill(null));
        setFailedIndices([]);
      }, 2000);
    }
  };
  
  // Auto-submit when answer is complete
  useEffect(() => {
    if (answer.length === expectedDigits && answers[currentFactIndex] === null) {
      handleSubmit();
    }
  }, [answer]);

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6">
          
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Fill in the answers
          </h2>

          <div className="flex gap-6 items-center">
            {/* Left side: Equations stacked vertically */}
            <div className="flex-1">
              <div className="space-y-3">
                {lesson.facts.map((fact, index) => {
                  const isCurrent = index === currentFactIndex;
                  const isCompleted = answers[index] !== null;
                  const isFailed = failedIndices.includes(index);

                  return (
                    <div
                      key={fact.id}
                      className={`p-3 rounded-xl transition-all border-2 ${
                        isFailed
                          ? 'bg-red-100 border-red-500'
                          : isCurrent
                          ? 'bg-orange-100 border-orange-500 scale-105'
                          : isCompleted
                          ? 'bg-green-100 border-green-500'
                          : 'bg-gray-200 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className={`text-3xl font-bold ${
                          isFailed ? 'text-red-900' :
                          isCurrent ? 'text-orange-900' :
                          isCompleted ? 'text-green-900' :
                          'text-gray-900'
                        }`}>
                          {fact.operand1} + {fact.operand2} =
                        </span>
                        <div className="w-16 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white">
                          {isCompleted ? (
                            <span className="text-2xl font-bold text-green-600">
                              {answers[index]}✓
                            </span>
                          ) : isCurrent && answer ? (
                            <span className="text-2xl font-bold text-blue-600">
                              {answer}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xl">?</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Number pad */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {!allComplete && (
                <NumberPad value={answer} onChange={setAnswer} maxValue={20} />
              )}
              
              {allComplete && (
                <div className="text-center text-2xl font-bold text-green-600">
                  ✓ Great job!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

