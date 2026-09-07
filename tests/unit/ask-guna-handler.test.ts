import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function makeRes() {
  const res: Record<string, unknown> = {};
  let statusCode = 200;
  let body: unknown = null;
  const headers: Record<string, string> = {};
  const obj = {
    status(code: number) {
      statusCode = code;
      return obj as never;
    },
    json(o: unknown) {
      body = o;
    },
    setHeader(k: string, v: string) {
      headers[k] = v;
    },
    _get() {
      return { statusCode, body, headers };
    },
  };
  return obj;
}

const baseReq = (over: Record<string, unknown> = {}) => ({
  method: 'POST',
  headers: {} as Record<string, string>,
  body: { question: 'What backend projects has Guna built?' },
  socket: { remoteAddress: '127.0.0.1' },
  ...over,
});

describe('21W — Ask Guna API handler', () => {
  let handler: (req: unknown, res: unknown) => Promise<void>;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    vi.resetModules();
    process.env.GROQ_API_KEY = 'test-key';
    // mock fetch globally
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'SocialLens is a backend analytics platform.' } }] }),
      text: async () => '',
    })) as unknown as typeof fetch;
    const mod = await import('../../api/ask-guna');
    handler = mod.default as never;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GROQ_API_KEY;
    vi.restoreAllMocks();
  });

  it('POST valid question → 200', async () => {
    const res = makeRes();
    await handler(baseReq(), res as never);
    const { statusCode, body } = (res as ReturnType<typeof makeRes>)._get() as { statusCode: number; body: Record<string, unknown> };
    expect(statusCode).toBe(200);
    expect(body.answer).toBeTruthy();
  });

  it('empty → 400', async () => {
    const res = makeRes();
    await handler(baseReq({ body: { question: '' } }), res as never);
    expect((res as ReturnType<typeof makeRes>)._get().statusCode).toBe(400);
  });

  it('whitespace → 400', async () => {
    const res = makeRes();
    await handler(baseReq({ body: { question: '   ' } }), res as never);
    expect((res as ReturnType<typeof makeRes>)._get().statusCode).toBe(400);
  });

  it('too long → 400', async () => {
    const res = makeRes();
    await handler(baseReq({ body: { question: 'a'.repeat(801) } }), res as never);
    expect((res as ReturnType<typeof makeRes>)._get().statusCode).toBe(400);
  });

  it('malformed body (question not string) → 400', async () => {
    const res = makeRes();
    await handler(baseReq({ body: { question: 123 } }), res as never);
    expect((res as ReturnType<typeof makeRes>)._get().statusCode).toBe(400);
  });

  it('unsupported method GET → 405', async () => {
    const res = makeRes();
    await handler(baseReq({ method: 'GET' }), res as never);
    expect((res as ReturnType<typeof makeRes>)._get().statusCode).toBe(405);
  });

  it('missing API key → 503 safe unavailable, no secret leak', async () => {
    delete process.env.GROQ_API_KEY;
    const res = makeRes();
    await handler(baseReq(), res as never);
    const { statusCode, body } = (res as ReturnType<typeof makeRes>)._get() as { statusCode: number; body: Record<string, unknown> };
    expect(statusCode).toBe(503);
    expect(JSON.stringify(body)).not.toContain('test-key');
    expect(JSON.stringify(body)).not.toContain('gsk_');
  });

  it('provider non-200 → sanitized 502', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      text: async () => 'internal',
      json: async () => ({}),
    })) as unknown as typeof fetch;
    const res = makeRes();
    await handler(baseReq(), res as never);
    const { statusCode, body } = (res as ReturnType<typeof makeRes>)._get() as { statusCode: number; body: Record<string, unknown> };
    expect(statusCode).toBe(502);
    expect((body as Record<string,unknown>).error).toBe('provider_error');
    expect(JSON.stringify(body)).not.toContain('500');
  });

  it('rate limiting after 10 requests → 429', async () => {
    // need fresh import with clean rateMap? We'll brute-force 11 calls
    for (let i = 0; i < 10; i++) {
      const r = makeRes();
      await handler(baseReq(), r as never);
    }
    const res = makeRes();
    await handler(baseReq(), res as never);
    expect((res as ReturnType<typeof makeRes>)._get().statusCode).toBe(429);
  });

  it('timeout (AbortError) → 504 sanitized', async () => {
    global.fetch = vi.fn(async () => {
      const e = new Error('aborted');
      e.name = 'AbortError';
      throw e;
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handler(baseReq(), res as never);
    const { statusCode, body } = (res as ReturnType<typeof makeRes>)._get() as { statusCode: number; body: Record<string, unknown> };
    expect(statusCode).toBe(504);
    expect((body as Record<string,unknown>).error).toBe('timeout');
    expect(JSON.stringify(body)).not.toContain('Bearer');
  });

  it('response does not leak Authorization header secret', async () => {
    const res = makeRes();
    await handler(baseReq(), res as never);
    expect(JSON.stringify((res as ReturnType<typeof makeRes>)._get().body)).not.toContain('Bearer');
  });
});
