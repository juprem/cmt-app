import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from './auth';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE'; payload: { user: User | null; token: string | null } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: !!action.payload.user,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  ...AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const decoded = authService.verifyToken(token);
        if (decoded) {
          const user = await authService.getUserById(decoded.userId);
          if (user) {
            dispatch({
              type: 'INITIALIZE',
              payload: { user, token },
            });
            return;
          }
        }
        localStorage.removeItem('auth_token');
      }
      dispatch({
        type: 'INITIALIZE',
        payload: { user: null, token: null },
      });
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    const result = await authService.login(email, password);
    
    if (result.success && result.user && result.token) {
      localStorage.setItem('auth_token', result.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: result.user, token: result.token },
      });
      return true;
    } else {
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    const result = await authService.register({ email, name, password });
    
    if (result.success && result.user && result.token) {
      localStorage.setItem('auth_token', result.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: result.user, token: result.token },
      });
      return true;
    } else {
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};