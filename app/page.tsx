'use client';

import { useRouter } from 'next/navigation';
import { lessons } from '@/lib/lessonData';
import { getProgress } from '@/lib/progressStore';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

export default function Home() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReturnType<typeof getProgress> | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const loadedProgress = getProgress();
    setProgress(loadedProgress);
    
    // Check for demo mode
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    setDemoMode(isDemoMode);
    
    // Demo mode automatically enables dev controls
    setDevMode(isDemoMode);
  }, []);

  // Show login if not authenticated AND not in demo mode
  if (isPending && !demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-3xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session && !demoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            Math Facts Acquisition
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            26 lessons to master addition facts
          </p>
          <button
            onClick={() => authClient.signIn.social({ provider: "cognito" })}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-5 px-6 rounded-xl transition shadow-lg mb-4"
          >
            Login with TimeBack
          </button>
          <button
            onClick={() => {
              // Set demo mode flag
              localStorage.setItem('demo_mode', 'true');
              window.location.reload();
            }}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white text-lg font-bold py-4 px-6 rounded-xl transition shadow-lg"
          >
            Continue as Guest (Demo)
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Guest mode for testing - progress won&apos;t be saved to TimeBack
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      <div className="max-w-6xl mx-auto p-6 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="w-24"></div>
            <h1 className="text-6xl font-bold text-blue-600">
              Math Fact Acquisition
            </h1>
            <button
              onClick={() => {
                if (demoMode) {
                  localStorage.removeItem('demo_mode');
                  window.location.reload();
                } else {
                  authClient.signOut();
                }
              }}
              className="text-base text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-white/50 transition"
            >
              {demoMode ? 'Exit Demo' : 'Logout'}
            </button>
          </div>
          <p className="text-2xl text-gray-700 mb-6">
            Master your addition facts with Direct Instruction
          </p>
          
          {/* Progress bar */}
          {progress && (() => {
            const completed = Object.values(progress.lessons).filter((l) => l.completed && l.passed).length;
            const percent = Math.round((completed / 26) * 100);
            
            return (
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-3">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {completed} / 26
                  </div>
                  <div className="text-sm text-gray-600">Lessons Completed</div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${percent}%` }}
                  >
                    {percent > 10 && (
                      <span className="text-white text-sm font-bold">{percent}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Demo Controls */}
        {demoMode && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
              <h3 className="text-lg font-bold text-blue-700 mb-3">👋 Demo Mode - Quick Navigation</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('acquisition_progress');
                    window.location.reload();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded"
                >
                  Start Fresh
                </button>
                <button
                  onClick={() => {
                    const allComplete: any = {lessons: {}, facts: {}};
                    for (let i = 1; i <= 26; i++) {
                      allComplete.lessons[i] = {currentStep: i % 2 === 1 ? 6 : 7, completed: true, passed: true, quizScore: 90};
                    }
                    localStorage.setItem('acquisition_progress', JSON.stringify(allComplete));
                    window.location.reload();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded"
                >
                  Skip to Final Assessment
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                All 26 lessons are visible below for easy testing
              </p>
            </div>
          </div>
        )}

        {/* Comprehensive Assessment (if all 26 complete OR dev mode) */}
          {progress && (() => {
            const completedCount = Object.values(progress.lessons).filter((l) => l.completed && l.passed).length;
          
          if (completedCount === 26 || devMode) {
            return (
              <div className="max-w-3xl mx-auto mb-8">
                <div 
                  onClick={() => router.push('/assessment')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-3xl"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Ready for Final Assessment!
                    </h2>
                    <p className="text-xl text-white mb-6">
                      You&apos;ve completed all 26 lessons. Take the comprehensive test!
                    </p>
                    <div className="bg-white text-orange-600 font-bold text-xl py-4 px-8 rounded-xl inline-block">
                      Start Assessment →
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Lesson Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {(() => {
            // In dev mode, show ALL lessons. Otherwise show current pair.
            const completedCount = progress ? Object.values(progress.lessons).filter((l) => l.completed && l.passed).length : 0;
            
            let visibleLessons: number[];
            if (devMode) {
              visibleLessons = lessons.map(l => l.id);  // Show all in dev mode
            } else {
              const currentPairStart = Math.floor(completedCount / 2) * 2 + 1;  // 1, 3, 5, 7...
              visibleLessons = [currentPairStart, currentPairStart + 1].filter(id => id <= 26);
            }
            
            return [...lessons]
              .filter(l => visibleLessons.includes(l.id))
              .sort((a, b) => a.id - b.id)
              .map((lesson) => {
                const lessonProgress = progress?.lessons[lesson.id];
                const isCompleted = lessonProgress?.completed && lessonProgress?.passed;
                const inProgress = lessonProgress && !lessonProgress.completed;
            
                return (
            <div
              key={lesson.id}
              className={`
                bg-white rounded-2xl shadow-lg p-6 cursor-pointer
                transform transition hover:scale-105 hover:shadow-xl
                ${lesson.format === 'series_saying' ? 'border-l-8 border-blue-500' : 'border-l-8 border-purple-500'}
              `}
              onClick={() => router.push(`/lesson/${lesson.id}`)}
            >
              {/* Lesson number */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    text-4xl font-bold
                    ${lesson.format === 'series_saying' ? 'text-blue-600' : 'text-purple-600'}
                  `}>
                    {lesson.set}
                  </div>
                  {isCompleted && (
                    <span className="text-3xl">✓</span>
                  )}
                  {inProgress && (
                    <span className="text-2xl text-yellow-600">▶</span>
                  )}
                </div>
                <div className={`
                  px-4 py-2 rounded-full text-sm font-bold
                  ${lesson.format === 'series_saying' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                  }
                `}>
                  {lesson.format === 'series_saying' ? '5 Steps' : '6 Steps'}
                </div>
              </div>

              {/* Lesson title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Lesson {lesson.id}: Set {lesson.set}
              </h3>

              {/* Format type */}
              <p className="text-sm text-gray-600 mb-3">
                {lesson.format === 'series_saying' ? 'Series Saying' : 'Fact Families'}
              </p>

              {/* Facts preview */}
              <div className="flex flex-wrap gap-2">
                {lesson.facts.slice(0, 4).map((fact) => (
                  <span
                    key={fact.id}
                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-700"
                  >
                    {fact.display}
                  </span>
                ))}
                {lesson.facts.length > 4 && (
                  <span className="text-gray-500 text-sm">
                    +{lesson.facts.length - 4} more
                  </span>
                )}
              </div>

              {/* Progress/Score indicator */}
              {isCompleted && lessonProgress?.quizScore && (
                <div className="mt-3 bg-green-50 border-2 border-green-200 rounded-lg p-2 text-center">
                  <span className="text-sm font-bold text-green-700">
                    Completed: {lessonProgress.quizScore}%
                  </span>
                </div>
              )}
              
              {inProgress && (
                <div className="mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 text-center">
                  <span className="text-sm font-bold text-yellow-700">
                    In Progress - Step {lessonProgress?.currentStep}
                  </span>
                </div>
              )}

              {/* Action button */}
              <button className={`w-full mt-4 font-bold py-3 rounded-xl transition ${
                isCompleted 
                  ? 'bg-gray-400 hover:bg-gray-500 text-white' 
                  : inProgress
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}>
                {isCompleted ? 'Replay' : inProgress ? 'Continue →' : 'Start →'}
              </button>
            </div>
          );
              });
          })()}
        </div>

        {/* Info footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">✨ Direct Instruction methodology</p>
          <p className="text-sm">85% mastery required to advance</p>
        </div>
      </div>
    </div>
  );
}
