# Profile reference


> What a profile is: a profile in your organization, the list every command reads, its keys per platform, and the Chrome column.



A profile is one identity Blowhorn posts as: a profile your organization
holds in your Blowhorn account. Each one has an id, a name, an optional
description, and, unless it is a brand, the member it represents. Its
platform accounts and their credentials are kept in your account too.
This page describes; the steps live in the how-to guides under Related.

## Which profiles exist

Your organization's profile list is the only answer. Every command reads it
once per run and selects from it: `--profile all` is every profile on it
minus the excluded list, and a name you type must match one profile on it,
ignoring case. A name two profiles share is refused until one is renamed.
Nothing on your computer adds a profile or keeps a deleted one alive:
Blowhorn keeps no profile folder, and leaves any `data/profiles/` folder an
older version made where it is, unread.

`blowhorn profile list` prints the list. With `--json` each item carries
the profile's `id`, `name`, `description`, `userId`, `owner`, and `person`:
the represented member's name and email, or `null` for a brand.

What a run learns about a profile on this computer (its session verdicts,
the X follower history, the X follow log and an invite `Connections.csv`
export) is kept in `data/cache/profiles/<profile id>/`. That folder is safe
to delete; the next check or collection writes it again, and it never says
a profile exists.

## Identity and name

A profile's **id** is its identity, and its **name** is what you type.
Renaming a profile keeps its id, so its Google Chrome mapping and its content
items stay with it. What names a profile by its name changes with the
rename: `--profile` on the command line, a routine's profile, and the
excluded list (`--exclude`, `defaults.exclude`).

## Creating a profile

`blowhorn profile create --payload-stdin` creates a profile in your
organization from a JSON document on stdin holding the fields a person
sets:

| Field | Required | What it is |
|---|---|---|
| `name` | yes | Lowercase letters, digits, `-` or `_`, at most 64 characters, never `all`, and not a name another profile uses |
| `description` | no | What the profile is for, at most 1000 characters |
| `userId` | no | The member the profile represents, as `blowhorn org members` lists them. Leave it out for a brand |

Blowhorn adds your organization, and you own the profile. Any other key,
such as an email, a handle or a credential, is refused, and every refusal
comes before anything is sent. No folder is created and no email is
looked up.

`blowhorn profile update <name-or-id> --payload-stdin` takes the same
document and replaces those three fields. The document is the whole of
them: a description left out is cleared, and a `userId` left out makes
the profile a brand. The profile's run settings (Risk Profile, caps and
quiet hours) are read just before the write and kept as they are, and its
owner does not change.

Both take `--dry-run`, which makes the same checks and sends nothing.
`blowhorn org members` lists the members a profile can represent, with
each one's user id, name and email.

The desktop app's Add profile form and profile detail use the commands
above. `profile create` is the only way to create a profile, and who a
profile represents is a member you pick, never an email you type.

## Reading, credentials and deleting

`blowhorn profile get <name>` prints one profile: its id, description and
the person it represents, the accounts mapped to it, and which fields each
platform's credential holds. A credential field is shown only as set,
never with its value. `blowhorn profile status` reports every profile with
its sessions.

`blowhorn profile set <name> KEY=VALUE` writes a platform key to that
platform's credential in your account, and a run setting to the profile's
settings there. The run settings are `Risk Profile`, `Risk Profile By
Platform`, `Daily Caps`, `Quiet Hours` and `Quiet Hours Time Zone`; a value
a run could not read is refused. Any other key is refused by name before
anything is sent, and a blank value clears a key. If someone else changes the
profile while you set it, Blowhorn reads it again and applies your keys once
more, so their change is kept; if it changes a second time, nothing is written
and the command says so - run it again.

```bash
blowhorn profile set company "Risk Profile=cautious" "Quiet Hours=22:00-07:00"
```

`blowhorn profile delete <name-or-id>` deletes the profile in your
organization and unlinks its accounts. The accounts themselves are kept, and nothing on
your computer is moved or removed. A deleted profile cannot be brought
back; create a new one.

## Credential Loading

Eligibility is credential existence: a profile may post on a platform
exactly when the secret for that platform exists. Handles, sessions in
Chrome, and follower counts grant nothing.

| Platform | Keys |
|---|---|
| LinkedIn | `LI_CHROME_SESSION`, or `LI_USERNAME` and `LI_PASSWORD` |
| X | `X_USERNAME` (password beside it for automated sign-in; `X_APP_KEY`, `X_APP_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` for the API) |
| Reddit | `RDDT_USERNAME` (password beside it for automated sign-in; `RDDT_CLIENT_ID` and the other `RDDT_*` keys for OAuth) |
| Hacker News | `HN_USERNAME`, and `HN_PASSWORD` or `HN_CHROME_SESSION` |
| Slack | `SLACK_USER_TOKEN`, `SLACK_BOT_TOKEN`, or a captured workspace session |
| Bluesky | `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD` |
| GitHub | `GH_TOKEN` |

Every platform reads its credential from your account, and only from
there: a run takes the secret from the same read that decided the profile
may post, and `profile set` writes the keys there. No file on this
computer holds a credential, and a key left in a profile's old local
file is never read. `blowhorn profile auth --platform slack` captures a
workspace session through the run's browser driver and lands it in your
account; no Slack app install is needed. `blowhorn profile auth --platform
bluesky` logs in with a handle and app password and stores them only when
Bluesky accepts them.

LinkedIn and Hacker News also accept a **confirmed Chrome session**
instead of a password: `LI_CHROME_SESSION` and `HN_CHROME_SESSION` name
the Chrome profile directory whose signed-in session the person
confirmed on setup's Confirm troops step. LinkedIn's needs no
`LI_USERNAME` beside it; Hacker News's still needs `HN_USERNAME`. The
run then works through that profile's live session in its mapped Chrome
profile. If the session
has signed out and no password is stored, the run says so and stops for
that platform. The session counts toward eligibility only because the
credential row exists - a browser that merely happens to be signed in
grants nothing.

A profile you name that holds no credential for anything in scope stops
the run with the reason naming it. `--profile all` skips such profiles
quietly.

## The Chrome column

The Chrome column says which real Chrome profile a Blowhorn profile acts
in on this computer. It is kept on this computer for your macOS user only,
keyed by the profile's id, because a Chrome profile exists on one Mac and
nowhere else. `blowhorn chrome map` writes it; `blowhorn chrome unmap`
clears it. A browser run with no mapping for its profile refuses
before anything opens, and never falls back to another profile. The
mapping is identity, never permission: it says where the run acts, not
what it may do.

## Related

- [Map Blowhorn profiles to Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/) - write the Chrome column.
- [Platforms](/docs/reference/platforms/) - what each platform acts with.
- [Chrome reference](/docs/reference/chrome/) - the mapping commands and their shapes.
- [`blowhorn org`](/docs/reference/cli/org/) - the members a profile can represent.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.

