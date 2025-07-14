import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('astra_token');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you might want to validate the token here
      setUser({ username: 'admin', role: 'admin' });
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('astra_token', newToken);
    setUser({ username: 'admin', role: 'admin' });
  };

  const logout = async () => {
    try {
      await apiRequest('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('astra_token');
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};