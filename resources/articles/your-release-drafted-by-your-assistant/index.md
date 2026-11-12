# Your release, drafted by your assistant, fired by you

Your changelog already says what shipped. Here is how to have an assistant turn it into release posts for the networks your buyers read, queue them for a good hour, and still keep the decision to send in your own hands.


If you are the one person who is the company's public voice, a release has two jobs: ship the code, then tell the people who care. The second job is where launch week goes to die. The changelog is finished, but the posts are not, and every network wants its own wording. An assistant is good at the first draft. It should not be the one who presses send.

## Start from the changelog, not a blank page

Your changelog or release notes file is the best source you have: it is accurate, it is yours, and it already sits in the repository your assistant can read. Ask for drafts that lead with what changed for the reader, not with the version number.

Give the assistant three things: the file, the profile each post goes out from, and who reads each network. A buyer scanning LinkedIn wants the outcome. Someone on Hacker News wants the technical choice and what you gave up. Write that into the prompt, and the drafts stop sounding like the same paragraph three times.

## Pick the hour before you queue anything

Queued posts land when you say they land, so decide the time first. Hypothesis: a post does better when its first readers are awake and you can answer replies yourself. [Won or lost in the first hour](/resources/articles/won-or-lost-in-the-first-hour/) covers what each platform has and hasn't said, and [the scheduling craft](/resources/articles/the-scheduling-craft/) covers spacing. A simple rule: choose a time you will be at your desk, and leave a gap between networks so your own posts do not compete for the same first readers.

## Draft, rehearse, review, go

Blowhorn desktop 1.61.0 puts a local `blowhorn-mcp` command on your computer, so an assistant can drive Blowhorn. If you have not connected one yet, [the first-connection tutorial](/docs/tutorials/first-mcp-connection/) walks through it. Every write comes back as a dry run until the assistant runs it again, confirmed. That gives you a four-step loop, and the prompt should name every step so the assistant cannot skip one.

First, a read-only look at what is already queued, so a new release does not collide with something scheduled:

```text
Read only: list everything queued for my personal profile and my company profile
over the next seven days. Do not change anything.
```

Then the drafts, as a rehearsal:

```text
Read CHANGELOG.md for v2.4. Draft a LinkedIn post from my company profile and a
Hacker News submission from my personal profile. LinkedIn leads with the outcome
for a buyer; Hacker News leads with the technical decision and one honest
trade-off. Queue them for Tuesday 09:00 and Tuesday 11:30. Do a dry run, show me
the full payloads, and wait for me to say "go". Do not confirm yet.
```

When you reply "go", the next prompt is short:

```text
Go. Re-run both confirmed, then list what is queued and when each will fire.
```

## What to check in the dry run

A dry run is not a formality. Read it for:

- **The profile.** Is each post going out from the profile you meant, personal or company?
- **The time, in your time zone.** Off-by-one-day mistakes hide here.
- **The link.** Does it point at the release, not the repository root?
- **The wording per network.** If two drafts share a sentence, rewrite one.
- **Hacker News.** A submission is public and cannot be quietly taken back. Read the [Hacker News briefing](/field-manual/hacker-news/) before you send, and do not ask anyone to upvote.

If something is wrong, say so in plain words and ask for a new dry run. Nothing has been sent, so there is nothing to undo.

## Keep the decision yours

The assistant drafts and rehearses; you give the order. An agent can never approve its own content ([how that works](/docs/explanation/mcp-and-safety/)), and if you turn approval mode on, what it queues waits for you in the app until you release it. Pause stops everything if the news changes an hour before launch. [You're in control](/docs/explanation/youre-in-control/) shows how the pieces fit.

You still reply to the conversation yourself. Replies in the first hour are where a launch is won, and they are your voice.

## Related

- [The Blowhorn MCP server](/ai/mcp/)
- [Connect an assistant](/docs/how-to/set-up/connect-mcp-client/)
- [Hacker News in the Field Manual](/field-manual/hacker-news/)

