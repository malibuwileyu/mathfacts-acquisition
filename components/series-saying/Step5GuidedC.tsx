/**
 * Series Saying Step 5: Guided Practice C
 * Student recalls from memory (audio prompt only, no visual)
 * 
 * @spec BRAINLIFT.md - "Student says facts and answers in order from memory"
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio, getInstructionAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { updateFactProgress } from '@/lib/progressStore';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function Step5GuidedC({ lesson, onComplete }: Props) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasHeardQuestion, setHasHeardQuestion] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const { playAudio } = useAudio();

  const currentFact = lesson.facts[currentFactIndex];

  useEffect(() => {
    // Auto-play question when fact changes
    if (!hasHeardQuestion) {
      playQuestion();
    }
  }, [currentFactIndex]);

  const playQuestion = async () => {
    const audioFile = getFactAudio(currentFact.id, 'question');
    await playAudio(audioFile);
    setHasHeardQuestion(true);
  };

  const handleSubmit = async () => {
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    const timeSpent = Date.now() - questionStartTime;
    
    // Track fact progress
    updateFactProgress(lesson.id, currentFact.id, {
      factId: currentFact.id,
      attempts: 1,
      correct: correct ? 1 : 0,
      timeSpent,
      accuracyRate: 0
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      await playAudio(getInstructionAudio('great-job'));
      setTimeout(() => moveToNext(), 1500);
    } else {
      await playAudio(getInstructionAudio('try-again'));
      await playAudio(getFactAudio(currentFact.id, 'correction'));
      setTimeout(() => moveToNext(), 2000);
    }
  };

  const moveToNext = () => {
    setShowFeedback(false);
    setAnswer('');
    setHasHeardQuestion(false);
    setQuestionStartTime(Date.now());
    
    if (currentFactIndex < lesson.facts.length - 1) {
      setCurrentFactIndex(currentFactIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-5">
          
          {/* Simple answer display */}
          {answer && (
            <div className="text-center mb-3">
              <div className="text-5xl font-bold text-indigo-600">
                {answer}
              </div>
            </div>
          )}

          {/* Feedback (brief) */}
          {showFeedback ? (
            <div className={`text-center mb-3 text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
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
                className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
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

