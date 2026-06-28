import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'CUSTOMER' | 'ADMIN' | 'MANAGER';
  phone_number?: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, refresh: string, userData: UserData) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, refresh: string, userData: UserData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh');
    if (refresh) {
      try {
        await api.post('/users/logout/', { refresh });
      } catch (e) {
        // Continue even if backend call fails to clear client side state
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user && (user.role === 'ADMIN' || user.role === 'MANAGER');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
