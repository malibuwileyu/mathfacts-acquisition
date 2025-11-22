/**
 * Lesson-specific rules for special fact patterns
 * 
 * Rules:
 * - +1 facts: "Just say the next number"
 * - +0 facts: "Just say the same number"
 * 
 * Taught once per lesson when first encountered
 */

import { Lesson, Fact } from '@/types';

export interface LessonRule {
  type: 'plus_one' | 'plus_zero';
  audioFile: string;
  text: string;
}

/**
 * Check if lesson has +1 facts
 */
export function hasPlusOneFacts(lesson: Lesson): boolean {
  return lesson.facts.some(f => f.operand1 === 1 || f.operand2 === 1);
}

/**
 * Check if lesson has +0 facts
 */
export function hasPlusZeroFacts(lesson: Lesson): boolean {
  return lesson.facts.some(f => f.operand1 === 0 || f.operand2 === 0);
}

/**
 * Get rule for +1 facts
 */
export function getPlusOneRule(): LessonRule {
  return {
    type: 'plus_one',
    audioFile: 'instructions/rule-plus-one.mp3',
    text: 'Here\'s a trick for plus one facts: Just say the next number! Five plus one? Six. Seven plus one? Eight. Easy!'
  };
}

/**
 * Get rule for +0 facts
 */
export function getPlusZeroRule(): LessonRule {
  return {
    type: 'plus_zero',
    audioFile: 'instructions/rule-plus-zero.mp3',
    text: 'Here\'s a trick for plus zero facts: Just say the same number! Five plus zero? Five. Seven plus zero? Seven. Easy!'
  };
}

/**
 * Check if fact is the first +1 in the lesson
 */
export function isFirstPlusOne(lesson: Lesson, currentFactIndex: number): boolean {
  const currentFact = lesson.facts[currentFactIndex];
  
  // Is this fact a +1?
  if (currentFact.operand1 !== 1 && currentFact.operand2 !== 1) return false;
  
  // Is it the first +1 in the lesson?
  for (let i = 0; i < currentFactIndex; i++) {
    const prevFact = lesson.facts[i];
    if (prevFact.operand1 === 1 || prevFact.operand2 === 1) {
      return false;  // Found an earlier +1
    }
  }
  
  return true;  // This is the first +1
}

/**
 * Check if fact is the first +0 in the lesson
 */
export function isFirstPlusZero(lesson: Lesson, currentFactIndex: number): boolean {
  const currentFact = lesson.facts[currentFactIndex];
  
  // Is this fact a +0?
  if (currentFact.operand1 !== 0 && currentFact.operand2 !== 0) return false;
  
  // Is it the first +0 in the lesson?
  for (let i = 0; i < currentFactIndex; i++) {
    const prevFact = lesson.facts[i];
    if (prevFact.operand1 === 0 || prevFact.operand2 === 0) {
      return false;  // Found an earlier +0
    }
  }
  
  return true;  // This is the first +0
}

