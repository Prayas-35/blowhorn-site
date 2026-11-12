# Run a diagnostics check with Tells


> Drive one profile to tells.blowhorn.ai under each operating mode, save the reports on this computer, and compare what each mode leaks.


The desktop app's Debug area (the account menu's Debug item) is open to
anyone who can reach the console: run tells checks, read saved packages,
read this computer's logs, and see the doctor's checks. The same runs are
available from the command line. `blowhorn auth status --json` still
lists the permission keys your session holds in the Blowhorn parent
organization as `permission_keys`, but they no longer decide who sees
the area.

## Run one mode

```bash
blowhorn diagnostics tells-run --profile personal --json
```

This drives the profile to the live [tells.blowhorn.ai](https://tells.blowhorn.ai/),
waits for its inspection to finish, and saves the report it renders as one
package on this computer. `--mode` chooses how Blowhorn reaches Google Chrome:

- `extension-background` -- the default: the extension driver in
  background mode, the way Blowhorn normally runs.
- `extension-classic` -- the extension driver in classic mode.
- `cdp` -- attach to the Chrome you already have open.
- `persistent` -- Blowhorn launches its own Chrome.

`--anonymous` uses a fresh throwaway profile labelled `anonymous` instead
of a named profile. Only `persistent` runs: Blowhorn launches its own
Chrome on a new temporary folder, removed when the run ends, and reads no
Chrome mapping. The extension modes are refused for it by name: a fresh
profile has no Blowhorn extension installed. `cdp` is refused too: it
attaches to the Chrome you already have open, which is not a fresh
profile. A run that pretended otherwise would measure nothing.

## Run every mode

```bash
blowhorn diagnostics tells-sweep --profile personal --json
```

A sweep runs each mode in order and saves one package per mode plus a
sweep manifest naming them. A mode that fails is recorded in its own
package and in the manifest, and the sweep goes on: the comparison
between modes is the finding, so a partial sweep is still evidence.

## Compare a competitor tool's report

Run the competitor tool against the live tells page on your own
computer, export the page's raw report JSON, and import it:

```bash
blowhorn diagnostics import-tells --file browser-use-report.json --tool browser-use --json
```

The report is stored verbatim, wrapped in the same tells-run envelope
a run Blowhorn drove itself writes, so `diagnostics reports` lists it
and `diagnostics report` reads it back beside Blowhorn's own runs. The
package says what it is: its mode is `external`, its profile column
names the tool (there is no Blowhorn profile behind it), and it is
never a member of a sweep. Nothing is uploaded, and no audit event is
recorded for an import. A file that is not a Tells report is refused
and nothing is written. The benchmark runs themselves -- same Mac, same
Chrome version, terms checked per tool -- are still Mac work; this
command is only the import half, for a report someone already captured.

## Read what you saved

```bash
blowhorn diagnostics reports --json
blowhorn diagnostics report --id <id> --json
```

Packages live on this computer only, under
`data/cache/diagnostics/tells` (or `BLOWHORN_DIAGNOSTICS_DIR` when set).
Nothing is uploaded. Each package names the Blowhorn and Chrome
versions, the mode and its driver, the profile and whether it was
anonymous, and the report exactly as the page produced it -- or why the
run failed.

## Read the logs

In the desktop app, the Debug area's logs section lists the run logs and
the service logs on this computer, newest first. Pick one to read its
tail, and refresh to re-read it. Nothing here is uploaded.

## The audit trail

Each run, sweep and opening of the Debug area is recorded to
Blowhorn as an event (category `blowhorn`, actions
`diagnostics_run` and `diagnostics_open`) when you are signed in, so who
ran what, when, is on record. Posting is best-effort: signed out or
offline never fails a run.

```bash
blowhorn diagnostics opened --json
```

The desktop app runs this when the Debug area opens; it answers
`{"ok": true, "posted": true}` when the event reached Blowhorn.

