/**
 * Fact Families Step 3: Guided Practice
 * Practice answering both directions with number pad
 * 
 * @spec BRAINLIFT.md - "Guided Practice - Answer both directions with prompts"
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function FFStep3Guided({ lesson, onComplete }: Props) {
  // Flatten all facts including turn-arounds
  const allFacts: Fact[] = [];
  lesson.commutativePairs!.forEach(pair => {
    const fact1 = lesson.facts.find(f => f.id === pair[0])!;
    const [a, b] = pair[1].split('+').map(Number);
    const fact2: Fact = { 
      id: pair[1], 
      operation: fact1.operation,
      operand1: a, 
      operand2: b, 
      result: a + b, 
      display: `${a} + ${b}` 
    };
    allFacts.push(fact1, fact2);
  });

  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { playAudio } = useAudio();

  const currentFact = allFacts[currentFactIndex];
  
  // Determine expected digits for auto-submit
  const expectedDigits = currentFact.result < 10 ? 1 : 2;

  const handleSubmit = async () => {
    if (!answer || showFeedback) return;
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      await playAudio(getInstructionAudio('great-job'));
    } else {
      await playAudio(getFactAudio(currentFact.id, 'correction'));
    }

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      
      if (currentFactIndex < allFacts.length - 1) {
        setCurrentFactIndex(currentFactIndex + 1);
      } else {
        onComplete();
      }
    }, 1500);
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
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {allFacts.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentFactIndex ? 'bg-purple-500' :
                  index < currentFactIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Equation with inline feedback */}
          <div className={`text-center mb-4 p-4 rounded-xl transition-all ${
            showFeedback 
              ? isCorrect ? 'bg-green-200' : 'bg-red-200'
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

          {/* Number pad - always visible */}
          <NumberPad value={answer} onChange={setAnswer} maxValue={20} hideDisplay />
        </div>
      </div>
    </div>
  );
}

