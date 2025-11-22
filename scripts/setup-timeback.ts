/**
 * Setup TimeBack Integration
 * Creates AssessmentLineItems for all 26 lessons (run once)
 * 
 * Usage:
 *   tsx scripts/setup-timeback.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getTimebackToken } from '../lib/timeback/auth';
import { lessons } from '../lib/lessonData';
import { writeFileSync } from 'fs';
import { randomUUID } from 'crypto';

const ONEROSTER_BASE = process.env.TIMEBACK_ONEROSTER_BASE_URL!;
const COMPONENT_ID = process.env.TIMEBACK_PHASE0_COMPONENT_ID!;

interface LineItemMapping {
  lessonId: number;
  lineItemId: string;
}

async function createAssessmentLineItem(
  token: string,
  lessonId: number,
  set: string,
  format: string
): Promise<string> {
  const lineItemId = randomUUID();
  
  console.log(`Creating AssessmentLineItem for Lesson ${lessonId}...`);
  
  const response = await fetch(
    `${ONEROSTER_BASE}/ims/oneroster/gradebook/v1p2/assessmentLineItems`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assessmentLineItem: {
          sourcedId: lineItemId,
          status: 'active',
          title: lessonId === 999 
            ? 'Math Facts Acquisition - Comprehensive Assessment (26 Questions)'
            : `Math Facts Acquisition - Lesson ${lessonId}: Set ${set}`,
          description: lessonId === 999
            ? 'Final comprehensive assessment covering all 26 lessons'
            : `Addition facts lesson ${lessonId} (${format})`,
          resultValueMin: 0,
          resultValueMax: 100,
          component: {
            sourcedId: COMPONENT_ID
          },
          metadata: {
            appName: 'math-facts-acquisition',
            appVersion: '1.0.0',
            lessonId,
            set,
            format,
            trackId: 'TRACK6',
            isComprehensive: lessonId === 999
          }
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create line item for Lesson ${lessonId}: ${error}`);
  }

  console.log(`✅ Created LineItem ${lineItemId} for Lesson ${lessonId}`);
  return lineItemId;
}

async function main() {
  console.log('🚀 Setting up TimeBack Integration\n');
  console.log(`OneRoster Base: ${ONEROSTER_BASE}`);
  console.log(`Component ID: ${COMPONENT_ID}\n`);

  try {
    // Get auth token
    console.log('🔐 Getting auth token...');
    const token = await getTimebackToken();
    console.log('✅ Authenticated\n');

    // Create line items for all lessons
    const mappings: LineItemMapping[] = [];

    for (const lesson of lessons) {
      const lineItemId = await createAssessmentLineItem(
        token,
        lesson.id,
        lesson.set,
        lesson.format
      );

      mappings.push({
        lessonId: lesson.id,
        lineItemId
      });

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    // Create comprehensive assessment line item
    console.log('\nCreating Comprehensive Assessment LineItem...');
    const comprehensiveLineItemId = await createAssessmentLineItem(
      token,
      999,
      'Final',
      'comprehensive'
    );
    
    mappings.push({
      lessonId: 999,
      lineItemId: comprehensiveLineItemId
    });

    // Save mappings to file
    const mappingFile = {
      createdAt: new Date().toISOString(),
      componentId: COMPONENT_ID,
      trackId: 'TRACK6',
      mappings: mappings.reduce((acc, m) => {
        acc[m.lessonId] = m.lineItemId;
        return acc;
      }, {} as Record<number, string>)
    };

    writeFileSync(
      'lib/timeback/lineItemMappings.json',
      JSON.stringify(mappingFile, null, 2)
    );

    console.log(`\n✅ Setup Complete!`);
    console.log(`Created ${mappings.length} AssessmentLineItems`);
    console.log(`Mappings saved to: lib/timeback/lineItemMappings.json\n`);

  } catch (error) {
    console.error('\n❌ Setup Failed:', error);
    process.exit(1);
  }
}

main();

