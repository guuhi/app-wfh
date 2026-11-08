import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth';
import type { Role, User } from '../api/types';
import { clearSession, getSession, setSession } from './session';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const homePath = (role: Role) =>
  role === 'ADMIN' ? '/admin/employees' : '/attendance';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    () => getSession()?.user ?? null,
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setSession({ token: res.accessToken, user: res.user });
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearSession(); // JWTs are stateless: logging out = forgetting the token
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
