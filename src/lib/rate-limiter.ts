/**
 * Rate Limiter for API endpoints
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);
    
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.config.windowMs);
    
    if (validRequests.length >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validRequests[0] + this.config.windowMs,
      };
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - validRequests.length,
      resetTime: now + this.config.windowMs,
    };
  }

  private getDefaultKey(request: NextRequest): string {
    // Use IP address as default key
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `rate_limit:${ip}`;
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.config.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Pre-configured rate limiters
export const studentRateLimiter = new RateLimiter({
  maxRequests: 50, // 50 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
  keyGenerator: (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    return `student:${userId || 'anonymous'}`;
  },
});

export const applicationRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 applications
  windowMs: 60 * 60 * 1000, // per hour
  keyGenerator: (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    return `application:${userId || 'anonymous'}`;
  },
});

export const generalRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
});

// Light list endpoints rate limiters
export const usersListRateLimiter = new RateLimiter({
  maxRequests: 120, // 120 list calls
  windowMs: 15 * 60 * 1000, // per 15 minutes
  keyGenerator: (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    return `users_list:${userId || 'anonymous'}`;
  },
});

export const studentsListRateLimiter = new RateLimiter({
  maxRequests: 120, // 120 list calls
  windowMs: 15 * 60 * 1000, // per 15 minutes
  keyGenerator: (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    return `students_list:${userId || 'anonymous'}`;
  },
});

// Rate limiting middleware
export function rateLimitMiddleware(
  request: NextRequest,
  rateLimiter: RateLimiter
): Response | null {
  const result = rateLimiter.isAllowed(request);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
        },
      }
    );
  }
  
  return null;
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  studentRateLimiter.cleanup();
  applicationRateLimiter.cleanup();
  generalRateLimiter.cleanup();
  usersListRateLimiter.cleanup();
  studentsListRateLimiter.cleanup();
}, 5 * 60 * 1000);
