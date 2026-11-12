# You're in control


> Every worry in one place: getting banned, posting by mistake, posting twice, embarrassing yourself, and AI running away. The controls that stop each one, and where they live.



Blowhorn is built for AI. Agents can drive it, queue for it and run it on
autopilot. But the AI is never in control. You are. Even when you hand
approval to an AI agent and let it run, the policies inside Blowhorn still
decide what may happen, how fast, and when to stop.

> **The Major says:** "You give the orders. I carry them out: one window, one profile, one platform at a time. Nobody types into two windows at once. Not in my unit."


This page gathers every worry people bring to a tool that posts as them,
and answers each with the control that handles it, where that control
lives, and the page that documents it.

<!-- Video placeholder: "You're in control" overview (60-90 s). What Blowhorn will and won't do on its own, the human limit, and where the controls live. -->

## Blowhorn limits itself to what a human could do

Any given Blowhorn install only runs one automation on a given platform
at a time, whichever profile it is for. You wouldn't expect a human to
be active on the same site from two accounts at once, so Blowhorn
doesn't either. It acknowledges that limit and holds itself to it.

Here is how that is enforced today:

- **One profile, one platform, one process.** Before a run opens a
  LinkedIn, X, Reddit or Hacker News session for a profile, it takes a
  lock on that profile and platform on this computer. A second run that wants
  the same profile on the same platform is refused with "profile ... is
  in use by another blowhorn process; wait for it to finish or stop it",
  and its activities stay in the queue for the next pass. The lock is the same
  whichever way Blowhorn reaches your browser.
- **Scheduled work runs one job at a time.** The background service runs
  one pass at a time, and a pass works through its jobs one after
  another, never side by side.
- **A cap on runs at once.** The one-at-a-time rule
  above is per profile and platform, so a pass, a run you start by hand
  and a run an agent starts could still act side by side on different
  profiles. `defaults.concurrency.max_runs` caps the total: with it set
  to 1, only one automation runs on this computer at a time, however it
  was started, and a run over the limit is refused with its activities
  left in the queue. With no explicit value, your rules of engagement
  decide: Safety on caps runs at 1, Weapons tight and Weapons free set no
  limit.
- **One send per action.** The send control is clicked once. There is
  no retry click.

That cross-profile rule is the default you get, not an extra: out of
the box `defaults.concurrency.per_platform` is `platform`, so only one
automation runs on a platform at a time on this computer, whichever
profile it belongs to. A run refused by that rule is told which profile
is holding the platform, and anything it was carrying for that platform
stays queued for a later run; its other platforms are not affected. The
rule covers the API platforms (Slack, Bluesky, GitHub) as well as the
browser ones. A queued Slack post whose session has expired is refreshed
before the run takes the platform's lock, so the refresh -- which opens
that same session -- is never refused by the run's own lock. If you would rather let different profiles act on the same
platform at once, set the option to `profile` in Posture or in
`.blowhorn.yaml`, and the one-profile-one-platform rule above still holds
either way. This behaviour lives in your rules of engagement (see "Your
rules of engagement" below): Safety on and Weapons tight keep `platform`,
Weapons free sets `profile`, and an explicit option you set yourself still beats the
preset for that dial.

<!-- Video placeholder: "Blowhorn limits itself to what a human could do". Two runs for the same profile and platform; the second waits. -->

## Will I get banned?

Nobody can promise that for any tool, and we won't. Platforms change
their rules, and automation can still be blocked or sessions broken,
especially on X. What Blowhorn does is behave like a careful person and
stop instead of guessing:

- **It types and clicks like a person.** Typing arrives key by key with a
  computed delay between keys, actions are separated by random pauses,
  and clicks land at slightly varied points with natural hover and press
  timing. You set the pace.
- **It caps itself.** At most 2 Hacker News link submissions per profile
  per day, and at most 400 X follows per profile a day and 15 in any 15
  minutes. `--limit` caps how many people a follow or accept run
  takes on, and how many jobs a scheduler pass runs.
- **It doesn't retry blindly.** Within a run, Blowhorn doesn't retry a failed post; it moves on to the next item. If a post goes out but Blowhorn can't record it, it stops that profile's queue rather than risk posting twice. Scheduled jobs only re-run a failure if you turn on retries, and they're off by default.
- **It never solves a CAPTCHA or a 2FA prompt.** When a platform asks for
  one, Blowhorn stops and leaves it for you. In a visible window it can
  wait while you finish it; unattended, the run stops.
- **It walks away from warnings.** A LinkedIn invitation flagged "Take
  care when connecting" is skipped, never confirmed.

Read more in [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/)
and [Why flagged invitations are skipped](/docs/explanation/invitation-safety/).

Curious what sites can see about your browser? Run the free check at
[Blowhorn Tells](https://tells.blowhorn.ai/). It shows what a page can read,
not what a platform will decide.

<!-- Video placeholder: "Will I get banned?" Typing at slow and normal pace side by side, a rate cap stopping a run, and a CAPTCHA left for the user. -->

## Will it post something I didn't mean to?

- **Nothing goes out unapproved.** A content activity is published only when
  its `Approved?` column reads `yes` or `true`. Anything else is a draft.
- **An activity never widens.** A blank or unknown `Profile` is refused, never
  read as "everybody". An activity with `Comment on` set can only ever be a
  comment.
- **Rehearse first.** `--check-queue` lists what a run would do, and
  `--dry-run` walks it end to end without publishing, following or
  writing anything. Make dry run your default until you trust a setup.
- **Stop it any time.** Take leave for this computer, the whole fleet of computers
  in your organization, or one scheduled order, and reenlist it when
  you are ready. A job already running
  finishes first, because killing a browser mid-post can leave a
  half-done action on the platform.

## Will it post twice?

- **One click per run.** The send control is clicked a single time.
- **"Clicked, outcome not read" is not a retry.** When Blowhorn clicked
  but could not read a confirmation, the activity is recorded as clicked and
  held for you. It is neither sent again nor marked done.
- **One computer per job.** Every computer sharing your organization's queue claims
  a scheduled job before it runs it, under a lease, so two computers can't
  run the same job at once.
- **Done is recorded per profile.** `Date Promoted` records when each
  profile published an activity, so the next run skips it.

Read more in [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/).

## Will it embarrass me?

- **No guessing at what landed.** A post's link is recorded only when
  Blowhorn read it back. It never records the page it started on as the
  new post.
- **Hacker News is held to its own rules.** Titles over 80 characters
  fail the activity rather than being cut, Blowhorn never votes there, and a
  rate-limited run waits rather than retrying.
- **Your words, unchanged.** Blowhorn's actions on these platforms are
  scripted, not written by AI. It types the text in your queue.

## What if an AI agent is driving?

An agent drives Blowhorn the same way you do: through the queue and the
documented CLI. Every rule on this page applies no matter who started
the run. The rate caps, the one-at-a-time lock, the single send click
and the refusal to solve a CAPTCHA are built in, not flags an agent can
drop.

Approval mode is the control built for this case. Set
`defaults.approval.mode` to `agent` and an agent can draft and queue all
day, but it cannot make anything publish on its own: activities it
writes are stored unapproved whatever it asked for, and actions that
publish without an activity - a one-off `follow`, an invitation, a
connection request, an acceptance, a `post --message`, a confirmed
Slack send - are refused with a sentence pointing at the queue. You approve from the
queue with `blowhorn content approve <activity>`, or with the approve
control beside a waiting activity in the app, which runs the same verb;
either way it records your name and the time in the activity's
`Approved by` column. An agent cannot approve its own work: `content approve` refuses an agent caller
outright, in every mode. Set the mode to `all` and the same holding
applies to every writer, you included; leave it `off` and the queue
works the way it always has, with `Approved?` as the writer's own word.
Blowhorn counts a caller as an agent when it is marked
`BLOWHORN_ACTOR=agent`, when the run is the scheduler's, or when no
terminal is attached; you at a terminal, or in the app, count as a
person. Jobs you schedule are your standing instructions and run as you
set them up - which is why creating one is held to the same rule: a job
that publishes on its own (a follow, an invitation, a connection
request, an acceptance, a comment carrying its target and message, a
post set to amplify) cannot be created by an agent under `agent`, or by
anyone under `all`, and neither can a change to such a job's profile,
platform or timing. Give
the agent a job that works the queue instead; its activities still
wait for your approval. Give the agent dry run first,
and pause any scope the moment something looks off. Lifting a pause
takes `blowhorn schedule resume`, or an explicit `--ignore-pause` on a
single run.

An agent that connects over MCP gets the same dry-run-first rule from
the server itself: the [MCP server](/docs/reference/mcp-server/) runs
every changing tool with `--dry-run` unless the call confirms it, and
it marks every call as an agent call, whatever its own environment
says, so the approval mode above applies to them. A confirmed MCP call is still an agent call, not a person's
approval in the app: it cannot approve its own queued work.

<!-- Video placeholder: "Handing approval to an AI agent". An agent queues activities, dry-runs them, and a pause stops the next claim. -->

## Every control, and where it lives

| Control | What it does | Where it lives | Reference |
|---|---|---|---|
| Dry run | Walks a run without publishing, following or writing | `--dry-run` on every action command; `defaults.dry_run`; dry fire in the app, its default in Posture | [Configuration](/docs/reference/configuration/), [`blowhorn post`](/docs/reference/post/) |
| Check the queue | Lists what a run would do, opening nothing | `blowhorn post --check-queue` | [`blowhorn post`](/docs/reference/post/) |
| Approval gate | Only approved activities are published | The `Approved?` column of each content activity | [Content queue](/docs/reference/content-queue/) |
| Approval mode | An agent's activities and ad-hoc actions - or everyone's, under `all` - wait for a person's approval; the approval records who and when | `defaults.approval.mode` (`off`, `agent`, `all`); `blowhorn content approve`; `BLOWHORN_ACTOR` marks an agent caller | [Configuration](/docs/reference/configuration/) |
| Pause (Off duty in the app) | Stops new claims on this computer, the whole fleet, or one scheduled order | `blowhorn schedule pause`, with `--all` or `--activity`; the rail's duty toggle, Home's Fleet card, an order's duty switch on its row, and the popover | [Pause and resume posting](/docs/how-to/schedule/pause/) |
| Stop everything | Raises the all-computers pause and ends runs already in progress at their next safe point, on every computer; without `--all` it stops this computer only | `blowhorn stop --all`; `blowhorn stop --resume` lifts it | [Pause and resume posting](/docs/how-to/schedule/pause/) |
| Quiet hours | The automatic pause: holds due scheduled activities inside a named window, in your time zone or a profile's own; they run when the window ends | `defaults.quiet_hours` and `defaults.quiet_hours_tz`; Posture in the app; a profile's Quiet Hours setting for its own activities | [Pause and resume posting](/docs/how-to/schedule/pause/), [Configuration](/docs/reference/configuration/) |
| Stop the current pass | Ends the background service's pass at its next safe point; the activity in progress returns to the queue | `blowhorn service cancel` | [CLI reference](/docs/reference/cli/) |
| Pace | How fast Blowhorn types and how long it pauses between actions | `--pace fast`, `normal`, `slow` or a number; `defaults.pace`; per platform with `defaults.pace_by_platform` (for example `x: slow`), which a `--pace` flag overrides for the run; Posture in the app | [Change your defaults](/docs/how-to/settings/defaults/) |
| Pointer movement | Turns the pointer movement before clicks on or off | `defaults.no_mouse_move`; your rules of engagement when the dial is unset; Posture in the app | [Configuration](/docs/reference/configuration/) |
| Rules of engagement (stored as the Risk Profile) | Pace, pointer movement, caps, spacing, quiet hours, outreach and how much runs at once, in one choice: Safety on, Weapons tight or Weapons free | Posture in the app, for everyone, each platform, each profile or one profile on one platform; `blowhorn risk set`; `defaults.risk_profile` | [Configuration](/docs/reference/configuration/#risk-profile-presets) |
| Run size | Caps how many people a follow or accept run takes on, and how many jobs a pass runs | `--limit` on `follow`, `accept` and `schedule tick` | [CLI reference](/docs/reference/cli/) |
| Excluded profiles | Leaves profiles out of `--profile all` | `--exclude`; `defaults.exclude`; Settings in the app | [Change your defaults](/docs/how-to/settings/defaults/) |
| Rate caps | Built-in daily caps per action on every platform (2 Hacker News link submissions, 50 X posts, 400 X follows per profile a day), counted from your account's run ledger so they hold across computers; you can set lower caps of your own per platform and action, and for one profile only. X follows also pause at 15 in 15 minutes on the computer that runs them | Built in; your own in `defaults.caps` and a profile's `Daily Caps` attribute | [Platforms](/docs/reference/platforms/), [Configuration](/docs/reference/configuration/#daily-caps) |
| No blind retries | Within a run, Blowhorn doesn't retry a failed post; it moves on to the next item. If a post goes out but Blowhorn can't record it, it stops that profile's queue rather than risk posting twice. Scheduled jobs only re-run a failure if you turn on retries, and they're off by default. | Built in; scheduled-job retries are opt-in | [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/) |
| One automation per platform per profile | A second run for the same profile and platform on this computer is refused | Built in | [Chrome reference](/docs/reference/chrome/) |
| One automation per platform across profiles | Only one run at a time uses a platform on this computer, whichever profile it is for | Built in (the default; your rules of engagement keep it under Safety on and Weapons tight, Weapons free loosens it, and `defaults.concurrency.per_platform` set to `profile` loosens it whatever the preset); Posture in the app | [Configuration](/docs/reference/configuration/) |
| Runs at once | Caps how many automations run at the same time on this computer, across the app, the command line, an agent and the background service; a run over the limit is refused and its activities stay queued | Your rules of engagement (Safety on: at most 1; Weapons tight and Weapons free: no limit), or `defaults.concurrency.max_runs` / `BLOWHORN_CONCURRENCY_MAX_RUNS` when you set one; Posture in the app | [Configuration](/docs/reference/configuration/) |
| One send per action | The send control is clicked once; an unread outcome is held for you | Built in | [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/) |
| One computer per job | A scheduled job is claimed by one computer at a time | Built in, through your account | [How scheduling works](/docs/explanation/scheduling/) |
| CAPTCHA and 2FA | Left for you; never solved | Built in | [Fix sign-in problems](/docs/how-to/troubleshoot/sign-in-problems/) |

## Your rules of engagement

Think of your rules of engagement as the dials for how much risk you'll
take and how fast you want things produced. One choice sets them
together: **Safety on** (slow and careful; stored as `cautious`),
**Weapons tight** (the default, normal pace; `standard`) or **Weapons
free** (fast, and more noticeable; `brisk`). The CLI, the config file and
the reference keep the stored values and call the setting the Risk
Profile. It covers the pace, pointer movement, caps, spacing between
actions, quiet hours, outreach, the pause after a sign-in challenge, and
how much runs at once: Safety on is meant to run one thing at a time,
Weapons tight to keep one profile per platform at a time, and Weapons
free to let different profiles share a platform (`blowhorn risk show`
reports these values, and the run gates enforce them when no explicit
concurrency value sets them). Pick
Safety on for a new account or an unattended run, and Weapons free for
an established one you are watching. A new profile or a new computer
runs under Safety on until it has some history, whatever you chose.

Any single dial you set yourself wins over the preset for that dial,
and the rest of the preset still applies around it. A profile with a
dial set outside its preset is a custom profile: custom is a description of
your mix, not a fourth choice to pick. `blowhorn risk show` names the
dials you set outside the preset.

Choose it in the app on the Posture screen, for everyone, for one
platform, for one profile, or for one profile on one platform; or use
`blowhorn risk set`. The [configuration reference](/docs/reference/configuration/#risk-profile-presets)
lists what each preset sets, and [Choose your rules of engagement](/docs/how-to/settings/choose-your-rules-of-engagement/)
says what each preset changes in your day.

A platform's choice and a profile's choice each cover one dimension, so
neither is more specific than the other. When both have one, Blowhorn
takes the more careful. A platform set to Safety on is usually a response
to that platform pushing back, and it should reach every profile on it,
including one set to Weapons free; a platform set to Weapons free should never loosen a
profile someone deliberately held back. Going faster for one profile on
one platform stays possible, but only as a choice made for that one cell.
When the shared choices cannot be read, the platform level reads Safety
on until they can, for the same reason.

Safety on's quiet hours are its own. `defaults.quiet_hours`
is a window you name yourself, in your time zone or a profile's, and it
holds that profile's scheduled activities whatever preset is in force.

## Related

- [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/) - measured pacing and the no-retry rule.
- [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/) - one click per run.
- [Why flagged invitations are skipped](/docs/explanation/invitation-safety/) - walking away from warnings.
- [Pause and resume posting](/docs/how-to/schedule/pause/) - the three pause scopes.
- [Change your defaults](/docs/how-to/settings/defaults/) - pace, exclusions and dry run.
- [Configuration reference](/docs/reference/configuration/) - every option and where it is set.
- [Platforms](/docs/reference/platforms/) - actions and limits per platform.

