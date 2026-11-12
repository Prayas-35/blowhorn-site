# Pause and resume posting


> Stop every scheduled claim on one computer, every computer, or one activity, then resume.



Stop Blowhorn from claiming scheduled work without stopping the service. Reach
for this when a platform challenges a sign-in, when a session expires, or on
any day you want nothing to go out.

> **The Major says:** "Whole unit off duty. Your call. Reenlist when you're ready."


## Stop everything

```bash
blowhorn stop --all --reason "a post is going out wrong"
blowhorn stop --resume --all
```

Reach for `stop` when something is going wrong right now. A pause stops new
claims; a stop also ends the work already running. `blowhorn stop --all`
raises the all-computers pause below and records the stop in your account,
with who stopped it, when, and the reason you gave. Every acting process (a
scheduled pass, the queue working through posts, a run you started by hand)
checks that record at the same safe points a cancel is honoured at and ends
there, never mid-post. The activity in progress returns to the queue, and
its run record reads cancelled with the stop's reason.

Without `--all`, `blowhorn stop` stops this computer only: it sets this
computer's pause and asks the pass running here to stop, the two things you
would otherwise combine by hand. Nothing on any other computer changes.

`blowhorn stop --resume` lifts the stop, and only what the stop set. If
this computer, or every computer, was already paused before the stop, that
pause stays: a stop never lifts a pause it did not raise. While a stop
stands, `blowhorn schedule list` shows it live and `blowhorn schedule
status` shows it as of the last pass: who stopped everything, when, and why.

In Blowhorn the stop record rides the same preferences as the
pause, so `stop --all` works the same way there. On an older Blowhorn
that does not carry the stop yet, `stop --all` still raises the
all-computers pause, so nothing new is claimed anywhere, but a pass
already running on another computer finishes the activity it is on
instead of stopping mid-pass. The command says so when it happens.

In the app, **Stop everything** is on the console, not the popover: the popover
only shows the duty switches. It asks for a reason and a confirmation first - nothing
stops on the first click. Stop everything is the emergency control; taking leave
is not. The Off duty board then shows a **stop** line with who
stopped it, when and why, and the console's **Stop everything** control
is the way back: turning it off lifts the stop, and the pause it raised
with it. A pause you set by hand is never the stop's to lift, and its
own control stays beside the stop's.

## Pause this computer

```bash
blowhorn schedule pause --reason "LinkedIn challenge on the company profile"
blowhorn schedule status
blowhorn schedule resume
```

The flagless pause writes a local file beside your config, so it works even
when everything else is broken, and it survives a crash, a restart and a
reboot. The service keeps running but claims nothing and exits 0.
Due times carry forward: a recurring activity that fell due during the pause runs
once on resume, not once per missed interval.

A job already running finishes first. Killing a browser flow mid-post can leave
a half-done action on the platform, so the pause stops the next claim, never
the running job.

In the app this pause is a duty switch. Use the switch at the bottom of the
console rail, or on the menu-bar popover's **This computer** row: it shows **On duty** while
this computer runs scheduled work and **Off duty** while it is held. The
switch's position and colour say which, and a click changes it. ⌘⇧P does the
same, and so does the **On duty** item in the Scheduler menu. It takes one click
and no reason. Home's Fleet card shows the same switch on this computer's row.
While this computer is off duty, the app also skips its session probe, so
it opens no browser at all. The popover shows its Off duty board in place
of NEXT UP: what holds this computer, and the items waiting until you reenlist.

## Pause every computer, or one activity

```bash
blowhorn schedule pause --all --reason "X is rate limiting us"
blowhorn schedule pause --activity 7 --reason "waiting on the page owner"
blowhorn schedule resume --all
blowhorn schedule resume --activity 7
```

An activity is claimed only when none of the three scopes says paused: this computer,
all computers, or that activity. `--all` and `--activity` live in your account, so every
computer sharing it honours them on its next claim; the flagless pause never
touches your account. In the app every scope is one duty switch, reading
**On duty** or **Off duty**:

- **This computer** - the rail's switch and the popover's **This computer**
  switch, the flagless pause above.
- **The fleet** (every computer sharing your schedule, `--all`) - the
  **Entire fleet** row on Home's Fleet card, **Take leave for the fleet** in
  Posture, or the popover's **Fleet** switch, which takes no reason. On Home,
  the switch opens an optional reason under the row with two buttons: **Save**
  takes leave with the reason you typed, and **Skip** takes leave with no reason.
  Escape closes the reason and takes nothing. Clicking away keeps it open and
  takes nothing either. If the leave cannot be written, the reason stays put so
  you can press Save or Skip again. While the fleet is off duty,
  the card shows who took it off duty, when and why, and this computer's row is
  held until the fleet is back on duty.
- **This order** (`--activity N`) - the duty switch on the item's row in the
  Routines list or on its calendar chip, reading **On duty** or **Off duty**.
  While it is held, the item's details (click the item and it opens in a
  dialog, a box over the screen) show who held it, when and why where the
  **When** row opens, with **Resume**.

There is no switch for another computer: take leave on that computer from
its own Blowhorn app, or take leave for the whole fleet.

Lifting one scope leaves the other two as they were. A held activity still reads
`due: yes` beside `paused: yes` in `blowhorn schedule list`: due keeps meaning
its time has passed. A pause is not `Enabled: no`: turning an activity off is
editorial, with no reason. In the app that is the details' state pill:
**On hold** is `Enabled: no`, and **Resume** turns it back on.

`trigger-now` on a held activity exits 1 and names the scope. `--ignore-pause` on
`tick` or `trigger-now` overrides every scope, and a dry run previews through
the pause: held activities read `held` rather than `would-run`.

## Quiet hours: the pause that keeps your hours

A pause is a decision you make in the moment. Quiet hours are the standing
version: name the hours when nothing should go out, and due activities wait
them out on their own.

```bash
blowhorn config set defaults.quiet_hours 22:00-07:00
blowhorn config set defaults.quiet_hours_tz America/New_York
```

The window may wrap midnight, as `22:00-07:00` does, and is read in
`defaults.quiet_hours_tz` - unset, this computer's own zone. In the app, the
same two fields sit under Settings, in the defaults card's quiet hours
group; clearing the window there turns quiet hours off. While a window is
in force and this computer is off duty, the menu-bar popover's Off duty
board says so - `quiet until 07:00`, the window's end. An activity due inside the window is not claimed and not failed: it
stays due and runs on the first pass after the window ends, the way a
paused activity carries forward.
`blowhorn schedule list` marks it `held (quiet hours)` with the window and
the hour it lifts, and `blowhorn schedule why N` names quiet hours as the
reason. Nothing is stored; the hold is computed from the clock on every pass.

A profile whose audience keeps different hours carries its own: set its
**Quiet Hours** and **Quiet Hours Time Zone** settings and they win over the
defaults for that profile's activities, each key on its own.

`--ignore-quiet-hours` on `tick` or `trigger-now` runs through the window
once, the way `--ignore-pause` runs through a pause; `trigger-now` inside
the window otherwise exits 1 and says so. Quiet hours hold scheduled work
only - a command you run by hand is yours, exactly as a pause never stops one.

## Related

- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - create activities and run passes by hand
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - see which scope holds an activity
- [Keep posting when the app is closed](/docs/how-to/schedule/background-service/) - the service that keeps running while paused
- [Change your defaults](/docs/how-to/settings/defaults/) - pace, excluded profiles, logs
- [You're in control](/docs/explanation/youre-in-control/) - every other safety control

