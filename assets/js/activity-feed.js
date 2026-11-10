/* Hero activity card. Pure helpers are exported for node:test.
   Items and the page envelope mirror EventFeedItem and EventFeedPage from
   meshery/schemas v1.3.117 (schemas/event_feed_page.schema.json).
   The feed URL is not in this file: the partial puts it in the card's
   data-feed-url from params.cloud_url, and boot turns it into the
   transport. With no URL the card shows the bundled examples. Live items
   stay in memory only until Cache-Control max-age, and never longer than
   30 seconds. They are not an offline fallback. This file does not
   persist anything. */
export const PLATFORMS = Object.freeze([
  "linkedin",
  "x",
  "reddit",
  "hacker-news",
  "slack",
  "bluesky",
  "github",
]);

export const LIMITS = Object.freeze({
  category: 500,
  action: 500,
  pageSize: 50,
  roleMin: 3,
  roleMax: 40,
  lineMin: 10,
  lineMax: 120,
  name: 200,
  handle: 64,
  organization: 255,
  network: 255,
  networks: 20,
  url: 500,
  profileUrl: 2048,
});

export const INTERVAL_MS = 8000;
// Outgoing fade, then the incoming stagger; about 420ms end to end.
export const SWAP_MS = 160;
export const ENTER_MS = 300;
export const MAX_LIVE_TTL_MS = 30000;
const RATE_LIMIT_FALLBACK_MS = 60000;
const HTTPS = "https:";
const DATE_TIME = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?([Zz]|[+-]([01][0-9]|2[0-3]):[0-5][0-9])$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLATFORM_SET = new Set(PLATFORMS);
const HANDLE = /^[A-Za-z0-9._:\/-]+$/;
const ITEM_KEYS = new Set([
  "id",
  "userId",
  "category",
  "action",
  "createdAt",
  "platform",
  "role",
  "line",
  "networks",
  "displayName",
  "handle",
  "avatarUrl",
  "organizationName",
  "publicProfileUrl",
  "visibility",
]);
const PAGE_KEYS = new Set(["page", "pageSize", "totalCount", "data", "example", "$schema"]);

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function stripControls(value) {
  return String(value).replace(CONTROL, "").replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
}

function fail(reason) {
  return { ok: false, reason };
}

export function isHttpsUrl(value, max = LIMITS.url) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return false;
  if (trimmed !== stripControls(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return false;
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }
  return url.protocol === HTTPS && url.username === "" && url.password === "" && !!url.hostname;
}

function plain(value, min, max) {
  if (typeof value !== "string") return null;
  const text = stripControls(value);
  if (text.length < min || text.length > max) return null;
  if (text.includes("\u2014")) return null;
  return text;
}

export function validateItem(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail("type");
  // Unknown keys are ignored so a Cloud schema addition does not blank the card.
  const id = typeof input.id === "string" && UUID.test(input.id) ? input.id : null;
  const userId = typeof input.userId === "string" && UUID.test(input.userId) ? input.userId : null;
  const category = plain(input.category, 1, LIMITS.category);
  const action = plain(input.action, 1, LIMITS.action);
  const role = plain(input.role, LIMITS.roleMin, LIMITS.roleMax);
  const line = plain(input.line, LIMITS.lineMin, LIMITS.lineMax);
  if (!id || !userId || !category || !action || !role || !line) return fail("text");
  if (typeof input.platform !== "string" || !PLATFORM_SET.has(input.platform)) return fail("platform");
  if (input.visibility !== "public") return fail("visibility");
  if (typeof input.createdAt !== "string" || !DATE_TIME.test(input.createdAt)) return fail("createdAt");

  const item = {
    id,
    userId,
    category,
    action,
    platform: input.platform,
    role,
    line,
    createdAt: input.createdAt,
    visibility: "public",
    example: false,
  };

  if (input.networks !== undefined) {
    if (!Array.isArray(input.networks) || input.networks.length < 1 || input.networks.length > LIMITS.networks) {
      return fail("networks");
    }
    const networks = [];
    for (const entry of input.networks) {
      const name = plain(entry, 1, LIMITS.network);
      if (!name) return fail("networks");
      networks.push(name);
    }
    item.networks = networks;
  }

  if (input.displayName !== undefined) {
    const displayName = plain(input.displayName, 1, LIMITS.name);
    if (!displayName) return fail("displayName");
    item.displayName = displayName;
  }
  // handle is not in meshery/schemas and Cloud does not send it; it is a local
  // extension kept for forward compatibility. Without one the handle slot stays
  // hidden. A malformed one is dropped, not the row.
  if (input.handle !== undefined) {
    const handle = typeof input.handle === "string" ? plain(input.handle.replace(/^@+/, ""), 1, LIMITS.handle) : null;
    if (handle && HANDLE.test(handle)) item.handle = handle;
  }
  if (input.organizationName !== undefined) {
    const organizationName = plain(input.organizationName, 1, LIMITS.organization);
    if (!organizationName) return fail("organizationName");
    item.organizationName = organizationName;
  }
  if (input.avatarUrl !== undefined) {
    if (!isHttpsUrl(input.avatarUrl)) return fail("avatarUrl");
    item.avatarUrl = input.avatarUrl.trim();
  }
  if (input.publicProfileUrl !== undefined) {
    if (!isHttpsUrl(input.publicProfileUrl, LIMITS.profileUrl)) return fail("publicProfileUrl");
    item.publicProfileUrl = input.publicProfileUrl.trim();
  }
  return { ok: true, item };
}

export function sanitizeItem(input) {
  const result = validateItem(input);
  return result.ok ? result.item : null;
}

function isCount(value, min) {
  return Number.isInteger(value) && value >= min;
}

/* A page is valid when it is an EventFeedPage: page, pageSize and totalCount
   are integers in range and data is an array of at most pageSize items. The
   bundled examples carry `example: true` in place of the paging fields.
   An invalid page yields no items, so the caller falls back. */
export function normalizePayload(payload) {
  const empty = { items: [], example: false, dropped: 0, rawCount: 0, valid: false };
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return empty;
  // Unknown page keys are ignored; required EventFeedPage fields are checked below.
  if (payload.example !== undefined && typeof payload.example !== "boolean") return empty;
  const example = payload.example === true;
  if (!Array.isArray(payload.data)) return empty;
  if (!example) {
    if (!isCount(payload.page, 0) || !isCount(payload.totalCount, 0)) return empty;
    if (!isCount(payload.pageSize, 1) || payload.pageSize > LIMITS.pageSize) return empty;
    if (payload.data.length > LIMITS.pageSize) return empty;
  }
  const items = [];
  let dropped = 0;
  for (const rawItem of payload.data) {
    const cleaned = sanitizeItem(rawItem);
    if (!cleaned) {
      dropped += 1;
      continue;
    }
    cleaned.example = example;
    items.push(cleaned);
  }
  return { items, example, dropped, rawCount: payload.data.length, valid: true };
}

export function parseMaxAge(header, capMs = MAX_LIVE_TTL_MS) {
  if (header == null) return 0;
  const match = /(?:^|,)\s*max-age\s*=\s*(\d+)/i.exec(String(header));
  if (!match) return 0;
  return Math.min(Number(match[1]) * 1000, capMs);
}

export function parseRetryAfter(header, nowMs) {
  if (header == null) return null;
  const trimmed = String(header).trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return nowMs + Number(trimmed) * 1000;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function asPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { example: true, data: [] };
  return value;
}

export function createFeedSource(options = {}) {
  const fallback = asPayload(options.fallback);
  const timeoutMs = options.timeoutMs ?? 8000;
  const now = options.now ?? (() => Date.now());
  const setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = options.clearTimer ?? ((id) => clearTimeout(id));
  const rateLimitFallbackMs = options.rateLimitFallbackMs ?? RATE_LIMIT_FALLBACK_MS;
  let retryNotBefore = 0;
  let memory = null;
  let timer = null;
  let epoch = 0;

  function exampleHold() {
    const normalized = normalizePayload(fallback);
    return { items: normalized.items, live: false, example: normalized.example, expiresAt: null };
  }

  function finishFallback(reason, replaceLive, waitMs = 0) {
    const normalized = normalizePayload(fallback);
    if (replaceLive) memory = exampleHold();
    return {
      items: normalized.items,
      example: normalized.example,
      reason,
      fromFallback: true,
      ttlMs: waitMs,
    };
  }

  function presentLive(hold) {
    return {
      items: hold.items,
      example: hold.example,
      reason: "live",
      fromFallback: false,
      ttlMs: Math.max(0, hold.expiresAt - now()),
    };
  }

  async function handleResponse(response, replaceLive) {
    const status = Number(response && response.status);
    if (status === 429) {
      const header = response.headers && response.headers.get ? response.headers.get("retry-after") : null;
      const until = parseRetryAfter(header, now());
      retryNotBefore = until == null ? now() + rateLimitFallbackMs : until;
      const waitMs = Math.max(0, retryNotBefore - now()) || rateLimitFallbackMs;
      return finishFallback("rate-limit", replaceLive, waitMs);
    }
    if (!status || status < 200 || status >= 300) return finishFallback("http", replaceLive, rateLimitFallbackMs);
    let payload;
    try {
      payload = await response.json();
    } catch {
      return finishFallback("malformed", replaceLive, rateLimitFallbackMs);
    }
    const normalized = normalizePayload(payload);
    if (!normalized.items.length) {
      return finishFallback(normalized.valid && normalized.rawCount === 0 ? "empty" : "invalid", replaceLive, rateLimitFallbackMs);
    }
    const liveItems = normalized.items.filter((item) => !item.example);
    const header = response.headers && response.headers.get ? response.headers.get("cache-control") : null;
    const ttlMs = liveItems.length ? parseMaxAge(header) : 0;
    if (!liveItems.length) {
      return {
        items: normalized.items,
        example: true,
        reason: "live",
        fromFallback: false,
        ttlMs: 0,
      };
    }
    if (ttlMs <= 0) return finishFallback("ttl", true, rateLimitFallbackMs);
    memory = {
      items: liveItems,
      live: true,
      example: false,
      expiresAt: now() + ttlMs,
    };
    return presentLive(memory);
  }

  function claimFresh() {
    if (!memory || !memory.live) return { fresh: null, expired: false };
    if (now() >= memory.expiresAt) {
      memory = null;
      return { fresh: null, expired: true };
    }
    return { fresh: memory, expired: false };
  }

  return {
    get memory() {
      return memory ? memory.items : null;
    },
    async load() {
      const gen = ++epoch;
      const claimed = claimFresh();
      if (claimed.fresh) return presentLive(claimed.fresh);
      const replaceLive = claimed.expired;
      const transport = Object.prototype.hasOwnProperty.call(options, "transport") ? options.transport : null;
      if (transport == null) return finishFallback("disabled", replaceLive);
      if (now() < retryNotBefore) {
        const waitMs = Math.max(0, retryNotBefore - now()) || rateLimitFallbackMs;
        return finishFallback("rate-limit", replaceLive, waitMs);
      }
      try {
        const response = await new Promise((resolve, reject) => {
          timer = setTimer(() => {
            const err = new Error("timeout");
            err.code = "TIMEOUT";
            reject(err);
          }, timeoutMs);
          Promise.resolve()
            .then(() => transport())
            .then(resolve, reject);
        });
        if (gen !== epoch) return finishFallback("destroyed", replaceLive);
        return await handleResponse(response, replaceLive);
      } catch (err) {
        if (gen !== epoch) return finishFallback("destroyed", replaceLive);
        if (err && err.code === "TIMEOUT") return finishFallback("timeout", replaceLive, rateLimitFallbackMs);
        return finishFallback("network", replaceLive, rateLimitFallbackMs);
      } finally {
        if (timer != null) {
          clearTimer(timer);
          timer = null;
        }
      }
    },
    destroy() {
      epoch += 1;
      if (timer != null) {
        clearTimer(timer);
        timer = null;
      }
    },
  };
}

export function createRotation(options = {}) {
  let count = options.count || 0;
  const intervalMs = options.intervalMs ?? INTERVAL_MS;
  const isReduced = options.isReduced ?? (() => false);
  const isHidden = options.isHidden ?? (() => false);
  const setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = options.clearTimer ?? ((id) => clearTimeout(id));
  const onIndex = options.onIndex ?? (() => {});
  // Told whether autoplay is armed, so the card can show or still its cue.
  const onState = options.onState ?? (() => {});
  let index = 0;
  let timer = null;
  let hoverPaused = false;
  let hidePaused = false;
  let destroyed = false;

  function canRun() {
    return !destroyed && !hoverPaused && !hidePaused && !isReduced() && !isHidden() && count >= 2;
  }

  function clear() {
    if (timer != null) {
      clearTimer(timer);
      timer = null;
    }
  }

  function arm() {
    clear();
    if (canRun()) {
      timer = setTimer(() => {
        timer = null;
        index = (index + 1) % count;
        onIndex(index, { manual: false });
        arm();
      }, intervalMs);
    }
    onState(timer != null);
  }

  function step(delta, manual) {
    if (count < 1) return index;
    index = (index + delta + count) % count;
    onIndex(index, { manual: !!manual });
    arm();
    return index;
  }

  return {
    start: arm,
    pause() {
      hoverPaused = true;
      clear();
      onState(false);
    },
    resume() {
      hoverPaused = false;
      arm();
    },
    onVisibility() {
      hidePaused = isHidden();
      if (hidePaused) {
        clear();
        onState(false);
      } else arm();
    },
    next() {
      return step(1, true);
    },
    prev() {
      return step(-1, true);
    },
    // A refreshed list: keep the running interval when autoplay can still run.
    sync(nextCount, nextIndex) {
      count = nextCount || 0;
      index = count ? Math.min(Math.max(nextIndex || 0, 0), count - 1) : 0;
      if (timer == null || !canRun()) arm();
    },
    destroy() {
      destroyed = true;
      clear();
      onState(false);
    },
    get index() {
      return index;
    },
    get armed() {
      return timer != null;
    },
  };
}

function slot(root, selector) {
  return root.querySelector(selector);
}

/* Avatar images load only from these hosts, over https, and only for live
   items. Bare hostnames: the third-party check reads URL-shaped strings. */
export const AVATAR_HOSTS = Object.freeze([
  "pbs.twimg.com",
  "abs.twimg.com",
  "avatars.githubusercontent.com",
  "media.licdn.com",
  "cdn.bsky.app",
  "avatars.slack-edge.com",
  "ca.slack-edge.com",
  "styles.redditmedia.com",
  "www.redditstatic.com",
  "cloud.blowhorn.ai",
]);
const AVATAR_HOST_SET = new Set(AVATAR_HOSTS);
const AVATAR_PX = 64;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MAX_DOTS = 8;

export function avatarAllowed(url) {
  if (!isHttpsUrl(url)) return false;
  return AVATAR_HOST_SET.has(new URL(url.trim()).hostname.toLowerCase());
}

/* The avatar a card may request, or null for the monogram. */
export function avatarFor(item) {
  if (!item || item.example || !item.avatarUrl) return null;
  return avatarAllowed(item.avatarUrl) ? item.avatarUrl.trim() : null;
}

export const HUE_STEPS = 12;

/* Deterministic hue step (0-11, 30 degrees each) from a user id: its first
   8 hex digits mod 12. The card applies it as the class af-hue-<n>, so no
   inline style is needed; layouts/_partials/activity-feed.html applies the
   same rule to the static first example. */
export function monogramHue(userId) {
  const hex = String(userId || "").replace(/[^0-9a-f]/gi, "").slice(0, 8);
  if (!hex) return 0;
  return parseInt(hex, 16) % HUE_STEPS;
}

export function initials(name) {
  const words = String(name || "").split(/\s+/).map((word) => word.replace(/^[^\p{L}\p{N}]+/u, "")).filter(Boolean);
  if (!words.length) return Array.from(String(name || "").trim()).slice(0, 1).join("");
  return words.slice(0, 2).map((word) => Array.from(word)[0].toUpperCase()).join("");
}

export function relativeTime(iso, nowMs) {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const seconds = (nowMs - then) / 1000;
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 7) return `${days}d ago`;
  const date = new Date(then);
  const label = `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
  return date.getUTCFullYear() === new Date(nowMs).getUTCFullYear() ? label : `${label}, ${date.getUTCFullYear()}`;
}

export function displayName(item) {
  return (item && (item.displayName || (item.handle ? `@${item.handle}` : "") || item.role)) || "";
}

const platformCache = new WeakMap();
function platformsFor(root, flags) {
  if (flags && flags.platforms) return flags.platforms;
  if (platformCache.has(root)) return platformCache.get(root);
  let map = {};
  const raw = root.getAttribute ? root.getAttribute("data-platforms") : null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") map = parsed;
    } catch {
      map = {};
    }
  }
  platformCache.set(root, map);
  return map;
}

function clearChildren(node) {
  while (node.children ? node.children.length : node.firstChild) {
    node.removeChild(node.children ? node.children[0] : node.firstChild);
  }
}

function paintAvatar(root, item, name) {
  const media = slot(root, "[data-activity-avatar]");
  const monogram = slot(root, "[data-activity-monogram]");
  if (monogram) {
    monogram.textContent = initials(name);
    monogram.className = `af-monogram af-hue-${monogramHue(item && item.userId)}`;
  }
  if (!media) return;
  let img = slot(root, "[data-activity-avatar-img]");
  const url = avatarFor(item);
  if (!url) {
    if (img) {
      img.hidden = true;
      img.removeAttribute("src");
      img.removeAttribute("data-current");
    }
    if (monogram) monogram.hidden = false;
    return;
  }
  const doc = root.ownerDocument;
  if (!img) {
    img = doc.createElement("img");
    img.setAttribute("data-activity-avatar-img", "");
    img.className = "af-avatar-img";
    img.setAttribute("alt", "");
    img.setAttribute("referrerpolicy", "no-referrer");
    img.setAttribute("decoding", "async");
    img.setAttribute("width", String(AVATAR_PX));
    img.setAttribute("height", String(AVATAR_PX));
    img.addEventListener("load", () => {
      if (img.getAttribute("src") !== img.getAttribute("data-current")) return;
      img.hidden = false;
      const mono = slot(root, "[data-activity-monogram]");
      if (mono) mono.hidden = true;
    });
    img.addEventListener("error", () => {
      // A late error for an earlier src must not hide the current image.
      if (img.getAttribute("src") !== img.getAttribute("data-current")) return;
      img.hidden = true;
      img.removeAttribute("src");
      const mono = slot(root, "[data-activity-monogram]");
      if (mono) mono.hidden = false;
    });
    media.appendChild(img);
  }
  if (img.getAttribute("data-current") === url && img.getAttribute("src") === url) return;
  // Show the new person's monogram until their own picture has loaded, so the
  // previous face never sits next to the new name.
  img.hidden = true;
  if (monogram) monogram.hidden = false;
  img.setAttribute("data-current", url);
  img.setAttribute("src", url);
  if (img.complete && img.naturalWidth > 0) {
    img.hidden = false;
    if (monogram) monogram.hidden = true;
  }
}

function paintNetworks(root, item) {
  const list = slot(root, "[data-activity-networks]");
  if (!list) return;
  clearChildren(list);
  const doc = root.ownerDocument;
  // One network is the platform the meta line already names, so chips show
  // only for a cross-network activity.
  const networks = item && item.networks && item.networks.length > 1 ? item.networks : [];
  for (const name of networks.slice(0, 3)) {
    const chip = doc.createElement("li");
    chip.className = "af-chip";
    chip.textContent = name;
    list.appendChild(chip);
  }
  list.hidden = list.children.length === 0;
}

export function paintActivity(root, item, flags = {}) {
  const example = !!(flags.example || (item && item.example));
  const nowMs = flags.now != null ? flags.now : Date.now();
  const name = displayName(item);
  const platforms = platformsFor(root, flags);
  const platform = (item && platforms[item.platform]) || null;
  if (root.setAttribute) root.setAttribute("data-state", example ? "examples" : "live");

  const stage = slot(root, "[data-activity-stage]");
  const empty = slot(root, "[data-activity-empty]");
  if (stage) stage.hidden = false;
  if (empty) empty.hidden = true;

  const line = slot(root, "[data-activity-line]");
  const role = slot(root, "[data-activity-role]");
  const nameSlot = slot(root, "[data-activity-name]");
  const org = slot(root, "[data-activity-org]");
  const when = slot(root, "[data-activity-when]");
  const platformName = slot(root, "[data-activity-platform]");
  const platformLogo = slot(root, "[data-activity-platform-logo]");
  const badge = slot(root, "[data-activity-examples]");
  const live = slot(root, "[data-activity-live]");
  const note = slot(root, "[data-activity-note]");
  if (line) line.textContent = item && item.line ? item.line : "";
  if (role) role.textContent = item && item.role ? item.role : "";
  if (org) {
    // An organization's own account names itself; "Layer5 at Layer5" says nothing.
    const rawOrg = item && item.organizationName ? item.organizationName : "";
    const orgName = rawOrg && rawOrg.toLowerCase() !== name.toLowerCase() ? rawOrg : "";
    org.textContent = orgName ? ` at ${orgName}` : "";
    org.hidden = !orgName;
  }
  if (when) {
    when.textContent = example ? "Example activity" : (item && item.createdAt ? relativeTime(item.createdAt, nowMs) : "");
    if (item && item.createdAt) when.setAttribute("datetime", item.createdAt);
    else when.removeAttribute("datetime");
  }
  const handleSlot = slot(root, "[data-activity-handle]");
  if (handleSlot) {
    // The name line already carries the handle when there is no displayName.
    const handle = item && item.handle && item.displayName ? `@${item.handle}` : "";
    handleSlot.textContent = handle;
    handleSlot.hidden = !handle;
  }
  if (platformName) platformName.textContent = platform && platform.name ? platform.name : (item && item.platform) || "";
  if (platformLogo && platform && platform.logo) platformLogo.setAttribute("src", platform.logo);
  if (badge) badge.hidden = !example;
  if (live) live.hidden = example;
  if (note) note.hidden = !example;
  paintAvatar(root, item, name);
  paintNetworks(root, item);

  const showLink = !!(item && item.publicProfileUrl && isHttpsUrl(item.publicProfileUrl, LIMITS.profileUrl) && !example);
  const href = showLink ? item.publicProfileUrl.trim() : null;
  if (nameSlot) nameSlot.textContent = name;

  const linkSlot = slot(root, "[data-activity-link-slot]");
  const link = slot(root, "[data-activity-link]");
  if (!linkSlot || !link) return;
  if (!href) {
    linkSlot.hidden = true;
    link.removeAttribute("href");
    link.removeAttribute("aria-label");
    return;
  }
  link.setAttribute("href", href);
  link.setAttribute("rel", "noopener noreferrer nofollow");
  link.setAttribute("target", "_blank");
  link.setAttribute("aria-label", `View profile of ${name}`);
  linkSlot.hidden = false;
}

export function paintEmpty(root) {
  if (root.setAttribute) root.setAttribute("data-state", "empty");
  const stage = slot(root, "[data-activity-stage]");
  const empty = slot(root, "[data-activity-empty]");
  if (stage) stage.hidden = true;
  if (empty) empty.hidden = false;
  for (const selector of ["[data-activity-examples]", "[data-activity-note]", "[data-activity-live]", "[data-activity-link-slot]"]) {
    const node = slot(root, selector);
    if (node) node.hidden = true;
  }
  const line = slot(root, "[data-activity-line]");
  if (line) line.textContent = "";
  const when = slot(root, "[data-activity-when]");
  if (when) when.textContent = "";
  const progress = slot(root, "[data-activity-progress]");
  if (progress) clearChildren(progress);
}

/* Swatch dots under the card: a sliding window of at most 8 that always
   holds the active one, ringed; an end dot is smaller when more items lie
   beyond it. They are aria-hidden and not interactive; Previous and Next are
   the controls. */
export function paintProgress(root, index, count) {
  const progress = slot(root, "[data-activity-progress]");
  if (!progress) return;
  const dots = count >= 2 ? Math.min(count, MAX_DOTS) : 0;
  const start = Math.max(0, Math.min(index - 3, count - dots));
  const doc = root.ownerDocument;
  const existing = progress.children ? progress.children.length : progress.childElementCount;
  if (existing !== dots) {
    clearChildren(progress);
    for (let i = 0; i < dots; i += 1) {
      const dot = doc.createElement("span");
      dot.className = "af-swatch";
      progress.appendChild(dot);
    }
  }
  const list = progress.children ? Array.from(progress.children) : [];
  list.forEach((dot, i) => {
    const classes = ["af-swatch"];
    if (start + i === index) classes.push("is-active");
    if ((i === 0 && start > 0) || (i === dots - 1 && start + dots < count)) classes.push("af-dot-edge");
    dot.className = classes.join(" ");
  });
}

/* Resolves when the avatar is cached (or failed) or after capMs, so a swap
   never waits long and the incoming avatar does not pop in. */
export function preloadAvatar(view, url, capMs = 400, setTimer = (fn, ms) => setTimeout(fn, ms)) {
  if (!url || !view || typeof view.Image !== "function") return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new view.Image();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    setTimer(() => finish(false), capMs);
    img.src = url;
  });
}

function listen(bag, target, type, fn) {
  if (!target || !target.addEventListener) return;
  target.addEventListener(type, fn);
  bag.push([target, type, fn]);
}

export function mountActivityFeed(root, options = {}) {
  const doc = root.ownerDocument;
  const view = doc.defaultView || (typeof window !== "undefined" ? window : null);
  const matchMedia = options.matchMedia || (view && view.matchMedia ? view.matchMedia.bind(view) : null);
  const reducedQuery = matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  let reduced = !!reducedQuery.matches;
  const source = options.source || createFeedSource({ transport: null, fallback: options.fallback });
  const setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = options.clearTimer ?? ((id) => clearTimeout(id));
  const now = options.now ?? (() => Date.now());
  const platforms = options.platforms || null;
  const intervalMs = options.intervalMs ?? INTERVAL_MS;
  // The progress ring draws in over the same interval the rotation arms.
  root.style.setProperty("--af-interval", `${intervalMs}ms`);
  const listeners = [];
  let items = [];
  let enterTimer = null;
  let swapGen = 0;
  let rotation = null;
  let swapTimer = null;
  let ttlTimer = null;
  let destroyed = false;

  function clearSwap() {
    if (swapTimer != null) {
      clearTimer(swapTimer);
      swapTimer = null;
    }
  }

  function clearTtl() {
    if (ttlTimer != null) {
      clearTimer(ttlTimer);
      ttlTimer = null;
    }
  }

  function clearEnter() {
    if (enterTimer != null) {
      clearTimer(enterTimer);
      enterTimer = null;
    }
    root.classList.remove("is-entering");
  }

  // Warm the cache for the row after this one, so its avatar is ready.
  function warmNext(index) {
    if (items.length < 2) return;
    const next = items[(index + 1) % items.length];
    preloadAvatar(view, avatarFor(next), 400, setTimer);
  }

  function apply(index) {
    const item = items[index];
    paintActivity(root, item, { example: item.example, now: now(), platforms });
    paintProgress(root, index, items.length);
    warmNext(index);
  }

  function show(index, animate) {
    const item = items[index];
    if (!item) {
      paintEmpty(root);
      return;
    }
    clearSwap();
    clearEnter();
    const gen = ++swapGen;
    if (!animate || reduced) {
      root.classList.remove("is-swap");
      apply(index);
      return;
    }
    root.classList.add("is-swap");
    const ready = preloadAvatar(view, avatarFor(item), 400, setTimer);
    const left = new Promise((resolve) => {
      swapTimer = setTimer(() => {
        swapTimer = null;
        resolve();
      }, SWAP_MS);
    });
    Promise.all([ready, left]).then(() => {
      if (destroyed || gen !== swapGen) return;
      apply(index);
      root.classList.remove("is-swap");
      root.classList.add("is-entering");
      enterTimer = setTimer(() => {
        enterTimer = null;
        root.classList.remove("is-entering");
      }, ENTER_MS);
    });
  }

  // The progress cue restarts on every armed interval and stills otherwise.
  function setPlaying(armed) {
    root.classList.remove("is-playing");
    if (!armed || destroyed) return;
    void root.offsetWidth;
    root.classList.add("is-playing");
  }

  function armRotation() {
    if (rotation) rotation.destroy();
    rotation = createRotation({
      count: items.length,
      intervalMs,
      isReduced: () => reduced,
      isHidden: () => !!doc.hidden,
      setTimer,
      clearTimer,
      onIndex: (index, meta) => show(index, !(meta && meta.manual)),
      onState: setPlaying,
    });
    rotation.start();
  }

  listen(listeners, doc, "visibilitychange", () => {
    if (rotation) rotation.onVisibility();
  });
  listen(listeners, root, "mouseenter", () => rotation && rotation.pause());
  listen(listeners, root, "mouseleave", () => rotation && rotation.resume());
  listen(listeners, root, "focusin", () => rotation && rotation.pause());
  listen(listeners, root, "focusout", (event) => {
    if (root.contains(event.relatedTarget)) return;
    if (rotation) rotation.resume();
  });
  listen(listeners, slot(root, "[data-activity-prev]"), "click", () => {
    if (rotation) rotation.prev();
  });
  listen(listeners, slot(root, "[data-activity-next]"), "click", () => {
    if (rotation) rotation.next();
  });
  if (reducedQuery.addEventListener) {
    const onMotion = () => {
      reduced = !!reducedQuery.matches;
      if (rotation) rotation.onVisibility();
      if (reduced) {
        root.classList.remove("is-swap");
        clearEnter();
      }
    };
    listen(listeners, reducedQuery, "change", onMotion);
  }

  function syncNav() {
    const nav = slot(root, ".activity-feed-nav");
    const prev = slot(root, "[data-activity-prev]");
    const next = slot(root, "[data-activity-next]");
    const showNav = items.length >= 2 && root.getAttribute("data-state") !== "empty";
    if (nav) nav.hidden = !showNav;
    for (const btn of [prev, next]) {
      if (!btn) continue;
      btn.hidden = !showNav;
      btn.disabled = !showNav;
    }
  }

  function showResult(result) {
    const shown = rotation ? items[rotation.index] : null;
    items = result.items || [];
    // A refresh keeps the shown item, repainted in place, and the rotation's timer.
    const kept = shown ? items.findIndex((entry) => entry.id === shown.id) : -1;
    if (kept >= 0) {
      show(kept, false);
      syncNav();
      rotation.sync(items.length, kept);
    } else {
      if (!items.length) paintEmpty(root);
      else show(0, false);
      syncNav();
      root.classList.add("is-ready");
      armRotation();
    }
    clearTtl();
    if (destroyed || !result.ttlMs) return;
    ttlTimer = setTimer(() => {
      ttlTimer = null;
      if (destroyed) return;
      Promise.resolve()
        .then(() => source.load())
        .then((next) => {
          if (!destroyed && next) showResult(next);
        });
    }, result.ttlMs);
  }

  const ready = Promise.resolve()
    .then(() => source.load())
    .then((result) => {
      if (destroyed) return result;
      showResult(result);
      return result;
    });

  return {
    ready,
    destroy() {
      destroyed = true;
      clearSwap();
      clearEnter();
      clearTtl();
      if (rotation) rotation.destroy();
      if (source.destroy) source.destroy();
      for (const [target, type, fn] of listeners) target.removeEventListener(type, fn);
      listeners.length = 0;
    },
  };
}

export function readEmbeddedFeed(doc) {
  const el = doc.getElementById("activity-feed-data");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

/* The transport for a feed URL, or null when the card has none (the bundled
   examples only). Only an https URL is accepted. No cookies or credentials
   are sent. */
export function feedTransport(url, fetchFn) {
  if (!isHttpsUrl(url || "", LIMITS.profileUrl)) return null;
  const doFetch = fetchFn || (typeof fetch === "function" ? fetch.bind(globalThis) : null);
  if (!doFetch) return null;
  return () => doFetch(url, { headers: { accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
}

export function boot(doc) {
  const documentRef = doc || (typeof document !== "undefined" ? document : null);
  if (!documentRef || !documentRef.querySelector) return null;
  const rootEl = documentRef.documentElement;
  if (rootEl && rootEl.dataset && rootEl.dataset.activityFeedBoot === "off") return null;
  const root = documentRef.querySelector("[data-activity-feed]");
  if (!root) return null;
  const embedded = readEmbeddedFeed(documentRef);
  const fallback = embedded || { example: true, data: [] };
  const feedUrl = root.getAttribute("data-feed-url");
  return mountActivityFeed(root, {
    now: () => Date.now(),
    source: createFeedSource({ transport: feedTransport(feedUrl), fallback }),
  });
}

export const BlowhornActivityFeed = {
  PLATFORMS,
  LIMITS,
  INTERVAL_MS,
  AVATAR_HOSTS,
  avatarAllowed,
  avatarFor,
  monogramHue,
  initials,
  relativeTime,
  paintProgress,
  preloadAvatar,
  validateItem,
  sanitizeItem,
  normalizePayload,
  parseRetryAfter,
  parseMaxAge,
  MAX_LIVE_TTL_MS,
  isHttpsUrl,
  createFeedSource,
  createRotation,
  paintActivity,
  paintEmpty,
  mountActivityFeed,
  readEmbeddedFeed,
  feedTransport,
  boot,
};

if (typeof globalThis !== "undefined") globalThis.BlowhornActivityFeed = BlowhornActivityFeed;

if (typeof document !== "undefined" && document.querySelector) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot(), { once: true });
  else boot();
}
