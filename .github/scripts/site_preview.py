"""Trusted workflow helpers. Never execute code from a preview artifact."""
import json
import html
from html.parser import HTMLParser
from urllib.parse import urlsplit
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time


PR_DIRECTORY = re.compile(r"pr-[1-9][0-9]*")



def rebase_html(text, prefix):
    """Rebase browser URL attributes only; leave copy, scripts and SRI untouched."""
    def url(value):
        if value.startswith("/") and not value.startswith(("//", prefix)):
            return prefix + value.lstrip("/")
        return value

    attributes = re.compile(r"""([\w:-]+)(\s*=\s*)(["'])(.*?)\3""", re.DOTALL)
    lines = [0]
    for match in re.finditer("\n", text):
        lines.append(match.end())
    edits = []

    def attribute(match):
        name = match[1].lower()
        value = html.unescape(match[4])
        rebased = value
        if name in {"href", "src", "poster", "action", "data-poster"}:
            rebased = url(value)
        elif name in {"data-soldiers", "data-troops", "srcset"}:
            rebased = re.sub(r"(?<!\S)/[^\s,]+", lambda item: url(item[0]), value)
        elif name == "data-sources":
            sources = json.loads(value)
            for source in sources:
                source["src"] = url(source["src"])
            rebased = json.dumps(sources, separators=(",", ":"))
        if rebased == value:
            return match[0]
        return match[1] + match[2] + match[3] + html.escape(rebased, quote=True) + match[3]

    class Tags(HTMLParser):
        def handle_starttag(self, tag, attrs):
            original = self.get_starttag_text()
            replacement = attributes.sub(attribute, original)
            if replacement != original:
                line, column = self.getpos()
                offset = lines[line - 1] + column
                edits.append((offset, len(original), replacement))

        handle_startendtag = handle_starttag

    parser = Tags(convert_charrefs=False)
    parser.feed(text)
    parser.close()
    for offset, length, replacement in reversed(edits):
        text = text[:offset] + replacement + text[offset + length:]
    return text

def metadata(root):
    if (root / "pr").is_symlink() or not (root / "pr").is_dir():
        raise ValueError("missing or unsafe metadata directory")
    result = {}
    for name, pattern in (("action", r"opened|reopened|synchronize"),
                          ("number", r"[1-9][0-9]*"), ("sha", r"[a-f0-9]{40}")):
        path = root / "pr" / name
        if path.is_symlink() or not path.is_file() or path.stat().st_size > 128:
            raise ValueError(f"missing or unsafe PR metadata: {name}")
        value = path.read_text().removesuffix("\n")
        if not re.fullmatch(pattern, value):
            raise ValueError(f"invalid PR metadata: {name}")
        result[name] = value
    return result


def validate(root, run, pr, repository):
    meta = metadata(root)
    if (run.get("event") != "pull_request"
            or run.get("path") != ".github/workflows/build-site-preview.yml"
            or run.get("repository", {}).get("full_name") != repository
            or run.get("head_sha") != meta["sha"]):
        raise ValueError("artifact does not match its originating PR workflow run")
    associated = run.get("pull_requests", [])
    if associated and int(meta["number"]) not in [item["number"] for item in associated]:
        raise ValueError("artifact PR is not associated with its workflow run")
    if (pr.get("number") != int(meta["number"])
            or pr.get("base", {}).get("ref") != "master"
            or pr.get("base", {}).get("repo", {}).get("full_name") != repository):
        raise ValueError("preview must target this repository's master branch")
    public = root / "public"
    if public.is_symlink() or not (public / "index.html").is_file():
        raise ValueError("missing public preview")
    for path in public.rglob("*"):
        if path.is_symlink() or path.name.lower() == ".git" or not (path.is_file() or path.is_dir()):
            raise ValueError("unsafe file in preview artifact")
    current = pr.get("state") == "open" and pr.get("head", {}).get("sha") == meta["sha"]
    return {"action": meta["action"], "pr_number": meta["number"], "sha": meta["sha"],
            "deploy": str(current).lower()}


def expired_previews(previews, limit):
    if limit < 1:
        raise ValueError("preview retention must be positive")
    valid = [(timestamp, name) for timestamp, name in previews if PR_DIRECTORY.fullmatch(name)]
    return [name for _, name in sorted(valid, reverse=True)[limit:]]


def output(values):
    with open(os.environ["GITHUB_OUTPUT"], "a") as stream:
        for key, value in values.items():
            stream.write(f"{key}={value}\n")


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def prune(repo, limit, attempts=5):
    # This checkout is disposable, owned by the workflow, not a source worktree.
    output({"removed_prs": "", "removed_prs_json": "[]"})
    for attempt in range(1, attempts + 1):
        git(repo, "fetch", "--quiet", "origin", "gh-pages")
        git(repo, "checkout", "--quiet", "--detach", "FETCH_HEAD")
        umbrella = repo / "pr-preview"
        previews = []
        if umbrella.is_symlink():
            raise ValueError("unsafe preview umbrella directory")
        if umbrella.exists():
            for path in umbrella.iterdir():
                if path.is_dir() and not path.is_symlink() and PR_DIRECTORY.fullmatch(path.name):
                    timestamp = git(repo, "log", "-1", "--format=%ct", "--", f"pr-preview/{path.name}")
                    previews.append((int(timestamp or 0), path.name))
        removed = expired_previews(previews, limit)
        if not removed:
            return
        for name in removed:
            shutil.rmtree(umbrella / name)
        git(repo, "add", "--", "pr-preview")
        git(repo, "-c", "user.name=github-actions[bot]", "-c",
            "user.email=41898282+github-actions[bot]@users.noreply.github.com",
            "commit", "--quiet", "--signoff", "-m", "Prune old PR previews")
        pushed = subprocess.run(["git", "-C", str(repo), "push", "origin", "HEAD:gh-pages"], check=False)
        if pushed.returncode == 0:
            numbers = [name.removeprefix("pr-") for name in removed]
            output({"removed_prs": ",".join(numbers), "removed_prs_json": json.dumps(numbers)})
            return
        if attempt < attempts:
            print(f"Prune push lost the race ({attempt}/{attempts}); retrying fresh gh-pages", flush=True)
            time.sleep(attempt * 5)
    print("::warning::Preview retention lost concurrent pushes; a later run will retry.")


def main():
    command = sys.argv[1]
    if command == "rebase":
        base_url = os.environ.get("BASE_URL") or os.environ.get("DEPLOY_PRIME_URL") or "/"
        prefix = urlsplit(base_url).path.rstrip("/") + "/"
        if prefix != "/":
            for path in Path("public").rglob("*.html"):
                path.write_text(rebase_html(path.read_text(), prefix))
    elif command == "save":
        event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
        root = Path("pr")
        root.mkdir(exist_ok=True)
        for key, value in {"action": event["action"], "number": event["number"],
                           "sha": event["pull_request"]["head"]["sha"]}.items():
            (root / key).write_text(f"{value}\n")
    elif command == "validate":
        root = Path(os.environ.get("PREVIEW_ARTIFACT", "temp-artifact"))
        meta = metadata(root)
        repository = os.environ["GITHUB_REPOSITORY"]
        pr = json.loads(subprocess.check_output(
            ["gh", "api", f"repos/{repository}/pulls/{meta['number']}"], text=True))
        run = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())["workflow_run"]
        output(validate(root, run, pr, repository))
    elif command == "prune":
        prune(Path("gh-pages-maintenance"), int(os.environ.get("PREVIEW_RETENTION_LIMIT", "6")))
    else:
        raise ValueError(f"unknown command: {command}")


if __name__ == "__main__":
    main()
