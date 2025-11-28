/**
 * Generate review questions with weighted selection
 * 
 * RULES:
 * - 20 questions total
 * - 10 from current lesson's fact family/series duo (repetitions allowed)
 * - 10 from previous lessons
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
 * Generate 20 questions: 10 from current lesson, 10 from previous lessons
 */
export function generateReviewQuestions(currentLesson: Lesson): ReviewQuestion[] {
  const reviewQuestions: ReviewQuestion[] = [];
  
  // PART 1: 10 questions from current lesson (repetitions allowed)
  const currentLessonFacts = currentLesson.facts.map(f => ({ ...f, lessonId: currentLesson.id }));
  
  for (let i = 0; i < 10; i++) {
    const randomFact = currentLessonFacts[Math.floor(Math.random() * currentLessonFacts.length)];
    reviewQuestions.push({
      fact: randomFact,
      isFromCurrentLesson: true,
      sourceLesson: currentLesson.id
    });
  }
  
  // PART 2: 10 questions from previous lessons
  const previousLessons = lessons.filter(l => l.id < currentLesson.id);
  
  const allPreviousFacts: Fact[] = [];
  previousLessons.forEach(lesson => {
    lesson.facts.forEach(fact => {
      allPreviousFacts.push({ ...fact, lessonId: lesson.id });
    });
  });
  
  // Select 10 from previous lessons with weighting (duplicates okay for early lessons with few facts)
  const usedFactIds = new Set<string>();
  const previousSelected = selectWithWeight(allPreviousFacts, 10, usedFactIds);
    
  reviewQuestions.push(...previousSelected.map(fact => ({
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
 * Select N random items from array with weighting
 * Tries to avoid duplicates but allows them if not enough unique facts
 */
function selectWithWeight(arr: Fact[], count: number, usedIds: Set<string>): Fact[] {
  if (arr.length === 0) return [];
  
  // Apply weighting first
  const weighted = applyHighNumberWeighting(arr);
  const shuffled = shuffleArray(weighted);
  
  const selected: Fact[] = [];
  
  // First pass: try to get unique facts
  for (const fact of shuffled) {
    if (selected.length >= count) break;
    if (usedIds.has(fact.id)) continue;
    
    selected.push(fact);
    usedIds.add(fact.id);
  }
  
  // Second pass: if not enough, allow repeats
  while (selected.length < count && arr.length > 0) {
    const randomFact = weighted[Math.floor(Math.random() * weighted.length)];
    selected.push(randomFact);
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

