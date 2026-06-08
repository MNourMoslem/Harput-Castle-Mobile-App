import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setAuthHandlers } from '@/services/apiClient';

const ACCESS_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function loadStoredTokens(): Promise<void> {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem(ACCESS_KEY),
    AsyncStorage.getItem(REFRESH_KEY),
  ]);
  accessToken = access;
  refreshToken = refresh;
}

async function storeTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  await AsyncStorage.multiSet([
    [ACCESS_KEY, access],
    [REFRESH_KEY, refresh],
  ]);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const data = await apiRequest<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      token: null,
    });
    await storeTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    await clearTokens();
    return null;
  }
}

setAuthHandlers(getAccessToken, refreshAccessToken);

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/register', {
    method: 'POST',
    body: { username, email, password },
    token: null,
  });
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
    token: null,
  });
  await storeTokens(data.access_token, data.refresh_token);
  return fetchMe();
}

export async function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}

export async function logoutApi() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  }
  await clearTokens();
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string; reset_token: string | null }>(
    '/auth/forgot-password',
    { method: 'POST', body: { email }, token: null },
  );
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ detail: string }>('/auth/reset-password', {
    method: 'POST',
    body: { token, new_password: newPassword },
    token: null,
  });
}
