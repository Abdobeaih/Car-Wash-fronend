import type { ApiErrorShape } from './types';

export function getApiUrl(): string {
  // Browser: call the same-origin proxy (/api/*) so the API URL never has to
  // be exposed in the client bundle and CORS is not required.
  if (typeof window !== 'undefined') return '/api';
  // Server (SSR/ISR): call the real API directly.
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export const API_URL = getApiUrl();

const TOKEN_KEY = 'mcc_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getErrorMessage(payload: ApiErrorShape | undefined, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload.message === 'string') return payload.message;
  if (Array.isArray(payload.message)) {
    const first = payload.message[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      const msg = (first as { constraints?: Record<string, string> }).constraints;
      if (msg) return Object.values(msg)[0] ?? fallback;
    }
  }
  return payload.error ?? fallback;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = (await res.json().catch(() => undefined)) as
    | T
    | ApiErrorShape
    | undefined;

  if (!res.ok) {
    const message = getErrorMessage(payload as ApiErrorShape, `Request failed with status ${res.status}`);
    if (res.status === 401) {
      clearToken();
    }
    throw new ApiError(res.status, message);
  }

  return payload as T;
}