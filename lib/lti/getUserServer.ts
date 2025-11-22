/**
 * Server-side user getter using Next.js cookies API
 * Use this in Server Components and Server Actions
 */

import { cookies } from 'next/headers';
import { LTIUser } from './verify';
import { Session, getSessionFromCookie } from './session';

/**
 * Get current user in server component
 */
export async function getCurrentUserServer(): Promise<LTIUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lti_session');
    
    if (!sessionCookie) {
      return null;
    }
    
    // Parse the session
    const sessionJson = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session: Session = JSON.parse(sessionJson);
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

