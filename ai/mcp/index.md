# Blowhorn MCP server

> Your assistant drafts and rehearses. You give the order. The Blowhorn MCP server gives any MCP assistant a tool for each Blowhorn command, keeps the risky ones hidden until you opt in, and every write comes back as a dry run until you say go.

## How it works

1. Open Blowhorn once: Blowhorn desktop 1.61.0 or later writes the blowhorn-mcp command to ~/.local/bin each time the app opens.
2. Add it to your assistant: One line, or one config entry, points your MCP client at that command. It starts the local server over stdio, on your computer.
3. Say what you want: Your assistant calls the tools. Reads run as asked, every write is a dry run first, and you give the order that makes it real.

`terminal`

```bash
claude mcp add blowhorn -- ~/.local/bin/blowhorn-mcp
```

`.cursor/mcp.json`

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "/Users/you/.local/bin/blowhorn-mcp"
    }
  }
}
```

## Try saying

- "Draft a release post from my personal profile for Tuesday at 9:00 and queue it. Dry run first, show me what would be queued, and wait for my go before you confirm."
- "Someone asked whether the new release works offline. Draft a reply from my company profile that answers that one question. Show me the dry run and wait for my go."
- "Read last week's numbers across my profiles and tell me which post did best. Read only, nothing gets written."
- "Pause everything, with the reason "waiting on legal review". Show me the dry run first, then confirm once I say go."

## What your assistant sees

```text
# claude mcp list
blowhorn: /Users/you/.local/bin/blowhorn-mcp - Connected

# the tools it calls, one per Blowhorn command
post                dry_run: true     (confirm: true after your go)
content_upsert      dry_run: true     (confirm: true after your go)
analytics_history   read only, runs as asked
schedule_pause      dry_run: true     (confirm: true after your go)

# hidden until you opt in by name with --allow-hidden-tool
uninstall  service_uninstall  service_adopt  auth_logout
desktop_build  desktop_install  chrome_attach_chrome_uninstall_agent
```

## Where it pays off

- **Release day**: Have your assistant turn the changelog into queued posts, dry-run each one, and wait for your go. Nothing is queued until you say so.
- **The first hour**: Ask what is due, what is queued and what needs your attention. Reads run as asked, so the answer comes straight back.
- **The weekly read-out**: Let it read last week's numbers and write Friday's summary. Nothing is written, so there is nothing to confirm.

## What your assistant can do on each platform

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

**Does it run in the cloud?** No. It runs on your own computer, through the blowhorn-mcp command the app writes. A hosted server is coming soon; it is design only today.

**Can I npx it?** Coming soon. Today, use ~/.local/bin/blowhorn-mcp, which the Blowhorn app writes each time it opens.

**Can the agent approve or publish on its own?** No. Every write is a dry run until the assistant re-runs it confirmed, and an agent can never approve its own content. With approval mode on, the work it queues waits for you in the app. [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/) has the whole picture.

**Where is the MCP server source?** The public [blowhorn-mcp repo](https://github.com/blowhorn-ai/blowhorn-mcp) on GitHub holds the launcher, the Claude Code and Cursor plugin manifests, the Gemini CLI extension, the agent skill and the listing files. The server itself ships inside the Blowhorn desktop app. The npx launcher and catalog listings are coming soon.

**Is it listed in MCP catalogs?** Coming soon.

**Does my assistant see my passwords?** No. Tool results never carry secrets. See [how the MCP server keeps you in control](/docs/explanation/mcp-and-safety/).

**Which assistants can use it?** Any MCP client that can start a local command: Claude Code, Claude Desktop, Cursor and VS Code, for example. [Connect an AI assistant over MCP](/docs/how-to/set-up/connect-mcp-client/) has the steps for each, and the [first-connection tutorial](/docs/tutorials/first-mcp-connection/) takes you through your first post.

