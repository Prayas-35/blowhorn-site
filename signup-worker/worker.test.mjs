// node --test signup-worker/worker.test.mjs: the signup API stores, dedupes,
// unsubscribes and rate-limits, with an in-memory fake for the db adapter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, THANKS_URL, safeBackLink, escHtml, safeHtml, pageResponse } from './src/worker.js';

function fakeDb() {
  const rows = new Map();
  const byToken = new Map();
  const hits = new Map();
  const key = (email, kind, topic) => `${email}|${kind}|${topic ?? ''}`;
  return {
    rows,
    async getSignup(email, kind, topic) {
      return rows.get(key(email, kind, topic)) || null;
    },
    async insertSignup(row) {
      const full = { ...row, unsubscribed_at: null };
      rows.set(key(row.email, row.kind, row.topic), full);
      byToken.set(row.token, full);
    },
    async updateSignup(row) {
      const full = rows.get(key(row.email, row.kind, row.topic));
      full.remark = row.remark;
      full.source_page = row.source_page;
      full.unsubscribed_at = null;
    },
    async rateHit(ip, window) {
      const k = `${ip}|${window}`;
      const next = (hits.get(k) || 0) + 1;
      hits.set(k, next);
      return next;
    },
    async getByToken(token) {
      return byToken.get(token) || null;
    },
    async markUnsubscribed(token) {
      const row = byToken.get(token);
      if (row) row.unsubscribed_at = '2026-10-27T00:00:00.000Z';
    },
  };
}

function post(path, body, headers = {}) {
  return new Request(`https://api.blowhorn.ai${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function formPost(path, fields) {
  const params = new URLSearchParams(fields);
  return new Request(`https://api.blowhorn.ai${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
}

test('waitlist signup stores one row, lowercased and trimmed', async () => {
  const db = fakeDb();
  const res = await createHandler(db)(
    post('/api/waitlist', { email: '  Alex@Example.com ', topic: 'tiktok', remark: 'shorts', source_page: '/docs/reference/platforms/tiktok/' }),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  const row = await db.getSignup('alex@example.com', 'waitlist', 'tiktok');
  assert.equal(row.remark, 'shorts');
  assert.equal(row.topic, 'tiktok');
  assert.equal(row.source_page, '/docs/reference/platforms/tiktok/');
  assert.ok(row.token.length >= 32);
});

test('newsletter signup has no topic and never touches the waitlist', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/subscribe', { email: 'alex@example.com' }));
  const row = await db.getSignup('alex@example.com', 'newsletter', null);
  assert.equal(row.kind, 'newsletter');
  assert.equal(row.topic, null);
  assert.equal(await db.getSignup('alex@example.com', 'waitlist', null), null);
});

test('signing up twice refreshes the remark instead of adding a row', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/waitlist', { email: 'a@b.co', topic: 'tiktok', remark: 'first' }));
  await handle(post('/api/waitlist', { email: 'a@b.co', topic: 'tiktok', remark: 'second' }));
  assert.equal(db.rows.size, 1);
  assert.equal((await db.getSignup('a@b.co', 'waitlist', 'tiktok')).remark, 'second');
});

test('re-signup after unsubscribe clears the unsubscribe', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/waitlist', { email: 'a@b.co', topic: 'tiktok' }));
  const row = await db.getSignup('a@b.co', 'waitlist', 'tiktok');
  await handle(formPost('/api/unsubscribe', { token: row.token }));
  assert.ok((await db.getSignup('a@b.co', 'waitlist', 'tiktok')).unsubscribed_at);
  await handle(post('/api/waitlist', { email: 'a@b.co', topic: 'tiktok' }));
  assert.equal((await db.getSignup('a@b.co', 'waitlist', 'tiktok')).unsubscribed_at, null);
});

test('invalid email, bad topic and long remark are 400s and store nothing', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  for (const body of [
    { email: 'not-an-email', topic: 'tiktok' },
    { email: 'a@b.co', topic: 'TikTok!' },
    { email: 'a@b.co', topic: 'tiktok', remark: 'x'.repeat(501) },
  ]) {
    const res = await handle(post('/api/waitlist', body));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).ok, false);
  }
  assert.equal(db.rows.size, 0);
});

test('honeypot answers success without storing', async () => {
  const db = fakeDb();
  const res = await createHandler(db)(
    post('/api/waitlist', { email: 'bot@spam.test', topic: 'tiktok', website: 'http://spam' }),
  );
  assert.equal(res.status, 200);
  assert.equal(db.rows.size, 0);
});

test('form posts redirect to the thanks page on success', async () => {
  const db = fakeDb();
  const res = await createHandler(db)(
    formPost('/api/waitlist', { email: 'a@b.co', topic: 'tiktok' }),
  );
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), THANKS_URL);
});

test('unsubscribe without a token says the link is incomplete', async () => {
  const db = fakeDb();
  const res = await createHandler(db)(new Request('https://api.blowhorn.ai/api/unsubscribe'));
  assert.equal(res.status, 400);
  const text = await res.text();
  assert.match(text, /incomplete/);
  assert.doesNotMatch(text, /You are unsubscribed/);
});

test('unsubscribe with an unknown token says the link is not recognized', async () => {
  const db = fakeDb();
  const res = await createHandler(db)(new Request('https://api.blowhorn.ai/api/unsubscribe?token=nope'));
  assert.equal(res.status, 404);
  const text = await res.text();
  assert.match(text, /not recognized/);
  assert.doesNotMatch(text, /You are unsubscribed/);
});

test('31st request in a minute is rate limited', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  let last;
  for (let i = 0; i < 31; i++) {
    last = await handle(post('/api/subscribe', { email: `u${i}@b.co` }, { 'cf-connecting-ip': '203.0.113.7' }));
  }
  assert.equal(last.status, 429);
});

test('unknown paths are 404 without touching the store', async () => {
  const db = fakeDb();
  const res = await createHandler(db)(new Request('https://api.blowhorn.ai/api/nope'));
  assert.equal(res.status, 404);
  assert.equal(db.rows.size, 0);
});

test('GET /api/unsubscribe renders confirmation without mutating state', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/waitlist', { email: 'user@example.com', topic: 'tiktok' }));
  const row = await db.getSignup('user@example.com', 'waitlist', 'tiktok');

  const res = await handle(new Request(`https://api.blowhorn.ai/api/unsubscribe?token=${row.token}`));
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /Confirm unsubscribe/);

  const refreshed = await db.getByToken(row.token);
  assert.equal(refreshed.unsubscribed_at, null);
});

test('POST /api/unsubscribe marks the subscriber as unsubscribed', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/waitlist', { email: 'user@example.com', topic: 'tiktok' }));
  const row = await db.getSignup('user@example.com', 'waitlist', 'tiktok');

  const res = await handle(formPost('/api/unsubscribe', { token: row.token }));
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /You are unsubscribed/);

  const refreshed = await db.getByToken(row.token);
  assert.ok(refreshed.unsubscribed_at);
});

test('POST /api/unsubscribe with missing or unknown token returns 400 or 404', async () => {
  const db = fakeDb();
  const handle = createHandler(db);

  const resMissing = await handle(new Request('https://api.blowhorn.ai/api/unsubscribe', { method: 'POST' }));
  assert.equal(resMissing.status, 400);
  assert.match(await resMissing.text(), /incomplete/);

  const resUnknown = await handle(formPost('/api/unsubscribe', { token: 'nope' }));
  assert.equal(resUnknown.status, 404);
  assert.match(await resUnknown.text(), /not recognized/);
});

test('POST /api/unsubscribe is safe to repeat', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/waitlist', { email: 'user@example.com', topic: 'tiktok' }));
  const row = await db.getSignup('user@example.com', 'waitlist', 'tiktok');

  const first = await handle(formPost('/api/unsubscribe', { token: row.token }));
  assert.equal(first.status, 200);

  const second = await handle(formPost('/api/unsubscribe', { token: row.token }));
  assert.equal(second.status, 200);
  assert.match(await second.text(), /You are unsubscribed/);
});

test('GET /api/unsubscribe on an already unsubscribed token shows unsubscribed', async () => {
  const db = fakeDb();
  const handle = createHandler(db);
  await handle(post('/api/waitlist', { email: 'user@example.com', topic: 'tiktok' }));
  const row = await db.getSignup('user@example.com', 'waitlist', 'tiktok');
  await handle(formPost('/api/unsubscribe', { token: row.token }));

  const res = await handle(new Request(`https://api.blowhorn.ai/api/unsubscribe?token=${row.token}`));
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /You are unsubscribed/);
});

test('GET /api/unsubscribe with missing or unknown token returns 400 or 404', async () => {
  const db = fakeDb();
  const handle = createHandler(db);

  const resMissing = await handle(new Request('https://api.blowhorn.ai/api/unsubscribe'));
  assert.equal(resMissing.status, 400);
  assert.match(await resMissing.text(), /incomplete/);

  const resUnknown = await handle(new Request('https://api.blowhorn.ai/api/unsubscribe?token=nope'));
  assert.equal(resUnknown.status, 404);
  assert.match(await resUnknown.text(), /not recognized/);
});

test('safeBackLink accepts clean relative paths and rejects attribute-breaking or external inputs', () => {
  assert.equal(safeBackLink('/pricing/'), 'https://blowhorn.ai/pricing/');
  assert.equal(safeBackLink('/docs/reference/platforms/x/'), 'https://blowhorn.ai/docs/reference/platforms/x/');
  assert.equal(safeBackLink('//evil.com'), 'https://blowhorn.ai');
  assert.equal(safeBackLink('/\\evil.com'), 'https://blowhorn.ai');
  assert.equal(safeBackLink('/" onmouseover="alert(1)'), 'https://blowhorn.ai');
  assert.equal(safeBackLink("/' onmouseover='alert(1)"), 'https://blowhorn.ai');
  assert.equal(safeBackLink('/path with spaces'), 'https://blowhorn.ai');
  assert.equal(safeBackLink('/path<script>'), 'https://blowhorn.ai');
  assert.equal(safeBackLink('https://evil.com'), 'https://blowhorn.ai');
  assert.equal(safeBackLink(null), 'https://blowhorn.ai');
  assert.equal(safeBackLink(undefined), 'https://blowhorn.ai');
});

test('form post error escapes HTML and protects Go back link from attribute injection', async () => {
  const db = fakeDb();
  const handle = createHandler(db);

  // Clean path produces correct link
  const resClean = await handle(formPost('/api/waitlist', {
    email: 'bad-email',
    topic: 'tiktok',
    source_page: '/docs/reference/',
  }));
  assert.equal(resClean.status, 400);
  const textClean = await resClean.text();
  assert.match(textClean, /<a href="https:\/\/blowhorn\.ai\/docs\/reference\/">Go back<\/a>/);

  // Malicious path cannot break out of href attribute
  const resMalicious = await handle(formPost('/api/waitlist', {
    email: 'bad-email',
    topic: 'tiktok',
    source_page: '/" onmouseover="alert(1)',
  }));
  assert.equal(resMalicious.status, 400);
  const textMalicious = await resMalicious.text();
  assert.doesNotMatch(textMalicious, /onmouseover/);
  assert.match(textMalicious, /<a href="https:\/\/blowhorn\.ai">Go back<\/a>/);
});

test('pageResponse structurally escapes title and plain body, preserving safeHtml', async () => {
  const req = new Request('https://api.blowhorn.ai/api/test');

  // Plain strings in title and body are escaped by default
  const resPlain = pageResponse(req, 400, 'Alert <script>', 'Error & "quotes"');
  const textPlain = await resPlain.text();
  assert.match(textPlain, /<title>Alert &lt;script&gt;<\/title>/);
  assert.match(textPlain, /<h1>Alert &lt;script&gt;<\/h1>/);
  assert.match(textPlain, /<p>Error &amp; &quot;quotes&quot;<\/p>/);

  // safeHtml wrapper is preserved for trusted markup
  const resHtml = pageResponse(req, 200, 'Clean Title', safeHtml('<b>formatted</b>'));
  const textHtml = await resHtml.text();
  assert.match(textHtml, /<title>Clean Title<\/title>/);
  assert.match(textHtml, /<p><b>formatted<\/b><\/p>/);
});

test('signup responses include security headers for MIME, frame and referrer protection', async () => {
  const handler = createHandler(fakeDb());

  // JSON API response
  const jsonRes = await handler(post('/api/newsletter', {
    email: 'valid@example.com',
  }));
  assert.equal(jsonRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(jsonRes.headers.get('x-frame-options'), 'DENY');
  assert.equal(jsonRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');

  // HTML page response (e.g. 400 error page)
  const errRes = await handler(formPost('/api/newsletter', {
    email: 'invalid-email',
  }));
  assert.equal(errRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(errRes.headers.get('x-frame-options'), 'DENY');
  assert.equal(errRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');

  // 404 response
  const notFoundRes = await handler(new Request('https://api.blowhorn.ai/unknown'));
  assert.equal(notFoundRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(notFoundRes.headers.get('x-frame-options'), 'DENY');
  assert.equal(notFoundRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});
