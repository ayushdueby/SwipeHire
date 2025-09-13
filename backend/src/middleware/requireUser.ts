import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, getUserById } from '@/lib/auth';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: 'candidate' | 'recruiter';
    email: string;
  };
}

export const requireUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Authorization header missing or invalid format' 
      });
      return;
    }

    const token = authorization.substring(7); // Remove 'Bearer ' prefix
    
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
      return;
    }

    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ error: 'Account is deactivated' });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'Authentication failed' 
    });
  }
};

export function requireRole(role: 'candidate' | 'recruiter'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({ 
        error: 'Authentication required' 
      });
      return;
    }

    if (authReq.user.role !== role) {
      res.status(403).json({ 
        error: `Access denied. ${role} role required.` 
      });
      return;
    }

    next();
  };
}