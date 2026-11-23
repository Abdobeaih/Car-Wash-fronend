import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ApiError, getToken } from '@/lib/api';
import type { User } from '@/lib/types';

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});

const customer: User = { _id: 'u1', name: 'Abdo', email: 'abdo@test.com', role: 'CUSTOMER' };

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    h.apiRequest.mockReset();
    window.localStorage.clear();
  });

  it('starts unauthenticated without a stored token and never calls the API', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(h.apiRequest).not.toHaveBeenCalled();
  });

  it('restores the session from a stored token via /auth/me', async () => {
    window.localStorage.setItem('mcc_token', 'tok');
    h.apiRequest.mockResolvedValueOnce({ user: customer });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.email).toBe('abdo@test.com'));
    expect(h.apiRequest).toHaveBeenCalledWith('/auth/me', { auth: true });
  });

  it('drops a stored token that /auth/me rejects', async () => {
    window.localStorage.setItem('mcc_token', 'stale');
    h.apiRequest.mockRejectedValueOnce(new ApiError(401,'Unauthorized'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(getToken()).toBeNull();
  });

  it.each([new Error('offline'),new ApiError(503,'unavailable')])('preserves token and page retry state on transient failure',async(error)=>{
    window.localStorage.setItem('mcc_token','valid');h.apiRequest.mockRejectedValueOnce(error);
    const {result}=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(getToken()).toBe('valid');expect(result.current.sessionError).toBe('unavailable');
    h.apiRequest.mockResolvedValueOnce({user:customer});await act(async()=>result.current.refresh());
    expect(result.current.user).toEqual(customer);expect(result.current.sessionError).toBeNull();
  });
  it('keeps an already restored user when a settings refresh fails',async()=>{
    window.localStorage.setItem('mcc_token','valid');h.apiRequest.mockResolvedValueOnce({user:customer});
    const {result}=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(result.current.user).toEqual(customer));
    h.apiRequest.mockRejectedValueOnce(new Error('offline'));await act(async()=>result.current.refresh());
    expect(result.current.user).toEqual(customer);expect(getToken()).toBe('valid');
  });
  it('login posts credentials, stores the token and exposes the user', async () => {
    h.apiRequest.mockResolvedValueOnce({ user: customer, token: 'fresh' });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.login('abdo@test.com', 'password123');
    });
    expect(h.apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'abdo@test.com', password: 'password123' },
    });
    expect(getToken()).toBe('fresh');
    expect(result.current.user?.name).toBe('Abdo');
  });

  it('logout calls the API and always clears local state', async () => {
    h.apiRequest.mockResolvedValueOnce({ user: customer, token: 'fresh' });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.login('abdo@test.com', 'password123');
    });
    h.apiRequest.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.logout();
    });
    expect(h.apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST', auth: true });
    expect(result.current.user).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('logout still clears local state when the API call fails', async () => {
    h.apiRequest.mockResolvedValueOnce({ user: customer, token: 'fresh' });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.login('abdo@test.com', 'password123');
    });
    h.apiRequest.mockRejectedValueOnce(new Error('network down'));
    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('register posts the input and returns the verification metadata', async () => {
    h.apiRequest.mockResolvedValueOnce({ user: customer, message: 'check email', devOtp: '123456' });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    let out: { devOtp?: string } | undefined;
    await act(async () => {
      out = await result.current.register({ name: 'Abdo', email: 'abdo@test.com', password: 'password123' });
    });
    expect(h.apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Abdo', email: 'abdo@test.com', password: 'password123' },
    });
    expect(out?.devOtp).toBe('123456');
    expect(getToken()).toBeNull();
  });
});
