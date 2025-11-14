"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>
  googleLogin: () => void;
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children } : { children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const { user } = await response.json()
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
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const { user } = await response.json();
      setUser(user);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Email or password is wrong');
    }
  }

  const googleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/auth/google`;
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
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, googleLogin, logout }}>
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
  }
}