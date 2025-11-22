/**
 * Series Saying Step 3: Guided Practice B
 * Student sees facts, recalls answers with error correction
 * 
 * @spec BRAINLIFT.md - "Student sees the facts, has to recall the answers in order"
 * @spec CLIENT-REQUIREMENTS.md - Simplified error correction
 */

'use client';

import { Lesson, Fact } from '@/types';
import { useState } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step3GuidedB({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [inErrorCorrection, setInErrorCorrection] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];

  const handleSubmit = async () => {
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track fact progress (for fastmath sync)
    updateFactProgress(lesson.id, currentFact.id, {
      factId: currentFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0  // Will be calculated in progressStore
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      // Trigger simplified error correction
      await playAudio(getInstructionAudio('try-again'));
      
      setTimeout(() => {
        setShowFeedback(false);
        setInErrorCorrection(true);
      }, 1500);
    } else {
      // Correct!
      await playAudio(getInstructionAudio('great-job'));
      
      setTimeout(() => {
        moveToNext();
      }, 1500);
    }
  };

  const handleErrorCorrectionDone = async () => {
    // Show correct answer, then move on
    await playAudio(getFactAudio(currentFact.id, 'correction'));
    
    setTimeout(() => {
      setInErrorCorrection(false);
      moveToNext();
    }, 2000);
  };

  const moveToNext = () => {
    setShowFeedback(false);
    setAnswer('');
    setQuestionStartTime(Date.now());  // Reset timer for next question
    
    if (currentFactIndex < lesson.facts.length - 1) {
      setCurrentFactIndex(currentFactIndex + 1);
    } else {
      onComplete();
    }
  };

  // Error correction screen
  if (inErrorCorrection) {
    return (
      <div className="h-full p-3 flex flex-col justify-center">
        <div className="max-w-xl w-full mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-6">
              Let's Review
            </h2>

            <div className="bg-red-50 rounded-xl p-10 mb-8">
              <div className="text-7xl font-bold text-red-600 mb-5">
                {currentFact.operand1} + {currentFact.operand2} = {currentFact.result}
              </div>
              <div className="text-xl text-gray-700">
                👄 Say: "{currentFact.operand1} plus {currentFact.operand2} equals {currentFact.result}"
              </div>
            </div>

            <button
              onClick={handleErrorCorrectionDone}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-2xl font-bold py-5 rounded-xl shadow-lg"
            >
              I Said It! →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6">
          
          {/* Fact display - smaller for this step */}
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-orange-600">
              {currentFact.operand1} + {currentFact.operand2} = ?
            </div>
            {answer && (
              <div className="text-4xl font-bold text-gray-800 mt-2">
                {answer}
              </div>
            )}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`rounded-lg p-3 mb-3 text-center text-lg font-bold ${
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isCorrect ? '✓ Right!' : '✗ Let\'s practice.'}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-3">
            {lesson.facts.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentFactIndex ? 'bg-orange-500' :
                  index < currentFactIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          {!showFeedback && (
            <>
              <NumberPad value={answer} onChange={setAnswer} maxValue={20} />
              
              <button
                onClick={handleSubmit}
                disabled={!answer}
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
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

