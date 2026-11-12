# Why your assistant rehearses first

Every write through the Blowhorn MCP server is a dry run until you confirm. What a rehearsal shows, what to check before you say go, why an agent can never approve its own content, and what approval mode and secrets handling add.


When an assistant can act in your accounts, the question is not whether it is clever. It is what happens when it is wrong. Blowhorn's answer is a rehearsal by default: every write returns a dry run, and nothing becomes real until the assistant runs it again, confirmed. This article explains what that gives you and how to use it well. For the full account of how the server keeps you in control, read [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/).

## The default, in one paragraph

Blowhorn desktop 1.61.0 ships a local MCP server, `blowhorn-mcp`, that runs on your computer, with 113 tools, one per Blowhorn command. Reads run as you ask. Writes do not: a write returns what it would do, and stops. The assistant has to run the same call again, confirmed, for it to take effect. You can add your own checkpoint on top by telling the assistant to wait for your "go".

## What a dry run shows you

A rehearsal is the exact action, laid out before it happens:

- **Which profile** the action is for.
- **The final text**, as it would be posted, with links.
- **The time** it would run.
- **How many** items there are, and in what order.

It does not post, schedule or reach out. If it looks wrong, ask for another dry run. Nothing is spent.

## What to check before you say go

1. **Profile.** The most common error is the right post on the wrong profile. Read the profile name first.
2. **Time zone and day.** Check the time against your calendar and the audience's clock, not just yours.
3. **Text and links.** Read it as the audience will. Does the link go where you mean?
4. **Count.** Did you ask for three posts and get nine?
5. **Pace.** Items bunched together compete for the same readers. [The scheduling craft](/resources/articles/the-scheduling-craft/) explains spacing.
6. **Permanence.** Some places keep what you send for good. Hacker News is the clearest example ([briefing](/field-manual/hacker-news/)). Read those twice.

## How to phrase prompts so the rehearsal cannot be skipped

Say it every time, in the same order: ask for the dry run, ask to be shown it, ask the assistant to wait for "go", and only then to confirm.

```text
Queue a LinkedIn post from my company profile for Thursday 10:00 with the text in
launch.md. Do a dry run, show me the profile, text and time, and wait for me to
say "go". Do not confirm yet.
```

Then, separately:

```text
Go. Confirm it and list what is queued.
```

For reads, say so, so there is no doubt:

```text
Read only: show what is queued for tomorrow on my personal profile. Do not
change anything.
```

And when you want to approve one item and hold another:

```text
Go for the first and third. Leave the second unconfirmed and show me a new
dry run with the link fixed.
```

## An agent can never approve its own content

This is the rule that matters most. An assistant can draft, rehearse, queue and tell you what is waiting. It can never mark its own content approved. With approval mode on, whatever an agent queues waits for a person in the app, and that person's approval is the one that counts.

The reason is simple. If the writer and the approver are the same, a mistake passes straight through. Keeping them apart means a person looks at the work at the one point it can still be stopped. [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/) covers the rule in full, and [You're in control](/docs/explanation/youre-in-control/) puts it in context. Per-profile risk limits apply to agent actions as well, and pause stops everything.

## Tool results never carry secrets

What comes back to your assistant is the result of a command: text, times, counts, statuses. Tool results never carry secrets, so a transcript you share or a log you keep does not leak them. You can still undo that by pasting a secret into a prompt yourself, so do not.

## A habit worth keeping

Treat the dry run as the document you are signing. If you would not sign what is on screen, do not say go. If you cannot tell what it will do, ask the assistant to explain it, then rehearse again. A few extra seconds per write is cheap against a post you cannot take back.

## Related

- [The Blowhorn MCP server](/ai/mcp/)
- [Connect an assistant](/docs/how-to/set-up/connect-mcp-client/)
- [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/)
- [Connect an assistant and send your first post](/docs/tutorials/first-mcp-connection/)
- [You're in control](/docs/explanation/youre-in-control/)

