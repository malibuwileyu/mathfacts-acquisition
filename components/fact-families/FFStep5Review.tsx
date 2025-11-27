/**
 * Fact Families Step 5: Review
 * Quick review of fact families
 * 
 * @spec BRAINLIFT.md - "Review - Reinforce fact family concept"
 */

'use client';

import { Lesson } from '@/types';
import { useState, useEffect } from 'react';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export default function FFStep5Review({ lesson, onComplete }: Props) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [canType, setCanType] = useState(false);  // Controls when number pad is enabled
  const { playAudio } = useAudio();

  useEffect(() => {
    setCanType(false);  // Disable typing for new question
    setAnswer('');
    playSequence();
  }, [currentPairIndex]);

  const playSequence = async () => {
    const pair = lesson.commutativePairs![currentPairIndex];
    const pairFact = lesson.facts.find(f => f.id === pair[0])!;
    
    // 1. Say first equation
    await playAudio(getFactAudio(pairFact.id, 'statement'));
    await new Promise(r => setTimeout(r, 500));
    
    // 2. "Now say the turnaround"
    await playAudio({
      filename: 'instructions/say-turnaround.mp3',
      text: "Now say the turnaround"
    });
    
    // 3. Wait for student to say it (3-4 seconds)
    await new Promise(r => setTimeout(r, 3500));
    
    // 4. "Now complete the turnaround" (enables number pad)
    await playAudio({
      filename: 'instructions/complete-turnaround.mp3',
      text: "Now complete the turnaround"
    });
    
    setCanType(true);  // Enable number pad now
  };

  // Calculate display values for render
  const displayPair = lesson.commutativePairs![currentPairIndex];
  const fact1 = lesson.facts.find(f => f.id === displayPair[0])!;
  const [turnA, turnB] = displayPair[1].split('+').map(Number);
  
  // Determine expected digits for auto-submit
  const expectedDigits = turnB < 10 ? 1 : 2;

  const handleSubmit = () => {
    if (!answer || showFeedback) return;
    const userAnswer = parseInt(answer);
    const correct = userAnswer === turnB;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      
      if (currentPairIndex < lesson.commutativePairs!.length - 1) {
        setCurrentPairIndex(currentPairIndex + 1);
      } else {
        onComplete();
      }
    }, 1500);
  };
  
  // Auto-submit when answer is complete
  useEffect(() => {
    if (answer.length === expectedDigits && canType && !showFeedback) {
      handleSubmit();
    }
  }, [answer]);

  return (
    <div className="h-full p-3 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          
          {/* Lined-up equations with blank (reduced 10%) */}
          <div className="bg-teal-50 rounded-xl p-6 mb-3">
            {/* First fact */}
            <div className="text-6xl font-bold text-teal-600 text-center mb-6 font-mono">
              {fact1.operand1} + {fact1.operand2} = {fact1.result}
            </div>
            
            {/* Second fact with blank second addend */}
            <div className="text-6xl font-bold text-teal-600 flex items-center justify-center gap-3 font-mono">
              <span>{turnA}</span>
              <span>+</span>
              {answer ? (
                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{answer}</span>
              ) : (
                <div className="border-b-8 border-gray-400 w-20 h-16 flex items-center justify-center text-gray-400">
                  ?
                </div>
              )}
              <span>=</span>
              <span>{fact1.result}</span>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback ? (
            <div className={`text-center mb-2 text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
          ) : null}

          {/* Number pad - only enabled after "complete" instruction */}
          {!showFeedback && canType && (
            <NumberPad value={answer} onChange={setAnswer} maxValue={20} />
          )}
          
          {/* Waiting message before number pad enabled */}
          {!showFeedback && !canType && (
            <div className="text-center text-xl text-gray-500 animate-pulse py-8">
              Listen...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

