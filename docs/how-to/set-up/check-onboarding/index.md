# Check that onboarding still finishes


> Run the onboarding happy path against the built app before a release.



`make onboarding-e2e` walks the desktop app's first-muster wizard from sign-in
through a dry run of the first post, and Create account on its own. It uses the app you just built
(`desktop/out`), a local stand-in for the Blowhorn service, and a throwaway Google Chrome
profile. It does not sign in to a social platform, and it does not open your
own Chrome profile. The throwaway Chrome has two profiles, as a person's now
does: Chrome's main profile, started once and left empty, and a second profile
set aside for Blowhorn, which gets the extension and any planted logins. The
walk passes the Chrome profile intro and checks that the Chrome profiles screen
lists the second profile and does not show the main profile.

The throwaway home is seeded from the same `.blowhorn.yaml` a packaged app
seeds, then given a `postgres` backend. That is the file an older install
left behind. The walk reaches the console only when the engine opens Cloud
anyway. In the app, Activity shows the draft and Routines runs a dry fire
check. A new profile starts on the cautious preset, whose quiet hours are
22:00 to 07:00 on the computer's clock. Inside them the dry fire says the
activity would be held for quiet hours and exits 1, and the walk accepts
that; at any other time it must exit 0. A `blowhorn post --dry-run` then
reports the fixture row without publishing it.

It runs four walks. The happy path and `linkedin-session` are the same walk,
but `linkedin-session` first plants a cookie named `li_at` in the throwaway
Chrome profile. Only the cookie's name matters, as with the planted Slack
login. With the cookie, Confirm and then Discover have to record exactly
one LinkedIn account in the local Cloud: connected, with no credential,
and mapped to the new profile. `blowhorn profile accounts` has to list it
too. Without the cookie, no LinkedIn account may be recorded. In both walks,
Home's Connect an account step must match the local Cloud: it is done only
when a connected account is mapped to a profile.

After setup, both walks also check the console a new person sees:

- **Draft notice:** "Your draft was saved" is gone after leaving Home and
  coming back.
- **Connect an account** (happy path only, where nothing is connected yet):
  Home's button opens its own step, not the Profiles table. LinkedIn's row
  there says which Chrome profile to sign in to and offers **Open LinkedIn
  sign-in** and **Check again**, with no form field.
- **Discover:** on Confirm troops and in a profile's **Browser** tab after setup, each press must read **Checking…** while it runs
  and then leave a result line. With the planted cookie, the walk marks the
  LinkedIn account disconnected in the local Cloud first: the press must
  reconnect that same account and say so, and a second press must say
  **Nothing new found** and leave one LinkedIn account.
- **Browser tab:** the mapped profile's LinkedIn row shows that same guidance (or, with
  the planted cookie, that LinkedIn is found), with **Set up** and **Open in Chrome**.
  **Discover** sits at the top of the list. It shows no setting name like `LI_PASSWORD`, no
  password field, no **advanced** section (by its label or its slot) and no raw `LI_`, `X_` or `RDDT_`
  field: LinkedIn's sign-in is the person's own Chrome session.
  `blowhorn chrome open-profile <profile> --sign-in linkedin --dry-run` must pick the
  Chrome profile confirm mapped.
- **New activity:** `blowhorn schedule destinations` reports no blog set up
  for the local organization, and the picker offers no organization
  blog action. The unit tests cover an organization that has one.
- **Next run:** saving a daily Accept LinkedIn invitations from that picker
  stores one enabled routine in the local Cloud, and **Activity > Routines**
  lists it with its next run at the time the step typed. Home names no next run. The rail's status line
  never shows a countdown: it says what this computer is doing, and otherwise it
  keeps its own reason.

`empty-profile` covers
a new organization with no planted logins. `sign-up` presses Create account,
which opens Blowhorn's sign-up page; the person confirms their email
in the browser and the app signs in with no further click. To run one walk,
pass `--variant <name>`.

Build the app first, from `desktop/`, with the electron-vite build, and build
it again after a pull, a rebase or any edit under `desktop/src`. The check
launches whatever is in `desktop/out` and refuses to start when that build is
older than its source, naming the newer file. Then, from the checkout:

```bash
make onboarding-e2e
```

The check needs Node.js 22, Google Chrome, and a display. On Linux with no
display it starts Xvfb itself. It finds the Electron binary the way the
`electron` package does, so the Linux binary and the macOS app inside
`Electron.app` both start. A packaged Mac app is the same walk:

```bash
node desktop/scripts/onboarding-e2e.mjs --app /path/to/Blowhorn.app
```

The check walks the variants in turn; `--variant <name>` runs one:

- **happy:** sign in, assign the Chrome profile, get ready, and queue the
  first post, through to the dry run.
- **linkedin-session:** the same walk with a planted `li_at` cookie, so
  LinkedIn is found signed in and recorded as a connected account.
- **empty-profile:** a new organization with one Chrome profile and no
  saved logins.
- **sign-up:** Create account. It checks that the browser opens Blowhorn's
  sign-up page (`/registration`), never the sign-in page, and that once the
  stand-in confirms the email the wizard moves past the sign-in without
  anything being pressed in the app.

Every walk also checks three things that a real re-run once got wrong:

- **Signing in and setting up your account move on by themselves.** A
  sign-in that worked never stops on You're signed in, and with one
  organization the wizard reaches the Chrome profile intro with nothing
  pressed after Sign in.
- **One sign-in opens one browser tab.** The recorder that stands in for the
  browser must see exactly one open of the local Cloud, `/login` for sign-in
  and `/registration` for Create account, counted after the callback has had
  time to open anything else. The stand-in gives an account made through
  `/registration` no plan, so the sign-up walk is the one that would catch a
  second tab on the Cloud dashboard.
- **The app quits on `SIGTERM`.** Each walk ends by sending the app
  `SIGTERM`. The app and every process it started must be gone within 10
  seconds with no `SIGKILL`, and no Chrome may be left on the throwaway
  folder.

The app always runs with `BLOWHORN_USER_DATA_DIR` set, and the check refuses to
launch without it, so it never registers the real background service. The
check reads `launchctl print gui/<uid>/ai.blowhorn.service` before the first
walk and after the last, and fails if the registration changed. It only reads:
a leftover registration from an earlier run is reported, never removed.

Each step prints its name. Each variant writes its run to
`data/cache/e2e/onboarding/<run-id>/` in the checkout, the directory the script
prints at the start: `shots/` holds a screenshot per step, `logs/electron.log`
the app's output, and `run.json` each step's outcome. A failure names the step,
leaves a screenshot of that screen, and records the failure in `run.json`. If
the local Cloud stand-in raises, the check stops and prints that error. The
folder is git-ignored and nothing prunes it, so delete old runs when you no
longer need them. Pass `ONBOARDING_E2E_ARTIFACTS` to put the screenshots and
the log in a directory you choose; `run.json` is then written only if that
directory is inside `data/cache/e2e/` or `BLOWHORN_LIVE_EVIDENCE_DIR`.

A desktop release runs this check once, after it makes the DMG, with
`--app` pointed at the app inside the mounted DMG. A broken onboarding
stops the release there, before anything is published.
The same script is what `make onboarding-e2e` runs.

A program the check starts opens the sign-in URL. Your default browser
stays closed, including on macOS.

On macOS the Chrome for this check is launched with a throwaway
`--user-data-dir` under the system temp directory, `--use-mock-keychain`,
and `--password-store=basic`. A user-data directory outside that temp
directory is refused. Every Chrome Blowhorn itself starts on that folder
during the check, such as the extension's store page during setup, carries
the same two switches, so macOS never shows "Keychain Not Found". The
check also sets `BLOWHORN_MUTE_AUDIO=1`, so the app and every Chrome it
starts stay silent. The
throwaway Chrome profile has no Google account, like many people's: the
email in the wizard is what finds the person in the local Cloud. The happy
path ends by checking that `blowhorn chrome profiles --json` still reports
identity `ok` for the Chrome profile it mapped. A `drift` there means the
mapping no longer matches what Chrome shows, and every later run of that
profile would be refused. The check runs only in the installed Google Chrome
and loads the unpacked extension into it over the debugging pipe. If Google
Chrome is missing, or will not load the extension, the check stops and says so.
It never downloads or falls back to another browser. The check also sets
`BLOWHORN_KEYCHAIN=0`, so the engine keeps the fixture token in the
throwaway home and does not write the login keychain.

