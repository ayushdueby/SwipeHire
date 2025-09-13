import jwt from 'jsonwebtoken';
// Swap to mock DB for development auth lookup
import { mockDB } from '@/lib/mockDB';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'candidate' | 'recruiter';
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await mockDB.findUserById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID (mock):', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await mockDB.findUserByEmail(email);
    return user;
  } catch (error) {
    console.error('Error fetching user by email (mock):', error);
    return null;
  }
}
