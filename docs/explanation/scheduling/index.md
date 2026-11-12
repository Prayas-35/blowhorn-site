# How scheduling works


> Ten-minute passes, one shared queue across computers, leases, and the three pause scopes.



Posting on autopilot means a pass that runs without you, a queue every
computer can share, and pauses that mean what they say. This page explains
the arrangement; the words and commands are in
[Job options and schedules](/docs/reference/jobs/).

> **The Major says:** "One awake computer, set up for the profile. That's all the schedule needs."


The service runs a pass whenever something is due, and at least once a
minute otherwise. A pass claims the activities that are due, runs them one
at a time, writes the ledger, and the service sleeps until the next due time
or the next minute, whichever comes first. A pass that finds nothing due
costs one short check of the schedule and changes nothing. Saving a routine
on this computer wakes the service at once. The service owns the passes while
the app is closed; your terminal owns the run you start by hand, which never
waits for a due time.

Several computers share one queue through leases, not locks. A claimed activity
says running with a lease timestamp, and the holder renews the lease
as it works. An activity whose lease lapsed is some dead computer's, and the
next pass reclaims it. That is why an activity's Status never reads as a
lock, and why two computers never work the same activity: the claim statement
reads the lease alone, atomically, and only one claimant wins it.

Reclaiming is not re-running. An activity a claim finds still saying running
was started by the run that died, and that run may already have acted before
its computer went away. Nothing records how far it got. So the reclaiming
pass does not run it: it moves the activity's next run on, writes the reason
into its Last Error, and leaves the action to a person. Check whether the
action went out; if it did not, `blowhorn schedule trigger-now` runs the
activity anyway. It warns only while the activity still says running; once a
pass has skipped it, the reason is in Last Error instead. A once-only activity that is
skipped this way is marked completed, with the reason in Last Error, rather
than left armed to be skipped on every pass. A claim that was taken
but never started never got the word running written on it, and that activity
runs as normal.

Three pause scopes cover the three reasons to stop. This computer's
file stops this computer and nothing else, for maintenance on one computer.
The organization-wide pause stops every computer sharing your account, with a
reason every banner repeats. One activity's pause holds that activity everywhere
until resumed. An activity is claimed only when none of the three says
paused, and quitting the app touches none of them: pausing is always
explicit, resuming always named.

An activity that did not run is never a mystery. `schedule why` reads the
claim the pass would make: paused at some scope, not yet due, lease
held by a living run, or eligible and waiting for the next pass. The
popover says the same thing in fewer words: due now, running, paused,
or needs you.

## Related

- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - create and edit jobs.
- [Pause and resume posting](/docs/how-to/schedule/pause/) - the pause scopes in practice.
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - read `schedule why`.
- [Job options and schedules](/docs/reference/jobs/) - recurrence words and scopes.
- [What runs when the app is closed](/docs/explanation/distribution/) - the service behind the passes.
- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - the Routines view of Activity.
- [Collect and read your analytics](/docs/how-to/measure/analytics/) - read what the passes produced.
- [You're in control](/docs/explanation/youre-in-control/) - pause, one job at a time, one computer per job.

