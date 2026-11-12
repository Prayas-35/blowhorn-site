# Blowhorn for Codex

> Codex follows AGENTS.md and asks before it acts outside its lane. Point it at Blowhorn and keep your finger on approve.

## How it works

1. Install Blowhorn for Mac and the Blowhorn browser extension.
2. Rules in AGENTS.md, approvals in Codex: Codex reads AGENTS.md from your repo. Blowhorn needs the network and your browser, so sandboxed Codex asks before running it. That's a feature: approve reads, think twice before publishing.
3. Say what you want. Codex turns it into blowhorn commands, and you approve what publishes.

`AGENTS.md`

```markdown
## Social posting

Tool: blowhorn (on PATH). JSON output: add --json.
1. Read: blowhorn schedule list --json, blowhorn content list --pending --json
2. Propose changes as a payload and show me
3. Write with --expected-fingerprint so you never overwrite a newer edit
4. Stop switch: blowhorn schedule pause --all --reason "<why>"
```

## Try saying

- "Read the last 30 days of operations grouped by host and tell me which computer is doing the work."
- "Schedule a daily report row at 08:00 for all profiles. Show the payload before you run it."
- "Validate every schedule row and fix the ones that fail, one upsert per row."

## Commands

```bash
blowhorn analytics operations --group-by host --since 30d --json
blowhorn schedule upsert --payload '{"Command":"report","Profile":"all","Run At":"2026-10-13 08:00:00","Recurrence":"daily"}' --json
blowhorn schedule validate --json
```

## Where it pays off

- **Unattended checks**: codex exec runs a task without the interactive UI, which suits a morning "what is due, what failed" pass.
- **Safe edits**: Every schedule and content write takes --expected-fingerprint, so a Codex edit is rejected if you changed the row first.
- **Fleet health**: analytics operations --group-by host shows which computer ran what, so Codex can spot the one that went quiet.

## What Codex can do on each platform

### LinkedIn

Your own signed-in browser, through the Blowhorn extension. [LinkedIn docs](https://blowhorn.ai/docs/reference/platforms/linkedin/)

- **[Post](https://blowhorn.ai/docs/reference/platforms/linkedin/#action-post)**: Publishes your message to your LinkedIn feed, to a group, or to a Page you manage, with an image or link preview when you add one.
- **[Comment](https://blowhorn.ai/docs/reference/platforms/linkedin/#action-comment)**: Comments on the LinkedIn post you point it at. Anything that isn't a LinkedIn post address stays a normal post.
- **[Amplify](https://blowhorn.ai/docs/reference/platforms/linkedin/#action-amplify)**: Reposts a post from each of your profiles. A post you already reposted is never reposted twice.
- **[Accept](https://blowhorn.ai/docs/reference/platforms/linkedin/#action-accept)**: Accepts the invitations people sent you, one at a time. An invitation LinkedIn flags with its "Take care when connecting" warning is skipped, never accepted. Limits: At most 20 confirmed acceptances a run, unless you set --limit.
- **[Withdraw](https://blowhorn.ai/docs/reference/platforms/linkedin/#action-withdraw)**: Withdraws invitations you sent that have waited 21 days or more, to free room for new ones. Shows a preview until you add --apply. Limits: At most 20 confirmed withdrawals a run, unless you set --limit. LinkedIn blocks re-inviting a withdrawn person for up to three weeks.
- **[Analytics](https://blowhorn.ai/docs/reference/platforms/linkedin/#action-analytics)**: Reads your Page's analytics for a date range and saves them, so you can watch the trend. Limits: Read-only.

### X (Twitter)

Your own signed-in browser, through the Blowhorn extension. [X (Twitter) docs](https://blowhorn.ai/docs/reference/platforms/x/)

- **[Post](https://blowhorn.ai/docs/reference/platforms/x/#action-post)**: Publishes your message, with an image if you add one. A message longer than 274 characters goes out as a thread. Limits: X publishes 50 original posts a day for an account without a checkmark, and no setting in Blowhorn goes past it.
- **[Reply](https://blowhorn.ai/docs/reference/platforms/x/#action-reply)**: Replies in a conversation when your post is addressed to it. Limits: X publishes 200 replies a day for an account without a checkmark, and no setting in Blowhorn goes past it.
- **[Amplify](https://blowhorn.ai/docs/reference/platforms/x/#action-amplify)**: Retweets or quotes a post from each of your profiles.
- **[Follow](https://blowhorn.ai/docs/reference/platforms/x/#action-follow)**: Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself, skipping anyone you already follow. Limits: At most 400 follows per profile a day, and 15 in any 15 minutes, counted from that profile's follow log on this computer.
- **[Analytics](https://blowhorn.ai/docs/reference/platforms/x/#action-analytics)**: Records your follower and following counts on each run, so you can watch the trend. Limits: Read-only.

### Reddit

Your own signed-in browser, through the Blowhorn extension. [Reddit docs](https://blowhorn.ai/docs/reference/platforms/reddit/)

- **[Post](https://blowhorn.ai/docs/reference/platforms/reddit/#action-post)**: Publishes your post to the subreddit you name, as r/<name>. Limits: A post with no subreddit is skipped, never guessed.
- **[Comment](https://blowhorn.ai/docs/reference/platforms/reddit/#action-comment)**: Comments on the Reddit post or comment you point it at.
- **[Amplify](https://blowhorn.ai/docs/reference/platforms/reddit/#action-amplify)**: Upvotes a post from each of your profiles.

### Hacker News

Your own browser, through the Blowhorn extension. [Hacker News docs](https://blowhorn.ai/docs/reference/platforms/hacker-news/)

- **[Post](https://blowhorn.ai/docs/reference/platforms/hacker-news/#action-post)**: Submits a link or a text post. Titles hold up to 80 characters; a longer title is refused, never cut short, because a submission can't be edited once it's up. Limits: At most 2 link submissions per profile per UTC day; only link submissions are recorded, so only they count toward the cap. Preview first with --dry-run, because every submission is permanent. Blowhorn never votes.
- **[Comment](https://blowhorn.ai/docs/reference/platforms/hacker-news/#action-comment)**: Comments on the Hacker News item your post is addressed to, under your name.

### Slack

Slack's API, never the browser. [Slack docs](https://blowhorn.ai/docs/reference/platforms/slack/)

- **[Post](https://blowhorn.ai/docs/reference/platforms/slack/#action-post)**: Sends a message as you to a channel or to a person, as #channel, @user, a channel ID, or a channel link. Shows a preview until you confirm. Limits: One profile sends per run. A target Blowhorn can't read is refused, never sent somewhere else.
- **[Reply](https://blowhorn.ai/docs/reference/platforms/slack/#action-reply)**: Replies in a thread when you give it the link to the message.

### Bluesky

Bluesky's API, never the browser. [Bluesky docs](https://blowhorn.ai/docs/reference/platforms/bluesky/)

- **[Post](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-post)**: Publishes your message. A message longer than 300 characters goes out as a thread.
- **[Reply](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-reply)**: Replies to the Bluesky post you point it at.
- **[Amplify](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-amplify)**: Reposts a post from each of your profiles.
- **[Follow](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-follow)**: Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself.
- **[Unfollow](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-unfollow)**: Unfollows one account.
- **[Find](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-find)**: Searches Bluesky posts for the words you give it.
- **[Analytics](https://blowhorn.ai/docs/reference/platforms/bluesky/#action-analytics)**: Records your follower and following counts on each run, so you can watch the trend. Limits: Read-only.

### GitHub

GitHub's API, never the browser. [GitHub docs](https://blowhorn.ai/docs/reference/platforms/github/)

- **[React](https://blowhorn.ai/docs/reference/platforms/github/#action-react)**: Adds the five upbeat reactions (+1, laugh, hooray, heart, rocket) to an issue or pull request from each of your profiles. Running it again adds none of them twice. Limits: GitHub doesn't publish posts; it needs an issue or pull request link.
- **[Follow](https://blowhorn.ai/docs/reference/platforms/github/#action-follow)**: Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself.
- **[Find](https://blowhorn.ai/docs/reference/platforms/github/#action-find)**: Lists the people around a repository, so you can choose whom to reach. Limits: Lists only; it doesn't follow or react.

## Frequently Asked Questions {#questions}

**Why does Codex ask before running blowhorn?** Blowhorn reaches the network and your browser. Approving it per command is the sensible default.

**Will two computers post the same row?** Rows are claimed with a lease, coordinated so the same post isn't sent from two computers.

**Does my agent see my social passwords?** No. Blowhorn posts through your own signed-in browser; the agent only runs commands and reads their output. Review what you allow it to run, as with any tool that acts on your accounts.

