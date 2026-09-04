import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { authApi } from '@client/src/api';
import type { AdminUser } from '@shared/api.interface';

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = authApi.getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.setAuthToken(token);

    authApi
      .getMe()
      .then((me: AdminUser) => {
        setUser(me);
        logger.info(`[auth] restored session, username=${me.username}`);
      })
      .catch((err: unknown) => {
        logger.error(`[auth] token invalid, clearing session: ${String(err)}`);
        authApi.clearAuthToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await authApi.login(username, password);
    authApi.setAuthToken(response.token);
    const me = await authApi.getMe();
    setUser(me);
  };

  const logout = (): void => {
    authApi.clearAuthToken();
    setUser(null);
    logger.info('[auth] logged out');
  };

  const value: AuthContextValue = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
