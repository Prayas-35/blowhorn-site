import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PLATFORMS,
  LIMITS,
  INTERVAL_MS,
  validateItem,
  sanitizeItem,
  normalizePayload,
  parseRetryAfter,
  parseMaxAge,
  MAX_LIVE_TTL_MS,
  createFeedSource,
  createRotation,
  paintActivity,
  paintEmpty,
  paintProgress,
  relativeTime,
  monogramHue,
  initials,
  avatarAllowed,
  avatarFor,
  AVATAR_HOSTS,
  mountActivityFeed,
  boot,
  feedTransport,
  BADGE_CAP,
  resolveNetwork,
  networksFor,
  badgeStack,
} from "./activity-feed.js";

const sourceText = readFileSync(new URL("./activity-feed.js", import.meta.url), "utf8");
const examples = JSON.parse(readFileSync(new URL("../../data/activity_feed.examples.json", import.meta.url), "utf8"));

const UID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const EID = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function item(over = {}) {
  return {
    id: EID(1),
    userId: UID,
    category: "schedule",
    action: "completed",
    createdAt: "2026-10-02T08:15:00Z",
    visibility: "public",
    platform: "linkedin",
    role: "Solo founder",
    line: "Example: a solo founder shared a launch post on LinkedIn",
    ...over,
  };
}

// The bundled collection: an envelope marked example, no paging fields.
function payload(data, extra = {}) {
  return { example: true, data, ...extra };
}

// A live EventFeedPage.
function live(data, extra = {}) {
  return { page: 0, pageSize: 20, totalCount: data.length, data, ...extra };
}

function response(status, body, headers = {}) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers,
  });
}

function element(tag) {
  const node = {
    tag,
    hidden: false,
    textContent: "",
    className: "",
    attrs: {},
    children: [],
    parentNode: null,
    ownerDocument: null,
    classList: null,
    listeners: [],
  };
  node.classList = {
    set: new Set(),
    add(name) { this.set.add(name); },
    remove(name) { this.set.delete(name); },
    contains(name) { return this.set.has(name); },
  };
  node.style = { props: {}, setProperty(key, value) { this.props[key] = value; } };
  node.setAttribute = (key, value) => { node.attrs[key] = String(value); };
  node.getAttribute = (key) => (node.attrs[key] === undefined ? null : node.attrs[key]);
  node.removeChild = (child) => {
    node.children = node.children.filter((entry) => entry !== child);
    child.parentNode = null;
  };
  node.removeAttribute = (key) => { delete node.attrs[key]; };
  node.appendChild = (child) => {
    child.parentNode = node;
    node.children.push(child);
  };
  node.addEventListener = (type, fn) => node.listeners.push({ type, fn });
  node.removeEventListener = (type, fn) => {
    node.listeners = node.listeners.filter((entry) => entry.type !== type || entry.fn !== fn);
  };
  node.contains = (target) => {
    if (target === node) return true;
    return node.children.some((child) => child.contains && child.contains(target));
  };
  node.querySelector = (selector) => walk(node, selector);
  Object.defineProperty(node, "innerHTML", {
    configurable: true,
    get() { throw new Error("innerHTML read"); },
    set() { throw new Error("innerHTML write"); },
  });
  return node;
}

function walk(node, selector) {
  const attr = selector.startsWith("[") ? selector.slice(1, -1) : "";
  if (attr && node.attrs[attr] !== undefined) return node;
  for (const child of node.children) {
    const found = walk(child, selector);
    if (found) return found;
  }
  return null;
}

function card() {
  const doc = {
    hidden: false,
    listeners: [],
    addEventListener(type, fn) { this.listeners.push({ type, fn }); },
    removeEventListener(type, fn) {
      this.listeners = this.listeners.filter((entry) => entry.type !== type || entry.fn !== fn);
    },
    createElement: (tag) => {
      const node = element(tag);
      node.ownerDocument = doc;
      return node;
    },
    getElementById() { return null; },
    querySelector() { return null; },
  };
  const root = element("aside");
  root.ownerDocument = doc;
  root.attrs["data-activity-feed"] = "";
  const line = element("p");
  line.attrs["data-activity-line"] = "";
  const role = element("p");
  role.attrs["data-activity-role"] = "";
  const when = element("p");
  when.attrs["data-activity-when"] = "";
  const badge = element("p");
  badge.attrs["data-activity-examples"] = "";
  const note = element("p");
  note.attrs["data-activity-note"] = "";
  const linkSlot = element("p");
  linkSlot.attrs["data-activity-link-slot"] = "";
  linkSlot.hidden = true;
  const link = element("a");
  link.attrs["data-activity-link"] = "";
  linkSlot.appendChild(link);
  const make = (tag, attr) => {
    const node = element(tag);
    node.attrs[attr] = "";
    node.ownerDocument = doc;
    return node;
  };
  const name = make("span", "data-activity-name");
  const org = make("span", "data-activity-org");
  const handle = make("span", "data-activity-handle");
  const platform = make("span", "data-activity-platform");
  const avatar = make("span", "data-activity-avatar");
  const monogram = make("span", "data-activity-monogram");
  avatar.appendChild(monogram);
  const live = make("span", "data-activity-live");
  const badges = make("span", "data-activity-badges");
  const stage = make("div", "data-activity-stage");
  const empty = make("div", "data-activity-empty");
  empty.hidden = true;
  const progress = make("div", "data-activity-progress");
  root.attrs["data-platforms"] = JSON.stringify({
    linkedin: { name: "LinkedIn", logo: "/assets/platforms/linkedin-in-bug.png" },
    x: { name: "X", logo: "/assets/platforms/x-logo-black.png" },
    reddit: { name: "Reddit", logo: "/assets/platforms/reddit-logo.png" },
    bluesky: { name: "Bluesky", logo: "/assets/platforms/bluesky-butterfly-blue.svg" },
  });
  const prev = element("button");
  prev.attrs["data-activity-prev"] = "";
  const next = element("button");
  next.attrs["data-activity-next"] = "";
  for (const child of [line, role, when, badge, note, linkSlot, prev, next, name, org, handle, platform, avatar, badges, live, stage, empty, progress]) root.appendChild(child);
  return { doc, root, line, role, when, badge, note, linkSlot, link, prev, next, name, org, handle, platform, avatar, badges, monogram, live, stage, empty, progress };
}

test("bundled examples stay inside the contract", () => {
  assert.equal(examples.example, true);
  assert.equal(examples.items, undefined);
  assert.ok(examples.data.length >= 60 && examples.data.length <= 80);
  const roles = new Set([
    "Solo founder",
    "Agency",
    "Open source maintainer",
    "DevRel",
    "Marketing manager",
    "Community manager",
    "Founder",
  ]);
  assert.equal(normalizePayload(examples).items.length, examples.data.length);
  for (const entry of examples.data) {
    assert.equal(validateItem(entry).ok, true);
    assert.equal(entry.category, "schedule");
    assert.equal(entry.action, "completed");
    assert.equal(entry.visibility, "public");
    assert.ok(PLATFORMS.includes(entry.platform));
    assert.ok(roles.has(entry.role));
    assert.match(entry.line, /^Example: /);
    assert.equal(entry.displayName, undefined);
    assert.equal(entry.avatarUrl, undefined);
    assert.equal(entry.publicProfileUrl, undefined);
    assert.equal(entry.line.includes("\u2014"), false);
    assert.ok(entry.createdAt < "2026-11-05");
    assert.doesNotMatch(entry.line, /just now|ago|followers|likes|impressions/i);
  }
});

test("sanitize accepts a clean example and strips control characters", () => {
  const cleaned = sanitizeItem(item({ line: "Example: a solo founder\u0000 shared a launch post on LinkedIn" }));
  assert.equal(cleaned.line, "Example: a solo founder shared a launch post on LinkedIn");
  assert.equal(cleaned.example, false);
});

test("validation rejects XSS urls, bad schemes, oversize text and unknown platforms", () => {
  const xss = "<img src=x onerror=alert(1)>";
  const text = sanitizeItem(item({ line: `Example: ${xss} on LinkedIn today` }));
  assert.equal(text.line.includes(xss), true);
  assert.equal(validateItem(item({ publicProfileUrl: "javascript:alert(1)" })).ok, false);
  assert.equal(validateItem(item({ publicProfileUrl: "JavaScript:alert(1)" })).ok, false);
  assert.equal(validateItem(item({ avatarUrl: "data:text/html,<script>alert(1)</script>" })).ok, false);
  assert.equal(validateItem(item({ publicProfileUrl: "http://example.com/a" })).ok, false);
  assert.equal(validateItem(item({ publicProfileUrl: "https://user:pass@example.com/a" })).ok, false);
  assert.equal(validateItem(item({ line: "x".repeat(121) })).ok, false);
  assert.equal(validateItem(item({ role: "A" })).ok, false);
  assert.equal(validateItem(item({ platform: "youtube" })).ok, false);
  assert.equal(validateItem(item({ platform: "LinkedIn" })).ok, false);
  assert.equal(validateItem(item({ extra: true })).ok, true); // unknown keys ignored
  assert.equal(validateItem(item({ visibility: "private" })).ok, false);
  assert.equal(validateItem(item({ completedAt: "2026-10-02T08:15:00Z" })).ok, true); // legacy key ignored
  assert.equal(validateItem(item({ id: "example-1" })).ok, false);
  assert.equal(validateItem(item({ userId: "example-account-1" })).ok, false);
  assert.equal(validateItem(item({ createdAt: "yesterday" })).ok, false);
  assert.equal(validateItem(item({ category: undefined })).ok, false);
  assert.equal(validateItem(item({ action: "" })).ok, false);
  assert.equal(validateItem("nope").ok, false);
});

test("paint uses textContent and a hardened profile link", () => {
  const view = card();
  const xss = "<img src=x onerror=alert(1)>";
  paintActivity(view.root, item({
    line: `Example: ${xss} posted`,
    publicProfileUrl: "https://example.com/profile",
  }), { example: false, now: Date.parse("2026-10-02T08:17:00Z") });
  assert.equal(view.line.textContent, `Example: ${xss} posted`);
  assert.equal(view.when.textContent, "2m ago");
  assert.equal(view.when.attrs.datetime, "2026-10-02T08:15:00Z");
  assert.equal(view.root.attrs["data-state"], "live");
  assert.equal(view.live.hidden, false);
  const link = view.link;
  assert.equal(link.attrs.href, "https://example.com/profile");
  assert.equal(link.attrs.rel, "noopener noreferrer nofollow");
  assert.equal(link.attrs.target, "_blank");
  assert.equal(link.attrs["aria-label"], "View profile of Solo founder");
  assert.equal(view.name.textContent, "Solo founder");
  assert.equal(view.name.tag, "span");
  assert.equal(view.root.querySelector("[data-activity-name-link]"), null);

  paintActivity(view.root, item({ publicProfileUrl: "https://example.com/profile" }), { example: true });
  assert.equal(view.when.textContent, "Example activity");
  assert.equal(view.badge.hidden, false);
  assert.equal(view.live.hidden, true);
  assert.equal(view.root.attrs["data-state"], "examples");
  assert.equal(view.linkSlot.hidden, true);
  assert.equal(link.attrs.href, undefined);
  assert.equal(view.name.textContent, "Solo founder");
});

test("a new avatar hides the old face until it loads, and a stale error is ignored", () => {
  const view = card();
  const first = "https://pbs.twimg.com/profile/a.jpg";
  const second = "https://cdn.bsky.app/img/avatar/b.jpg";
  paintActivity(view.root, item({ displayName: "Ada Lovelace", avatarUrl: first }), { example: false });
  const img = view.avatar.children.find((child) => child.attrs["data-activity-avatar-img"] !== undefined);
  const fire = (type) => img.listeners.filter((entry) => entry.type === type).forEach((entry) => entry.fn());
  fire("load");
  assert.equal(img.hidden, false);

  paintActivity(view.root, item({ displayName: "Grace Hopper", avatarUrl: second }), { example: false });
  assert.equal(img.attrs.src, second);
  assert.equal(img.hidden, true);
  assert.equal(view.monogram.hidden, false);
  assert.equal(view.monogram.textContent, "GH");

  // An error that belongs to the earlier src must not hide the newer image.
  img.attrs.src = first;
  fire("error");
  assert.equal(img.attrs.src, first);
  img.attrs.src = second;
  fire("load");
  assert.equal(img.hidden, false);
  assert.equal(view.monogram.hidden, true);
  fire("error");
  assert.equal(img.hidden, true);
  assert.equal(view.monogram.hidden, false);
});

test("relativeTime covers each bucket and clamps the future", () => {
  const now = Date.parse("2026-11-09T12:00:00Z");
  assert.equal(relativeTime("2026-11-09T11:59:30Z", now), "just now");
  assert.equal(relativeTime("2026-11-09T12:05:00Z", now), "just now");
  assert.equal(relativeTime("2026-11-09T11:58:00Z", now), "2m ago");
  assert.equal(relativeTime("2026-11-09T11:59:10Z", now), "1m ago");
  assert.equal(relativeTime("2026-11-09T11:00:30Z", now), "59m ago");
  assert.equal(relativeTime("2026-11-09T11:00:01Z", now), "59m ago");
  assert.equal(relativeTime("2026-11-09T11:00:00Z", now), "1h ago");
  assert.equal(relativeTime("2026-11-09T09:00:00Z", now), "3h ago");
  assert.equal(relativeTime("2026-11-06T12:00:00Z", now), "3d ago");
  assert.equal(relativeTime("2026-11-02T08:00:00Z", now), "Nov 2");
  assert.equal(relativeTime("2025-12-31T08:00:00Z", now), "Dec 31, 2025");
  assert.equal(relativeTime("nope", now), "");
});

test("avatars load only from allowlisted https hosts and never for examples", () => {
  assert.ok(AVATAR_HOSTS.includes("avatars.githubusercontent.com"));
  assert.ok(AVATAR_HOSTS.includes("lh3.googleusercontent.com"));
  assert.equal(avatarAllowed("https://avatars.githubusercontent.com/u/1?v=4"), true);
  assert.equal(avatarAllowed("https://lh3.googleusercontent.com/a/photo"), true);
  assert.equal(avatarAllowed("https://PBS.twimg.com/a.jpg"), true);
  assert.equal(avatarAllowed("http://pbs.twimg.com/a.jpg"), false);
  assert.equal(avatarAllowed("https://evil.example/a.jpg"), false);
  assert.equal(avatarAllowed("https://pbs.twimg.com.evil.example/a.jpg"), false);
  assert.equal(avatarAllowed("javascript:alert(1)"), false);
  const url = "https://cdn.bsky.app/img/avatar/a.jpg";
  assert.equal(avatarFor({ avatarUrl: url, example: false }), url);
  assert.equal(avatarFor({ avatarUrl: url, example: true }), null);
  assert.equal(avatarFor({ example: false }), null);
});

test("monogram hue and initials are deterministic", () => {
  assert.equal(monogramHue("3999901e-1256-5af3-96c8-df2d7108ef88"), 0x3999901e % 12);
  assert.equal(monogramHue(UID), monogramHue(UID));
  assert.ok(Number.isInteger(monogramHue(UID)) && monogramHue(UID) >= 0 && monogramHue(UID) < 12);
  assert.equal(monogramHue(""), 0);
  assert.equal(initials("Open source maintainer"), "OS");
  assert.equal(initials("Agency"), "A");
  assert.equal(initials("@ada"), "A");
  assert.equal(initials("@ada.bsky.social"), "A");
  assert.equal(initials("- Ada"), "A");
  assert.equal(initials("🦊"), "🦊");
  assert.equal(initials("✨ ✨"), "✨");
  assert.equal(initials(""), "");
});

const badgeView = (view) => view.badges.children.map((badge) => ({
  className: badge.className,
  title: badge.attrs.title,
  label: badge.attrs["aria-label"],
  text: badge.textContent,
  src: badge.children[0] ? badge.children[0].attrs.src : undefined,
  alt: badge.children[0] ? badge.children[0].attrs.alt : undefined,
}));

test("paint shows name, org, platform, stacked network badges and the avatar or its fallback", () => {
  const view = card();
  paintActivity(view.root, item({
    platform: "x",
    displayName: "Ada Lovelace",
    organizationName: "Analytical",
    networks: ["X", "LinkedIn", "Bluesky", "Reddit"],
    avatarUrl: "https://pbs.twimg.com/profile/a.jpg",
  }), { example: false, now: Date.parse("2026-10-02T09:15:00Z") });
  assert.equal(view.name.textContent, "Ada Lovelace");
  assert.equal(view.org.textContent, " at Analytical");
  assert.equal(view.platform.textContent, "X");
  assert.equal(view.when.textContent, "1h ago");
  // Four networks past a cap of three: two logos in platform order, then +2.
  assert.deepEqual(badgeView(view), [
    { className: "af-platform-badge", title: "LinkedIn", label: undefined, text: "", src: "/assets/platforms/linkedin-in-bug.png", alt: "LinkedIn" },
    { className: "af-platform-badge", title: "X", label: undefined, text: "", src: "/assets/platforms/x-logo-black.png", alt: "X" },
    { className: "af-platform-badge af-badge-more", title: "Also on Reddit, Bluesky", label: "Also on Reddit, Bluesky", text: "+2", src: undefined, alt: undefined },
  ]);
  assert.equal(view.badges.hidden, false);
  const img = view.avatar.children.find((child) => child.attrs["data-activity-avatar-img"] !== undefined);
  assert.equal(img.attrs.src, "https://pbs.twimg.com/profile/a.jpg");
  assert.equal(img.attrs.alt, "");
  assert.equal(img.attrs.referrerpolicy, "no-referrer");
  assert.equal(img.attrs.crossorigin, undefined);
  assert.equal(img.hidden, true);
  assert.equal(view.monogram.hidden, false);
  img.listeners.find((entry) => entry.type === "load").fn();
  assert.equal(img.hidden, false);
  assert.equal(view.monogram.hidden, true);
  img.listeners.find((entry) => entry.type === "error").fn();
  assert.equal(img.hidden, true);
  assert.equal(view.monogram.hidden, false);

  paintActivity(view.root, item({ avatarUrl: "https://evil.example/a.jpg" }), { example: false });
  assert.equal(img.hidden, true);
  assert.equal(view.monogram.hidden, false);
  assert.equal(view.monogram.textContent, "SF");
  assert.equal(view.monogram.className, `af-monogram af-hue-${monogramHue(UID)}`);
  assert.equal(view.org.hidden, true);
  assert.equal(view.platform.textContent, "LinkedIn");
});

test("paintEmpty shows the designed empty state and progress caps at 8 dots", () => {
  const view = card();
  const classes = () => view.progress.children.map((dot) => dot.className);
  paintProgress(view.root, 9, 75);
  assert.equal(view.progress.children.length, 8);
  // Window starts at 6, so item 9 is the fourth dot; more lie on both sides.
  assert.equal(classes()[3], "af-swatch is-active");
  assert.equal(classes()[0], "af-swatch af-dot-edge");
  assert.equal(classes()[7], "af-swatch af-dot-edge");
  paintProgress(view.root, 0, 75);
  assert.equal(classes()[0], "af-swatch is-active");
  assert.equal(classes()[7], "af-swatch af-dot-edge");
  paintProgress(view.root, 74, 75);
  assert.equal(classes()[7], "af-swatch is-active");
  assert.equal(classes()[0], "af-swatch af-dot-edge");
  paintProgress(view.root, 2, 5);
  assert.deepEqual(classes(), ["af-swatch", "af-swatch", "af-swatch is-active", "af-swatch", "af-swatch"]);
  paintProgress(view.root, 0, 1);
  assert.equal(view.progress.children.length, 0);
  paintEmpty(view.root);
  assert.equal(view.root.attrs["data-state"], "empty");
  assert.equal(view.stage.hidden, true);
  assert.equal(view.empty.hidden, false);
  assert.equal(view.badge.hidden, true);
  assert.equal(view.live.hidden, true);
  assert.equal(view.linkSlot.hidden, true);
});

test("empty and malformed payloads fall back", async () => {
  const fallback = payload([item()]);
  // Cloud's feed is empty today: a valid page with no data.
  const empty = await createFeedSource({
    transport: async () => response(200, { page: 0, pageSize: 20, totalCount: 0, data: [] }),
    fallback,
  }).load();
  assert.equal(empty.fromFallback, true);
  assert.equal(empty.reason, "empty");
  assert.equal(empty.example, true);
  assert.equal(empty.items[0].id, EID(1));

  const malformed = await createFeedSource({
    transport: async () => response(200, "{"),
    fallback,
  }).load();
  assert.equal(malformed.reason, "malformed");
  assert.equal(malformed.fromFallback, true);

  const arrayBody = await createFeedSource({
    transport: async () => response(200, []),
    fallback,
  }).load();
  assert.equal(arrayBody.fromFallback, true);
  assert.equal(arrayBody.reason, "invalid");

  const dropped = normalizePayload(live([item({ platform: "tiktok" }), item({ id: EID(2) })]));
  assert.equal(dropped.dropped, 1);
  assert.equal(dropped.items.length, 1);
  assert.equal(dropped.items[0].id, EID(2));
  assert.equal(dropped.items[0].example, false);

  const allBad = await createFeedSource({
    transport: async () => response(200, live([{ id: "nope" }])),
    fallback,
  }).load();
  assert.equal(allBad.reason, "invalid");
  assert.equal(allBad.fromFallback, true);
});

test("a page that is not an EventFeedPage yields no items", () => {
  const good = live([item()]);
  assert.equal(normalizePayload(good).valid, true);
  assert.equal(normalizePayload(good).items.length, 1);
  assert.equal(normalizePayload(live([])).valid, true);
  // The retired envelope has no `data`, so it is invalid.
  assert.equal(normalizePayload({ version: 1, sample: false, generatedAt: "2026-11-04T18:00:00Z", items: [item()] }).valid, false);
  // An unknown sibling key beside a valid EventFeedPage is ignored.
  assert.equal(normalizePayload({ ...good, items: [item()] }).valid, true);
  const { data, ...noData } = good;
  assert.equal(normalizePayload(noData).valid, false);
  assert.equal(normalizePayload({ ...good, page: -1 }).valid, false);
  assert.equal(normalizePayload({ ...good, page: 1.5 }).valid, false);
  assert.equal(normalizePayload({ ...good, pageSize: 0 }).valid, false);
  assert.equal(normalizePayload({ ...good, pageSize: 51 }).valid, false);
  assert.equal(normalizePayload({ ...good, totalCount: "1" }).valid, false);
  assert.equal(normalizePayload({ ...good, example: "yes" }).valid, false);
  assert.equal(normalizePayload(live(Array.from({ length: 51 }, (_, i) => item({ id: EID(i + 1) })), { pageSize: 50 })).valid, false);
  assert.equal(normalizePayload(null).valid, false);
});

test("timeout, network error and 500 use the fallback", async () => {
  const fallback = payload([item()]);
  let fire;
  const cleared = [];
  const timed = createFeedSource({
    timeoutMs: 5000,
    setTimer(fn) { fire = fn; return 7; },
    clearTimer(id) { cleared.push(id); },
    transport: () => new Promise(() => {}),
    fallback,
  });
  const pending = timed.load();
  fire();
  const timeout = await pending;
  assert.equal(timeout.reason, "timeout");
  assert.equal(timeout.fromFallback, true);
  assert.equal(timed.memory, null);
  assert.deepEqual(cleared, [7]);

  const network = await createFeedSource({
    transport: async () => { throw new TypeError("offline"); },
    fallback,
  }).load();
  assert.equal(network.reason, "network");
  assert.equal(network.items[0].line, item().line);

  let calls = 0;
  const server = createFeedSource({
    transport: async () => {
      calls += 1;
      return response(500, { error: true });
    },
    fallback,
  });
  assert.equal((await server.load()).reason, "http");
  assert.equal((await server.load()).fromFallback, true);
  assert.equal(calls, 2);
});

test("429 waits for Retry-After seconds or an HTTP date", async () => {
  const fallback = payload([item()]);
  let now = Date.parse("2026-11-05T12:00:00Z");
  let calls = 0;
  const seconds = createFeedSource({
    now: () => now,
    transport: async () => {
      calls += 1;
      return response(429, "slow", { "retry-after": "30" });
    },
    fallback,
  });
  assert.equal((await seconds.load()).reason, "rate-limit");
  now += 29000;
  assert.equal((await seconds.load()).reason, "rate-limit");
  assert.equal(calls, 1);
  now += 1000;
  calls = 0;
  seconds.destroy();

  const dated = createFeedSource({
    now: () => now,
    transport: async () => {
      calls += 1;
      return response(429, "slow", { "retry-after": "Wed, 05 Nov 2026 12:02:00 GMT" });
    },
    fallback,
  });
  calls = 0;
  assert.equal((await dated.load()).reason, "rate-limit");
  now = Date.parse("2026-11-05T12:01:00Z");
  assert.equal((await dated.load()).fromFallback, true);
  assert.equal(calls, 1);
  now = Date.parse("2026-11-05T12:02:00Z");
  assert.equal((await dated.load()).reason, "rate-limit");
  assert.equal(calls, 2);

  const until = parseRetryAfter("45", 1000);
  assert.equal(until, 46000);
  assert.equal(parseRetryAfter("not-a-date", 1000), null);
});

test("transport is disabled by default and the first visit has no stored feed", async () => {
  const fallback = payload([item()]);
  const disabled = await createFeedSource({
    fallback,
    transport: null,
  }).load();
  assert.equal(disabled.reason, "disabled");

  const implicit = await createFeedSource({ fallback }).load();
  assert.equal(implicit.reason, "disabled");
  assert.equal(implicit.example, true);
  assert.equal(implicit.items.length, 1);

  const offline = await createFeedSource({
    transport: async () => { throw new TypeError("Failed to fetch"); },
    fallback,
  }).load();
  assert.equal(offline.reason, "network");
  assert.equal(offline.fromFallback, true);
  assert.equal(createFeedSource({ fallback }).memory, null);
});

test("the bundled collection is labelled as examples and is not kept as live", async () => {
  const fallback = payload([item()]);
  const source = createFeedSource({
    transport: async () => response(200, payload([item({ id: EID(5), line: "A founder shared a launch post on LinkedIn" })]), { "cache-control": "max-age=30" }),
    fallback,
  });
  const result = await source.load();
  assert.equal(result.reason, "live");
  assert.equal(result.fromFallback, false);
  assert.equal(result.example, true);
  assert.equal(result.items[0].example, true);
  assert.equal(result.ttlMs, 0);
  assert.equal(source.memory, null);
});

test("a live page is shown as live for its max-age", async () => {
  const source = createFeedSource({
    now: () => 1_000_000,
    transport: async () => response(200, live([item({ id: EID(6), line: "A founder shared a launch post on LinkedIn" })]), { "cache-control": "public, max-age=30" }),
    fallback: payload([item()]),
  });
  const result = await source.load();
  assert.equal(result.reason, "live");
  assert.equal(result.example, false);
  assert.equal(result.items[0].example, false);
  assert.equal(result.ttlMs, 30000);
  assert.equal(source.memory.length, 1);
});

test("a live page with no max-age is not held and shows the examples", async () => {
  const result = await createFeedSource({
    transport: async () => response(200, live([item({ id: EID(7) })])),
    fallback: payload([item()]),
  }).load();
  assert.equal(result.reason, "ttl");
  assert.equal(result.fromFallback, true);
  assert.equal(result.example, true);
});

test("feedTransport takes only an https URL and sends no credentials", async () => {
  assert.equal(feedTransport(null), null);
  assert.equal(feedTransport(""), null);
  assert.equal(feedTransport("http://cloud.example.test/api/events/feed"), null);
  assert.equal(feedTransport("javascript:alert(1)"), null);
  const calls = [];
  const transport = feedTransport("https://cloud.example.test/api/events/feed?page=0&pagesize=20", async (url, init) => {
    calls.push({ url, init });
    return response(200, live([]));
  });
  assert.equal(typeof transport, "function");
  await transport();
  assert.equal(calls[0].url, "https://cloud.example.test/api/events/feed?page=0&pagesize=20");
  assert.equal(calls[0].init.credentials, "omit");
  assert.equal(calls[0].init.headers.accept, "application/json");
});

test("max-age is capped at 30 seconds", () => {
  assert.equal(MAX_LIVE_TTL_MS, 30000);
  assert.equal(parseMaxAge("max-age=10"), 10000);
  assert.equal(parseMaxAge("public, max-age=30"), 30000);
  assert.equal(parseMaxAge("max-age=90, public"), 30000);
  assert.equal(parseMaxAge("max-age=0"), 0);
  assert.equal(parseMaxAge("no-store"), 0);
  assert.equal(parseMaxAge(null), 0);
});

test("live items expire at the TTL and refresh failure restores labeled examples", async () => {
  const writes = [];
  const touch = () => writes.push("write");
  globalThis.localStorage = { setItem: touch, getItem: touch };
  globalThis.sessionStorage = { setItem: touch, getItem: touch };
  globalThis.indexedDB = { open: touch };
  globalThis.caches = { open: touch, put: touch, match: touch };
  const fallback = payload([item({ id: EID(21) })]);
  const liveItem = item({ id: EID(11), line: "A founder shared a launch post on LinkedIn" });
  let now = 1_000_000;
  let calls = 0;
  let fail = false;
  const source = createFeedSource({
    now: () => now,
    fallback,
    transport: async () => {
      calls += 1;
      if (fail) throw new TypeError("offline");
      return response(200, live([liveItem]), { "cache-control": "max-age=90" });
    },
  });
  const first = await source.load();
  assert.equal(first.reason, "live");
  assert.equal(first.fromFallback, false);
  assert.equal(first.ttlMs, 30000);
  assert.equal(first.items[0].id, EID(11));
  assert.equal(source.memory[0].id, EID(11));
  const cached = await source.load();
  assert.equal(cached.reason, "live");
  assert.equal(calls, 1);
  now += 30000;
  fail = true;
  const expired = await source.load();
  assert.equal(expired.fromFallback, true);
  assert.equal(expired.example, true);
  assert.equal(expired.items[0].id, EID(21));
  assert.equal(expired.items[0].example, true);
  assert.equal(source.memory.some((entry) => entry.id === EID(11)), false);
  assert.equal(source.memory[0].example, true);
  assert.equal(writes.length, 0);
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
  delete globalThis.indexedDB;
  delete globalThis.caches;
});

test("an expired hold is replaced by labeled examples when there is no transport", async () => {
  let now = 0;
  const options = {
    now: () => now,
    fallback: payload([item({ id: EID(29) })]),
    transport: async () => response(200, live([item({ id: EID(19), line: "A founder shared a launch post on LinkedIn" })]), { "cache-control": "max-age=5" }),
  };
  const source = createFeedSource(options);
  const first = await source.load();
  assert.equal(first.items[0].id, EID(19));
  assert.equal(first.ttlMs, 5000);
  now = 5000;
  options.transport = null;
  const next = await source.load();
  assert.equal(next.reason, "disabled");
  assert.equal(next.fromFallback, true);
  assert.equal(next.example, true);
  assert.equal(next.items[0].id, EID(29));
  assert.equal(source.memory[0].id, EID(29));
  assert.equal(source.memory.some((entry) => entry.id === EID(19)), false);
});

test("rotation pauses for reduced motion, a hidden document and hover, and clears timers", () => {
  assert.equal(INTERVAL_MS, 8000);
  const scheduled = [];
  const cleared = [];
  let id = 0;
  const setTimer = (fn, ms) => {
    const handle = ++id;
    scheduled.push({ handle, ms, fn });
    return handle;
  };
  const clearTimer = (handle) => cleared.push(handle);
  let reduced = false;
  let hidden = false;
  const seen = [];
  const rotation = createRotation({
    count: 3,
    intervalMs: INTERVAL_MS,
    isReduced: () => reduced,
    isHidden: () => hidden,
    setTimer,
    clearTimer,
    onIndex: (index) => seen.push(index),
  });

  reduced = true;
  rotation.start();
  assert.equal(rotation.armed, false);
  assert.equal(scheduled.length, 0);
  assert.equal(rotation.next(), 1);
  assert.deepEqual(seen, [1]);
  assert.equal(rotation.armed, false);

  reduced = false;
  hidden = true;
  rotation.start();
  assert.equal(rotation.armed, false);
  hidden = false;
  rotation.onVisibility();
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].ms, 8000);
  assert.equal(rotation.armed, true);

  rotation.pause();
  assert.equal(rotation.armed, false);
  assert.equal(cleared.includes(scheduled[0].handle), true);
  rotation.resume();
  assert.equal(rotation.armed, true);

  hidden = true;
  rotation.onVisibility();
  assert.equal(rotation.armed, false);
  hidden = false;
  rotation.onVisibility();
  const last = scheduled[scheduled.length - 1];
  rotation.destroy();
  assert.equal(rotation.armed, false);
  assert.equal(cleared.includes(last.handle), true);
  const before = scheduled.length;
  rotation.start();
  rotation.next();
  assert.equal(scheduled.length, before);
});

test("mount cleans timers and listeners and does not write storage", async () => {
  const writes = [];
  const storage = new Proxy({}, {
    get: () => () => writes.push("write"),
  });
  globalThis.localStorage = storage;
  globalThis.sessionStorage = storage;
  globalThis.indexedDB = storage;
  globalThis.caches = storage;

  const view = card();
  const timers = [];
  const cleared = [];
  let seq = 0;
  const mounted = mountActivityFeed(view.root, {
    intervalMs: 5000,
    matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
    setTimer(fn, ms) {
      const handle = ++seq;
      timers.push({ handle, ms, fn });
      return handle;
    },
    clearTimer(handle) { cleared.push(handle); },
    source: createFeedSource({
      transport: null,
      fallback: payload([item(), item({ id: EID(2), line: "Example: an agency published a release note on X" })]),
    }),
  });  assert.equal(view.root.style.props["--af-interval"], "5000ms");

  const result = await mounted.ready;
  assert.equal(result.reason, "disabled");
  assert.equal(view.root.classList.contains("is-ready"), true);
  assert.equal(view.line.textContent.includes("solo founder"), true);
  assert.equal(view.doc.listeners.some((entry) => entry.type === "visibilitychange"), true);
  view.next.listeners.find((entry) => entry.type === "click").fn();
  assert.equal(view.line.textContent.includes("agency"), true);
  mounted.destroy();
  assert.equal(view.doc.listeners.length, 0);
  mounted.destroy();
  assert.equal(writes.length, 0);
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
  delete globalThis.indexedDB;
  delete globalThis.caches;
});

test("runtime source has no endpoint and no web storage", () => {
  assert.equal(/localStorage|sessionStorage|indexedDB|serviceWorker|caches\.put|caches\.open/.test(sourceText), false);
  assert.equal(/\/api\/public|api\.blowhorn|layer5\.io\/|events\/feed/.test(sourceText), false);
  assert.equal(/https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(sourceText), false);
  assert.equal(boot({ documentElement: { dataset: { activityFeedBoot: "off" } }, querySelector() { return {}; } }), null);
});

test("a single network shows one badge, and no networks falls back to the platform", () => {
  const view = card();
  paintActivity(view.root, item({ platform: "reddit", networks: ["Reddit"] }), { example: false });
  assert.deepEqual(badgeView(view).map((badge) => [badge.title, badge.src, badge.alt]), [
    ["Reddit", "/assets/platforms/reddit-logo.png", "Reddit"],
  ]);
  paintActivity(view.root, item({ platform: "x" }), { example: false });
  assert.deepEqual(badgeView(view).map((badge) => badge.src), ["/assets/platforms/x-logo-black.png"]);
  assert.equal(view.root.querySelector("[data-activity-networks]"), null);
});

test("three networks fit the cap, so all three show and no +N badge", () => {
  const view = card();
  paintActivity(view.root, item({ platform: "x", networks: ["Reddit", "X (Twitter)", "linkedin"] }), { example: false });
  assert.equal(BADGE_CAP, 3);
  assert.deepEqual(badgeView(view).map((badge) => badge.title), ["LinkedIn", "X", "Reddit"]);
  assert.equal(badgeView(view).some((badge) => badge.text.startsWith("+")), false);
});

test("an unknown network keeps a lettered badge named by its raw text", () => {
  const view = card();
  paintActivity(view.root, item({ platform: "linkedin", networks: ["mastodon", "LinkedIn", "Mastodon"] }), { example: false });
  assert.deepEqual(badgeView(view), [
    { className: "af-platform-badge", title: "LinkedIn", label: undefined, text: "", src: "/assets/platforms/linkedin-in-bug.png", alt: "LinkedIn" },
    { className: "af-platform-badge af-badge-initial", title: "mastodon", label: "mastodon", text: "M", src: undefined, alt: undefined },
  ]);
});

test("networks resolve by id or name, dedupe and order by the platform list", () => {
  const map = {
    linkedin: { name: "LinkedIn", logo: "/l.png" },
    x: { name: "X", logo: "/x.png" },
    bluesky: { name: "Bluesky", logo: "/b.png" },
  };
  assert.deepEqual(resolveNetwork("X (Twitter)", map), { id: "x", name: "X", logo: "/x.png" });
  assert.deepEqual(resolveNetwork("bluesky", map), { id: "bluesky", name: "Bluesky", logo: "/b.png" });
  assert.deepEqual(resolveNetwork("Threads", map), { id: null, name: "Threads", logo: "" });
  const nets = networksFor(item({ networks: ["Threads", "Bluesky", "x", "X", "LinkedIn", "threads", "Kbin"] }), map);
  assert.deepEqual(nets.map((net) => net.name), ["LinkedIn", "X", "Bluesky", "Threads", "Kbin"]);
  assert.deepEqual(networksFor(item({ platform: "bluesky", networks: [] }), map).map((net) => net.id), ["bluesky"]);
  assert.deepEqual(networksFor(null, map), []);
  const four = badgeStack(nets.slice(0, 4));
  assert.deepEqual([four.shown.length, four.hidden.map((net) => net.name)], [2, ["Bluesky", "Threads"]]);
  assert.deepEqual(badgeStack(nets.slice(0, 3)).hidden, []);
});

test("an organization that is the account itself is not repeated after the name", () => {
  const view = card();
  paintActivity(view.root, item({ displayName: "Layer5", organizationName: "layer5" }), { example: false });
  assert.equal(view.name.textContent, "Layer5");
  assert.equal(view.org.textContent, "");
});

test("a TTL refresh keeps the shown item and the rotation's running interval", async () => {
  const view = card();
  let clock = 0;
  let seq = 0;
  const timers = new Map();
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const rows = Array.from({ length: 6 }, (_, n) => item({ id: EID(n + 1), line: `Example: row number ${n}` }));
  const base = await createFeedSource({ transport: null, fallback: payload(rows) }).load();
  let loads = 0;
  const mounted = mountActivityFeed(view.root, {
    intervalMs: 8000,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    setTimer(fn, ms) {
      const handle = ++seq;
      timers.set(handle, { at: clock + ms, fn });
      return handle;
    },
    clearTimer(handle) { timers.delete(handle); },
    source: { load: async () => { loads += 1; return { items: base.items, ttlMs: 30000 }; } },
  });
  await mounted.ready;
  const shownRow = () => Number(/row number (\d)/.exec(view.line.textContent)[1]);
  const seen = [shownRow()];
  for (let t = 500; t <= 48000; t += 500) {
    clock = t;
    for (const [handle, timer] of [...timers].sort((a, b) => a[1].at - b[1].at)) {
      if (timer.at > clock || !timers.has(handle)) continue;
      timers.delete(handle);
      timer.fn();
    }
    await flush();
    await flush();
    if (shownRow() !== seen[seen.length - 1]) seen.push(shownRow());
  }
  assert.equal(loads, 2);
  assert.deepEqual(seen, [0, 1, 2, 3, 4, 5]);
  mounted.destroy();
});

test("a handle shows next to a displayName, stands in for a missing one, and a bad one is dropped", () => {
  const named = sanitizeItem(item({ displayName: "Ada Lovelace", handle: "@ada" }));
  assert.equal(named.handle, "ada");
  const view = card();
  paintActivity(view.root, { ...named, example: false }, { example: false });
  assert.equal(view.name.textContent, "Ada Lovelace");
  assert.equal(view.handle.textContent, "@ada");
  assert.equal(view.handle.hidden, false);

  const handleOnly = sanitizeItem(item({ handle: "ada.bsky.social" }));
  paintActivity(view.root, { ...handleOnly, example: false }, { example: false });
  assert.equal(view.name.textContent, "@ada.bsky.social");
  assert.equal(view.monogram.textContent, "A");
  assert.equal(view.handle.hidden, true);

  const roleOnly = sanitizeItem(item({ handle: "two words<script>" }));
  assert.ok(roleOnly, "a malformed handle keeps the row");
  assert.equal(roleOnly.handle, undefined);
  paintActivity(view.root, { ...roleOnly, example: false }, { example: false });
  assert.equal(view.name.textContent, "Solo founder");
  assert.equal(view.handle.hidden, true);
});

test("a displayName up to the v1.3.117 limit paints with no handle, and the handle slot stays hidden", () => {
  assert.equal(LIMITS.name, 200);
  const longest = "A".repeat(200);
  const named = sanitizeItem(item({ displayName: longest }));
  assert.ok(named, "a 200-character displayName is in the contract");
  assert.equal(named.displayName, longest);
  assert.equal(named.handle, undefined, "no handle is invented from other fields");

  const view = card();
  view.handle.textContent = "@stale";
  view.handle.hidden = false;
  paintActivity(view.root, { ...named, example: false }, { example: false });
  assert.equal(view.name.textContent, longest);
  assert.equal(view.handle.textContent, "");
  assert.equal(view.handle.hidden, true);

  assert.equal(sanitizeItem(item({ displayName: "A".repeat(201) })), null);
});

test("fallback for 429 and network error provides retry ttlMs and schedules a refresh", async () => {
  const fallback = payload([item({ id: EID(99), line: "Example: bundled fallback line" })]);
  const liveItem = item({ id: EID(50), line: "Live: live activity line" });
  let clock = 1_000_000;
  let calls = 0;
  const timers = new Map();
  let seq = 0;

  const source = createFeedSource({
    now: () => clock,
    rateLimitFallbackMs: 60000,
    transport: async () => {
      calls += 1;
      if (calls === 1) return response(429, "rate limited", { "retry-after": "30" });
      return response(200, live([liveItem]), { "cache-control": "max-age=30" });
    },
    fallback,
  });

  const res1 = await source.load();
  assert.equal(res1.reason, "rate-limit");
  assert.equal(res1.ttlMs, 30000);

  const view = card();
  const mounted = mountActivityFeed(view.root, {
    source,
    now: () => clock,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    setTimer(fn, ms) {
      const handle = ++seq;
      timers.set(handle, { at: clock + ms, fn });
      return handle;
    },
    clearTimer(handle) { timers.delete(handle); },
  });

  await mounted.ready;
  assert.equal(view.line.textContent, "Example: bundled fallback line");
  assert.equal(view.root.attrs["data-state"], "examples");

  clock += 30000;
  for (const [handle, timer] of [...timers]) {
    if (timer.at <= clock) {
      timers.delete(handle);
      timer.fn();
    }
  }

  // Allow promise chain (source.load() and showResult()) to finish
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(view.line.textContent, "Live: live activity line");
  assert.equal(view.root.attrs["data-state"], "live");
  mounted.destroy();

  const netSource = createFeedSource({
    rateLimitFallbackMs: 45000,
    transport: async () => { throw new TypeError("Failed to fetch"); },
    fallback,
  });
  const netRes = await netSource.load();
  assert.equal(netRes.reason, "network");
  assert.equal(netRes.ttlMs, 45000);
});

test("validation treats null optional fields as absent instead of failing the item", () => {
  const itemWithNulls = item({
    avatarUrl: null,
    displayName: null,
    organizationName: null,
    publicProfileUrl: null,
    networks: null,
    handle: null,
  });

  const res = validateItem(itemWithNulls);
  assert.equal(res.ok, true);
  assert.equal(res.item.avatarUrl, undefined);
  assert.equal(res.item.displayName, undefined);
  assert.equal(res.item.organizationName, undefined);
  assert.equal(res.item.publicProfileUrl, undefined);
  assert.equal(res.item.networks, undefined);
  assert.equal(res.item.handle, undefined);

  assert.equal(avatarFor(res.item), null);

  const normalized = normalizePayload(live([itemWithNulls]));
  assert.equal(normalized.valid, true);
  assert.equal(normalized.dropped, 0);
  assert.equal(normalized.items.length, 1);
});
