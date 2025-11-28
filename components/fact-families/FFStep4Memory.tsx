/**
 * Fact Families Step 4: Memory Practice
 * Answer both directions from memory (audio only)
 * 
 * @spec BRAINLIFT.md - "Memory Practice - Recall both directions from memory"
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

export default function FFStep4Memory({ lesson, onComplete }: Props) {
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
  const [hasHeard, setHasHeard] = useState(false);
  const { playAudio } = useAudio();

  const currentFact = allFacts[currentFactIndex];
  
  // Determine expected digits for auto-submit
  const expectedDigits = currentFact.result < 10 ? 1 : 2;

  useEffect(() => {
    if (!hasHeard) {
      playAudio(getFactAudio(currentFact.id, 'question'));
      setHasHeard(true);
    }
  }, [currentFactIndex]);

  const handleSubmit = async () => {
    if (!answer || showFeedback) return;
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      setHasHeard(false);
      
      if (currentFactIndex < allFacts.length - 1) {
        setCurrentFactIndex(currentFactIndex + 1);
      } else {
        onComplete();
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
          
          {/* Answer display */}
          {answer && (
            <div className="text-center mb-3">
              <div className="text-5xl font-bold text-indigo-600">
                {answer}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback ? (
            <div className={`text-center mb-2 text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
          ) : null}

          {/* Number pad */}
          {!showFeedback && (
            <NumberPad value={answer} onChange={setAnswer} maxValue={20} />
          )}
        </div>
      </div>
    </div>
  );
}

