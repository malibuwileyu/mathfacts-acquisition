/**
 * Quiz question types
 */

import { Fact } from './index';

export type QuizQuestionType = 'sum' | 'turnaround';

export interface QuizQuestion {
  type: QuizQuestionType;
  baseFact: Fact;
  expectedAnswer?: string;  // For turnaround questions (e.g., "2+1")
}

