/**
 * LTI 1.3 Launch Endpoint
 * Receives LTI launch requests from TimeBack
 * 
 * Flow:
 * 1. TimeBack sends POST with id_token (JWT)
 * 2. We verify the token
 * 3. Extract user info
 * 4. Create session
 * 5. Redirect to app
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyLTIToken } from '@/lib/lti/verify';
import { createSessionCookie } from '@/lib/lti/session';

export async function POST(request: NextRequest) {
  try {
    // LTI 1.3 sends JWT in form data
    const formData = await request.formData();
    const idToken = formData.get('id_token') as string;
    
    if (!idToken) {
      console.error('No id_token in LTI launch');
      return NextResponse.json(
        { error: 'Missing id_token' },
        { status: 400 }
      );
    }
    
    // Verify the JWT token
    console.log('Verifying LTI token...');
    const user = await verifyLTIToken(idToken);
    
    console.log('LTI launch successful:', {
      userId: user.userId,
      name: user.name,
      email: user.email
    });
    
    // Get target URL (where to redirect after launch)
    const targetLinkUri = formData.get('target_link_uri') as string;
    const redirectUrl = targetLinkUri || '/';
    
    // Create session cookie
    const sessionCookie = createSessionCookie(user);
    
    // Redirect to app with session cookie
    const response = NextResponse.redirect(
      new URL(redirectUrl, request.url),
      { status: 303 }
    );
    
    response.headers.set('Set-Cookie', sessionCookie);
    
    return response;
    
  } catch (error) {
    console.error('LTI launch failed:', error);
    
    return NextResponse.json(
      { 
        error: 'LTI launch failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 401 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'LTI 1.3 Launch',
    methods: ['POST']
  });
}

