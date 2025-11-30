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
 * Spreads repetitions evenly and prevents back-to-back duplicates
 */
export function generateReviewQuestions(currentLesson: Lesson): ReviewQuestion[] {
  const reviewQuestions: ReviewQuestion[] = [];
  
  // PART 1: 10 questions from current lesson (spread evenly)
  const currentLessonFacts = currentLesson.facts.map(f => ({ ...f, lessonId: currentLesson.id }));
  const currentLessonQuestions: ReviewQuestion[] = [];
  
  // Each fact appears at least once, then distribute remaining slots evenly
  const factsCount = currentLessonFacts.length;
  const questionsNeeded = 10;
  const baseRepetitions = Math.floor(questionsNeeded / factsCount);
  let extraSlots = questionsNeeded % factsCount;
  
  currentLessonFacts.forEach(fact => {
    const reps = baseRepetitions + (extraSlots > 0 ? 1 : 0);
    if (extraSlots > 0) extraSlots--;
    
    for (let i = 0; i < reps; i++) {
      currentLessonQuestions.push({
          fact,
          isFromCurrentLesson: true,
          sourceLesson: currentLesson.id
        });
      }
    });
  
  // PART 2: 10 questions from previous lessons
  const previousLessons = lessons.filter(l => l.id < currentLesson.id);
  
  const allPreviousFacts: Fact[] = [];
  previousLessons.forEach(lesson => {
    lesson.facts.forEach(fact => {
      allPreviousFacts.push({ ...fact, lessonId: lesson.id });
      });
    });
        
  // Select 10 from previous lessons with weighting
  const usedFactIds = new Set<string>();
  const previousSelected = selectWithWeight(allPreviousFacts, 10, usedFactIds);
    
  const previousQuestions = previousSelected.map(fact => ({
      fact,
      isFromCurrentLesson: false,
      sourceLesson: fact.lessonId!
  }));
  
  // Combine and shuffle, then prevent back-to-back duplicates
  reviewQuestions.push(...currentLessonQuestions, ...previousQuestions);
  const shuffled = shuffleArray(reviewQuestions);
  
  return preventBackToBack(shuffled);
}

/**
 * Reorder to prevent back-to-back duplicate facts
 */
function preventBackToBack(questions: ReviewQuestion[]): ReviewQuestion[] {
  const result: ReviewQuestion[] = [];
  const remaining = [...questions];
  
  while (remaining.length > 0) {
    const lastFactId = result.length > 0 ? result[result.length - 1].fact.id : null;
  
    // Try to find a question that's different from the last one
    let idx = remaining.findIndex(q => q.fact.id !== lastFactId);
    
    // If all remaining are the same, just take the first one
    if (idx === -1) idx = 0;
    
    result.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  
  return result;
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

