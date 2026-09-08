/**
 * Cloudflare Worker entry for Portfolio-Live
 * - Serves Vite SPA static assets via ASSETS binding
 * - Executes Ask Guna API server-side at /api/ask and /api/ask-guna
 * - Reuses existing logic from api/ask-guna.ts (no duplication)
 */
import handler from '../api/ask-guna';
import type { AskGunaEnv } from '../api/ask-guna';

type Fetcher = {
  fetch(request: Request): Promise<Response>;
};

type Env = AskGunaEnv & {
  ASSETS: Fetcher;
};

// Normalize pathname for API detection (trailing slash tolerant)
function normalizeApiPath(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const normalizedPath = normalizeApiPath(url.pathname);

    if (normalizedPath === '/api/ask' || normalizedPath === '/api/ask-guna') {
      // Handle Ask Guna API — delegate to existing api/ask-guna.ts logic
      if (request.method !== 'POST') {
        return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } });
      }

      let body: unknown;
      try {
        const text = await request.text();
        body = text ? JSON.parse(text) : {};
      } catch {
        return Response.json({ error: 'invalid_request', message: 'Invalid JSON.' }, { status: 400 });
      }

      // Build Node-like req for handler — reuse getClientIp / isRateLimited / Groq logic inside handler
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      // Cloudflare provides real client IP via cf-connecting-ip
      const cfIp =
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        (request as unknown as { cf?: { ip?: string } }).cf?.ip ||
        'unknown';

      const nodeReq = {
        method: request.method,
        headers,
        body,
        socket: { remoteAddress: cfIp },
        env: { GROQ_API_KEY: env.GROQ_API_KEY, GROQ_MODEL: env.GROQ_MODEL } as AskGunaEnv,
      };

      let statusCode = 200;
      let responseBody: unknown = null;

      const nodeRes = {
        status(code: number) {
          statusCode = code;
          return nodeRes;
        },
        json(obj: unknown) {
          responseBody = obj;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setHeader(_k: string, _v: string) {
          // no-op for Worker; CORS/content-type handled by Response.json
        },
      };

      await handler(nodeReq as never, nodeRes as never, { GROQ_API_KEY: env.GROQ_API_KEY, GROQ_MODEL: env.GROQ_MODEL });

      return Response.json(responseBody, {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // For /api/* that is not ask/ask-guna, return 404 JSON (prevents asset fallback masking API errors)
    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }

    // Serve static assets — Vite SPA
    // env.ASSETS is auto-provided by Wrangler when `assets.directory` is configured
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      // If asset found, return it directly
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      // 404 from assets — SPA fallback: serve index.html for navigation requests
      const accept = request.headers.get('accept') || '';
      const isNavigation =
        request.method === 'GET' &&
        (accept.includes('text/html') || accept.includes('*/*') || url.pathname === '/' || !url.pathname.includes('.'));

      if (isNavigation) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        if (indexResponse.status !== 404) {
          return indexResponse;
        }
      }
      return assetResponse;
    } catch {
      // If ASSETS binding missing (local dev without wrangler), fallback to 404 with SPA hint
      return new Response('Not found', { status: 404 });
    }
  },
};
