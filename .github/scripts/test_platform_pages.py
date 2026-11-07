#!/usr/bin/env python3
"""Platform product pages must match their data and behave (docs/platform-pages.md).

Run with `make test-scripts` (CI runs it too). The source tests copy the data,
the page file and hugo.toml into a fixture, check that check_platform_pages.py
passes them, then break one thing and check that the check names it. The built
tests build the real site once with Hugo, check the generated preview page and
run assets/js/platform-page.js against it through platform_page_harness.js, then
break the generated page or the script and check that the failure is caught.
"""

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

import check_platform_pages as check

ROOT = Path(__file__).resolve().parents[2]
HUGO = ROOT / "node_modules" / ".bin" / "hugo"
PAGE = "content/en/preview-platform-x.md"
CAST = "static/assets/brand/cast"
ROUTE = "/preview/platforms/x/"
SOURCES = (
    "content/en/docs/how-to/settings/choose-your-rules-of-engagement.md",
    "content/en/field-manual/x.md",
    "content/en/docs/how-to/set-up/connect-mcp-client.md",
    "content/en/docs/reference/cli/risk.md",
    "content/en/agents/claude-code.md",
    "content/en/docs/explanation/your-own-chrome.md",
    "content/en/docs/how-to/publish/amplify-a-post.md",
    "content/en/docs/reference/use-the-desktop-app.md",
)


def hugo_binary():
    return str(HUGO) if HUGO.is_file() else shutil.which("hugo")


class Fixture:
    """A temporary copy of what --source reads, plus the page script."""

    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        shutil.copytree(ROOT / "data", self.root / "data")
        (self.root / "content/en").mkdir(parents=True)
        shutil.copy(ROOT / PAGE, self.root / PAGE)
        # The public pages the record's sourced facts and snippets quote.
        for rel in SOURCES:
            (self.root / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(ROOT / rel, self.root / rel)
        shutil.copy(ROOT / "hugo.toml", self.root / "hugo.toml")
        shutil.copytree(ROOT / CAST, self.root / CAST)
        (self.root / "assets/css").mkdir(parents=True)
        shutil.copy(ROOT / "assets/css/platform-page.css", self.root / "assets/css/platform-page.css")
        (self.root / check.SCRIPT).parent.mkdir(parents=True)
        shutil.copy(ROOT / check.SCRIPT, self.root / check.SCRIPT)

    def data(self):
        return json.loads((self.root / "data/platform_pages.json").read_text(encoding="utf-8"))

    def write_data(self, data):
        (self.root / "data/platform_pages.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

    def edit(self, rel, old, new):
        path = self.root / rel
        text = path.read_text(encoding="utf-8")
        assert old in text, f"{old!r} not in {rel}"
        path.write_text(text.replace(old, new, 1), encoding="utf-8")

    def close(self):
        self.tmp.cleanup()


class SourceTest(unittest.TestCase):
    def setUp(self):
        self.fx = Fixture()
        self.addCleanup(self.fx.close)

    def problems(self):
        return check.check_source(self.fx.root)

    def mutate(self, fn):
        data = self.fx.data()
        fn(data["pages"][0])
        self.fx.write_data(data)
        return self.problems()

    def assertNamed(self, problems, *fragments):
        joined = "\n".join(problems)
        for fragment in fragments:
            self.assertIn(fragment, joined)

    def test_the_dry_fire_scene_is_the_desktop_app(self):
        def label(rec):
            rec["local"]["scenes"][2]["label"] = "Dry fire"
        self.assertNamed(self.mutate(label), "must say desktop")
        def relay(rec):
            del rec["local"]["scenes"][2]["relay"]
        self.assertNamed(self.mutate(relay), "relay is None, want 'Desktop app'")
        def mark(rec):
            rec["local"]["scenes"][2]["planned"]["mark"] = "Planned"
        self.assertNamed(self.mutate(mark), "must say the extension flow is planned")

    def test_the_local_introduction_is_the_approved_line(self):
        def fn(rec):
            rec["local"]["intro"] = "Your computer. Your browser. Every profile, still you."
        self.assertNamed(self.mutate(fn), "want the approved line 'Your login stays home.'")

    def test_the_boundary_text_keeps_its_quote_scope(self):
        def fn(rec):
            rec["local"]["boundary"]["text"] = "The extension acts as you, in your own signed-in browser: the tabs you have open, with the sessions you made by hand."
        self.assertNamed(self.mutate(fn), "drops the scope of its quote")

    def test_the_repository_data_passes(self):
        self.assertEqual(check.check_source(ROOT), [])
        self.assertEqual(self.problems(), [])

    def test_a_coming_soon_platform_gets_no_page(self):
        def fn(rec):
            rec["platform"] = "youtube"
        self.assertNamed(self.mutate(fn), "'youtube' is 'coming-soon'")

    def test_an_activity_must_name_an_action_the_platform_lists(self):
        def fn(rec):
            rec["activities"][1]["action"] = "comment"
        self.assertNamed(self.mutate(fn), "names 'comment', which data/platforms/x.yaml does not list")

    def test_an_activity_must_name_a_vocabulary_action(self):
        def fn(rec):
            rec["activities"][1]["action"] = "retweet"
        self.assertNamed(self.mutate(fn), "names 'retweet', not in data/actions.json")

    def test_two_activities_cannot_share_an_action(self):
        def fn(rec):
            rec["activities"][2]["action"] = "post"
        self.assertNamed(self.mutate(fn), "two activities bind action 'post'")

    def test_the_route_follows_the_platform(self):
        def fn(rec):
            rec["route"] = "/preview/platforms/twitter/"
        self.assertNamed(self.mutate(fn), "must be /preview/platforms/x/")

    def test_the_page_stays_out_of_indexes_and_search(self):
        for old, new, key in (
            ("noindex: true", "noindex: false", "noindex"),
            ("exclude_search: true", "exclude_search: false", "exclude_search"),
            ("  disable: true", "  disable: false", "sitemap.disable"),
            ("  list: never", "  list: always", "build.list"),
        ):
            with self.subTest(key=key):
                fx = Fixture()
                self.addCleanup(fx.close)
                fx.edit(PAGE, old, new)
                self.assertIn(f"front matter {key} is", "\n".join(check.check_source(fx.root)))

    def test_llms_txt_keeps_preview_out(self):
        self.fx.edit("hugo.toml", ', "/preview/**"', "")
        self.assertNamed(self.problems(), 'exclude must list "/preview/**"')

    def test_a_record_needs_its_page_and_a_page_its_record(self):
        (self.fx.root / PAGE).rename(self.fx.root / "content/en/preview-platform-bluebird.md")
        self.fx.edit("content/en/preview-platform-bluebird.md", "platform: x", "platform: bluebird")
        self.assertNamed(self.problems(), "preview-platform-x.md is missing", "for 'bluebird', which has no record")

    def test_no_em_dash_in_the_data(self):
        def fn(rec):
            rec["local"]["intro"] = "Pick a scene — and see how."
        self.assertNamed(self.mutate(fn), "carries an em dash")

    def test_every_action_needs_a_cli_example(self):
        path = self.fx.root / "data/action_examples.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["examples"] = [e for e in data["examples"] if (e["platform"], e["action"]) != ("x", "analytics")]
        path.write_text(json.dumps(data), encoding="utf-8")
        self.assertNamed(self.problems(), "no x example for 'analytics'")

    def test_a_quote_must_be_on_its_source_page(self):
        def fn(rec):
            rec["roe"]["presets"][0]["quote"] = "on X it is 13 posts a day"
            rec["roe"]["presets"][0]["stat"] = "13"
        self.assertNamed(self.mutate(fn), "does not say 'on X it is 13 posts a day'")

    def test_a_number_must_come_from_its_quote(self):
        def fn(rec):
            rec["fieldManual"]["facts"][0]["text"] = "A reply the author engages with scored 90."
        self.assertNamed(self.mutate(fn), "shows ['90'], which the quote")

    def test_a_preset_meaning_is_verbatim(self):
        def fn(rec):
            rec["roe"]["presets"][2]["means"] = "as fast as you like"
        self.assertNamed(self.mutate(fn), "does not say 'as fast as you like'")

    def test_a_snippet_must_be_on_its_source_page(self):
        def fn(rec):
            rec["usage"]["items"][1]["code"] = "blowhorn risk show --platform x --everything"
        self.assertNamed(self.mutate(fn), "usage 'cli'", "does not say")

    def test_the_skill_snippet_is_read_from_json_front_matter(self):
        self.fx.edit("content/en/agents/claude-code.md", "Preview anything that publishes with --dry-run first.", "Preview first.")
        self.assertNamed(self.problems(), "usage 'skill'")

    def test_a_source_must_be_a_page_here(self):
        def fn(rec):
            rec["fieldManual"]["facts"][1]["source"] = "/field-manual/nowhere/"
        self.assertNamed(self.mutate(fn), "is not a page under content/en/")

    def test_the_script_never_makes_a_request(self):
        for call in ("fetch('/x')", "navigator.sendBeacon('/x')", "localStorage.setItem('a', 1)", "document.cookie = 'a'"):
            with self.subTest(call=call):
                fx = Fixture()
                self.addCleanup(fx.close)
                fx.edit(str(check.SCRIPT), '    root.classList.add("is-enhanced");', f'    root.classList.add("is-enhanced");\n    {call};')
                self.assertIn("the local stage is local only", "\n".join(check.check_source(fx.root)))

    def test_a_local_scene_names_an_action_the_yaml_lists(self):
        def fn(rec):
            rec["local"]["scenes"][0]["action"] = "comment"
        self.assertNamed(self.mutate(fn), "local scene 'amplify' names 'comment', which data/platforms/x.yaml does not list")

    def test_a_local_scene_joins_a_real_yaml_text(self):
        def fn(rec):
            rec["local"]["scenes"][1]["join"] = "behavior"
        self.assertNamed(self.mutate(fn), "local scene 'follow' joins 'behavior' from 'follow'")

    def test_the_stage_has_three_scenes_in_order(self):
        def fn(rec):
            rec["local"]["scenes"].reverse()
        self.assertNamed(self.mutate(fn), "local scenes are ['dry-fire', 'follow', 'amplify']")

    def test_dry_fire_quotes_the_public_page_and_marks_the_plan(self):
        def fn(rec):
            del rec["local"]["scenes"][2]["sourced"]
        self.assertNamed(self.mutate(fn), "must quote the public dry-fire page")
        def plan(rec):
            del rec["local"]["scenes"][2]["planned"]
        self.assertNamed(self.mutate(plan), "must mark what is planned, not shipped")

    def test_a_sourced_stage_quote_must_be_on_its_page(self):
        def fn(rec):
            rec["local"]["scenes"][2]["sourced"]["quote"] = "checks the sign-in and then posts"
        self.assertNamed(self.mutate(fn), "does not say 'checks the sign-in and then posts'")

    def test_the_boundary_quote_must_be_on_its_page(self):
        def fn(rec):
            rec["local"]["boundary"]["quote"] = "a rented cloud browser that never sleeps"
        self.assertNamed(self.mutate(fn), "local boundary", "a rented cloud browser")

    def test_a_cutout_is_a_transparent_file_under_the_cast(self):
        def fn(rec):
            rec["local"]["crew"][2]["src"] = "assets/brand/cast/icons/nobody.webp"
        self.assertNamed(self.mutate(fn), "local crew assets/brand/cast/icons/nobody.webp is not under static/")
        def opaque(rec):
            rec["local"]["crew"][2]["src"] = "assets/brand/cast/mouse-marine-base.webp"
        self.assertNamed(self.mutate(opaque), "has no alpha channel")

    def test_the_stage_sits_on_the_near_black_token(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit("assets/css/platform-page.css", "  background: var(--near-black);\n  color: var(--cream);", "  background: var(--charcoal);\n  color: var(--cream);")
        self.assertIn("near-black token", "\n".join(check.check_source(fx.root)))

    def test_the_fan_fills_its_theatre(self):
        """A zero-size fan puts every spoke at the stage's origin (the geometry red)."""
        self.assertEqual(check.check_stage_geometry((self.fx.root / "assets/css/platform-page.css").read_text(encoding="utf-8")), [])
        self.assertIn(".pp-fan must fill the theatre", "\n".join(check.check_stage_geometry(".pp-fan { position: absolute; left: 0; top: 0; }")))

    def test_no_positioned_part_is_animated_on_transform(self):
        """pp-rise ends on transform: none, so an animated relay or slip loses its centring."""
        path = self.fx.root / "assets/css/platform-page.css"
        css = path.read_text(encoding="utf-8")
        self.assertEqual(check.check_stage_geometry(css), [])
        bad = css + ("\n@keyframes pp-rise { from { opacity: 0; } to { opacity: 1; transform: none; } }\n"
                     ".pp-local.is-playing .pp-relay { animation: pp-rise 480ms ease-out 1 both; }\n")
        self.assertIn("pp-rise", "\n".join(check.check_stage_geometry(bad)))

    def test_the_stage_stylesheet_has_no_loop(self):
        path = self.fx.root / "assets/css/platform-page.css"
        path.write_text(path.read_text(encoding="utf-8") + "\n.pp-x { animation: pp-draw 1s infinite; }\n", encoding="utf-8")
        self.assertNamed(self.problems(), "an infinite animation")


class LinkGuardTest(unittest.TestCase):
    """links_to finds a link to the preview however it is written."""

    def test_every_way_of_writing_the_link_is_found(self):
        for href in (
            "/preview/platforms/x/",
            "/preview/platforms/x",
            "/preview/platforms/x/#examples",
            "/preview/platforms/x?ref=nav",
            "https://blowhorn.ai/preview/platforms/x/",
            "http://localhost:1313/preview/platforms/x",
            "/blowhorn-site/preview/platforms/x/",
            "preview/platforms/x/",
            "../preview/platforms/x/",
        ):
            with self.subTest(href=href):
                self.assertTrue(check.links_to(f'<a class="n" href="{href}">x</a>', ROUTE))
                self.assertTrue(check.links_to(f"<a href='{href}'>x</a>", ROUTE))

    def test_other_pages_are_not_mistaken_for_it(self):
        for href in (
            "/preview/platforms/xylophone/",
            "/preview/platforms/x/other/",
            "/notpreview/platforms/x/",
            "/docs/reference/platforms/x/",
            "https://example.com/?next=/preview/platforms/x/",
        ):
            with self.subTest(href=href):
                self.assertFalse(check.links_to(f'<a href="{href}">x</a>', ROUTE))


class RawBuildTest(unittest.TestCase):
    """Hugo itself must refuse a record the schema refuses: an action-bearing scene with
    no join fails the build instead of falling back to a default text."""

    def build_with(self, mutate):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        site = Path(tmp.name) / "site"
        site.mkdir()
        for name in ("hugo.toml", "go.mod", "go.sum", "package.json", "postcss.config.js"):
            shutil.copy(ROOT / name, site / name)
        # static/ is 60 MB and no join check reads it. node_modules is linked, not
        # copied: Docsy's head CSS runs the repo's postcss.
        for name in ("config", "content", "data", "layouts", "assets", "api"):
            shutil.copytree(ROOT / name, site / name)
        (site / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
        path = site / "data/platform_pages.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        mutate(data)
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        return subprocess.run(
            [hugo_binary(), "--source", str(site), "--destination", str(site / "public"),
             "--cleanDestinationDir"],
            capture_output=True, text=True, check=False,
        )

    @unittest.skipUnless(hugo_binary(), "needs hugo")
    def test_an_action_scene_without_a_join_fails_the_build(self):
        control = self.build_with(lambda data: None)
        self.assertEqual(control.returncode, 0, control.stderr[-600:] + control.stdout[-600:])
        def drop_join(data):
            del data["pages"][0]["local"]["scenes"][0]["join"]
        run = self.build_with(drop_join)
        self.assertNotEqual(run.returncode, 0, "a scene with an action and no join built anyway")
        self.assertIn("sets no join", run.stdout + run.stderr)


@unittest.skipUnless(hugo_binary() and shutil.which("node"), "needs hugo and node")
class BuiltTest(unittest.TestCase):
    """The generated page, and the real script run against it."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.build = Path(cls.tmp.name) / "public"
        run = subprocess.run(
            [hugo_binary(), "--source", str(ROOT), "--destination", str(cls.build),
             "--cleanDestinationDir", "--minify", "--quiet"],
            capture_output=True, text=True, check=False,
        )
        if run.returncode != 0:
            raise RuntimeError(f"hugo failed: {run.stderr}")

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def copy(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        out = Path(tmp.name) / "public"
        shutil.copytree(self.build, out)
        return out

    def edit_page(self, build, old, new, count=1):
        path = check.built_file(build, ROUTE)
        text = path.read_text(encoding="utf-8")
        self.assertIn(old, text)
        path.write_text(text.replace(old, new, count), encoding="utf-8")

    def problems(self, build, root=ROOT):
        return "\n".join(check.check_built(build, root))

    def test_the_built_page_passes(self):
        self.assertEqual(check.check_built(self.build, ROOT), [])

    def test_every_type_swaps_the_page(self):
        tree = check.parse(check.built_file(self.build, ROUTE)).main
        rec = json.loads((ROOT / "data/platform_pages.json").read_text(encoding="utf-8"))["pages"][0]
        types = [a["id"] for a in rec["activities"]]
        states = check.run_harness(tree, {"steps": [{"choose": t} for t in types]}, ROOT)
        for state, want in zip(states[1:], types):
            self.assertEqual(state["checked"], [want])
            self.assertEqual(set(state["shown"]), {want})
            self.assertGreaterEqual(state["shown"][want], 4)  # intent, Activities chip and the stage panels

    def test_only_on_your_computer_follows_the_hero(self):
        """The local-action stage is the first section after the hero, and the page
        has no draft composer: no textarea, no form, no draft or try-on region."""
        main = check.parse(check.built_file(self.build, ROUTE)).main
        blocks = [c for c in main["children"] if isinstance(c, dict)]
        labels = [b["attrs"].get("aria-labelledby", "") for b in blocks]
        hero = labels.index("pp-title")
        self.assertEqual(labels[hero + 1], "pp-local-title")
        self.assertEqual(check.find(main, "data-pp-try"), [])
        self.assertEqual(check.find(main, "data-pp-try-text"), [])
        self.assertFalse([e for e in check.walk(main) if e["tag"] in ("textarea", "form")])
        self.assertNotIn("try on a draft", " ".join(check.text(main).split()).lower())

    def test_the_page_must_stay_noindex_and_unlinked(self):
        build = self.copy()
        self.edit_page(build, '<meta name="robots" content="noindex">', "")
        (build / "pricing/index.html").write_text(
            (build / "pricing/index.html").read_text(encoding="utf-8").replace("</main>", f'<a href="{ROUTE}">x</a></main>', 1),
            encoding="utf-8")
        found = self.problems(build)
        self.assertIn("is not noindex", found)
        self.assertIn("is linked from pricing/index.html", found)

    def test_one_primary_call_to_action(self):
        build = self.copy()
        self.edit_page(build, 'class="pp-replay ui"', 'class="pp-replay ui button-primary"')
        self.assertIn("exactly one primary button", self.problems(build))

    def test_the_call_to_action_installs_the_extension(self):
        build = self.copy()
        self.edit_page(build, f'href="{check.EXTENSION_HREF}" data-pp-start', 'href="/download/" data-pp-start')
        self.assertIn(f"to {check.EXTENSION_HREF}", self.problems(build))

    def test_the_download_page_keeps_the_same_install_path(self):
        build = self.copy()
        page = build / "download/index.html"
        page.write_text(page.read_text(encoding="utf-8").replace(check.EXTENSION_HREF, "https://example.com/ext"), encoding="utf-8")
        self.assertIn("/download/ no longer offers", self.problems(build))

    def test_nothing_sits_under_the_call_to_action(self):
        build = self.copy()
        label = json.loads((ROOT / "data/platform_pages.json").read_text(encoding="utf-8"))["pages"][0]["start"]["label"]
        self.edit_page(build, f"data-pp-start>{label}</a>", f'data-pp-start>{label}</a><p class="caption">Opens the download page.</p>')
        self.assertIn("something sits beside or under the call to action", self.problems(build))

    def test_the_local_stage_follows_the_call_to_action(self):
        """A phone stacks in source order: the call to action must not sit below the stage."""
        build = self.copy()
        path = check.built_file(build, ROUTE)
        html = path.read_text(encoding="utf-8")
        go_start = html.index('<div class="pp-go">')
        go_end = html.index("</div>", go_start) + len("</div>")
        local_start = html.index('<section class="pp-local"')
        local_end = html.index("</section>", local_start) + len("</section>")
        moved = html[:go_start] + html[go_end:local_end] + html[go_start:go_end] + html[local_end:]
        path.write_text(moved, encoding="utf-8")
        self.assertIn("source order must be selector, call to action, then the local stage", self.problems(build))

    def test_a_reviewer_note_is_never_a_caption(self):
        build = self.copy()
        self.edit_page(build, 'class="pp-annot ui" data-pp-annotation', 'class="caption" data-pp-annotation')
        self.assertIn("reviewer annotation must be drawn as one", self.problems(build))

    def test_the_matrix_is_never_collapsed(self):
        build = self.copy()
        self.edit_page(build, '<table class="pp-matrix" data-pp-matrix>', '<details><summary>Actions</summary><table class="pp-matrix" data-pp-matrix>')
        self.edit_page(build, "</table>", "</table></details>")
        self.assertIn("a <details> on the page", self.problems(build))

    def test_the_page_has_no_composer(self):
        build = self.copy()
        self.edit_page(build, '<div class="pp-matrix-head">', '<textarea name="draft"></textarea><div class="pp-matrix-head">')
        found = self.problems(build)
        self.assertIn("a named textarea", found)
        self.assertIn("a textarea (text) in the page", found)
        build = self.copy()
        self.edit_page(build, '<div class="pp-matrix-head">', '<form action="/x"><div class="pp-matrix-head">')
        self.assertIn("a <form> in the page", self.problems(build))
        build = self.copy()
        self.edit_page(build, '<div class="pp-matrix-head">', '<input type="file" accept="image/*"><div class="pp-matrix-head">')
        self.assertIn("a input (file) in the page", self.problems(build))

    def test_the_hero_orbit_follows_the_call_to_action(self):
        build = self.copy()
        path = check.built_file(build, ROUTE)
        html = path.read_text(encoding="utf-8")
        start = html.index('data-pp-orbit')
        begin = html.rindex("<div", 0, start)
        # The orbit is the block that opens at data-pp-orbit: cut it out by its own close.
        depth, i = 0, begin
        while True:
            nxt_open = html.find("<div", i + 1)
            nxt_close = html.find("</div>", i + 1)
            if nxt_open != -1 and nxt_open < nxt_close:
                depth += 1
                i = nxt_open
            else:
                if depth == 0:
                    end = nxt_close + len("</div>")
                    break
                depth -= 1
                i = nxt_close
        orbit = html[begin:end]
        moved = html[:begin] + html[end:]
        go = moved.index('<div class="pp-go">')
        moved = moved[:go] + orbit + moved[go:]
        path.write_text(moved, encoding="utf-8")
        self.assertIn("the hero orbit must follow the call to action", self.problems(build))

    def test_the_replay_button_names_no_hidden_element(self):
        build = self.copy()
        self.edit_page(build, 'data-pp-replay>', 'data-pp-replay aria-controls="pp-rig">')
        self.assertIn("points at the decorative diagram", self.problems(build))
        self.assertNotIn("points at the decorative diagram", self.problems(self.build))

    def test_the_dry_fire_diagram_is_marked_planned_beside_it(self):
        build = self.copy()
        self.edit_page(build, 'data-scene-planned="dry-fire">Extension flow planned', 'data-scene-planned="dry-fire">Shipped')
        self.assertIn("not marked as planned beside the diagram", self.problems(build))

    def test_the_hero_orbit_carries_no_caption(self):
        build = self.copy()
        self.edit_page(build, 'class="pp-orbit-tile"', 'class="pp-orbit-tile caption"')
        self.assertIn("the hero orbit carries a caption", self.problems(build))

    def test_the_field_manual_briefing_links_every_fact(self):
        build = self.copy()
        self.edit_page(build, 'class="pp-fm-item" href="', 'class="pp-fm-item" data-x="1" href="/gone/" data-y="', count=1)
        self.assertIn("the Field Manual briefing does not link each fact", self.problems(build))

    def test_the_stage_shows_every_scene_without_script(self):
        build = self.copy()
        self.edit_page(build, 'data-pp-scene-panel="follow" aria-labelledby="pp-panel-follow"', 'data-pp-scene-panel="follow" aria-labelledby="pp-panel-follow" hidden')
        self.assertIn("carries hidden in the HTML", self.problems(build))

    def test_the_stage_reads_the_platform_yaml(self):
        build = self.copy()
        self.edit_page(build, "At most 400 follows per profile a day", "At most 500 follows per profile a day")
        self.assertIn("does not show the YAML's limits for 'follow'", self.problems(build))

    def test_a_stage_cutout_that_is_opaque_is_caught(self):
        build = self.copy()
        src = next(p for p in (build / "assets/brand/cast/icons").glob("mouse-marine.webp"))
        shutil.copy(build / "assets/brand/cast/mouse-marine-base.webp", src)
        self.assertIn("is opaque; a cutout must carry alpha", self.problems(build))

    def test_the_private_issue_never_reaches_a_page(self):
        build = self.copy()
        self.edit_page(build, "Your login stays home.", "Your login stays home. blowhorn-ai/blowhorn/issues/2178")
        self.assertIn("names 'blowhorn-ai/blowhorn/issues/2178'", self.problems(build))

    def test_a_scene_plays_once_per_change(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, "      runs += 1;\n", "")
        self.assertIn("plays", self.problems(self.build, fx.root))

    def test_a_scene_announces_once_and_replay_stays_quiet(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, 'if (announce) announce.textContent = (input.getAttribute("data-title") || "") + " is showing.";', "")
        self.assertIn("announces", self.problems(self.build, fx.root))
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, 'replay.addEventListener("click", function () { play(); });',
                'replay.addEventListener("click", function () { play(); if (announce) announce.textContent = "Replaying."; });')
        self.assertIn("replay announces", self.problems(self.build, fx.root))

    def test_a_matrix_cell_that_drifts_is_caught(self):
        build = self.copy()
        self.edit_page(build, "Read-only.", "Read and write.")
        self.assertIn("matrix 'analytics' limits reads 'Read and write.'", self.problems(build))

    def test_an_action_without_limits_says_so(self):
        tree = check.parse(check.built_file(self.build, ROUTE)).main
        rec = json.loads((ROOT / "data/platform_pages.json").read_text(encoding="utf-8"))["pages"][0]
        row = next(r for r in check.walk(tree) if r["tag"] == "tr" and r["attrs"].get("data-action") == "amplify")
        self.assertIn(rec["matrix"]["none"], " ".join(check.text(row).split()))

    def test_every_setup_can_be_copied(self):
        build = self.copy()
        self.edit_page(build, 'class="term-copy"', 'class="term-nocopy"', count=3)
        self.assertIn("cannot be copied", self.problems(build))

    def test_a_dead_source_anchor_is_caught(self):
        build = self.copy()
        page = build / "field-manual/x/index.html"
        page.write_text(page.read_text(encoding="utf-8").replace('id="what-xs-ranking-rewards"', 'id="gone"'), encoding="utf-8")
        self.assertIn("cites #what-xs-ranking-rewards", self.problems(build))

    def test_clicking_the_checked_radio_changes_nothing(self):
        tree = check.parse(check.built_file(self.build, ROUTE)).main
        rec = json.loads((ROOT / "data/platform_pages.json").read_text(encoding="utf-8"))["pages"][0]
        other = rec["activities"][1]["id"]
        for step in ({"choose": other}, {"key": other}):
            runs = check.run_harness(tree, {"steps": [step]}, ROOT)
            self.assertEqual(runs[1]["checked"], [other])
            self.assertEqual(runs[1]["announceWrites"] - runs[0]["announceWrites"], 1)
        idle = check.run_harness(tree, {"steps": [{"choose": rec["activities"][0]["id"]}]}, ROOT)
        self.assertEqual(idle[1]["announceWrites"], idle[0]["announceWrites"])

    def test_the_matrix_is_a_native_table_in_a_scroll_region(self):
        build = self.copy()
        self.edit_page(build, '<th scope="row"', '<th scope="row" role="rowheader"')
        self.assertIn("a native table", self.problems(build))
        build = self.copy()
        self.edit_page(build, 'class="pp-matrix-scroll" role="group"', 'class="pp-matrix-scroll" role="presentation"')
        self.assertIn("focusable, labelled group", self.problems(build))

    def test_the_field_manual_claims_stay_in_the_quote(self):
        data = json.loads((ROOT / "data/platform_pages.json").read_text(encoding="utf-8"))
        facts = data["pages"][0]["fieldManual"]["facts"]
        self.assertNotIn("Space them out", " ".join(f["text"] for f in facts))

    def test_the_rail_never_stops_mid_card(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, "var left = Math.min(max, slides[i].offsetLeft - origin());",
                "var left = Math.min(max, slides[i].offsetLeft - origin() + 24);")
        self.assertIn("the rail stops mid-card", self.problems(self.build, fx.root))

    def test_a_script_that_forgets_a_region_is_caught(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, 'all(root, "[data-pp-for]")', 'all(root, "[data-pp-scene-text]")')
        found = self.problems(self.build, fx.root)
        self.assertIn("choosing 'respond' shows elements for", found)

    def test_a_disabled_rail_button_is_caught(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT,
                'prev.setAttribute("aria-disabled", atStart() ? "true" : "false");',
                'prev.setAttribute("aria-disabled", atStart() ? "true" : "false"); if (atStart()) prev.setAttribute("disabled", ""); else prev.removeAttribute("disabled");')
        self.assertIn("must use aria-disabled", self.problems(self.build, fx.root))

    def test_reduced_motion_is_honoured(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, 'behavior: reduced() ? "auto" : "smooth" });\n    }', 'behavior: "smooth" });\n    }')
        self.assertIn("under reduced motion the rail scrolls ['smooth']", self.problems(self.build, fx.root))

    def test_a_link_in_any_form_is_caught(self):
        for href in ("https://blowhorn.ai/preview/platforms/x/", "/preview/platforms/x", "/base/preview/platforms/x/#a"):
            with self.subTest(href=href):
                build = self.copy()
                page = build / "pricing/index.html"
                page.write_text(page.read_text(encoding="utf-8").replace("</main>", f'<a href="{href}">x</a></main>', 1), encoding="utf-8")
                self.assertIn("is linked from pricing/index.html", self.problems(build))

    def test_the_activities_intro_starts_in_the_app(self):
        tree = check.parse(check.built_file(self.build, ROUTE)).main
        section = next(e for e in check.walk(tree) if e["attrs"].get("aria-labelledby") == "pp-activities-title")
        intro = " ".join(check.text(section).split())
        self.assertIn("Start in the app", intro)
        self.assertNotIn("Start it here", intro)

    def test_the_limits_are_the_docs_limits(self):
        """Post and Respond show X's published daily caps in the matrix, the same
        text as the docs page, because both read data/platforms/x.yaml."""
        preview = " ".join(check.text(check.parse(check.built_file(self.build, ROUTE)).main).split())
        docs = " ".join(check.text(check.parse(check.built_file(self.build, "/docs/reference/platforms/x/")).main).split())
        limited = {a["id"]: a["limits"] for a in check.yaml_actions(ROOT, "x") if a["limits"]}
        for action in ("post", "reply", "follow"):
            self.assertIn(action, limited)
            self.assertIn(limited[action], preview)
            self.assertIn(limited[action], docs)
        self.assertIn("50 original posts", limited["post"])
        self.assertIn("200 replies", limited["reply"])

    def test_scrolling_the_rail_announces_nothing(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, "if (count) count.textContent = describe(inView());",
                "if (count) count.textContent = describe(inView()); if (announce) announce.textContent = describe(inView());")
        self.assertIn("scrolling the rail announced", self.problems(self.build, fx.root))

    def test_a_button_press_announces_where_the_rail_lands(self):
        fx = Fixture()
        self.addCleanup(fx.close)
        fx.edit(check.SCRIPT, 'if (announce) announce.textContent = "Showing " + describe(inView(left));', "")
        self.assertIn("paging forward announced", self.problems(self.build, fx.root))

    def test_the_rail_count_is_never_live(self):
        build = self.copy()
        self.edit_page(build, "data-pp-rail-count>", 'data-pp-rail-count aria-live="polite">')
        self.assertIn("the rail count is a live region", self.problems(build))


if __name__ == "__main__":
    unittest.main()
