#!/usr/bin/env python3
"""The Tells announcement bar stays on one line on narrow viewports.

Mobile uses bar.text_short with the Am I a Bot?/Free CTA. The cluster must
not wrap (CSS nowrap), and text_short must stay short enough for 320px.
Run with `make test-scripts`.
"""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "tells.json"
CSS = ROOT / "assets" / "css" / "site.css"
PARTIAL = ROOT / "layouts" / "_partials" / "tells-bar.html"

# Conservative cap verified against 320 CSS px with the bar's gutters,
# side lanes, CTA, and dismiss control. Longer copy wraps on mobile.
MAX_TEXT_SHORT_CHARS = 18


class TellsBarLayout(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(DATA.read_text(encoding="utf-8"))
        cls.css = CSS.read_text(encoding="utf-8")
        cls.partial = PARTIAL.read_text(encoding="utf-8")

    def test_text_short_is_drastically_short(self):
        short = self.data["bar"]["text_short"]
        self.assertLessEqual(len(short), MAX_TEXT_SHORT_CHARS, short)
        self.assertNotIn("\n", short)
        self.assertFalse(short.lower().startswith("free "), short)

    def test_partial_has_short_and_full_copy(self):
        self.assertIn("tells-bar-text-full", self.partial)
        self.assertIn("tells-bar-text-short", self.partial)
        self.assertIn("tells-bar-cluster", self.partial)
        self.assertIn("tells-bar-cta", self.partial)

    def test_cluster_never_wraps(self):
        # The cluster rule must nowrap; a wrap value reintroduces the mobile
        # two-line bar Lee rejected.
        block = re.search(
            r"\.tells-bar-cluster\s*\{([^}]+)\}",
            self.css,
            flags=re.S,
        )
        self.assertIsNotNone(block)
        body = block.group(1)
        self.assertIn("flex-wrap: nowrap", body)
        self.assertIn("white-space: nowrap", body)
        self.assertNotIn("flex-wrap: wrap", body)

    def test_message_never_wraps(self):
        block = re.search(
            r"\.tells-bar-text\s*\{([^}]+)\}",
            self.css,
            flags=re.S,
        )
        self.assertIsNotNone(block)
        self.assertIn("white-space: nowrap", block.group(1))

    def test_no_ellipsis_on_bar_text(self):
        # Ellipsis was the earlier wrong fix; keep it out of the bar rules.
        bar_css = self.css.split("Blowhorn Tells", 1)[1].split("Home band", 1)[0]
        self.assertNotIn("text-overflow: ellipsis", bar_css)
        self.assertNotIn("text-overflow:ellipsis", bar_css)


if __name__ == "__main__":
    unittest.main()
