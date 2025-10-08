/**
 * API Request Logger Middleware
 * Integrates with enhanced logging system
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedLogger } from './enhanced-logger';

export async function withApiLogging(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const response = await handler(request);
    const duration = Date.now() - startTime;
    
    // Log the API request
    await enhancedLogger.logApiRequest(request, response, duration);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log the error
    await enhancedLogger.logError(
      error instanceof Error ? error : new Error('Unknown error'),
      {
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        endpoint: request.nextUrl.pathname,
        method: request.method,
        duration,
      }
    );
    
    throw error;
  }
}

export function createApiHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return (request: NextRequest) => withApiLogging(request, handler);
}
