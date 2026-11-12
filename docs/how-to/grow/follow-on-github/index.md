# Follow accounts


> Follow accounts on X, Bluesky, and GitHub, and unfollow on Bluesky.



Follow accounts on X, Bluesky, or GitHub with `blowhorn follow`. One
contract on all three: `--limit 0` follows only the named target, and a
positive `--limit` follows up to that many accounts drawn from the
target's follower graph, never the target itself.

```bash
# Preview: names exactly who would be followed, and follows nobody.
blowhorn follow --platform x --profile personal --target somehandle --limit 10 --dry-run

# Follow up to 10 accounts from that account's followers.
blowhorn follow --platform x --profile personal --target somehandle --limit 10

# Target-only mode: follow just the named account.
blowhorn follow --platform github --profile personal --target layer5io --limit 0

# Several accounts at once, only in target-only mode.
blowhorn follow --platform github --profile personal --target layer5io,octocat --limit 0

# Every eligible profile follows from the same target.
blowhorn follow --platform bluesky --profile all --target somehandle.bsky.social --limit 10 --exclude personal
```

Already-followed accounts are skipped, not re-followed, and counted
apart: the summary's `Followed` column counts only accounts this run
newly followed. In follower traversal they do not consume `--limit`
either: the limit bounds follows, not candidates examined. A live X run
is the exception: it reads nothing after clicking Follow, so it counts
none of its follows as followed and reports them as `clicked, outcome
not read (N)`. Those handles are still logged, so later runs skip them.

Under `--profile all`, a profile whose own handle matches a target is
left out of the run. Naming profiles explicitly makes `--exclude`, and
that self-exclusion, inert: a named profile runs even against its own
handle.

Each platform authenticates the way it always does: X through the
profile's Google Chrome session, Bluesky through its handle and app password,
GitHub through its `GH_TOKEN`
([Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/)).

## Previewing a GitHub follow run

`--dry-run` on GitHub is not a generic stop-before-the-browser gate: there
is no browser on this path. It performs the real read-side walk, paging
the target's followers and asking GitHub who is already followed, then
reports exactly who a real run would follow, issuing not a single `PUT`:

```bash
blowhorn follow --platform github --profile personal --target layer5io --limit 25 --dry-run
```

## Unfollow on Bluesky

```bash
blowhorn unfollow --platform bluesky --profile personal --target somehandle.bsky.social
```

Unfollow takes one Bluesky handle from each profile. X unfollow does not
run: it is refused before a browser opens, so no X account is unfollowed
or logged as unfollowed. Unfollow cannot be scheduled.

## When a GitHub follow fails

GitHub answers `404` rather than `403` for a token lacking the scope, so
"that account is gone" and "your token cannot follow anyone" look
identical by status. Blowhorn reads the cause off the response's own
scope headers and names the missing scope (`user:follow` for a classic
token; read and write on Followers for a fine-grained one) and the
command that stores a reissued token, instead of reporting "Not Found".
When the headers show no shortfall, the status is reported as it came
back.

A shortfall belongs to the token, so the run explains it once, in full,
and stops, rather than failing once per account.

## Related

- [Find conversations on Bluesky](/docs/how-to/grow/find-on-bluesky/) - search Bluesky
  for the accounts worth following.
- [Build a GitHub audience](/docs/how-to/grow/build-a-github-audience/) - list a
  repository's people into your account first.
- [Amplify an issue or pull request on GitHub](/docs/how-to/publish/amplify-on-github/) -
  the other GitHub path.
- [Star repositories on GitHub](/docs/how-to/grow/star-on-github/) - star the repositories
  worth endorsing, from every selected profile.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the session, login, or token each platform follows with.

