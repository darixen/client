'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SkullLoader } from '@/components/ui/SkullLoader';

interface User {
  id: string;
  email: string;
  fullName?: string;
  setupStatus: 'pending_vault' | 'completed';
  role: 'admin' | 'operative';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || '';

  const refreshUser = useCallback(async () => {    
    try {
      const res = await fetch(`api/users/me`); // Relative API call to leverage Next.js API routes
      const data = await res.json();
      if (res.ok && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
      
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
      });
      setUser(null);
      router.push('/login');
      router.refresh(); // Clear Next.js client cache
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {loading ? <SkullLoader fullPage size={80} label="Decrypting_Node..." /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);