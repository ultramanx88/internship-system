/**
 * CSRF Protection utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken, validateCsrfToken } from './security';

/**
 * CSRF token storage (in production, use Redis or database)
 */
const csrfTokens = new Map<string, { token: string; expires: number }>();

/**
 * Generate and store CSRF token for a session
 */
export function generateAndStoreCsrfToken(sessionId: string): string {
  const token = generateCsrfToken();
  const expires = Date.now() + (15 * 60 * 1000); // 15 minutes
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
}

/**
 * Validate CSRF token for a session
 */
export function validateCsrfTokenForSession(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  // Check if token is expired
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return validateCsrfToken(token, stored.token);
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
    }
  }
}

/**
 * CSRF middleware for API routes
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF check for GET requests
  if (request.method === 'GET') {
    return null;
  }
  
  // Skip CSRF check for certain endpoints
  const url = new URL(request.url);
  const skipPaths = ['/api/auth/login', '/api/auth/verify', '/api/health'];
  
  if (skipPaths.some(path => url.pathname.startsWith(path))) {
    return null;
  }
  
  // Get session ID from headers or cookies
  const sessionId = request.headers.get('x-session-id') || 
                   request.cookies.get('session-id')?.value;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required for CSRF protection' },
      { status: 400 }
    );
  }
  
  // Get CSRF token from headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token required' },
      { status: 400 }
    );
  }
  
  // Validate CSRF token
  if (!validateCsrfTokenForSession(sessionId, csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return null; // CSRF check passed
}

/**
 * Generate CSRF token endpoint
 */
export async function generateCsrfTokenEndpoint(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = request.headers.get('x-session-id') || 
                     request.cookies.get('session-id')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }
    
    const token = generateAndStoreCsrfToken(sessionId);
    
    return NextResponse.json({
      success: true,
      csrfToken: token,
      expiresIn: 15 * 60 * 1000 // 15 minutes in milliseconds
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
