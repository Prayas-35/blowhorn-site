# Schedule a job


> Run posts and other commands on a schedule, from Activity › Routines or the command line.



Put a command on a schedule so it runs on its own, with or without the app open.

## From the app

Open **Activity** in the rail and switch to its **Routines** view. It opens on a week calendar; switch to "day",
"month" or "list" above it, and the screen remembers your choice. Clicking a
day in the month opens that day, and the day view becomes the one it
remembers.

To add one, press the round **+** button in the lower right (or ⌘N) and
under When to march choose **Repeat it?** and a standing order, or click a free time
in the day or week calendar to start one at that time. A standing order opens the
routine editor on the profiles you picked, and runs on one platform, so pick only
one under Dispatch to. (The rest of that
window, New order, queues a one-off post or runs an action such as an invite
once; see
[Use the desktop app](/docs/reference/use-the-desktop-app/#the-console).) The routine editor has the
command, the browser route, and the exact call, for a case those choices do not
cover. A command that only runs in one place, such as accept on LinkedIn, can
only be saved for that place. One you saved on "all" before keeps running there.
When you edit it, the editor picks that place for you and says so, and saving
stores it. `blowhorn schedule upsert` does the same when your change names no
platform, and prints one line saying it did. Before you save it, **Dry fire** in
the editor rehearses the routine as you have it and stops before acting, so
nothing is sent or changed.

To move a job, drag its next time to another time. Only the next one moves, and
only to a time still ahead; the dashed times after it follow on their own. From
the keyboard, open the job and choose "edit", then change "when".

A job that has finished (it ran once, or gave up after its retries) has no
next time. To run it again, open it, choose "edit" and give it a new "when":
it is scheduled again on the same activity, with its full set of retries, and its
last run stays in its history.

For a repeating job, giving up stops the whole series: when a run uses its
last retry, the job is marked failed and the later runs in the series do not
happen - it does not try again tomorrow. That is deliberate. Repeated failures
usually mean a broken sign-in or a platform checkpoint, and trying again every
day risks the account. `blowhorn schedule why <activity>` says when a series
has stopped; give the job a new time, as above, to restart the series with a
fresh set of retries.

If you have no routines yet, the screen offers "add sample routines…" instead. It shows
each starter routine with its character, what it does and when it runs. Tick the ones
you want, then add them. A starter routine can be ticked only once the platform it needs
is connected to its profile; until then it says which connection to make. Starter
routines are added to what you have, and they never replace or edit routines you
already set up. A starter routine that was added is greyed out for the rest of that
visit, so adding again never makes a second copy; if an add stops partway, the ones
that landed stay added and the rest can be ticked again. Once you have routines, the
"add sample routines…" button stays in the Routines header, so you can add starter
routines later; a starter routine you already have is greyed out there too. The
"invite connections" starter routine invites to a preset company page; to invite to another
page, open the routine after adding it and change its page.

Open a job (click it, or focus it and press Enter) and its details appear in a
dialog, a box over the screen. Open its **What**, **When** or **Rules** row to
change it in place, or choose **Do it now** to run it without waiting for its
time. The pill beside its title puts it **On hold** or back **In effect**. With "dry fire" on, a run rehearses the routine and claims nothing. When the account is not connected, the preview says the activity is blocked and why, in the same words a real run would meet.

## From the command line

List what is scheduled and whether each activity is due:

```bash
blowhorn schedule list
blowhorn schedule list --due-only
```

Check every activity against the supported schema before it costs you a pass:

```bash
blowhorn schedule validate
```

Seed an empty schedule with the starter set. It refuses a schedule that already
holds activities unless you pass `--replace`, which deletes them all first:

```bash
blowhorn schedule bootstrap --dry-run
blowhorn schedule bootstrap
```

Run one pass by hand, or force one activity now:

```bash
blowhorn schedule tick --profile all
blowhorn schedule trigger-now 4
blowhorn schedule trigger-now 4 --ignore-risk
```

`trigger-now` names a Risk Profile hold, including while the profile is warming
up, and does not run until you confirm or pass `--ignore-risk`. A limit the
platform publishes still applies.

Read or write a single activity. Activity numbers are stable: they are assigned when a
activity is created and never reused, so a number you noted keeps meaning the same
activity:

```bash
blowhorn schedule get 4
blowhorn schedule upsert --payload '{"Command": "post", "Profile": "all", "Recurrence": "daily"}'
blowhorn schedule delete 4
```

`upsert` and `delete` accept the fingerprint `schedule get` returns, and refuse
a stale edit rather than writing over someone else's change.

To move a job, change its `Run At`. Its next run moves with it unless the same
payload sets `Next Run At` itself.

An activity that has completed or given up has no next run in `schedule list`.
Giving it a new time - a `Run At` that changes, or a `Next Run At` - runs it
again: the same write sets its `Status` back to `scheduled` and its `Retry
Count` to 0, so it gets its full `Max Retries` again, and keeps its `Last Run
At`, `Last Error` and `Last Log Path`. Raising `Max Retries` alone does not run
it again, and a payload that sets `Status` itself decides the status instead.

```bash
blowhorn schedule upsert --activity 4 --payload '{"Run At": "2026-10-20 09:00:00"}'
```

## What a job can run

A job runs one Blowhorn command with its own profiles, platforms and
parameters. `post`, `comment`, `follow`, `accept`, `withdraw`, `analytics`
and `report` are schedulable. `find` is not:
it prints search results and changes nothing.

`Recurrence` takes `once`, `hourly`, `daily`, `weekly`, `monthly`, or
`every:<minutes>` for a minute count. A job whose profile is `all` runs for
every profile except the excluded ones; name a profile in the activity to include an
excluded one for that job only.

Each pass writes a per-job log under `<log-dir>/scheduler/`, records its
heartbeat so `blowhorn schedule status` can report it, and appends one line per
pass to the run ledger. When the pass cannot reach your account it claims nothing,
exits 3, and says so in one line.

One activity can run under its own rules of engagement while the rest run under the
profile's choice: see [One activity on its own rules of engagement](/docs/how-to/settings/choose-your-rules-of-engagement/#one-activity-on-its-own-rules-of-engagement).

## Related

- [Pause and resume posting](/docs/how-to/schedule/pause/) - stop every claim without stopping the service
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - read one activity's state in one command
- [Keep posting when the app is closed](/docs/how-to/schedule/background-service/) - the background service that runs the passes
- [Change your defaults](/docs/how-to/settings/defaults/) - pace, excluded profiles, logs
- [You're in control](/docs/explanation/youre-in-control/) - the limits every scheduled job runs under

