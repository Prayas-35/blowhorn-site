# Five minutes from ~/.local/bin/blowhorn-mcp to your first dry run

Open Blowhorn once, add one command to your assistant, check it connected, read something, then rehearse your first write as a dry run and confirm it. Short, exact steps for Claude Code, Cursor, VS Code or Claude Desktop.


You ship things alone, and your launch posts are the part you least want to babysit. The quickest way to see whether an assistant can help is to try it once, on something harmless. This is the shortest path: a few exact steps, then your first write as a rehearsal. The [step-by-step tutorial](/docs/tutorials/first-mcp-connection/) covers the same ground with more detail.

## Step 1: Open Blowhorn 1.61 or later, once

Blowhorn desktop 1.61.0 writes a `blowhorn-mcp` command to `~/.local/bin` each time the app opens. It starts a local MCP server on your computer, so nothing needs hosting. Open the app, then check the file is there:

```text
ls -l ~/.local/bin/blowhorn-mcp
```

If it is missing, update the app first. [Update Blowhorn](/docs/how-to/manage/update-blowhorn/) shows how.

## Step 2: Add it to your assistant

For Claude Code, one line:

```text
claude mcp add blowhorn -- ~/.local/bin/blowhorn-mcp
```

For [Claude Code](/docs/how-to/set-up/connect-mcp-client/#claude-code), [Claude Desktop](/docs/how-to/set-up/connect-mcp-client/#claude-desktop), [Cursor](/docs/how-to/set-up/connect-mcp-client/#cursor) or [VS Code](/docs/how-to/set-up/connect-mcp-client/#vs-code-with-github-copilot), the same command goes into that app's MCP settings. The [connect guide](/docs/how-to/set-up/connect-mcp-client/) has the exact entry for each, and for other clients. Restart the assistant if it asks you to.

A note on what is not available yet: running it with `npx`, a hosted server and catalog listings are coming soon. For now, you use the local command.

## Step 3: Check it connected

In Claude Code, list your servers:

```text
claude mcp list
```

You should see `blowhorn` as connected. In other apps, look for it in the tools or MCP panel. It exposes 113 tools, one per Blowhorn command. If it shows as failed, open Blowhorn again and recheck the path. The [MCP server reference](/docs/reference/mcp-server/) lists the details.

## Step 4: Make your first ask read-only

Begin with something that cannot change anything, and say so:

```text
Read only: list my Blowhorn profiles and what is queued for the next three days.
Do not change anything.
```

Reads run as asked. You are checking two things: the assistant can reach Blowhorn, and the profiles you see are the ones you expect. If a profile is missing, check the [profiles reference](/docs/reference/profiles/) first.

## Step 5: Your first write, as a dry run

Now ask for a small post, and ask for the rehearsal in the same breath:

```text
Draft one short post saying I am trying Blowhorn with an assistant, for my
personal profile, scheduled for tomorrow at 10:00. Do a dry run, show me the
exact text, profile and time, and wait for me to say "go". Do not confirm yet.
```

Every write comes back as a dry run until the assistant runs it again, confirmed. What you see is the payload as it would be queued. Check the profile, the time and the text. Change anything you dislike by asking for a new dry run.

## Step 6: Confirm

When it looks right:

```text
Go. Confirm it, then list what is queued and when it fires.
```

The post is now in your queue for tomorrow. The phrase "wait for me to say go" is what keeps the assistant honest; leave it out and you are relying on the default alone, which is safe but easier to misread.

## If something goes wrong

- **Nothing is listed.** Open the app and try the read again.
- **The post is wrong.** Ask for a new dry run. Nothing was sent.
- **You want it all to stop.** Pause stops everything.

When you are comfortable, read [Why your assistant rehearses first](/resources/articles/why-your-assistant-rehearses-first/) for what each rehearsal protects, and [Your release, drafted by your assistant, fired by you](/resources/articles/your-release-drafted-by-your-assistant/) for a real launch.

## Related

- [The Blowhorn MCP server](/ai/mcp/)
- [Connect an assistant and send your first post](/docs/tutorials/first-mcp-connection/)
- [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/)
- [Connect an assistant](/docs/how-to/set-up/connect-mcp-client/)
- [MCP server reference](/docs/reference/mcp-server/)

