'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

type User = { id: number; email: string; nombre: string; rol: string };
type Ctx = { user: User | null; login: (e: string, p: string) => Promise<void>; logout: () => void };

const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('conecta_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = async (email: string, password: string) => {
    const { accessToken, user } = await api.login(email, password);
    sessionStorage.setItem('conecta_token', accessToken);
    sessionStorage.setItem('conecta_user', JSON.stringify(user));
    setUser(user);
    router.push('/dashboard');
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    router.push('/login');
  };

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
