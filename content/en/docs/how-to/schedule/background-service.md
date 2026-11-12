---
title: "Keep posting when the app is closed"
description: "Run scheduled passes from the background service, and quit cleanly."
weight: 153
---


Scheduled passes keep running with no window open. One background service owns
the schedule: it runs a pass when an activity falls due, re-scans at least once
a minute, and starts with a pass as soon as it starts.

## Check the service

```bash
blowhorn service status
blowhorn service start
```

`service status` names the owner, whether the service is running, the last
pass and the pass in flight. `service start` loads the service if it is stopped
and asks a running one to look at the schedule now. In the app, the "this
computer" screen shows the same state.

While no pass is running, the service also tells your Blowhorn account that this
computer is still here, about once a minute, so the computer shows online there
between passes. It sends nothing while you are signed out.

When this install is signed in to a Blowhorn account, one pass runs at a time. A
second `blowhorn schedule tick` or `blowhorn schedule trigger-now` while that
pass is running stops, and Blowhorn says it is already running on this
install.

The owner tells you who manages it: the desktop app registered it itself, or
the command line installed it from a file. When the app owns it, the app's
setting "keep this computer on duty after quit" (on by default)
decides whether quitting stops it. Quitting with a pass in flight asks what to
do, in a small prompt in the Blowhorn window that lists what is running:

- **finish, then stop** lets the service end the pass, then stops it.
- **cancel and stop** ends the pass after the step in progress - the post being
  published, or a run that can't be interrupted safely - and the rest goes back
  to the queue. It resumes the next time Blowhorn or the service starts, and
  nothing is marked failed.
- **stay open** (or closing the prompt) changes nothing.

However the app is quit - the menu, Cmd-Q, the menu-bar icon's Quit, a quit
from another app, or a `SIGTERM`, `SIGINT` or `SIGHUP` - it stops the commands
it started, removes its menu-bar icon and exits within a few seconds. A quit by
signal (logging out, for example) has nobody to answer the prompt, so with the
setting off and a pass in flight it takes **finish, then stop**. With the
setting on, no quit of any kind touches the service.

## When the service keeps exiting

If This computer says the background service keeps exiting, the service starts,
stops at once, and macOS starts it again, so nothing scheduled goes out. The
**Service** row on the Status tab names the likely cause in one line. Choose **See
how to fix it** to open the Troubleshooting tab, where a card says why, read from
the service's own log:

- **The likely cause**, and what to do about it. A step Blowhorn can take for you
  is a button: **Register the service**, **Update Blowhorn**, **Open service log**
  or **Contact support**. When Blowhorn itself crashed, **Open service log** opens
  the error log that holds the full details. After you take one, the card reads the service again and
  says whether it now runs or still exits. That answer stays only while the service
  is in the state it describes; when the service changes again, the card shows the
  new state instead.
- **The last line the service logged**, and an **error code** such as
  `blowhorn-engine-1007` to quote to support.

Below that card, the Troubleshooting tab has the rest: how the service last exited,
who registered it, and the service log's last lines, with **Open log** and **Show in Finder**.
If the log can't be opened, the screen says why.
From the command line, `blowhorn service status --json` carries the same facts
under `last_exit`, `logs` and `diagnosis`.

Blowhorn 1.100.0 through 2.0.1 had one such cause on every signed-in computer: the
service's control connection lived inside the account's log folder, whose path is
longer than macOS allows for one. Update Blowhorn, and the service starts on its
own.

## A separate data folder

A run that sets `BLOWHORN_USER_DATA_DIR` (a test, a packaged check, or a second
copy of the app's data) does not register, re-register, or remove the shared
background service. Scheduling on this computer runs from the normal install.
That run also leaves `~/.zshrc`, `~/.local/bin`, the app's open-at-login item,
the `blowhorn://` link handler and the installed app in `/Applications` alone.
It never reads the account you signed in with in your login Keychain, and it
keeps its own sign-in and Google Chrome folders inside its data folder. Its menu bar
icon reads `test`, and its tooltip says `Blowhorn (test)`.
It still reads the service's state, so Setup shows it, and when it quits it
stops any Chrome it started on a throwaway folder under the system temp
directory.

The normal install registers the service only after it has written `engine.json`.
Until that file exists, it waits and tries again quietly, so the service does
not start, fail, and start again.

## Install it without the app

On a computer without the desktop app:

```bash
blowhorn service install
```

A checkout installs its own service under the label `ai.blowhorn.service.dev`, so
it never replaces the installed app's `ai.blowhorn.service`. The engine inside
Blowhorn.app cannot install one: `service install` and `service update` stop with
one line that names the fix, Open Blowhorn, then This computer, then Register the
service. A file-installed `ai.blowhorn.service` that a checkout wrote before this
label existed shows as legacy in `service status`; `service update` moves it to
`ai.blowhorn.service.dev`.

`service test` validates the schedule and previews a pass the way the service
would run it. `service stop` drains the pass in flight before it stops; the
definition stays, and `service start` loads it again. `service update` brings
a file-installed definition up to date with the checkout, and only reloads
when it differs.

Every verb takes `--dry-run` to print what it would do, and `--json` for the
shape the app reads.

## Cancel a pass in flight

```bash
blowhorn service cancel
```

Cancelling stops at the next safe point, never mid-post: the activity the pass was
on returns to the queue exactly as claimed, with no retry counted, and the
next pass takes it up again. The run ledger records the pass as cancelled,
never failed.

## Related

- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - create the activities the passes run
- [Pause and resume posting](/docs/how-to/schedule/pause/) - hold claims without stopping the service
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - read one activity's state
- [Uninstall Blowhorn](/docs/how-to/manage/uninstall/) - remove the service for good
- [You're in control](/docs/explanation/youre-in-control/) - what an unattended run will and won't do
