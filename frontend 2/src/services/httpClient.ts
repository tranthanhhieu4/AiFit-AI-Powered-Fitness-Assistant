import axios, { type AxiosInstance } from "axios";

/**
 * Shared Axios instance for every call to AIFit.Api (Architecture Design
 * 3.2 "API Client Module"). Attaches the JWT issued at login (NFR02
 * Security) and centralizes 401 handling so a stale/expired token redirects
 * to UI-01 Login instead of every page handling it separately.
 */
const TOKEN_STORAGE_KEY = "aifit.token";
const USER_STORAGE_KEY = "aifit.user";

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * The logged-in user's profile, cached locally at login so screens like
 * TopNav/AdminLayout and ProfilePage (IDD UI-08) can render without an
 * extra round trip. Re-synced whenever authService.login/signUp/updateProfile
 * resolve.
 */
export function storeUser<T>(user: T): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
