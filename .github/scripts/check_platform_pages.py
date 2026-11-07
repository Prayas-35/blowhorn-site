#!/usr/bin/env python3
"""Fail if a platform product page drifts from its data or its contract.

Platform pages (docs/platform-pages.md) render one record of
data/platform_pages.json (schemas/platform_page.schema.json, which make
check-schemas validates with ajv) through layouts/platform-page.html.

--source checks the data alone (run by make check-schemas), the references
JSON Schema cannot express:

- each record's platform is a supported row of data/integrations.json with a
  data/platforms/<id>.yaml, and its route is /preview/platforms/<id>/;
- each activity type names an action that YAML lists, ids are unique and no two
  types share an action; every action the YAML lists has a
  data/action_examples.json entry;
- the local-action stage has its three scenes in order (amplify, follow, dry
  fire); a scene that names an action joins a YAML text that is not empty; the dry
  fire scene quotes a public dry-fire page and carries its planned line;
- its cutouts are transparent WebP files (alpha channel set) under
  static/assets/brand/cast/icons/, never the black-background originals;
- every sourced fact (the boundary sentence, the stage's quotes, rules of
  engagement, Field Manual) quotes its public source page verbatim (whitespace
  aside), every number it shows is in that quote, and every usage snippet appears
  verbatim on its source page; no source is the private product repository;
- each record has exactly one content page (content/en/preview-platform-<id>.md)
  with layout platform-page, the same platform and url, noindex, exclude_search,
  sitemap disabled and build list never, and no other page uses the layout;
- hugo.toml keeps /preview/** out of llms.txt; no em dash anywhere in the data;
- assets/js/platform-page.js makes no request and touches no storage, cookie or
  credential API (the local stage is local only), and the page CSS has no
  infinite animation (a loop would need a pause control this page does not have).

With a build directory it also checks each built page and runs its script:

- the page exists, is noindex, and its route is in no sitemap, llms.txt,
  llms-full.txt or search index, and no other built page links to it, and no
  built page names the private product issue or repository;
- <main> holds exactly one primary button, the call to action, labelled as the
  record says and linking to the extension listing the download page's own
  extension card uses, with nothing under it (no note, no caption); the
  reviewer annotation carries its mark and annotation style, never a caption;
- the source order is activity selector, call to action, then the local stage;
  the local stage is one labelled section with three scene radios (the first
  checked), three text panels with no hidden attribute in the HTML (the script
  owns the hiding), a replay button, a polite announcement region, a decorative
  diagram, the reach line and each joined YAML text, the boundary sentence and
  the cutouts, each present in the built output and transparent;
- one radio per activity type in order, the first checked; one intent per type;
  the action matrix is a visible table (no <details> on the page) whose rows are
  the YAML's actions in order and whose cells are the vocabulary name, the YAML's
  behavior and limits and the examples' CLI line; the presets, Field Manual cards
  and usage cards match the record, every code card can be copied, and every
  source anchor exists; there is no form and no text field anywhere in <main>;
  no em dash and no browser brand in the page;
- assets/js/platform-page.js, run through platform_page_harness.js against the
  built <main>: picking each type swaps every [data-pp-for] element and marks the
  bound rows; picking each scene shows only its panel, plays the diagram once and
  announces it once; the same radio again plays nothing; replay plays again and
  announces nothing; the rail pages by hand with aria-disabled ends, and under
  reduced motion nothing scrolls smoothly.

Usage: check_platform_pages.py --source
       check_platform_pages.py [BUILD_DIR]
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

from check_action_examples import yaml_action_ids

ROOT = Path(__file__).resolve().parents[2]
HARNESS = Path(__file__).resolve().parent / "platform_page_harness.js"
SCRIPT = Path("assets/js/platform-page.js")
EM_DASH = "—"
BRAND_RE = re.compile(r"Chrome|Safari|Firefox|\bMac\b|macOS|Outbox")
# The Chrome Web Store listing of the Blowhorn extension: the call to action's
# target, and the link layouts/download.html's extension card uses.
EXTENSION_HREF = "https://chromewebstore.google.com/detail/fcflpiagmpcfifgknledeknedfopnapf"
# The local stage is local only: the page script never makes a request, reads
# storage or cookies, or touches credentials.
FORBIDDEN_JS = re.compile(
    r"\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB"
    r"|document\.cookie|navigator\.credentials|chrome\.runtime|postMessage|FormData|\.submit\()")
NUMBER_RE = re.compile(r"\d+(?:[.,]\d+)*")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
LLMS_EXCLUDE = "/preview/**"


# ---------- source ----------

def load_json(root: Path, rel: str) -> dict:
    return json.loads((root / rel).read_text(encoding="utf-8"))


def yaml_actions(root: Path, platform_id: str) -> list[dict] | None:
    """The action rows of data/platforms/<id>.yaml: id (from the shared
    yaml_action_ids), and the text of its behavior and limits, empty when it
    lists none (each is one line in these files)."""
    path = root / "data" / "platforms" / f"{platform_id}.yaml"
    if not path.is_file():
        return None
    rows: dict[str, dict] = {}
    current = ""
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("  - id:"):
            current = line.split("id:", 1)[1].strip()
            rows[current] = {"behavior": "", "limits": ""}
        elif current and line.startswith(("    limits:", "    behavior:")):
            key, _, value = line.strip().partition(":")
            rows[current][key] = value.strip()
    return [{"id": i, **rows.get(i, {"behavior": "", "limits": ""})} for i in yaml_action_ids(platform_id, root)]


def squash(text: str) -> str:
    """Collapse whitespace and drop Markdown emphasis, so a quote matches its
    source however the source wraps or bolds it."""
    return " ".join(text.replace("**", "").split())


def source_file(root: Path, href: str) -> Path | None:
    """The content file behind a site path (/docs/x/y/#frag -> content/en/docs/x/y.md)."""
    path = href.split("#", 1)[0].strip("/")
    base = root / "content" / "en" / path
    for candidate in (base.with_suffix(".md"), base / "_index.md", base / "index.md"):
        if candidate.is_file():
            return candidate
    return None


def source_texts(path: Path) -> list[str]:
    """The page's raw text, plus every string in a JSON front matter (the agent
    pages keep their copy there), each squashed."""
    raw = path.read_text(encoding="utf-8")
    texts = [squash(raw)]
    if raw.lstrip().startswith("{"):
        try:
            obj, _ = json.JSONDecoder().raw_decode(raw.lstrip())
        except ValueError:
            obj = None

        def strings(o):
            if isinstance(o, str):
                yield o
            elif isinstance(o, dict):
                for v in o.values():
                    yield from strings(v)
            elif isinstance(o, list):
                for v in o:
                    yield from strings(v)
        texts.extend(squash(s) for s in strings(obj))
    return texts


def check_quote(root: Path, where: str, quote: str, href: str, shown: str = "") -> list[str]:
    """A quote must be on its source page, and every number the page shows for
    it must be in the quote: no number the source does not give."""
    path = source_file(root, href)
    if path is None:
        return [f"{where}: source {href!r} is not a page under content/en/"]
    out: list[str] = []
    if not any(squash(quote) in t for t in source_texts(path)):
        out.append(f"{where}: {path.relative_to(root)} does not say {quote!r}")
    missing = sorted(set(NUMBER_RE.findall(shown)) - set(NUMBER_RE.findall(quote)))
    if missing:
        out.append(f"{where}: shows {missing}, which the quote from {href} does not give")
    return out


def sourced_items(rec: dict) -> list[tuple[str, str, str, str]]:
    """(where, quote, source, shown text) for every sourced fact on a record."""
    items = []
    local = rec.get("local", {})
    if local.get("boundary"):
        b = local["boundary"]
        items.append(("local boundary", b["quote"], b["source"], b["text"]))
    for s in local.get("scenes", []):
        if s.get("sourced"):
            q = s["sourced"]
            items.append((f"local scene {s['id']!r}", q["quote"], q["source"], q["text"]))
    for p in rec.get("roe", {}).get("presets", []):
        items.append((f"rules of engagement {p['label']!r}", p["quote"], p["source"], p["stat"]))
        items.append((f"rules of engagement {p['label']!r} meaning", p["means"], p["source"], ""))
    for n in rec.get("roe", {}).get("notes", []):
        items.append((f"rules of engagement note {n['text']!r}", n["quote"], n["source"], n["text"]))
    for f in rec.get("fieldManual", {}).get("facts", []):
        items.append((f"Field Manual {f['title']!r}", f["quote"], f["source"], f["text"]))
    for u in rec.get("usage", {}).get("items", []):
        items.append((f"usage {u['id']!r}", u["code"], u["source"], ""))
    return items


def webp_has_alpha(path: Path) -> bool:
    """Whether a WebP file carries an alpha channel. An extended (VP8X) file says so
    in its flags; a lossless (VP8L) file in its header; a plain lossy (VP8) file
    never does, so a cutout saved that way would sit in a black box."""
    head = path.read_bytes()[:32]
    if head[:4] != b"RIFF" or head[8:12] != b"WEBP" or len(head) < 25:
        return False
    chunk = head[12:16]
    if chunk == b"VP8X":
        return bool(head[20] & 0x10)
    if chunk == b"VP8L":
        return bool((head[24] >> 4) & 1)
    return False


def links_to(html: str, route: str) -> bool:
    """Whether html has an href to the route: absolute, with a host or a base
    path in front, relative, with or without the trailing slash, with or
    without a fragment or query."""
    path = re.escape(route.strip("/"))
    return bool(re.search(
        rf"""href=["'](?:[^"'#?]*/)?{path}/?(?:[#?][^"']*)?["']""", html, re.I))


def front_matter(path: Path) -> dict:
    """The flat keys of a page's YAML front matter, plus sitemap.disable and build.list."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    out: dict = {}
    parent = ""
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, _, value = line.strip().partition(":")
        value = value.strip().strip("\"'")
        if line.startswith((" ", "\t")):
            out[f"{parent}.{key}"] = value
        else:
            parent = key
            out[key] = value
    return out


def platform_pages(root: Path) -> list[Path]:
    return sorted(
        p for p in (root / "content" / "en").rglob("*.md")
        if front_matter(p).get("layout") == "platform-page"
    )


# A stage part whose own transform positions it (the relay's centring, a slip's
# counter-rotation, the outcome's centring). An animation that ends on transform
# would overwrite that positioning once it finishes, so these may only fade.
POSITIONED_PARTS = (".pp-relay", ".pp-slip", ".pp-out", ".pp-spoke")


def check_stage_geometry(css: str) -> list[str]:
    """Two CSS facts the stage's layout depends on, read from the stylesheet:
    the fan's containing block fills the theatre (a zero-size fan puts every spoke
    at the stage's origin), and no animation on a positioned part ends on transform."""
    problems: list[str] = []
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    fan = next((body for sel, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css) if sel.strip() == ".pp-fan"), None)
    fills = fan is not None and (re.search(r"inset:\s*0\b", fan) or (re.search(r"width:\s*100%", fan) and re.search(r"height:\s*100%", fan)))
    if not fills:
        problems.append("assets/css/platform-page.css: .pp-fan must fill the theatre (inset: 0, or width and height 100%); a zero-size fan puts the profiles at the stage origin")
    for sel, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        name = re.search(r"animation:\s*([a-z-]+)", body)
        # A pseudo-element (the spoke's line) is placed by left and top, not by its transform.
        if not name or "::" in sel or not any(p in sel for p in POSITIONED_PARTS):
            continue
        frames = re.search(rf"@keyframes {name.group(1)}\s*\{{(.*?)\}}\s*\}}", css, re.S)
        if frames and "transform" in frames.group(1):
            problems.append(f"assets/css/platform-page.css: {sel.strip()} animates {name.group(1)}, which ends on transform and clobbers the part's positioning; fade it instead")
    return problems


def check_source(root: Path) -> list[str]:
    problems: list[str] = []
    raw = (root / "data" / "platform_pages.json").read_text(encoding="utf-8")
    if EM_DASH in raw:
        problems.append("data/platform_pages.json carries an em dash; use a hyphen")
    data = json.loads(raw)
    integrations = {p["id"]: p for p in load_json(root, "data/integrations.json")["platforms"]}
    vocab = {a["id"] for a in load_json(root, "data/actions.json")["actions"]}

    seen_platforms: set[str] = set()
    for rec in data.get("pages", []):
        pid = rec.get("platform", "")
        where = f"page {pid!r}"
        if pid in seen_platforms:
            problems.append(f"{where} appears twice")
        seen_platforms.add(pid)
        row = integrations.get(pid)
        if row is None:
            problems.append(f"{where}: {pid!r} is not in data/integrations.json")
            continue
        if row.get("status") != "supported":
            problems.append(f"{where}: {pid!r} is {row.get('status')!r}; only a supported platform gets a page")
        actions = yaml_actions(root, pid)
        if actions is None:
            problems.append(f"{where}: data/platforms/{pid}.yaml is missing")
            continue
        listed = [a["id"] for a in actions]
        if rec.get("route") != f"/preview/platforms/{pid}/":
            problems.append(f"{where}: route {rec.get('route')!r} must be /preview/platforms/{pid}/")

        type_ids: list[str] = []
        bound: list[str] = []
        for act in rec.get("activities", []):
            if act["id"] in type_ids:
                problems.append(f"{where}: activity id {act['id']!r} repeats")
            type_ids.append(act["id"])
            if act["action"] not in vocab:
                problems.append(f"{where}: activity {act['id']!r} names {act['action']!r}, not in data/actions.json")
            elif act["action"] not in listed:
                problems.append(f"{where}: activity {act['id']!r} names {act['action']!r}, which data/platforms/{pid}.yaml does not list")
            if act["action"] in bound:
                problems.append(f"{where}: two activities bind action {act['action']!r}")
            bound.append(act["action"])

        local = rec.get("local", {})
        scene_ids = [sc.get("id") for sc in local.get("scenes", [])]
        if scene_ids != ["amplify", "follow", "dry-fire"]:
            problems.append(f"{where}: local scenes are {scene_ids}, want amplify, follow, dry-fire in that order")
        for sc in local.get("scenes", []):
            act = sc.get("action")
            if act is not None:
                row = next((a for a in actions if a["id"] == act), None)
                if row is None:
                    problems.append(f"{where}: local scene {sc['id']!r} names {act!r}, which data/platforms/{pid}.yaml does not list")
                else:
                    joined = {"description": row["behavior"], "limits": row["limits"]}.get(sc.get("join"), "")
                    if not joined:
                        problems.append(f"{where}: local scene {sc['id']!r} joins {sc.get('join')!r} from {act!r}, which the YAML leaves empty")
            elif sc["id"] == "dry-fire" and not sc.get("sourced"):
                problems.append(f"{where}: local scene 'dry-fire' must quote the public dry-fire page it describes")
            if sc.get("link") and (not sc["link"]["href"].startswith("/") or "blowhorn-ai/blowhorn" in sc["link"]["href"]):
                problems.append(f"{where}: local scene {sc['id']!r} links {sc['link']['href']!r}; link a public page on this site")
        dry = next((sc for sc in local.get("scenes", []) if sc.get("id") == "dry-fire"), None)
        if dry is not None and not dry.get("planned"):
            problems.append(f"{where}: local scene 'dry-fire' must mark what is planned, not shipped")
        if dry is not None:
            # Shipped dry fire is the desktop app; the extension flow is only planned.
            if "desktop" not in dry.get("label", "").lower():
                problems.append(f"{where}: local scene 'dry-fire' label {dry.get('label')!r} must say desktop; the shipped dry fire is the desktop app")
            if "desktop app" not in dry.get("lede", "").lower():
                problems.append(f"{where}: local scene 'dry-fire' lede must name the desktop app")
            if dry.get("relay") != "Desktop app":
                problems.append(f"{where}: local scene 'dry-fire' relay is {dry.get('relay')!r}, want 'Desktop app' (the diagram must not advertise an extension dry fire)")
            if dry.get("planned") and "extension" not in dry["planned"].get("mark", "").lower():
                problems.append(f"{where}: local scene 'dry-fire' planned mark {dry['planned'].get('mark')!r} must say the extension flow is planned")
        if local and local.get("intro") != APPROVED_LOCAL_INTRO:
            problems.append(f"{where}: the local introduction reads {local.get('intro')!r}, want the approved line {APPROVED_LOCAL_INTRO!r}")
        boundary = local.get("boundary")
        if boundary and squash(boundary["quote"]) not in squash(boundary["text"]):
            problems.append(f"{where}: local boundary text {boundary['text']!r} drops the scope of its quote {boundary['quote']!r}")
        for c in local.get("crew", []):
            cut_path = root / "static" / c["src"]
            if not cut_path.is_file():
                problems.append(f"{where}: local crew {c['src']} is not under static/")
            elif not webp_has_alpha(cut_path):
                problems.append(f"{where}: local crew {c['src']} has no alpha channel; a cutout must sit on no box")

        examples = {(e["platform"], e["action"]) for e in load_json(root, "data/action_examples.json")["examples"]}
        for a in listed:
            if (pid, a) not in examples:
                problems.append(f"{where}: data/action_examples.json has no {pid} example for {a!r}, so the matrix has no CLI cell")

        for label, quote, href, shown in sourced_items(rec):
            if "github.com/blowhorn-ai/blowhorn/" in href or not href.startswith("/"):
                problems.append(f"{where}: {label} cites {href!r}; cite a public page on this site")
                continue
            problems.extend(f"{where}: {m}" for m in check_quote(root, label, quote, href, shown))

        page = root / "content" / "en" / f"preview-platform-{pid}.md"
        if not page.is_file():
            problems.append(f"{where}: content/en/preview-platform-{pid}.md is missing")
            continue
        fm = front_matter(page)
        rel = page.relative_to(root)
        want = {
            "layout": "platform-page",
            "platform": pid,
            "url": rec.get("route"),
            "noindex": "true",
            "exclude_search": "true",
            "sitemap.disable": "true",
            "build.list": "never",
        }
        for key, value in want.items():
            if fm.get(key) != value:
                problems.append(f"{rel}: front matter {key} is {fm.get(key)!r}, want {value!r}")

    for page in platform_pages(root):
        pid = front_matter(page).get("platform", "")
        if pid not in seen_platforms:
            problems.append(f"{page.relative_to(root)} uses layout platform-page for {pid!r}, which has no record")

    hugo = (root / "hugo.toml").read_text(encoding="utf-8")
    if f'"{LLMS_EXCLUDE}"' not in hugo:
        problems.append(f'hugo.toml [params.llms] exclude must list "{LLMS_EXCLUDE}"')
    script = root / SCRIPT
    if script.is_file():
        hit = FORBIDDEN_JS.search(script.read_text(encoding="utf-8"))
        if hit:
            problems.append(f"{SCRIPT}: uses {hit.group(0)!r}; the local stage is local only and makes no request or storage call")
    css = root / "assets" / "css" / "platform-page.css"
    if css.is_file() and "infinite" in css.read_text(encoding="utf-8"):
        problems.append("assets/css/platform-page.css: an infinite animation; a loop would need a pause control this page does not have")
    if css.is_file():
        problems.extend(check_stage_geometry(css.read_text(encoding="utf-8")))
    if css.is_file():
        block = re.search(r"\.pp-local \{[^}]*\}", css.read_text(encoding="utf-8"))
        if block is None or "var(--near-black)" not in block.group(0):
            problems.append("assets/css/platform-page.css: .pp-local must sit on the near-black token, not a flat grey field")
    return problems


# ---------- built ----------

class Tree(HTMLParser):
    """The element tree of <main>, plus a few page-wide facts."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.main: dict | None = None
        self.stack: list[dict] = []
        self.robots = ""
        self.hrefs: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = {k: (v if v is not None else "") for k, v in attrs}
        if tag == "meta" and a.get("name") == "robots":
            self.robots = a.get("content", "")
        if "href" in a:
            self.hrefs.append(a["href"])
        if self.main is None and tag == "main":
            self.main = {"tag": tag, "attrs": a, "children": []}
            self.stack = [self.main]
            return
        if not self.stack:
            return
        el = {"tag": tag, "attrs": a, "children": []}
        self.stack[-1]["children"].append(el)
        if tag not in VOID:
            self.stack.append(el)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and tag not in VOID and self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if not self.stack:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.stack:
            self.stack[-1]["children"].append(data)


def parse(path: Path) -> Tree:
    t = Tree()
    t.feed(path.read_text(encoding="utf-8"))
    t.close()
    return t


def walk(el: dict):
    yield el
    for c in el["children"]:
        if isinstance(c, dict):
            yield from walk(c)


def text(el: dict) -> str:
    return "".join(c if isinstance(c, str) else text(c) for c in el["children"])


def find(el: dict, attr: str, value: str | None = None) -> list[dict]:
    return [
        e for e in walk(el)
        if attr in e["attrs"] and (value is None or e["attrs"][attr] == value)
    ]


def classes(el: dict) -> list[str]:
    return el["attrs"].get("class", "").split()


def run_harness(tree: dict, scenario: dict, root: Path) -> list[dict]:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node is not on PATH; the platform page behaviour check needs it")
    out = subprocess.run(
        [node, str(HARNESS), str(root / SCRIPT)],
        input=json.dumps({"tree": tree, "scenario": scenario}),
        capture_output=True, text=True, check=False,
    )
    if out.returncode != 0:
        raise RuntimeError(f"platform_page_harness.js failed: {out.stderr.strip()}")
    return json.loads(out.stdout)


def code_text(el: dict) -> str:
    """A code card's text as the copy button copies it: without its "$" prompts."""
    return "".join(
        c if isinstance(c, str) else ("" if "term-ps" in classes(c) else code_text(c))
        for c in el["children"]
    )


def check_behaviour(label: str, main: dict, rec: dict, actions: list[dict], root: Path) -> list[str]:
    problems: list[str] = []
    types = [a["id"] for a in rec["activities"]]
    action_of = {a["id"]: a["action"] for a in rec["activities"]}
    intents = {a["id"]: a["intent"] for a in rec["activities"]}
    label_of = {a["id"]: a["label"] for a in rec["activities"]}
    items = rec["usage"]["items"]
    # The stylesheet shows a whole number of setups (2 on a wide screen).
    rail = {"width": 1000, "slide": 484, "gap": 32}
    per_view = 2
    edges = {i * (rail["slide"] + rail["gap"]) for i in range(len(items))}

    steps = [{"choose": t} for t in types[1:]] + [{"choose": types[0]}]
    states = run_harness(main, {"rail": rail, "steps": steps}, root)
    first = states[0]
    if not first["enhanced"]:
        problems.append(f"{label}: the script did not enhance the page")
    for state, want in zip(states, [types[0]] + types[1:] + [types[0]]):
        if state["type"] != want or state["checked"] != [want]:
            problems.append(f"{label}: after choosing {want!r} the page shows {state['type']!r}, checked {state['checked']}")
        if set(state["shown"]) != {want}:
            problems.append(f"{label}: choosing {want!r} shows elements for {sorted(state['shown'])}")
        if set(state["hidden"]) != set(types) - {want}:
            problems.append(f"{label}: choosing {want!r} leaves {sorted(set(types) - {want} - set(state['hidden']))} visible")
        want_picked = [a["id"] for a in actions if a["id"] == action_of[want]]
        if sorted(set(state["picked"])) != want_picked:
            problems.append(f"{label}: choosing {want!r} marks rows {state['picked']}, want {want_picked}")
    for state, want in zip(states[1:], types[1:]):
        if state["announce"] != f"{label_of[want]}. {intents[want]}":
            problems.append(f"{label}: choosing {want!r} announces {state['announce']!r}")
    # Clicking the radio that is already checked fires no change and changes nothing.
    idle = run_harness(main, {"rail": rail, "steps": [{"choose": types[0]}]}, root)
    if idle[-1]["announceWrites"] != idle[0]["announceWrites"] or idle[-1]["type"] != types[0]:
        problems.append(f"{label}: clicking the checked radio announced or changed the page")

    # The local stage: one scene at a time, a play per change, announced once.
    scenes = [sc["id"] for sc in rec["local"]["scenes"]]
    titles = {sc["id"]: sc["title"] for sc in rec["local"]["scenes"]}
    stage = run_harness(main, {"rail": rail, "steps": [
        {"scene": scenes[1]}, {"scene": scenes[2]}, {"scene": scenes[0]}, {"scene": scenes[0]}, {"replay": True}]}, root)
    load = stage[0]
    if not load["sceneEnhanced"] or load["scene"] != scenes[0] or load["scenePanels"] != [scenes[0]] or load["sceneChecked"] != [scenes[0]]:
        problems.append(f"{label}: the stage loads on {load['scene']!r} with panels {load['scenePanels']} and radios {load['sceneChecked']}")
    if load["run"] != "1" or load["sceneAnnounceWrites"] != 0:
        problems.append(f"{label}: the stage plays at load {load['run']!r} times and announces {load['sceneAnnounceWrites']}; want one quiet play")
    prev = load
    for st, want, title in zip(stage[1:4], scenes[1:] + [scenes[0]], [titles[s] for s in scenes[1:]] + [titles[scenes[0]]]):
        if st["scene"] != want or st["scenePanels"] != [want] or st["sceneChecked"] != [want]:
            problems.append(f"{label}: choosing {want!r} shows {st['scene']!r}, panels {st['scenePanels']}, radios {st['sceneChecked']}")
        if int(st["run"]) != int(prev["run"]) + 1 or not st["playing"]:
            problems.append(f"{label}: choosing {want!r} plays {prev['run']!r} -> {st['run']!r}, playing={st['playing']}; want one play")
        if st["sceneAnnounce"] != f"{title} is showing." or st["sceneAnnounceWrites"] != prev["sceneAnnounceWrites"] + 1:
            problems.append(f"{label}: choosing {want!r} announces {st['sceneAnnounce']!r} ({st['sceneAnnounceWrites']} writes); want one announcement of {title!r}")
        prev = st
    same, replayed = stage[4], stage[5]
    if same["run"] != stage[3]["run"] or same["sceneAnnounceWrites"] != stage[3]["sceneAnnounceWrites"]:
        problems.append(f"{label}: choosing the scene already shown plays or announces again")
    if int(replayed["run"]) != int(same["run"]) + 1 or replayed["scene"] != scenes[0]:
        problems.append(f"{label}: replay reads {same['run']!r} -> {replayed['run']!r}; want one more play of {scenes[0]!r}")
    if replayed["sceneAnnounceWrites"] != same["sceneAnnounceWrites"]:
        problems.append(f"{label}: replay announces; it must stay quiet")
    if [sc for sc in stage if sc["scene"] not in scenes]:
        problems.append(f"{label}: the stage shows a scene the record does not name")

    # The rail, paged by hand.
    n = len(items)
    wide = run_harness(main, {"rail": {"width": n * rail["slide"] + (n - 1) * rail["gap"] + 50, "slide": rail["slide"], "gap": rail["gap"]}}, root)[0]
    if wide["controlsShown"]:
        problems.append(f"{label}: rail controls show although every setup fits")
    pages = run_harness(main, {"rail": rail, "steps": [{"click": "next"}] * n + [{"click": "prev"}] * n}, root)
    start = pages[0]
    if not start["controlsShown"] or start["prevDisabled"] != "true" or start["nextDisabled"] != "false":
        problems.append(f"{label}: rail at load shows controls={start['controlsShown']}, prev={start['prevDisabled']}, next={start['nextDisabled']}")
    if start["count"] != f"1-{per_view} of {n}":
        problems.append(f"{label}: rail count at load is {start['count']!r}, want '1-{per_view} of {n}'")
    end = pages[n]
    if end["nextDisabled"] != "true" or end["prevDisabled"] != "false" or end["scrollLeft"] <= 0:
        problems.append(f"{label}: rail after paging forward: next={end['nextDisabled']}, prev={end['prevDisabled']}, left={end['scrollLeft']}")
    if any(p["prevDisabledAttr"] for p in pages) or "data-pp-next" not in end["focus"].split():
        problems.append(f"{label}: a rail button lost focus at the end (it must use aria-disabled, not disabled)")
    stray = [p["scrollLeft"] for p in pages if p["scrollLeft"] not in edges]
    if stray:
        problems.append(f"{label}: the rail stops mid-card at {stray}; card edges are {sorted(edges)}")
    if pages[-1]["scrollLeft"] != 0 or pages[-1]["prevDisabled"] != "true":
        problems.append(f"{label}: rail did not page back to the start: left={pages[-1]['scrollLeft']}")
    if set(end["scrolls"]) != {"smooth"}:
        problems.append(f"{label}: rail scrolls {sorted(set(end['scrolls']))}, want smooth")
    farthest = n * rail["slide"] + (n - 1) * rail["gap"] - rail["width"]
    swipes = run_harness(main, {"rail": rail, "steps": [{"scroll": farthest}, {"scroll": 0}]}, root)
    if swipes[1]["count"] != end["count"] or swipes[2]["count"] != start["count"]:
        problems.append(f"{label}: the rail count while scrolling is {[s['count'] for s in swipes]}, want {end['count']!r} at the far end and {start['count']!r} back at the start")
    if any(s["railAnnounce"] != "" for s in swipes):
        problems.append(f"{label}: scrolling the rail announced {[s['railAnnounce'] for s in swipes]}; only a button press may")
    if end["railAnnounce"] != f"Showing {end['count']}":
        problems.append(f"{label}: paging forward announced {end['railAnnounce']!r}, want 'Showing {end['count']}'")
    calm = run_harness(main, {"rail": rail, "reduce": True, "steps": [{"click": "next"}]}, root)[-1]
    if calm["scrolls"] != ["auto"]:
        problems.append(f"{label}: under reduced motion the rail scrolls {calm['scrolls']}, want ['auto']")
    return problems


def built_file(build_dir: Path, route: str) -> Path:
    return build_dir / route.strip("/") / "index.html"


PRIVATE_ISSUE = "blowhorn-ai/blowhorn/issues/2178"
# The approved marketing line of the local section (brief: the local-browser differentiator).
APPROVED_LOCAL_INTRO = "Your login stays home."


def check_local_built(main: dict, rec: dict, root: Path, build_dir: Path, page: Path) -> list[str]:
    """The local stage as built: its structure, its joined and quoted text, its
    cutouts and the diagram's decorative role."""
    problems: list[str] = []
    local = rec["local"]
    ids = [sc["id"] for sc in local["scenes"]]
    stages = find(main, "data-pp-local")
    if len(stages) != 1 or stages[0]["tag"] != "section":
        return ["the local stage must be one <section data-pp-local>"]
    stage = stages[0]
    if stage["attrs"].get("aria-labelledby") != "pp-local-title" or not any(e["attrs"].get("id") == "pp-local-title" for e in walk(stage)):
        problems.append("the local stage needs its heading (aria-labelledby pp-local-title)")
    radios = find(stage, "data-pp-scene-choice")
    if [r["attrs"].get("value") for r in radios] != ids:
        problems.append(f"the scene radios are {[r['attrs'].get('value') for r in radios]}, want {ids}")
    if [("checked" in r["attrs"]) for r in radios] != [i == 0 for i in range(len(ids))]:
        problems.append("only the first scene is checked at load")
    if any(r["attrs"].get("type") != "radio" for r in radios):
        problems.append("a scene choice is not a native radio")
    panels = find(stage, "data-pp-scene-panel")
    if [p["attrs"].get("data-pp-scene-panel") for p in panels] != ids:
        problems.append(f"the scene panels are {[p['attrs'].get('data-pp-scene-panel') for p in panels]}, want {ids}")
    if any("hidden" in p["attrs"] for p in panels):
        problems.append("a scene panel carries hidden in the HTML; without script every scene must show, so the script alone hides them")
    for sc, panel in zip(local["scenes"], panels):
        body = " ".join(text(panel).split())
        if sc["title"] not in body or sc["lede"] not in body:
            problems.append(f"scene {sc['id']!r} panel does not carry its title and lede")
    replay = find(stage, "data-pp-replay")
    if replay and "aria-controls" in replay[0]["attrs"]:
        problems.append("the replay button points at the decorative diagram (aria-controls); the diagram is aria-hidden")
    for sc in local["scenes"]:
        names = [" ".join(text(e).split()) for e in find(stage, "data-scene-relay", sc["id"])]
        want = sc.get("relay") or local["diagram"]["extension"]
        if names != [want]:
            problems.append(f"the relay for scene {sc['id']!r} reads {names}, want {[want]}")
    dry_tags = find(stage, "data-scene-planned", "dry-fire")
    dry_scene = next((sc for sc in local["scenes"] if sc["id"] == "dry-fire"), None)
    if dry_scene and dry_scene.get("planned"):
        if [" ".join(text(e).split()) for e in dry_tags] != [dry_scene["planned"]["mark"]]:
            problems.append("the dry-fire diagram is not marked as planned beside the diagram")
    if len(replay) != 1 or replay[0]["tag"] != "button" or replay[0]["attrs"].get("type") != "button" or "button-primary" in classes(replay[0]):
        problems.append("the stage needs one plain replay button (type=button, not a primary button)")
    announce = find(stage, "data-pp-stage-announce")
    if len(announce) != 1 or announce[0]["attrs"].get("aria-live") != "polite":
        problems.append("the stage needs one polite announcement region")
    rig = find(stage, "data-pp-rig")
    if len(rig) != 1 or rig[0]["attrs"].get("aria-hidden") != "true":
        problems.append("the diagram must be decorative (aria-hidden) and present once")
    full = " ".join(text(stage).split())
    yaml = {a["id"]: a for a in yaml_actions(root, rec["platform"]) or []}
    if rec.get("local") and yaml_reach(root, rec["platform"]) not in full:
        problems.append(f"the reach line does not read the platform YAML's reach {yaml_reach(root, rec['platform'])!r}")
    for sc in local["scenes"]:
        if sc.get("action") is not None:
            want = {"description": yaml[sc["action"]]["behavior"], "limits": yaml[sc["action"]]["limits"]}[sc["join"]]
            if want not in full:
                problems.append(f"scene {sc['id']!r} does not show the YAML's {sc['join']} for {sc['action']!r}: {want!r}")
    if local["boundary"]["text"] not in full or not any(e["attrs"].get("href", "").endswith(local["boundary"]["source"].lstrip("/")) or e["attrs"].get("href", "").endswith(local["boundary"]["source"]) for e in walk(stage)):
        problems.append("the session boundary sentence is missing or does not link its source")
    dry = next((sc for sc in local["scenes"] if sc["id"] == "dry-fire"), None)
    if dry is not None and dry.get("planned") and dry["planned"]["text"] not in full:
        problems.append("the dry-fire planned line is missing from the stage")
    for img in (e for e in walk(stage) if e["tag"] == "img"):
        src = img["attrs"].get("src", "")
        rel = src.split("/assets/", 1)
        if len(rel) != 2:
            problems.append(f"a stage image {src!r} is not a site asset")
            continue
        cutout = build_dir / "assets" / rel[1]
        if not cutout.is_file():
            problems.append(f"the stage image {src!r} was not built")
        elif not webp_has_alpha(cutout):
            problems.append(f"the stage image {src!r} is opaque; a cutout must carry alpha")
        if img["attrs"].get("alt") not in ("", None):
            problems.append(f"the decorative image {src!r} has alt text")
    if any(e["tag"] == "details" for e in walk(stage)):
        problems.append("a <details> in the local stage")
    return problems


def yaml_reach(root: Path, platform_id: str) -> str:
    """The reach line of data/platforms/<id>.yaml."""
    for line in (root / "data" / "platforms" / f"{platform_id}.yaml").read_text(encoding="utf-8").splitlines():
        if line.startswith("reach:"):
            return line.split(":", 1)[1].strip()
    return ""


def check_built(build_dir: Path, root: Path) -> list[str]:
    problems: list[str] = []
    data = load_json(root, "data/platform_pages.json")
    vocab = {a["id"]: a for a in load_json(root, "data/actions.json")["actions"]}
    examples = load_json(root, "data/action_examples.json")["examples"]
    indexes = [build_dir / "sitemap.xml", build_dir / "llms.txt", build_dir / "llms-full.txt",
               *sorted(build_dir.glob("offline-search-index*.json"))]
    pages_html = sorted(build_dir.rglob("*.html"))

    # The download page's extension card is the one install path the site offers.
    download = built_file(build_dir, "/download/")
    if download.is_file():
        dl = parse(download).main
        offered = [e["attrs"].get("href", "") for e in walk(dl) if "button-primary" in classes(e)] if dl else []
        if EXTENSION_HREF not in offered:
            problems.append(f"/download/ no longer offers {EXTENSION_HREF} as a primary button; the platform pages' call to action must follow it")

    for rec in data["pages"]:
        route = rec["route"]
        label = route
        path = built_file(build_dir, route)
        if not path.is_file():
            problems.append(f"{label} was not built")
            continue
        t = parse(path)
        main = t.main
        if main is None:
            problems.append(f"{label} has no <main>")
            continue
        if "noindex" not in t.robots:
            problems.append(f"{label} is not noindex")
        for idx in indexes:
            if idx.is_file() and route in idx.read_text(encoding="utf-8"):
                problems.append(f"{label} is listed in {idx.name}")
        for other in pages_html:
            if other == path:
                continue
            body = other.read_text(encoding="utf-8")
            if links_to(body, route):
                problems.append(f"{label} is linked from {other.relative_to(build_dir)}")

        body = text(main)
        if EM_DASH in body:
            problems.append(f"{label}: an em dash in the page")
        if BRAND_RE.search(body):
            problems.append(f"{label}: a browser or operating system brand in marketing copy: {BRAND_RE.search(body).group(0)!r}")
        if any("style" in e["attrs"] for e in walk(main)):
            problems.append(f"{label}: an inline style attribute")

        # One primary call to action: install the extension, nothing under it.
        primary = [e for e in walk(main) if "button-primary" in classes(e)]
        cta = primary[0] if len(primary) == 1 else None
        if cta is None or cta["attrs"].get("href") != EXTENSION_HREF or "data-pp-start" not in cta["attrs"]:
            problems.append(f"{label}: needs exactly one primary button, the call to action, to {EXTENSION_HREF}; found {len(primary)}")
        elif " ".join(text(cta).split()) != rec["start"]["label"]:
            problems.append(f"{label}: the call to action reads {text(cta)!r}, want {rec['start']['label']!r}")
        go = next((e for e in walk(main) if "pp-go" in classes(e)), None)
        if go is None or [c for c in go["children"] if isinstance(c, dict)] != ([cta] if cta else []) or text(go).strip() != (text(cta).strip() if cta else ""):
            problems.append(f"{label}: something sits beside or under the call to action; it stands alone")
        if cta is not None and "aria-describedby" in cta["attrs"]:
            problems.append(f"{label}: the call to action points at a note (aria-describedby); it needs none")
        for e in walk(main):
            if "data-pp-annotation" in e["attrs"]:
                marks = [m for m in walk(e) if "pp-annot-mark" in classes(m)]
                if "pp-annot" not in classes(e) or "caption" in classes(e) or not marks or not text(marks[0]).strip():
                    problems.append(f"{label}: a reviewer annotation must be drawn as one (pp-annot, its mark), never a caption")

        order = [e["attrs"] for e in walk(main)]
        where = {k: next((i for i, a in enumerate(order) if k in a), -1) for k in ("data-pp-choice", "data-pp-start", "data-pp-orbit", "data-pp-local")}
        orbits = find(main, "data-pp-orbit")
        if len(orbits) != 1 or orbits[0]["attrs"].get("aria-hidden") != "true" or any(i.get("attrs", {}).get("alt") for i in walk(orbits[0]) if i["tag"] == "img"):
            problems.append(f"{label}: the hero orbit must be one decorative (aria-hidden, empty alt) block")
        if any(e["tag"] == "figcaption" or "caption" in classes(e) for e in walk(orbits[0])) if orbits else False:
            problems.append(f"{label}: the hero orbit carries a caption; it is an illustration with no label")
        if orbits and not (where["data-pp-start"] < where["data-pp-orbit"] < where["data-pp-local"]):
            problems.append(f"{label}: the hero orbit must follow the call to action in source order")
        if orbits and any("loading" in e["attrs"] for e in walk(orbits[0]) if e["tag"] == "img"):
            problems.append(f"{label}: the hero orbit is above the fold; its images must load eagerly (no loading=lazy)")
        if not 0 <= where["data-pp-choice"] < where["data-pp-start"] < where["data-pp-local"]:
            problems.append(f"{label}: source order must be selector, call to action, then the local stage so the call to action is in a phone's first screen; got {where}")

        types = [a["id"] for a in rec["activities"]]
        radios = find(main, "data-pp-choice")
        if [r["attrs"].get("value") for r in radios] != types:
            problems.append(f"{label}: radios {[r['attrs'].get('value') for r in radios]}, want {types}")
        if [("checked" in r["attrs"]) for r in radios] != [i == 0 for i in range(len(types))]:
            problems.append(f"{label}: only the first activity type is checked at load")
        for t_id in types:
            intents = [e for e in find(main, "data-pp-for", t_id) if "data-pp-intent" in e["attrs"]]
            if len(intents) != 1:
                problems.append(f"{label}: type {t_id!r} has {len(intents)} intents, want one")
        if not find(main, "data-pp-announce"):
            problems.append(f"{label}: the announcement region is missing")
        problems.extend(f"{label}: {m}" for m in check_local_built(main, rec, root, build_dir, path))

        # The matrix: visible, every action, every cell from the canonical data.
        if any(e["tag"] == "details" for e in walk(main)):
            problems.append(f"{label}: a <details> on the page; the action matrix is visible at load")
        actions = yaml_actions(root, rec["platform"]) or []
        ids = [a["id"] for a in actions]
        mx = rec["matrix"]
        tables = find(main, "data-pp-matrix")
        if len(tables) != 1 or tables[0]["tag"] != "table" or "hidden" in tables[0]["attrs"]:
            problems.append(f"{label}: needs one visible action matrix table")
        else:
            table = tables[0]
            heads = [" ".join(text(h).split()) for h in walk(table) if h["tag"] == "th" and h["attrs"].get("scope") == "col"]
            want_heads = [mx["columns"][k] for k in ("action", "does", "limits", "cli")]
            if heads != want_heads:
                problems.append(f"{label}: matrix columns {heads}, want {want_heads}")
            rows = [r for r in walk(table) if r["tag"] == "tr" and "data-action" in r["attrs"]]
            if [r["attrs"]["data-action"] for r in rows] != ids:
                problems.append(f"{label}: matrix rows {[r['attrs']['data-action'] for r in rows]}, want {ids}")
            cli_of = {e["action"]: e["surfaces"]["cli"] for e in examples if e["platform"] == rec["platform"]}
            for row, a in zip(rows, actions):
                cells = {c["attrs"].get("data-pp-col"): c for c in walk(row) if c["tag"] == "td"}
                name = next((x for x in walk(row) if "pp-action-name" in classes(x)), None)

                def cell(key):
                    c = cells.get(key)
                    if c is None:
                        return None
                    return " ".join("".join(
                        x if isinstance(x, str) else ("" if "pp-col-label" in classes(x) else text(x))
                        for x in c["children"]).split())
                want_does = a["behavior"] or vocab.get(a["id"], {}).get("description", "")
                cli = cli_of.get(a["id"], {})
                want = {
                    "does": want_does,
                    "limits": a["limits"] or mx["none"],
                    "cli": cli.get("command") if cli.get("status") == "available" else cli.get("notes"),
                }
                if name is None or text(name).strip() != vocab.get(a["id"], {}).get("name"):
                    problems.append(f"{label}: matrix row {a['id']!r} is not named {vocab.get(a['id'], {}).get('name')!r}")
                for key, value in want.items():
                    if cell(key) != value:
                        problems.append(f"{label}: matrix {a['id']!r} {key} reads {cell(key)!r}, want {value!r}")

        # Rules of engagement, Field Manual, usage: as the record says.
        presets = find(main, "data-pp-preset")
        if [p["attrs"]["data-pp-preset"] for p in presets] != [p["label"] for p in rec["roe"]["presets"]]:
            problems.append(f"{label}: presets {[p['attrs']['data-pp-preset'] for p in presets]} do not match the record")
        for el, want in zip(presets, rec["roe"]["presets"]):
            stat = next((x for x in walk(el) if "pp-stat-n" in classes(x)), None)
            link = next((x for x in walk(el) if x["tag"] == "a"), None)
            if stat is None or text(stat).strip() != want["stat"] or link is None or not link["attrs"].get("href", "").endswith(want["source"]):
                problems.append(f"{label}: preset {want['label']!r} shows {text(stat) if stat else None!r}, not {want['stat']!r} linked to its source")
        fm = [e for e in walk(main) if "pp-fm-item" in classes(e)]
        facts = rec["fieldManual"]["facts"]
        if len(fm) != len(facts) or any(not e["attrs"].get("href", "").endswith(f["source"]) for e, f in zip(fm, facts)):
            problems.append(f"{label}: the Field Manual briefing does not link each fact to its source")
        if [" ".join(text(e).split()) for e in find(main, "data-pp-field-manual")] and len(find(main, "data-pp-field-manual")) != 1:
            problems.append(f"{label}: the Field Manual section must appear once")
        uses = find(main, "data-pp-use")
        if [u["attrs"]["data-pp-use"] for u in uses] != [i["id"] for i in rec["usage"]["items"]]:
            problems.append(f"{label}: usage cards {[u['attrs']['data-pp-use'] for u in uses]} do not match the record")
        for el, want in zip(uses, rec["usage"]["items"]):
            codes = [c for c in walk(el) if c["tag"] == "code"]
            copy = [b for b in walk(el) if "term-copy" in classes(b)]
            src = [x for x in walk(el) if x["tag"] == "a" and x["attrs"].get("href", "").endswith(want["source"])]
            if not codes or code_text(codes[0]).rstrip("\n") != want["code"]:
                problems.append(f"{label}: usage {want['id']!r} shows {code_text(codes[0]) if codes else None!r}, want the record's code")
            if not copy:
                problems.append(f"{label}: usage {want['id']!r} cannot be copied")
            if not src:
                problems.append(f"{label}: usage {want['id']!r} does not link {want['source']}")
        counts = find(main, "data-pp-rail-count")
        announcers = find(main, "data-pp-rail-announce")
        if any("aria-live" in c["attrs"] for c in counts):
            problems.append(f"{label}: the rail count is a live region; scrolling would announce every frame")
        if len(announcers) != 1 or announcers[0]["attrs"].get("aria-live") != "polite":
            problems.append(f"{label}: needs one polite live region for rail button presses")

        # Every source anchor resolves on the built site.
        for where_, _quote, href, _shown in sourced_items(rec):
            page_path, _, frag = href.partition("#")
            target = built_file(build_dir, page_path)
            if not target.is_file():
                problems.append(f"{label}: {where_} cites {page_path}, which was not built")
            elif frag and f'id="{frag}"' not in target.read_text(encoding="utf-8"):
                problems.append(f"{label}: {where_} cites #{frag}, which {page_path} does not have")

        # The matrix is a native table in a focusable, labelled scroll group.
        mt = find(main, "data-pp-matrix")
        if mt:
            if any("role" in e["attrs"] for e in walk(mt[0])) or any("pp-col-label" in classes(e) for e in walk(mt[0])):
                problems.append(f"{label}: the matrix is a native table: no ARIA roles on it and no stacked cell labels")
            wrap = next((e for e in walk(main) if "pp-matrix-scroll" in classes(e)), None)
            kids = [c for c in wrap["children"] if isinstance(c, dict)] if wrap else []
            title = [e for e in walk(main) if e["attrs"].get("id") == (wrap["attrs"].get("aria-labelledby") if wrap else None)]
            if wrap is None or kids != [mt[0]] or wrap["attrs"].get("role") != "group" or wrap["attrs"].get("tabindex") != "0" or not title:
                problems.append(f"{label}: the matrix table must sit alone in a focusable, labelled group (role=group, tabindex=0, aria-labelledby a heading) that scrolls sideways")

        # No composer: the page has no form and no text field, and nothing in <main>
        # submits anything. The site's own search form lives outside <main>.
        if any(e["tag"] == "form" for e in walk(main)):
            problems.append(f"{label}: a <form> in the page; the local stage submits nothing")
        for e in walk(main):
            if e["tag"] in ("input", "textarea", "select") and e["attrs"].get("type") not in ("radio", "button"):
                problems.append(f"{label}: a {e['tag']} ({e['attrs'].get('type') or 'text'}) in the page; the page has no field")
            if "name" in e["attrs"] and e["tag"] in ("input", "textarea", "select") and e["attrs"].get("type") != "radio":
                problems.append(f"{label}: a named {e['tag']} ({e['attrs']['name']!r}); nothing on the page is submitted")
        page_html = path.read_text(encoding="utf-8")
        for needle in (PRIVATE_ISSUE, "blowhorn-ai/blowhorn/", "blowhorn-ai/blowhorn#"):
            if needle in page_html:
                problems.append(f"{label}: names {needle!r}; the private repository and its issues never appear on a public page")

        try:
            problems.extend(check_behaviour(label, main, rec, actions, root))
        except RuntimeError as err:
            problems.append(f"{label}: {err}")
    return problems


def run(root: Path, build_dir: Path | None) -> list[str]:
    problems = check_source(root)
    if build_dir is not None:
        problems.extend(check_built(build_dir, root))
    return problems


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if argv[:1] == ["--source"]:
        problems = check_source(ROOT)
        what = "platform page data"
    else:
        build_dir = Path(argv[0]) if argv else ROOT / "public"
        if build_dir.is_dir():
            problems = run(ROOT, build_dir)
        else:
            problems = check_source(ROOT) + [f"build dir {build_dir} is missing; run make site-build first"]
        what = "platform pages"
    for item in problems:
        print(f"platform-pages: {item}", file=sys.stderr)
    print(f"checked {what}, {len(problems)} broken")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
