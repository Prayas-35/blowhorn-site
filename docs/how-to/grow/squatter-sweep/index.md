# Sweep stalled GitHub assignments


> Find assigned-but-stalled issues, nudge the assignee, warn them, and release the assignment on a fixed grace-period progression.


Run a squatter sweep when assigned issues have gone quiet: it finds
assignees who have not acted, posts a polite fixed-template nudge, and,
after a grace period with no reply, releases the assignment so someone
else can pick the issue up. It never reassigns to another person and
never closes an issue.

```bash
blowhorn github squatters --repo owner/name --dry-run
```

A dry run is the default posture. Without `--apply` the sweep prints
exactly what it would nudge, warn, or unassign, with the backend it
resolved and the silence behind each decision, and writes nothing.
When the preview looks right, run it for real:

```bash
blowhorn github squatters --repo owner/name --apply
```

## The progression

For each assignee, silence is measured from the later of their
assignment date and their last activity -- a comment, a linked pull
request, or a status change. Any activity resets the clock.

- Silence reaches `--nudge-after-days` (default 14): a nudge is posted.
  It thanks the assignee, notes the days of silence, and asks whether
  they are still working on it or would like to hand it back.
- `--warn-after-days` (default 7) after the nudge with still no reply:
  a final warning is posted, stating the date the assignment will be
  released.
- `--unassign-after-days` (default 7) after the warning with still no
  reply: the assignee is removed and a short closing comment is posted,
  thanking them and noting the issue is open for someone else.

The same repository state always produces the same decisions and the
same comment text: the policy is a fixed rule and the bump texts are
fixed templates with only factual variables substituted. No model is
involved, and no run posts a second nudge or warning inside the same
window.

## What is never bumped

- Issues with an open linked pull request from the assignee.
- Issues labelled `blocked`, `waiting-on-maintainer`,
  `needs-maintainer`, `waiting-for-maintainer`, or `on-hold`.
- Security-related issues (labels containing `security`, plus
  `vulnerability` and `cve-*`).
- Issues whose assignee is the issue's own author.

Immediately before any write the issue is re-read, so a run never
unassigns someone who just became active. After five consecutive
backend failures the run halts and says so, rather than spraying
comments across the rest of the list.

## How it talks to GitHub

No CLI is required, and nothing is vendored: the sweep talks to
GitHub's GraphQL API over HTTPS, so it runs wherever Blowhorn runs
without a `gh` or `gh-axi` binary installed. It runs with the store's
GitHub token -- the profile's `GH_TOKEN` -- never with a second
credential, so bumps post as that profile. A token that is missing or
unauthenticated is a hard error, never a silent fallback to a different
auth context. The sweep acts as one profile only: pass a single
`--profile` naming the profile whose token it should use.

```bash
blowhorn github squatters --repo owner/name --dry-run --nudge-after-days 21
```

## Related

- [GitHub](/docs/reference/platforms/github/) - every GitHub action, side by side.
- [blowhorn github](/docs/reference/cli/github/) - the command reference.

