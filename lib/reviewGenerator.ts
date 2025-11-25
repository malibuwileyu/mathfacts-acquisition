/**
 * Generate review questions with weighted selection
 * 
 * NEW RULES (per client feedback):
 * - 20 questions total
 * - Only straight quiz questions (no turnaround questions)
 * - From all previous lessons
 * - Weighted toward 6-9 facts (heavily)
 * - Random order
 */

import { Lesson, Fact } from '@/types';
import { lessons } from './lessonData';

export interface ReviewQuestion {
  fact: Fact;
  isFromCurrentLesson: boolean;
  sourceLesson: number;
}

/**
 * Generate 20 straight quiz questions from previous lessons
 * Weighted heavily toward facts with 6-9
 */
export function generateReviewQuestions(currentLesson: Lesson): ReviewQuestion[] {
  const totalQuestions = 20;
  
  const reviewQuestions: ReviewQuestion[] = [];
  const usedFactIds = new Set<string>();  // Prevent duplicates
  
  // Get ALL facts from all previous lessons
  const previousLessons = lessons.filter(l => l.id < currentLesson.id);
  
  const allPreviousFacts: Fact[] = [];
  previousLessons.forEach(lesson => {
    lesson.facts.forEach(fact => {
      allPreviousFacts.push({ ...fact, lessonId: lesson.id });
    });
  });
  
  // Select 20 questions with heavy weighting toward 6-9
  const selected = selectUniqueRandom(allPreviousFacts, totalQuestions, usedFactIds);
  
  reviewQuestions.push(...selected.map(fact => ({
    fact,
    isFromCurrentLesson: false,
    sourceLesson: fact.lessonId!
  })));
  
  // Shuffle and return
  return shuffleArray(reviewQuestions);
}

/**
 * Weight facts with 6-9 more heavily
 */
function applyHighNumberWeighting(facts: Fact[]): Fact[] {
  const weighted: Fact[] = [];
  
  facts.forEach(fact => {
    const has6to9 = (fact.operand1 >= 6 && fact.operand1 <= 9) || 
                    (fact.operand2 >= 6 && fact.operand2 <= 9);
    
    if (has6to9) {
      // Add 5 times (5x weight for 6-9 facts)
      weighted.push(fact, fact, fact, fact, fact);
    } else {
      // Add once (1x weight)
      weighted.push(fact);
    }
  });
  
  return weighted;
}

/**
 * Select N random items from array, ensuring no duplicates by factId
 */
function selectUniqueRandom(arr: Fact[], count: number, usedIds: Set<string>): Fact[] {
  // Apply weighting first
  const weighted = applyHighNumberWeighting(arr);
  const shuffled = shuffleArray(weighted);
  
  const selected: Fact[] = [];
  
  for (const fact of shuffled) {
    if (selected.length >= count) break;
    
    // Skip if already used
    if (usedIds.has(fact.id)) continue;
    
    selected.push(fact);
    usedIds.add(fact.id);
  }
  
  return selected;
}


/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Add lessonId to Fact type for tracking
declare module '@/types' {
  interface Fact {
    lessonId?: number;
  }
}

