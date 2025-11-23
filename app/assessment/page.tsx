/**
 * Comprehensive Assessment - Final 26-Question Test
 * One question from each completed lesson, weighted towards 6,7,8,9
 * Submits result to TimeBack when complete
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lessons } from '@/lib/lessonData';
import { getProgress } from '@/lib/progressStore';
import { useAudio, getFactAudio } from '@/lib/useAudio';
import NumberPad from '@/components/shared/NumberPad';
import { Fact } from '@/types';

interface AssessmentQuestion {
  fact: Fact;
  isTurnaround: boolean;
  lessonId: number;
  baseFact?: Fact;
}

export default function ComprehensiveAssessment() {
  const router = useRouter();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answers, setAnswers] = useState<Array<{correct: boolean, lessonId: number}>>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { playAudio } = useAudio();

  useEffect(() => {
    // Check all 26 lessons complete
    const progress = getProgress();
    const completedCount = lessons.filter(l => 
      progress.lessons[l.id]?.completed && progress.lessons[l.id]?.passed
    ).length;

    if (completedCount < 26) {
      router.push('/');
      return;
    }

    // Section 1: 13 questions from ODD lessons (Series Saying) - regular sum questions
    // Section 2: 13 questions from EVEN lessons (Fact Families) - turnaround questions
    
    const selectedQuestions: Array<{fact: Fact, isTurnaround: boolean, lessonId: number, baseFact?: Fact}> = [];
    
    // SECTION 1: Odd lessons (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25)
    const oddLessons = lessons.filter(l => l.id % 2 === 1);
    oddLessons.forEach(lesson => {
      // Weight towards 6,7,8,9
      const weightedFacts: Fact[] = [];
      lesson.facts.forEach(fact => {
        const hasHighNumber = fact.operand1 >= 6 || fact.operand2 >= 6;
        if (hasHighNumber) {
          weightedFacts.push(fact, fact, fact);
        } else {
          weightedFacts.push(fact);
        }
      });
      
      const randomFact = weightedFacts[Math.floor(Math.random() * weightedFacts.length)];
      selectedQuestions.push({
        fact: randomFact,
        isTurnaround: false,
        lessonId: lesson.id
      });
    });
    
    // SECTION 2: Even lessons (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26) - as turnarounds
    const evenLessons = lessons.filter(l => l.id % 2 === 0);
    evenLessons.forEach(lesson => {
      // Pick random fact from lesson
      const weightedFacts: Fact[] = [];
      lesson.facts.forEach(fact => {
        const hasHighNumber = fact.operand1 >= 6 || fact.operand2 >= 6;
        if (hasHighNumber) {
          weightedFacts.push(fact, fact, fact);
        } else {
          weightedFacts.push(fact);
        }
      });
      
      const baseFact = weightedFacts[Math.floor(Math.random() * weightedFacts.length)];
      
      // Create turnaround (swap operands)
      const turnaroundFact: Fact = {
        id: `${baseFact.operand2}+${baseFact.operand1}`,
        operation: baseFact.operation,
        operand1: baseFact.operand2,
        operand2: baseFact.operand1,
        result: baseFact.result,
        display: `${baseFact.operand2} + ${baseFact.operand1}`
      };
      
      selectedQuestions.push({
        fact: turnaroundFact,
        isTurnaround: true,
        lessonId: lesson.id,
        baseFact
      });
    });

    setQuestions(selectedQuestions as any);
  }, [router]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      
      if (q.isTurnaround && q.baseFact) {
        // Play base fact, then ask for turnaround
        const playTurnaroundQuestion = async () => {
          await playAudio(getFactAudio(q.baseFact!.id, 'statement'));
          await playAudio({ filename: 'instructions/whats-turnaround.mp3', text: "What's its turnaround?" });
        };
        playTurnaroundQuestion();
      } else {
        // Regular sum question
        playAudio(getFactAudio(q.fact.id, 'question'));
      }
    }
  }, [currentIndex, questions, playAudio]);

  const handleSubmit = async () => {
    const currentQ = questions[currentIndex];
    const currentFact = currentQ.fact;
    let correct: boolean;
    
    if (currentQ.isTurnaround) {
      // Check turnaround: both operands must match
      const userOp1 = parseInt(answer1);
      const userOp2 = parseInt(answer2);
      correct = userOp1 === currentFact.operand1 && userOp2 === currentFact.operand2;
    } else {
      // Check sum
      const userAnswer = parseInt(answer);
      correct = userAnswer === currentFact.result;
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);

    const newAnswers = [...answers, { correct, lessonId: currentQ.lessonId }];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      setAnswer1('');
      setAnswer2('');
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Assessment complete
        const correctCount = newAnswers.filter(a => a.correct).length;
        const score = Math.round((correctCount / newAnswers.length) * 100);
        setFinalScore(score);
        setIsComplete(true);
        
        // Log wrong answers by lesson
        const wrongAnswers = newAnswers.filter(a => !a.correct);
        if (wrongAnswers.length > 0) {
          console.log('❌ Wrong answers from lessons:', wrongAnswers.map(a => a.lessonId).join(', '));
        }
        
        // Submit to TimeBack
        submitToTimeBack(score);
      }
    }, 1000);
  };

  const submitToTimeBack = async (score: number) => {
    try {
      // Call server action to submit (handles session server-side)
      const response = await fetch('/api/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: 999,
          score,
          passed: score >= 85,
          completedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('✅ Comprehensive assessment submitted to TimeBack');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('❌ Failed to submit to TimeBack:', error);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading assessment...</div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-12 text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-6">
            Assessment Complete!
          </h1>
          
          <div className="text-8xl font-bold mb-6">
            {finalScore >= 85 ? '🎉' : '📚'}
          </div>
          
          <div className="text-6xl font-bold text-gray-800 mb-4">
            {finalScore}%
          </div>
          
          <div className={`text-2xl font-bold mb-8 ${
            finalScore >= 85 ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {finalScore >= 85 
              ? 'Excellent! Ready for fluency practice!' 
              : 'Keep practicing to improve!'}
          </div>

          <div className="text-lg text-gray-600 mb-8">
            Correct: {answers.filter(a => a.correct).length} / {answers.length}
          </div>

          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-4 px-8 rounded-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentFact = currentQ.fact;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-2">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              Comprehensive Assessment
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
              {currentIndex + 1}/26 {currentIndex < 13 ? '(Sums)' : '(Turnarounds)'}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-5">
            
            {/* Question display */}
            <div className="text-center mb-3">
              {currentQ.isTurnaround && currentQ.baseFact ? (
                <>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {currentQ.baseFact.operand1} + {currentQ.baseFact.operand2} = {currentQ.baseFact.result}
                  </div>
                  <div className="text-2xl text-gray-600 mb-2">
                    What&apos;s its turnaround?
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-center gap-2 text-4xl font-bold text-gray-900">
                      <input
                        type="text"
                        value={answer1}
                        readOnly
                        className="w-16 h-16 text-center border-3 border-gray-400 rounded-lg text-3xl bg-white"
                        placeholder="?"
                      />
                      <span className="text-gray-800">+</span>
                      <input
                        type="text"
                        value={answer2}
                        readOnly
                        className="w-16 h-16 text-center border-3 border-gray-400 rounded-lg text-3xl bg-white"
                        placeholder="?"
                      />
                      <span className="text-gray-800">= ?</span>
                    </div>
                  </div>
                </>
              ) : (
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
                {currentQ.isTurnaround ? (
                  <>
                    <NumberPad 
                      value=""
                      onChange={(val) => {
                        if (val === '') {
                          setAnswer1('');
                          setAnswer2('');
                        } else {
                          // Auto-fill first empty box
                          if (!answer1) {
                            setAnswer1(val);
                          } else if (!answer2) {
                            setAnswer2(val);
                          } else {
                            setAnswer2(val);
                          }
                        }
                      }}
                    />
                    
                    <button
                      onClick={handleSubmit}
                      disabled={!answer1 || !answer2}
                      className="w-full mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
                    >
                      Submit
                    </button>
                  </>
                ) : (
                  <>
                    <NumberPad value={answer} onChange={setAnswer} />
                    
                    <button
                      onClick={handleSubmit}
                      disabled={!answer}
                      className="w-full mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
                    >
                      Submit
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

