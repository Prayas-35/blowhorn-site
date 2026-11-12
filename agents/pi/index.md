# Blowhorn for Pi

> Pi keeps its toolbox small: read, write, edit and bash. Bash is all Blowhorn needs.

## How it works

1. Install Blowhorn for Mac and the Blowhorn browser extension.
2. Small agent, small setup: No plugin needed. Pi reads AGENTS.md and runs commands through bash, so the integration is a short instructions block and a CLI that answers in JSON.
3. Say what you want. Pi turns it into blowhorn commands, and you approve what publishes.

`AGENTS.md`

```markdown
## Blowhorn

Use the blowhorn CLI for social posting. Always read before writing:
  blowhorn content list --pending --json
Writes carry the fingerprint you read:
  blowhorn content upsert --row N --expected-fingerprint <fp> --payload '<json>' --json
Never publish without a --dry-run first and my go-ahead.
```

## Try saying

- "What does the content queue owe each profile right now?"
- "Turn this README section into a Hacker News row with a title under the limit. Leave it unapproved."
- "Show me schedule status for every computer in one table."

## Commands

```bash
blowhorn content list --pending --json
blowhorn content get 18 --json
blowhorn schedule status --json
blowhorn post --check-queue --profile all
```

## Where it pays off

- **Low ceremony**: No server, no extension for the agent, no second config format. If Pi can run it in bash, Pi can run your launch.
- **Context you can read**: Everything Pi does is a visible blowhorn command with JSON output, so the transcript doubles as an audit trail.
- **Check before you post**: post --check-queue shows pending posts without publishing anything. A good first command for a new agent.

## What Pi can do on each platform

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

**Do I need a Pi package for Blowhorn?** No. Pi only needs blowhorn on its PATH.

**What if a post fails mid-run?** Within a run, Blowhorn doesn't retry a failed post; if a post goes out but can't be recorded, it stops that profile's queue; scheduled retries are off by default. Pi will see that in the output and can tell you.

**Does my agent see my social passwords?** No. Blowhorn posts through your own signed-in browser; the agent only runs commands and reads their output. Review what you allow it to run, as with any tool that acts on your accounts.

