import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, POST } from '@/app/api/[...path]/route';

const h = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.stubGlobal('fetch', h.fetch);

function req(method: string, url: string, init?: { body?: string; headers?: Record<string, string> }) {
  return new NextRequest(new URL(url, 'https://mcc.test'), {
    method,
    body: init?.body,
    headers: init?.headers,
  });
}

function ctx(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe('API gateway route', () => {
  beforeEach(() => {
    h.fetch.mockReset();
    process.env.API_URL = 'http://api.internal:3001';
  });

  it('rejects paths outside the allowlist before any upstream call', async () => {
    const res = await GET(req('GET', 'https://mcc.test/api/internal/secret'), ctx(['internal', 'secret']));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ statusCode: 400 });
    expect(h.fetch).not.toHaveBeenCalled();
  });

  it.each(['auth', 'services', 'add-ons', 'availability', 'vehicles', 'bookings', 'notifications', 'admin', 'contact', 'health'])(
    'allows the %s prefix',
    async (prefix) => {
      h.fetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));
      const res = await GET(req('GET', `https://mcc.test/api/${prefix}`), ctx([prefix]));
      expect(res.status).toBe(200);
    },
  );

  it('forwards method, query string and JSON content type upstream', async () => {
    h.fetch.mockResolvedValueOnce(new Response('{"ok":true}', { status: 201 }));
    const res = await POST(
      req('POST', 'https://mcc.test/api/bookings?x=1', {
        body: '{"a":1}',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok', host: 'mcc.test' },
      }),
      ctx(['bookings']),
    );
    expect(res.status).toBe(201);
    const [url, init] = h.fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.internal:3001/bookings?x=1');
    expect(init.method).toBe('POST');
    const headers = init.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer tok');
    expect(headers.get('host')).toBeNull();
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('sends no body for GET and HEAD-style requests', async () => {
    h.fetch.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    await GET(req('GET', 'https://mcc.test/api/services'), ctx(['services']));
    const [, init] = h.fetch.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeUndefined();
  });

  it('maps an unreachable upstream to 502 instead of hanging', async () => {
    h.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await GET(req('GET', 'https://mcc.test/api/services'), ctx(['services']));
    expect(res.status).toBe(502);
  });

  it('returns null-body statuses without crashing on an empty upstream body', async () => {
    h.fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const res = await DELETE(req('DELETE', 'https://mcc.test/api/vehicles/v1'), ctx(['vehicles', 'v1']));
    expect(res.status).toBe(204);
  });

  it('streams the upstream body back unchanged', async () => {
    h.fetch.mockResolvedValueOnce(new Response('[{"name":"Exterior Car Wash"}]', { status: 200 }));
    const res = await GET(req('GET', 'https://mcc.test/api/services'), ctx(['services']));
    expect(await res.text()).toBe('[{"name":"Exterior Car Wash"}]');
  });
});
