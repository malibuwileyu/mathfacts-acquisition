/**
 * Progress tracking compatible with fastmath integration
 * 
 * @spec ACQUISITION-APP-PLAN.md - Integration Layer
 * 
 * Stores progress in format that can sync to fastmath API:
 * POST /users/{userId}/progress/{trackId}
 * { facts: { FACT123: { status, attempts, correct, timeSpent } } }
 */

import { Lesson, FactProgress, Operation } from '@/types';

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  currentStep: number;
  quizScore?: number;
  passed?: boolean;
  facts: Record<string, FactProgress>;  // factId → progress
  startedAt: string;
  completedAt?: string;
}

export interface UserProgress {
  userId: string;
  operation: Operation;
  lessons: Record<number, LessonProgress>;  // lessonId → progress
}

const STORAGE_KEY = 'acquisition_progress';

/**
 * Get all progress for current user
 */
export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return getEmptyProgress();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getEmptyProgress();
  
  try {
    return JSON.parse(stored);
  } catch {
    return getEmptyProgress();
  }
}

/**
 * Save progress
 */
export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Get progress for a specific lesson
 */
export function getLessonProgress(lessonId: number): LessonProgress | null {
  const progress = getProgress();
  return progress.lessons[lessonId] || null;
}

/**
 * Update lesson progress
 */
export function updateLessonProgress(
  lessonId: number,
  updates: Partial<LessonProgress>
): void {
  const progress = getProgress();
  
  if (!progress.lessons[lessonId]) {
    progress.lessons[lessonId] = {
      lessonId,
      completed: false,
      currentStep: 1,
      facts: {},
      startedAt: new Date().toISOString()
    };
  }
  
  progress.lessons[lessonId] = {
    ...progress.lessons[lessonId],
    ...updates
  };
  
  saveProgress(progress);
}

/**
 * Update fact progress (compatible with fastmath format)
 */
export function updateFactProgress(
  lessonId: number,
  factId: string,
  update: Partial<FactProgress>
): void {
  const progress = getProgress();
  
  if (!progress.lessons[lessonId]) {
    progress.lessons[lessonId] = {
      lessonId,
      completed: false,
      currentStep: 1,
      facts: {},
      startedAt: new Date().toISOString()
    };
  }
  
  const currentFact = progress.lessons[lessonId].facts[factId] || {
    factId,
    attempts: 0,
    correct: 0,
    timeSpent: 0,
    accuracyRate: 0
  };
  
  progress.lessons[lessonId].facts[factId] = {
    ...currentFact,
    ...update,
    attempts: (currentFact.attempts || 0) + (update.attempts || 0),
    correct: (currentFact.correct || 0) + (update.correct || 0),
    timeSpent: (currentFact.timeSpent || 0) + (update.timeSpent || 0),
    accuracyRate: update.accuracyRate ?? currentFact.accuracyRate,
    lastPracticed: new Date()
  };
  
  saveProgress(progress);
}

/**
 * Mark lesson as complete
 * This is the data format we'll sync to fastmath
 */
export function completeLessons(lessonId: number, quizScore: number, passed: boolean): void {
  updateLessonProgress(lessonId, {
    completed: true,
    completedAt: new Date().toISOString(),
    quizScore,
    passed
  });
}

/**
 * Get all completed lessons
 */
export function getCompletedLessons(): number[] {
  const progress = getProgress();
  return Object.values(progress.lessons)
    .filter(l => l.completed && l.passed)
    .map(l => l.lessonId);
}

/**
 * Get all facts from completed lessons (for fastmath sync)
 * Returns in format ready for: POST /users/{userId}/progress/{trackId}
 */
export function getFactsForSync(): Record<string, { attempts: number, correct: number, timeSpent: number }> {
  const progress = getProgress();
  const allFacts: Record<string, { attempts: number, correct: number, timeSpent: number }> = {};
  
  Object.values(progress.lessons).forEach(lesson => {
    if (lesson.passed) {
      Object.entries(lesson.facts).forEach(([factId, factProgress]) => {
        allFacts[factId] = {
          attempts: factProgress.attempts,
          correct: factProgress.correct,
          timeSpent: factProgress.timeSpent
        };
      });
    }
  });
  
  return allFacts;
}

/**
 * Clear all progress (for testing)
 */
export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function getEmptyProgress(): UserProgress {
  return {
    userId: 'demo-user',  // Will be real user ID when integrated
    operation: Operation.ADDITION,
    lessons: {}
  };
}

