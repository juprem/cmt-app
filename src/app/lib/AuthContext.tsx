import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, authClient, type AuthResult } from './auth';

export interface User {
  id: string;
  email: string;
  name: string;
  hourly_rate?: number;
  created_at: Date;
  updated_at: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'INITIALIZE'; payload: { user: User | null } };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return { ...state, user: null, isLoading: false, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: !!action.payload.user,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateSalary: (hourlyRate: number) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) {
          const user = await authService.getUserById(data.user.id);
          dispatch({ type: 'INITIALIZE', payload: { user } });
        } else {
          dispatch({ type: 'INITIALIZE', payload: { user: null } });
        }
      } catch (error) {
        dispatch({ type: 'INITIALIZE', payload: { user: null } });
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    dispatch({ type: 'AUTH_START' });
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: result.user } });
    } else {
      dispatch({ type: 'AUTH_FAILURE' });
    }
    return result;
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    const result = await authService.register({ email, name, password });
    if (result.success && result.user) {
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: result.user } });
      return true;
    }
    dispatch({ type: 'AUTH_FAILURE' });
    return false;
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    if (state.user) {
      const updatedUser = await authService.getUserById(state.user.id);
      if (updatedUser) dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  const updateSalary = async (hourlyRate: number): Promise<boolean> => {
    if (!state.user) return false;
    const success = await authService.updateUserSalary(state.user.id, hourlyRate);
    if (success) {
      await refreshUser();
      return true;
    }
    return false;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateSalary,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};