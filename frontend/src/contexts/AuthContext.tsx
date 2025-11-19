'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      try {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/me`, {
          credentials: 'include',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Cannot connect to API to test session: ', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserSession();
  }, []);

  const register = async (data: RegisterData) => {
    const backendData = {
      name: `${data.lastname} ${data.firstname}`,
      email: data.email,
      password: data.password,
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed.');
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const { user, token } = await response.json();

      localStorage.setItem('access_token', token);

      setUser(user);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Email or password is wrong');
    }
  };

  const googleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/google/callback`;
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Log out error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth should be used inside an AuthProvider');
  }

  return {
    ...context,
    userLoggedIn: context.user !== null,
  };
}
