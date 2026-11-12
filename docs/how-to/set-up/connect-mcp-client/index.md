# Connect an AI assistant over MCP


> Point Claude, ChatGPT, Codex, Cursor, VS Code, Windsurf, Gemini CLI, Zed, Cline, Goose, Muse, or Grok at the Blowhorn MCP server and let an assistant drive Blowhorn from your computer.


Connect an MCP client to the Blowhorn MCP server and an assistant can
use the Blowhorn commands, all but a few
[hidden by default](#hidden-tools): it reads your queue and analytics, drafts
and queues posts, amplifies what went out, and manages profiles. The
server runs on your own computer, and the assistant only ever acts
through the commands you already run. What the server is, how it
groups its tools, and how it keeps writes safe are in the
[MCP server reference](/docs/reference/mcp-server/). New to this?
Follow [Connect an assistant and send your first
post](/docs/tutorials/first-mcp-connection/) first.

Before you connect anything, finish Blowhorn's own setup: [install
the app](/docs/how-to/set-up/install-the-app/), [sign a profile in to each
platform](/docs/how-to/set-up/platform-accounts/), and [map each profile to its Google
Chrome profile](/docs/how-to/set-up/map-chrome-profiles/). The server takes its
credentials the way the CLI takes them, from your existing Blowhorn
config and environment, so there is no second sign-in and nothing new
to paste into a client config. Put no secrets in a client config. If a
profile is not signed in, its runs fail the way a CLI run would.

The Blowhorn app runs on macOS, and a checkout also runs on Linux.
The paths below are the macOS ones. On Linux, your home directory is
`/home/<you>` instead of `/Users/<you>`.

## Choose how to start the server

Every client starts the same server. Use the first route that fits.

### Use the blowhorn-mcp command

This is the route to use. It needs Blowhorn 1.61.0 or later.

1. Open the Blowhorn app once. It writes the `blowhorn-mcp` command to
   `~/.local/bin`.
2. Check that `~/.local/bin/blowhorn` contains the line
   `Managed by Blowhorn installer`.
3. Use `/Users/<you>/.local/bin/blowhorn-mcp` as the client's command,
   with no arguments and no `env`.

As a JSON entry, it looks like this:

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

Write the full path in a client's file. A client started from the
Dock or Finder does not have `~/.local/bin` on its PATH. A client you
set up from a terminal command can take `$HOME/.local/bin/blowhorn-mcp`,
because your shell fills in the path.

The command finds the app again if you move it, and sets
`PYTHONPATH` and `BLOWHORN_MCP_CLI` itself. If step 2 found no marker
line, another `blowhorn` sits at that path. Then add `BLOWHORN_MCP_CLI`
to the entry's environment, naming the `blowhorn` executable to use.
`blowhorn-mcp` keeps a value the client sets. In JSON that is
`"env": {"BLOWHORN_MCP_CLI": "/path/to/blowhorn"}`, in TOML a
`[mcp_servers.blowhorn.env]` table, in Goose's YAML the `envs` map, and
on a client's command line its `--env` or `-e` option.

A checkout install (`./tools/install.sh`) writes the same
`~/.local/bin/blowhorn-mcp` command, so the same entry works there.

Check the command on its own before you point a client at it:

```bash
~/.local/bin/blowhorn-mcp --version
~/.local/bin/blowhorn-mcp --list-tools
```

The first prints the Blowhorn version. The second prints the tool
list as JSON. Neither starts serving.

### Start it with npx

The [`blowhorn-mcp`](https://www.npmjs.com/package/blowhorn-mcp) npm
package is published, and listed in the official MCP Registry as
`io.github.blowhorn-ai/blowhorn`. With Node.js 20 or later, swap the
command in any entry on this page for `npx` with the arguments
`-y blowhorn-mcp`:

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "npx",
      "args": ["-y", "blowhorn-mcp"]
    }
  }
}
```

On a client's command line, the same swap is `-- npx -y blowhorn-mcp`.
It still needs the Blowhorn app installed and opened once.

To pin the launcher, add its version: `npx -y blowhorn-mcp@1.0.0`. The
latest is 1.0.0. To check that the package you run is the one listed,
run these two commands, which print the npm version and the registry entry:

```sh
npm view blowhorn-mcp version
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=blowhorn"
```

The registry entry `io.github.blowhorn-ai/blowhorn` is the listing; its
`"isLatest": true` marks the current version. Both commands need network
access and Node.js 20 or later for `npx`.

### Fallback: the app's own Python

Use this only if your app is older than 1.61.0 and has no
`blowhorn-mcp` command. It assumes the app is in `/Applications`; if
you moved it, `~/Applications` for one, change both paths to match.

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "/Applications/Blowhorn.app/Contents/Resources/engine/bin/python",
      "args": ["-P", "-m", "blowhorn.mcp_server"],
      "env": {
        "PYTHONPATH": "/Applications/Blowhorn.app/Contents/Resources/engine/engine",
        "BLOWHORN_MCP_CLI": "/Users/<you>/.local/bin/blowhorn"
      }
    }
  }
}
```

Both `env` values are needed. Without `PYTHONPATH` the server does not
start. Without `BLOWHORN_MCP_CLI`, a client started from the Dock or
Finder lists the tools, but every call fails with
`blowhorn executable not found: blowhorn`. The `-P` keeps the client's
working directory off Python's import path, so a file there can never
stand in for one of the server's own modules.

### Fallback: a checkout

Use this from a Blowhorn checkout that has no `blowhorn-mcp` command.
Fill in the checkout's real path for `/path/to/blowhorn`:

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "/path/to/blowhorn/venv/bin/python",
      "args": ["-P", "-m", "blowhorn.mcp_server"],
      "env": {"PYTHONPATH": "/path/to/blowhorn/engine"}
    }
  }
}
```

The server runs the `blowhorn` executable on your PATH. If you have
not run `make cli-install`, add `BLOWHORN_MCP_CLI` to `env`, naming the
executable. From the checkout root, `make mcp-generate` checks that the
tool list and its output schemas cover every command that is not hidden, and `make mcp-test` runs the server's
tests.

To use either fallback in a client, keep the client's file and
top-level key from its section below. Swap in this `command`, `args`
and `env`.

## Connect your client

Each section below uses the `blowhorn-mcp` command. Fill in your own
home directory for `<you>`.

### Claude Desktop

1. In Claude Desktop, open Settings > Developer > Edit Config. It opens
   `~/Library/Application Support/Claude/claude_desktop_config.json`.
2. Add the entry under `mcpServers`:

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

3. Quit Claude Desktop fully, then reopen it. It reads the file only at
   startup.

To check it, ask Claude which Blowhorn tools it has. If none show up,
read the logs in `~/Library/Logs/Claude/mcp*.log`.
[Vendor docs](https://modelcontextprotocol.io/docs/develop/connect-local-servers).

### Claude Code

Add the server for every project:

```bash
claude mcp add --scope user blowhorn -- $HOME/.local/bin/blowhorn-mcp
```

Without `--scope user`, the server is added for the current project
only. To share it with a project, put the entry in `.mcp.json` at the
project root instead:

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

Check it with `claude mcp list`, or `/mcp` inside a session.
[Vendor docs](https://code.claude.com/docs/en/mcp).

### ChatGPT

The ChatGPT desktop app can run this server. ChatGPT on the web
cannot: it connects only to remote servers over HTTPS, and this server
runs on your computer. The web needs the hosted Blowhorn MCP server,
which is coming.

In the ChatGPT desktop app:

1. Open Settings > MCP servers > Add server.
2. Choose STDIO.
3. Enter the command `/Users/<you>/.local/bin/blowhorn-mcp`.
4. Restart ChatGPT.

The desktop app shares its MCP config with the Codex CLI, in
`~/.codex/config.toml`. A server you add in one shows up in the other.
To check it, ask ChatGPT which Blowhorn tools it has.
[Vendor docs](https://developers.openai.com/codex/mcp).

### OpenAI Codex CLI

Add the server from a terminal:

```bash
codex mcp add blowhorn -- $HOME/.local/bin/blowhorn-mcp
```

Or add it to `~/.codex/config.toml`, or to a trusted project's
`.codex/config.toml`:

```toml
[mcp_servers.blowhorn]
command = "/Users/<you>/.local/bin/blowhorn-mcp"
args = []
```

Check it with `codex mcp list`, or `/mcp` inside a session. The ChatGPT
desktop app reads the same file.
[Vendor docs](https://developers.openai.com/codex/mcp).

### Cursor

Create `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json`
in one project, with the entry under `mcpServers`:

```json
{
  "mcpServers": {
    "blowhorn": {
      "type": "stdio",
      "command": "/Users/<you>/.local/bin/blowhorn-mcp",
      "args": []
    }
  }
}
```

The `type` line is optional. If the server does not connect, open the
Output panel and choose MCP Logs.
[Vendor docs](https://cursor.com/docs/context/mcp).

### VS Code with GitHub Copilot

The quickest route is the Command Palette:

1. Run MCP: Add Server.
2. Choose Command (stdio).
3. Enter the command `/Users/<you>/.local/bin/blowhorn-mcp`.
4. Enter the server ID `blowhorn`.

To write the file yourself, use the portable format. Put the entry in
`~/.copilot/mcp-config.json` for every workspace, or `.mcp.json` at a
workspace root, under `mcpServers`:

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

VS Code's own format also works: `.vscode/mcp.json` in a workspace, or
the `mcp.json` in your user profile. That file's top-level key is
`servers`, and the entry needs a `type` of `stdio`:

```json
{
  "servers": {
    "blowhorn": {
      "type": "stdio",
      "command": "/Users/<you>/.local/bin/blowhorn-mcp",
      "args": []
    }
  }
}
```

Do not mix the two keys. A file under `.vscode/` takes `servers`; the
portable files take `mcpServers`.
[Vendor docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

### Windsurf (Devin Desktop)

Windsurf is now Devin Desktop. Add the server for your user from a
terminal:

```bash
devin mcp add -s user blowhorn -- $HOME/.local/bin/blowhorn-mcp
```

Or put the entry in `~/.config/devin/mcp_config.json`, or
`.devin/mcp_config.json` in a project, under `mcpServers`:

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

Older Windsurf builds read `~/.codeium/windsurf/mcp_config.json`, with
the same `mcpServers` shape. Devin Desktop imports that file.
[Vendor docs](https://docs.devin.ai/desktop/devin-local/customizations).

### Gemini CLI

Add the server for your user:

```bash
gemini mcp add -s user blowhorn $HOME/.local/bin/blowhorn-mcp
```

Without `-s user`, it is added to the current project only. Or put the
entry in `~/.gemini/settings.json`, or `.gemini/settings.json` in a
project, under `mcpServers`:

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

Gemini CLI starts a local server only in a trusted folder. Run
`gemini trust` in the folder you work from. Keep the name `blowhorn`:
server names may not contain underscores. Check it with `/mcp` inside a
session.
[Vendor docs](https://geminicli.com/docs/tools/mcp-server/).

### Zed

In Zed, open Settings > AI > MCP Servers > Add Server, then choose Add
Local Server. Or run `zed: open settings file` and add the entry under
`context_servers`:

```json
{
  "context_servers": {
    "blowhorn": {
      "command": "/Users/<you>/.local/bin/blowhorn-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

A green dot next to the server, with "Server is active", means it
connected. Zed asks before each tool call by default. Keep that
setting.
[Vendor docs](https://zed.dev/docs/ai/mcp).

### Cline

In the editor:

1. Click the MCP Servers icon.
2. Open the Configure tab.
3. Click Configure MCP Servers.
4. Add the entry under `mcpServers`:

   ```json
   {
     "mcpServers": {
       "blowhorn": {
         "command": "/Users/<you>/.local/bin/blowhorn-mcp",
         "args": [],
         "env": {},
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

Leave `autoApprove` empty, so Cline asks you before each tool call.

For the Cline CLI, add the server from a terminal. It writes
`~/.cline/data/settings/cline_mcp_settings.json`:

```bash
cline mcp add blowhorn --yes -- $HOME/.local/bin/blowhorn-mcp
```

[Vendor docs](https://docs.cline.bot/mcp/configuring-mcp-servers).

### Goose

Run `goose configure`, choose Add Extension, then Command-line
Extension, and enter the command. Or add it under `extensions` in
Goose's YAML config file, in the `~/.config/goose/` folder:

```yaml
extensions:
  blowhorn:
    type: stdio
    name: blowhorn
    enabled: true
    cmd: /Users/<you>/.local/bin/blowhorn-mcp
    args: []
    envs: {}
    timeout: 300
```

Goose calls the command `cmd`, not `command`. To try the server in one
session without saving it:

```bash
goose session --with-extension "$HOME/.local/bin/blowhorn-mcp"
```

[Vendor docs](https://github.com/block/goose/blob/main/documentation/docs/guides/config-files.md).

### Muse

A Muse bot can run on your Mac, alongside Blowhorn and
Google Chrome. That is the setup that gives it every tool: the
profiles it acts for and the Chrome it acts through are on the
same computer as the bot, which is all this server ever asks.

Add the server to the bot the way you add any MCP server: the
`blowhorn-mcp` command (or `npx -y blowhorn-mcp`) as a stdio
server, with no arguments. In a config file that is the same entry
every client on this page uses:

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

You can also just tell the bot to add it: "Add the Blowhorn MCP
server, command `~/.local/bin/blowhorn-mcp`", and restart the bot
so it picks the server up. Check it by asking the bot which
Blowhorn tools it has.

Then prompt the bot in plain words. It reads first, and every
write comes back as a dry run before anything goes out, so ask
for the outcome and read the rehearsal:

> List my Blowhorn profiles and tell me which ones are signed in.

> Show me what is in my queue for today.

> Dry-run accepting my pending LinkedIn connection requests, and
> show me who it would accept. Then wait for my go.

Say go, and the bot runs the same call confirmed. Under approval
mode an agent cannot approve its own queued work, so confirmed
work can still wait for you in the app (see [Dry run first](#dry-run-first)).

A Muse bot that is not running on your Mac can still read
through the interim hosted gateway. Connect it as a custom MCP
connector with the server URL `https://mcp.blowhorn.ai/mcp` and an
API token for your Blowhorn account ([Get a Blowhorn API
token](#get-a-blowhorn-api-token)), sent as a Bearer token. The
gateway proxies Cloud's `/mcp` (read tools today). RFC 9728 discovery
is live on mcp.blowhorn.ai, but end-to-end OAuth sign-in waits on Cloud
enabling dynamic client registration, so a client that cannot send a
token still cannot finish sign-in yet.

### Grok

Grok Build, xAI's agent that runs in a terminal, can run the local
server on the same computer as Blowhorn:

```bash
grok mcp add blowhorn -- $HOME/.local/bin/blowhorn-mcp
```

Or add it to `~/.grok/config.toml`:

```toml
[mcp_servers.blowhorn]
command = "/Users/<you>/.local/bin/blowhorn-mcp"
args = []
```

Grok Build also reads `~/.claude.json`, `.cursor/mcp.json` and
project `.mcp.json` files, so an entry you already added for another
client may already be picked up. Check it with `grok mcp list`, or
`/mcps` inside a session. Grok names a server's tools
`<server>__<tool>`, so the `post` tool appears as `blowhorn__post`.
[Vendor docs](https://docs.x.ai/build/features/mcp-servers).

Grok Build can also read through the interim hosted gateway:

```bash
grok mcp add --transport http blowhorn-cloud https://mcp.blowhorn.ai/mcp --header "Authorization: Bearer <token>"
```

Put an API token for your Blowhorn account in place of `<token>`
(see [Get a Blowhorn API token](#get-a-blowhorn-api-token)).
The gateway is read-only, with the four tools `listContentItems`,
`getContentItem`, `getEvents` and `getConnections`.

Grok on the web cannot finish connect yet. Its custom connectors
(grok.com/connectors, New Connector, then Custom) take a public
HTTPS MCP server with an OAuth sign-in. The interim gateway now
serves RFC 9728 discovery and challenges, but Cloud still has
dynamic client registration disabled, so the sign-in flow stops at
registration. Use a Bearer Cloud API token instead, or wait for the
DCR enable release. The local server is a process on your own
computer, and Grok on the web cannot start one.
[Vendor docs](https://docs.x.ai/grok/connectors). Grok Bot can
connect today with a Bearer token: see [Grok Bot](#grok-bot).

### Grok Bot

Blowhorn is not in Grok Bot's connector catalog yet. Until it is,
add Blowhorn to your bot as a custom connection to the interim
hosted gateway. Grok Bot runs on its own computer in the cloud, so
it cannot start the local server on your Mac, but it can reach a
public HTTPS server and send a bearer token with every request.

The gateway is read-only. It has four tools, `listContentItems`,
`getContentItem`, `getEvents` and `getConnections`, so your bot can
read your queue, a post, your activity and your connections. It
cannot post, schedule or change anything. For those, use a client
on the Mac where Blowhorn runs, such as [Claude Code](#claude-code)
or [Grok Build](#grok).

You need an API token for your Blowhorn account. The Blowhorn app
has no screen for one; create it on your Blowhorn account's web
page, as
[Get a Blowhorn API token](#get-a-blowhorn-api-token) shows.

1. In a chat with your bot, ask it to add the server. Say "custom",
   so the bot does not look for a catalog connector instead:

   > Add a custom MCP server named blowhorn at
   > https://mcp.blowhorn.ai/mcp. It needs the header
   > Authorization: Bearer followed by my Blowhorn API token.

2. The bot shows the name and the URL and asks you to confirm.
   Check that the URL is exactly `https://mcp.blowhorn.ai/mcp`, then
   confirm.
3. When the bot asks for the token, give it. The bot stores it as
   the `Authorization` header on the server entry, never in the URL.
   Prefer a Bearer Cloud API token today: end-to-end OAuth sign-in
   still waits on Cloud enabling dynamic client registration, so no
   complete sign-in card finishes yet. The token passes through your
   chat with the bot, so use one you can revoke, and revoke it when
   you stop using the connection (see
   [Revoke a leaked token](#revoke-a-leaked-token)).
4. Check it in your next message. Ask:

   > Which Blowhorn tools do you have? Then list my Blowhorn
   > connections.

   The bot should name the four tools above and answer from
   `getConnections`. Nothing it can call changes anything.

If the bot reports `401 Unauthorized` when it connects, the header
is missing or malformed: the gateway wants exactly
`Authorization: Bearer <token>`. If it connects but a tool call
fails with a `401` from your Blowhorn account, the token has expired
or been revoked: get a new token and ask the bot to update the
header on the `blowhorn` server. If you opened the URL in a
browser to check it and saw a JSON error, that is expected: see
[Opening the gateway URL in a browser](#opening-the-gateway-url-in-a-browser).

## Authentication

The local server has no OAuth step and no token to create. The
stdio transport does not use OAuth: that belongs to a remote server,
not to a process on your own computer. A client that offers you an
OAuth login for this server is pointed at the wrong thing. The local
server takes its credentials from your Blowhorn config and
environment, exactly as the CLI does.

With the app, each tool runs the app's `blowhorn` command. It reads
the app's own settings in
`~/Library/Application Support/Blowhorn/home/.blowhorn.yaml`, not a
`./.blowhorn.yaml` in the client's working directory.

The server serves stdio only. Asking it for HTTP refuses at startup:

```bash
~/.local/bin/blowhorn-mcp --transport http
```

A hosted Blowhorn MCP server, with its own sign-in, is coming.
Until it lands, the interim hosted gateway in the Muse, Grok and
Grok Bot sections above serves a few read-only tools to clients that can
send a token. The rest of this page covers the local server.

### Local server or hosted gateway

| | Local server (`blowhorn-mcp`) | Interim hosted gateway |
| --- | --- | --- |
| Where it runs | On your Mac, started by your client over stdio | `https://mcp.blowhorn.ai/mcp`, over HTTPS |
| Sign-in | None: it uses the sign-in the Blowhorn app already saved | A Blowhorn API token, sent as `Authorization: Bearer <token>` |
| Tools | Every Blowhorn command except the hidden ones | Four read-only tools: `listContentItems`, `getContentItem`, `getEvents` and `getConnections` |
| Writes | Dry run first, `confirm` true to act | None yet: it cannot post, schedule or change anything |
| Use it from | A client on the same Mac as Blowhorn, such as Claude Desktop, Claude Code or Cursor | A client that cannot start a process on your Mac, such as Grok Bot or a Muse bot in the cloud |

### Get a Blowhorn API token

The hosted gateway needs an API token for your Blowhorn account; the
local server does not. The Blowhorn desktop app has no screen for
creating one. Create it on your Blowhorn account's web page:

1. Open [cloud.blowhorn.ai/security/tokens](https://cloud.blowhorn.ai/security/tokens)
   and sign in with your Blowhorn account. This is the **Tokens** tab
   under **Security**.
2. Click **Create**.
3. Enter a **Token Name** that says where the token is used, such as
   `grok-bot-mcp`, and a **Token Purpose**, then click **Create**. The
   new token appears in the list.
4. In that token's row, click the **Download** icon. The download saves
   a file named `token_<id>.json`.
5. Open the file. The value of its `"token"` field is the API token.
   Give a client that value, and nothing else, where it asks for the
   Bearer token; the client sends it as `Authorization: Bearer <token>`.

Make one token per client, so you can revoke one without breaking the
others, and delete the downloaded file once the token is in the
client. To stop using a token, delete it from the same page with the
**Delete** icon in its row, or see
[Revoke a leaked token](#revoke-a-leaked-token).

### Opening the gateway URL in a browser

`https://mcp.blowhorn.ai/mcp` is an endpoint for MCP clients, not a web
page. A client sends each request as a JSON-RPC `POST`, with the token
in the `Authorization` header. A browser sends a plain `GET` without a
token, so it gets a short JSON error instead of a page, such as:

```json
{"error":"unauthorized","error_description":"Bearer token required. Discover the authorization server via the resource_metadata URL in WWW-Authenticate."}
```

or:

```json
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Method not allowed: this stateless gateway answers POST only."},"id":null}
```

That is the gateway working as designed, not a fault. It keeps no
session between requests, so it answers MCP messages sent as `POST`
only. To check from a browser that the gateway is up, open
[mcp.blowhorn.ai/healthz](https://mcp.blowhorn.ai/healthz) instead,
which answers `{"ok":true,...}`. To check your token, connect a
client and ask it which Blowhorn tools it has.

### Revoke a leaked token

The local server uses the token that sign-in saved on this computer.
If that token, or any other API token for your Blowhorn account, leaks, revoke it
at once. Having the token is enough; no sign-in is needed:

```bash
read -rs TOKEN   # paste the token, then press Enter
printf '{"token": "%s"}' "$TOKEN" | curl -sS -X POST https://cloud.blowhorn.ai/revoke \
  -H 'Content-Type: application/json' --data-binary @- -w 'HTTP %{http_code}\n'
```

A 200 response means the token no longer works, if it existed. A 200
does not confirm the token existed. A 503 response means nothing was
revoked, so run the call again.

While you are still signed in with a token you trust, you can delete
the token by ID instead. List your tokens with
`GET https://cloud.blowhorn.ai/api/identity/tokens`, then send
`DELETE https://cloud.blowhorn.ai/api/identity/tokens?tokenId=<id>`
with `Authorization: Bearer <token>`.

Then sign in again with `blowhorn auth login` to get a fresh token.

## Example prompts and workflows

The assistant picks the tools; you approve the writes. These prompts
are written so the dry run comes first and nothing goes out on the
first pass.

### Draft and queue a post

> Draft a LinkedIn post for profile personal announcing the v2.4 release,
> queue it for Tuesday 09:00, and show me the dry run before you
> confirm anything.

The assistant drafts with the content tools and queues the row. A
changing tool runs with `--dry-run` unless the call confirms it, so
the first pass shows what would be queued and queues nothing. Say
go, and the assistant re-runs it confirmed.

### Check analytics

> How did last week's posts do on LinkedIn, and which profile drove
> the most engagement?

Read-only tools run as asked. The assistant reads the analytics
tools and reports back; nothing is written, so there is nothing to
confirm.

### Amplify a post

> This post went live at this URL. Dry-run an amplify from every
> profile on this computer, then wait for my go.

The amplify runs as a rehearsal first, naming what each profile
would do. Confirm it and the real run follows. The same shape works
for a GitHub issue or pull request: the assistant amplifies from
each profile's own credential, and re-running adds no reaction twice.

### Manage profiles

> Which profiles are signed in and ready, and which ones need
> attention?

The assistant reads the profile tools and reports each profile's
state. Changing a profile, switching the current one, or setting a
risk limit is a write: dry run first, confirm to act, same as every
other write. `profile status` and `chrome discover` count as writes
too, because each records the sign-ins it reads as the profile's
accounts in your Blowhorn account.

<a id="safety"></a>

## Dry run first

Writes need confirmation, and dry run is the default. A tool that
only reads runs as asked. A tool that changes anything runs with
`--dry-run` unless the call passes `confirm` as true. A call that
passes both `confirm` and `dry_run` is refused as contradictory, and
a changing command with no dry-run path refuses without `confirm`
rather than running for real.

Every MCP call runs as an agent. The server sets
`BLOWHORN_ACTOR=agent` for every command it runs, whatever its own
environment says: `BLOWHORN_ACTOR=human` in a client's `env` is
ignored, and the server says so in one line on stderr when it starts.
Under approval mode `agent` or `all`, the queue rules in
[You are in control](/docs/explanation/youre-in-control/) therefore
apply to MCP calls exactly as they apply to any other agent caller.
`content_approve` is one of the tools, but `content approve` refuses
an agent caller in every mode, so an agent can never approve its own
content through this server. That only holds work back under `agent`
or `all`: under `off`, the agent's own writes keep the `Approved?`
value it sets, and a confirmed ad-hoc action publishes.

Each changing tool also tells the client whether it is destructive.
An additive tool (`destructiveHint` false), such as `post`, `comment`,
`follow` or `slack_send`, only adds new things; Blowhorn's own
bookkeeping on the record it acted on, such as marking a content item
as posted, does not count as a change. A destructive
tool (`destructiveHint` true), such as `content_upsert`,
`schedule_delete` or `unfollow`, may change or remove something that
already exists. Your client may ask you before a destructive call;
either kind is still a dry run until `confirm` is true. The full list
is in the
[MCP server reference](/docs/reference/mcp-server/#destructive-and-additive-tools).

Note the limit of this transport: there is no desktop-app
approval step here. On this server, `confirm` true is the approval.
If you want a person to approve each write in the app, use the queue
and the approval mode, not a confirmed MCP call.

Keep your client's own approval prompt on, too. Zed, Cline and most
other clients ask before each tool call unless you turn that off.

Tool results never carry secrets. A value under a secret-named key is
replaced with `"[redacted]"` before the result reaches the client,
unless it cannot carry a secret: a boolean, null, a value on its
schema's fixed list, or a field its schema marks `x-mcp-not-secret`.
Secret-shaped fragments in text output are replaced the same way. A
client on protocol version `2025-06-18` or later also gets each JSON
tool's `outputSchema` and a checked `structuredContent` in its
results; see [Structured output](/docs/reference/mcp-server/#structured-output). A failed run
reports its exit code and its (redacted) error, never the arguments
it ran.

How these rules fit together is in
[How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/).

### Hidden tools

Seven tools are hidden by default, because each removes or replaces
your Blowhorn install, removes a background service or LaunchAgent, or
signs you out: `uninstall`, `service_uninstall`, `service_adopt`,
`auth_logout`, `desktop_build`, `desktop_install` and
`chrome_attach_chrome_uninstall_agent`. Your assistant cannot see or
call them. To serve one, name it in the server's arguments with
`--allow-hidden-tool`
(repeat it for more), or list names, comma-separated, in
`BLOWHORN_MCP_ALLOW_HIDDEN_TOOLS` in the client's `env`. For example,
to let an assistant uninstall the background service:

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "/Users/<you>/.local/bin/blowhorn-mcp",
      "args": ["--allow-hidden-tool", "service_uninstall"]
    }
  }
}
```

There is no "all": name each tool. A name that is not a hidden tool
stops the server at startup with a line on stderr naming the hidden
tools, so a typo shows up at once. An opted-in tool is still a dry
run until `confirm` is true. Restart the client after changing its
config.

## Troubleshooting

- **The client shows no Blowhorn server.** Run
  `~/.local/bin/blowhorn-mcp --version` in a terminal. If the file is
  missing, open the Blowhorn app once, or update it to 1.61.0 or later.
  If it says the app is in the Trash or was not found, put the app back
  or reinstall it. Check that the client's entry uses the full path,
  not `~`. Then restart the client: most clients only pick up a new
  server on restart, and Claude Desktop only reads its config at
  startup.
- **A tool call fails with `blowhorn executable not found`.** Open the
  app once, so it rewrites `~/.local/bin/blowhorn`. If that file lacks
  the line `Managed by Blowhorn installer`, set `BLOWHORN_MCP_CLI` in the
  entry's environment to the `blowhorn` executable you want. With a
  fallback entry, set `BLOWHORN_MCP_CLI` to
  `/Users/<you>/.local/bin/blowhorn`.
- **A fallback entry shows `No module named 'blowhorn'`.** Its
  `PYTHONPATH` is missing or wrong. With the app it must be
  `/Applications/Blowhorn.app/Contents/Resources/engine/engine`; from a
  checkout, the checkout's `engine` directory. Better, switch to the
  `blowhorn-mcp` command.
- **The server starts but lists no tools, or the tools look stale.**
  The tool list follows the app's version. Update the app, then
  restart the client. From a checkout, run `make mcp-generate` and
  restart the server after any change to the CLI.
- **A write only produced a dry run.** That is the default, not a
  failure. The assistant must re-run the call with `confirm` true
  for the real run. If you did not mean to confirm, the dry run is
  the whole result: nothing was written.
- **A call is refused as contradictory.** It passed both `confirm`
  and `dry_run`. Drop one: `confirm` true for the real run, or
  `dry_run` for the rehearsal.
- **A changing call is refused without running.** It has no dry-run
  path, so it refuses rather than running for real without
  `confirm`. Confirm it, or leave it refused.
- **The server exits when asked for HTTP.** That is deliberate: this
  server is local stdio only, and `--transport http` refuses with
  the reason. Use `--transport stdio`, the default.
- **ChatGPT on the web cannot find the server.** It connects only to
  remote servers. Use the ChatGPT desktop app.

## Related

- [MCP server reference](/docs/reference/mcp-server/) - what the
  server is, the tour of its tools, and the safety rules in full
- [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/) -
  how the server, the CLI and approvals fit together
- [Command reference](/docs/reference/cli/) - every command the
  tools wrap, generated from the app itself
- [You are in control](/docs/explanation/youre-in-control/) -
  approval modes, pauses, and every safety control in one place
- [blowhorn-axi](/docs/reference/cli/blowhorn-axi/) - the agent
  CLI: the same commands through a command line instead of MCP

