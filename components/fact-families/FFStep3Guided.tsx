/**
 * Fact Families Step 3: Guided Practice
 * Practice answering both directions with number pad
 * 
 * @spec BRAINLIFT.md - "Guided Practice - Answer both directions with prompts"
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState } from 'react';
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

  const handleSubmit = async () => {
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

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-5">
          
          {/* Fact display */}
          <div className="text-center mb-3">
            <div className="text-5xl font-bold text-purple-600">
              {currentFact.operand1} + {currentFact.operand2} = ?
            </div>
            {answer && (
              <div className="text-4xl font-bold text-gray-800 mt-2">
                {answer}
              </div>
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
              <NumberPad value={answer} onChange={setAnswer} />
              
              <button
                onClick={handleSubmit}
                disabled={!answer}
                className="w-full mt-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
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

