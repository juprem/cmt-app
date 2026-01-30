import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.NEON_DATABASE_URL!);

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: Omit<User, 'password_hash'>;
  token?: string;
  error?: string;
}

class AuthService {
  // Initialize database tables
  async initDatabase() {
    try {
      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }

  // Register new user
  async register(userData: CreateUserData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${userData.email}
      `;

      if (existingUsers.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create user
      const result = await sql`
        INSERT INTO users (email, name, password_hash)
        VALUES (${userData.email}, ${userData.name}, ${passwordHash})
        RETURNING id, email, name, created_at, updated_at
      `;

      const user = result[0];
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const result = await sql`
        SELECT id, email, name, password_hash, created_at, updated_at
        FROM users WHERE email = ${email}
      `;

      if (result.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user = result[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return null;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      const result = await sql`
        SELECT id, email, name, created_at, updated_at
        FROM users WHERE id = ${userId}
      `;

      return result[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();