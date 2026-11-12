---
title: "MCP server"
description: "The local MCP server: one tool per CLI command, a few split into two tools, a few hidden by default, over stdio, with dry run as the default for anything that changes state."
weight: 225
---

Blowhorn ships a local MCP server so an AI agent can drive the same
commands you run, through the Model Context Protocol, instead of
learning a second surface. It is generated, not hand-written: at
startup it reads `schemas/dist/openapi.yaml` and builds one tool per
operation in that bundle, except the few
[hidden by default](#hidden-tools), named by the operation id
(`post`, `schedule_trigger_now`, `profile_list`, and so on). A few
commands are split into two tools, so a distinct form gets its own
tool: a read-only check, a fleet-wide scope, or a sign-up form. The
base tool refuses the split-out argument and names the tool that owns
it. A command
added to the CLI appears as a tool the next time the server starts,
and `make mcp-generate` fails if the tool list ever stops matching the
bundle. The tool inputs are the command's flags and arguments, taken
from the same schemas the CLI reference is built from.

## How it relates to the CLI and to blowhorn-axi

There are two agent doors into the same commands, and they differ in
how the agent talks, not in what it can do, apart from the few
tools the MCP server [hides by default](#hidden-tools). The MCP server
is the standard plug: any MCP client can discover one tool per command
and call it over the protocol. [blowhorn-axi](/docs/reference/cli/blowhorn-axi/) is the
agent command line: an agent runs it directly and reads compact,
agent-shaped answers, with every write a dry run until `--confirm`.
Both drive the same `blowhorn` commands, both rehearse before they
act, and both run on your own computer. If your assistant speaks MCP,
connect it here; if it runs shell commands, give it `blowhorn-axi`
or the CLI itself. The steps for connecting a client are in
[Connect an AI assistant over MCP](/docs/how-to/set-up/connect-mcp-client/).

## Tour of the tools

The tools are grouped the way the command bundle groups them, and a
group's tools cover the commands in it, no more and no less, except
the few that are [hidden by default](#hidden-tools) and the few split
into two tools:

- **Act** - the outward actions: `post`, `comment`, `follow`,
  `unfollow`, `accept`, `withdraw`, `find`, and `source`, plus the
  connection, invitation, and reconciliation actions.
- **Manage** - profiles, content, schedules, risk, and config:
  `profile list`, `profile status`, `content list`, `content upsert`,
  `schedule list`, `schedule trigger-now`, `risk show`, and
  `config show`, among others.
- **Connect** - the sign-ins and the browser: `auth status`,
  `chrome profiles`, `chrome map`, `slack send`, and `slack whoami`,
  among others.
- **Run** - the service, the desktop app, and the store:
  `service status`, `service tick-now`, `desktop status`, and
  `store`.
- **Observe** - what happened: `analytics history`,
  `analytics activity`, `analytics activities`, `diagnostics reports`,
  and `report`.
- **Meta** - the computer itself: `setup` and `upgrade`. `uninstall`
  is hidden by default.

A tool's name is its command's operation id, so the
[CLI reference](/docs/reference/cli/) documents exactly what each tool does: find
the command there for its flags, its examples, and its exit codes.

## Starting it

The server runs over stdio. The `blowhorn-mcp` command starts it with
everything it needs, so a client entry is that one command:

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

The Blowhorn app writes the command to `~/.local/bin` (version 1.61.0
or later; see [The blowhorn-mcp command](#the-blowhorn-mcp-command)),
and so does a checkout install (`tools/install.sh`). Any arguments after
the command go to the server unchanged, so
`~/.local/bin/blowhorn-mcp --list-tools` works too. The npm package
[`blowhorn-mcp`](https://www.npmjs.com/package/blowhorn-mcp) is
published, so `npx -y blowhorn-mcp` (Node.js 20 or later) starts the
same server; it still needs the Blowhorn app installed and opened once.

Without the command, run the server from a checkout, with the
checkout's Python environment:

```bash
PYTHONPATH=engine ./venv/bin/python -m blowhorn.mcp_server
```

As a client entry, with the paths filled in for your checkout:

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

The `-P` keeps the client's working directory off Python's import
path, so a file there can never stand in for one of the server's own
modules.

The server reads the bundle from `--schema`, then `BLOWHORN_MCP_OPENAPI`,
then `schemas/dist/openapi.yaml` under the root it runs from (the
directory that holds `engine/`). It runs the first `blowhorn`
executable it finds in this order: `--cli`, then `BLOWHORN_MCP_CLI`,
then `blowhorn` on your PATH, then `tools/bin/blowhorn.sh` under the
same root. It prints nothing but protocol frames to stdout;
diagnostics go to stderr, and tool arguments are never logged,
because an argument can itself be a secret.

### From the installed app

The app carries everything the server needs inside
`Blowhorn.app/Contents/Resources/engine`: its own Python
(`bin/python`), the engine with the server (`engine/blowhorn/`,
`mcp_server` included), and the command bundle
(`schemas/dist/openapi.yaml`). Each time it opens, the app also writes
its commands (`blowhorn`, `blowhorn-axi` and `blowhorn-mcp`) to
`~/.local/bin`, but only where the path is free or already holds the
app's own command, which contains the line
`Managed by Blowhorn installer`. Any other file at that path is left
alone, and `BLOWHORN_MCP_CLI` must then name the `blowhorn` executable
you want instead. The app runs on macOS.

#### The `blowhorn-mcp` command

Blowhorn 1.61.0 and later write `~/.local/bin/blowhorn-mcp` beside the
other two commands. It is the whole configuration: the command
`/Users/<you>/.local/bin/blowhorn-mcp`, with no arguments and no
environment. Write the full path: a client started from the Dock or
Finder does not have `~/.local/bin` on its PATH. The one exception:
when `~/.local/bin/blowhorn` is not the app's (it lacks the line
`Managed by Blowhorn installer`), the entry still needs
`BLOWHORN_MCP_CLI` in its `env`, naming the `blowhorn` executable to
use; `blowhorn-mcp` keeps a value the client sets.

It finds the app again if the app moves, the way `blowhorn` does,
sets `PYTHONPATH` itself, and sets `BLOWHORN_MCP_CLI` to the
`blowhorn` command beside it unless the client already set one. It
prints nothing to stdout before the server starts. With the app in the
Trash, or no app found at all, it starts nothing: it prints one line
to stderr and exits 1, and it never runs the uninstall or the cleanup
that the `blowhorn` command runs in those cases. A checkout install
(`tools/install.sh`) also writes `~/.local/bin/blowhorn-mcp`, which runs
the checkout's venv the way the command above does and sets
`BLOWHORN_MCP_CLI` to the `blowhorn` launcher beside it unless the
client already set one.

#### The app's own Python

An app older than 1.61.0 has no `blowhorn-mcp` command. Point the
client at the app's interpreter instead. With the app in
`/Applications`, and your home directory filled in:

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

`BLOWHORN_MCP_CLI` names the app's `blowhorn` command outright,
because an MCP client may start the server without `~/.local/bin` on
its PATH. Without it, a client started from the Dock or Finder lists
the tools, but every call fails with
`blowhorn executable not found: blowhorn`. Without `PYTHONPATH`, the
server does not start and stderr says `No module named 'blowhorn'`.

| Fact | With the app |
|---|---|
| Client command | `/Users/<you>/.local/bin/blowhorn-mcp` (1.61.0 or later) |
| Interpreter | `/Applications/Blowhorn.app/Contents/Resources/engine/bin/python` |
| `PYTHONPATH` | `/Applications/Blowhorn.app/Contents/Resources/engine/engine` |
| `blowhorn` command | `~/.local/bin/blowhorn`, rewritten by the app each time it opens |
| Config file the tools read | `~/Library/Application Support/Blowhorn/home/.blowhorn.yaml`, the app's own home, not a `.blowhorn.yaml` in the client's working directory |
| Tool list | Follows the app's version; updating the app updates the tools |
| A moved app | The `~/.local/bin` commands find the app again on their own. An entry that names the interpreter has the two `/Applications/...` paths written into it, so an app moved elsewhere, `~/Applications` for one, needs both changed. |

The `blowhorn` command runs through the app's engine record, the same
way the app and the background service do, which is why its config is
the app's home rather than the client's directory.

## Options and environment

| Flag | Environment | What it does |
|---|---|---|
| `--schema PATH` | `BLOWHORN_MCP_OPENAPI` | The OpenAPI bundle to load. |
| `--cli PATH` | `BLOWHORN_MCP_CLI` | The `blowhorn` executable each tool call runs. |
| `--timeout SECONDS` | `BLOWHORN_MCP_TIMEOUT` | How long one tool call may run. Default 600. |
| `--transport stdio` | | The only transport served. `http` refuses at startup. |
| `--allow-hidden-tool NAME` | `BLOWHORN_MCP_ALLOW_HIDDEN_TOOLS` | Serve one [hidden tool](#hidden-tools) by name. The flag repeats; the variable takes a comma-separated list; the two combine. |
| `--metrics-port PORT` | `BLOWHORN_MCP_METRICS_PORT` | Serve [metrics](#metrics) on `http://127.0.0.1:PORT/metrics`. Off when neither is set; the flag wins over the variable. `0` picks a free port. |
| `--list-tools` | | Print the tool list as JSON and exit. |
| `--check-coverage` | | Check the tool list and its output schemas cover the bundle and exit. |
| `--version` | | Print the Blowhorn version and exit. |

The flag wins over its environment variable, except for
`--allow-hidden-tool`, whose names add to the variable's.

## What a tool call does

A tool call runs the matching `blowhorn` command as a subprocess, with
the tool arguments mapped to its flags and positional arguments, and
returns what the command printed. Commands that support `--json` run
with it, so the result is structured JSON; the rest return their text.
Credentials come the way the CLI takes them, from your existing
Blowhorn config and environment. The stdio transport does not use
OAuth: that belongs to a remote server, not to a process on your own
computer.

`chrome_confirm`, `profile_create` and `profile_update` also take a
`stdin_document` argument: the JSON document the command reads on
stdin. Passing it adds the command's `--payload-stdin` flag. Every
other call runs with stdin closed.

<a id="safety-dry-run-first-confirm-to-act"></a>

## Dry run first, confirm to act

A tool that only reads runs as asked. A tool that changes anything
runs with `--dry-run` unless the call passes `confirm` as true. With
`confirm` true it performs the real run, and where the command has its
own confirm flag (the Slack send, edit, delete and react commands) it
passes that through too, so the two gates agree. A changing command
with no dry-run path refuses without `confirm` rather than running
for real, and a call that passes both `confirm` and `dry_run` is
refused as contradictory.

Which tools read, which change something, which may destroy or
overwrite state, and which are hidden is recorded in the schema bundle
as `x-mcp` on each operation: `expose`, `readOnly` and `destructive`
(shape `McpOperation`, authored in `schemas/data/mcp-operations.json`).
The server refuses to start on a bundle in which any operation has no
`x-mcp`, and names that operation: classify it in
`schemas/data/mcp-operations.json` and rebuild the bundle with
`make schemas-bundle`.

Note the limit of this transport: there is no desktop-app approval
step here. On this server, `confirm` true is the approval. If you want
a person to approve each write in the app, use the queue and the
approval mode, not a confirmed MCP call.

Tool results never carry secrets. A string, number, object or array
under a secret-named key (for example `access_token` or `GH_TOKEN`) is
replaced with `"[redacted]"` before the result reaches the client. A
boolean or null under such a key is kept, because neither can carry a
secret: `auth_status` reports `"token_configured": true` as it is. Two
more values are kept, both decided by the tool's output schema at that
place: a value the schema limits to a fixed list (`enum` or `const`)
that the value is on, such as `auth_login`'s `token_store`
(`keychain` or `file`), and a value whose schema is marked
`x-mcp-not-secret: true`, such as `profile_status`'s
`credential_keys_present`, which lists the names of the credential keys
that are set, never their values. This holds for every session,
whatever its protocol version, so the text and `structuredContent`
always say the same thing.

Text output is redacted too. After a secret-named word, a value that
follows `:` or `=` is replaced, with or without spaces and with the key
or the value in double or single quotes (`"access_token": "abc123"`,
`'access_token': 'abc123'`, `access_token = abc123`,
`password:hunter2`), as is the word after `Bearer`. This text rule runs
over output that is not JSON and over every string value in each line
of a JSON Lines stream (described below), one string at a time, so
`?token=abc123` in a progress line's URL is replaced and every line
stays valid JSON. One JSON document is redacted key by key with the
rule above and nothing else, so a kept value such as
`"api_token": true` stays valid JSON. A failed run
reports its exit code and its (redacted) error, never the argv it ran.

### Destructive and additive tools

Every tool carries the standard MCP hints, and they follow from
`x-mcp`:

| Hint | Read-only tool | Additive tool | Destructive tool |
|---|---|---|---|
| `readOnlyHint` | true | false | false |
| `destructiveHint` | false | false | true |
| `idempotentHint` | true | false | false |
| `openWorldHint` | false | true | true |

`destructiveHint` tells a client whether a changing tool can take
something away. False means the tool only adds new things, such as a
post, a comment, a follow, a star, a Slack message, an accepted
invitation, a new record or a reaction. Blowhorn's own bookkeeping on
the record it just acted on, such as marking a content item as posted,
does not count as changing what exists. True means it may delete,
overwrite, replace or undo existing state: an upsert, a set, an edit,
a delete, an unfollow, a withdrawal,
a pause or a stop. Where the command's code leaves it unclear, the
tool is marked destructive. A client may use the hint to ask you
before a destructive call; an additive call still reaches the outside
world, so it is still a dry run until `confirm` is true.

The additive tools are `accept`, `analytics`,
`chrome_create_profile`,
`chrome_extension_enable`, `chrome_open_profile`, `chrome_remember`,
`chrome_spaces_setup`, `comment`,
`diagnostics_opened`, `diagnostics_support`, `find`, `follow`, `post`,
`profile_create`, `slack_react`, `slack_send` and `star`, and the
page-invitation tool described in the next paragraph. Every other
changing tool is destructive. `risk_grid` is read-only: it only reads
your profiles and runs, so it runs for real with no `confirm`. `find`
stays a preview: it writes nothing to your profiles, but every call
signs in to Bluesky live, so it is a dry run until `confirm` is true,
like any other changing tool. `analytics` stays a preview too: it only
reads the platforms, but every call signs in live and writes export
files, so it is a dry run until `confirm` is true, like any other
changing tool.

Some commands are split into more than one tool, so each form keeps
its own label. The page-invitation command is additive, and its
held-entry form, `invite_held`, carries `--requeue` and `--dismiss` (a
destructive tool, because it removes a held entry or rewrites its
note). `slack_react` is additive, and `slack_unreact` carries `--remove`
(it deletes a reaction). `post` gains `post_check_queue`, which only
shows pending posts and is read-only, and `chrome_attach_chrome` gains
`chrome_attach_chrome_status`, the `status` action on its own, also
read-only. `schedule_pause` and `schedule_resume` each gain an `--all`
form for every computer sharing the store, `auth_login` gains
`auth_login_sign_up`, `profile_auth` gains `profile_auth_all`, and
`auth_anonymous_usage_stats` gains `auth_anonymous_usage_stats_on` and
`auth_anonymous_usage_stats_off`, and `auth_share_activity_publicly` gains
`auth_share_activity_publicly_on` and `auth_share_activity_publicly_off`.
The base tool does not accept the split-out
arguments: a call to `slack_react` that names `remove` is refused as an
unknown argument, and the refusal says `remove belongs to slack_unreact`.
The base tool's description ends by naming each split-out argument and
the tool that takes it, since the command summary it shares with the CLI
still mentions them.

When the tool that owns a split-out argument is [hidden](#hidden-tools)
and not served, the refusal says that tool is labeled experimental and
is not available for use, as `chrome_attach_chrome` does for `action`
`uninstall-agent`. A split-out tool needs its own form: `slack_unreact`
requires `remove`, and `invite_held` refuses a call with neither
`requeue` nor `dismiss`. Apart from those, a split-out tool takes every
argument its base tool takes. The command line does not change; the
split is only in the MCP tools. Other commands are destructive when one
of their flags removes something, such as `schedule_bootstrap`
(`--replace`).

### Hidden tools

Seven tools are hidden from MCP clients by default, because each
removes or replaces your Blowhorn install, removes a background
service or a LaunchAgent, or signs you out: `uninstall`,
`service_uninstall`, `service_adopt`, `auth_logout`, `desktop_build`,
`desktop_install`, and `chrome_attach_chrome_uninstall_agent`, which is
the `uninstall-agent` action of `blowhorn chrome attach-chrome` split
out of that command. They are not in `tools/list`, and a call to one
answers that the tool is labeled experimental and is not available for
use. The answer never says how to enable it: that is the operator's
choice, below. Their `x-mcp` (or the `x-mcp` variant that
names them) says `expose: false`.

To serve one, name it when the server starts, with
`--allow-hidden-tool NAME` (repeat the flag for more) or
`BLOWHORN_MCP_ALLOW_HIDDEN_TOOLS` (a comma-separated list). The two
combine. There is no wildcard: each tool is named on its own. A name
that is not a hidden tool, a typo or a tool that is already served,
stops the server at startup with exit 1 and a line on stderr listing
the hidden tools, so an opt-in never silently does nothing. An
opted-in tool keeps its hints, its `outputSchema` and every gate
above: it still runs as a dry run until `confirm` is true.
`--list-tools` and `--check-coverage` honour the same opt-ins, so
the coverage check holds an opted-in tool to the same output schema
rules as the rest and leaves a hidden one it is not serving alone.

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "/Users/<you>/.local/bin/blowhorn-mcp",
      "args": ["--allow-hidden-tool", "service_uninstall"],
      "env": {"BLOWHORN_MCP_ALLOW_HIDDEN_TOOLS": "auth_logout"}
    }
  }
}
```

### MCP calls always run as an agent

Every command the server runs gets `BLOWHORN_ACTOR=agent`, whatever
the server's own environment says. `BLOWHORN_ACTOR=human` (or any
other value) in the client's `env` is ignored, and the server says so
in one line on stderr when it starts. No tool takes an argument that
names the caller. Under approval mode `agent` or `all`, the queue
rules in [You are in control](/docs/explanation/youre-in-control/)
therefore apply to MCP calls exactly as they apply to any other agent
caller. `content_approve` is a tool like any other, but
`content approve` refuses an agent caller in every approval mode, so
an agent can never approve its own content through this server. Under
`off` that refusal protects little: an agent's content writes keep the
`Approved?` value it sets, and confirmed ad-hoc actions publish, so
nothing waits for a person.

## Structured output

A session that negotiated protocol version `2025-06-18` or `2025-11-25`
gets structured results. A session on `2024-11-05` or `2025-03-26`, or
one that has not sent `initialize`, gets the same output it always did:
no `outputSchema`, no `structuredContent`, and no validation. The
version is kept per connection.

Where the schema comes from. Each tool's `outputSchema` is generated
when the server starts, from the command's success (2xx)
`application/json` response schema in the schema bundle
(`schemas/dist/openapi.yaml`), the same schema the
[CLI reference](/docs/reference/cli/) documents for `--json`. It is not written
by hand. The server removes the bundle's `x-` annotations, carries
every shape the response refers to under `$defs`, and points each
`$ref` there. MCP requires the root to be an object: a response whose
root is a `oneOf`, `allOf` or `$ref` in which every branch is an object
gets `type: object` added at the root, and nothing else changes.

Text-only tools. A tool whose command has no `--json` flag (its
response is `text/plain`, for example `accept`, `comment` or
`config_path`) has no `outputSchema` and never returns
`structuredContent`. The [CLI reference](/docs/reference/cli/) shows which commands
take `--json`.

What a result carries. When a JSON tool's command exits 0, the server
parses its output and checks it against the tool's `outputSchema`. If
it conforms, the result carries the redacted JSON twice: as
`structuredContent`, and as the text content item, so clients that
read only text still work. Data that was not checked is never returned
as `structuredContent`.

JSON Lines. When the output is a JSON Lines stream (two or more lines,
each one JSON document), the final document is the result: only it is
checked against the `outputSchema` and returned as `structuredContent`.
The earlier lines are progress events. The text content item keeps
every line, each redacted. This rule is the same for every tool, not
tied to one command. If any line is not JSON, or the final document
does not match, the result is an error as described below.

| Case | Result |
|---|---|
| Output conforms | `isError` false, the JSON as text and as `structuredContent`. |
| Output is a JSON Lines stream whose final document conforms | `isError` false, the final document as `structuredContent`, every line as text. |
| Output is neither one JSON document nor a JSON Lines stream | `isError` true, no `structuredContent`. The first text item says the output did not match the tool's `outputSchema` and why; the second holds the redacted output. |
| Output is JSON but does not conform | `isError` true, no `structuredContent`. The first text item lists each mismatch as a path and a reason (for example `$.argv[1]: expected string`); the second holds the redacted JSON. |
| Output conforms, but only before redaction | `isError` false, no `structuredContent`. The first text item is the redacted JSON; the second says that redaction made it stop matching, and where. |
| Command exits nonzero, times out, or the call is refused | As before: `isError` true with the error text, no `structuredContent`. |

The reasons and the output in an error result are each cut to 4000
characters; the output is redacted, and the reasons carry only paths and
schema literals. An error result means the output did not
match, not that the command failed: the command exited 0, and a
changing command may already have acted. Read the output before you
call the tool again.

Redaction. The output is checked as the command printed it, then
redacted, then checked again. A value under a secret-named key that
redaction keeps (a boolean, null, a value on its schema's fixed list,
or a value marked `x-mcp-not-secret`) arrives intact. Anything else
there becomes the string `"[redacted]"`. The server checks every tool's
schema when it starts and refuses to start if a secret-named field
would reject `"[redacted]"` without being kept by one of those rules,
so no tool declares a schema it can never meet. In the current schemas
no field is affected. The "only before redaction" row above remains as
a safety net. Some MCP client libraries refuse a result that has no
`structuredContent` from a tool that declares an `outputSchema`; with
such a client, read such a result as text, or use a session on an
earlier protocol version.

`auth_login`. With `confirm` true, a real sign-in prints a JSON Lines
stream: an `{"event":"authorize"}` line, then the sign-in result. On a
`2025-06-18` or later session the sign-in result is the
`structuredContent` and the result is `isError` false, so there is no
reason to try again. Do not call it again after a successful sign-in:
a second sign-in replaces the token this one saved and revokes it. A
dry run prints one document and is checked normally.

## Metrics

Once you turn metrics on, the server counts its own work in memory:
tool calls, how long they took, errors, and whether a session is open.
Metrics are off by default, and then nothing is counted. The counts are
local only. Nothing sends them anywhere; you read them yourself, from
your own computer.

### What is collected

Every metric comes from one checked-in catalog,
`schemas/data/mcp-metrics.json`, and `/metrics` shows exactly these and
nothing else:

| Metric | Type | Labels | What it says |
|---|---|---|---|
| `blowhorn_mcp_active_sessions` | gauge | | 1 while a stdio session is initialized and open, 0 before and after. |
| `blowhorn_mcp_errors_total` | counter | `kind` | Errors the server answered, by kind: protocol errors and failed or refused tool calls. |
| `blowhorn_mcp_server_info` | info | `version`, `transport` | The running MCP server: its release version and transport. |
| `blowhorn_mcp_tool_call_duration_seconds` | histogram | `tool` | Seconds each tools/call took to answer, the CLI subprocess included. |
| `blowhorn_mcp_tool_calls_total` | counter | `tool`, `outcome` | tools/call requests answered, by tool and outcome. |

The label values:

- `tool` is a tool name from the server's own tool list. A call naming
  a tool the server does not have is counted as `unknown`, never under
  the name the client sent.
- `outcome` is `ok` (the command ran and succeeded), `error` (the call
  failed or named no tool) or `refused` (a change the server would not
  run without `confirm`, or `confirm` with `dry_run`; see
  [Dry run first](#dry-run-first-confirm-to-act)).
- `kind` is `timeout`, `cli_not_found`, `nonzero_exit`, `refused`,
  `invalid_arguments`, `unknown_tool`, `tool_error` (a failed result no
  other kind names), or one of the JSON-RPC errors `parse_error`,
  `invalid_request` and `method_not_found`. Every kind is shown from
  the start, at 0.
- `version` is the Blowhorn release and `transport` is `stdio`.
- The duration buckets run from 0.05 to 600 seconds, the longest a
  tool call may take by default.

No label ever holds a tool argument, post text, a profile or account
name, or error text, so the number of series stays bounded by the
number of tools.

### Turning it on

Pass `--metrics-port PORT`, or set `BLOWHORN_MCP_METRICS_PORT`. The
server then answers `GET /metrics` on 127.0.0.1 only, in the
Prometheus text format (`text/plain; version=0.0.4`), and any other
path is a 404. It also refuses (403) any request whose `Host` header
is not `127.0.0.1:PORT` or `localhost:PORT`, so a web page that points
its own name at 127.0.0.1 (DNS rebinding) cannot read the numbers. It
logs the address on stderr when it starts. With neither set, nothing
is counted and no port is opened.

```json
{
  "mcpServers": {
    "blowhorn": {
      "command": "/Users/<you>/.local/bin/blowhorn-mcp",
      "args": ["--metrics-port", "9465"]
    }
  }
}
```

Your AI client starts the server, so the listener runs only while the
client keeps it running, and the counts start again at 0 each time.
Each client starts its own server: give each one its own port, or turn
metrics on for one client only.

A port the server cannot bind (already in use, or not permitted) does
not stop it. It prints one warning on stderr naming the port and the
error, ending `metrics disabled for this process`, and then serves its
tools as usual without metrics. The same goes for a checkout updated
without a reinstall, which lacks the `prometheus_client` package that
metrics need: the server prints one warning saying so, ending
`metrics disabled for this process`, and serves its tools. Rerun
`tools/install.sh` to install it. With metrics off the package is never
loaded, so its absence changes nothing. A port value that is not a
number from 0 to 65535 is a usage error (exit 2).

A client that starts several server processes from one config (for
example one per session or window) shares one fixed port among them:
expect only the first to serve metrics there, and the others to print
the warning. Port `0` picks a free port for each process instead and
logs it on stderr.

To collect the numbers with a Prometheus on the same computer:

```yaml
scrape_configs:
  - job_name: blowhorn-mcp
    static_configs:
      - targets: ["127.0.0.1:9465"]
```

## Protocol details

| Item | Behavior |
|---|---|
| Methods | `initialize`, `ping`, `tools/list` and `tools/call`. Notifications get no reply. Any other method, `resources/*` and `prompts/*` included, answers `-32601` (method not found). |
| Batches | A JSON-RPC batch (an array) is refused with `-32600` (invalid request). |
| Protocol versions | `2024-11-05`, `2025-03-26`, `2025-06-18` and `2025-11-25`. A client asking for one of these gets it; any other request gets `2025-11-25`. |
| Server info | Name `blowhorn-mcp`; version is the Blowhorn release, or `0.0.0` when it cannot be read. |
| Annotations | Each tool's four hints come from its operation's `x-mcp` in the bundle (or, for a split tool, from its own variant), never from a list in the server. A tool whose `x-mcp` says `readOnly`: `readOnlyHint` and `idempotentHint` true, `destructiveHint` and `openWorldHint` false. Any other tool: `readOnlyHint` and `idempotentHint` false, `openWorldHint` true, and `destructiveHint` true only when `x-mcp` also says `destructive`; see [Destructive and additive tools](#destructive-and-additive-tools). A tool with `expose` false is no tool unless it is [opted in](#hidden-tools); one with no `x-mcp`, or one that does not match `McpOperation`, stops the server from starting. |
| Results | A text content item with the command's output; a `--json` command's output is the JSON text. A session on `2025-06-18` or later also gets `outputSchema` on each JSON tool and `structuredContent` in its results; see [Structured output](#structured-output). |
| Errors | A command that exits nonzero returns `isError` true with its exit code and its stderr (or stdout), redacted and cut to 4000 characters. A command that runs past the timeout returns `isError` true with a timed-out message only, no exit code or output. An unknown tool name also returns `isError` true, not a protocol error. |

## What it does not do

It serves stdio only. It does not serve Streamable HTTP, OAuth, or
per-organization scoping. Those belong to the hosted Blowhorn MCP
server, which is coming. Asking this server for HTTP refuses at
startup:

```bash
~/.local/bin/blowhorn-mcp --transport http
```

### The interim hosted gateway

Until Cloud answers on `mcp.blowhorn.ai` itself, an interim transport proxy
runs at `https://mcp.blowhorn.ai/mcp` (`hosted/` in blowhorn-ai/blowhorn-mcp).
It forwards each MCP request to Blowhorn's `/mcp` and Cloud's answer
back. Cloud owns the tools, token checks and activity events. The Worker
serves RFC 9728 protected-resource metadata locally (both
`/.well-known/oauth-protected-resource` and
`/.well-known/oauth-protected-resource/mcp`), naming Cloud's Blowhorn
authorization server, and rewrites Cloud's `401` `WWW-Authenticate` so
`resource_metadata` points at this origin.

Connect today with a Blowhorn API token as `Authorization: Bearer <token>`.
Create one on the Tokens page of your Blowhorn account; the steps are in
[Get a Blowhorn API token](/docs/how-to/set-up/connect-mcp-client/#get-a-blowhorn-api-token). The
Blowhorn desktop app has no screen for creating one.
Standards-following MCP OAuth clients can discover the authorization server
from the metadata, but end-to-end sign-in stays gated until Cloud enables
dynamic client registration (`POST /oauth2/register` currently returns 403).

The gateway is read-only today. Cloud serves four tools through it,
`listContentItems`, `getContentItem`, `getEvents` and `getConnections`, so a
client can read your queue, a post, your activity and your connections, but
cannot post, schedule or change anything. Writes with approval come with the
hosted Blowhorn MCP server.

The gateway is stateless: every MCP message is its own JSON-RPC `POST` to
`/mcp`. Opening `/mcp` in a browser sends a `GET` without a token, so it
answers with a JSON error, such as `Bearer token required` or
`Method not allowed: this stateless gateway answers POST only.`, rather than a
page. That is by design; see
[Opening the gateway URL in a browser](/docs/how-to/set-up/connect-mcp-client/#opening-the-gateway-url-in-a-browser).
`GET /healthz` answers `{"ok": true, ...}` without calling Cloud, so use it to
check that the gateway is up.

If a token you send through this gateway leaks, see
[Revoke a leaked token](/docs/how-to/set-up/connect-mcp-client/#revoke-a-leaked-token).

## Checking it

```bash
make mcp-generate   # verify the tool list and its output schemas cover the bundle
make mcp-test       # run the server's tests
```

Those targets need a checkout. With the app, run
`~/.local/bin/blowhorn-mcp --version` and
`~/.local/bin/blowhorn-mcp --list-tools`.

`--list-tools` prints the tool list as JSON and `--check-coverage`
runs the same coverage check on its own, both without serving. The
check fails, naming each offender, when an operation in the bundle has
no tool (a hidden one counts only when opted in), when a tool whose command has a JSON result has no output
schema, when an output schema uses a keyword the server cannot
enforce, or when a field under a secret-named key would reject
`"[redacted]"` and is not a boolean, null, `enum` or `const`, or marked
`x-mcp-not-secret` (named by tool and schema path, such as
`diagnostics_send #/properties/token_configured`). Mark a field in its
component's source YAML under `schemas/components/`, with a one-line
reason, then run `make schemas-bundle`. The server runs the same check
at startup and does not start when it fails. Both
also check the [metric catalog](#metrics) in the bundle, and refuse
one that does not conform, as serving does. With metrics on, read
them with `curl -s http://127.0.0.1:9465/metrics`. A tool
call may run at most 600 seconds by default
(`BLOWHORN_MCP_TIMEOUT`, or `--timeout`, changes that); see
[Options and environment](#options-and-environment).

## Catalog listings

The server is listed in the
[official MCP Registry](https://registry.modelcontextprotocol.io/) as
`io.github.blowhorn-ai/blowhorn`, status `active`, and its launcher is on
npm as [`blowhorn-mcp`](https://www.npmjs.com/package/blowhorn-mcp).
The latest version is 1.0.0 on both. The registry has 0.1.1 through
1.0.0; npm has 0.1.0 through 1.0.0.

Version 1.0.0 is the first stable release of the launcher. It adds no
launcher features over 0.1.4. It moves the launcher and the registry
entry to Apache-2.0 (0.1.4 on npm still says AGPL-3.0-only), and it
changes the hosted endpoint's rate limiter. The launcher needs Node.js
20 or later.

The listing input, `server.json`, lives in the public
[blowhorn-mcp repository](https://github.com/blowhorn-ai/blowhorn-mcp)
beside the source of the npm launcher. It carries the npm launcher's
version, not the Blowhorn release's, and each registry publish pairs with
an npm publish of the same version. Other catalogs are not listed yet.

To check the listing yourself:

```sh
npm view blowhorn-mcp version
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=blowhorn"
```

The first prints the latest npm version. The second lists the registry
entries; the one named `io.github.blowhorn-ai/blowhorn` with
`"isLatest": true` is the current one.

See also the [CLI reference](/docs/reference/cli/) for the commands themselves,
[Connect an AI assistant over MCP](/docs/how-to/set-up/connect-mcp-client/)
for the client-by-client setup steps, and
[Settings and configuration](/docs/reference/configuration/) for the config and
environment the server's subprocesses inherit.
