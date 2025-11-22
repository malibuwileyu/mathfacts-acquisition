/**
 * Integration configuration for fastmath backend
 * 
 * @spec ACQUISITION-APP-PLAN.md - Integration Layer
 * 
 * Toggle SYNC_ENABLED to enable/disable fastmath integration
 * Change TRACK_MAPPING to target different tracks
 */

import { Operation } from '@/types';

export const INTEGRATION_CONFIG = {
  // Toggle sync on/off
  ENABLED: process.env.NEXT_PUBLIC_SYNC_ENABLED === 'true',
  
  // Fastmath API endpoint
  API_URL: process.env.NEXT_PUBLIC_FASTMATH_API || 'https://server.fastmath.pro',
  
  // Operation → Track mapping (configurable via env vars)
  TRACK_MAPPING: {
    [Operation.ADDITION]: process.env.NEXT_PUBLIC_ADDITION_TRACK || 'TRACK6',
    [Operation.SUBTRACTION]: process.env.NEXT_PUBLIC_SUBTRACTION_TRACK || 'TRACK10',
    [Operation.MULTIPLICATION]: process.env.NEXT_PUBLIC_MULTIPLICATION_TRACK || 'TRACK11',
    [Operation.DIVISION]: process.env.NEXT_PUBLIC_DIVISION_TRACK || 'TRACK5'
  }
};

/**
 * Fact mappings (loaded from generated file when available)
 * Structure: { ADDITION: { "2+1": "FACT534", ... }, ... }
 */
let factMappings: Record<string, Record<string, string>> = {};

/**
 * Load fact mappings from generated file
 * Call this at app startup
 */
export async function loadFactMappings() {
  try {
    const response = await fetch('/factMappings.json');
    factMappings = await response.json();
    console.log('[Integration] Fact mappings loaded:', Object.keys(factMappings));
    return true;
  } catch (error) {
    console.warn('[Integration] No fact mappings available (this is OK for standalone mode)');
    return false;
  }
}

/**
 * Get fact mapping for an operation
 */
export function getFactMapping(operation: Operation): Record<string, string> {
  return factMappings[operation] || {};
}

/**
 * Map CSV fact ID to fastmath fact ID
 * Returns original if no mapping available
 */
export function mapFactId(factId: string, operation: Operation): string {
  const mapping = getFactMapping(operation);
  return mapping[factId] || factId;
}

/**
 * Get fastmath track ID for an operation
 */
export function getTrackId(operation: Operation): string {
  return INTEGRATION_CONFIG.TRACK_MAPPING[operation];
}

