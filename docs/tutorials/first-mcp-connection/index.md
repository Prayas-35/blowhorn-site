# Connect an assistant and send your first post


> Add the Blowhorn MCP server to Claude Desktop, read your profiles and queue, and queue a post that waits for your approval.


In this tutorial you connect Claude Desktop to Blowhorn over MCP. You
ask it to read your profiles and your queue. Then you ask it to draft
a post and queue it. You see the dry run first, you confirm it, and
the post lands in your queue waiting for your approval. Nothing is
published. It takes about ten minutes.

## Before you start

You need:

- A Mac with the Blowhorn app, version 1.61.0 or later, installed and
  signed in to your Blowhorn account. See [Install the
  app](/docs/how-to/set-up/install-the-app/).
- At least one profile signed in to LinkedIn, and mapped to its
  Google Chrome profile. See [Sign a profile in to each
  platform](/docs/how-to/set-up/platform-accounts/).
- Claude Desktop, installed and signed in.

## 1. Check the blowhorn-mcp command {#section-1-check-the-blowhorn-mcp-command}

1. Open the Blowhorn app once, then quit it if you like.
2. Open Terminal.
3. Run:

   ```bash
   ~/.local/bin/blowhorn-mcp --version
   ```

You see the Blowhorn version number. If you see
`No such file or directory`, update the app to 1.61.0 or later and
open it again.

## 2. Add Blowhorn to Claude Desktop {#section-2-add-blowhorn-to-claude-desktop}

1. In Claude Desktop, open Settings > Developer > Edit Config.
2. Replace the file's contents with this entry. Put your macOS user
   name in place of `<you>`:

   ```json
   {
     "mcpServers": {
       "blowhorn": {
         "command": "/Users/<you>/.local/bin/blowhorn-mcp",
         "args": []
       }
     }
   }
   ```

   If the file already lists other servers, add the `blowhorn` entry
   beside them inside `mcpServers` instead.
3. Save the file.
4. Quit Claude Desktop fully, then open it again.

## 3. Check that it connected {#section-3-check-that-it-connected}

Start a new chat and ask:

> Which Blowhorn tools do you have?

Claude lists tools with names such as `profile_list`, `content_list`
and `content_upsert`. There is one tool for each Blowhorn command,
except a few that uninstall Blowhorn or sign you out, which stay
hidden unless you turn them on.

If Claude has no Blowhorn tools, see Troubleshooting in [Connect an AI
assistant over MCP](/docs/how-to/set-up/connect-mcp-client/).

## 4. Read your profiles and your queue {#section-4-read-your-profiles-and-your-queue}

Ask:

> List my Blowhorn profiles, then show me what is in my content queue.

When Claude asks to use a tool, allow it. Claude calls `profile_list`
and then `content_list`. Both only read, so they run as asked. You see
your profiles by name, and each activity in the queue with its state.

Pick one profile name from the list. This tutorial calls it `<profile>`.

## 5. Ask for a draft and queue it {#section-5-ask-for-a-draft-and-queue-it}

Ask, with your profile name in place of `<profile>`:

> Draft a short LinkedIn post for profile `<profile>` saying we are
> trying out Blowhorn. Queue it with `content_upsert`, but leave
> `Approved?` empty. Show me the dry run first.

Claude calls `content_upsert`. A tool that changes anything runs as a
dry run unless the call confirms it, so nothing is written yet. Claude
tells you it was a dry run and shows the post. The tool's own result
looks like this:

```json
{
  "activity": null,
  "dry_run": true,
  "expected_fingerprint": null,
  "ok": true,
  "payload": {
    "Message Text": "...",
    "Platform": "linkedin",
    "Profile": "<profile>"
  }
}
```

## 6. Review the dry run {#section-6-review-the-dry-run}

Read the dry run. Check three things:

- `Platform` is `linkedin`.
- `Profile` is your profile.
- `Message Text` is the post you want.

There is no `Approved?` value, so the post will wait for you. If
anything is wrong, ask Claude to change it and show the dry run again.

## 7. Confirm it {#section-7-confirm-it}

Ask:

> That looks right. Run it again with confirm.

Claude calls `content_upsert` again with `confirm` set to true. This
time the activity is written. Claude reports the new activity's
number and its state, `draft`. In the tool's result, `"created"` is
true and `"state"` is `"draft"`.

`draft` means the activity is not approved, so no run picks it up.

## 8. See it in your queue {#section-8-see-it-in-your-queue}

Ask:

> Show me my content queue again.

The new activity is in the list, in state `draft`. Open the Blowhorn
app's Content screen and you see it there too, waiting for approval.

## What you did

You connected an assistant to Blowhorn, read your profiles and queue,
and queued a post. The assistant saw a dry run before anything was
written, and only your confirm wrote it. The post is still waiting for
you. The assistant cannot approve it: the `content_approve` tool
refuses an assistant in every approval mode.

When you want the post to go out, approve it yourself in the app, as in
[Approve a waiting
activity](/docs/how-to/publish/manage-the-content-worksheet/#approve-a-waiting-activity).
If you would rather not keep it, delete it from a terminal, with your
activity number in place of `<number>`:

```bash
blowhorn content delete <number> --yes
```

## Next steps

- [Connect an AI assistant over MCP](/docs/how-to/set-up/connect-mcp-client/) -
  set up ChatGPT, Codex, Cursor, VS Code, Windsurf, Gemini CLI, Zed,
  Cline or Goose, and more example prompts
- [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/) -
  why dry runs, confirms and approvals work the way they do
- [MCP server reference](/docs/reference/mcp-server/) - every tool and
  option

