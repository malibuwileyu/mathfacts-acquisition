/**
 * Core types for Math Fact Acquisition
 */

export enum Operation {
  ADDITION = 'ADDITION',
  SUBTRACTION = 'SUBTRACTION',
  MULTIPLICATION = 'MULTIPLICATION',
  DIVISION = 'DIVISION'
}

export interface Fact {
  id: string;              // "2+1" from CSV
  operation: Operation;    // ADDITION
  operand1: number;        // 2
  operand2: number;        // 1
  result: number;          // 3
  display: string;         // "2 + 1"
  external_id?: string;    // "FACT534" - fastmath ID (populated when mapping available)
}

export interface Lesson {
  id: number;              // 1-26
  set: string;             // 'A'-'Z'
  format: 'series_saying' | 'fact_families';
  operation: Operation;    // ADDITION
  facts: Fact[];
  quizOrder: string[];     // ["3+1", "5+1", "2+1", "4+1"]
  commutativePairs?: [string, string][];
}

export interface LessonProgress {
  lessonId: number;
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  quizScore?: number;
  passed?: boolean;
  timeSpent: number;  // seconds
  retries: number;
}

export interface FactProgress {
  factId: string;
  attempts: number;
  correct: number;
  timeSpent: number;  // milliseconds
  accuracyRate: number;
  lastPracticed?: Date;
}

