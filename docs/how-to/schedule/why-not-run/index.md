# Find out why a job did not run


> Ask Blowhorn why one scheduled activity ran or not, in one read-only command.



One command names the reason an activity has or has not run on this computer, in the
order the scheduler itself decides it, and ends in one plain sentence:

```bash
blowhorn schedule why 7
```

```text
activity 7 · post · your-profile · linkedin

  enabled        yes
  valid          yes
  paused         no - activity not held, studio not paused, all-machines not paused
  due            yes - next_run_at 2026-08-31 06:00:00, 14 min ago
  claimed        yes - laptop:9912 since 2026-08-31 06:02:10, lease expires 2026-08-31 06:32:10
  this machine   studio · store reachable · last pass 2026-08-31 06:14:02 (2 min ago)
  last run       2026-08-30 06:03:11 on laptop · ok · 12 attempted, 12 confirmed

studio did not run activity 7 because laptop:9912 claimed it at 2026-08-31 06:02:10 and still holds the lease (expires 2026-08-31 06:32:10).
```

Read it top to bottom: enabled, valid, paused (naming the scope and how to lift
it), due, claimed, this computer, last run. The closing sentence is the answer;
quote it in a bug report with `--json` for the same answer scripts can read.

## What the common answers mean

- **Paused.** The scope is named: the activity, this computer, or all computers. Lift
  it with `blowhorn schedule resume`, with `--all` or `--activity 7` to match.
- **Claimed by another computer.** A claim is a lease, not a lock: the holder
  renews it while the job runs, and a dead computer stops
  renewing, so its activities return to the pool when the lease lapses. `schedule
  list` names every holder in its Locked By column; your own claims read
  `(this machine)`. Another macOS user's claims on the same Mac do not: they
  share the computer's name, not your install.
- **Not due.** `Next Run At` has not passed yet. The service wakes for it when it
  comes; `schedule status` says whether the service is still passing over the
  schedule on this computer.
- **Gave up.** The last run used the activity's final retry, so it is `failed`
  with no next time. For a repeating activity the whole series has stopped -
  deliberately: repeated failures usually mean a broken sign-in or a platform
  checkpoint, and retrying on the recurrence risks the account. Give the
  activity a new time to restart it (the series, if it repeats) with a fresh
  set of retries.
- **Invalid.** `blowhorn schedule validate` names what the activity breaks.
- **Out of date.** `schedule status` names the cause `app_outdated`: the
  server's minimum app version is newer than this build, so the pass
  claims nothing and every activity stays due. Update Blowhorn
  ([Update Blowhorn](/docs/how-to/manage/update-blowhorn/)) and the next pass
  claims again; nothing is lost, because due activities are not
  consumed by a pass that refuses to claim.

The command is read-only: it claims nothing, runs nothing and changes nothing,
so it is safe against an activity that is mid-flight.

## Related

- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - create activities and run passes by hand
- [Pause and resume posting](/docs/how-to/schedule/pause/) - lift the scope that holds the activity
- [Review what ran](/docs/how-to/measure/review-runs/) - the ledger behind "last run"
- [Troubleshooting](/docs/how-to/troubleshoot/troubleshooting/) - start from a symptom instead

