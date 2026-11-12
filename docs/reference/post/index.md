# Posting: pending activities and platform behavior


> What 'pending' means for a queue activity, the one-click rule, and how posting behaves on each platform. Every flag and example is in the CLI reference.



Publishes the queue's pending activities and amplifies existing content.
This page covers what the command reference cannot say: what counts
as pending, the one-click rule, and how posting behaves on each
platform. Every flag and example for the command is in
[`blowhorn post` in the CLI reference](/docs/reference/cli/post/); the steps live
in the how-to guides under Related.

## What "pending" means

An activity is pending when "Approved?" says `yes` or `true`, "Date Promoted"
is empty, "Promote On" is due or blank, and the profile and platform
resolve. `--check-queue` lists the pending activities without publishing
anything, opening no browser and hitting no API. `--dry-run` walks the
whole run, printing what would go out, and marks nothing done.

`--dry-run --payload-stdin` is a dry fire of one post that is not saved:
the post's values (the fields `content upsert` takes, naming one Profile and
one Platform) arrive as JSON on stdin and take the same dry run, printing
each stage as it is reached (`Dry fire · signin · signed in to LinkedIn`).
It writes nothing to your Blowhorn account - no post, routine, ledger entry
or run record - and `--json` ends with the result. Hacker News is refused,
because its dry run signs in. The app's New order uses it for **Dry fire**.

```bash
echo '{"Platform": "LinkedIn", "Profile": "company", "Message Text": "Release day."}' \
  | blowhorn post --dry-run --payload-stdin --json
```

Posting is one click per run. A clicked control with no confirmation
read back is recorded as clicked, outcome not read, counted for
nothing, and never retried by the run. See
[How Blowhorn avoids repeat posts](/docs/explanation/never-twice/).

## Platform behavior

LinkedIn, X, Reddit, and Hacker News drive your Google Chrome through the
extension. Slack, Bluesky, and GitHub post through their APIs. Reddit
activities need their subreddit as `r/<name>` in "Destination" or "Amplify";
without one the activity is skipped. A "Comment on" activity addressed to a
LinkedIn or Reddit location becomes a comment under `post` as well as
under `comment`; X has no comment flow.

GitHub is amplify-only under `post`: `--platform github` needs an
`--amplify` issue or pull-request URL, or a GitHub activity's "Amplify"
column, and refuses without one.

### Tags

A tag is written in each platform's own form in that platform's "Message
Text", and is never placed on a guess:

| Platform | A tag is | What Blowhorn does |
|---|---|---|
| LinkedIn | picked from LinkedIn's own list | Refuses any post, Page post, group post, repost with thoughts or comment whose text holds `@name`, naming the activity and the tag, before Chrome opens - a dry run too. Write the name without `@` to send it as plain text. |
| X | `@handle` | Types it as written. A tag that ends a line (only spaces or punctuation before the line break) is refused, because the line break could pick from X's suggestion list instead. A thread is never split inside a tag. |
| Bluesky | `@name.domain` | Looks each handle up before the first post goes out and sends the tag linked to that account. A handle that names no account refuses the activity, with nothing sent. |
| Reddit | `u/name` or `r/name` | Types it as written. |
| Slack | `<@U…>`, a member's id | Sends it as written. A plain `@name` is plain text. |

What each platform shows for a tag that went out has not been recorded yet.

## Related

- [`blowhorn post` in the CLI reference](/docs/reference/cli/post/) - every flag and example for this command.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the run in practice.
- [Content queue columns and activity states](/docs/reference/content-queue/) - what the activities hold.
- [Platforms](/docs/reference/platforms/) - per-platform actions and limits.
- [CLI reference](/docs/reference/cli/) - every command and flag.
- [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/) - one click per run.
- [You're in control](/docs/explanation/youre-in-control/) - dry run, pace and the built-in limits.

