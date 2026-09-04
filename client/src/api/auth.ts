import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
} from '@shared/api.interface';

const TOKEN_KEY = 'admin_token';

export function setAuthToken(token: string): void {
  axiosForBackend.defaults.headers.common.Authorization = `Bearer ${token}`;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  delete axiosForBackend.defaults.headers.common.Authorization;
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  const payload: AdminLoginRequest = { username, password };
  const { data } = await axiosForBackend.post<AdminLoginResponse>(
    '/api/admin/login',
    payload,
  );
  logger.info(`[auth] login success, username=${username}`);
  return data;
}

export async function getMe(): Promise<AdminUser> {
  const { data } = await axiosForBackend.get<AdminUser>('/api/admin/me');
  return data;
}
