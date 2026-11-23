import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiRequest,
  clearToken,
  getErrorMessage,
  getToken,
  setToken,
} from '@/lib/api';

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('token storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips the session token through localStorage', () => {
    expect(getToken()).toBeNull();
    setToken('tok-123');
    expect(getToken()).toBe('tok-123');
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe('getErrorMessage', () => {
  it('returns a plain string message', () => {
    expect(getErrorMessage({ message: 'Nope' }, 'fb')).toBe('Nope');
  });

  it('takes the first entry of a message array', () => {
    expect(getErrorMessage({ message: ['first', 'second'] }, 'fb')).toBe('first');
  });

  it('unwraps class-validator constraint objects', () => {
    const payload = {
      message: [{ constraints: { isEmail: 'email must be an email' } }] as unknown as string[],
    };
    expect(getErrorMessage(payload, 'fb')).toBe('email must be an email');
  });

  it('uses the error field when no message exists', () => {
    expect(getErrorMessage({ error: 'Unauthorized' }, 'fb')).toBe('Unauthorized');
  });

  it('falls back when the payload carries nothing useful', () => {
    expect(getErrorMessage(undefined, 'fb')).toBe('fb');
    expect(getErrorMessage({}, 'fb')).toBe('fb');
  });
});

describe('apiRequest', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.clear();
  });

  it('calls the same-origin proxy from the browser', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    await apiRequest('/health');
    expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({ method: 'GET' }));
  });

  it('sends JSON bodies with the right content type', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    await apiRequest('/x', { method: 'POST', body: { a: 1 } });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"a":1}');
  });

  it('attaches the bearer token only for authenticated calls', async () => {
    setToken('secret-token');
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, {})));
    await apiRequest('/me', { auth: true });
    const [, authed] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((authed.headers as Record<string, string>).Authorization).toBe('Bearer secret-token');
    await apiRequest('/public');
    const [, anon] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((anon.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('returns undefined for 204 No Content', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiRequest('/gone', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws ApiError with the server message on failure', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { message: 'Bad input' }));
    const err = await apiRequest('/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).message).toBe('Bad input');
  });

  it('does not clear session on individual action 401', async () => {
    setToken('stale');
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'Unauthorized' }));
    await expect(apiRequest('/me', { auth: true })).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBe('stale');
  });

  it('keeps the token on non-401 failures', async () => {
    setToken('still-valid');
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { message: 'boom' }));
    await expect(apiRequest('/x')).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBe('still-valid');
  });

  it('falls back to a status message when the body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 502 }));
    await expect(apiRequest('/x')).rejects.toThrow('Request failed with status 502');
  });
});

describe('read request deadlines', () => {
  it('aborts a stalled read and leaves the saved session intact', async () => {
    const controller = new AbortController();
    const deadline = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new DOMException('Read timed out', 'TimeoutError')));
    })));
    setToken('saved-session');
    const outcome = apiRequest('/auth/me', { auth: true }).catch((error: unknown) => error);
    controller.abort();
    expect(await outcome).toBeInstanceOf(DOMException);
    expect(deadline).toHaveBeenCalledWith(15000);
    expect(getToken()).toBe('saved-session');
    deadline.mockRestore();
  });

  it('does not attach a deadline or retry a mutation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('/bookings', { method: 'POST', body: {} });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].signal).toBeUndefined();
  });
});

describe('unusable read payloads', () => {
  it.each(['not json', 'null', ''])('rejects unusable successful GET response %s', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 200 })));
    await expect(apiRequest('/vehicles', { auth: true })).rejects.toMatchObject({ status: 502 });
  });
});
