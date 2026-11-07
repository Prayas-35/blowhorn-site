// node --test internal-worker/worker.test.mjs (make test-internal-worker): the Access token check fails closed.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createSign } from 'node:crypto';
import { handle, ipAllowed, resetCertsCache, sortWorkloadTeammates, FLEET_SORT_JS, csvCell } from './src/worker.js';

const TEAM_HOST = 'example-team.cloudflareaccess.com';
const TEAM = `https://${TEAM_HOST}`;
const AUD = 'test-aud';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256' };
const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function sign(claims, key = privateKey, kid = 'k1') {
  const head = b64({ alg: 'RS256', kid, typ: 'JWT' });
  const body = b64(claims);
  const s = createSign('RSA-SHA256').update(`${head}.${body}`).sign(key).toString('base64url');
  return `${head}.${body}.${s}`;
}
const now = () => Math.floor(Date.now() / 1000);
const good = (over = {}) => ({ aud: [AUD], iss: TEAM, email: 'Lee.Calcote@layer5.io', exp: now() + 600, iat: now(), ...over });

const env = {
  TEAM_DOMAIN: TEAM_HOST,
  POLICY_AUD: AUD,
  ALLOWED_EMAILS: 'lee.calcote@layer5.io',
  ALLOWED_EMAIL_DOMAINS: 'layer5.io',
  ASSETS: { fetch: async (r) => new Response(`asset:${new URL(r.url).pathname}`, { status: 200 }) },
};
const certsFetch = async (url) => {
  assert.equal(url, `${TEAM}/cdn-cgi/access/certs`);
  return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 });
};
const req = (headers = {}) => new Request('https://internal.blowhorn.ai/internal/finance/report/', { headers });
const status = async (r, e = env, f = certsFetch) => (await handle(r, e, f)).status;

beforeEach(() => resetCertsCache());

test('no token is denied', async () => assert.equal(await status(req()), 403));
test('valid header token is served', async () => {
  const res = await handle(req({ 'cf-access-jwt-assertion': sign(good()) }), env, certsFetch);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
});
test('valid cookie token is served', async () =>
  assert.equal(await status(req({ cookie: `a=b; CF_Authorization=${sign(good())}` })), 200));
test('wrong signing key is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good(), other) })), 403));
test('unknown kid is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good(), privateKey, 'nope') })), 403));
test('wrong audience is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good({ aud: ['other'] })) })), 403));
test('wrong issuer is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good({ iss: 'https://evil.cloudflareaccess.com' })) })), 403));
test('expired token is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good({ exp: now() - 1 })) })), 403));
test('email not on the allow list is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good({ email: 'someone@example.com' })) })), 403));

// Domain members: any address at an allowed domain, matched exactly.
const asEmail = (email, e = env, f = certsFetch) => status(req({ 'cf-access-jwt-assertion': sign(good({ email })) }), e, f);
test('member of an allowed domain is served', async () => assert.equal(await asEmail('someone@layer5.io'), 200));
test('domain match ignores case', async () => assert.equal(await asEmail('Someone@LAYER5.io'), 200));
test('look-alike domain is denied', async () => assert.equal(await asEmail('a@evil-layer5.io'), 403));
test('domain as a prefix is denied', async () => assert.equal(await asEmail('a@layer5.io.evil.com'), 403));
test('subdomain of an allowed domain is denied', async () => assert.equal(await asEmail('a@sub.layer5.io'), 403));
test('domain with no local part is denied', async () => assert.equal(await asEmail('layer5.io'), 403));
test('empty local part is denied', async () => assert.equal(await asEmail('@layer5.io'), 403));
test('domain is judged after the last @', async () => assert.equal(await asEmail('a@layer5.io@evil.com'), 403));
test('two @ signs are denied even when the last domain matches', async () => assert.equal(await asEmail('a@evil.com@layer5.io'), 403));
test('named email is still served when the domain list is empty', async () =>
  assert.equal(await asEmail('lee.calcote@layer5.io', { ...env, ALLOWED_EMAIL_DOMAINS: '' }), 200));
test('domain member is denied when the domain list is empty', async () =>
  assert.equal(await asEmail('someone@layer5.io', { ...env, ALLOWED_EMAIL_DOMAINS: '' }), 403));
test('named email is served when it is outside the domains', async () =>
  assert.equal(await asEmail('lee.calcote@layer5.io', { ...env, ALLOWED_EMAIL_DOMAINS: 'example.org' }), 200));
test('domains alone admit their members', async () =>
  assert.equal(await asEmail('someone@example.org', { ...env, ALLOWED_EMAILS: '', ALLOWED_EMAIL_DOMAINS: 'example.org' }), 200));
test('empty email and domain lists fail closed (503)', async () =>
  assert.equal(await asEmail('lee.calcote@layer5.io', { ...env, ALLOWED_EMAILS: '', ALLOWED_EMAIL_DOMAINS: '' }), 503));
test('whitespace-only lists fail closed (503)', async () =>
  assert.equal(await asEmail('lee.calcote@layer5.io', { ...env, ALLOWED_EMAILS: ' , ', ALLOWED_EMAIL_DOMAINS: '  ' }), 503));
test('alg none is denied', async () => {
  const t = `${b64({ alg: 'none', kid: 'k1' })}.${b64(good())}.`;
  assert.equal(await status(req({ 'cf-access-jwt-assertion': t })), 403);
});
test('garbage token is denied', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': 'x.y.z' })), 403));
test('missing configuration fails closed', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good()) }), { ...env, POLICY_AUD: '' }), 503));
test('certs outage fails closed', async () =>
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good()) }), env, async () => new Response('', { status: 500 })), 503));
test('root serves the /internal/ contents page', async () => {
  const t = sign(good());
  const r = new Request('https://internal.blowhorn.ai/', { headers: { 'cf-access-jwt-assertion': t } });
  const res = await handle(r, env, certsFetch);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'asset:/internal/');
});
test('rotated signing key refetches certs when kid is not in cache and caches new key', async () => {
  const { privateKey: k2Priv, publicKey: k2Pub } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const k2Jwk = { ...k2Pub.export({ format: 'jwk' }), kid: 'k2', alg: 'RS256' };

  let fetchCount = 0;
  const rotatingFetch = async (url) => {
    fetchCount++;
    const keys = fetchCount === 1 ? [jwk] : [jwk, k2Jwk];
    return new Response(JSON.stringify({ keys }), { status: 200 });
  };

  // 1. Prime cache with k1
  assert.equal(await status(req({ 'cf-access-jwt-assertion': sign(good()) }), env, rotatingFetch), 200);
  assert.equal(fetchCount, 1);

  // 2. Request with rotated key k2: bypasses stale cache, fetches certs, and admits
  const tokenK2 = sign(good(), k2Priv, 'k2');
  assert.equal(await status(req({ 'cf-access-jwt-assertion': tokenK2 }), env, rotatingFetch), 200);
  assert.equal(fetchCount, 2);

  // 3. Subsequent request with k2 uses the updated cache without extra network fetch
  assert.equal(await status(req({ 'cf-access-jwt-assertion': tokenK2 }), env, rotatingFetch), 200);
  assert.equal(fetchCount, 2);
});
test('root without a token is denied', async () =>
  assert.equal(await status(new Request('https://internal.blowhorn.ai/')), 403));

const signupsDb = (rows) => ({
  prepare: () => ({ all: async () => ({ results: rows }) }),
});
const adminReq = (path, headers = {}) => new Request(`https://internal.blowhorn.ai${path}`, { headers });
const adminEnv = (rows) => ({ ...env, SIGNUPS_DB: signupsDb(rows) });
const authed = (path, e) => adminReq(path, { 'cf-access-jwt-assertion': sign(good()) });
const sampleRows = [
  { email: 'a@b.co', kind: 'waitlist', topic: 'tiktok', remark: 'shorts, please', created_at: '2026-10-27T00:00:00.000Z', unsubscribed_at: null, source_page: '/docs/reference/platforms/tiktok/' },
  { email: 'c@d.co', kind: 'newsletter', topic: null, remark: '<script>alert(1)</script>', created_at: '2026-10-27T01:00:00.000Z', unsubscribed_at: '2026-10-27T02:00:00.000Z', source_page: '/newsletter/' },
];

test('signups admin without a token is denied', async () =>
  assert.equal(await status(adminReq('/internal/signups/'), adminEnv(sampleRows)), 403));
test('signups admin with a token lists rows and escapes them', async () => {
  const res = await handle(authed('/internal/signups/'), adminEnv(sampleRows), certsFetch);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /waitlist\/tiktok: 1/);
  assert.match(html, /newsletter: 1/);
  assert.match(html, /a@b\.co/);
  assert.match(html, /Unsubscribed/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /\/internal\/signups\/export/);
});
test('signups export is CSV with quoted commas', async () => {
  const res = await handle(authed('/internal/signups/export'), adminEnv(sampleRows), certsFetch);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
  const csv = await res.text();
  assert.match(csv, /^email,kind,topic,remark,created_at,unsubscribed_at,source_page\n/);
  assert.match(csv, /"shorts, please"/);
});
test('signups admin without a database fails closed', async () =>
  assert.equal((await handle(authed('/internal/signups/'), env, certsFetch)).status, 503));

// Fleet stats page: snapshots the Bastion cron writes to FLEET_DB.
const diskSnap = {
  kind: 'disk', collected_at: '2026-11-05T02:47:20Z', collector_host: 'bastion',
  machines: [
    { name: 'office-imac', os: 'Darwin', mount: '/System/Volumes/Data', reachable: true, size_bytes: 5e11, free_bytes: 4.5e10, used_bytes: 4.55e11, used_pct: 91.0 },
    { name: 'grok-bot-box', reachable: false, error: 'ssh: <timeout>' },
  ],
};
const workloadSnap = {
  kind: 'workload', collected_at: '2026-11-05T02:47:40Z', collector_host: 'bastion', orgs: ['layer5io'],
  router: { tasks: { assigned: 42, done: 60 } },
  teammates: [
    { persona: 'alice', login: 'alice-bot', kind: 'muse-bot', paused: false, idle: false, router_load: 1, router_open_reviews: 0, router_open_issues: 1, handed_24h: 3, done_24h: 2, gh_open_prs: 1, gh_review_requests: 1, gh_assigned_issues: 1, last_seen: '2026-11-05T02:30:00Z' },
    { persona: 'yi', login: 'yi-bot', kind: 'muse-bot', paused: false, idle: false, router_load: 4, router_open_reviews: 1, router_open_issues: 3, handed_24h: 8, done_24h: 4, gh_open_prs: 25, gh_review_requests: 19, gh_assigned_issues: 7, last_seen: '2026-11-05T02:40:00Z' },
    { persona: 'bob', login: 'bob-bot', kind: 'muse-bot', paused: false, idle: false, router_load: 2, router_open_reviews: 0, router_open_issues: 2, handed_24h: 12, done_24h: 10, gh_open_prs: 2, gh_review_requests: 2, gh_assigned_issues: 2, last_seen: '2026-11-05T02:45:00Z' },
    { persona: null, login: 'leecalcote', kind: 'human', paused: false, router_load: 0, gh_open_prs: null },
  ],
};
const fleetDb = (byKind, seen = []) => ({
  prepare: (sql) => ({
    bind: (kind, since) => {
      seen.push({ sql, kind, since });
      return { all: async () => ({ results: (byKind[kind] || []).map((b) => ({ collected_at: b.collected_at, body: JSON.stringify(b) })) }) };
    },
  }),
});
const fleetEnv = (byKind, seen) => ({ ...env, FLEET_DB: fleetDb(byKind, seen) });

test('fleet page without a token is denied', async () =>
  assert.equal(await status(adminReq('/engineering/fleet/'), fleetEnv({ disk: [diskSnap] })), 403));
test('fleet page without a database fails closed', async () =>
  assert.equal((await handle(authed('/engineering/fleet/'), env, certsFetch)).status, 503));
test('fleet page renders the latest snapshots in Central time', async () => {
  const res = await handle(authed('/engineering/fleet/'), fleetEnv({ disk: [diskSnap], workload: [workloadSnap] }), certsFetch);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const html = await res.text();
  assert.match(html, /office-imac/);
  assert.match(html, /class="n hot">91%/);
  assert.match(html, /45\.0 GB/);
  assert.match(html, /grok-bot-box<\/td><td colspan="5" class="stale">Unreachable: ssh: &lt;timeout&gt;/);
  assert.match(html, /Nov 4, 8:47 PM CST/);
  assert.match(html, /<td>yi<\/td><td>yi-bot<\/td><td>working<\/td>/);
  assert.match(html, /<td>leecalcote<\/td><td>leecalcote<\/td><td>human<\/td>/);
  assert.match(html, /assigned 42, done 60/);
});
test('fleet page flags a snapshot older than two runs as stale', async () => {
  const old = { ...diskSnap, collected_at: '2020-01-01T00:00:00Z' };
  const html = await (await handle(authed('/engineering/fleet/'), fleetEnv({ disk: [old] }), certsFetch)).text();
  assert.match(html, /Stale: the cron has missed at least two runs/);
});
test('fleet page says so when there is no data yet', async () => {
  const html = await (await handle(authed('/engineering/fleet/'), fleetEnv({}), certsFetch)).text();
  assert.match(html, /No workload snapshot yet/);
  assert.match(html, /No disk snapshot yet/);
});
test('fleet data.json returns latest and history, window clamped to 90 days', async () => {
  const seen = [];
  const res = await handle(authed('/engineering/fleet/data.json?days=999'), fleetEnv({ disk: [diskSnap], workload: [workloadSnap] }, seen), certsFetch);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.days, 90);
  assert.equal(body.latest.disk.machines[0].name, 'office-imac');
  assert.equal(body.history.workload.length, 1);
  assert.deepEqual(seen.map((s) => s.kind).sort(), ['disk', 'workload']);
});
test('fleet CSVs flatten one row per machine or teammate', async () => {
  const e = fleetEnv({ disk: [diskSnap], workload: [workloadSnap] });
  const disk = await (await handle(authed('/engineering/fleet/disk.csv'), e, certsFetch)).text();
  assert.match(disk, /^collected_at,name,reachable,/);
  assert.equal(disk.trim().split('\n').length, 3);
  const wl = await (await handle(authed('/engineering/fleet/workload.csv'), e, certsFetch)).text();
  assert.match(wl, /2026-11-05T02:47:40Z,alice,alice-bot,muse-bot/);
  assert.match(wl, /yi,yi-bot,muse-bot/);
});
test('fleet database errors fail closed', async () => {
  const e = { ...env, FLEET_DB: { prepare: () => ({ bind: () => ({ all: async () => { throw new Error('d1'); } }) }) } };
  assert.equal((await handle(authed('/engineering/fleet/'), e, certsFetch)).status, 503);
});

const ipEnv = { ...env, ALLOWED_IP_RANGES: '192.0.2.1/32,2001:db8:0:73::7/128' };
const fromIp = (ip, headers = {}) => req({ 'cf-connecting-ip': ip, ...headers });
test('trusted IPv4 is served without a token', async () => assert.equal(await status(fromIp('192.0.2.1'), ipEnv), 200));
test('trusted IPv6 is served without a token, any spelling', async () => {
  assert.equal(await status(fromIp('2001:db8:0:73:0:0:0:7'), ipEnv), 200);
  assert.equal(await status(fromIp('2001:0DB8:0000:0073:0000:0000:0000:0007'), ipEnv), 200);
});
test('neighbouring IPs are denied without a token', async () => {
  assert.equal(await status(fromIp('192.0.2.2'), ipEnv), 403);
  assert.equal(await status(fromIp('2001:db8:0:73::8'), ipEnv), 403);
});
test('no IP ranges configured: a token is still required', async () => assert.equal(await status(fromIp('192.0.2.1')), 403));
test('trusted IP still fails closed when configuration is missing', async () =>
  assert.equal(await status(fromIp('192.0.2.1'), { ...ipEnv, POLICY_AUD: '' }), 503));
test('ipAllowed matches CIDR prefixes and rejects garbage', () => {
  assert.equal(ipAllowed('10.1.2.3', ['10.0.0.0/8']), true);
  assert.equal(ipAllowed('11.0.0.1', ['10.0.0.0/8']), false);
  assert.equal(ipAllowed('2001:db8::1', ['10.0.0.0/8']), false);
  assert.equal(ipAllowed('not-an-ip', ['0.0.0.0/0']), false);
  assert.equal(ipAllowed('', ['0.0.0.0/0']), false);
  assert.equal(ipAllowed('1.2.3.4', ['bad/33']), false);
  assert.equal(ipAllowed('1:2::3::4', ['::/0']), false);
});

test('old fleet path redirects permanently to /engineering/fleet/', async () => {
  const res = await handle(authed('/internal/fleet/disk.csv?days=3'), fleetEnv({}), certsFetch);
  assert.equal(res.status, 301);
  assert.equal(new URL(res.headers.get('location')).pathname + new URL(res.headers.get('location')).search, '/engineering/fleet/disk.csv?days=3');
});


test('sortWorkloadTeammates orders Done 24h numerically descending (10 before 2)', () => {
  const ordered = sortWorkloadTeammates([
    { login: 'low', done_24h: 2 },
    { login: 'high', done_24h: 10 },
    { login: 'mid', done_24h: 4 },
    { login: 'missing' },
  ]).map((t) => t.login);
  assert.deepEqual(ordered, ['high', 'mid', 'low', 'missing']);
});

test('sortWorkloadTeammates keeps input order on equal Done 24h', () => {
  const ordered = sortWorkloadTeammates([
    { login: 'a', done_24h: 5 },
    { login: 'b', done_24h: 5 },
  ]).map((t) => t.login);
  assert.deepEqual(ordered, ['a', 'b']);
});

test('fleet workload table defaults to Done 24h descending in HTML order', async () => {
  const html = await (await handle(authed('/engineering/fleet/'), fleetEnv({ disk: [diskSnap], workload: [workloadSnap] }), certsFetch)).text();
  assert.match(html, /data-fleet="workload"/);
  const body = html.match(/data-fleet="workload"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  assert.ok(body, 'workload tbody present');
  const logins = [...body[1].matchAll(/<td>[^<]*<\/td><td>([a-z0-9-]+)<\/td><td>(working|human|idle|paused)<\/td>/g)].map((m) => m[1]);
  assert.deepEqual(logins, ['bob-bot', 'yi-bot', 'alice-bot', 'leecalcote']);
});

test('fleet sort script defaults to Done 24h descending and keeps a chosen sort', () => {
  assert.match(FLEET_SORT_JS, /fleet-stats-sort/);
  assert.match(FLEET_SORT_JS, /Done 24h/);
  assert.match(FLEET_SORT_JS, /localStorage/);
  assert.match(FLEET_SORT_JS, /saved\.dir/);
});

test('fleet page tables get sortable headers', async () => {
  const html = await (await handle(authed('/engineering/fleet/'), fleetEnv({ disk: [diskSnap], workload: [workloadSnap] }), certsFetch)).text();
  assert.match(html, /<script>[\s\S]*aria-sort[\s\S]*<\/script>/);
  assert.match(html, /data-v="/);
});

test('csvCell neutralizes formula injection triggers with a leading single quote', () => {
  assert.equal(csvCell('=HYPERLINK("http://evil.com","Click")'), '"\'=HYPERLINK(""http://evil.com"",""Click"")"');
  assert.equal(csvCell('+1+1@blowhorn.ai'), "'+1+1@blowhorn.ai");
  assert.equal(csvCell('-5+2'), "'-5+2");
  assert.equal(csvCell('@SUM(1,2)'), '"\'@SUM(1,2)"');
  assert.equal(csvCell('\tTabbedValue'), "'\tTabbedValue");
  assert.equal(csvCell('\rCarriageReturnStart'), '"\'\rCarriageReturnStart"');
  assert.equal(csvCell('  =cmd'), "'  =cmd");
  assert.equal(csvCell('   @calc'), "'   @calc");
});

test('csvCell neutralizes formula triggers that follow leading whitespace', () => {
  assert.equal(csvCell(' =cmd'), "' =cmd");
  assert.equal(csvCell('  +1+1'), "'  +1+1");
  assert.equal(csvCell('   -5+2'), "'   -5+2");
  assert.equal(csvCell(' \t=cmd'), "' \t=cmd");
  assert.equal(csvCell(' @SUM(1,2)'), '"\' @SUM(1,2)"');
  assert.equal(csvCell('\n=cmd'), '"\'\n=cmd"');
});

test('csvCell preserves normal values and quotes cells containing bare carriage returns', () => {
  assert.equal(csvCell('hello world'), 'hello world');
  assert.equal(csvCell('   leading space'), '   leading space');
  assert.equal(csvCell('test@blowhorn.ai'), 'test@blowhorn.ai');
  assert.equal(csvCell('line1\rline2'), '"line1\rline2"');
  assert.equal(csvCell('comma,value'), '"comma,value"');
  assert.equal(csvCell('quote "value"'), '"quote ""value"""');
  assert.equal(csvCell(null), '');
  assert.equal(csvCell(undefined), '');
});

test('fleet sort script normalizes storage units and disk table embeds byte keys', async () => {
  assert.match(FLEET_SORT_JS, /MULT/);
  assert.match(FLEET_SORT_JS, /\[kmgt]\?b/i);

  const e = fleetEnv({ disk: [diskSnap], workload: [workloadSnap] });
  const html = await (await handle(authed('/engineering/fleet/'), e, certsFetch)).text();
  assert.match(html, /data-v="45000000000"/);
  assert.match(html, /data-v="500000000000"/);
});
