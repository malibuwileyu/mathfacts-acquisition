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

export default function ComprehensiveAssessment() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Fact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { playAudio } = useAudio();

  useEffect(() => {
    // Generate 26 questions (1 per lesson)
    const progress = getProgress();
    const completedLessons = lessons.filter(l => 
      progress.lessons[l.id]?.completed && progress.lessons[l.id]?.passed
    );

    if (completedLessons.length < 26) {
      router.push('/');
      return;
    }

    // Generate weighted questions
    const selectedQuestions: Fact[] = [];
    
    completedLessons.forEach(lesson => {
      // Get facts from lesson, weight towards 6,7,8,9
      const weightedFacts: Fact[] = [];
      lesson.facts.forEach(fact => {
        const hasHighNumber = fact.operand1 >= 6 || fact.operand2 >= 6;
        if (hasHighNumber) {
          weightedFacts.push(fact, fact, fact);  // 3x weight
        } else {
          weightedFacts.push(fact);  // 1x weight
        }
      });
      
      // Random selection from weighted pool
      const randomFact = weightedFacts[Math.floor(Math.random() * weightedFacts.length)];
      selectedQuestions.push(randomFact);
    });

    setQuestions(selectedQuestions);
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      playAudio(getFactAudio(questions[currentIndex].id, 'question'));
    }
  }, [currentIndex, questions]);

  const handleSubmit = async () => {
    const currentFact = questions[currentIndex];
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentFact.result;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer('');
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Assessment complete
        const score = Math.round((newAnswers.filter(a => a).length / newAnswers.length) * 100);
        setFinalScore(score);
        setIsComplete(true);
        
        // Submit to TimeBack
        submitToTimeBack(score);
      }
    }, 1000);
  };

  const submitToTimeBack = async (score: number) => {
    try {
      const { submitLessonResult } = await import('@/lib/timeback/submitResult');
      const { getCurrentUserServer } = await import('@/lib/lti/getUserServer');
      
      // Get student ID from session (LTI launch)
      const user = await getCurrentUserServer();
      const studentId = user?.userId || 'demo-student';
      
      await submitLessonResult(studentId, {
        lessonId: 999,  // Special ID for comprehensive assessment
        score,
        passed: score >= 85,
        completedAt: new Date().toISOString()
      });
      
      console.log('✅ Comprehensive assessment submitted to TimeBack');
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
            Correct: {answers.filter(a => a).length} / {answers.length}
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

  const currentFact = questions[currentIndex];

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
              {currentIndex + 1}/26
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
              <div className="text-5xl font-bold text-green-600 mb-2">
                {currentFact.operand1} + {currentFact.operand2} = ?
              </div>
              
              {answer && (
                <div className="text-4xl font-bold text-gray-800">
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
                  className="w-full mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl transition shadow-lg"
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

