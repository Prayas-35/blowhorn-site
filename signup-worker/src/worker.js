// Blowhorn signup service: coming-soon waitlists and the Blowhorn newsletter.
//
// Served at https://api.blowhorn.ai (custom domain). A blowhorn.ai/api/*
// route was dropped: the apex is DNS-only, so such a route can never
// serve traffic.
// No confirmation step: a signup is live as soon as it is stored. Every
// ship email and newsletter email carries an unsubscribe link built from
// the row token.
//
// Storage: one Cloudflare D1 table, signups (see migrations/0001_init.sql).
// The db object is a small adapter over the D1 binding (d1Db) so tests can
// inject an in-memory fake with the same six methods.

export const SITE_ORIGIN = 'https://blowhorn.ai';
export const THANKS_URL = `${SITE_ORIGIN}/coming-soon/thanks/`;

const RATE_LIMIT_PER_MINUTE = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPIC_RE = /^[a-z0-9-]{1,40}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]+$/;
const MAX_EMAIL = 254;
const MAX_REMARK = 500;
const MAX_SOURCE_PAGE = 500;

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function d1Db(db) {
  return {
    async getSignup(email, kind, topic) {
      return db
        .prepare('SELECT * FROM signups WHERE email = ?1 AND kind = ?2 AND topic IS ?3')
        .bind(email, kind, topic)
        .first();
    },
    async insertSignup(row) {
      await db
        .prepare(
          'INSERT INTO signups (email, kind, topic, remark, token, created_at, source_page) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
        )
        .bind(row.email, row.kind, row.topic, row.remark, row.token, row.created_at, row.source_page)
        .run();
    },
    async updateSignup(row) {
      await db
        .prepare(
          'UPDATE signups SET remark = ?1, source_page = ?2, unsubscribed_at = NULL WHERE email = ?3 AND kind = ?4 AND topic IS ?5',
        )
        .bind(row.remark, row.source_page, row.email, row.kind, row.topic)
        .run();
    },
    async rateHit(ip, window) {
      await db.prepare('DELETE FROM rate_limits WHERE window < ?1').bind(window).run();
      const res = await db
        .prepare(
          'INSERT INTO rate_limits (ip, window, count) VALUES (?1, ?2, 1) ON CONFLICT (ip, window) DO UPDATE SET count = count + 1 RETURNING count',
        )
        .bind(ip, window)
        .all();
      return res.results && res.results[0] ? res.results[0].count : 1;
    },
    async getByToken(token) {
      return db.prepare('SELECT * FROM signups WHERE token = ?1').bind(token).first();
    },
    async markUnsubscribed(token) {
      await db
        .prepare('UPDATE signups SET unsubscribed_at = ?1 WHERE token = ?2')
        .bind(new Date().toISOString(), token)
        .run();
    },
  };
}

function clientIp(request) {
  const direct = request.headers.get('cf-connecting-ip');
  if (direct) return direct.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

function corsHeaders(request) {
  const origin = request.headers.get('origin');
  if (origin === SITE_ORIGIN) return { 'access-control-allow-origin': SITE_ORIGIN, vary: 'Origin' };
  return {};
}

function jsonResponse(request, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...SECURITY_HEADERS,
      ...corsHeaders(request),
    },
  });
}

export function safeHtml(content) {
  return { html: String(content ?? '') };
}

export function pageResponse(request, status, title, body) {
  const safeTitle = escHtml(title);
  const safeBody = (typeof body === 'object' && body !== null && 'html' in body)
    ? body.html
    : escHtml(body);
  return new Response(
    `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>${safeTitle}</title></head>\n<body>\n<main>\n<h1>${safeTitle}</h1>\n<p>${safeBody}</p>\n</main>\n</body>\n</html>\n`,
    {
      status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        ...SECURITY_HEADERS,
        ...corsHeaders(request),
      },
    },
  );
}

export function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeBackLink(sourcePage) {
  if (
    typeof sourcePage === 'string'
    && sourcePage.startsWith('/')
    && !sourcePage.startsWith('//')
    && !sourcePage.startsWith('/\\')
    && !/[\s"'<>\\]/.test(sourcePage)
  ) {
    return `${SITE_ORIGIN}${sourcePage}`;
  }
  return SITE_ORIGIN;
}

async function readFields(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return null;
    return {
      email: body.email,
      topic: body.topic,
      remark: body.remark,
      website: body.website,
      source_page: body.source_page,
      token: body.token,
    };
  }
  const form = await request.formData().catch(() => null);
  if (!form) return null;
  return {
    email: form.get('email'),
    topic: form.get('topic'),
    remark: form.get('remark'),
    website: form.get('website'),
    source_page: form.get('source_page'),
    token: form.get('token'),
  };
}

function isFormPost(request) {
  return (request.headers.get('content-type') || '').includes('application/x-www-form-urlencoded')
    || (request.headers.get('content-type') || '').includes('multipart/form-data');
}

function fail(request, status, message, sourcePage) {
  if (isFormPost(request)) {
    const link = escHtml(safeBackLink(sourcePage));
    const safeMsg = escHtml(message);
    return pageResponse(
      request,
      status,
      'Something went wrong',
      safeHtml(`${safeMsg} <a href="${link}">Go back</a> and try again.`),
    );
  }
  return jsonResponse(request, status, { ok: false, error: message });
}

function validateSignup(kind, fields) {
  const email = typeof fields.email === 'string' ? fields.email.trim().toLowerCase() : '';
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  let topic = null;
  if (kind === 'waitlist') {
    topic = typeof fields.topic === 'string' ? fields.topic.trim().toLowerCase() : '';
    if (!TOPIC_RE.test(topic)) return { error: 'Unknown waitlist topic.' };
  }
  const remark = typeof fields.remark === 'string' ? fields.remark.trim() : '';
  if (remark.length > MAX_REMARK) return { error: 'The remark is too long (500 characters max).' };
  const sourcePage = typeof fields.source_page === 'string' ? fields.source_page.trim().slice(0, MAX_SOURCE_PAGE) : '';
  return { email, topic, remark, sourcePage };
}

export function createHandler(db) {
  return async function handle(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': SITE_ORIGIN,
          'access-control-allow-methods': 'POST, GET, OPTIONS',
          'access-control-allow-headers': 'Content-Type',
          vary: 'Origin',
        },
      });
    }
    const isWaitlist = request.method === 'POST' && url.pathname === '/api/waitlist';
    const isSubscribe = request.method === 'POST' && url.pathname === '/api/subscribe';
    const isUnsubscribeGet = request.method === 'GET' && url.pathname === '/api/unsubscribe';
    const isUnsubscribePost = request.method === 'POST' && url.pathname === '/api/unsubscribe';
    if (!isWaitlist && !isSubscribe && !isUnsubscribeGet && !isUnsubscribePost) {
      return new Response('Not found\n', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS },
      });
    }

    // Per-IP rate limit, Tells shape (30 req/min), backed by D1.
    try {
      const window = Math.floor(Date.now() / 60000);
      const count = await db.rateHit(clientIp(request), window);
      if (count > RATE_LIMIT_PER_MINUTE) {
        if (isUnsubscribeGet || isUnsubscribePost) {
          return pageResponse(request, 429, 'Too many requests', 'Too many requests. Try again shortly.');
        }
        return fail(request, 429, 'Too many requests. Try again shortly.', null);
      }
    } catch {
      return fail(request, 500, 'Something went wrong.', null);
    }

    if (isUnsubscribeGet) {
      const token = url.searchParams.get('token') || '';
      if (!token || !TOKEN_RE.test(token)) {
        return pageResponse(
          request,
          400,
          'Unsubscribe link incomplete',
          'This unsubscribe link is missing its key. Use the link from the email you got.',
        );
      }
      try {
        const row = await db.getByToken(token);
        if (!row) {
          return pageResponse(
            request,
            404,
            'Unsubscribe link not recognized',
            'No subscription matches this link. It may be from an older email, or the link may be incomplete.',
          );
        }
        if (row.unsubscribed_at) {
          return pageResponse(
            request,
            200,
            'Unsubscribed',
            'You are unsubscribed. You will get no more emails from this subscription.',
          );
        }
      } catch {
        return pageResponse(request, 500, 'Something went wrong', 'Something went wrong. Try again shortly.');
      }

      // Safety: direct interpolation of token into HTML is safe because it is strictly validated by TOKEN_RE above.
      return pageResponse(
        request,
        200,
        'Confirm unsubscribe',
        safeHtml(`Click below to confirm unsubscribing from Blowhorn updates.<br><br>\n<form method="POST" action="/api/unsubscribe">\n<input type="hidden" name="token" value="${token}">\n<button type="submit">Confirm unsubscribe</button>\n</form>`),
      );
    }

    if (isUnsubscribePost) {
      let token = url.searchParams.get('token') || '';
      if (!token) {
        const fields = await readFields(request);
        if (fields && typeof fields.token === 'string') {
          token = fields.token.trim();
        }
      }
      if (!token || !TOKEN_RE.test(token)) {
        return pageResponse(
          request,
          400,
          'Unsubscribe link incomplete',
          'This unsubscribe link is missing its key. Use the link from the email you got.',
        );
      }
      try {
        const row = await db.getByToken(token);
        if (!row) {
          return pageResponse(
            request,
            404,
            'Unsubscribe link not recognized',
            'No subscription matches this link. It may be from an older email, or the link may be incomplete.',
          );
        }
        if (!row.unsubscribed_at) await db.markUnsubscribed(token);
      } catch {
        return pageResponse(request, 500, 'Something went wrong', 'Something went wrong. Try again shortly.');
      }
      return pageResponse(
        request,
        200,
        'Unsubscribed',
        'You are unsubscribed. You will get no more emails from this subscription.',
      );
    }

    const kind = isWaitlist ? 'waitlist' : 'newsletter';
    const fields = await readFields(request);
    if (!fields) return fail(request, 400, 'Could not read the signup.', null);
    // Honeypot: a filled trap field means a bot. Answer success without storing.
    if (typeof fields.website === 'string' && fields.website.trim() !== '') {
      if (isFormPost(request)) return Response.redirect(THANKS_URL, 303);
      return jsonResponse(request, 200, { ok: true });
    }
    const valid = validateSignup(kind, fields);
    if (valid.error) return fail(request, 400, valid.error, valid.sourcePage || fields.source_page);
    try {
      const existing = await db.getSignup(valid.email, kind, valid.topic);
      if (existing) {
        await db.updateSignup({
          email: valid.email,
          kind,
          topic: valid.topic,
          remark: valid.remark,
          source_page: valid.sourcePage,
        });
      } else {
        await db.insertSignup({
          email: valid.email,
          kind,
          topic: valid.topic,
          remark: valid.remark,
          token: randomToken(),
          created_at: new Date().toISOString(),
          source_page: valid.sourcePage,
        });
      }
    } catch {
      return fail(request, 500, 'Something went wrong.', valid.sourcePage);
    }
    if (isFormPost(request)) return Response.redirect(THANKS_URL, 303);
    return jsonResponse(request, 200, { ok: true });
  };
}

export default {
  fetch(request, env) {
    return createHandler(d1Db(env.SIGNUPS_DB))(request);
  },
};
