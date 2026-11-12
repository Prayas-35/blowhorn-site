#!/usr/bin/env python3
"""Tests for check-third-party.py: run it on small built sites and read its verdict.

Run with `make test-scripts` (CI runs it too).
"""

import subprocess
import sys
import tempfile
import tomllib
import unittest
from pathlib import Path
from urllib.parse import urlparse

SCRIPT = Path(__file__).with_name("check-third-party.py")
HUGO_TOML = Path(__file__).resolve().parents[2] / "hugo.toml"


def page(head="", body=""):
    return f"<!DOCTYPE html><html lang=\"en\"><head><title>t</title>{head}</head><body>{body}</body></html>"


class CheckThirdPartyTest(unittest.TestCase):
    def run_check(self, files, avatar_js=None):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "public"
            for name, text in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text, encoding="utf-8")
            extra = []
            if avatar_js is not None:
                source = Path(tmp) / "activity-feed.js"
                source.write_text(avatar_js, encoding="utf-8")
                extra = ["--avatar-source", str(source)]
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(root), *extra], capture_output=True, text=True, check=False
            )
        return result.returncode, result.stderr

    def assert_passes(self, files):
        code, err = self.run_check(files)
        self.assertEqual(code, 0, err)

    def assert_fails_naming(self, files, host):
        code, err = self.run_check(files)
        self.assertEqual(code, 1, err)
        self.assertIn(host, err)

    def test_first_party_page_passes(self):
        self.assert_passes({
            "index.html": page('<link rel="stylesheet" href="/css/site.css"><link rel="canonical" href="https://other.example/">',
                               '<a href="https://github.com/layer5io">GitHub</a><script src="/js/app.js"></script>'),
            "css/site.css": "body{background:url(../img/a.png)}",
            "js/app.js": 'fetch("https://api.github.com/repos/x/releases")',
        })

    def test_avatar_hosts_must_be_reviewed(self):
        home = {"index.html": page()}
        reviewed = 'export const AVATAR_HOSTS = Object.freeze([\n  "pbs.twimg.com",\n  "cdn.bsky.app",\n]);'
        code, err = self.run_check(home, reviewed)
        self.assertEqual(code, 0, err)
        code, err = self.run_check(home, reviewed.replace('"cdn.bsky.app",', '"cdn.bsky.app",\n  "img.tracker.example",'))
        self.assertEqual(code, 1, err)
        self.assertIn("img.tracker.example", err)
        code, err = self.run_check(home, "export const HOSTS = [];")
        self.assertEqual(code, 1, err)
        self.assertIn("AVATAR_HOSTS", err)

    def test_external_script_and_stylesheet_fail(self):
        self.assert_fails_naming({"index.html": page('<script src="https://cdn.example/x.js"></script>')}, "cdn.example")
        self.assert_fails_naming({"index.html": page('<link rel="stylesheet" href="https://fonts.example/f.css">')}, "fonts.example")

    def test_css_import_from_another_host_fails(self):
        self.assert_fails_naming({
            "index.html": page('<link rel="stylesheet" href="/site.css">'),
            "site.css": '@import "https://fonts.example/f.css";',
        }, "fonts.example")

    def test_newsletter_form_action_is_the_one_allowed_form_host(self):
        self.assert_passes({"index.html": page(body='<form method="post" action="https://api.blowhorn.ai/api/subscribe"><input name="email"></form>')})
        self.assert_fails_naming({"index.html": page(body='<form method="post" action="https://forms.example/post"></form>')}, "forms.example")
        self.assert_fails_naming({"index.html": page(body='<img src="https://calcotestudios.us15.list-manage.com/x.png" alt="">')}, "list-manage.com")

    def test_refresh_to_cloud_url_is_the_one_allowed_refresh_host(self):
        cloud_url = tomllib.loads(HUGO_TOML.read_text(encoding="utf-8"))["params"]["cloud_url"]
        cloud_host = urlparse(cloud_url).hostname
        self.assert_passes({"signup/index.html": page(f'<meta http-equiv="refresh" content="0; url={cloud_url}">')})
        self.assert_fails_naming({"index.html": page('<meta http-equiv="refresh" content="0; url=https://evil.example/">')},
                                 "evil.example")
        self.assert_fails_naming({"index.html": page(body=f'<img src="https://{cloud_host}/x.png" alt="">')}, cloud_host)

    def test_activity_feed_url_is_allowed_only_on_the_cloud_host(self):
        cloud_url = tomllib.loads(HUGO_TOML.read_text(encoding="utf-8"))["params"]["cloud_url"]
        self.assert_passes({"index.html": page(body=f'<aside data-feed-url="{cloud_url}/api/events/feed?page=0"></aside>')})
        self.assert_fails_naming({"index.html": page(body='<aside data-feed-url="https://evil.example/feed"></aside>')}, "evil.example")

    def test_gtag_script_src_is_the_one_allowed_analytics_load(self):
        self.assert_passes({"index.html": page('<script async src="https://www.googletagmanager.com/gtag/js?id=G-2ZLYGVE3HN"></script>'
                                               "<script>window.dataLayer = window.dataLayer || [];</script>")})
        self.assert_fails_naming({"index.html": page('<img src="https://www.googletagmanager.com/x.png" alt="">')},
                                 "googletagmanager.com")
        self.assert_fails_naming({"index.html": page('<script src="https://analytics.example/gtag.js"></script>')},
                                 "analytics.example")

    def test_loaded_script_may_name_the_gtag_host_only(self):
        self.assert_passes({
            "index.html": page('<script src="/js/consent.js" defer></script>'),
            "js/consent.js": "s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;",
        })
        self.assert_fails_naming({
            "index.html": page('<script src="/js/consent.js" defer></script>'),
            "js/consent.js": "s.src = 'https://tracker.example/t.js';",
        }, "tracker.example")

    def test_inline_script_request_fails(self):
        self.assert_fails_naming({"index.html": page(body='<script>fetch("https://tracker.example/hit")</script>')},
                                 "tracker.example")

    def test_inline_event_handler_request_fails(self):
        self.assert_fails_naming({"index.html": page(body='<button onclick="fetch(\'https://tracker.example/\')">x</button>')},
                                 "tracker.example")

    def test_inline_script_naming_disclosed_github_api_passes(self):
        self.assert_passes({"index.html": page(body='<script>fetch("https://api.github.com/repos/x/releases")</script>')})

    def test_json_ld_data_block_passes(self):
        self.assert_passes({"index.html": page('<script type="application/ld+json">{"@context": "https://schema.org", '
                                               '"author": {"url": "https://layer5.io/"}}</script>')})

    def test_script_behind_absolute_first_party_url_is_checked(self):
        self.assert_fails_naming({
            "index.html": page(body='<script src="https://blowhorn.ai/js/app.js"></script>'),
            "js/app.js": 'fetch("https://tracker.example/hit")',
        }, "tracker.example")

    def test_stylesheet_behind_absolute_first_party_url_is_checked(self):
        self.assert_fails_naming({
            "index.html": page('<link rel="stylesheet" href="https://blowhorn.ai/css/site.css">'),
            "css/site.css": "body{background:url(https://images.example/a.png)}",
        }, "images.example")

    def test_external_svg_image_href_fails(self):
        self.assert_fails_naming({"index.html": page(body='<svg><image href="https://images.example/a.png"/></svg>')},
                                 "images.example")

    def test_external_svg_use_xlink_href_fails(self):
        self.assert_fails_naming({"index.html": page(body='<svg><use xlink:href="https://sprites.example/s.svg#a"/></svg>')},
                                 "sprites.example")

    def test_link_ping_to_another_host_fails(self):
        self.assert_fails_naming({"index.html": page(body='<a href="/x" ping="/ok https://tracker.example/p">x</a>')},
                                 "tracker.example")

    def test_svg_use_of_same_document_fragment_passes(self):
        self.assert_passes({"index.html": page(body='<svg><use href="#mark-x"/></svg>')})

    def test_base_href_to_another_host_fails(self):
        self.assert_fails_naming({"index.html": page('<base href="https://cdn.example/">')}, "cdn.example")

    def test_link_rel_search_to_another_host_fails(self):
        self.assert_fails_naming({"index.html": page('<link rel="search" type="application/opensearchdescription+xml" '
                                                     'href="https://tracker.example/osd.xml">')},
                                 "tracker.example")

    def test_legacy_background_attribute_fails(self):
        self.assert_fails_naming({"index.html": page().replace("<body>", '<body background="https://images.example/a.png">')},
                                 "images.example")

    def test_svg_script_href_fails(self):
        self.assert_fails_naming({"index.html": page(body='<svg><script href="https://cdn.example/x.js"></script></svg>')},
                                 "cdn.example")

    def test_svg_namespace_fragment_use_and_outbound_link_pass(self):
        self.assert_passes({"index.html": page(body='<svg xmlns="http://www.w3.org/2000/svg"><use href="#mark-x"/></svg>'
                                                    '<a href="https://other.example/">x</a>')})

    def test_long_non_url_attribute_value_passes(self):
        path = "M12 10.8" + " 1.5-5.8" * 60
        self.assert_passes({"index.html": page(body=f'<svg viewBox="0 0 24 24"><path d="{path}"/></svg>')})


if __name__ == "__main__":
    unittest.main()
