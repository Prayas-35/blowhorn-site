"""Deployment boundary and retention rules for public PR previews."""
import importlib.util
from pathlib import Path
import tempfile
import os
import subprocess
from unittest.mock import patch
import unittest

SPEC = importlib.util.spec_from_file_location("site_preview", Path(__file__).with_name("site_preview.py"))


class PreviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not Path(SPEC.origin).exists():
            return
        cls.preview = importlib.util.module_from_spec(SPEC)
        SPEC.loader.exec_module(cls.preview)

    def setUp(self):
        self.assertTrue(Path(SPEC.origin).exists(), "preview deployment validator is not implemented")
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "pr").mkdir()
        (self.root / "public").mkdir()
        (self.root / "public/index.html").write_text("preview")
        self.sha = "a" * 40
        for name, value in {"action": "synchronize", "number": "42", "sha": self.sha}.items():
            (self.root / "pr" / name).write_text(value + "\n")
        self.run = {"event": "pull_request", "path": ".github/workflows/build-site-preview.yml",
                    "head_sha": self.sha, "head_repository": {"full_name": "blowhorn-ai/blowhorn-site"}, "repository": {"full_name": "blowhorn-ai/blowhorn-site"},
                    "pull_requests": [{"number": 42}]}
        self.pr = {"number": 42, "state": "open", "head": {"sha": self.sha, "repo": {"full_name": "blowhorn-ai/blowhorn-site"}},
                   "base": {"ref": "master", "repo": {"full_name": "blowhorn-ai/blowhorn-site"}}}

    def validate(self):
        return self.preview.validate(self.root, self.run, self.pr, "blowhorn-ai/blowhorn-site")

    def test_current_open_pr_can_deploy(self):
        self.assertEqual(self.validate(), {"action": "synchronize", "pr_number": "42", "sha": self.sha, "deploy": "true"})

    def test_malformed_metadata_is_rejected(self):
        for name, value in (("number", "42\ndeploy=true"), ("number", "0"), ("sha", "abc"),
                            ("sha", "A" * 40), ("action", "closed")):
            original = (self.root / "pr" / name).read_text()
            (self.root / "pr" / name).write_text(value)
            with self.assertRaises(ValueError, msg=name):
                self.validate()
            (self.root / "pr" / name).write_text(original)

    def test_wrong_workflow_event_repository_or_sha_cannot_deploy(self):
        for key, value in (("event", "push"), ("path", ".github/workflows/evil.yml"),
                           ("head_sha", "b" * 40), ("repository", {"full_name": "other/repo"}),
                           ("pull_requests", [{"number": 99}])):
            original = self.run[key]
            self.run[key] = value
            with self.assertRaises(ValueError, msg=key):
                self.validate()
            self.run[key] = original

    def test_empty_run_pr_list_still_checks_live_pr(self):
        self.run["pull_requests"] = []
        self.assertEqual(self.validate()["deploy"], "true")

    def test_closed_or_outdated_pr_is_skipped(self):
        self.pr["state"] = "closed"
        self.assertEqual(self.validate()["deploy"], "false")
        self.pr["state"] = "open"
        self.pr["head"]["sha"] = "b" * 40
        self.assertEqual(self.validate()["deploy"], "false")

    def test_foreign_head_repository_cannot_publish_on_production_origin(self):
        for target in (self.run["head_repository"], self.pr["head"]["repo"]):
            target["full_name"] = "fork/blowhorn-site"
            self.run["pull_requests"] = []
            self.assertEqual(self.validate()["deploy"], "false")
            target["full_name"] = "blowhorn-ai/blowhorn-site"

    def test_deleted_head_repository_is_skipped_without_a_traceback(self):
        self.run["head_repository"] = None
        self.assertEqual(self.validate()["deploy"], "false")
        self.run["head_repository"] = {"full_name": "blowhorn-ai/blowhorn-site"}
        self.pr["head"]["repo"] = None
        self.assertEqual(self.validate()["deploy"], "false")

    def test_wrong_target_branch_is_rejected(self):
        self.pr["base"]["ref"] = "other"
        with self.assertRaises(ValueError):
            self.validate()

    def test_symlinks_and_git_directories_are_rejected(self):
        link = self.root / "public/link"
        link.symlink_to(self.root / "pr")
        with self.assertRaises(ValueError):
            self.validate()
        link.unlink()
        (self.root / "public/.git").mkdir()
        with self.assertRaises(ValueError):
            self.validate()

    def test_metadata_directory_cannot_be_a_symlink(self):
        (self.root / "pr").rename(self.root / "outside")
        (self.root / "pr").symlink_to(self.root / "outside", target_is_directory=True)
        with self.assertRaises(ValueError):
            self.validate()

    def test_preview_rebases_browser_urls_without_changing_examples_or_external_links(self):
        self.assertTrue(hasattr(self.preview, "rebase_html"), "preview URL rebasing is missing")
        html = ('<a href="/docs/">Docs</a><img src="/assets/a.svg">'
                '<video poster="/assets/p.webp"></video>'
                '<button data-sources="[{&quot;src&quot;:&quot;/assets/v.mp4&quot;,&quot;type&quot;:&quot;video/mp4&quot;}]" data-poster="/assets/p.webp"></button>'
                '<div data-troops="/assets/a.webp /assets/b.webp"></div>'
                '<img srcset="/assets/a.webp 1x, /assets/b.webp 2x">'
                '<a href="/pr-preview/pr-42/docs/">Already prefixed</a>'
                '<a href="https://example.test/">External</a><img src="//example.test/a">'
                '<code>"/docs/"</code><script>const path = "/docs/";</script>'
                '<script src="/js/app.js" integrity="sha256-unchanged"></script>')
        from html.parser import HTMLParser
        class Tags(HTMLParser):
            def __init__(self):
                super().__init__()
                self.tags = []
            def handle_starttag(self, tag, attrs):
                self.tags.append((tag, dict(attrs)))
        result = self.preview.rebase_html(html, "/pr-preview/pr-42/")
        parser = Tags()
        parser.feed(result)
        self.assertEqual(parser.tags[0][1]["href"], "/pr-preview/pr-42/docs/")
        self.assertEqual(parser.tags[2][1]["poster"], "/pr-preview/pr-42/assets/p.webp")
        self.assertIn('"src":"/pr-preview/pr-42/assets/v.mp4"', parser.tags[3][1]["data-sources"])
        self.assertEqual(parser.tags[4][1]["data-troops"], "/pr-preview/pr-42/assets/a.webp /pr-preview/pr-42/assets/b.webp")
        self.assertEqual(parser.tags[5][1]["srcset"], "/pr-preview/pr-42/assets/a.webp 1x, /pr-preview/pr-42/assets/b.webp 2x")
        self.assertEqual(parser.tags[6][1]["href"], "/pr-preview/pr-42/docs/")
        self.assertEqual(parser.tags[7][1]["href"], "https://example.test/")
        self.assertEqual(parser.tags[8][1]["src"], "//example.test/a")
        self.assertIn('<code>"/docs/"</code>', result)
        self.assertIn('const path = "/docs/";', result)
        self.assertIn('integrity="sha256-unchanged"', result)
        self.assertEqual(self.preview.rebase_html(result, "/pr-preview/pr-42/"), result)

    def test_keeps_six_most_recent_previews(self):
        previews = [(n, f"pr-{n}") for n in range(1, 9)]
        self.assertEqual(self.preview.expired_previews(previews, 6), ["pr-2", "pr-1"])
        self.assertEqual(self.preview.expired_previews(previews[:6], 6), [])

    def test_retention_timestamp_ties_prefer_higher_pr_number(self):
        self.assertEqual(self.preview.expired_previews([(1, "pr-9"), (1, "pr-10")], 1), ["pr-9"])

    def test_retention_ignores_non_pr_directories(self):
        previews = [(1, "pr-1"), (2, "pr-2"), (3, "not-a-pr"), (4, "pr-../escape")]
        self.assertEqual(self.preview.expired_previews(previews, 1), ["pr-1"])


class RetentionIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.preview = importlib.util.module_from_spec(SPEC)
        SPEC.loader.exec_module(self.preview)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.remote = self.root / "remote.git"
        self.seed = self.root / "seed"
        self.repo = self.root / "maintenance"
        self.out = self.root / "output"
        self.git("init", "--bare", str(self.remote))
        for path in (self.seed, self.repo):
            self.git("init", str(path))
            self.git("-C", str(path), "remote", "add", "origin", str(self.remote))
        self.git("-C", str(self.seed), "checkout", "-b", "gh-pages")
        for name in ("CNAME", ".nojekyll", "index.html"):
            (self.seed / name).write_text("production")
        for n in range(1, 9):
            directory = self.seed / "pr-preview" / f"pr-{n}"
            directory.mkdir(parents=True)
            (directory / "index.html").write_text(str(n))
            self.git("-C", str(self.seed), "add", ".")
            self.commit(self.seed, f"Preview {n}", n)
        self.git("-C", str(self.seed), "push", "origin", "HEAD:gh-pages")
        self.addCleanup(patch.stopall)
        patch.dict(os.environ, {"GITHUB_OUTPUT": str(self.out)}).start()

    def git(self, *args, env=None):
        return subprocess.check_output(["git", *args], text=True, stderr=subprocess.DEVNULL, env=env).strip()

    def commit(self, repo, message, day):
        env = {**os.environ, "GIT_AUTHOR_DATE": f"2026-01-{day:02}T00:00:00Z",
               "GIT_COMMITTER_DATE": f"2026-01-{day:02}T00:00:00Z"}
        self.git("-C", str(repo), "-c", "user.name=Preview Test", "-c", "user.email=preview@example.test",
                 "commit", "-m", message, env=env)

    def test_prunes_only_old_previews_and_preserves_production(self):
        self.preview.prune(self.repo, 6)
        self.assertEqual(sorted(p.name for p in (self.repo / "pr-preview").iterdir()),
                         [f"pr-{n}" for n in range(3, 9)])
        self.assertEqual((self.repo / "index.html").read_text(), "production")
        self.assertEqual((self.repo / "CNAME").read_text(), "production")
        self.assertTrue((self.repo / ".nojekyll").exists())
        self.assertIn('removed_prs_json=["2", "1"]', self.out.read_text())
        self.preview.prune(self.repo, 6)
        self.assertTrue(self.out.read_text().endswith("removed_prs_json=[]\n"))

    def test_lost_push_race_recomputes_retention_and_retries(self):
        run = subprocess.run
        raced = False

        def competing_push(args, **kwargs):
            nonlocal raced
            if not raced and args[:4] == ["git", "-C", str(self.repo), "push"]:
                raced = True
                # A different preview arrives after pruning chose its victims.
                directory = self.seed / "pr-preview/pr-9"
                directory.mkdir()
                (directory / "index.html").write_text("9")
                self.git("-C", str(self.seed), "add", ".")
                self.commit(self.seed, "Concurrent preview", 9)
                self.git("-C", str(self.seed), "push", "origin", "HEAD:gh-pages")
            return run(args, **kwargs)

        with patch.object(self.preview.subprocess, "run", side_effect=competing_push), patch.object(self.preview.time, "sleep"):
            self.preview.prune(self.repo, 6)
        self.assertTrue(raced)
        self.assertEqual(sorted(p.name for p in (self.repo / "pr-preview").iterdir()),
                         [f"pr-{n}" for n in range(4, 10)])
        self.assertIn('removed_prs_json=["3", "2", "1"]', self.out.read_text())


if __name__ == "__main__":
    unittest.main()
