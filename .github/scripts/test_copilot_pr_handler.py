"""Tests for the Copilot pull-request handler."""

import os
import sys
import unittest
import urllib.parse
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
import copilot_pr_handler as handler  # noqa: E402


class HandlerTest(unittest.TestCase):
    def test_api_request_wraps_invalid_json(self):
        response = mock.MagicMock()
        response.__enter__.return_value.read.return_value = b"not JSON"

        with mock.patch.dict(os.environ, {"GH_TOKEN": "secret-token"}):
            with mock.patch.object(
                handler.urllib.request,
                "urlopen",
                return_value=response,
            ):
                with self.assertRaisesRegex(
                    RuntimeError,
                    r"GitHub API GET /repos/example returned invalid JSON",
                ) as raised:
                    handler.api_request("GET", "/repos/example")

        self.assertNotIn("not JSON", str(raised.exception))
        self.assertNotIn("secret-token", str(raised.exception))

    def test_api_request_wraps_network_error(self):
        network_error = handler.urllib.error.URLError("temporary DNS failure")
        with mock.patch.dict(os.environ, {"GH_TOKEN": "secret-token"}):
            with mock.patch.object(
                handler.urllib.request,
                "urlopen",
                side_effect=network_error,
            ):
                with self.assertRaisesRegex(
                    RuntimeError,
                    r"GitHub API GET /repos/example failed: temporary DNS failure",
                ) as raised:
                    handler.api_request("GET", "/repos/example")

        self.assertNotIn("secret-token", str(raised.exception))

    def test_marks_draft_ready_and_approves_only_matching_sha(self):
        calls = []

        def request(method, path, body=None):
            calls.append((method, path, body))
            if path.endswith("/pulls/42"):
                return {
                    "draft": True,
                    "node_id": "PR_node",
                    "head": {"sha": "abc123"},
                }
            if path == "/graphql":
                return {
                    "data": {
                        "markPullRequestReadyForReview": {
                            "pullRequest": {"isDraft": False}
                        }
                    }
                }
            if "/actions/runs?" in path:
                return {
                    "workflow_runs": [
                        {"id": 10, "head_sha": "abc123"},
                        {"id": 11, "head_sha": "different"},
                    ]
                }
            if path.endswith("/actions/runs/10/approve"):
                return {}
            self.fail(f"unexpected request: {method} {path}")

        marked_ready, approved = handler.handle_pull_request(
            42, handler.EXPECTED_REPOSITORY, request
        )

        self.assertTrue(marked_ready)
        self.assertEqual([10], approved)
        self.assertTrue(any(path == "/graphql" for _, path, _ in calls))
        self.assertFalse(any("/runs/11/approve" in path for _, path, _ in calls))

    def test_ready_pr_skips_graphql_and_handles_no_pending_runs(self):
        def request(method, path, body=None):
            if path.endswith("/pulls/7"):
                return {"draft": False, "head": {"sha": "def456"}}
            if "/actions/runs?" in path:
                return {"workflow_runs": []}
            self.fail(f"unexpected request: {method} {path}")

        marked_ready, approved = handler.handle_pull_request(
            7, handler.EXPECTED_REPOSITORY, request
        )

        self.assertFalse(marked_ready)
        self.assertEqual([], approved)

    def test_paginates_pending_runs_and_approves_a_second_page_match(self):
        run_pages = []

        def request(method, path, body=None):
            if path.endswith("/pulls/12"):
                return {"draft": False, "head": {"sha": "page-two-sha"}}
            if "/actions/runs?" in path:
                query = urllib.parse.parse_qs(urllib.parse.urlsplit(path).query)
                page = int(query["page"][0])
                run_pages.append(page)
                if page == 1:
                    return {
                        "workflow_runs": [
                            {"id": run_id, "head_sha": "another-sha"}
                            for run_id in range(handler.RUNS_PAGE_SIZE)
                        ]
                    }
                if page == 2:
                    return {
                        "workflow_runs": [{"id": 200, "head_sha": "page-two-sha"}]
                    }
            if path.endswith("/actions/runs/200/approve"):
                return {}
            self.fail(f"unexpected request: {method} {path}")

        marked_ready, approved = handler.handle_pull_request(
            12, handler.EXPECTED_REPOSITORY, request
        )

        self.assertFalse(marked_ready)
        self.assertEqual([200], approved)
        self.assertEqual([1, 2], run_pages)

    def test_pagination_cap_fails_closed_before_approving_runs(self):
        run_pages = []
        approval_paths = []

        def request(method, path, body=None):
            if path.endswith("/pulls/14"):
                return {"draft": False, "head": {"sha": "repeated-full-page"}}
            if "/actions/runs?" in path:
                query = urllib.parse.parse_qs(urllib.parse.urlsplit(path).query)
                page = int(query["page"][0])
                run_pages.append(page)
                return {
                    "workflow_runs": [
                        {
                            "id": page * handler.RUNS_PAGE_SIZE + run_id,
                            "head_sha": "repeated-full-page",
                        }
                        for run_id in range(handler.RUNS_PAGE_SIZE)
                    ]
                }
            if path.endswith("/approve"):
                approval_paths.append(path)
                return {}
            self.fail(f"unexpected request: {method} {path}")

        with mock.patch.object(handler, "RUNS_PAGE_LIMIT", 2):
            with self.assertRaisesRegex(RuntimeError, "exceeded 2 pages"):
                handler.handle_pull_request(
                    14, handler.EXPECTED_REPOSITORY, request
                )

        self.assertEqual([1, 2], run_pages)
        self.assertEqual([], approval_paths)

    def test_ready_mutation_must_confirm_draft_is_false(self):
        for result in (
            {
                "data": {
                    "markPullRequestReadyForReview": {
                        "pullRequest": {"isDraft": True}
                    }
                }
            },
            {"data": {"markPullRequestReadyForReview": {}}},
            {
                "data": {
                    "markPullRequestReadyForReview": {"pullRequest": None}
                }
            },
        ):
            with self.subTest(result=result):
                def request(method, path, body=None):
                    if path.endswith("/pulls/13"):
                        return {
                            "draft": True,
                            "node_id": "PR_node",
                            "head": {"sha": "abc123"},
                        }
                    if path == "/graphql":
                        return result
                    self.fail(f"unexpected request: {method} {path}")

                with self.assertRaisesRegex(RuntimeError, "did not confirm"):
                    handler.handle_pull_request(
                        13, handler.EXPECTED_REPOSITORY, request
                    )

    def test_rejects_another_repository_before_api_access(self):
        request = mock.Mock()
        with self.assertRaisesRegex(RuntimeError, "unexpected repository"):
            handler.handle_pull_request(1, "someone/fork", request)
        request.assert_not_called()

    def test_missing_head_sha_fails_closed(self):
        def request(method, path, body=None):
            return {"draft": True, "node_id": "PR_node", "head": {}}

        with self.assertRaisesRegex(RuntimeError, "no head SHA"):
            handler.handle_pull_request(9, handler.EXPECTED_REPOSITORY, request)


if __name__ == "__main__":
    unittest.main()
