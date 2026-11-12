# Map Blowhorn profiles to Chrome profiles


> Say which real Chrome profile each Blowhorn profile belongs to on this computer.



Tell Blowhorn which of your real Google Chrome profiles each Blowhorn
profile belongs to on this computer. Every run that drives a browser reads
the mapping first and refuses a profile without one, so mapping is the
one-time setup every browser run depends on.

Map a Chrome profile set aside for Blowhorn, not the one you browse in.
The desktop app does not offer Chrome's main profile (`Default`) for a new
mapping; a mapping an earlier setup made to it keeps working. Why is in
[Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/#a-chrome-profile-of-its-own).

A mapping is identity, never permission: it does not make a profile
eligible for any platform. Eligibility is credential existence, decided in
your account ([Eligibility](/docs/explanation/eligibility/)).

Nothing in this guide runs a browser. What each command prints and its JSON
shape are in the [Chrome reference](/docs/reference/chrome/). How a run
then reaches Chrome is
[Choose how Blowhorn reaches Chrome](/docs/how-to/settings/launch-mode/):
by default runs drive Chrome through the Blowhorn extension, with no
Attach approval and no launched browser.

## From the desktop app

Each profile on **Profiles** has a **chrome** heading. It names the Chrome
profile the mapping records and whether that mapping holds. **Change** or
**map** opens the Chrome profiles list; a directory mapped to someone else
is disabled. **Confirm** maps the same directory again when Chrome's name
or account has changed. A deleted Chrome profile has no confirm: pick
another.

The Setup screen's **chrome profiles** row reports the same state for every
profile at once.

## Open the mapped profile

Choose **open in chrome** on a profile's **chrome** heading on **Profiles**
to open a window in exactly that Chrome profile -- Chrome shows the
profile's own name and picture in the window, so it cannot be mistaken for
another one. Sign in to a platform there yourself, then come back. The
platform **Set up** steps in **Chrome profiles** offer the same button, and
theirs opens that platform's sign-in page in the profile its mapping
chooses for that platform. So do the **Set up** steps on guided setup's
**Assign troops** screen, for a Chrome profile that is already mapped; a
choice you have not confirmed there has no mapping yet, so the button
answers with that refusal until you confirm. From a terminal:

```bash
blowhorn chrome open-profile ada
blowhorn chrome open-profile ada --sign-in linkedin
```

Blowhorn asks Chrome to open the window and steps back: it drives nothing
in it and never restarts or closes Chrome. A mapping that does not hold --
no mapping, a drifted name or account, a directory Chrome no longer has --
is refused by name and nothing opens.

## Confirm troops in guided setup

The first-muster setup's **Confirm troops** step does the whole job from what
Chrome already knows. For each Chrome profile it shows the Google account
and the platform accounts discovery found there, proposes the Blowhorn
profile each one becomes, and lets you mark each Chrome profile and each
account in use or not in use. Confirming the ones in use creates the
profiles that don't exist yet in your organization, each representing the
member you pick under **Which person is this?**, or nobody for a brand.
When the Chrome profile's Google email belongs to exactly one member, that
member is picked for you; there is no email to type. If Blowhorn
can't list your organization's members, the card says so and offers only
**Nobody, a brand** until you choose **Discover**; if it can't list your
profiles, the step says so above the cards, so check again before you
create one rather than make a second profile for the same person. An
existing profile is named by its id. A `chrome confirm` document that still
carries the old `email` or `subject` keys is refused by name: name the
person with `userId`. Confirm then stores the credentials in your
account, records a confirmed Chrome session for LinkedIn and Hacker News
when you're signed in there, writes the mapping with the same checks as
`blowhorn chrome map`, and links each account it found to the profile in
your account, named for its username. A LinkedIn sign-in with no saved
username is not linked here; the session check can link it later. The profile's
handles come from those accounts. A Chrome profile you mark not in use is recorded
that way and unmapped on this computer; the Blowhorn profile and its
credentials stay, and a run of every profile skips it. A profile you had
already excluded stays excluded. Marking it in use again removes that skip
only when this screen added it. An account you mark not in use is recorded
in `.blowhorn.chrome-not-in-use.json` beside your config, and a run on this
computer skips that account. Marking that account in use later clears the
skip for the Blowhorn profile, including a refusal recorded on another
Chrome profile. The credential stays.
The next time you open Confirm troops, those activities start unchecked.

The survey behind the step is `blowhorn chrome discover`, and the apply is
`blowhorn chrome confirm`, which reads the confirmed assignments as JSON
on stdin - so a GitHub token or Bluesky app password typed on the step
reaches neither the command line nor the log. Discovery reads only the
allowlisted identity fields named in the
[Chrome reference](/docs/reference/chrome/#what-it-reads-and-what-it-never-reads):
never a saved password, never a cookie's value except GitHub's
`dotcom_user`, and never your history. The social links on a person's
Blowhorn account may be shown on the step for recognition; they are never
treated as permission to post.

## Before you start

- Your account is reachable from this computer: `blowhorn store` says so. The
  mapping lives there, keyed by this computer's hostname, so it is the same
  on every terminal and in the desktop app on this computer, and does not
  follow you to another computer.
- The Blowhorn profile is in your account's profiles. `blowhorn chrome
  suggest` lists every profile your account knows; a name missing there cannot
  be mapped.
- Chrome's profile list is readable: `blowhorn chrome profiles` lists it.
  Chrome does not have to be running.

## See what Chrome has

```bash
blowhorn chrome profiles
```

```
chrome profiles (3) in /Users/you/Library/Application Support/Google/Chrome
    directory  name      account                    mapped to (on studio)
    Default    Person 1  -                          -
  * Profile 2  Ada       ada@example.com            -
    Profile 5  Grace     grace@example.com          -
  * last used
```

The **directory** column is the name a mapping records, exactly as printed.
Chrome silently creates a new, empty profile for any directory name it does
not know, so `blowhorn chrome map` refuses a directory that is not in this
list rather than recording it.

## Let Blowhorn propose a mapping

```bash
blowhorn chrome suggest
```

```
chrome mapping proposal for studio (3 profiles); nothing is applied
  profile  directory  name   account             note
  ada      Profile 2  Ada    ada@example.com     name match
  grace    Profile 5  Grace  grace@example.com   name match
  personal   -          -      -                   none
to apply an activity you agree with:
  blowhorn chrome map ada 'Profile 2'
  blowhorn chrome map grace 'Profile 5'
```

An activity is proposed when exactly one Chrome profile's display name matches
the Blowhorn profile's name (case and punctuation ignored). Two matches are
named as ambiguous and nothing is proposed; no match is `none`; a profile
that already has a mapping keeps it and says so. The command applies
nothing. Copy the `blowhorn chrome map` line for each row you agree with.

## Map a profile

```bash
blowhorn chrome map ada 'Profile 2'
```

```
mapped profile ada to chrome profile 'Profile 2' 'Ada' (ada@example.com) on studio
```

The command checks three things and refuses with one sentence and exit 1
when any fails: the Blowhorn profile is in your account's profiles (`all` is
every profile, not one, so map each profile by name), Chrome has that
directory, and the directory is not already mapped to another Blowhorn
profile on this computer. Then it records the display name and signed-in
account Chrome shows for the directory and prints what it recorded.

Mapping also pairs the profile. The command opens the Blowhorn extension's
pairing page in that Chrome profile and prints:

```
opened the pairing page in chrome profile 'Profile 2'; once paired it offers the Blowhorn side panel, and then runs for profile ada are checked against that chrome profile
```

Once the profile is paired the page offers to open the Blowhorn side panel in that window. From then on a run for `ada`
refuses before it does anything if Chrome is on another profile. When the page
could not be opened, the command says why and what to run once Chrome is open
on that profile. See [Pairing](/docs/reference/chrome/#pairing).

Quote a directory name that contains a space. Add `--dry-run` to run the
checks and record nothing (and open no pairing page); add `--json` for the
recorded activity and the pairing result as JSON.

A profile can have more than one Chrome profile on a computer, for example
Work and Personal signed in to different accounts. Mapping another directory
adds it; `--replace` makes the new one the profile's only mapping. Mapping a
directory the profile already has refreshes the recorded name and account,
which is how you confirm a profile after Chrome's name or account changed.

With more than one, say which Chrome profile each platform uses:

```bash
blowhorn chrome map ada 'Profile 2'                       # Personal: every platform not named elsewhere
blowhorn chrome map ada 'Profile 7' --for linkedin,slack  # Work: LinkedIn and Slack
```

A run uses the Chrome profile mapped `--for` its platform; else the only one;
else the one mapped with no `--for` (or `--default`). Otherwise it stops and
names the command that chooses one. Naming a platform with `--for` moves it
off the profile's other mappings on that computer. A
directory still held by a profile you have since deleted is released the
moment you map another profile to it; the command says so.

## Check the mappings

```bash
blowhorn profile status --chrome
```

```
| Profile | Linkedin | X | ... | Chrome              | Notes |
| ada     | valid    | - | ... | Profile 2           |       |
| grace   | -        | - | ... | Profile 5 (drift)   |       |
| personal    | -        | - | ... | -                   |       |
```

The Chrome column shows the mapped directory and, when its recorded
identity no longer holds, why:

| shown | meaning | what to do |
| --- | --- | --- |
| `Profile 2` | mapped, and the name and account Chrome shows still match the ones recorded | nothing |
| `Profile 5 (drift)` | Chrome now shows a different display name or signed-in account for that directory | check the profile in Chrome, then `blowhorn chrome map grace 'Profile 5'` to confirm the new identity |
| `Profile 5 (missing)` | Chrome no longer has that directory | `blowhorn chrome profiles`, then map the profile again |
| `Profile 5 (unknown)` | Chrome's profile list could not be read, so the identity cannot be checked | `blowhorn chrome status`, then fix what it names |
| `-` | no mapping on this computer | `blowhorn chrome map <profile> <directory>` |

`blowhorn chrome profiles` shows the same thing from Chrome's side, in its
`mapped to` column. A profile whose mapping does not hold is refused by
name: `ERROR` and a non-zero exit when you named the profile, one
`WARNING` line and the walk continues when `--profile all` reached it.
Nothing falls back to another profile or to a Blowhorn-owned folder.

## Remove a mapping

```bash
blowhorn chrome unmap ada
blowhorn chrome unmap ada 'Profile 7'   # when ada has more than one
```

Only your account's row goes. Nothing under Chrome's directory is touched, and
the Chrome profile keeps its sessions.

## The Chrome extension in that profile

A mapping does not install the Chrome extension. Chrome keeps an extension
per Chrome profile, and the Blowhorn extension drives only the profile it
is installed in, so install it in every Chrome profile you post from.
Install it before you map, or map again afterward, so the pairing page has an
extension to land in.

## When your account cannot be reached

`chrome profiles`, `chrome map`, `chrome unmap`, `chrome suggest`,
`chrome discover`, `chrome confirm`, `chrome open-profile` and
`profile status --chrome` each read your account, so each ends with your account's one named sentence and exit 3 when it is unreachable, even when
Chrome's profile list cannot be read either, because your account is asked
first. `chrome status` never opens your account.

## Related

- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) - after the
  mapping, the sessions and credentials each platform needs.
- [Chrome reference](/docs/reference/chrome/) - every `chrome` command
  and JSON shape.
- [Eligibility](/docs/explanation/eligibility/) - why a mapping alone
  lets a profile post nowhere.

