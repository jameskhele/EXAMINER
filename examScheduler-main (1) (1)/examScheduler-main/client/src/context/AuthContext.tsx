import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<void>;
  signup: (userInfo: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      // If a token and user data exist in storage, restore the session
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await apiService.login(credentials);
      const userData = {
        id: response.data._id,
        name: 'User', // You might want to return more user info from your login endpoint
        email: response.data.email,
        role: 'admin', // Default role for now
        institution: response.data.institution, // Using institution from API
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
      };
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userInfo: any) => {
    setLoading(true);
    try {
      const response = await apiService.signup(userInfo);
      const userData = {
        id: response.data._id,
        name: 'New User',
        email: response.data.email,
        role: 'user',
        institution: response.data.institution, // Using institution from API
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
      };
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear user data
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

