# Your agent drafts. You approve. Nothing posts itself.

> Hand your coding agent the Blowhorn CLI and it drafts, dry-runs and schedules posts for you. Every action is scripted, every write is a dry run until you confirm, and only posts you approve go out.

## Sound familiar?

- **An agent that posts on its own.** A model that decides what to click can post the wrong thing while you are looking away.
- **Drafts scattered across chats.** Your agent drafts a post in one chat, you paste it into a composer, and the schedule lives nowhere you can pause it.
- **Approval by hope.** If nothing in the queue stops an unapproved post, the only check is remembering to look before it goes out.

## How Blowhorn runs it

- **Scripted actions, rehearsed first.** Every action is scripted and can be dry-run first. No model decides what to click.
- **The same queue and limits you have.** Agents get the same queue and limits you do: one queue, human-paced, with CAPTCHA and 2FA handed to you.
- **Only approved posts go out.** An agent queues a draft and you approve it with blowhorn content approve. A caller marked as an agent is refused, so an agent can never approve its own content.
- **Built for agents to read.** --help with examples, --json and --check-queue, so your agent can show you what it queued and what a run would do.

## Or tell your agent

"Draft the launch post from CHANGELOG.md for LinkedIn and X, dry-run it with blowhorn post --dry-run, show me the result, then wait for me to approve it."

## Frequently Asked Questions

**Can my agent approve its own posts?** No. Activities an agent queues wait for approval, and approving is a person's act: a caller marked as an agent is refused. You approve with blowhorn content approve, and the approval records who approved it and when.

**What do I see before I approve?** --check-queue lists what a run would do, opening nothing, and --dry-run rehearses a post without sending it. With --json the output is machine-readable JSON, so your agent can show you exactly what it queued.

**Which agents work with it?** Any agent that can run the Blowhorn CLI on your own computer: Claude Code, Codex, Cursor and similar. Per-agent setup lives on the agents pages. Bring-your-own-model rules per platform and profile are Coming soon.

**Does it post as a bot?** No. Blowhorn types and clicks in your own browser, signed in as you, at human pace. The post goes out as you, never as a bot, and nothing is branded sent via Blowhorn.

