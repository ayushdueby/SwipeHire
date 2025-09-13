import { Request, Response } from 'express';
import { generateToken } from '@/lib/auth';
import { createError } from '@/middleware/errorHandler';
import { registerSchema, loginSchema } from '@/utils/validators';
import { mockDB } from '@/lib/mockDB';

export async function register(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { email, password, role, firstName, lastName } = validatedData;

    // Check if user already exists
    const existingUser = await mockDB.findUserByEmail(email);
    if (existingUser) {
      throw createError('User with this email already exists', 400);
    }

    // Create new user
    const user = await mockDB.createUser({
      email,
      password,
      role,
      firstName: firstName || '',
      lastName: lastName || '',
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: mockDB.transformUser(user),
        token,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function login(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await mockDB.findUserByEmail(email, true);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await mockDB.comparePassword(user, password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: mockDB.transformUser(user),
        token,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const user = await mockDB.findUserById(userId);
    
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user: mockDB.transformUser(user) },
    });
  } catch (error) {
    throw error;
  }
}

export async function logout(req: Request, res: Response) {
  // With JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
