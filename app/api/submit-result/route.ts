/**
 * Submit assessment result to TimeBack
 * Server-side endpoint to handle session and result submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { submitLessonResult } from '@/lib/timeback/submitResult';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, score, passed, completedAt } = body;
    
    // Get student ID from better-auth session
    const session = await getSession();
    const studentId = session?.user?.id || 'demo-student';
    
    // Submit to TimeBack
    const result = await submitLessonResult(studentId, {
      lessonId,
      score,
      passed,
      completedAt
    });
    
    if (result.success) {
      return NextResponse.json({ success: true, resultId: result.resultId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Submit result error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

