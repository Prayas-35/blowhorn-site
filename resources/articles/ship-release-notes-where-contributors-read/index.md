# Ship release notes everywhere your contributors read

A tagged release deserves notes written for each place your contributors read: Hacker News, GitHub, Reddit, Slack and Bluesky. Why channel-native wording beats pasting one post everywhere, and how to preview each before it goes out.


You tagged the release. The changelog is merged. Now the people who use and contribute to your project need to hear about it, and they are in five different rooms with five different manners. The tempting habit is to write one announcement and paste it. That works badly, because every room has its own expectations, and readers can tell when a post was written for somewhere else.

## Each place has its own grammar

- **GitHub.** The release page is the source of truth. Contributors want changes grouped, breaking changes first, with pull request links and thanks to the people who wrote them.
- **Hacker News.** A plain title, a link, no marketing. If you add a first comment, make it the technical story: why this release, what was hard. Hacker News is public and permanent, and asking for votes is against the rules. See the [Hacker News briefing](/field-manual/hacker-news/).
- **Reddit.** Each community has its own rules on self-promotion, flair and format. Read them and write for the community, not for your project. See the [Reddit briefing](/field-manual/reddit/).
- **Slack.** Your project or community workspace wants a short note and a link, in the right channel, maybe with a thread for questions. Walls of text get ignored.
- **Bluesky.** Short, with the one change people will care about, and a link to the notes.

Hypothesis: the same text pasted into all five reads as an announcement, not a conversation, and gets the response announcements get. Writing for the place costs a few minutes and changes who stops to read.

## Give the assistant the tag and the audience

If your assistant is not connected yet, [the first-connection tutorial](/docs/tutorials/first-mcp-connection/) gets you there. Point your assistant at the tag and the changelog, name the profile (your project profile for the project's voice, your personal profile for your own), and say who reads each place. Ask for five different drafts, not five variations of one.

Begin with a read-only check:

```text
Read only: show me the notes for the v2.4 release and what is queued on my
project profile this week. Do not change anything.
```

Then the drafts as a rehearsal:

```text
Write release notes for v2.4 from CHANGELOG.md for Hacker News, GitHub, Reddit,
Slack and Bluesky on my project profile. Write each one for its place: GitHub
groups changes with breaking changes first; Hacker News is a plain title and a
first comment on the design trade-off; Reddit follows the community's rules;
Slack is two lines and a link; Bluesky is one change and a link. Do a dry run,
show me each one in full, and wait for me to say "go". Do not confirm yet.
```

## Preview each one, Hacker News most of all

Read every dry run as the reader of that place would. Check:

- Does the Hacker News title say what the thing is, with nothing promotional in it?
- Does the Reddit draft break the community's self-promotion rule?
- Are the links the release page and not the repository root?
- Is the GitHub text accurate about breaking changes? Contributors act on it.
- Is each post going out from the right profile?

Hacker News deserves extra care because you cannot take a submission back the way you can delete a post elsewhere. If you are unsure, hold that one back and confirm the others:

```text
Go for GitHub, Slack and Bluesky only. Leave the Hacker News and Reddit drafts
unconfirmed and show me a new dry run after I have reread them.
```

Spread the timing too. A release announced in all five places in one minute looks scripted. Stagger them across a morning, which also lets you answer in each place as it opens.

## Keep a person in the loop

Every write is a dry run until the assistant re-runs it confirmed, and an agent can never approve its own content ([why](/docs/explanation/mcp-and-safety/)). With approval mode on, what it queues waits for you in the app. Pause stops everything. Per-profile risk limits apply to agent actions, so a project profile can be held to a gentler pace than a busy company one.

## Related

- [The Blowhorn MCP server](/ai/mcp/)
- [Connect an assistant](/docs/how-to/set-up/connect-mcp-client/)
- [Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/)

