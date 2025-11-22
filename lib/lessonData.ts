/**
 * Lesson data parsed from CSV
 * @spec Scope of Fact Acquisition App_ Addition - Sheet1.csv
 * @spec BRAINLIFT.md - Series Saying and Fact Families formats
 */

import { Lesson, Fact, Operation } from '@/types';

// Helper to create fact object
function createFact(expression: string): Fact {
  const [operand1, operand2] = expression.split('+').map(Number);
  const result = operand1 + operand2;
  
  return {
    id: expression,
    operation: Operation.ADDITION,
    operand1,
    operand2,
    result,
    display: `${operand1} + ${operand2}`,
    external_id: undefined  // Populated when mapping loaded
  };
}

/**
 * All 26 lessons from CSV
 * Parsed from: Scope of Fact Acquisition App_ Addition - Sheet1.csv
 */
export const lessons: Lesson[] = [
  // Lesson 1: Set A - Series Saying
  {
    id: 1,
    set: 'A',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['2+1', '3+1', '4+1', '5+1'].map(createFact),
    quizOrder: ['3+1', '5+1', '2+1', '4+1']
  },
  
  // Lesson 2: Set B - Fact Families
  {
    id: 2,
    set: 'B',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['1+2', '1+3', '1+4', '1+5'].map(createFact),
    quizOrder: ['1+3', '2+1', '1+5', '4+1', '1+2', '3+1', '1+4', '5+1'],
    commutativePairs: [
      ['1+2', '2+1'],
      ['1+3', '3+1'],
      ['1+4', '4+1'],
      ['1+5', '5+1']
    ]
  },
  
  // Lesson 3: Set C - Series Saying
  {
    id: 3,
    set: 'C',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['6+1', '7+1', '8+1', '9+1'].map(createFact),
    quizOrder: ['7+1', '9+1', '6+1', '8+1']
  },
  
  // Lesson 4: Set D - Fact Families
  {
    id: 4,
    set: 'D',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['1+6', '1+7', '1+8', '1+9'].map(createFact),
    quizOrder: ['1+7', '6+1', '1+9', '8+1', '1+6', '7+1', '1+8', '9+1'],
    commutativePairs: [
      ['1+6', '6+1'],
      ['1+7', '7+1'],
      ['1+8', '8+1'],
      ['1+9', '9+1']
    ]
  },
  
  // Lesson 5: Set E - Series Saying
  {
    id: 5,
    set: 'E',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['2+2', '3+2', '4+2', '5+2'].map(createFact),
    quizOrder: ['3+2', '5+2', '2+2', '4+2']
  },
  
  // Lesson 6: Set F - Fact Families (turnarounds of L5)
  {
    id: 6,
    set: 'F',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['2+2', '2+3', '2+4', '2+5'].map(createFact),
    quizOrder: ['2+2', '2+2', '2+3', '3+2', '2+4', '4+2', '2+5', '5+2'],
    commutativePairs: [
      ['2+2', '2+2'],
      ['2+3', '3+2'],
      ['2+4', '4+2'],
      ['2+5', '5+2']
    ]
  },
  
  // Lesson 7: Set G - Series Saying
  {
    id: 7,
    set: 'G',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['6+2', '7+2', '8+2', '9+2'].map(createFact),
    quizOrder: ['7+2', '9+2', '6+2', '8+2']
  },
  
  // Lesson 8: Set H - Fact Families (turnarounds of L7)
  {
    id: 8,
    set: 'H',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['2+6', '2+7', '2+8', '2+9'].map(createFact),
    quizOrder: ['2+6', '6+2', '2+7', '7+2', '2+8', '8+2', '2+9', '9+2'],
    commutativePairs: [
      ['2+6', '6+2'],
      ['2+7', '7+2'],
      ['2+8', '8+2'],
      ['2+9', '9+2']
    ]
  },
  
  // Lesson 9: Set I - Series Saying (doubles)
  {
    id: 9,
    set: 'I',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['3+3', '4+4', '5+5', '6+6'].map(createFact),
    quizOrder: ['4+4', '6+6', '3+3', '5+5']
  },
  
  // Lesson 10: Set J - Fact Families (turnarounds of L9 doubles)
  {
    id: 10,
    set: 'J',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['3+3', '4+4', '5+5', '6+6'].map(createFact),
    quizOrder: ['3+3', '3+3', '4+4', '4+4', '5+5', '5+5', '6+6', '6+6'],
    commutativePairs: [
      ['3+3', '3+3'],
      ['4+4', '4+4'],
      ['5+5', '5+5'],
      ['6+6', '6+6']
    ]
  },
  
  // Lesson 11: Set K - Series Saying
  {
    id: 11,
    set: 'K',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['2+3', '3+3', '4+3', '5+3'].map(createFact),
    quizOrder: ['3+3', '5+3', '2+3', '4+3']
  },
  
  // Lesson 13: Set M - Series Saying
  {
    id: 13,
    set: 'M',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['6+3', '7+3', '8+3', '9+3'].map(createFact),
    quizOrder: ['7+3', '9+3', '6+3', '8+3']
  },
  
  // Lesson 15: Set O - Series Saying (with +0 facts)
  {
    id: 15,
    set: 'O',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['1+0', '2+0', '3+0', '4+0', '5+0', '6+0', '7+0', '8+0', '9+0'].map(createFact),
    quizOrder: ['3+0', '6+0', '1+0', '8+0', '5+0', '9+0', '2+0', '7+0', '4+0']
  },
  
  // Lesson 17: Set Q - Series Saying
  {
    id: 17,
    set: 'Q',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['5+4', '6+4', '7+4'].map(createFact),
    quizOrder: ['6+4', '5+4', '7+4']
  },
  
  // Lesson 19: Set S - Series Saying
  {
    id: 19,
    set: 'S',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['7+6', '8+6', '9+6'].map(createFact),
    quizOrder: ['8+6', '7+6', '9+6']
  },
  
  // Lesson 21: Set U - Series Saying
  {
    id: 21,
    set: 'U',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['7+4', '8+4', '9+4'].map(createFact),
    quizOrder: ['8+4', '7+4', '9+4']
  },
  
  // Lesson 23: Set W - Series Saying
  {
    id: 23,
    set: 'W',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['7+7', '8+7', '9+7'].map(createFact),
    quizOrder: ['8+7', '7+7', '9+7']
  },
  
  // Lesson 25: Set Y - Series Saying
  {
    id: 25,
    set: 'Y',
    format: 'series_saying',
    operation: Operation.ADDITION,
    facts: ['6+5', '7+5', '8+5', '9+5'].map(createFact),
    quizOrder: ['7+5', '9+5', '6+5', '8+5']
  },
  
  // Lesson 12: Set L - Fact Families (turnarounds of L11)
  {
    id: 12,
    set: 'L',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['3+2', '3+3', '3+4', '3+5'].map(createFact),
    quizOrder: ['3+2', '2+3', '3+3', '3+3', '3+4', '4+3', '3+5', '5+3'],
    commutativePairs: [
      ['3+2', '2+3'],
      ['3+3', '3+3'],
      ['3+4', '4+3'],
      ['3+5', '5+3']
    ]
  },
  
  // Lesson 14: Set N - Fact Families (turnarounds of L13)
  {
    id: 14,
    set: 'N',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['3+6', '3+7', '3+8', '3+9'].map(createFact),
    quizOrder: ['3+6', '6+3', '3+7', '7+3', '3+8', '8+3', '3+9', '9+3'],
    commutativePairs: [
      ['3+6', '6+3'],
      ['3+7', '7+3'],
      ['3+8', '8+3'],
      ['3+9', '9+3']
    ]
  },
  
  // Lesson 16: Set P - Fact Families (+0 turn arounds)
  {
    id: 16,
    set: 'P',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['0+1', '0+2', '0+3', '0+4', '0+5', '0+6', '0+7', '0+8', '0+9'].map(createFact),
    quizOrder: ['0+3', '3+0', '0+6', '6+0', '0+1', '1+0', '0+8', '8+0'],
    commutativePairs: [
      ['0+1', '1+0'],
      ['0+2', '2+0'],
      ['0+3', '3+0'],
      ['0+4', '4+0'],
      ['0+5', '5+0'],
      ['0+6', '6+0'],
      ['0+7', '7+0'],
      ['0+8', '8+0'],
      ['0+9', '9+0']
    ]
  },
  
  // Lesson 18: Set R - Fact Families
  {
    id: 18,
    set: 'R',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['4+5', '4+6', '4+7'].map(createFact),
    quizOrder: ['4+6', '5+4', '4+7', '7+4', '4+5', '6+4'],
    commutativePairs: [
      ['4+5', '5+4'],
      ['4+6', '6+4'],
      ['4+7', '7+4']
    ]
  },
  
  // Lesson 20: Set T - Fact Families
  {
    id: 20,
    set: 'T',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['6+7', '6+8', '6+9'].map(createFact),
    quizOrder: ['6+8', '7+6', '6+9', '9+6', '6+7', '8+6'],
    commutativePairs: [
      ['6+7', '7+6'],
      ['6+8', '8+6'],
      ['6+9', '9+6']
    ]
  },
  
  // Lesson 22: Set V - Fact Families (turnarounds of L21)
  {
    id: 22,
    set: 'V',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['4+7', '4+8', '4+9'].map(createFact),
    quizOrder: ['4+7', '7+4', '4+8', '8+4', '4+9', '9+4'],
    commutativePairs: [
      ['4+7', '7+4'],
      ['4+8', '8+4'],
      ['4+9', '9+4']
    ]
  },
  
  // Lesson 24: Set X - Fact Families (turnarounds of L23)
  {
    id: 24,
    set: 'X',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['7+7', '7+8', '7+9'].map(createFact),
    quizOrder: ['7+7', '7+7', '7+8', '8+7', '7+9', '9+7'],
    commutativePairs: [
      ['7+7', '7+7'],
      ['7+8', '8+7'],
      ['7+9', '9+7']
    ]
  },
  
  // Lesson 26: Set Z - Fact Families (final lesson!)
  {
    id: 26,
    set: 'Z',
    format: 'fact_families',
    operation: Operation.ADDITION,
    facts: ['5+6', '5+7', '5+8', '5+9'].map(createFact),
    quizOrder: ['5+7', '6+5', '5+9', '9+5', '5+6', '7+5', '5+8', '8+5'],
    commutativePairs: [
      ['5+6', '6+5'],
      ['5+7', '7+5'],
      ['5+8', '8+5'],
      ['5+9', '9+5']
    ]
  },
];

/**
 * Get lesson by ID
 */
export function getLessonById(id: number): Lesson | undefined {
  return lessons.find(l => l.id === id);
}

/**
 * Get all facts from all lessons
 */
export function getAllFacts(): Fact[] {
  return lessons.flatMap(l => l.facts);
}

/**
 * Count facts by operation
 */
export function countFactsByOperation(operation: Operation): number {
  return getAllFacts().filter(f => f.operation === operation).length;
}

