#!/usr/bin/env python3
"""Fail if the Tells bar wraps or overflows on narrow viewports.

Uses Playwright against a built public/ tree. Widths: 320, 360, 390, 430.
Usage: check_tells_bar_layout.py [BUILD_DIR]
"""

from __future__ import annotations

import http.server
import socketserver
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WIDTHS = (320, 360, 390, 430)


def main(argv: list[str]) -> int:
    build = Path(argv[1]) if len(argv) > 1 else ROOT / "public"
    if not (build / "index.html").is_file():
        print(f"check_tells_bar_layout: missing {build}/index.html", file=sys.stderr)
        return 1
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("check_tells_bar_layout: playwright not installed; skip rendered check")
        return 0

    handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(  # noqa: E731
        *a, directory=str(build), **k
    )
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    failures: list[str] = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            for width in WIDTHS:
                page.set_viewport_size({"width": width, "height": 800})
                page.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle")
                # Force the bar visible even if localStorage dismissed it.
                page.evaluate(
                    """() => {
                      document.documentElement.removeAttribute('data-tells-bar');
                      const bar = document.querySelector('[data-tells-bar]');
                      if (bar) bar.style.display = '';
                    }"""
                )
                metrics = page.evaluate(
                    """() => {
                      const text = document.querySelector('.tells-bar-text');
                      const cta = document.querySelector('.tells-bar-cta');
                      const cluster = document.querySelector('.tells-bar-cluster');
                      const bar = document.querySelector('.tells-bar');
                      const close = document.querySelector('.tells-bar-close');
                      const short = document.querySelector('.tells-bar-text-short');
                      const full = document.querySelector('.tells-bar-text-full');
                      const tr = text.getBoundingClientRect();
                      const cr = cta.getBoundingClientRect();
                      const cl = cluster.getBoundingClientRect();
                      const br = bar.getBoundingClientRect();
                      const xr = close.getBoundingClientRect();
                      const textMid = (tr.top + tr.bottom) / 2;
                      const ctaMid = (cr.top + cr.bottom) / 2;
                      return {
                        shortShown: getComputedStyle(short).display !== 'none',
                        fullShown: getComputedStyle(full).display !== 'none',
                        shortText: short.textContent.trim(),
                        textHeight: tr.height,
                        ctaHeight: cr.height,
                        clusterHeight: cl.height,
                        sameRow: Math.abs(textMid - ctaMid) <= 4 && cl.height <= 36,
                        textWraps: tr.height > 22,
                        clusterWraps: cl.height > 36,
                        overflow: bar.scrollWidth > bar.clientWidth + 1,
                        gap: xr.left - cr.right,
                        width: window.innerWidth,
                        barScroll: bar.scrollWidth,
                        barClient: bar.clientWidth,
                      };
                    }"""
                )
                w = metrics["width"]
                if not metrics["shortShown"] or metrics["fullShown"]:
                    failures.append(f"{w}px: expected text_short only, got {metrics}")
                if not metrics["sameRow"]:
                    failures.append(f"{w}px: message and CTA not on same row: {metrics}")
                if metrics["textWraps"] or metrics["clusterWraps"]:
                    failures.append(f"{w}px: wrapped: {metrics}")
                if metrics["overflow"]:
                    failures.append(f"{w}px: horizontal overflow: {metrics}")
                if metrics["gap"] < 8:
                    failures.append(f"{w}px: dismiss too close to CTA (gap={metrics['gap']})")
                print(f"check_tells_bar_layout: {w}px ok short={metrics['shortText']!r}")
            browser.close()
    finally:
        httpd.shutdown()
    for f in failures:
        print(f, file=sys.stderr)
    if failures:
        print(f"check_tells_bar_layout: {len(failures)} problem(s)", file=sys.stderr)
        return 1
    print("check_tells_bar_layout: one line at 320/360/390/430")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
