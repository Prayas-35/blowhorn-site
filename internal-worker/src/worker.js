// Serves the internal site (public-internal/) only to requests that carry a
// valid Cloudflare Access token for this application, or that come from a
// trusted network in ALLOWED_IP_RANGES (the Access bypass policy). Access already sits in
// front of the hostname; this check means a missing or misconfigured Access
// application fails closed instead of exposing the site. Every request runs
// this code first (assets.run_worker_first), assets included. The root
// path serves the /internal/ table of contents.
//
// The signups admin (/internal/signups/, /internal/signups/export) shares
// this check: it reads the SIGNUPS_DB database the public signup worker
// writes, and is served only to a verified Access identity.
//
// The fleet stats page (/engineering/fleet/, data.json, disk.csv, workload.csv)
// shares it too: it reads the FLEET_DB database that the zero-token cron on
// Bastion fills (koopverse/firstmate fleet/fleet-stats, issue #72).
//
// Deploy-time vars (set by .github/scripts/internal-deploy.sh):
//   TEAM_DOMAIN     <team>.cloudflareaccess.com (the Access auth domain)
//   POLICY_AUD      the Access application's audience tag
//   ALLOWED_EMAILS          comma-separated named addresses: the repository's
//                           allowed_emails plus the INTERNAL_ACCESS_EXTRA_EMAILS
//                           secret (internal-worker/access.json, docs/deploy.md)
//   ALLOWED_EMAIL_DOMAINS   comma-separated email domains (allowed_email_domains)
//   ALLOWED_IP_RANGES       comma-separated CIDRs (bypass_ip_ranges): requests
//                           from these networks skip the token check, matching
//                           the Access bypass policy, which issues no token
//
// A verified email is admitted when it is one of ALLOWED_EMAILS, or when the
// part after its last "@" is exactly one of ALLOWED_EMAIL_DOMAINS (no subdomain
// or suffix match). With neither list set, every request is refused (503).

const CERTS_TTL_MS = 10 * 60 * 1000;
let certsCache = { url: '', keys: null, fetchedAt: 0 };

const certsUrl = (teamDomain) => `https://${teamDomain}/cdn-cgi/access/certs`;

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

const DENY_HEADERS = {
  'content-type': 'text/plain; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  ...SECURITY_HEADERS,
};

function deny(status = 403) {
  return new Response(status === 403 ? 'Forbidden\n' : 'Unavailable\n', { status, headers: DENY_HEADERS });
}

function b64urlToBytes(s) {
  if (s.length % 4 === 1) throw new Error('invalid base64url length');
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeJson(part) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(part)));
}

async function accessKeys(teamDomain, fetchImpl) {
  const url = certsUrl(teamDomain);
  const now = Date.now();
  if (certsCache.url === url && certsCache.keys && now - certsCache.fetchedAt < CERTS_TTL_MS) {
    return certsCache.keys;
  }
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error('certs unavailable');
  const body = await res.json();
  certsCache = { url, keys: body.keys || [], fetchedAt: now };
  return certsCache.keys;
}

export function resetCertsCache() {
  certsCache = { url: '', keys: null, fetchedAt: 0 };
}

function tokenFrom(request) {
  const header = request.headers.get('cf-access-jwt-assertion');
  if (header) return header;
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return m ? m[1] : '';
}

// Returns the verified claims, or null.
export async function verifyAccessToken(token, env, fetchImpl = fetch, nowSec = Math.floor(Date.now() / 1000)) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header;
  let claims;
  try {
    header = decodeJson(parts[0]);
    claims = decodeJson(parts[1]);
  } catch {
    return null;
  }
  if (!header || typeof header !== 'object' || header.alg !== 'RS256' || !header.kid) return null;
  if (!claims || typeof claims !== 'object') return null;
  const hadCachedKeys = certsCache.url === certsUrl(env.TEAM_DOMAIN) && Boolean(certsCache.keys);
  let keys = await accessKeys(env.TEAM_DOMAIN, fetchImpl);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk && hadCachedKeys) {
    resetCertsCache();
    keys = await accessKeys(env.TEAM_DOMAIN, fetchImpl);
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  let sigBytes;
  try {
    sigBytes = b64urlToBytes(parts[2]);
  } catch {
    return null;
  }
  let ok = false;
  try {
    ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      sigBytes,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return null;
  }
  if (!ok) return null;
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(env.POLICY_AUD)) return null;
  if (claims.iss !== `https://${env.TEAM_DOMAIN}`) return null;
  if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) || claims.exp <= nowSec) return null;
  if (typeof claims.nbf === 'number' && claims.nbf > nowSec + 60) return null;
  const email = String(claims.email || '').toLowerCase();
  if (!emailAllowed(email, listFrom(env.ALLOWED_EMAILS), listFrom(env.ALLOWED_EMAIL_DOMAINS))) return null;
  return claims;
}

function listFrom(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Exact matches only. A domain match needs exactly one "@" and a non-empty
// local part, so "a@evil.com@layer5.io", "layer5.io" and "@layer5.io" are
// refused.
export function emailAllowed(email, emails, domains) {
  if (!email) return false;
  if (emails.includes(email)) return true;
  const at = email.lastIndexOf('@');
  // Exactly one "@": a real mailbox never has two, so refuse rather than judge.
  if (at <= 0 || email.indexOf('@') !== at) return false;
  return domains.includes(email.slice(at + 1));
}

// Parses an IPv4 or IPv6 address into [version, BigInt], or null.
function parseIp(text) {
  const s = String(text || '').trim().toLowerCase();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) {
    const parts = s.split('.').map(Number);
    if (parts.some((n) => n > 255)) return null;
    return [4, parts.reduce((acc, n) => (acc << 8n) | BigInt(n), 0n)];
  }
  if (!/^[0-9a-f:]+$/.test(s) || !s.includes(':')) return null;
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = 8 - head.length - tail.length;
  if (halves.length === 2 ? fill < 1 : fill !== 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? fill : 0).fill('0'), ...tail];
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return [6, groups.reduce((acc, g) => (acc << 16n) | BigInt(parseInt(g, 16)), 0n)];
}

// True when ip falls inside one of the CIDRs. Malformed entries match nothing.
export function ipAllowed(ip, ranges) {
  const addr = parseIp(ip);
  if (!addr) return false;
  for (const range of ranges) {
    const [base, bitsText] = range.split('/');
    const net = parseIp(base);
    if (!net || net[0] !== addr[0] || !/^\d{1,3}$/.test(bitsText || '')) continue;
    const width = addr[0] === 4 ? 32n : 128n;
    const bits = BigInt(bitsText);
    if (bits > width) continue;
    const shift = width - bits;
    if (addr[1] >> shift === net[1] >> shift) return true;
  }
  return false;
}

export async function handle(request, env, fetchImpl = fetch) {
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) return deny(503);
  if (listFrom(env.ALLOWED_EMAILS).length + listFrom(env.ALLOWED_EMAIL_DOMAINS).length === 0) return deny(503);
  // Cloudflare sets cf-connecting-ip at its edge; a client cannot supply it.
  const trustedNetwork = ipAllowed(request.headers.get('cf-connecting-ip'), listFrom(env.ALLOWED_IP_RANGES));
  if (!trustedNetwork) {
    const token = tokenFrom(request);
    if (!token) return deny();
    let claims = null;
    try {
      claims = await verifyAccessToken(token, env, fetchImpl);
    } catch {
      return deny(503);
    }
    if (!claims) return deny();
  }
  const url = new URL(request.url);
  // The signups admin lives behind the same Access check: the list holds
  // email addresses, so it is never served to an unauthenticated request.
  if (url.pathname === '/internal/signups/' || url.pathname === '/internal/signups/export') {
    return handleSignupsAdmin(url, env);
  }
  // The fleet page moved from /internal/fleet/ to /engineering/fleet/;
  // keep old links and bookmarks working with a permanent redirect.
  if (url.pathname === '/internal/fleet' || url.pathname.startsWith('/internal/fleet/')) {
    const to = new URL(url.pathname.replace(/^\/internal\/fleet/, '/engineering/fleet') + url.search, url);
    return Response.redirect(to.toString(), 301);
  }
  if (url.pathname === '/engineering/fleet') {
    return Response.redirect(new URL('/engineering/fleet/' + url.search, url).toString(), 301);
  }
  if (FLEET_PATHS.has(url.pathname)) {
    return handleFleet(url, env);
  }
  // The root serves the generated table of contents (/internal/), not the
  // build's local-preview redirect page.
  const assetRequest = url.pathname === '/' || url.pathname === '/index.html'
    ? new Request(new URL('/internal/', url), request)
    : request;
  const res = await env.ASSETS.fetch(assetRequest);
  const out = new Response(res.body, res);
  out.headers.set('cache-control', 'private, no-store');
  out.headers.set('x-robots-tag', 'noindex, nofollow');
  out.headers.set('x-content-type-options', 'nosniff');
  out.headers.set('x-frame-options', 'DENY');
  out.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  return out;
}

// Signups admin: the coming-soon waitlists and the newsletter list, from
// the same D1 database the public signup worker writes (SIGNUPS_DB
// binding). Served only after the Access check above, at
// /internal/signups/ (table) and /internal/signups/export (CSV).
function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sanitizes and quotes cell values for CSV export (RFC 4180).
 * Neutralizes spreadsheet formula injection (OWASP CWE-1236)
 * by prepending a single quote to cells starting with =, +, -, @, \t, or \r.
 */
export function csvCell(v) {
  let s = String(v ?? '');
  if (/^\s*[=+@\t\r-]/.test(s)) {
    s = `'${s}`;
  }
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const ADMIN_HEADERS = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  ...SECURITY_HEADERS,
};

async function handleSignupsAdmin(url, env) {
  const db = env.SIGNUPS_DB;
  if (!db) return deny(503);
  let rows = [];
  try {
    const res = await db
      .prepare(
        'SELECT email, kind, topic, remark, created_at, unsubscribed_at, source_page FROM signups ORDER BY created_at DESC',
      )
      .all();
    rows = res.results || [];
  } catch {
    return deny(503);
  }
  if (url.pathname === '/internal/signups/export') {
    const head = 'email,kind,topic,remark,created_at,unsubscribed_at,source_page';
    const lines = rows.map((r) =>
      [r.email, r.kind, r.topic, r.remark, r.created_at, r.unsubscribed_at, r.source_page].map(csvCell).join(','),
    );
    return new Response(`${[head, ...lines].join('\n')}\n`, {
      headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="blowhorn-signups.csv"', ...ADMIN_HEADERS },
    });
  }
  const counts = {};
  for (const r of rows) {
    const k = r.topic ? `${r.kind}/${r.topic}` : r.kind;
    counts[k] = (counts[k] || 0) + 1;
  }
  const countList = Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, n]) => `<li>${escHtml(k)}: ${n}</li>`)
    .join('');
  const tableRows = rows
    .map(
      (r) =>
        `<tr><td>${escHtml(r.email)}</td><td>${escHtml(r.kind)}</td><td>${escHtml(r.topic || '')}</td>` +
        `<td>${escHtml(r.remark)}</td><td>${escHtml(r.created_at)}</td>` +
        `<td>${r.unsubscribed_at ? 'Unsubscribed' : 'Subscribed'}</td><td>${escHtml(r.source_page)}</td></tr>`,
    )
    .join('');
  return new Response(
    `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Signups</title></head>\n<body>\n<main>\n<h1>Signups</h1>\n<ul>${countList}</ul>\n<p><a href="/internal/signups/export">Download CSV</a></p>\n<table>\n<thead><tr><th>Email</th><th>Kind</th><th>Topic</th><th>Remark</th><th>Signed up</th><th>Status</th><th>Page</th></tr></thead>\n<tbody>${tableRows}</tbody>\n</table>\n</main>\n</body>\n</html>\n`,
    { headers: { 'content-type': 'text/html; charset=utf-8', ...ADMIN_HEADERS } },
  );
}

// Fleet stats: teammate workload (hourly) and machine disk free (every 6 h),
// written by the cron on Bastion as JSON snapshots in FLEET_DB's snapshots
// table (id, kind, collected_at, body). Rendering happens here, per request,
// so publishing a snapshot needs no build, no commit and no AI.
const FLEET_PATHS = new Set([
  '/engineering/fleet/',
  '/engineering/fleet/data.json',
  '/engineering/fleet/disk.csv',
  '/engineering/fleet/workload.csv',
]);
const FLEET_TZ = 'America/Chicago';
// A snapshot older than this is flagged stale: two missed runs.
const FLEET_STALE_MS = { workload: 2.5 * 3600e3, disk: 12.5 * 3600e3 };
const DISK_FIELDS = ['collected_at', 'name', 'reachable', 'os', 'mount', 'size_bytes', 'used_bytes', 'free_bytes', 'used_pct', 'error'];
const WORKLOAD_FIELDS = [
  'collected_at', 'persona', 'login', 'kind', 'paused', 'idle', 'router_load', 'router_open_reviews',
  'router_open_issues', 'handed_24h', 'done_24h', 'gh_open_prs', 'gh_review_requests', 'gh_assigned_issues', 'last_seen',
];

export function fmtCentral(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: FLEET_TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(d);
}

function fmtGB(bytes) {
  return typeof bytes === 'number' ? `${(bytes / 1e9).toFixed(1)} GB` : '';
}

function num(v) {
  return v === null || v === undefined ? '' : String(v);
}

function parseBody(row) {
  try {
    const data = JSON.parse(row.body);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return { ...data, collected_at: row.collected_at || data.collected_at };
  } catch {
    return null;
  }
}

async function fleetSnapshots(db, kind, sinceIso) {
  const res = await db
    .prepare('SELECT collected_at, body FROM snapshots WHERE kind = ?1 AND collected_at >= ?2 ORDER BY collected_at DESC')
    .bind(kind, sinceIso)
    .all();
  return (res.results || []).map(parseBody).filter(Boolean);
}

function csvOf(fields, rows) {
  return `${[fields.join(','), ...rows.map((r) => fields.map((f) => csvCell(r[f])).join(','))].join('\n')}\n`;
}

function staleNote(snap, kind, nowMs) {
  if (!snap) return `<p class="stale">No ${kind} snapshot yet.</p>`;
  const t = new Date(snap.collected_at).getTime();
  const age = nowMs - t;
  const when = `Collected ${escHtml(fmtCentral(snap.collected_at))} on ${escHtml(snap.collector_host || '')}`;
  if (Number.isNaN(age) || age > FLEET_STALE_MS[kind]) return `<p class="stale">${when}. Stale: the cron has missed at least two runs.</p>`;
  return `<p>${when}.</p>`;
}

function diskTable(snap) {
  if (!snap) return '';
  const rows = (snap.machines || [])
    .map((m) =>
      m.reachable
        ? `<tr><td>${escHtml(m.name)}</td><td>${escHtml(m.os)}</td><td class="n${m.used_pct >= 90 ? ' hot' : ''}">${escHtml(num(m.used_pct))}%</td>` +
          `<td class="n" data-v="${escHtml(num(m.free_bytes))}">${fmtGB(m.free_bytes)}</td><td class="n" data-v="${escHtml(num(m.size_bytes))}">${fmtGB(m.size_bytes)}</td><td>${escHtml(m.mount)}</td></tr>`
        : `<tr><td>${escHtml(m.name)}</td><td colspan="5" class="stale">Unreachable: ${escHtml(m.error || 'no answer')}</td></tr>`,
    )
    .join('');
  return `<table>\n<thead><tr><th>Machine</th><th>OS</th><th>Used</th><th>Free</th><th>Size</th><th>Volume</th></tr></thead>\n<tbody>${rows}</tbody>\n</table>`;
}

function diskTrend(history) {
  // Used percent per machine across the window, oldest first.
  const snaps = [...history].reverse();
  if (snaps.length < 2) return '';
  const names = [...new Set(snaps.flatMap((s) => (s.machines || []).map((m) => m.name)))];
  const head = snaps.map((s) => `<th>${escHtml(fmtCentral(s.collected_at))}</th>`).join('');
  const body = names
    .map((n) => {
      const cells = snaps
        .map((s) => {
          const m = (s.machines || []).find((x) => x.name === n);
          return `<td class="n">${m && m.reachable ? `${escHtml(num(m.used_pct))}%` : '-'}</td>`;
        })
        .join('');
      return `<tr><td>${escHtml(n)}</td>${cells}</tr>`;
    })
    .join('');
  return `<h3>Disk used, last 7 days</h3>\n<div class="wide"><table>\n<thead><tr><th>Machine</th>${head}</tr></thead>\n<tbody>${body}</tbody>\n</table></div>`;
}

// Highest Done 24h first; missing values last; equal values keep input order.
export function sortWorkloadTeammates(teammates) {
  return (teammates || [])
    .map((t, i) => ({ t, i }))
    .sort((a, b) => {
      const aMissing = typeof a.t.done_24h !== 'number';
      const bMissing = typeof b.t.done_24h !== 'number';
      if (aMissing || bMissing) return aMissing === bMissing ? a.i - b.i : aMissing ? 1 : -1;
      return (b.t.done_24h - a.t.done_24h) || (a.i - b.i);
    })
    .map(({ t }) => t);
}

function workloadTable(snap) {
  if (!snap) return '';
  const rows = sortWorkloadTeammates(snap.teammates)
    .map((t) => {
      const state = t.kind === 'human' ? 'human' : t.paused ? 'paused' : t.idle ? 'idle' : 'working';
      return (
        `<tr><td>${escHtml(t.persona || t.login)}</td><td>${escHtml(t.login)}</td><td>${state}</td>` +
        `<td class="n">${escHtml(num(t.router_load))}</td><td class="n">${escHtml(num(t.router_open_reviews))}</td>` +
        `<td class="n">${escHtml(num(t.router_open_issues))}</td><td class="n">${escHtml(num(t.handed_24h))}</td>` +
        `<td class="n">${escHtml(num(t.done_24h))}</td><td class="n">${escHtml(num(t.gh_open_prs))}</td>` +
        `<td class="n">${escHtml(num(t.gh_review_requests))}</td><td class="n">${escHtml(num(t.gh_assigned_issues))}</td>` +
        `<td data-v="${escHtml(t.last_seen || '')}">${escHtml(fmtCentral(t.last_seen))}</td></tr>`
      );
    })
    .join('');
  const r = snap.router || {};
  const tasks = r.tasks && typeof r.tasks === 'object'
    ? Object.entries(r.tasks).map(([k, v]) => `${escHtml(k)} ${escHtml(num(v))}`).join(', ')
    : '';
  return (
    `<p>Router tasks: ${tasks || 'n/a'}. Orgs: ${escHtml((snap.orgs || []).join(', '))}.</p>\n` +
    `<table data-fleet="workload">\n<thead><tr><th>Teammate</th><th>Login</th><th>State</th><th>Router load</th><th>Reviews</th><th>Issues</th>` +
    `<th>Handed 24h</th><th>Done 24h</th><th>Open PRs</th><th>Review requests</th><th>Assigned issues</th><th>Last seen</th></tr></thead>\n` +
    `<tbody>${rows}</tbody>\n</table>`
  );
}

const FLEET_CSS =
  'body{font:14px/1.4 system-ui,sans-serif;margin:2rem;color:#111}table{border-collapse:collapse;margin:.5rem 0 1.5rem}' +
  'th,td{border:1px solid #ccc;padding:.25rem .5rem;text-align:left;white-space:nowrap}td.n{text-align:right}' +
  '.hot{color:#b00;font-weight:600}.stale{color:#b00}.wide{overflow-x:auto}' +
  'th button{all:unset;cursor:pointer;display:block;width:100%}th button:focus-visible{outline:2px solid #06c}' +
  'th button .ind{margin-left:.25rem;font-size:.75em}';

// Click (or Enter/Space) a column header to sort that table by it, ascending
// first, then toggling. Numbers sort numerically, text alphabetically; an
// empty or "-" cell always goes last. A cell's data-v, when set, is the sort key.
// The workload table defaults to Done 24h descending; a chosen column is kept
// in localStorage across refreshes (fleet-stats-sort).
export const FLEET_SORT_JS = `(() => {
  const STORE = 'fleet-stats-sort';
  const MULT = { b: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12 };
  const key = (td) => {
    if (!td) return null;
    const raw = (td.dataset.v ?? td.textContent).trim();
    if (raw === '' || raw === '-') return null;
    const m = raw.match(/^(-?\\d+(?:\\.\\d+)?)\\s*(%|[kmgt]?b)?$/i);
    if (m) {
      const n = parseFloat(m[1]);
      const u = (m[2] || '').toLowerCase();
      return u && MULT[u] ? n * MULT[u] : n;
    }
    return raw.toLowerCase();
  };
  const readStore = () => {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; }
  };
  const writeStore = (id, col, dir) => {
    if (!id) return;
    const all = readStore();
    all[id] = { col, dir };
    try { localStorage.setItem(STORE, JSON.stringify(all)); } catch {}
  };
  const sortBody = (tbody, col, dir) => {
    const rows = [...tbody.rows].map((r, i) => ({ r, i, k: key(r.cells[col]?.colSpan > 1 ? null : r.cells[col]) }));
    rows.sort((a, b) => {
      if (a.k === null || b.k === null) return a.k === b.k ? a.i - b.i : a.k === null ? 1 : -1;
      if (typeof a.k !== typeof b.k) return (typeof a.k === 'number' ? -1 : 1) * dir;
      const c = typeof a.k === 'number' ? a.k - b.k : a.k.localeCompare(b.k);
      return (c || a.i - b.i) * dir;
    });
    rows.forEach(({ r }) => tbody.append(r));
  };
  const labelOf = (th) => {
    const b = th.querySelector('button');
    if (!b) return th.textContent.trim();
    return [...b.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('') || b.textContent.replace(/[\u25B2\u25BC]/g, '').trim();
  };
  document.querySelectorAll('table').forEach((table) => {
    const ths = [...table.querySelectorAll('thead th')];
    const tbody = table.tBodies[0];
    if (!tbody) return;
    const id = table.dataset.fleet || '';
    const apply = (col, dir) => {
      if (col < 0 || col >= ths.length) return;
      ths.forEach((h) => { h.setAttribute('aria-sort', 'none'); const s = h.querySelector('.ind'); if (s) s.textContent = ''; });
      const th = ths[col];
      th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
      const ind = th.querySelector('.ind');
      if (ind) ind.textContent = dir === 1 ? '\u25B2' : '\u25BC';
      sortBody(tbody, col, dir);
    };
    ths.forEach((th, col) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.append(...th.childNodes);
      const ind = document.createElement('span');
      ind.className = 'ind';
      ind.setAttribute('aria-hidden', 'true');
      b.append(ind);
      th.append(b);
      th.setAttribute('aria-sort', 'none');
      b.addEventListener('click', () => {
        const dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
        apply(col, dir);
        writeStore(id, col, dir);
      });
    });
    if (id === 'workload') {
      const saved = readStore().workload;
      const doneIdx = ths.findIndex((th) => labelOf(th) === 'Done 24h');
      const col = saved && Number.isInteger(saved.col) ? saved.col : doneIdx;
      const dir = saved && (saved.dir === 1 || saved.dir === -1) ? saved.dir : -1;
      apply(col, dir);
    }
  });
})();`;

async function handleFleet(url, env, nowMs = Date.now()) {
  const db = env.FLEET_DB;
  if (!db) return deny(503);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10) || 7, 1), 90);
  const since = new Date(nowMs - days * 86400e3).toISOString();
  let disk = [];
  let workload = [];
  try {
    [disk, workload] = await Promise.all([fleetSnapshots(db, 'disk', since), fleetSnapshots(db, 'workload', since)]);
  } catch {
    return deny(503);
  }
  if (url.pathname === '/engineering/fleet/data.json') {
    const body = { days, latest: { disk: disk[0] || null, workload: workload[0] || null }, history: { disk, workload } };
    return new Response(`${JSON.stringify(body)}\n`, { headers: { 'content-type': 'application/json; charset=utf-8', ...ADMIN_HEADERS } });
  }
  if (url.pathname === '/engineering/fleet/disk.csv' || url.pathname === '/engineering/fleet/workload.csv') {
    const isDisk = url.pathname.endsWith('disk.csv');
    const rows = isDisk
      ? disk.flatMap((s) => (s.machines || []).map((m) => ({ ...m, collected_at: s.collected_at })))
      : workload.flatMap((s) => (s.teammates || []).map((t) => ({ ...t, collected_at: s.collected_at })));
    const name = isDisk ? 'fleet-disk.csv' : 'fleet-workload.csv';
    return new Response(csvOf(isDisk ? DISK_FIELDS : WORKLOAD_FIELDS, rows), {
      headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${name}"`, ...ADMIN_HEADERS },
    });
  }
  const html =
    `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Fleet stats</title><style>${FLEET_CSS}</style></head>\n<body>\n<main>\n` +
    `<h1>Fleet stats</h1>\n<p>Collected by cron on Bastion with no AI: workload every hour, disk every 6 hours. ` +
    `Times are US Central. Data: <a href="/engineering/fleet/data.json">data.json</a>, ` +
    `<a href="/engineering/fleet/workload.csv">workload.csv</a>, <a href="/engineering/fleet/disk.csv">disk.csv</a> ` +
    `(add <code>?days=30</code> for a longer window, up to 90).</p>\n` +
    `<h2>Teammate workload</h2>\n${staleNote(workload[0], 'workload', nowMs)}\n${workloadTable(workload[0])}\n` +
    `<h2>Disk free</h2>\n${staleNote(disk[0], 'disk', nowMs)}\n${diskTable(disk[0])}\n${diskTrend(disk.slice(0, 28))}\n` +
    `</main>\n<script>${FLEET_SORT_JS}</script>\n</body>\n</html>\n`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', ...ADMIN_HEADERS } });
}

export default {
  fetch(request, env) {
    return handle(request, env);
  },
};
