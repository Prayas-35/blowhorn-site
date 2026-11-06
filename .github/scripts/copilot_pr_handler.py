#!/usr/bin/env python3
"""Mark a Copilot pull request ready and approve its pending workflow runs."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

EXPECTED_REPOSITORY = "blowhorn-ai/blowhorn-site"
API_ROOT = "https://api.github.com"


def api_request(method: str, path: str, body: dict | None = None) -> dict:
    token = os.environ.get("GH_TOKEN", "")
    if not token:
        raise RuntimeError("GH_TOKEN is required")

    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(
        f"{API_ROOT}{path}",
        data=data,
        method=method,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2026-03-10",
        },
    )
    try:
        with urllib.request.urlopen(request) as response:
            payload = response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")
        raise RuntimeError(
            f"GitHub API {method} {path} failed with HTTP {error.code}: {detail}"
        ) from error
    result = json.loads(payload) if payload else {}
    if result.get("errors"):
        raise RuntimeError(f"GitHub API {method} {path} returned errors: {result['errors']}")
    return result


def handle_pull_request(
    pr_number: int,
    repository: str,
    request=api_request,
) -> tuple[bool, list[int]]:
    if repository != EXPECTED_REPOSITORY:
        raise RuntimeError(f"refusing unexpected repository: {repository!r}")

    owner, repo = repository.split("/", 1)
    pr = request("GET", f"/repos/{owner}/{repo}/pulls/{pr_number}")
    head_sha = pr.get("head", {}).get("sha")
    if not head_sha:
        raise RuntimeError(f"pull request #{pr_number} has no head SHA")

    marked_ready = False
    if pr.get("draft"):
        node_id = pr.get("node_id")
        if not node_id:
            raise RuntimeError(f"pull request #{pr_number} has no GraphQL node ID")
        request(
            "POST",
            "/graphql",
            {
                "query": """
                    mutation MarkReady($pullRequestId: ID!) {
                      markPullRequestReadyForReview(
                        input: {pullRequestId: $pullRequestId}
                      ) {
                        pullRequest { isDraft }
                      }
                    }
                """,
                "variables": {"pullRequestId": node_id},
            },
        )
        marked_ready = True

    query = urllib.parse.urlencode({"status": "action_required", "per_page": 100})
    runs = request("GET", f"/repos/{owner}/{repo}/actions/runs?{query}")
    pending = [
        run
        for run in runs.get("workflow_runs", [])
        if run.get("head_sha") == head_sha
    ]

    approved = []
    for run in pending:
        run_id = run.get("id")
        if not isinstance(run_id, int):
            raise RuntimeError("pending workflow run has no numeric ID")
        request("POST", f"/repos/{owner}/{repo}/actions/runs/{run_id}/approve")
        approved.append(run_id)

    return marked_ready, approved


def main() -> int:
    repository = os.environ.get("GITHUB_REPOSITORY", "")
    raw_pr_number = os.environ.get("PR_NUMBER", "")
    try:
        pr_number = int(raw_pr_number)
    except ValueError:
        print(f"Error: invalid PR_NUMBER: {raw_pr_number!r}", file=sys.stderr)
        return 2
    if pr_number < 1:
        print(f"Error: invalid PR_NUMBER: {raw_pr_number!r}", file=sys.stderr)
        return 2

    try:
        marked_ready, approved = handle_pull_request(pr_number, repository)
    except RuntimeError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    if marked_ready:
        print(f"Marked pull request #{pr_number} ready for review.")
    else:
        print(f"Pull request #{pr_number} was already ready for review.")
    if approved:
        print(f"Approved {len(approved)} pending workflow run(s): {approved}")
    else:
        print("No pending workflow runs matched the pull request head.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
