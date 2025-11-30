'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById } from '@/lib/lessonData';
import { 
  getLessonProgress, 
  updateLessonProgress, 
  completeLessons,
  updateFactProgress 
} from '@/lib/progressStore';

// Series Saying components
import RuleIntroduction from '@/components/series-saying/RuleIntroduction';
import Step1Modeled from '@/components/series-saying/Step1Modeled';
import Step2GuidedA from '@/components/series-saying/Step2GuidedA';
import Step3TypeSums from '@/components/series-saying/Step3TypeSums';
import Step4GuidedB from '@/components/series-saying/Step4GuidedB';
import Step5GuidedC from '@/components/series-saying/Step5GuidedC';
import Step6Quiz from '@/components/series-saying/Step6Quiz';

// Fact Families components
import FFIntroduction from '@/components/fact-families/FFIntroduction';
import FFShortIntro from '@/components/fact-families/FFShortIntro';
import FFStep1Introduce from '@/components/fact-families/FFStep1Introduce';
import FFStep2Practice from '@/components/fact-families/FFStep2Practice';
import FFStep3Turnarounds from '@/components/fact-families/FFStep3Turnarounds';
import FFStep4TurnaroundPractice from '@/components/fact-families/FFStep4TurnaroundPractice';
import FFStep6Quiz from '@/components/fact-families/FFStep6Quiz';
import FFStep5Review from '@/components/fact-families/FFStep5Review';
import ReviewStep from '@/components/shared/ReviewStep';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  
  const lessonId = parseInt(params.id as string);
  const lesson = getLessonById(lessonId);
  
  // Determine starting step based on lesson type and ID
  const getStartingStep = () => {
    if (!lesson) return 1;
    
    if (lesson.format === 'series_saying') {
      return 1;  // Series Saying always starts at Step 1 (Modeled)
    }
    
    // Fact Families intro rules:
    // Lessons 2, 4: Full intro (step 0)
    // Lessons 6, 8, 10: Short intro (step 0)
    // Lessons 12+: No intro (start at step 1)
    if (lessonId <= 10) return 0;  // Has intro
    return 1;  // Skip intro
  };
  
  const [currentStep, setCurrentStep] = useState(getStartingStep());
  const [lessonComplete, setLessonComplete] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  
  // Load saved progress on mount
  useEffect(() => {
    if (!lesson) return;
    
    const savedProgress = getLessonProgress(lessonId);
    if (savedProgress && !savedProgress.completed) {
      setCurrentStep(savedProgress.currentStep);
    }
  }, [lessonId, lesson]);
  
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Lesson Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl"
          >
            ← Back to Lessons
          </button>
        </div>
      </div>
    );
  }
  
  // Max steps depends on lesson type and whether it has a rule intro
  const getMaxSteps = () => {
    if (lesson.format === 'series_saying') {
      // Plus 1 or Plus 0 lessons have rule after Step 1, so 7 steps total
      // Other series saying lessons have 6 steps
      return [1, 3, 15].includes(lessonId) ? 7 : 6;
    }
    return 6;  // Fact Families: 6 steps (intro removed)
  };
  
  const maxSteps = getMaxSteps();
  
  const handleStepComplete = () => {
    if (currentStep < maxSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Save progress
      updateLessonProgress(lessonId, {
        currentStep: nextStep
      });
    }
  };
  
  const handleQuizComplete = async (score: number) => {
    const passed = score >= 85;
    
    setQuizScore(score);
    setLessonComplete(true);
    
    // Save completion locally
    completeLessons(lessonId, score, passed);
    
    // Submit to TimeBack if passed
    if (passed && typeof window !== 'undefined') {
      try {
        await fetch('/api/submit-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            score,
            passed,
            completedAt: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to submit to TimeBack:', error);
        // Don't block student - local save still works
      }
    }
  };
  
  const handleRetry = () => {
    setCurrentStep(1);
    setLessonComplete(false);
    setQuizScore(null);
  };
  
  // Completion screen
  if (lessonComplete && quizScore !== null) {
    const passed = quizScore >= 85;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6">
            {passed ? '🎉' : '💪'}
          </div>
          
          <h1 className="text-5xl font-bold mb-4" style={{ color: passed ? '#10b981' : '#f59e0b' }}>
            {passed ? 'Lesson Complete!' : 'Keep Practicing!'}
          </h1>
          
          <div className="bg-gray-100 rounded-2xl p-8 mb-8">
            <p className="text-4xl font-bold text-gray-800 mb-2">
              Score: {quizScore}%
            </p>
            <p className="text-xl text-gray-600">
              {passed ? 'You mastered Set ' + lesson.set + '!' : 'You need 85% to pass'}
            </p>
          </div>

          <div className="space-y-4">
            {passed ? (
              <>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg transform transition hover:scale-105"
                >
                  Next Lesson →
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg transform transition hover:scale-105"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg transform transition hover:scale-105"
                >
                  Back to Lessons
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Main lesson UI
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      {/* Compact progress header */}
      <div className="flex-shrink-0 p-2">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ←
              </button>
              <h2 className="text-lg font-bold text-gray-800">
                L{lesson.id}: {lesson.set}
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
              {(() => {
                const hasRule = [1, 3, 15].includes(lessonId);
                const displayCurrent = hasRule && currentStep > 1 ? currentStep - 1 : currentStep;
                const displayMax = hasRule ? maxSteps - 1 : maxSteps;
                return currentStep === 2 && hasRule ? `R/${displayMax}` : `${displayCurrent}/${displayMax}`;
              })()}
            </span>
          </div>
          
          {/* Compact step indicators: 1, R, 2, 3, 4, 5, 6 for rule lessons */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxSteps }, (_, i) => i + 1).map((step) => {
              const hasRule = [1, 3, 15].includes(lessonId);
              const isRuleStep = hasRule && step === 2;
              // For rule lessons: 1, R, 2, 3, 4, 5, 6 (not 1, R, 3, 4, 5, 6, 7)
              const displayStep = isRuleStep ? 'R' : (hasRule && step > 2 ? step - 1 : step);
              
              return (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}
              >
                  {step < currentStep ? '✓' : displayStep}
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        {lesson.format === 'series_saying' ? (
          <>
            {currentStep === 1 && <Step1Modeled lesson={lesson} onComplete={handleStepComplete} />}
            
            {/* Rule intro for Plus 1 and Plus 0 lessons (AFTER Step 1) */}
            {currentStep === 2 && [1, 3].includes(lessonId) && (
              <RuleIntroduction ruleType="plus-one" onComplete={handleStepComplete} />
            )}
            {currentStep === 2 && lessonId === 15 && (
              <RuleIntroduction ruleType="plus-zero" onComplete={handleStepComplete} />
            )}
            
            {/* For lessons WITHOUT rule, Step 2 is Read Together */}
            {currentStep === 2 && ![1, 3, 15].includes(lessonId) && (
              <Step2GuidedA lesson={lesson} onComplete={handleStepComplete} />
            )}
            
            {/* For lessons WITH rule, Read Together is Step 3 */}
            {currentStep === 3 && [1, 3, 15].includes(lessonId) && (
              <Step2GuidedA lesson={lesson} onComplete={handleStepComplete} />
            )}
            {currentStep === 3 && ![1, 3, 15].includes(lessonId) && (
              <Step3TypeSums lesson={lesson} onComplete={handleStepComplete} />
            )}
            
            {currentStep === 4 && [1, 3, 15].includes(lessonId) && (
              <Step3TypeSums lesson={lesson} onComplete={handleStepComplete} />
            )}
            {currentStep === 4 && ![1, 3, 15].includes(lessonId) && (
              <Step4GuidedB lesson={lesson} onComplete={handleStepComplete} />
            )}
            
            {currentStep === 5 && [1, 3, 15].includes(lessonId) && (
              <Step4GuidedB lesson={lesson} onComplete={handleStepComplete} />
            )}
            {currentStep === 5 && ![1, 3, 15].includes(lessonId) && (
              <Step5GuidedC lesson={lesson} onComplete={handleStepComplete} />
            )}
            
            {currentStep === 6 && [1, 3, 15].includes(lessonId) && (
              <Step5GuidedC lesson={lesson} onComplete={handleStepComplete} />
            )}
            {currentStep === 6 && ![1, 3, 15].includes(lessonId) && (
              <Step6Quiz lesson={lesson} onComplete={handleQuizComplete} />
            )}
            
            {currentStep === 7 && [1, 3, 15].includes(lessonId) && (
              <Step6Quiz lesson={lesson} onComplete={handleQuizComplete} />
            )}
          </>
        ) : (
          <>
            {currentStep === 0 && (
              <>
                {/* Lessons 2, 4: Full intro */}
                {[2, 4].includes(lessonId) && <FFIntroduction onComplete={handleStepComplete} />}
                
                {/* Lessons 6, 8, 10: Short reminder */}
                {[6, 8, 10].includes(lessonId) && <FFShortIntro onComplete={handleStepComplete} />}
              </>
            )}
            {currentStep === 1 && <FFStep1Introduce lesson={lesson} onComplete={handleStepComplete} />}
            {currentStep === 2 && <FFStep5Review lesson={lesson} onComplete={handleStepComplete} />}
            {currentStep === 3 && <FFStep3Turnarounds lesson={lesson} onComplete={handleStepComplete} />}
            {currentStep === 4 && <FFStep4TurnaroundPractice lesson={lesson} onComplete={handleStepComplete} />}
            {currentStep === 5 && <FFStep6Quiz lesson={lesson} onComplete={(score) => {
              // Turnaround quiz - just continue to next step, don't complete lesson yet
              handleStepComplete();
            }} />}
            {currentStep === 6 && <ReviewStep lesson={lesson} onComplete={handleQuizComplete} />}
          </>
        )}
      </div>
    </div>
  );
}

