# Install the app


> Download the signed Mac app from blowhorn.ai and verify it.



Download the signed Blowhorn app for macOS, verify it, install it, and open
it.

The app carries its own engine and Python, so you need no copy of the
Blowhorn repository, no git and no Python on your computer.

## Download

Download the latest build from
[blowhorn.ai/download](https://blowhorn.ai/download/): it hands you the
current release's files from the
[blowhorn-site releases](https://github.com/blowhorn-ai/blowhorn-site/releases).

- `Blowhorn-mac.dmg` - the latest build, for Apple silicon and Intel Macs.
- `SHA256SUMS.txt` - the checksums for that release.

Verify the download before you open it. With both files in the same folder:

```bash
shasum -a 256 -c SHA256SUMS.txt --ignore-missing
```

The line for `Blowhorn-mac.dmg` must read `OK`.

## Install

1. Open the downloaded `.dmg`.
2. Drag the app onto **Applications** in the same window. Major Blowhorn
   points at it.
3. Open it from Applications. A notarized build opens without a warning.
   Don't run it from the disk image: a copy run from the
   disk image disappears when you eject it, so the app does not use its
   engine there and asks you to move it to Applications.

Requires macOS 13 or newer, on Apple silicon or Intel, and Google Chrome
142 or newer.
See [System requirements](/docs/reference/requirements/) for the full list.
Chrome is not bundled: Blowhorn
drives the Chrome profiles you already sign in to, through its Chrome
extension, which you add to each Chrome profile you post from
([Install the Chrome extension](/docs/how-to/set-up/install-the-chrome-extension/)).

## First muster

The app opens on its Setup screen until its engine is ready; after that the
guided setup takes over (see below). Setup checks, in order, the engine
(bundled in the app), its helper tools, the connection to your organization's
data, your Chrome profile mappings
([Map Blowhorn profiles to Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/)), and
the background service. Each activity says what it found, or what to do next.
Every activity is described under Setup in
[The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/#setup).

**The installed app runs only the engine it carries.** It does not look for
a checkout of the Blowhorn repository, at `~/code/blowhorn` or anywhere else,
so a checkout you already have keeps its own profiles and settings and the
app does not read them. If the engine in the app cannot start, Setup says so
in one line; [Fix an engine that won't start](/docs/how-to/troubleshoot/engine-wont-start/)
walks through it.

Connecting the Blowhorn Chrome extension to this computer takes no pop-up:

- **Connect it today:** the guided setup's **Getting ready** step connects
  it. The extension can then reach the
  app from every Chrome profile. Chrome is not opened and no Chrome setting
  changes.
- **Launching the app changes nothing:** it only looks. Nothing is written
  until you connect.
- **Safe to repeat:** if it's already connected, nothing is written again.
- **Guided setup:** the first time you open the app, the guided setup walks
  you through signing in, Getting ready and the rest, one step at a time.

See [Set up Blowhorn at first muster](/docs/how-to/set-up/first-muster-setup/).

Then check sessions and run a dry-run post. Nothing is published until you
post without `--dry-run`.

Your settings and data stay in `~/Library/Application Support/Blowhorn/home`,
outside the app, so replacing or updating the app keeps them.

## The `blowhorn` command

The app also puts the command line on this computer. Each time it
opens, it writes three small launcher files, `blowhorn`, `blowhorn-axi` and
`blowhorn-mcp` (the MCP server an AI client starts), into `~/.local/bin`. It does not ask to edit your shell startup files.
If a PATH block was added before, the app keeps that block up to date.
Open a new terminal afterwards and `blowhorn --help` runs the
engine the app carries: the same engine, the same profiles and settings as
the app, with nothing else to install.

- The app checks the launchers every time it opens and repairs them, so
  they keep working when you move the app or update it. Deleting a launcher
  is not a way to remove the command: the app writes it again the next time
  it opens. To remove everything, see
  [Uninstall Blowhorn](/docs/how-to/manage/uninstall/).
- Until `~/.local/bin` is on your `PATH`, the command works by its full
  path, `~/.local/bin/blowhorn`. The app does not add that folder for you.
- A file named `blowhorn` in `~/.local/bin` that Blowhorn did not write is
  never overwritten; the app says so and leaves it alone.

## Update

Updates come from the same releases page, and you need no GitHub account
for them. The app checks for a newer release every four hours (or when you
press **check now**), and once more each time you open it. When an installed
Blowhorn opens and that check finds a newer release it can install, a
prompt in the console window asks before anything is downloaded. **Update now** downloads,
installs and reopens the app, with its progress over the whole window; if the
install fails, that window says so and your current version is put back. **Later** installs nothing and skips that
version, so the next release asks again; **Update** in the app still offers
it meanwhile. The **?** icon next to the title explains how the update
installs.

**Update** in the app and **Update now** on that prompt take the same path.
They download the newer `.dmg` and check the app inside it before touching
your installed app: it must be Blowhorn (its bundle id and name), it must
be the version the release names, and it must be newer than yours. Only
then does Blowhorn install it and relaunch. When the app cannot install
the update itself, it says why and offers the
release page, where you download the newer `.dmg`,
verify it as in [Download](#download), and drag the app over the old copy.
The background service and your settings are kept. The engine is part of
the app, so updating the app updates the engine too.

[Update Blowhorn](/docs/how-to/manage/update-blowhorn/) shows each step the update
takes and what to do if it stalls.

## Related

- [What runs when the app is closed](/docs/explanation/distribution/) - the
  background service, quitting, and updates.
- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) -
  every screen, including Setup.
- [Install the Chrome extension](/docs/how-to/set-up/install-the-chrome-extension/) - the
  extension each mapped Chrome profile needs.
- [Uninstall Blowhorn](/docs/how-to/manage/uninstall/) - remove it cleanly

