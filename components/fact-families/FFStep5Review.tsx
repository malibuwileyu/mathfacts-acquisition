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
          
          {/* Lined-up equations with inline feedback */}
          <div className={`rounded-xl p-6 mb-3 transition-all ${
            showFeedback 
              ? isCorrect ? 'bg-green-100' : 'bg-red-100'
              : 'bg-teal-50'
          }`}>
            {/* First fact */}
            <div className="text-5xl font-bold text-teal-600 text-center mb-4 font-mono">
              {fact1.operand1} + {fact1.operand2} = {fact1.result}
            </div>
            
            {/* Second fact with answer and inline checkmark */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-5xl font-bold font-mono ${
                showFeedback && isCorrect ? 'text-green-700' : 
                showFeedback && !isCorrect ? 'text-red-700' : 'text-teal-600'
              }`}>
                {turnA} + {answer || '?'} = {fact1.result}
              </span>
              {showFeedback && (
                <span className={`text-4xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          {/* Number pad - always visible when can type */}
          {canType && (
            <NumberPad value={answer} onChange={setAnswer} maxValue={20} hideDisplay />
          )}
          
          {/* Waiting message before number pad enabled */}
          {!canType && (
            <div className="text-center text-2xl text-purple-600 font-semibold py-8">
              🔊 Listen...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


