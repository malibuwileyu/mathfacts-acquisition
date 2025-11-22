/**
 * LTI 1.3 Token Verification
 * Verifies JWT tokens from TimeBack LTI launches
 */

import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

// TimeBack LTI Configuration (from TimeBack Platform - App Onboarding Guide)
const JWKS_URL = process.env.TIMEBACK_JWKS_URL || 'https://jherbpzmm0.execute-api.us-east-1.amazonaws.com/api/.well-known/jwks.json';
const AUDIENCE = process.env.TIMEBACK_LTI_AUDIENCE || 'mathfacts-acquisition';
const ISSUER = process.env.TIMEBACK_LTI_ISSUER || 'https://timeback.com';

export interface LTIUser {
  userId: string;          // sub claim
  email?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  roles?: string[];
  contextId?: string;      // Course/context ID
  resourceLinkId?: string; // Specific resource being launched
}

/**
 * Verify LTI 1.3 JWT token from TimeBack
 */
export async function verifyLTIToken(idToken: string): Promise<LTIUser> {
  try {
    // Get JWKS from TimeBack
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
    
    // Verify the JWT
    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: AUDIENCE,
      issuer: ISSUER,
      algorithms: ['RS256']
    });

    // Extract LTI claims
    const user: LTIUser = {
      userId: payload.sub as string,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      givenName: payload.given_name as string | undefined,
      familyName: payload.family_name as string | undefined,
      roles: extractRoles(payload),
      contextId: extractContextId(payload),
      resourceLinkId: extractResourceLinkId(payload)
    };

    return user;
  } catch (error) {
    console.error('LTI token verification failed:', error);
    throw new Error('Invalid LTI token');
  }
}

/**
 * Extract roles from LTI claims
 */
function extractRoles(payload: JWTPayload): string[] | undefined {
  // LTI 1.3 roles are in https://purl.imsglobal.org/spec/lti/claim/roles
  const rolesClaim = (payload as any)['https://purl.imsglobal.org/spec/lti/claim/roles'];
  
  if (Array.isArray(rolesClaim)) {
    return rolesClaim;
  }
  
  // Fallback to cognito:groups if using Cognito
  const groups = payload['cognito:groups'];
  if (Array.isArray(groups)) {
    return groups as string[];
  }
  
  return undefined;
}

/**
 * Extract context (course) ID from LTI claims
 */
function extractContextId(payload: JWTPayload): string | undefined {
  const contextClaim = (payload as any)['https://purl.imsglobal.org/spec/lti/claim/context'];
  return contextClaim?.id;
}

/**
 * Extract resource link ID from LTI claims
 */
function extractResourceLinkId(payload: JWTPayload): string | undefined {
  const resourceLinkClaim = (payload as any)['https://purl.imsglobal.org/spec/lti/claim/resource_link'];
  return resourceLinkClaim?.id;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: LTIUser, role: string): boolean {
  if (!user.roles) return false;
  
  // LTI roles are URLs, so check if any role ends with the given role
  return user.roles.some(r => 
    r.toLowerCase().includes(role.toLowerCase())
  );
}

/**
 * Check if user is a student
 */
export function isStudent(user: LTIUser): boolean {
  return hasRole(user, 'Learner') || hasRole(user, 'Student');
}

/**
 * Check if user is an instructor
 */
export function isInstructor(user: LTIUser): boolean {
  return hasRole(user, 'Instructor') || hasRole(user, 'Teacher');
}

