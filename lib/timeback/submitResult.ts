/**
 * Submit assessment results to TimeBack
 */

import { getTimebackToken } from './auth';
import lineItemMappings from './lineItemMappings.json';

const ONEROSTER_BASE = process.env.NEXT_PUBLIC_TIMEBACK_ONEROSTER_BASE_URL!;

export interface LessonResultData {
  lessonId: number;
  score: number;
  passed: boolean;
  completedAt: string;
  startedAt?: string;
}

export async function submitLessonResult(
  studentId: string,
  resultData: LessonResultData
): Promise<{ success: boolean; resultId?: string; error?: string }> {
  try {
    // Get auth token
    const token = await getTimebackToken();
    
    // Get line item ID for this lesson
    const lineItemId = lineItemMappings.mappings[resultData.lessonId.toString()];
    
    if (!lineItemId) {
      throw new Error(`No LineItem found for Lesson ${resultData.lessonId}. Run setup script first.`);
    }

    // Create assessment result
    const resultId = crypto.randomUUID();
    
    const response = await fetch(
      `${ONEROSTER_BASE}/ims/oneroster/gradebook/v1p2/assessmentResults`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentResult: {
            sourcedId: resultId,
            status: 'active',
            student: {
              sourcedId: studentId
            },
            assessmentLineItem: {
              sourcedId: lineItemId
            },
            score: resultData.score,
            scoreStatus: 'fully graded',
            scoreDate: new Date().toISOString(),
            comment: resultData.passed 
              ? 'Lesson completed successfully - Ready for fluency practice' 
              : 'Needs additional practice',
            metadata: {
              appName: 'math-facts-acquisition',
              appVersion: '1.0.0',
              lessonId: resultData.lessonId,
              passed: resultData.passed,
              completedAt: resultData.completedAt,
              startedAt: resultData.startedAt,
              trackId: 'TRACK6'
            }
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TimeBack API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    console.log(`✅ Submitted result for Lesson ${resultData.lessonId} to TimeBack`);
    
    return {
      success: true,
      resultId: data.assessmentResult?.sourcedId || resultId
    };

  } catch (error) {
    console.error('❌ Failed to submit result to TimeBack:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

