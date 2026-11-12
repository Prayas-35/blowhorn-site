#!/usr/bin/env python3
"""Fail if the built site lost a public URL or an anchor that other places link to.

blowhorn.ai's URLs and the home page's section anchors are linked from the
README, the app, release notes and other sites, so they are a contract:
moving one breaks those links silently. The list below is every URL and
anchor the hand-written site published before the Hugo migration, and the
Trust Center under /legal/. Add to it when a new public URL or anchor ships;
remove an entry only together with a redirect (`aliases:` front matter) for
the old URL, and list that redirect in REDIRECTS.

Usage: check-site-contract.py BUILD_DIR
"""

import sys
from html.parser import HTMLParser
from pathlib import Path

# Published path -> ids that must exist on that page: the section anchors other
# pages link to, and the sprite symbols and labels the page itself references.
# The preview home pages (/home-reveille/, /home-oil/) are not listed: they were
# noindex previews, out of the sitemap and llms.txt, and are no longer built
# (`build: render: never`), so they were never part of the public contract.
PAGES = {
    "index.html": [
        "glyph-menubar", "glyph-terminal", "glyph-clock", "glyph-extension",
        "glyph-download", "main", "hero-title", "hero-art-title", "platforms", "platforms-title",
        "plat-panel-category", "plat-panel-role", "plat-panel-constellation", "plat-panel-action", "how",
        "how-title", "teams", "teams-title", "trust", "trust-title", "download", "download-title", "pricing", "pricing-title",
    ],
    "integrations/index.html": [
        "main", "integrations-title", "action-filter",
        "action-post", "action-comment", "action-reply", "action-amplify",
        "action-react", "action-follow", "action-unfollow", "action-accept",
        "action-withdraw", "action-find", "action-analytics",
    ],
    "download/index.html": [
        "main", "glyph-download", "download-title", "download-status",
    ],
    "download/thanks/index.html": [
        "main", "thanks-title", "steps", "download-fallback", "updates-email",
    ],
    "legal/index.html": [
        "main", "glance", "policies",
    ],
    "legal/privacy/index.html": [
        "main", "this-website", "on-your-machine", "in-chrome-through-the-blowhorn-extension",
        "in-your-organizations-store-on-layer5-cloud",
        "in-your-blowhorn-account",
    ],
    "legal/terms/index.html": [
        "main", "your-accounts", "downloads",
    ],
    "brand/index.html": [
        "main", "logo", "clear-space", "color", "type", "major", "thunderlung", "usage",
    ],
    "agents/index.html": [
        "main", "agents-title", "pick-title",
    ],
    "agents/claude-code/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "agents/opencode/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "agents/pi/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "agents/codex/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "agents/grok/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "agents/deepseek/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "agents/cli/index.html": [
        "main", "agent-title", "how-title", "setup-title", "commands-title", "faq-title",
    ],
    "for/index.html": [
        "main", "roles-title", "pick-title",
    ],
    "for/devrel/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "for/marketing/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "for/founders/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "for/open-source/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "for/community/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "for/agencies/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "for/social-media/index.html": [
        "main", "role-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "use-cases/index.html": [
        "main", "use-cases-title", "pick-title",
    ],
    "use-cases/launch-day/index.html": [
        "main", "use-case-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "use-cases/open-source-release/index.html": [
        "main", "use-case-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "use-cases/conference/index.html": [
        "main", "use-case-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "use-cases/linkedin-outreach/index.html": [
        "main", "use-case-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "use-cases/team-amplification/index.html": [
        "main", "use-case-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "use-cases/agent-publishing/index.html": [
        "main", "use-case-title", "pains-title", "gets-title", "faq-title", "cta-title",
    ],
    "solutions/index.html": [
        "main", "solutions-title", "by-role-title", "by-use-case-title", "by-category-title",
    ],
    "solutions/developer-distribution/index.html": [
        "main", "solution-title", "pains-title", "gets-title", "compare-title", "faq-title", "cta-title",
    ],
    "solutions/multi-profile/index.html": [
        "main", "solution-title", "pains-title", "gets-title", "compare-title", "faq-title", "cta-title",
    ],
    "solutions/linkedin-automation/index.html": [
        "main", "solution-title", "pains-title", "gets-title", "compare-title", "faq-title", "cta-title",
    ],
    "solutions/social-scheduling/index.html": [
        "main", "solution-title", "pains-title", "gets-title", "compare-title", "faq-title", "cta-title",
    ],
    "solutions/employee-advocacy/index.html": [
        "main", "solution-title", "pains-title", "gets-title", "compare-title", "faq-title", "cta-title",
    ],
    "solutions/distributed-teams/index.html": [
        "main", "solution-title", "pains-title", "gets-title", "compare-title", "faq-title", "cta-title",
    ],
    "compare/index.html": [
        "main", "matrix-title", "versus-title",
    ],
    "compare/buffer/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/hootsuite/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/sprout-social/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/later/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/publer/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/socialbee/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/metricool/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/typefully/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/postiz/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/taplio/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/expandi/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/phantombuster/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/waalaxy/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/dripify/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/authoredup/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/linked-helper/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/dux-soup/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/sociabble/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/everyonesocial/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/dsmn8/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/haiilo/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/mokumokuren/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/social-browser/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/multilogin/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/gologin/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/adspower/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/blotato/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/claude-in-chrome/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/perplexity-comet/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/thunderclap/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/thunderclap-com/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/lempod/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "compare/podawaa/index.html": [
        "main", "versus-title", "fit-title", "table-title", "belief-title", "faq-title",
    ],
    "404.html": [
        "main", "missing-title",
    ],
    "docs/index.html": [
        "main", "start", "quadrants", "platforms",
    ],
    "docs/tutorials/index.html": [
        "main",
    ],
    "docs/how-to/index.html": [
        "main",
    ],
    "docs/how-to/set-up/index.html": [
        "main",
    ],
    "docs/how-to/publish/index.html": [
        "main",
    ],
    "docs/how-to/grow/index.html": [
        "main",
    ],
    "docs/how-to/schedule/index.html": [
        "main",
    ],
    "docs/how-to/measure/index.html": [
        "main",
    ],
    "docs/how-to/settings/index.html": [
        "main",
    ],
    "docs/how-to/troubleshoot/index.html": [
        "main",
    ],
    "docs/how-to/manage/index.html": [
        "main",
    ],
    "docs/reference/index.html": [
        "main",
    ],
    "docs/reference/cli/index.html": [
        "main",
    ],
    "docs/explanation/index.html": [
        "main",
    ],
    "docs/how-to/set-up/install-the-app/index.html": [
        "main",
    ],
    "welcome/index.html": [
        "main", "download-the-app", "sign-in", "connect-chrome",
    ],
    "coming-soon/thanks/index.html": [
        "main", "thanks-title",
    ],
    "newsletter/index.html": [
        "main", "newsletter-title", "signup-form",
    ],
}
# Redirect pages: published path -> the URL its redirect page must point to.
# GitHub Pages serves no server-side redirects, so each path is a meta refresh
# plus a canonical link: a Hugo alias page (layouts/alias.html) for a moved
# page, or layouts/redirect.html for a short path into the site.
REDIRECTS = {
    "privacy.html": "https://blowhorn.ai/legal/privacy/",
    "terms.html": "https://blowhorn.ai/legal/terms/",
    "install/index.html": "/docs/how-to/set-up/install-the-app/",
}
# Other files that must be published at these paths. /signup/, /login/ and
# /early-access/ redirect to params.cloud_url, so only their presence is checked here.
FILES = [
    "signup/index.html",
    "early-access/index.html",
    "login/index.html",
    "CNAME",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "llms.txt",
    "llms-full.txt",
    "assets/brand/tokens.json",
    "assets/brand/LICENSES.md",
    "assets/brand/cards.css",
    "assets/brand/marketing/blowhorn-social-banner-16x9.png",
    "assets/brand/logo/blowhorn-favicon-32.svg",
    "assets/brand/logo/blowhorn-apple-touch-icon-180.png",
    "brand/blowhorn-brand-kit.zip",
    "brand/blowhorn-logo-kit.zip",
]


class RedirectCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refresh = None
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and (attrs.get("http-equiv") or "").lower() == "refresh":
            content = attrs.get("content") or ""
            _, _, url = content.partition("url=")
            self.refresh = url.strip()
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")


def check_redirects(root: Path) -> list:
    missing = []
    for page, target in REDIRECTS.items():
        path = root / page
        if not path.is_file():
            missing.append(f"/{page} is not published (it must redirect to {target})")
            continue
        collector = RedirectCollector()
        collector.feed(path.read_text(encoding="utf-8"))
        if collector.refresh != target:
            missing.append(f"/{page} does not redirect to {target} (refresh: {collector.refresh})")
        if collector.canonical != target:
            missing.append(f"/{page} does not name {target} as canonical (canonical: {collector.canonical})")
    return missing


class IdCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name == "id" and value:
                self.ids.add(value)


def main(root: Path) -> int:
    missing = []
    for page, ids in PAGES.items():
        path = root / page
        if not path.is_file():
            missing.append(f"/{page} is not published")
            continue
        collector = IdCollector()
        collector.feed(path.read_text(encoding="utf-8"))
        missing += [f"/{page}#{anchor} is gone" for anchor in ids if anchor not in collector.ids]
    missing += check_redirects(root)
    missing += [f"/{name} is not published" for name in FILES if not (root / name).is_file()]
    cname = root / "CNAME"
    if cname.is_file() and cname.read_text(encoding="utf-8").strip() != "blowhorn.ai":
        missing.append("/CNAME does not name blowhorn.ai")
    for item in missing:
        print(f"site contract: {item}", file=sys.stderr)
    anchors = sum(len(ids) for ids in PAGES.values())
    print(
        f"checked {len(PAGES)} page(s), {anchors} anchor(s), {len(REDIRECTS)} redirect(s)"
        f" and {len(FILES)} file(s), {len(missing)} broken"
    )
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1] if len(sys.argv) > 1 else "public")))
