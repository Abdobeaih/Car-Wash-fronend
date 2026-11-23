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
  it('older concurrent refresh cannot end loading or overwrite a newer profile',async()=>{
    window.localStorage.setItem('mcc_token','same');h.apiRequest.mockResolvedValueOnce({user:customer});
    const {result}=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(result.current.user).toEqual(customer));
    let oldResolve!:(v:unknown)=>void,newResolve!:(v:unknown)=>void;
    h.apiRequest.mockImplementationOnce(()=>new Promise(r=>oldResolve=r)).mockImplementationOnce(()=>new Promise(r=>newResolve=r));
    let old!:Promise<void>,fresh!:Promise<void>;
    act(()=>{old=result.current.refresh();fresh=result.current.refresh();});
    await act(async()=>{oldResolve({user:{...customer,name:'stale'}});await old;});
    expect(result.current.loading).toBe(true);expect(result.current.user?.name).toBe('Abdo');
    await act(async()=>{newResolve({user:{...customer,name:'updated'}});await fresh;});
    expect(result.current.user?.name).toBe('updated');expect(result.current.loading).toBe(false);
  });
  it('slow logout cannot clear a newer successful login',async()=>{
    h.apiRequest.mockResolvedValueOnce({user:customer,token:'first'});
    const {result}=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(result.current.loading).toBe(false));
    await act(async()=>{await result.current.login('a','b');});
    let release!:()=>void;h.apiRequest.mockImplementationOnce(()=>new Promise<void>(r=>release=r));
    let pending!:Promise<void>;act(()=>{pending=result.current.logout();});
    h.apiRequest.mockResolvedValueOnce({user:{...customer,name:'new account'},token:'second'});
    await act(async()=>{await result.current.login('new','password');release();await pending;});
    expect(getToken()).toBe('second');expect(result.current.user?.name).toBe('new account');
  });
  it('latest login intent wins when responses arrive out of order',async()=>{
    const {result}=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(result.current.loading).toBe(false));
    let resolveOld!:(v:unknown)=>void;h.apiRequest.mockImplementationOnce(()=>new Promise(r=>resolveOld=r)).mockResolvedValueOnce({user:{...customer,name:'chosen'},token:'chosen'});
    let old!:Promise<User>;act(()=>{old=result.current.login('old','p');});
    await act(async()=>{await result.current.login('chosen','p');resolveOld({user:customer,token:'old'});await old;});
    expect(getToken()).toBe('chosen');expect(result.current.user?.name).toBe('chosen');
  });

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
