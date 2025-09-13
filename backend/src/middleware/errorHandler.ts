import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  error: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    res.status(400).json({
      error: 'Validation failed',
      details: validationErrors
    });
    return;
  }

  // MongoDB duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern || {})[0] || 'field';
    res.status(409).json({
      error: 'Resource already exists',
      field,
      message: `A record with this ${field} already exists`
    });
    return;
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values((error as any).errors || {}).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    res.status(400).json({
      error: 'Database validation failed',
      details: validationErrors
    });
    return;
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    res.status(400).json({
      error: 'Invalid ID format',
      field: (error as any).path,
      value: (error as any).value
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired'
    });
    return;
  }

  // Custom app errors
  const appError = error as AppError;
  if (appError.statusCode) {
    res.status(appError.statusCode).json({
      error: appError.message || 'An error occurred'
    });
    return;
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    })
  });
}

export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req as T, res, next).catch(next);
  };
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}
