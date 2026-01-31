import { Request, Response, NextFunction } from 'express';

/**
 * Simple authentication middleware for gamification routes
 * Uses userId from request header or body
 */

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Get userId from header or body
  const userId = req.headers['x-user-id'] as string || req.body.userId || req.query.userId;

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'User ID is required'
    });
  }

  // Attach userId to request
  req.userId = userId as string;
  next();
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId || req.ip || 'anonymous';
    const now = Date.now();

    // Clean up old entries
    const entry = requestCounts.get(userId);
    if (entry && entry.resetAt < now) {
      requestCounts.delete(userId);
    }

    // Get or create entry
    const current = requestCounts.get(userId) || { count: 0, resetAt: now + windowMs };

    // Check limit
    if (current.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Increment count
    current.count++;
    requestCounts.set(userId, current);

    next();
  };
};
