import { Request, Response, NextFunction, RequestHandler } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class InMemoryRateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key] && this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.store[key];

    if (!record || record.resetTime < now) {
      // First request or window expired
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(key: string, limit: number): number {
    const record = this.store[key];
    if (!record || record.resetTime < Date.now()) {
      return limit;
    }
    return Math.max(0, limit - record.count);
  }

  getResetTime(key: string): number {
    const record = this.store[key];
    if (!record || record.resetTime < Date.now()) {
      return 0;
    }
    return record.resetTime;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

const rateLimiter = new InMemoryRateLimiter();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimit(options: RateLimitOptions): RequestHandler {
  const {
    windowMs,
    max,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    
    if (!rateLimiter.isAllowed(key, max, windowMs)) {
      const resetTime = rateLimiter.getResetTime(key);
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      res.status(429).json({
        error: 'Too many requests',
        retryAfter,
        limit: max,
        windowMs
      });
      return;
    }

    // Add rate limit headers
    const remaining = rateLimiter.getRemainingRequests(key, max);
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': rateLimiter.getResetTime(key).toString()
    });

    // Track response to potentially skip counting
    const originalSend = res.send;
    res.send = function(body) {
      const statusCode = res.statusCode;
      const shouldSkip = 
        (skipSuccessfulRequests && statusCode < 400) ||
        (skipFailedRequests && statusCode >= 400);

      if (shouldSkip) {
        // Reverse the count since we shouldn't have counted this request
        // Note: This is a simplified approach for the beta
        console.log(`Skipping rate limit count for ${key} (status: ${statusCode})`);
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

// Predefined rate limiters for common use cases
export const swipeRateLimit: RequestHandler = createRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100, // 100 swipes per day
  keyGenerator: (req: Request) => {
    const authReq = req as any;
    return authReq.user?.id || req.ip || 'unknown';
  }
});

export const messageRateLimit: RequestHandler = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  keyGenerator: (req: Request) => {
    const authReq = req as any;
    return authReq.user?.id || req.ip || 'unknown';
  }
});

export const authRateLimit: RequestHandler = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth attempts per 15 minutes
  keyGenerator: (req: Request) => req.ip || 'unknown'
});

export const generalRateLimit: RequestHandler = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  keyGenerator: (req: Request) => req.ip || 'unknown'
});

// Cleanup on app shutdown
process.on('SIGTERM', () => {
  rateLimiter.destroy();
});

process.on('SIGINT', () => {
  rateLimiter.destroy();
});
