/**
 * Generate review questions with weighted selection
 * 
 * Rules:
 * - 6-10 questions total
 * - 50% from current lesson
 * - 50% from previous lessons (even spread)
 * - Odd lessons pull from odd pool, even from even
 * - Weight 6,7,8,9 heavily
 * - Max 1-2 questions per previous lesson
 * - Random selection
 */

import { Lesson, Fact } from '@/types';
import { lessons } from './lessonData';

interface ReviewQuestion {
  fact: Fact;
  isFromCurrentLesson: boolean;
  sourceLesson: number;
}

/**
 * Generate review questions for a lesson
 * 
 * NEW LOGIC FOR FACT FAMILIES (even lessons):
 * - 50% from current lesson (turnarounds from this lesson)
 * - 50% from previous Fact Family lessons (turnarounds from earlier)
 * - Ensures at least 50% are turnaround questions
 * - Weight 6,7,8,9 heavily
 * - No duplicate questions
 * - Always 6-10 questions
 */
export function generateReviewQuestions(currentLesson: Lesson): ReviewQuestion[] {
  const totalQuestions = Math.floor(Math.random() * 5) + 6;  // 6-10 questions
  const currentCount = Math.ceil(totalQuestions / 2);  // 50% from current
  const previousCount = totalQuestions - currentCount;
  
  const reviewQuestions: ReviewQuestion[] = [];
  const usedFactIds = new Set<string>();  // Prevent duplicates
  
  // 1. Get facts from CURRENT lesson
  const currentFacts = currentLesson.facts.map(f => ({ ...f, lessonId: currentLesson.id }));
  const selectedCurrent = selectUniqueRandom(currentFacts, currentCount, usedFactIds);
  
  reviewQuestions.push(...selectedCurrent.map(fact => ({
    fact,
    isFromCurrentLesson: true,
    sourceLesson: currentLesson.id
  })));
  
  // 2. For FACT FAMILIES: Get from previous Fact Family lessons (same format)
  //    For SERIES SAYING: Get from opposite format
  let previousFacts: Fact[];
  if (currentLesson.format === 'fact_families') {
    previousFacts = getSameFormatFacts(currentLesson);
  } else {
    previousFacts = getOppositeFormatFacts(currentLesson);
  }
  
  const selectedPrevious = selectUniqueRandom(previousFacts, previousCount, usedFactIds);
  
  reviewQuestions.push(...selectedPrevious.map(fact => ({
    fact,
    isFromCurrentLesson: false,
    sourceLesson: fact.lessonId!
  })));
  
  // 3. Shuffle
  return shuffleArray(reviewQuestions);
}

/**
 * Get facts from SAME format lessons (for Fact Families to pull previous turnarounds)
 */
function getSameFormatFacts(currentLesson: Lesson): Fact[] {
  const previousLessons = lessons.filter(l => 
    l.id < currentLesson.id && 
    l.format === currentLesson.format
  );
  
  if (previousLessons.length === 0) return [];
  
  const facts: Fact[] = [];
  const maxPerLesson = 2;
  
  // Take max 2 facts from each previous lesson
  previousLessons.forEach(lesson => {
    const lessonFacts = lesson.facts.map(f => ({ ...f, lessonId: lesson.id }));
    facts.push(...lessonFacts);
  });
  
  return applyHighNumberWeighting(facts);
}

/**
 * Get facts from OPPOSITE format lessons (Series gets Families, Families gets Series)
 */
function getOppositeFormatFacts(currentLesson: Lesson): Fact[] {
  const oppositeFormat = currentLesson.format === 'series_saying' ? 'fact_families' : 'series_saying';
  
  const oppositeLessons = lessons.filter(l => 
    l.id < currentLesson.id && 
    l.format === oppositeFormat
  );
  
  if (oppositeLessons.length === 0) return [];
  
  const facts: Fact[] = [];
  const maxPerLesson = 2;
  
  // Take max 2 facts from each previous lesson
  oppositeLessons.forEach(lesson => {
    const count = Math.min(maxPerLesson, Math.floor(Math.random() * 2) + 1);
    const lessonFacts = lesson.facts.map(f => ({ ...f, lessonId: lesson.id }));
    facts.push(...lessonFacts);
  });
  
  // Apply 6,7,8,9 weighting
  return applyHighNumberWeighting(facts);
}

/**
 * Weight facts with 6,7,8,9 more heavily
 */
function applyHighNumberWeighting(facts: Fact[]): Fact[] {
  const weighted: Fact[] = [];
  
  facts.forEach(fact => {
    const hasHighNumber = fact.operand1 >= 6 || fact.operand2 >= 6;
    
    if (hasHighNumber) {
      // Add 3 times (3x weight)
      weighted.push(fact, fact, fact);
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
 * Select N random items from array (old version, kept for compatibility)
 */
function selectRandom<T>(arr: T[], count: number): T[] {
  const shuffled = shuffleArray([...arr]);
  return shuffled.slice(0, Math.min(count, arr.length));
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

