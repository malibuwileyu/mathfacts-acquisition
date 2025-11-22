/**
 * LTI Session Management
 * Handles user sessions from LTI launches
 */

import { LTIUser } from './verify';

const SESSION_COOKIE_NAME = 'lti_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export interface Session {
  user: LTIUser;
  createdAt: string;
  expiresAt: string;
}

/**
 * Create a session cookie string
 * Returns Set-Cookie header value
 */
export function createSessionCookie(user: LTIUser): string {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);
  
  const session: Session = {
    user,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
  
  const sessionJson = JSON.stringify(session);
  const encoded = Buffer.from(sessionJson).toString('base64');
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return `${SESSION_COOKIE_NAME}=${encoded}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}${isProduction ? '; Secure' : ''}`;
}

/**
 * Get session from cookie string
 */
export function getSessionFromCookie(cookieHeader?: string | null): Session | null {
  if (!cookieHeader) return null;
  
  try {
    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const sessionValue = cookies[SESSION_COOKIE_NAME];
    if (!sessionValue) return null;
    
    // Decode base64
    const sessionJson = Buffer.from(sessionValue, 'base64').toString('utf-8');
    const session: Session = JSON.parse(sessionJson);
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request?: Request): Promise<LTIUser | null> {
  if (!request) return null;
  
  const cookieHeader = request.headers.get('cookie');
  const session = getSessionFromCookie(cookieHeader);
  return session?.user || null;
}

/**
 * Create clear session cookie string
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

