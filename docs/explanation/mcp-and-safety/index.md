# How the MCP server keeps you in control


> How the MCP server, the CLI, dry runs, confirms and approvals fit together when an AI assistant drives Blowhorn.


An AI assistant that connects to Blowhorn over MCP gets no powers of
its own. It gets the commands you already run, with the same rules
around them, and a few more on top. This page explains how those
pieces fit together. The setup steps are in [Connect an AI assistant
over MCP](/docs/how-to/set-up/connect-mcp-client/), and the exact rules
are in the [MCP server reference](/docs/reference/mcp-server/).

## A thin layer over the CLI

The MCP server holds no Blowhorn logic. When an assistant calls a
tool, the server runs the matching `blowhorn` command on your computer
and hands back what it printed. There is one tool per command, built
from the same command descriptions the CLI reference is built from,
except a few that are hidden by default (see below). A new command
becomes a new tool the next time the server starts.

That design is deliberate. Every limit Blowhorn already enforces
lives in the command, not in the door you came through. Pacing, risk
limits, pauses, quiet hours, the approval gate and the rule against
posting twice all apply to a tool call because a tool call is a
command run. There is no second path that could drift from the first.

## What the server tells the assistant

Each tool carries hints that MCP clients read: whether it only reads,
whether it may destroy or overwrite something, and whether it reaches
beyond your computer. Blowhorn records those facts once per command,
in the command descriptions the tools are built from, and the server
refuses to start if any command lacks them. It never guesses.

The destructive hint draws a line between two kinds of change. An
additive tool only adds new things, such as a post, a comment, a
follow, a Slack message or a new record. Blowhorn's own bookkeeping
on the record it just acted on, such as marking a content item as
posted, does not count as changing what already exists. A
destructive tool may change or remove something that is already
there: it edits, overwrites, deletes, unfollows, pauses or stops.
Where a command could do either, it counts as destructive. A client
may ask you only before a destructive call, so keep in mind that an
additive call still reaches the outside world: a post is new, and it
is also public.

Hints are advice to the client. Many clients use them to decide when
to ask you before a call. The rules below are what Blowhorn itself
enforces, whatever the client does with the hints.

## Dry run first, confirm to act

A tool that only reads runs as asked. A tool that changes anything
runs as a dry run unless the call says `confirm`. So the first answer
to "queue this post" is a rehearsal: what would be written, with
nothing written. The assistant has to come back and confirm.

That gives you a natural place to say no. A careful assistant shows
you the dry run and asks before it confirms. Your client's own
approval prompt adds a second stop before any tool runs at all.

## Some tools stay out of reach

A few commands remove or replace your Blowhorn install or sign you
out: uninstalling Blowhorn, uninstalling the background service,
signing out, and building or installing the desktop app. Those are
hidden from MCP clients by default. An assistant cannot see them, so
it cannot call them by mistake or be talked into it.

You can serve one when you need it, by naming it in the server's
settings in your client's config. Each tool is named on its own, so
opening one never opens the rest, and a name that is not a hidden
tool stops the server at startup instead of being quietly ignored. An
opted-in tool is still a dry run until the call confirms it.

## Approvals stay with a person

The server marks every call it runs as an agent's
(`BLOWHORN_ACTOR=agent`), whatever its own environment says. Setting
`BLOWHORN_ACTOR=human` in a client's config does not change that: the
server ignores it and says so when it starts, so no config can make an
assistant look like a person. Blowhorn's approval mode reads that mark.
Under approval mode `agent` or `all`, what an assistant queues waits
for a person, and its ad-hoc actions are held the same way.

Approving is a person's act. The approve command refuses an agent
caller in every mode, so an assistant can queue work but cannot
approve it. On this server, `confirm` is the assistant's go-ahead for
a single call. It is not your approval in the app. If you want to see
every post before it goes out, use the approval mode and the queue,
not a confirmed call.

Under approval mode `off`, nothing waits. An assistant's confirmed
writes keep the approval it sets, and a confirmed action publishes.
Pick the mode that matches how much you want to check.

## Secrets stay out of the conversation

The assistant never needs your platform credentials. The commands
read them the way they always do, from your Blowhorn account
and your computer. On the way back, the server replaces any value
under a secret-named key that could carry a secret, and any
secret-shaped text, before the result reaches the client. A yes or no,
an empty value, or a value from a fixed list, such as whether a token
is set, comes through as it is, so the assistant can still tell what
is configured. It never logs a tool's arguments, because
an argument can itself be a secret.

## Local today, hosted next

This server runs on your own computer over stdio. Your client starts
it as a local process, and it acts with your sign-ins on that
computer. That is why there is no OAuth step: nothing travels over a
network to reach it.

Clients that only connect to remote servers, such as ChatGPT on the
web, cannot use it. A hosted Blowhorn MCP server is coming for them,
with its own sign-in. The same rules will hold there: dry run first,
confirm to act, and approvals kept for a person.

## Related

- [You're in control](/docs/explanation/youre-in-control/) - every safety control in
  one place, and what changes when an AI agent is driving
- [MCP server reference](/docs/reference/mcp-server/) - the tools, the
  options and the safety rules in full
- [Connect an assistant and send your first
  post](/docs/tutorials/first-mcp-connection/) - try it end to end

