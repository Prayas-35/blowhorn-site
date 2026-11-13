---
title: "Uninstall Blowhorn"
description: "Remove the app, the service, the extension host and the checkout's build products. macOS only."
weight: 196
aliases: [/docs/how-to/uninstall/]
---


Remove Blowhorn from your computer: the background service, the Google Chrome native host,
the launchers, the desktop app and the checkout's build products. The sign-in
on this computer goes with the app. Your other data stays unless you ask for it
to go. The account on the shared store is never touched.

macOS only. On Linux the command is refused by name and nothing is read or
removed.

## See what would be removed

Always start with the dry run. It lists everything the installer, the app,
the service and the extension install can leave on this computer, says whether
each is present, and removes nothing:

```bash
blowhorn uninstall --dry-run
```

Each line carries one result, `would remove`, `not present`, `not checked`,
`kept`, `not unregistered`, or `never touched` for the shared store, with the
path. `not checked` means the item's state could not be read, with the reason;
nothing is done to it, and it is never reported as absent.

The dry run always shows the full list, even when the real run would refuse.
Anything that would stop the real run (the app still open, unsynced run
records) is listed first under "Nothing was removed", and the command exits 1
so a script can tell. Resolve those, then run the real command.

## Remove Blowhorn and keep your data

```bash
blowhorn uninstall
```

The command removes, in order, reporting each item as `removed`, `not
present`, `not unregistered` or `failed`:

1. **The background service.** A loaded `ai.blowhorn.service` (the installed app's label; a checkout's is `ai.blowhorn.service.dev`) is booted out
   and waited for, then its file under `~/Library/LaunchAgents` is removed. A
   label the app registered as its login item is booted out the same way; its
   Login Items entry is unregistered by the app itself in step 5. The attach
   Chrome's login agent, `ai.blowhorn.attach-chrome` (written by
   `blowhorn chrome attach-chrome install-agent`), is booted out and its file
   removed the same way, as `uninstall-agent` does; a Chrome it started keeps
   running.
2. **The Chrome native host.** The manifest under Chrome's
   `NativeMessagingHosts`, the launcher and the bridge socket beside it.
   When the install wrote a second copy of the manifest for a custom Chrome
   data directory, that copy is removed too.
3. **The every-profile install entries.** The external-extensions file and
   Blowhorn's own entry in the managed policy, removed with the same
   administrator prompt that wrote them; other keys in that file stay.
4. **The launchers.** `~/.local/bin/blowhorn`, `~/.local/bin/blowhorn-axi`
   and `~/.local/bin/blowhorn-mcp`, when they carry the installer's marker. A file there that `tools/install.sh` did
   not write is kept and says so.
   Pass `--bin-dir` if you installed elsewhere. The marked block the
   installer or the app added to your shell startup file (`.zshrc`,
   `.bashrc`, or the fish config) is removed with them, exactly the marked
   lines and nothing else in the file.
5. **The desktop app.** `Blowhorn.app` first unregisters its own Login Items
   entries, then is removed. A bundle too old to unregister itself is reported
   `not unregistered`, naming the step left to you under System Settings >
   General > Login Items.
6. **The checkout's build products.** The virtualenv (removed only when it
   holds `pyvenv.cfg`), `node_modules/`, `desktop/node_modules/` and `data/logs/`.
   For the engine the app carries, the report calls its folder `home/` the
   checkout: its `data/logs/` goes here, and its `venv/` is kept because it holds
   only the app's interpreter link.

A failed item does not stop the run: everything else is still removed, and
the command exits 1. A real run that cannot read the sign-in in the Keychain
exits 1 as well, and leaves that item in place.

The sign-in on this computer is removed on every run, with or without `--purge`:
the Keychain item, `cloud.yaml`, the `cloud-token` file beside it, and the
guided setup progress (`onboarding-progress.json`). The next time you open
Blowhorn it starts as a first run. A signed-in session that actually survived
is the only case that can pick up a setup you left partway.

Kept at the end, and named: the store connection file an older version
wrote (`~/.config/blowhorn/store.yaml`; Blowhorn no longer reads it), the rest of the app's state
under `~/Library/Application Support/Blowhorn` (its preferences, its engine
record and, for the engine the app carries, that engine's folder `home/`),
Blowhorn's own Chrome trees and service sockets (`~/.blowhorn`), the per-user Library state, the checkout's
`data/cache/` (which holds each profile's runtime state on this computer), and
the scheduler pause file. A `data/profiles/` folder left by an older version is
never named and never touched: your profiles live in your Blowhorn account.

The checkout itself (for example `~/code/blowhorn`, with `tools/uninstall.sh` in it)
is never removed, under any flag, and the summary names it. Delete that folder
yourself if you no longer need it. The engine's `home/` is not a checkout:
`--purge` removes it with the rest of the app's state.

The summary ends by saying your Blowhorn account was not touched: your
profiles, content items, schedules and run history live in your account, not on
this computer, and no flag removes them.

## Uninstall from the app

In Settings, on the **Background & updates** page, **uninstall Blowhorn…** opens a confirm dialog and quits the
app; a helper the app leaves behind then runs the same command above,
once the app is gone (the command refuses while the app is running, so
the helper waits for it to quit first). It runs the engine the app
carries, not the `blowhorn` command on your `PATH`, so it works for an
install from the disk image even when that command was never set up.

By default your local data stays, exactly as with the plain command.
Turn on **also remove the local data** in the dialog for the `--purge`
scope instead. The shared store is never touched, under either choice.

If the run refuses - a scheduled pass still running, or run records
still waiting for the shared store - it removes nothing, and the reason
is written to `~/Library/Logs/Blowhorn/uninstall.log`. The app is still
installed then, so open it again once the run it named has finished, or
send the records first as in [When it refuses](#when-it-refuses).

## Remove the local data too

```bash
blowhorn uninstall --purge
```

`--purge` removes the kept list above as well. It shows what it is about to
remove and asks you to type `purge`; anything else cancels and removes
nothing. From a script with no terminal, pass `--yes`. `--json` needs `--yes`
too, because the prompt would otherwise land in the JSON output.

The account on the shared store, the content queue, the schedule, the profiles
and the ledgers, is not local data and is never touched, under any flag. Other
computers keep using it. Revoking the sign-in token removes that token from
the account's token list. It does not delete the account.

## Dragging the app to the Trash

Prefer **uninstall Blowhorn…** in Settings, or `blowhorn uninstall`: both run
while the app still exists, which is the only time it can take its own entries
out of System Settings > General > Login Items & Extensions.

To remove Blowhorn by dragging it instead, run the command once more before you
empty the Trash:

1. Drag the app to the Trash, as you would any Mac app.
2. In a terminal, run `blowhorn` once (any arguments, or none).

The launcher finds the app in the Trash and runs the full removal from the
engine the app carries: everything `blowhorn uninstall --purge` removes,
including your local data and the sign-in on this computer. That is the
difference from running `blowhorn uninstall` yourself with the app still
installed, which keeps your data: only use the Trash when you mean to
remove everything. Opening the trashed app instead offers the same finish.

### If you already emptied the Trash

The engine is gone with the app, so the full removal cannot run. Two steps
still clean up:

1. In a terminal, run `blowhorn` once. The launcher removes the files it can
   still reach: itself, the shell startup block, the background service and
   attach-Chrome agent files, the Chrome native host entry, and the app's own
   folder, `~/Library/Application Support/Blowhorn` (its preferences, so a
   later install does not inherit open at login). It names what it could not
   remove: the sign-in in your Keychain and the account token's revocation.
2. Clear the Login Items the app left, which only the app can unregister.
   Either install Blowhorn again and open it once - its first launch removes
   entries left by the deleted copy before it registers its own - then
   uninstall it from Settings, or remove **Blowhorn** under System Settings >
   General > Login Items & Extensions yourself.

Installing again and running `blowhorn uninstall` also removes the Keychain
sign-in and revokes the account token.

## Without a checkout

An install from the DMG puts the `blowhorn` command on your `PATH` (see
[The `blowhorn` command](/docs/how-to/set-up/install-the-app/#the-blowhorn-command)),
so the commands above work as written. With an app installed before the
command was added, or if the app has not opened since, run the same command
through the engine the app carries, with its own interpreter, and the same
flags:

```bash
BLOWHORN="$HOME/Library/Application Support/Blowhorn/home"
"$BLOWHORN/venv/bin/python" "$BLOWHORN/engine/blowhorn.py" uninstall --dry-run
```

Quit the app before the real run (see [When it refuses](#when-it-refuses));
the engine in that folder still runs with the app closed.

## When the venv is already gone

`tools/uninstall.sh` at the checkout root runs the same code with the system Python
and takes the same flags:

```bash
./tools/uninstall.sh --dry-run
./tools/uninstall.sh
./tools/uninstall.sh --purge
```

## When it refuses

The real run removes nothing while any of these is running, and names it (a
dry run names them too, above its preview): a scheduler tick, a pass of the background service, a run
holding the extension bridge, the desktop app (yours, or another macOS
user's on this Mac: `/Applications/Blowhorn.app` is one app for every user),
another macOS user's background service (it runs from the same app),
or run records still waiting in the local spool for your account. Send those records first:

```bash
blowhorn store --replay-spool --log-dir <log-dir>
blowhorn uninstall
```

When your account will never be reachable again from this computer, give the
records up instead with `blowhorn uninstall --discard-unsynced-runs`, which
asks you to type `discard` (pass `--yes` from a script or with piped input).

The replay sends the records to the account this computer is signed in to.
If it is signed out, `blowhorn store --replay-spool` fails with "Not signed in
to Blowhorn": run `blowhorn auth login`, then replay. If you can no longer sign
in to that account, the records cannot be sent from here; give them up with
`--discard-unsynced-runs`.

To quit the desktop app, click the Blowhorn icon in the menu bar and choose
**Quit Blowhorn**. Closing the window is not enough: the app keeps running in
the menu bar. Otherwise wait for the run to finish, then run the command again. `blowhorn service status` and `blowhorn chrome
extension-status` show what is running.

## Delete the checkout

When you no longer need Blowhorn, remove the checkout folder yourself, for
example:

```bash
rm -rf ~/code/blowhorn
```

## Reinstalling afterwards

Installing the app again from its DMG, or a fresh `./tools/install.sh` from the
same checkout, produces a working install. Your Blowhorn account and
everything in it are untouched; sign in again with `blowhorn auth login` or
from the app.

## Replacing the app by hand

Dragging a different copy of `Blowhorn.app` into place does not remove the
sign-in, and neither does emptying the Trash without running the removal
above. The sign-in stays in the Keychain until a copy of the app starts.

After this version has launched once, it remembers that bundle. Opening a
different copy then signs you out and asks you to sign in again. An update you
install from inside the app keeps the sign-in. The first launch of this version
keeps the sign-in you already have.

To sign out of the copy that is open now, run:

```bash
blowhorn auth logout
```

## Related

- [Keep posting when the app is closed](/docs/how-to/schedule/background-service/) - stop the service before removing it
- [Fix the Chrome extension connection](/docs/how-to/troubleshoot/extension-connection/) - check what is running first
- [Change your defaults](/docs/how-to/settings/defaults/) - log directories the dry run reports on
