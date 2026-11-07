---
title: "Python client library"
description: "The generated Python client for the CLI's OpenAPI document: one API function per command, one model per JSON payload."
weight: 226
---

A generated Python client for the Blowhorn CLI: one API function per
command, one model class per `--json` payload. It is generated from
the CLI's OpenAPI document (`schemas/`), not hand-written.

## Install

The client is not on PyPI. Install it from a checkout:

```bash
pip install python/generated
```

```python
from blowhorn_schemas.models.config_show_response import ConfigShowResponse

response = ConfigShowResponse.from_dict(json.loads(stdout))
```

## What it covers

Every operation in the OpenAPI bundle: 121 commands, each as one
function under `blowhorn_schemas.api.<group>.<command>`, with the
request and response models under `blowhorn_schemas.models`. The
operations are shaped like the CLI, not like an HTTP service: each
one posts to `/cli/<command words>`, because that is what the
document describes. There is no HTTP server behind those paths today;
the models are the primary value. The MCP server
([MCP server](/docs/reference/mcp-server/)) is the runtime that maps tools to CLI
argv; this client does not replace it.

## Known gaps

- **Recursive selector wire: not generated.** `LocatorStep`,
  `SelectorWire`, `ElementRef` and `HostRequest` are absent: the
  pinned generator cannot build a recursive oneOf. They are the
  extension bridge's wire format, not CLI surface, and no generated
  API module references them.
- **One downgraded field: `ScheduleWhyResponse.pause_scopes`.** Its
  canonical type is object-or-array-or-null, which the generator
  cannot represent, so the client carries it as `Any`.

## For contributors

`make schemas-bundle`, which you run after changing a command, a flag
or a schema, regenerates the client as its last step. Install the
pinned tools once, or regenerate the client alone:

```bash
pip install openapi-python-client==0.29.1 ruff==0.17.0
make python-generate
make python-test
```

Never edit a file under `python/generated/src/` by hand. The full
account, including the OpenAPI 3.2 to 3.1 generator-input gap, is in
`schemas/README.md` (Python client library) and
`python/generated/README.md`.
