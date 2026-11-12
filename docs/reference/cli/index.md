# CLI reference

> Every command, the shared flags, and profile resolution.



Every command, the flags they share, and how a profile is resolved. Each command's flags and
examples are on [its own page](#command-pages).

> **The Major says:** "Your agent gives the order. I carry it out. Once."


## CLI Usage (Subcommand UX)

Blowhorn now uses a command-first UX:

```
blowhorn <command> [flags]
```

Legacy `--action ...` mode is removed.
Use `blowhorn -h` (or `blowhorn --help`) to view help and command examples.

**Every command's `--help` carries a description specific to that command and at least one worked example**, and commands with genuinely distinct modes carry one example per mode - a source, a platform, a sentinel value, or the preview-then-`--apply` pair. Where a command has a `--dry-run` or a preview posture, at least one example leads with it, so nothing in the help text sends, posts, or connects for real without saying so. Sentinel values are spelled out rather than left to be discovered: `--limit 0` means target-only mode on `follow` and "no limit" on `schedule tick`.

This is a standing rule, not a one-off pass. `tests/test_cli_help_coverage.py` enforces it structurally - every registered command must expose a non-empty description and an examples epilog containing at least one example that runs that very command; no two commands may share a description or an examples block; and every example in every epilog is parsed by the real argument parser, so an example naming an option that does not exist fails the suite. A new command therefore cannot ship without contextual help and examples.

CLI framework: Python `Typer` (inspired by modern CLIs like `docker`, `kubectl`, and `gh`).
If `typer`/`click` are missing, `blowhorn` attempts a one-time bootstrap install via `python -m pip install typer click` using the active interpreter.
Should that bootstrap fail, `blowhorn` falls back to an argparse parser built from the same help and example constants as the Typer app, and the same test file asserts the two surfaces expose the same commands with identical prose - so the fallback can never drift into a second, staler help text.
For a fresh virtualenv, install the full project runtime with `pip install -r engine/requirements.txt`, which declares every runtime dependency and its version range. `psycopg`, `gspread` and `oauth2client` are still listed only for one-time maintainer scripts; no command imports them, and they go with those scripts.

Global flags (available on all commands):

```
--profile <name|p1,p2,...|all>
--platform <bluesky|github|hn|linkedin|reddit|slack|x|all>
--exclude <p1,p2,...> (alias: --e)
--log-dir <directory>
--tee-stdout
--headless
--headed
--chrome-launch <auto|cdp|persistent|extension>
--dry-run
--pace <fast|normal|slow|NUMBER>
-v, --verbose
--config <path>
```

`all` is a reserved alias, not a real profile name. When you use `--profile all`, Blowhorn expands to all configured profiles and then removes any names passed via `--exclude` / `--e`.
Use `--exclude none` when you want to clear configured default exclusions for a single run.
When you pass explicit profile names with `--profile your-profile,second-profile`, those named profiles are processed even if they appear in the configured exclusion list.
Google Chrome is never run headless. With `--headless`, Chrome puts `HeadlessChrome/<version>` in the `User-Agent` header of every request while its client hints still say Google Chrome, which tells every site the run is automated. So `--headless` now means *unattended*: the browser opens as a background window (minimized, kept out of the foreground, the same window a flagless run opens), and no one is waited for at a sign-in or challenge. Use `--headed` when you want the window visible and in front so you can finish a sign-in yourself. `blowhorn schedule tick` runs its jobs unattended but never forces visibility onto them - each job resolves its own from its params, then the environment, then Settings - so scheduled jobs never wait for someone who is not there whatever the window does. `trigger-now` runs its one activity attended, so it may wait for you.

`--headed` and `--headless` are one choice with two spellings, so exactly one of them survives resolution. `--headed` wins a tie, but only from an equal or higher-precedence layer: `defaults.headed: true` in `.blowhorn.yaml` does **not** cancel a `--headless` typed on the command line or set through `BLOWHORN_HEADLESS`. A run that passes `--headless` opens the background window whatever the file says.

Blowhorn drives only the installed Google Chrome ([requirements](/docs/reference/chrome/#requirements)). When it is missing, every browser-backed command refuses with one sentence instead of starting Playwright's bundled Chromium, whose user agent and client-hint brands both read `HeadlessChrome`. The refusal comes before the browser driver is started and ends the command with exit 1: a `--profile all` run stops there rather than repeating the sentence for every profile and platform and finishing as if it had run.

`--chrome-launch <auto|cdp|persistent|extension>` says how this run reaches that Chrome, for one run: `extension` (the default) drives Chrome through the [Blowhorn Chrome extension](/docs/reference/chrome/#the-extension-default) and starts no Playwright Chrome; `persistent` launches Blowhorn's own Chrome from `chrome.automation_data_dir` with the mapped Chrome profile directory inside it, `cdp` attaches to a Chrome that is already open (it must be `ready` per `blowhorn chrome status`; your daily Chrome asks you to Allow the first connection of the run, a [dedicated attach Chrome](/docs/reference/chrome/#a-dedicated-attach-chrome-no-allow-dialog) does not, and the run works in its own visible window), and `auto` attaches when Chrome is ready and launches otherwise, saying `using blowhorn chrome (persistent): <next step>` once on stderr when it falls back. Resolved as the flag, then `BLOWHORN_CHROME_LAUNCH`, then `BLOWHORN_BROWSER_DRIVER`, then `defaults.chrome.launch_mode` in `.blowhorn.yaml`, then the built-in `extension`; `BLOWHORN_EXTENSION_ROLLBACK=1` selects `persistent` in place of `BLOWHORN_BROWSER_DRIVER=extension`, the file's value or the built-in; any other value is refused before anything runs, naming the four. Every browser run needs the profile mapped with `blowhorn chrome map` first, in either mode: an unmapped profile you named is `ERROR` and exit 1, one reached through `--profile all` is one `WARNING` line and the walk continues. A job `blowhorn schedule tick` or `trigger-now` runs resolves its own driver: the job's driver mode, then `BLOWHORN_BROWSER_DRIVER`, then `defaults.chrome.launch_mode`, then the built-in `extension`, with `BLOWHORN_EXTENSION_ROLLBACK=1` beating a job's `extension` as it beats `BLOWHORN_BROWSER_DRIVER=extension`, the file's value and the built-in; `blowhorn schedule tick` and `trigger-now` hand their `--chrome-launch` to every job they run, and a `tick` with none of its own leaves the launch mode unset so each job resolves its own; an explicit `--chrome-launch` on the tick still wins. `trigger-now` keeps a launch mode only when `--chrome-launch` or `BLOWHORN_CHROME_LAUNCH` chose it; otherwise its job resolves its own mode the same way. A forced `cdp` against a Chrome that is not ready is refused with `chrome status`'s next-step sentence; the run tells you to click Allow before it connects and waits up to 120 seconds for it; a connection still unanswered then is refused by name. A job `schedule tick` runs is unattended: it is told nothing and waits 20 seconds, so it fails by name rather than hangs. `trigger-now` is attended and gets the 120-second window and the notice. `blowhorn chrome status` shows the mode a run would use right now; see [Launch modes](/docs/reference/chrome/#launch-modes) and [Choose how Blowhorn reaches Chrome](/docs/how-to/settings/launch-mode/).

`--pace` controls the speed of randomised delays between actions. Use a preset name (`fast` = 0.5×, `normal` = 1.0×, `slow` = 2.0×) or any positive number as a multiplier (e.g. `--pace 0.25` for quarter-speed delays, `--pace 3` for triple). The default is `normal`. Can also be set via the `BLOWHORN_PACE` env var or the `pace` key in `.blowhorn.yaml` defaults; the precedence is always the flag, then the env var, then the config key.

`--pace` is a global flag: every command and subcommand accepts it, and so does the root, so `blowhorn --pace slow post --profile your-profile`, `blowhorn schedule --pace slow tick` and `blowhorn post --profile your-profile --pace slow` all mean the same thing (the flag nearest the subcommand wins when more than one is given). Commands that never sleep - `auth`, `config`, `desktop`, `service`, `store`, `uninstall`, `setup`, the read-only `schedule` and `profile` subcommands, `report`, `analytics history` / `operations` - still accept it, still resolve it through the same chain and still reject an unrecognised value, but it changes nothing about how they run beyond the `Pace` column of the `-v` summary; each of them says exactly that in its own `--help` rather than implying a delay it never takes.

For commands that support multi-profile execution (`post`, `accept`, `follow`, `unfollow`, `comment`, `analytics`, `report`), you can pass `--profile all` or a comma-delimited subset such as `--profile profile-a,profile-b` to run only that set of profiles.

All commands accept `--dry-run`, but they do not all preview the same amount. `post`, `report`, `find`, `withdraw`, and `accept` run their real pipeline with every write suppressed, so they print what *would* happen. (`withdraw` goes further: preview is its default and it acts only when you pass `--apply` - for it `--dry-run` simply forces the preview it would have produced anyway. `accept` does the same on the received-invitations page: it opens the page, resolves the same Accept controls a real run would click, names everyone it found, and clicks nobody - see [Accepting incoming invitations](/docs/how-to/grow/accept-invitations/).) The remaining action commands - `follow`, `unfollow`, `comment`, and `analytics` - stop immediately and report `dry-run: no changes made` without doing any work. (`source --platform github` lists the audience and, on `--dry-run`, writes nothing; a real run stores one row per login and prints no email address.) (`follow --platform github` and `star` are the exceptions inside that list: neither has a browser to stop before, so follow's preview performs the real follower walk and names exactly who would be followed - see [Previewing a GitHub follow run](/docs/how-to/grow/follow-on-github/#previewing-a-github-follow-run) - and star's preview reads each repository's star state and names exactly which would be starred, issuing no PUT - see [Star repositories on GitHub](/docs/how-to/grow/star-on-github/).) (`unfollow` runs on Bluesky only, with `--platform bluesky --target <handle>`, and its `--limit` is accepted and not read. On X, or with no platform, the platform is refused by name before a browser opens and the run exits 1, dry run included: X unfollow does not run until a follow-back badge and a confirmed landing are both read. `unfollow` cannot be scheduled.) `schedule`, `desktop`, `service`, `store`, `auth`, `uninstall` and `setup` are not covered by that sentence: they implement their own dry-run output (for example `schedule tick --dry-run` reports the activities it would run, `service start --dry-run` prints the command it would run, `store --replay-spool --dry-run` counts what a replay would push without writing any of it, `auth login --dry-run` names where it would sign you in and opens, waits for and saves nothing, `auth logout --dry-run` lists what it would remove, and `uninstall --dry-run` lists every item it would remove or keep, and `setup --dry-run` reports each step it would write as `planned`). Either way nothing is published.

Because the `COMMAND SUMMARY` footer is shown only when `-v` / `--verbose` is used, a dry run of one of the stop-early commands prints nothing at all without `-v` - except `source --platform github`, which lists the audience it would store. That silence is expected, not a failure.

## Command pages

Every command has a page of its own, with its flags, their types and defaults, and worked
examples. The pages are generated from the CLI's schema, which is itself generated from the CLI
and checked against it, so a page says what `--help` says.

<!-- BEGIN generated command table: release/scripts/cli_reference/build.py; do not edit -->

| Command | What it does |
| --- | --- |
| [`blowhorn accept`](/docs/reference/cli/accept/) | Accept pending LinkedIn connection invitations other people have sent you, one at a time with a randomized pause between each. |
| [`blowhorn analytics`](/docs/reference/cli/analytics/) | blowhorn analytics: activities, activity, history, import-exports, operations, pages. |
| [`blowhorn auth`](/docs/reference/cli/auth/) | blowhorn auth: anonymous-usage-stats, login, logout, share-activity-publicly, status, switch-organization. |
| [`blowhorn chrome`](/docs/reference/cli/chrome/) | blowhorn chrome: active-tab, attach-chrome, confirm, create-profile, discover, extension-enable, extension-install, extension-mode, extension-status, map, open-profile, profiles, remember, spaces-setup, status, suggest, unmap. |
| [`blowhorn classify-url`](/docs/reference/cli/classify-url/) | Say what a link is, by the platform rules the engine keeps. |
| [`blowhorn comment`](/docs/reference/cli/comment/) | Post LinkedIn, Reddit, or Bluesky comments from scheduled activities or ad-hoc target/message flags. |
| [`blowhorn config`](/docs/reference/cli/config/) | blowhorn config: get, path, set, show. |
| [`blowhorn content`](/docs/reference/cli/content/) | blowhorn content: approve, delete, get, list, posts, upsert. |
| [`blowhorn desktop`](/docs/reference/cli/desktop/) | blowhorn desktop: build, install, start, status. |
| [`blowhorn find`](/docs/reference/cli/find/) | Search Bluesky and GitHub for posts, issues, and pull requests matching a query, with optional date, author, and relevancy filters. |
| [`blowhorn follow`](/docs/reference/cli/follow/) | Follow accounts on X, Bluesky, or GitHub. |
| [`blowhorn github`](/docs/reference/cli/github/) | blowhorn github: squatters. |
| [`blowhorn org`](/docs/reference/cli/org/) | blowhorn org: members. |
| [`blowhorn platforms`](/docs/reference/cli/platforms/) | blowhorn platforms: capabilities. |
| [`blowhorn post`](/docs/reference/cli/post/) | Publish pending posts or amplify existing content across supported platforms. |
| [`blowhorn profile`](/docs/reference/cli/profile/) | blowhorn profile: accounts, auth, create, current, delete, get, list, set, status, switch, update. |
| [`blowhorn report`](/docs/reference/cli/report/) | Generate a consolidated report summary from the exports already sitting in the repository-root data/analytics/ directory. |
| [`blowhorn risk`](/docs/reference/cli/risk/) | blowhorn risk: grid, set, show. |
| [`blowhorn schedule`](/docs/reference/cli/schedule/) | blowhorn schedule: bootstrap, delete, destinations, fleet, get, list, pause, resume, status, tick, trigger-now, upsert, validate, why. |
| [`blowhorn service`](/docs/reference/cli/service/) | blowhorn service: adopt, cancel, install, restart, run, start, status, stop, test, uninstall, update. |
| [`blowhorn setup`](/docs/reference/cli/setup/) | Set up Blowhorn on this computer, safely and repeatably. |
| [`blowhorn slack`](/docs/reference/cli/slack/) | blowhorn slack: delete, edit, profiles, react, send, whoami. |
| [`blowhorn source`](/docs/reference/cli/source/) | GitHub lists one audience of one or more repositories (stargazers unless you name another) and stores one row per login. |
| [`blowhorn star`](/docs/reference/cli/star/) | Star GitHub repositories. |
| [`blowhorn stop`](/docs/reference/cli/stop/) | Stop everything, right now: on this machine, or on every machine sharing the store with `--all`. |
| [`blowhorn store`](/docs/reference/cli/store/) | Report whether this computer can use Blowhorn, and say why not when it cannot: signed in, a client the server still accepts, and a member of the organization. |
| [`blowhorn unfollow`](/docs/reference/cli/unfollow/) | Unfollow one Bluesky account (`--platform` bluesky `--target` &lt;handle&gt;) through the Bluesky API. |
| [`blowhorn uninstall`](/docs/reference/cli/uninstall/) | Remove Blowhorn from this machine. |
| [`blowhorn upgrade`](/docs/reference/cli/upgrade/) | Carry this Mac's local data from an earlier home into this one. |
| [`blowhorn withdraw`](/docs/reference/cli/withdraw/) | Withdraw LinkedIn invitations that have been pending longer than `--older-than` days, freeing headroom under LinkedIn's cap on unaccepted invitations. |
| [Shared flags and exit codes](/docs/reference/cli/shared-flags/) | The flags most blowhorn commands take, and its exit codes. |
| [`blowhorn-axi`](/docs/reference/cli/blowhorn-axi/) | Reply in Slack as Blowhorn profiles, session only. Slack reads stay on the Cursor Slack connection; every write needs `--confirm`. |

<!-- END generated command table -->

`blowhorn auth` is a group of four: `auth status` reports whether an account token and organization id are configured (never the token value), the api base,
enforcement mode, a summary of the last entitlement attestation, and why the
last read of the plan failed when it did;
`auth login` signs you in to [Blowhorn](https://cloud.blowhorn.ai) in your browser (Blowhorn's
native client sign-in: Blowhorn sends the browser straight back to 127.0.0.1 with a one-time code
redeemed with a PKCE verifier, with no consent page; pass `--sign-up` to open the sign-up page instead if you are
new - see [Create a Blowhorn account](/docs/how-to/set-up/create-an-account/)), keeps a `purpose=blowhorn` Blowhorn API token in the macOS Keychain (revoking the one the previous sign-in kept) and reads your plan once, sending
an account without Blowhorn straight to Blowhorn to start the beta (`--no-browser` prints the
address instead of opening it, and `--json` opens nothing either, its first line naming the address,
which is how the desktop app runs it; `BLOWHORN_CLOUD_TOKEN` still wins when set);
`auth logout` revokes the saved API token on Blowhorn, then forgets it,
the account in `cloud.yaml` and the local attestation cache
(a `cloud.yaml` written for another macOS user on this Mac is ignored, so you read as signed out until you sign in);
`auth switch-organization` switches the signed-in account to another of its organizations in place
([auth switch-organization](/docs/reference/cli/auth/#blowhorn-auth-switch-organization)).

`blowhorn store` is a single command, not a group: it reports whether this
machine can use your account and why not (signed in, a build the server still
accepts, a member of the organization), and `--replay-spool` sends the run
records waiting in the local spool. It exits 3, a code nothing else uses, when
your account cannot be used; [Fix cannot reach your account](/docs/how-to/troubleshoot/store-unavailable/)
maps each cause to its fix. There is no local or self-hosted store to connect
to. `blowhorn config get <key>` reads one option and says which document holds it.

`blowhorn setup` is a single command: it checks that `blowhorn` is on `PATH`,
reads your Chrome profiles from Chrome's `Local State` file, writes the Chrome
native host when it is missing or stale - after saying which Chrome profiles it
reaches and asking - and checks the Blowhorn sign-in, then lists the steps
left for you. Each step reports `ok`, `changed`, `planned`, `declined`, `todo`
or `failed`, so a re-run is safe and says what it changed. `--dry-run` writes
nothing, `--yes` agrees without asking, and `--json` prints one object; without
`--yes`, a `--json` run or one with no terminal asks nobody and writes nothing.
It exits 1 when a step failed. See
[Finish setup on this computer](/docs/how-to/set-up/finish-setup/).

`blowhorn uninstall` is a single command: it removes Blowhorn from this
machine, in order - the background service (`ai.blowhorn.service`, or `ai.blowhorn.service.dev` for a checkout, booted out
and its LaunchAgent file removed), the Chrome native host (the
`com.blowhorn.chrome_extension` manifest, its launcher under
`~/Library/Application Support/Blowhorn`, and the every-profile install entries
`chrome extension-install --all-profiles` wrote), the `~/.local/bin/blowhorn`,
`~/.local/bin/blowhorn-axi` and `~/.local/bin/blowhorn-mcp` launchers (only when they carry the installer's marker),
`/Applications/Blowhorn.app` (the service label it registered is booted out
with the service, and the bundle first unregisters its own Login Items entries - open at login and the
background service - by running `--unregister-login-items`; a bundle whose
`Info.plist` does not advertise that flag, or a call that fails, is reported
`not unregistered` with System Settings > General > Login Items named as the
step left to you), and the checkout's virtualenv (`--venv-dir`, else
`BLOWHORN_VENV_DIR`, else `venv/`, removed only when it holds `pyvenv.cfg`; the
filesystem root, the home directory, the checkout and a directory holding
either are refused), `node_modules/`, `desktop/node_modules/` and `data/logs/` -
reporting each item as `removed`, `not present`, `not checked`, `kept`,
`not unregistered` or `failed`. A failed item does not stop the run; the
command exits 1 at the end, as it does when a real run leaves a login item
not unregistered, and when a real run cannot read an account Keychain item.
The sign-in on this machine (the Keychain item `ai.blowhorn.cloud-token`, the
entitlement cache `ai.blowhorn.entitlement.v2`, `cloud.yaml` and the `cloud-token`
file) is removed on every uninstall. Local data is kept and named (the store
connection file an older version wrote, which Blowhorn no longer reads, the
desktop app's state, Blowhorn's own Chrome trees and service sockets under `~/.blowhorn`, the app's
per-user Library state and the checkout's `data/cache/`, which holds each
profile's runtime state); `--purge` removes it after you type `purge` at the prompt, or with
`--yes` when there is no terminal (`--json --purge` needs `--yes` outside a dry
run, and `--yes` without `--purge` or `--discard-unsynced-runs` is refused). Your Blowhorn account is never touched.
Dragging the app to the Trash does not run this command. After this version has recorded the bundle once, the next launch of a different copy signs out, unless that copy is a genuine Blowhorn signed by Blowhorn's own developer team (another macOS user on this Mac reinstalling Blowhorn does not sign you out). An in-app update keeps the sign-in. The first launch of this version keeps it.
Nothing under a Chrome profile is read or written. It is refused by name, in a
dry run too, while a scheduler tick, a service pass, an extension run,
`Blowhorn.app`, a desktop app started from this checkout or, with `--purge`,
a Chrome on `~/.blowhorn` is running, and in every mode while a
write-back spool (`runs/pending-store.ndjson`) this run removes - under the
checkout's `data/logs/`, or the app's state under `--purge` - holds run records that
have not reached your account - run `blowhorn store --replay-spool` first,
or pass `--discard-unsynced-runs` when your account will never be reachable again,
which names the count it deletes and asks you to type `discard` (`--yes` with no
terminal or under `--json`). A spool in any other log directory is left in
place and reported as kept, with its count. A probe that could not run is a refusal too, and an unreadable `engine.json`
is listed as not checked. `--dry-run` lists every item and removes nothing;
`--json` emits one object (`ok`, `error`, `dry_run`, `purge`, `platform`,
`refusals`, `not_checked`, `items` with a `result` each, `kept`,
`unsynced_runs_given_up`, `unsynced_runs_kept`, `discard_unsynced_runs`,
`store_touched: false`); `--bin-dir` and `--venv-dir` mirror `tools/install.sh`'s.
`./tools/uninstall.sh` at the checkout root (and `make cli-uninstall`) runs the same
code with the system Python once the venv is gone, reading
`defaults.chrome.data_dir` and `defaults.logs.directory` from `.blowhorn.yaml`
itself. macOS only; Linux and any other platform are refused by name.

`blowhorn chrome` is a group of eight: `chrome profiles` lists the profiles the
installed Google Chrome knows (directory, display name, signed-in account, the
last-used one marked, and the Blowhorn profile each is mapped to on this
machine), `chrome status` reports whether Chrome is installed, running and open
to remote debugging with one next-step line when something is off, `chrome
suggest` prints a name-matched mapping proposal and applies nothing,
`chrome map <profile> <directory>` / `chrome unmap <profile>` are the mapping's
only writers, `chrome attach-chrome [status|start|signin|stop|install-agent|uninstall-agent]` reports, starts,
signs in, stops or keeps up at login a
dedicated second Chrome that is open to remote debugging with no Allow dialog
(`~/.blowhorn/attach-chrome`, on a port Chrome picks, bound to 127.0.0.1; any program running as you on
this Mac can drive it), writing no configuration of its own,
and `chrome extension-install` writes the native-messaging host manifest Chrome
launches (`com.blowhorn.chrome_extension.json`) and the executable launcher it names, and prints
the unpacked `extension/` directory to load. If you already installed the host, run the
command again and reload the extension once. `--profile <name>` (through this machine's
mapping) or `--chrome-profile '<directory>'` names one Chrome profile and prints the steps to
load the extension in that profile alone. `--all-profiles` also asks Chrome to
install the extension in every Chrome profile on this machine (the policy by default,
or `--external` for the offer in each profile). `--dry-run` prints the paths,
the host manifest, and the policy: on macOS only the `ExtensionInstallForcelist`
fragment of the shared plist (other keys in that file are preserved and not
printed), on Linux the exact JSON Blowhorn's own `blowhorn.json` must contain,
preserved keys included. It writes nothing.
It does not launch Chrome. `chrome extension-status` reports whether the extension
is installed, which install route is on disk, which Chrome profiles hold a Chrome Web Store install, and whether the
Chrome extension answers hello. It reads the manifest, the launcher, the policy, each Chrome profile's
`Secure Preferences` and `Preferences` (only for the extension's entry) and the socket, stats the external-extensions file and does not read it, and writes only the bridge lock, exiting 0 whatever it
reports.
`chrome extension-enable --chrome-profile '<directory>'` asks Chrome to open the extension's
Chrome Web Store page in each Chrome profile named (repeat the flag for more than one), so one click there turns the extension on; it reads only `Local State` to check each
directory, writes nothing, and with `--json` reports `ok: false` and exits 1 when Chrome was
asked in no profile. `chrome extension-status --json` reports each profile's state as
`profile_states` (`enabled`, `disabled`, `removed` or `absent`).
All but `chrome unmap`, `chrome extension-install`, `chrome extension-status`, `chrome active-tab`, `chrome extension-enable` and `chrome extension-mode` read two files under a Chrome data
directory (`Local State`, `DevToolsActivePort`) and nothing else - `attach-chrome`
reads the dedicated tree's pair rather than the daily one's, plus its `SingletonLock`; `chrome unmap`
reads only your account, so a mapping can be removed when those files are gone;
`chrome extension-install --all-profiles` also reads `Local State` in the
configured Chrome data directory, only to name each Chrome profile there, and
does not list profiles outside that directory. The policy route applies the
extension to every Chrome profile on this machine. It does not read `DevToolsActivePort`;
`chrome extension-status` reads the manifest, the launcher, the unpacked
extension, the policy file, each Chrome profile's `Secure Preferences` and
`Preferences`, and the Chrome extension socket it says hello to, stats the external-extensions file and does not read it, and writes nothing but the
bridge lock beside that socket; while a run holds the bridge it says so and
writes no hello.
`chrome extension-mode` reads no Chrome file: it reads or writes the extension
mode in your Blowhorn account.
`attach-chrome start` and `attach-chrome signin` start a browser, and neither drives the one it
starts; `chrome map` and `chrome extension-enable` ask the installed Chrome to open a window on one
page, which starts Chrome and leaves it running when none is running, and drive nothing; `attach-chrome stop` quits only the Chrome holding that tree. All carry a stable `--json` shape; every detail is in the [Chrome reference](/docs/reference/chrome/),
the procedure in [Map Blowhorn profiles to Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/).
The mapping is identity, never permission, and nothing that runs a browser
reads it yet. The directory is `defaults.chrome.data_dir` /
`BLOWHORN_CHROME_DATA_DIR`. `blowhorn profile status --chrome` shows the mapping
from the profile's side.

`blowhorn slack` is a group for an agent that answers in Slack as a
person: `slack send` sends one message (a thread reply from a
message link, using the link's `?thread_ts=` parent, or a top-level post from a
channel link), `slack whoami` asks Slack's `auth.test` who that profile's
credential is, and `slack profiles` lists every profile's captured workspaces
from your account without calling Slack. `send` sends as one `--profile`, or as each of several
(`--profile work,personal`, or `--profile work --profile personal`) one after another, waiting a random `--pace`-scaled
interval before each confirmed send after the first. Each profile gets its own
idempotency key, ledger entry and result, and one profile's failure never stops
the next, except an unavailable store, which ends the walk and reports every
profile from there on as `store_unavailable`. A target or text no profile
could send (`#general` with no `--workspace`, an empty message) is one usage
error, before anyone is tried. The `--json` answer is
`outcome: multi` with `results` and a `summary`; it exits 0 only when every
profile succeeded, with the shared code when all failed the same way, and 1
otherwise. `send` is a dry run unless `--confirm`,
and stays one under `--dry-run`, `BLOWHORN_DRY_RUN` or `defaults.dry_run` even with `--confirm` (its message then names that setting),
takes its text from `--message`, `--file` or stdin (`-`) and sends it untouched,
and sends a given idempotency key at most once: a key already sent replays its
`ts` and permalink (the record is your account's send ledger), and a send whose answer was never recorded (interrupted, or still in flight) is reported as
`outcome_unknown` (exit 4) and never resent automatically. Every `slack`
command takes `--json`, prints no secret, opens no browser, and chooses the credential with
`--slack-auth`. Exit codes: 0 sent, replayed or previewed; 1 refused; 2 usage or
key conflict; 3 store unavailable or a contended key; 4 outcome unknown; 5 rate-limited (with
`retry_after`). `slack edit` (`chat.update`) and `slack delete`
(`chat.delete`) change only a message the same profile sent with `slack send`:
your account's send ledger must hold that `ts` for that profile, or the result is
`not_sent_by_profile` before any Slack call; `edit` takes its new text as `send`
does. `slack react` adds an emoji
reaction to any message (`reactions.add`, or `reactions.remove` with
`--remove`), and a reaction already there is success with `changed: false`.
All three take a message link, or a bare `ts` with `--channel` and
`--workspace`, are dry runs unless `--confirm`, take several profiles
(`--profile a,b` or a repeated `--profile`, waiting between confirmed
profiles as `send` does), and share `send`'s exit codes.
See [Slack](/docs/reference/platforms/slack/).

`blowhorn-axi` is the agent interface to those writes, installed next to
`blowhorn` by `tools/install.sh` ([its reference](/docs/reference/cli/blowhorn-axi/)). It runs `blowhorn slack … --json` and prints TOON
with a `help[]` of next commands: `blowhorn-axi` (home: `count`,
`session_ready` and each profile's `slack_auth`), `profile list` and
`profile status` (with `auth.test` session state unless `--offline`),
`slack send` with `--profile a,b`, `slack edit` and `slack delete` by
`--permalink` (only a message that profile sent with Blowhorn, else
`not_sent_by_profile`), and `slack react --emoji` (`--remove` takes it back; a
reaction already there is `changed: no`). An unknown flag is a usage error that
lists the command's flags; `-v`, `-V` and `--version` print the version. The `blowhorn-axi`
npm launcher adds `setup hooks`, which gives Claude Code, Codex and OpenCode the
home view at the start of every session, and ships an agent skill. Every write is a dry run
unless `--confirm`, always runs under `--slack-auth session` (a profile with
only an app token is `token_only` and nothing runs), and takes its text from
`--text -` (stdin), `--text-file <path>` or `--message`, with mrkdwn passed
through and only one trailing newline dropped. Exit codes: 0 every profile
succeeded, 1 a refusal, rejection, attribution finding or partial failure, 2
usage (an unknown flag fails before `blowhorn` runs), 3 store unavailable.
Confirmed writes for several profiles pause a random 10-30 seconds (scaled by
`BLOWHORN_PACE`) between profiles, as `blowhorn slack` does; each `blowhorn`
call is stopped after 300 seconds, and a confirmed write stopped that way is
`outcome_unknown`. It makes no Slack reads; those stay on the Cursor Slack
connection.

Desktop app:

```bash
blowhorn desktop status
blowhorn desktop install
blowhorn desktop start
blowhorn desktop build
```

The human-readable desktop command output groups its status details and labels
successful, missing, and failed states. On an interactive terminal those states
are colorized; `--json` always returns the unchanged machine-readable result,
and setting `NO_COLOR` disables terminal color.

`blowhorn desktop start` records the spawned pid (and its log path) under
`data/logs/desktop/.desktop-start` in the checkout and refuses a second start while
that pid is still alive, reporting the existing pid and log path and exiting
non-zero. `--log-dir` moves the log file and never that record, so a second
start with a different `--log-dir` is refused the same way. `--wait` records
this process instead and clears the record when the app exits. A claim whose
pid is dead is ignored and rewritten. If the pid is alive but no longer the
desktop app (a reused pid after an unclean kill), the refusal names the file to
delete: remove `data/logs/desktop/.desktop-start` and start again.

Command → supported platforms (central mapping):

| Command | Supported Platform(s) |
|---------|------------------------|
| `post` | `linkedin`, `x`, `reddit`, `slack`, `bluesky`, `github`, `all` - `github` is amplify-only |
| `accept` | `linkedin`, `all` |
| `withdraw` | `linkedin`, `all` |
| `follow` | `x`, `bluesky`, `github`, `all` |
| `source` | `github` |
| `unfollow` | `bluesky` |
| `comment` | `reddit`, `linkedin`, `bluesky`, `all` |
| `analytics` | `linkedin`, `x`, `bluesky`, `all` |
| `report` | `all` |
| `find` | `bluesky`, `all` |
| `profile` | `linkedin`, `x`, `reddit`, `slack`, `bluesky`, `all` |
| `config` | `all` |
| `schedule` | every platform above (see below) |
| `desktop` | `all` |
| `auth` | `all` (accepted and ignored) |
| `service` | `all` |
| `store` | `all` (accepted and ignored: the command reads no platform) |
| `chrome` | `all` (accepted and ignored: the command reads no platform) |
| `uninstall` | `all` (accepted and ignored: the command reads no platform) |
| `slack` | `all` (accepted and ignored: the command is Slack's own) |

Every action command rejects a platform outside its own activity, naming the
platform and listing what it does support. Each command's `--help` states its
own accepted values - its activity of this table, or that the option is ignored
there - so `--platform` never sends you looking elsewhere for them.

**An unsupported platform is rejected where it is used, and is inert
everywhere else.** `blowhorn profile auth --platform github` used to report "no
profiles have accounts for the requested platform(s)" - a false statement about
your credentials, since GitHub has no browser login session for `profile auth` to
refresh. It now gives the honest error
naming `github` and listing what `profile` supports, whether you typed the
platform or inherited it from `BLOWHORN_PLATFORM` or `defaults.platform`.

The commands that never look at `--platform` do not reject anything:

- `config path/show/get/set`, `desktop`, `service`, `store`, `chrome` and `slack` ignore the option entirely -
  their `--help` says so. A bad platform default can never lock you out of
  `blowhorn config show`, the very command you would run to find it.
- `schedule` reads it as a filter over scheduled activities, and accepts every
  platform an activity may carry.
- `profile current/list/switch` never read it.
- `profile auth --all` refreshes a fixed list and ignores `--platform`
  entirely, so an unsupported platform is inert there too.

`schedule` is the one activity that is not "what this command acts on". It dispatches
whatever a schedule activity names, and its `--platform` filters those activities, so every
platform an activity may carry is accepted here. An activity is still validated against its
own command's activity of the table, so a `github` schedule activity is a `follow` or a
`post` (amplify).

`--profile all` is supported for `post`, `accept`, `follow`, `unfollow`, `comment`, `analytics`, `report`, and `find`, and is always treated as an alias expansion (never a concrete profile).

`blowhorn source` collects people into your account. `--platform github` requires at least one repeatable `--repo` (`owner/name`) and takes `--audience` (default `stargazers`: `owner`, `contributors`, `forks`, `stargazers`, `watchers`, `subscribers`, `issues`, or `all` only when you type it), and `--platform all` is rejected. `--limit` caps how many people a run examines; omitted, there is no cap. Once that many have been examined the run stops without pulling another login. A `--repo` that is blank, or that is not a single `owner/name` (a URL included), is rejected by name. A GitHub run lists that audience with the profile's stored `GH_TOKEN` and upserts one `github_contacts` activity per login. `--dry-run` lists the audience, fetches no commit patches, and writes nothing. Email addresses are not printed. `source` is not a scheduled command, and it does not accept `--profile all`.

Examples:

```
blowhorn post --profile your-profile
blowhorn post --platform slack --target "#announcements"
blowhorn post --platform slack --profile your-profile --target "#announcements" --message "Maintenance is complete"
blowhorn post --platform x --amplify "https://x.com/<handle>/status/<id>"
blowhorn post --platform reddit --amplify "https://www.reddit.com/r/<sub>/comments/<id>/<slug>/"
blowhorn post --check-queue
blowhorn post --check-queue --profile your-profile --platform linkedin
blowhorn accept --profile your-profile --dry-run
blowhorn accept --profile your-profile --limit 5
blowhorn follow --profile all --target example-handle --exclude second-profile --limit 0
blowhorn follow --profile profile-a,profile-b --target example-handle --limit 0
blowhorn follow --profile all --target example-handle,another-handle --limit 0
blowhorn follow --platform github --profile your-profile --target example-org --limit 25
blowhorn follow --platform github --profile your-profile --target example-org --limit 25 --dry-run
blowhorn follow --platform github --profile all --target example-org,another-org --limit 0
blowhorn source --platform github --profile your-profile --repo owner/repo --audience stargazers --dry-run
blowhorn unfollow --platform bluesky --profile your-profile --target example.bsky.social --dry-run
blowhorn comment --profile all --exclude second-profile
blowhorn comment --profile your-profile --platform linkedin --target "https://www.linkedin.com/feed/update/urn:li:activity:1234/" --message "Great post!"
blowhorn analytics --profile your-profile --lookback 365
blowhorn analytics --platform x --profile your-profile,second-profile
blowhorn analytics --platform x --profile all --exclude ""
blowhorn analytics --platform x --profile all --exclude second-profile
blowhorn analytics operations --group-by host --since 30d
blowhorn report --dry-run
blowhorn schedule validate --profile all
blowhorn schedule list --due-only --profile all
blowhorn schedule tick --profile all --limit 5
blowhorn schedule trigger-now 7
blowhorn schedule bootstrap --dry-run
blowhorn schedule list --json
blowhorn schedule pause --all --reason "LinkedIn challenge on your-profile"
blowhorn schedule pause --activity 7
blowhorn schedule resume --activity 7
blowhorn schedule why 7 --json
blowhorn schedule get 7 --json
blowhorn schedule upsert --payload '{"Command":"report","Profile":"all","Run At":"2026-03-12 08:00:00"}' --json
blowhorn schedule delete 7 --json
blowhorn desktop status --json
blowhorn service status --json
blowhorn service install --dry-run
blowhorn service tick-now --follow
blowhorn service cancel --dry-run
blowhorn service adopt --by file --dry-run
blowhorn service stop --json
blowhorn chrome profiles
blowhorn chrome status --json
blowhorn chrome suggest
blowhorn chrome map your-profile 'Profile 12'
blowhorn chrome unmap your-profile
blowhorn chrome attach-chrome start --allow-other-users --dry-run
blowhorn chrome attach-chrome signin
blowhorn chrome attach-chrome stop
blowhorn profile status --chrome
```

`service install`, `service update` and `service stop` wait for the label to leave launchd after a bootout - `launchctl bootout` returns before the resident service has exited, and a bootstrap inside that window fails. The wait is bounded (a fixed poll interval times a maximum number of attempts covering a full drain); `stop` prints what it is waiting on and carries `stopped`, `waited_s` and the pass's pid in `--json`, and every one of the three exits 1 rather than bootstrapping over a label that has not gone. Each `launchctl` call is itself bounded at 60 s.

For `follow --profile all`, if any `--target` handle matches one of your configured profile handles **on the platform being run**, that profile is auto-excluded to prevent self-targeting. The match is per platform: owning the X handle `yourhandle` says nothing about a GitHub run, which compares against the roster's `GitHub` handle instead. In `--limit 0` target-only mode, `--target` also accepts a comma-delimited list such as `example-handle,another-handle`.

### `--profile` and `--exclude` {#section-profile-and---exclude}

A profile name resolves against your organization's profile list, read once
per run: `--profile all` is every profile on it minus the excluded list, and
a typed name must match exactly one profile, ignoring case. No folder on
this computer adds a profile ([Profile reference](/docs/reference/profiles/#which-profiles-exist)).

Naming profiles explicitly makes `--exclude` inert: `--profile your-profile` runs `your-profile` even when the
config excludes it, and only `--profile all` defers to the exclusion list. Commands say which
way it went - `Excluding profiles: …` when the list is applied, `Ignoring configured exclusions
(…): --profile named the profiles to run explicitly.` when it is not. They used to print the
first line either way, so a run could announce excluding a profile it was about to process.

`blowhorn follow` folds its target-owned auto-exclusion into the same list, so an explicit
`--profile` overrides that too. Multi-platform commands that filter per profile inside
`browser.iterate_profiles` are the exception: those exclusions always apply, and that command
says so plainly.

Profile workflows:

```
blowhorn profile current
blowhorn profile list
blowhorn profile status                       # what each profile is set up for, no browser
blowhorn profile status --check-sessions      # read-only session probes, recorded per profile
blowhorn profile status --profile your-profile --check-platform github  # one platform only: your-profile's GH_TOKEN in the store against GitHub, no browser
blowhorn profile status --chrome              # adds the chrome profile each one is mapped to here
blowhorn org members                          # the people a profile can represent
echo '{"name": "new-profile", "userId": "<member id>"}' | blowhorn profile create --payload-stdin  # leave userId out for a brand
echo '{"name": "new-profile", "description": "what it posts"}' | blowhorn profile update new-profile --payload-stdin
blowhorn profile set your-profile GH_TOKEN=ghp_yourtoken  # stored in your account, never in a file
blowhorn profile get your-profile             # the profile, its accounts, and which credential fields are set
blowhorn profile delete new-profile --yes      # deletes it in your organization and unlinks its accounts; nothing local moves
blowhorn profile switch your-profile
blowhorn profile auth --platform x            # a sign-in records the session as valid, checked now
blowhorn profile auth --platform bluesky --profile your-profile  # prompts for handle + app password; saved only if Bluesky accepts the login
printf '%s\n' "$APP_PASSWORD" | blowhorn profile auth --platform bluesky --profile your-profile --handle you.bsky.social --app-password-stdin --json
blowhorn profile auth --platform reddit --profile all --exclude ""
blowhorn profile auth --all
```

