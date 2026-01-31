import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
// Environment variables in Vite are accessed via import.meta.env


const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL!);

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  hourly_rate?: number;
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

export interface Session {
  id: string;
  user_id: string;
  duration_seconds: number;
  earnings: number;
  hourly_rate: number;
  started_at: Date;
  ended_at: Date;
  poop_level: number;
  notes?: string;
  created_at: Date;
}

export interface CreateSessionData {
  user_id: string;
  duration_seconds: number;
  earnings: number;
  hourly_rate: number;
  started_at: Date;
  ended_at?: Date;
  poop_level?: number;
  notes?: string;
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
          hourly_rate DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Create sessions table
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          duration_seconds INTEGER NOT NULL,
          earnings DECIMAL(10, 2) NOT NULL,
          hourly_rate DECIMAL(10, 2) NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE NOT NULL,
          ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          poop_level INTEGER DEFAULT 1,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Create indexes for better performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
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
        RETURNING id, email, name, hourly_rate, created_at, updated_at
      ` as any[];

      const user = result[0];

      // Generate JWT token
      const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET!);
      const token = await new jose.SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(import.meta.env.VITE_JWT_EXPIRES_IN || '7d')
        .sign(secret);

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
        SELECT id, email, name, password_hash, hourly_rate, created_at, updated_at
        FROM users WHERE email = ${email}
      ` as any[];

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
      const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET!);
      const token = await new jose.SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(import.meta.env.VITE_JWT_EXPIRES_IN || '7d')
        .sign(secret);

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
  async verifyToken(token: string): Promise<any> {
    try {
      const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET!);
      const { payload } = await jose.jwtVerify(token, secret);
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      const result = await sql`
        SELECT id, email, name, hourly_rate, created_at, updated_at
        FROM users WHERE id = ${userId}
      ` as any[];

      return (result[0] as Omit<User, 'password_hash'>) || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Create new session
  async createSession(sessionData: CreateSessionData): Promise<Session | null> {
    try {
      const result = await sql`
        INSERT INTO sessions (user_id, duration_seconds, earnings, hourly_rate, started_at, ended_at, poop_level, notes)
        VALUES (
          ${sessionData.user_id},
          ${sessionData.duration_seconds},
          ${sessionData.earnings},
          ${sessionData.hourly_rate},
          ${sessionData.started_at},
          ${sessionData.ended_at || new Date()},
          ${sessionData.poop_level || 1},
          ${sessionData.notes || null}
        )
      ` as any[];

      return (result[0] as Session) || null;
    } catch (error) {
      console.error('Create session error:', error);
      return null;
    }
  }

  // Get sessions for user
  async getUserSessions(userId: string, limit: number = 50, offset: number = 0): Promise<Session[]> {
    try {
      const result = await sql`
        SELECT id, user_id, duration_seconds, earnings, hourly_rate, started_at, ended_at, poop_level, notes, created_at
        FROM sessions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      ` as any[];

      return result as Session[];
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  // Get session statistics for user
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalDuration: number;
    totalEarnings: number;
    averageEarnings: number;
    averageDuration: number;
  }> {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(duration_seconds) as total_duration,
          SUM(earnings) as total_earnings,
          AVG(earnings) as avg_earnings,
          AVG(duration_seconds) as avg_duration
        FROM sessions
        WHERE user_id = ${userId}
      `;

      const stats = result[0];
      return {
        totalSessions: parseInt(stats.total_sessions) || 0,
        totalDuration: parseInt(stats.total_duration) || 0,
        totalEarnings: parseFloat(stats.total_earnings) || 0,
        averageEarnings: parseFloat(stats.avg_earnings) || 0,
        averageDuration: parseInt(stats.avg_duration) || 0,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalEarnings: 0,
        averageEarnings: 0,
        averageDuration: 0,
      };
    }
  }

  // Delete session
  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      await sql`
        DELETE FROM sessions 
        WHERE id = ${sessionId} AND user_id = ${userId}
      `;
      return true;
    } catch (error) {
      console.error('Delete session error:', error);
      return false;
    }
  }
  // Update user salary
  async updateUserSalary(userId: string, hourlyRate: number): Promise<boolean> {
    try {
      await sql`
        UPDATE users 
        SET hourly_rate = ${hourlyRate}, updated_at = NOW()
        WHERE id = ${userId}
      `;
      return true;
    } catch (error) {
      console.error('Update user salary error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();