# Choose how Blowhorn reaches Chrome


> Stay on the extension default, or attach to your Chrome or launch Blowhorn's own. Advanced.



Most runs should keep the default: Blowhorn drives Google Chrome through the Blowhorn
Chrome extension and launches nothing of its own. Change it only when one run
or one job needs a real Chrome window. Advanced page: the default is the right
choice until you have a reason.

## Before you start

Every profile the run acts for must be mapped to a Chrome profile first. A run
refuses an unmapped profile by name in every mode. `blowhorn chrome status`
reports which mode a run would use right now, and every run names the driver
it used once.

## The default: the extension

With nothing set, a run drives your mapped Chrome profiles through the
extension. It opens one mapped profile per process, a scheduled job included,
and refuses by name what the extension cannot do yet. During early access your
Blowhorn administrator helps you install it.

One case needs another mode today: the extension's typing does not reach X's
editor or sign-in form, so X posts and X sign-ins stop before anything is
typed. Run those with `--chrome-launch persistent`.

## Launch Blowhorn's own Chrome

```bash
blowhorn post --profile ada --chrome-launch persistent
```

For one shell instead of one run: `BLOWHORN_CHROME_LAUNCH=persistent`. To move
the whole process back to launching: `BLOWHORN_EXTENSION_ROLLBACK=1`.

The run launches Blowhorn's own Chrome from its automation directory, with
your mapped Chrome directory as the profile inside it. No allow dialog ever,
and it runs beside your open daily Chrome without contending for its lock.
Each automation profile starts empty, so sign it in once with `--headed`
before a real run.

The launched window is a normal window placed off to the side (2500,60),
never minimized and never hidden, with the previous app re-activated so it
takes no focus. A minimized or app-hidden window puts the page into
`visibilityState: 'hidden'` with timers throttled to about one second, which
is what a site's own scripts see while a flow waits for them;
the visible posture is what keeps a flow's waits running at pace. A
`--headless` request becomes this window, and the unattended argv does not
change.

## Attach to the Chrome you have open

```bash
blowhorn post --profile ada --chrome-launch cdp
```

Mac only. The run connects to your open Chrome, Chrome asks you to allow the
connection once per run, and Blowhorn's tab opens in the mapped profile. The
dialog has no "remember me", so every run asks again: this is an interactive
mode, for runs you watch. Never pin an overnight job to it: with nobody there
to click allow, the job waits out the short unattended bound and fails by
name, every time.

A dialog outlives the run that raised it. Clicking allow in a leftover dialog
approves nothing: click cancel there and run again.

## An unattended attach: no Allow dialog

For the authenticity of a real Chrome profile with no dialog, run a second
Chrome on a tree of its own. Chrome 136 and later ignore the classic port
switch on the default data directory, which is why this is a separate Chrome
and not your daily one. Mac only.

**What you are trading.** That Chrome's debugging port has no password and
asks for no Allow. It is bound to `127.0.0.1`, so nothing off this computer can
reach it, but `127.0.0.1` is shared by every macOS user on this Mac: any
program running as you, **or as any other user signed in on this Mac**, can
drive that Chrome and read its cookies, for every account signed in there. That
is why this route is off by default: `start` and `install-agent` refuse unless
you pass `--allow-other-users`. Do not use it on a Mac other people sign in to.
Sign it in only to the accounts Blowhorn posts from, never your personal email
or bank.

### 1. Sign in once, with no debugging {#section-1-sign-in-once-with-no-debugging}

```bash
blowhorn chrome attach-chrome signin
```

That opens Chrome on `~/.blowhorn/attach-chrome` with no remote debugging at
all, because some sites (Google among them) refuse to sign in inside a browser
started with debugging on. In that window, add one Chrome profile per Blowhorn
profile, sign each in to the sites it posts to, then quit Chrome (Cmd-Q) so
the sign-ins are saved. They carry over to the next step.

### 2. Start it with the port open, and map it {#section-2-start-it-with-the-port-open-and-map-it}

```bash
blowhorn chrome attach-chrome start --allow-other-users
blowhorn config set defaults.chrome.data_dir ~/.blowhorn/attach-chrome
blowhorn chrome profiles
blowhorn chrome map ada 'Default'
blowhorn post --profile ada --chrome-launch cdp
```

`start` launches Chrome with `--remote-debugging-port=0
--remote-debugging-address=127.0.0.1`,
`--disable-blink-features=AutomationControlled` and `--test-type` (the
same pair launch mode passes, which keeps `navigator.webdriver` false
and the unsupported-flag infobar off), plus `--no-startup-window`, so it
starts with no window and never comes in front of what you are doing. To sign
a profile in, click Chrome in the Dock to open its window. Then `start`
steps back: Blowhorn never drives
that process directly, only tabs in it. Chrome picks the port and records it
in `DevToolsActivePort`. Before every `cdp` run attaches, Blowhorn checks that
the recorded port is listened on by the Chrome holding the tree (its
`SingletonLock`), on loopback only, and refuses by name otherwise.

One step can still bring Chrome forward for a moment: when a `cdp` run proves
which profile it is in, it hands Chrome a `--new-window` command line so the
right profile opens the proof tab. That handoff is kept because the profile
proof depends on it.

### 3. Keep it up for scheduled jobs {#section-3-keep-it-up-for-scheduled-jobs}

```bash
blowhorn chrome attach-chrome install-agent --allow-other-users
blowhorn config set defaults.chrome.launch_mode cdp
```

`install-agent` adds a LaunchAgent, `ai.blowhorn.attach-chrome`, that runs
`attach-chrome start` once at each login. It never restarts a Chrome you
quit. With `defaults.chrome.data_dir` pointing at the tree and
`defaults.chrome.launch_mode` set to `cdp`, every scheduler tick attaches to
it with no dialog. To pin one job instead of the whole checkout, set that
job's `Driver Mode` to `cdp`. `uninstall-agent` removes the agent and leaves
Chrome running. `blowhorn uninstall` removes it
too.

### Day to day

- `blowhorn chrome attach-chrome` reports the tree: whether a Chrome holds
  it, its recorded port, and the next step. Any action with `--dry-run`
  prints what it would do and does nothing.
- `blowhorn chrome attach-chrome stop` quits that Chrome the way Cmd-Q does
  (DevTools `Browser.close`, so a sign-in it just refreshed is saved), waits,
  then sends `SIGTERM`. It never force-kills. Use it before `signin` when a
  site needs signing in again.
- Starting is refused when the tree is Chrome's own default data directory,
  when a Chrome with a port is already up there, and while the tree is open
  without debugging (the `signin` window). A `DevToolsActivePort` left by a
  crashed Chrome is cleared, not refused.

## One scheduled job, its own driver

A job names its driver in its `Driver Mode`: `default`, `extension`,
`extension-classic`, `extension-background`, `cdp` or `persistent`. The two
`extension-` values pick the extension and its [mode](/docs/reference/chrome/#extension-mode-classic-or-background)
for that job. Set "browser driver" in the job editor, or the key on `blowhorn
schedule upsert`. The choice belongs to that job alone and applies to nothing
else in the pass.

Two explicit overrides still win over the job: a launch mode forced on the
whole tick (`--chrome-launch` on the tick, or `BLOWHORN_CHROME_LAUNCH` in its
environment), and `BLOWHORN_EXTENSION_ROLLBACK=1` over a job set to
`extension`. A tick forced to `extension` still runs an `extension-classic`
or `extension-background` job in that job's mode, since the driver is the one
it asked for. The job's log names the driver it used and says when an override
beat it.

## Where the setting is read

Top wins over everything below it, with one exception: the rollback switch
also beats a job set to `extension`, and it replaces whatever the file says.

| layer | spelling |
| --- | --- |
| one run | `--chrome-launch auto\|cdp\|persistent\|extension`, on every command |
| your shell | `BLOWHORN_CHROME_LAUNCH=cdp` |
| one scheduled job | its `Driver Mode` (`default`, `extension`, `extension-classic`, `extension-background`, `cdp`, `persistent`) |
| debugging | `BLOWHORN_BROWSER_DRIVER=cdp` (no file key, no flag) |
| whole process fallback | `BLOWHORN_EXTENSION_ROLLBACK=1` selects launching unless a layer above decides - a job's `cdp` or `persistent`, or the variable's `auto`, `cdp` or `persistent`; a job's `extension`, the variable's `extension` and the file's value all give way to it |
| this checkout | `defaults.chrome.launch_mode` in `.blowhorn.yaml` |
| nothing set | the extension default |

A value outside the four is refused before anything runs. A forced `cdp`
against a Chrome that is not ready is refused with the next step `blowhorn
chrome status` prints; only `auto` falls back to launching, and says so once.

A scheduler tick adds no layer of its own: unless the flag is on the tick's
argv, each job resolves its own driver.

## When something refuses

| sentence | what to do |
| --- | --- |
| `profile ada has no chrome profile mapped on <host>; …` | `blowhorn chrome map ada '<directory>'` |
| `chrome launch mode is cdp but chrome is not ready: <next step>` | do the next step, or drop the forced `cdp` |
| `chrome's 'Allow remote debugging?' dialog was not answered within 120 s; …` (20 s for a scheduled job) | click cancel in the dialog still open in Chrome, run again and click allow in the new one, or run with `--chrome-launch persistent` |
| `profile ada on linkedin is in use by blowhorn process <pid>; …` | another run is acting as that profile: wait for it, or stop it |
| `… is google chrome's own data directory; …` | the dedicated tree must never be Chrome's own default directory |
| `… is open in a chrome without remote debugging (pid <n>) …` | quit the `signin` window (Cmd-Q), then `attach-chrome start --allow-other-users` |
| `port <n> is listened on by pid <m>, not by the chrome holding …` | another program has that port: `attach-chrome stop`, then `start` |
| `no live chrome holds … so port <n> recorded there is left over …` | `blowhorn chrome attach-chrome start --allow-other-users` |

## Related

- [Change your defaults](/docs/how-to/settings/defaults/) - the file layer these settings sit in
- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - give one job its own driver
- [Fix the Chrome extension connection](/docs/how-to/troubleshoot/extension-connection/) - when the default route breaks
- [Post to X when it will not confirm](/docs/how-to/troubleshoot/x-posting/) - the one case that needs another mode

