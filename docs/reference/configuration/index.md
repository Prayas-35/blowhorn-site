# Configuration reference


> Precedence, every `.blowhorn.yaml` option, environment variables, and output logging.



How Blowhorn resolves what a run uses, and where its output goes.
`engine/blowhorn/config_schema.py` is the one list of options; `blowhorn
config show` prints each with its stored, environment, effective, and
source values. `blowhorn config set` edits the file without rewriting
it: comments, order, and quoting survive.

Precedence, highest first: the CLI flag, the environment variable, the
`.blowhorn.yaml` default, then the built-in. The file lives beside the
current directory by default (`./.blowhorn.yaml`); `--config` points
at another one.

Only the Blowhorn names are read: `./.blowhorn.yaml` and the `BLOWHORN_*`
environment variables.

## Every option `.blowhorn.yaml` supports

| Default key | Environment | Built-in | Means |
|---|---|---|---|
| `defaults.profile` | `BLOWHORN_PROFILE` | `all` | The profile a run uses when `--profile` is not given |
| `defaults.platform` | `BLOWHORN_PLATFORM` | `all` | The platform a run targets when `--platform` is not given |
| `defaults.exclude` | `BLOWHORN_EXCLUDE` | none | Profiles left out of `--profile all` |
| `defaults.headless` | `BLOWHORN_HEADLESS` | off | Unattended background window |
| `defaults.headed` | `BLOWHORN_HEADED` | off | Visible window in front |
| `defaults.dry_run` | `BLOWHORN_DRY_RUN` | off | Simulate every run |
| `defaults.pace` | `BLOWHORN_PACE` | `normal` | `fast`, `normal`, `slow`, or a number; commands that never pause accept and ignore it |
| `defaults.pace_by_platform` | `BLOWHORN_PACE_BY_PLATFORM` | none | A pace per platform, in `defaults.pace`'s values: `x: slow, linkedin: 1.5`. A platform with no entry runs at `defaults.pace`; a `--pace` flag or `BLOWHORN_PACE` covers every platform. `config show --json` reports each platform's effective pace and which setting supplied it |
| `defaults.no_mouse_move` | `BLOWHORN_NO_MOUSE_MOVE` | off | Skip the pointer simulation before clicks |
| `defaults.concurrency.per_platform` | `BLOWHORN_CONCURRENCY_PER_PLATFORM` | `platform` | `platform`: one automation per platform at a time across all profiles on this computer. `profile`: one automation per profile and platform at a time. When unset, your Risk Profile's value applies (cautious and standard: `platform`; brisk: `profile`) |
| `defaults.concurrency.max_runs` | `BLOWHORN_CONCURRENCY_MAX_RUNS` | none | At most this many automations running at once on this computer, however they were started; a run over the limit is refused and its activities stay queued. When unset, your Risk Profile's value applies (cautious: at most 1; standard and brisk: no limit) |
| `defaults.risk_profile` | `BLOWHORN_RISK_PROFILE` | `standard` | `cautious`, `standard` or `brisk`: pace, pointer movement, caps, spacing, quiet hours, outreach and how much runs at once in one choice (see below) |
| `defaults.risk_profile_by_platform` | none | none | A preset per platform, for example `x: cautious` |
| `defaults.risk_profiles` | none | none | A preset per profile: a name, or a map with `default` and platform keys |
| `defaults.approval.mode` | `BLOWHORN_APPROVAL_MODE` | `off` | `off`, `agent` or `all`: who must approve before work publishes (see below) |
| `defaults.caps` | none | none | Your own daily caps per platform and action, under the built-in ceilings (see below) |
| `defaults.quiet_hours` | `BLOWHORN_QUIET_HOURS` | none | Hours when the scheduler claims nothing, written `HH:MM-HH:MM` like `22:00-07:00` (the window may wrap midnight). A due activity inside it is held, not failed, and runs when the window ends. A profile's own Quiet Hours setting wins for its activities |
| `defaults.quiet_hours_tz` | `BLOWHORN_QUIET_HOURS_TZ` | this computer's zone | The IANA time zone `defaults.quiet_hours` is read in, like `America/New_York`. A profile's own Quiet Hours Time Zone setting wins for its activities |
| `defaults.typing_delay_min_ms`, `defaults.typing_delay_max_ms`, `defaults.typing_jitter_ms`, `defaults.typing_target_duration_s` | `BLOWHORN_TYPING_DELAY_MIN_MS`, `BLOWHORN_TYPING_DELAY_MAX_MS`, `BLOWHORN_TYPING_JITTER_MS`, `BLOWHORN_TYPING_TARGET_DURATION_S` | 35, 165, 9, 20 | How fast keys are typed: the pause band between keys in milliseconds, the random wobble on each pause, and how long a whole entry aims to take in seconds. Shapes both drivers (see below) |
| `defaults.typing_micro_pause_chance_pct`, `defaults.typing_micro_pause_min_ms`, `defaults.typing_micro_pause_max_ms`, `defaults.typing_long_pause_min_chars`, `defaults.typing_long_pause_max_chars`, `defaults.typing_long_pause_min_ms`, `defaults.typing_long_pause_max_ms` | `BLOWHORN_TYPING_MICRO_PAUSE_CHANCE_PCT`, `BLOWHORN_TYPING_MICRO_PAUSE_MIN_MS`, `BLOWHORN_TYPING_MICRO_PAUSE_MAX_MS`, `BLOWHORN_TYPING_LONG_PAUSE_MIN_CHARS`, `BLOWHORN_TYPING_LONG_PAUSE_MAX_CHARS`, `BLOWHORN_TYPING_LONG_PAUSE_MIN_MS`, `BLOWHORN_TYPING_LONG_PAUSE_MAX_MS` | 7, 50, 220, 45, 85, 350, 1250 | Short hesitations between keys and longer pauses every so many keys. Playwright only: the extension driver sends one key per message and runs no pause plan (see below) |
| `defaults.typing_allow_mistakes`, `defaults.typing_mistake_rate_pct`, `defaults.typing_max_mistakes_per_entry`, `defaults.typing_mistake_min_text_length`, `defaults.typing_mistake_delay_min_ms`, `defaults.typing_mistake_delay_max_ms`, `defaults.typing_mistake_pause_min_ms`, `defaults.typing_mistake_pause_max_ms` | `BLOWHORN_TYPING_ALLOW_MISTAKES`, `BLOWHORN_TYPING_MISTAKE_RATE_PCT`, `BLOWHORN_TYPING_MAX_MISTAKES_PER_ENTRY`, `BLOWHORN_TYPING_MISTAKE_MIN_TEXT_LENGTH`, `BLOWHORN_TYPING_MISTAKE_DELAY_MIN_MS`, `BLOWHORN_TYPING_MISTAKE_DELAY_MAX_MS`, `BLOWHORN_TYPING_MISTAKE_PAUSE_MIN_MS`, `BLOWHORN_TYPING_MISTAKE_PAUSE_MAX_MS` | on, 3, 4, 20, 55, 170, 80, 350 | Whether a typed entry may include a wrong key that is then corrected, how often, and the pauses around the correction. Playwright only, never on sign-in (see below) |
| `defaults.pointer_click_hold_min_ms`, `defaults.pointer_click_hold_max_ms`, `defaults.pointer_key_dwell_min_ms`, `defaults.pointer_key_dwell_max_ms`, `defaults.pointer_hover_pause_min_ms`, `defaults.pointer_hover_pause_max_ms` | `BLOWHORN_POINTER_CLICK_HOLD_MIN_MS`, `BLOWHORN_POINTER_CLICK_HOLD_MAX_MS`, `BLOWHORN_POINTER_KEY_DWELL_MIN_MS`, `BLOWHORN_POINTER_KEY_DWELL_MAX_MS`, `BLOWHORN_POINTER_HOVER_PAUSE_MIN_MS`, `BLOWHORN_POINTER_HOVER_PAUSE_MAX_MS` | 40, 140, 25, 90, 50, 250 | How long a click stays held, how long a key stays pressed, and the pause after the pointer arrives before a click, all in milliseconds (see below) |
| `defaults.logs.directory` | `BLOWHORN_LOG_DIR` | `data/logs/` in the checkout | Where daily logs go |
| `defaults.logs.retention_days` | `BLOWHORN_LOG_RETENTION_DAYS` | 30 | Days of daily logs kept; 0 keeps all |
| `defaults.diagnostics.enabled` | `BLOWHORN_DIAGNOSTICS_ENABLED` | on | Queue and send anonymous failure reports (see [Failure reports](/docs/explanation/your-data/#failure-reports)); off means nothing is queued or sent, and the desktop Settings row is the same choice |
| `defaults.chrome.launch_mode` | `BLOWHORN_CHROME_LAUNCH` | `extension` | How a run reaches Google Chrome |
| `defaults.chrome.automation_data_dir` | `BLOWHORN_CHROME_AUTOMATION_DATA_DIR` | Blowhorn's own directory | Where a launched Chrome keeps its session |
| `defaults.chrome.data_dir` | `BLOWHORN_CHROME_DATA_DIR` | Your real Chrome directory | Where the installed Chrome is read from |
| `defaults.slack.auth_mode` | `BLOWHORN_SLACK_AUTH` | your captured session first | Which Slack credential may send: session, user-token, bot-token, or a list tried in order |
| (flag only) | `BLOWHORN_TEE_STDOUT` | off | Flush the stdout copy per write for a supervising wrapper |
| `defaults.store.organization` | `BLOWHORN_STORE_ORGANIZATION` | none; Blowhorn uses the organization you signed in to | The organization Blowhorn uses when the sign-in did not choose one |

`headed` and `headless` are one choice with two spellings: the higher
layer wins, so a `--headless` flag beats a `headed` default from the
file, and `--headed` wins a tie. The settings screen reports each on
its own; a flagless run resolves them together so exactly one
survives.

A version-1 file that still says `persistent` reads as `extension` on
every run; only a validated `config set` of another key moves the file
to version 2.

Blowhorn reads and writes everything in your Blowhorn account. A
`defaults.store.backend` or `defaults.store.config` key left in an older
file, and `BLOWHORN_STORE_BACKEND` in the environment, are ignored
(`config show --json` lists the two keys as unknown), and `config set`
refuses a `store.<name>` key. Data an older version kept in a local store is
not read and is not brought into your account.

## Risk Profile presets

The app calls these the rules of engagement and shows each preset by its display name: **Safety on** is `cautious`, **Weapons tight** is `standard` and **Weapons free** is `brisk`. The stored value, the config file, `--risk-profile` and every `--json` payload keep `cautious`, `standard` and `brisk`.

| Dial | cautious (Safety on) | standard (Weapons tight) | brisk (Weapons free) |
|---|---|---|---|
| Pace (when `defaults.pace` is unset) | slow | normal | fast |
| Pointer movement (when `defaults.no_mouse_move` is unset) | on | on | on |
| Caps (share of each built-in ceiling) | 25% | 50% | 100% |
| Spacing between public actions | 15 min plus up to 15 min | none | none |
| Quiet hours (local) | 22:00 to 07:00 | none | none |
| Outreach (connect, invite, follow) | off | established platforms only | on |
| Pause after a CAPTCHA or checkpoint | 72 h | 24 h | 12 h |
| Retries of a failed scheduled job | 0 | 0 | 1 |
| Warmup (the value `risk show` reports for the preset; see [Warmup](#warmup)) | 14 days | 7 days | 3 days |
| Runs sharing a platform (when `defaults.concurrency.per_platform` is unset) | one profile at a time | one profile at a time | different profiles may share |
| Runs at once overall (enforced; see [Concurrency](#concurrency)) | at most 1 | no limit | no limit |

No preset can raise a built-in ceiling: the caps are a share of one, never more, and the concurrency values only ever hold runs back at or below the shipped posture (one profile per platform, which `standard` keeps).

Any dial you set yourself beats the preset for that dial: your own `defaults.pace`, `defaults.no_mouse_move` or `defaults.concurrency` value is the one that applies, and the rest of the preset still applies around it. A profile with a dial set outside the preset is a **custom** profile. `custom` is a description, not a fourth preset you can pick: `blowhorn risk show` names the dials set outside the profile, and `blowhorn config show` names the preset as a dial's source when the preset is the layer that supplied it.

The concurrency rows are the values the presets carry, and they are enforced, not just reported: `blowhorn risk show` reports them, each with the layer that supplied it, and the run gates fall back to the chosen preset when no explicit value sets a key. An explicit environment or file value still beats the preset per key, and a refusal under a preset cap names the preset (for example, "your Cautious profile"). `blowhorn config show` names `risk_profile` as the source when the preset is the layer that supplied a key.

Scheduled jobs on a new profile or a new computer run cautious until the warmup is done, whatever you chose -- the cautious concurrency values included. A run you start yourself is not held by the warmup, only noted; it still follows the caps, quiet hours and outreach setting of the preset you chose. When a run covers several profiles or platforms, a held one is skipped by name and the rest run. To run once anyway, add `--ignore-risk`, or choose **Do it anyway** next to a held item under Activity › History or in Posture's held back list. Logins are never retried under any preset. Choose a preset in the app on the **Posture** screen - the slider for everyone, and a grid for each platform, each profile, and one profile on one platform (the same mode also shows as a mini-slider in the menu-bar popover, which opens Posture) - or with `blowhorn risk set`; see [Which choice wins](#which-choice-wins). `blowhorn risk show` says which preset is in effect and where it comes from, and `blowhorn risk grid` lists every profile on every platform at once. For choosing between the presets in lived terms, see [Choose your rules of engagement](/docs/how-to/settings/choose-your-rules-of-engagement/).

One activity can run under its own preset: set **rules of engagement** in the activity editor, or `risk_profile=cautious` in the activity's params, and that activity runs cautious (pace, caps share, quiet hours, challenge pause) while the same profile × platform runs standard elsewhere. The activity's detail shows the preset and where it came from (`Safety on · this activity`, or `Safety on · inherits: LinkedIn × work profile`); a run report names `schedule` as the source when the activity's own value held it. A run you start by hand can override everything for that one run with `--risk-profile cautious` (before the command word, between a group word and its subcommand, or after it); an unknown value is refused before anything runs. Activities without the field behave exactly as before, and the field is refused on commands the gate does not act on (analytics, report, withdraw, reconcile) rather than accepted and ignored. The upstream Schedule construct gains a top-level `riskProfile` field in a proposed meshery/schemas change (open, not yet released); until a release carries it, the value travels in the activity's params.

### Which choice wins

A Risk Profile can be chosen at several levels. For one profile on one platform, Blowhorn uses the most specific level that has a choice:

| Level | Set it with | Kept in |
|---|---|---|
| One run | `--risk-profile cautious` on a command you start | that run only |
| One activity | **rules of engagement** in the activity editor, or `risk_profile=` in its params | the activity |
| One profile on one platform | a cell in the Posture grid, or `blowhorn risk set <preset> --profile company --platform linkedin` | the profile's `Risk Profile By Platform` attribute, then `defaults.risk_profiles.<profile>.<platform>` on this computer |
| Each platform | the **Each platform** row in Posture, or `blowhorn risk set <preset> --platform linkedin` | your organization, for every computer; on this computer only (`defaults.risk_profile_by_platform`) when your organization cannot keep it |
| Each profile | the **Every platform** column in Posture, or `blowhorn risk set <preset> --profile company` | the profile's `Risk Profile` attribute, then `defaults.risk_profiles.<profile>` on this computer |
| Everyone | the slider in Posture, or `blowhorn risk set <preset>` | `BLOWHORN_RISK_PROFILE`, then your account, then `defaults.risk_profile` |
| Built in | nothing | standard |

**When a platform and a profile both have a choice, the more careful one wins** - cautious before standard before brisk. "LinkedIn cautious for everyone" therefore reaches a profile set to brisk everywhere, and "X brisk for everyone" never loosens a profile set to cautious. A tie is reported as the profile's. To go faster for one profile on one platform, choose that cell.

On top of every level, scheduled activity on a new profile or a new computer runs cautious for its first 14 days ([Warmup](#warmup)).

A platform's choice is shared: it is written to your organization, so every computer you run Blowhorn on reads the same one, and `blowhorn risk show` and `risk grid` say "every computer". When your organization cannot keep it yet, `risk set --platform` writes it to `defaults.risk_profile_by_platform` in this computer's `.blowhorn.yaml` instead, says so (`scope: this_computer`, with the reason), and the Posture screen labels it "this computer only". The organization's choice is read before this computer's file, so when the organization already has a choice for that platform, the command also says that choice still applies on every computer. The organization's choices are written back as a whole map, so a write that cannot be guarded against another admin's change (no `ETag` on the read) or that would drop a platform this version does not know is kept on this computer the same way; a platform this version does not know is left out when the choices are read. Choosing `default` for a platform clears both. When the shared choices cannot be read, the platform level reads cautious until they can, so a run holds toward caution rather than falling through to a looser choice.

The platforms a Risk Profile covers are LinkedIn, X, Bluesky, Reddit, Hacker News, Slack and GitHub.

### Risk Profile dials

Each dial below is one row of the presets table, with a stable anchor the desktop info buttons deep-link to. The desktop link map in `desktop/src/shared/docs-links.ts` (`RISK_PROFILE_DIAL_DOCS`) mirrors this table, so the slider and these docs agree on targets.

| Dial | Anchor |
|---|---|
| Pace | [#pace](#pace) |
| Pointer movement | [#pointer-movement](#pointer-movement) |
| Caps | [#caps](#caps) |
| Spacing between public actions | [#spacing-between-public-actions](#spacing-between-public-actions) |
| Quiet hours | [#quiet-hours](#quiet-hours) |
| Outreach | [#outreach](#outreach) |
| Pause after a challenge | [#pause-after-a-challenge](#pause-after-a-challenge) |
| Retries of a failed scheduled job | [#retries-of-a-failed-scheduled-job](#retries-of-a-failed-scheduled-job) |
| Warmup | [#warmup](#warmup) |
| Concurrency | [#concurrency](#concurrency) |

### Pace

The speed label a run uses when `defaults.pace` is unset: cautious `slow`, standard `normal`, brisk `fast`. Pace shapes typing cadence and the random pauses between actions (see [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/)); it does not by itself set the minimum spacing between public actions, which is the [Spacing](#spacing-between-public-actions) dial. A `--pace` flag, `BLOWHORN_PACE`, or `defaults.pace` beats the preset for this dial.

### Pointer movement

Whether Blowhorn simulates pointer movement before clicks, when `defaults.no_mouse_move` is unset. All three presets leave it on (`no_mouse_move` off); setting `defaults.no_mouse_move` (or `BLOWHORN_NO_MOUSE_MOVE`) turns it off whatever the preset says. The preset never turns pointer movement off by itself.

### Caps

The share of each platform's built-in ceiling the preset allows per day (and per hour, scaled the same way): cautious 25%, standard 50%, brisk 100%. No preset can raise a ceiling. A profile's own daily cap (`defaults.caps`, or its `Daily Caps` store attribute) can only lower the effective cap further, per action. For example, on LinkedIn the built-in ceiling is 10 posts a day, so cautious allows 2, standard 5 and brisk 10, before any user cap or warmup ramp. A cap that cannot be read holds every action for that platform or profile until it is fixed.

### Spacing between public actions

The least time between two public actions on one platform for one profile, plus a random wait up to the jitter: cautious 15 minutes plus up to 15 minutes, standard and brisk none. The ready time is seeded by profile, platform and the last action's time, so every computer and a dry run agree on it. This dial is enforced by the gate: an action inside the spacing is held with its ready time.

### Quiet hours

Local hours with no public actions: cautious 22:00 to 07:00, standard and brisk none. This is the preset's quiet hours, separate from `defaults.quiet_hours`, which is a window you name yourself for scheduled claims. A due scheduled activity inside quiet hours is held, not failed, and runs when the window ends.

### Outreach

Whether connect, invite and follow actions may run: cautious off, standard on established platforms only (off on platforms still being built: Facebook, Instagram, TikTok, YouTube), brisk on everywhere, including those platforms. When outreach is off, the gate refuses the action with the preset named, rather than queuing it silently.

### Pause after a challenge

How long a profile on a platform is held after a CAPTCHA, checkpoint or restriction page: cautious 72 hours, standard 24 hours, brisk 12 hours, counted from the last such record in the ledger. The hold names the reason and the time it can run again. Blowhorn never solves a CAPTCHA or 2FA prompt; a challenge is left for you.

### Retries of a failed scheduled job

How many times a failed scheduled job may be tried again: cautious 0, standard 0, brisk 1. A login is never retried under any preset, and a retry is never granted for an unknown outcome (a post may have gone out), a warming profile, or a trigger-now run. This dial is about scheduled jobs; within a run, a failed post is not retried, it moves on.

### Warmup

A new profile or a new Mac runs cautious for scheduled jobs until it has history, whatever preset was chosen, and its caps ramp over that period: from about a quarter of cautious's caps on day one to cautious's full caps by day 14. The per-preset figures in the table (14, 7, 3 days) are the values `risk show` reports for each preset; the gate that holds scheduled jobs uses cautious's 14-day window for every choice, so a brisk choice does not shorten a new profile's cautious period. A run you start yourself is not held by the warmup, only warned about, and it follows the chosen preset's caps, quiet hours and outreach. A profile idle longer than the 15-day ledger window warms up again.

### Concurrency

How much may run at once, in two parts. Runs sharing a platform: cautious and standard `platform` (one profile at a time on a platform), brisk `profile` (different profiles may share a platform; one profile is still held to one run on it). Runs at once overall: cautious at most 1, standard and brisk no limit. Both parts are enforced at the run gates, with the layering environment, explicit file value, preset, built-in, per key; a refusal under a preset cap names the preset. The session lock and the scheduler pass slot follow the same values, so `risk show` and observed enforcement agree with no explicit concurrency value set.

## Typing and pointer timing

These dials are not preset values: no preset sets a typing delay or a click hold. They are the shipped behaviour a run types and clicks with, and setting one away from its built-in is a dial set outside the preset, so `risk show` counts it toward "Custom, based on" just like a pace or concurrency dial. The desktop editor's info buttons link here, one anchor per group.

| Dial | Anchor |
|---|---|
| Typing delay | [#typing-delay](#typing-delay) |
| Typing pauses | [#typing-pauses](#typing-pauses) |
| Typing mistakes | [#typing-mistakes](#typing-mistakes) |
| Pointer timing | [#pointer-timing](#pointer-timing) |

### Typing delay

The pause band between two keys (`defaults.typing_delay_min_ms` to `defaults.typing_delay_max_ms`, built-ins 35 to 165 milliseconds), the random wobble on each pause (`defaults.typing_jitter_ms`, 9 milliseconds), and how long a whole entry aims to take (`defaults.typing_target_duration_s`, 20 seconds) before pauses are added. This dial shapes both drivers: the Playwright plan draws its inter-key delay from the band, and the extension session draws its shaped delay from the same band, floored at the band's minimum. A minimum above its maximum is refused at run start, naming the key.

### Typing pauses

Short hesitations between keys (`defaults.typing_micro_pause_chance_pct`, 7 percent, for `defaults.typing_micro_pause_min_ms` to `defaults.typing_micro_pause_max_ms`, 50 to 220 milliseconds) and longer pauses every so many keys (`defaults.typing_long_pause_min_chars` to `defaults.typing_long_pause_max_chars`, 45 to 85 keys, for `defaults.typing_long_pause_min_ms` to `defaults.typing_long_pause_max_ms`, 350 to 1250 milliseconds). Playwright only: the extension driver sends one key per message and runs no pause plan, so on that driver these dials change nothing, and the editor says so rather than letting them look live.

### Typing mistakes

Whether a typed entry may include a wrong key that is then corrected (`defaults.typing_allow_mistakes`, on), how often (`defaults.typing_mistake_rate_pct`, 3 percent), at most how many per entry (`defaults.typing_max_mistakes_per_entry`, 4), only in entries at least this long (`defaults.typing_mistake_min_text_length`, 20 keys), and the pauses around the correction (`defaults.typing_mistake_pause_min_ms` to `defaults.typing_mistake_pause_max_ms`, 80 to 350 milliseconds after the wrong key, then `defaults.typing_mistake_delay_min_ms` to `defaults.typing_mistake_delay_max_ms`, 55 to 170 milliseconds after the correction). Playwright only, for the same reason as pauses, and never on sign-in: a credential entry is typed exactly, whatever these dials say. Set the rate to 0, or mistakes off, to type with no corrections at all.

### Pointer timing

How long a click stays held (`defaults.pointer_click_hold_min_ms` to `defaults.pointer_click_hold_max_ms`, 40 to 140 milliseconds), how long a key stays pressed when a driver sends press and release as two events (`defaults.pointer_key_dwell_min_ms` to `defaults.pointer_key_dwell_max_ms`, 25 to 90 milliseconds), and the pause after the pointer arrives before a click (`defaults.pointer_hover_pause_min_ms` to `defaults.pointer_hover_pause_max_ms`, 50 to 250 milliseconds). The hover pause is shared by both drivers; the hold and dwell apply where a driver sends the two events, and Playwright's own click and keyboard type keep their own gaps.

## Approval mode

`defaults.approval.mode` decides whose writing is enough to publish.
`off` - the built-in - is the behaviour Blowhorn has always had: whoever
writes a content activity sets its `Approved?`, and actions that publish
without an activity (`post --amplify`, `post --message`, `follow`, an
invitation, a connection request, an acceptance, an ad-hoc `comment`, a
confirmed `slack send`) publish as run. `agent` keeps that for a person, but holds
an agent's work: a caller marked with `BLOWHORN_ACTOR=agent`, a scheduler
run, or any run with no terminal attached has its activities stored
unapproved whatever the payload asked, and its ad-hoc actions are refused
with a sentence pointing at the queue. `all` holds every activity and
every ad-hoc action, whoever wrote it. You at a terminal, or in the app,
count as a person for writing activities; under `all` the app's own
writes wait too, and approval is the separate act either way.

A schedule job that would publish on its own - a `follow`, an invitation,
a connection request, an acceptance, a `comment` with a target and a
message, a `post` with `amplify` - is a standing instruction to publish
unapproved, so
creating one is refused for the same callers: an agent under `agent`,
anyone under `all`. So is changing what an existing one would publish,
who it publishes as, where, or when: its command, its params, its
profile, its platform, or its timing (Run At, Next Run At, Recurrence).
A job that works the queue is never refused, and a job already scheduled
is not re-judged when the mode changes: it runs as its creator's
standing instruction.

Approval mode is a guard, not a sandbox. Who counts as an agent is read
from signals, and the signals are environment variables, set by whoever
launches the process - so a caller that can set its own environment can
claim to be a person, and no ordering of those claims prevents that.
The one case precedence does settle is the scheduler: a tick is
unattended, so a scheduler run counts as an agent whatever
`BLOWHORN_ACTOR` says. The [MCP server](/docs/reference/mcp-server/) is the same: it
sets `BLOWHORN_ACTOR=agent` on every command it runs and ignores any
other value in its environment. `BLOWHORN_ACTOR=human` still lets a
non-interactive human script count as the person, and is forgeable by
exactly the caller it lets through; a proof no environment claim gives -
the app proving itself over a channel only it holds, or a tick proven
by its parent process - is future work, not this mode.

The door is `blowhorn content approve <activity>`: it sets `Approved?`
and records who approved and when in the activity's `Approved by` column
(see [Content queue](/docs/reference/content-queue/)). The app's Content screen is the
same door: a waiting activity carries an approve control, and the app's
calls run as you, so the control runs this verb and the record is the
same. Approving is a person's act, so
an agent-signalled caller is refused by `content approve` itself, in
every mode - an agent cannot approve its own work. An unknown mode is
refused by name before anything runs.

## Daily caps

Every platform and action already has a built-in daily ceiling, and a
Risk Profile preset may take only a share of it. `defaults.caps` lets you
set a lower daily cap of your own, per platform and per action:

```yaml
defaults:
  caps:
    x:
      post_per_day: 3
      follow_per_day: 20
```

The key is the action in your words; it bounds the action Blowhorn counts:

| You write | It bounds |
|---|---|
| `post_per_day` | posts |
| `comment_per_day` | comments |
| `follow_per_day`, `connect_per_day`, `invite_per_day` | outreach: follows, connects and invites together |
| `repost_per_day` | shares (reposts) |
| `amplify_per_day`, `react_per_day` | reactions |
| `accept_per_day` | accepts, on the platforms that have them |

The gate's own names (`outreach_per_day`, `share_per_day`,
`reaction_per_day`) work too. A platform with no such action refuses the
key by name, as do a zero, a negative or a fractional count.

A user cap can only lower: a value above the built-in ceiling is accepted
and simply never binds, and a preset's share or a warmup can still take
the effective cap lower. The count is the run ledger in your account,
over the trailing 24 hours, so the cap holds on every computer sharing
the account; a row it holds stays queued, reads `held` with the reason
`daily cap (N <action> a day, your cap)`, and runs when the oldest counted
action ages past a day. Caps are per day only; the built-in hourly
ceilings are unchanged.

Set one with `blowhorn config set defaults.caps.x.post_per_day 3` (an
empty value clears it), or write the map in the file. For one profile
only, the profile's `Daily Caps` store attribute takes the same caps in
one line -- `x.post:3, x.follow:20` -- and beats the file per action.
`blowhorn config show` reports every platform and action with its
built-in ceiling, your value when set, and the effective (lower) number.

A cap that cannot be read (a zero, a negative or fractional count, an unknown
platform or action) never uncaps the account: scheduled jobs and hand runs
for that platform, or for that profile when it is the `Daily Caps` attribute,
are held with the entry named until it is fixed, and `config show` lists the
caps as `invalid` with the reason.

## Output logging

The daily log is a copy; the terminal streams are never dropped, piped
or not. The directory resolves as `--log-dir`, then `BLOWHORN_LOG_DIR`,
then `defaults.logs.directory`, then the checkout's `data/logs/`. That
directory is the parent. Each signed-in account keeps its own logs under
`accounts/<user id>` inside it (the account id, never a name or an email).
Before you are signed in, Blowhorn writes under `machine/`. History and
failure reports show only the account that is signed in. The first run
after an upgrade moves logs it can attribute into that account and keeps
the rest under `_unattributed/`. It does not delete them. A default
that cannot be used fails silently; a directory you named reports why.
Only files the retention pass recognizes by name are ever deleted:
daily logs past their days (30 by default), and the three dateless
capture files rolling past their size bound. Per-job logs, the ledger,
and the scheduler heartbeat live beneath the same directory and are
never pruned by it.

`--tee-stdout` is about liveness, not logging: it flushes the stdout
copy per write, and with no usable log directory it line-buffers the
real stdout instead. It is read before command parsing, so it is not a
per-command flag.

## Related

- [Change your defaults](/docs/how-to/settings/defaults/) - change the defaults.
- [Choose how Blowhorn reaches Chrome](/docs/how-to/settings/launch-mode/) - the launch-mode option in practice.
- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - the Settings screen.
- [Messages and exit codes](/docs/reference/messages/) - what a bad value reports.
- [How scheduling works](/docs/explanation/scheduling/) - what the heartbeat and per-job logs are for.
- [You're in control](/docs/explanation/youre-in-control/) - which options are safety dials.
- [CLI reference](/docs/reference/cli/) - every command and flag.

