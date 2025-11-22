/**
 * Create a test student in TimeBack
 * Uses OneRoster API to create user with student role
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getTimebackToken } from '../lib/timeback/auth';

const ONEROSTER_BASE = process.env.TIMEBACK_ONEROSTER_BASE_URL!;
const ORG_ID = process.env.TIMEBACK_PHASE0_ORG_ID!;

async function createTestStudent(
  givenName: string,
  familyName: string,
  email: string
) {
  const token = await getTimebackToken();
  const userId = randomUUID();
  
  console.log(`Creating student: ${givenName} ${familyName} (${email})`);
  
  const response = await fetch(
    `${ONEROSTER_BASE}/ims/oneroster/rostering/v1p2/users`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          sourcedId: userId,
          status: 'active',
          enabledUser: true,
          givenName,
          familyName,
          email,
          username: email.split('@')[0],
          roles: [{
            roleType: 'primary',
            role: 'student',
            org: {
              sourcedId: ORG_ID
            },
            metadata: {
              timebackRole: 'student'
            }
          }],
          primaryOrg: {
            sourcedId: ORG_ID
          },
          metadata: {
            isTestUser: true
          }
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create student: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  console.log('✅ Student created!');
  console.log(`   User ID: ${userId}`);
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${givenName} ${familyName}`);
  console.log(`\nStudent can now login at: https://alpha.timeback.com`);
  console.log(`Temporary password will be sent to: ${email}`);
  
  return data;
}

async function main() {
  console.log('🎓 Creating Test Student\n');
  
  try {
    await createTestStudent(
      'TestRyan',
      'Student',
      'greedshotfirst@gmail.com'  // Change this to your test email
    );
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

main();

