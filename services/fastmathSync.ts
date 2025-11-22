/**
 * Sync service for fastmath backend integration
 * 
 * @spec ACQUISITION-APP-PLAN.md - Sync Implementation
 * 
 * Syncs completed lessons to fastmath API
 * POST /users/{userId}/progress/{trackId}
 */

import { INTEGRATION_CONFIG, mapFactId, getTrackId } from '@/config/integration';
import { Lesson, Operation } from '@/types';
import { getFactsForSync } from '@/lib/progressStore';

interface SyncResult {
  synced: boolean;
  factCount?: number;
  error?: string;
}

/**
 * Sync all completed lessons to fastmath
 * Marks facts as 'accuracyPractice' (ready for fluency)
 */
export async function syncToFastmath(
  userId: string,
  operation: Operation
): Promise<SyncResult> {
  
  if (!INTEGRATION_CONFIG.ENABLED) {
    return { synced: false };
  }
  
  // Get all facts from completed lessons
  const ourFacts = getFactsForSync();
  
  if (Object.keys(ourFacts).length === 0) {
    return { synced: false };
  }
  
  // Get their track ID
  const trackId = getTrackId(operation);
  
  // Map to their format
  const payload: Record<string, any> = {};
  
  for (const [factId, factData] of Object.entries(ourFacts)) {
    const theirFactId = mapFactId(factId, operation);
    
    if (theirFactId === factId) {
      // No mapping available
      console.warn(`No mapping for ${factId}`);
      continue;
    }
    
    payload[theirFactId] = {
      status: 'accuracyPractice',  // ← CRITICAL: Mark as ready for fluency
      attempts: factData.attempts,
      correct: factData.correct,
      timeSpent: factData.timeSpent
    };
  }
  
  if (Object.keys(payload).length === 0) {
    return { synced: false, error: 'no_mappings' };
  }
  
  // Call their API
  try {
    const response = await fetch(
      `${INTEGRATION_CONFIG.API_URL}/users/${userId}/progress/${trackId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
          'X-User-Date': new Date().toLocaleDateString('en-CA')
        },
        body: JSON.stringify({ facts: payload })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return {
      synced: true,
      factCount: Object.keys(payload).length
    };
    
  } catch (error) {
    console.error('[Sync] Failed:', error);
    return {
      synced: false,
      error: error instanceof Error ? error.message : 'unknown'
    };
  }
}

