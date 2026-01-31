import { neon } from '@neondatabase/serverless';
import { createAuthClient } from "@neondatabase/auth";

// Base SQL client for our data (sessions, stats)
const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL!);

// Neon Auth Client
export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL!);

export interface User {
  id: string;
  email: string;
  name: string;
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
  user?: User;
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
  // Initialize ONLY our extensions/app tables
  async initDatabase() {
    try {
      // 1. Cleanup legacy tables if they exist (as requested)
      await sql`DROP TABLE IF EXISTS "user" CASCADE;`;
      await sql`DROP TABLE IF EXISTS "users" CASCADE;`;

      // 2. Ensure app tables exist
      await sql`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id TEXT PRIMARY KEY,
          hourly_rate DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
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

      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);`;

      console.log('App database initialized and cleaned up');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }

  // Register new user via Neon Auth
  async register(userData: CreateUserData): Promise<AuthResult> {
    try {
      const result = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.name,
      });

      if (result.error) {
        return { success: false, error: result.error.message || 'Registration failed' };
      }

      const data = result.data as any;
      const user = data.user;
      const token = data.token || data.session?.id;

      if (user?.id) {
        await sql`
          INSERT INTO user_profiles (user_id, hourly_rate)
          VALUES (${user.id}, 0)
          ON CONFLICT (user_id) DO NOTHING
        `;
      }

      const profile = await this.getUserProfile(user.id);

      return {
        success: true,
        user: this.mapNeonUserToAppUser(user, profile?.hourly_rate || 0),
        token
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  // Login via Neon Auth
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        return { success: false, error: result.error.message || 'Login failed' };
      }

      const data = result.data as any;
      const user = data.user;
      const token = data.token || data.session?.id;

      const profile = await this.getUserProfile(user.id);

      return {
        success: true,
        user: this.mapNeonUserToAppUser(user, profile?.hourly_rate || 0),
        token
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  // Verify session/token
  async verifyToken(_token: string): Promise<any> {
    try {
      const { data } = await authClient.getSession();
      if (data) {
        return { userId: data.user.id, email: data.user.email };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getUserProfile(userId: string) {
    const result = await sql`SELECT * FROM user_profiles WHERE user_id = ${userId}`;
    return result[0] || null;
  }

  private mapNeonUserToAppUser(neonUser: any, hourlyRate: number): User {
    return {
      id: neonUser.id,
      email: neonUser.email,
      name: neonUser.name,
      hourly_rate: Number(hourlyRate || 0),
      created_at: new Date(neonUser.createdAt || Date.now()),
      updated_at: new Date(neonUser.updatedAt || Date.now())
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data } = await authClient.getSession();
      const neonUser = data?.user;

      if (!neonUser) return null;

      // In some cases (e.g. initial setup), we might be fetching a profile 
      // for a user that is authenticated but whose ID we're checking.
      // We'll allow fetching if IDs match or if we're just verifying the session.
      const profile = await this.getUserProfile(neonUser.id);
      return this.mapNeonUserToAppUser(neonUser, profile?.hourly_rate || 0);
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

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
        RETURNING *
      ` as any[];

      return (result[0] as Session) || null;
    } catch (error) {
      console.error('Create session error:', error);
      return null;
    }
  }

  async getUserSessions(userId: string, _limit: number = 50, _offset: number = 0): Promise<Session[]> {
    try {
      const result = await sql`
        SELECT * FROM sessions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      ` as any[];
      return result as Session[];
    } catch (error) {
      return [];
    }
  }

  async getUserStats(userId: string) {
    try {
      const statsResult = await sql`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(duration_seconds) as total_duration,
          SUM(earnings) as total_earnings,
          AVG(earnings) as avg_earnings,
          AVG(duration_seconds) as avg_duration
        FROM sessions
        WHERE user_id = ${userId}
      `;

      const weeklyResult = await sql`
        SELECT COUNT(*) as sessions_last_7_days
        FROM sessions
        WHERE user_id = ${userId} AND started_at >= NOW() - INTERVAL '7 days'
      `;

      const stats = statsResult[0];
      const weekly = weeklyResult[0];

      return {
        totalSessions: parseInt(stats.total_sessions) || 0,
        totalDuration: parseInt(stats.total_duration) || 0,
        totalEarnings: parseFloat(stats.total_earnings) || 0,
        averageEarnings: parseFloat(stats.avg_earnings) || 0,
        averageDuration: parseInt(stats.avg_duration) || 0,
        sessionsLast7Days: parseInt(weekly.sessions_last_7_days) || 0
      };
    } catch (error) {
      return { totalSessions: 0, totalDuration: 0, totalEarnings: 0, averageEarnings: 0, averageDuration: 0, sessionsLast7Days: 0 };
    }
  }

  async updateUserSalary(userId: string, hourlyRate: number): Promise<boolean> {
    try {
      await sql`
        INSERT INTO user_profiles (user_id, hourly_rate, updated_at)
        VALUES (${userId}, ${hourlyRate}, NOW())
        ON CONFLICT (user_id) DO UPDATE 
        SET hourly_rate = ${hourlyRate}, updated_at = NOW()
      `;
      return true;
    } catch (error) {
      return false;
    }
  }

  async logout() {
    await authClient.signOut();
  }
}

export const authService = new AuthService();