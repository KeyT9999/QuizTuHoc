import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.js';

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = createApp();
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test('GET /api/health returns service status payload', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.ok(res.status === 200 || res.status === 503);
    const body = (await res.json()) as Record<string, unknown>;
    assert.equal(body.service, 'quiztuhoc-backend');
    assert.equal(typeof body.mongodb, 'string');
  });
});

test('GET /api/profile/me rejects unauthenticated requests with 401', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/profile/me`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, 'UNAUTHORIZED');
  });
});

test('POST /api/auth/exchange validates missing ticket with 400', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket: 'short' }),
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, 'INVALID_TICKET');
  });
});

test('PUT /api/progress/sync requires authentication', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/progress/sync`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sets: [] }),
    });
    assert.equal(res.status, 401);
  });
});

test('Admin endpoints reject unauthenticated requests with 401', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/admin/overview`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, 'UNAUTHORIZED');
  });
});

test('Unknown route returns structured 404 JSON', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, 'NOT_FOUND');
  });
});
