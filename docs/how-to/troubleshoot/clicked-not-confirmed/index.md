# Settle something Blowhorn could not confirm


> Check the platform after a clicked-unread activity, then clear it or leave it.



Blowhorn clicks a public action once per run and never clicks again on a
guess. When the click lands but nothing read after it confirms the outcome,
the run records `clicked, outcome not read` and stops. That record is a hold,
not a result: only you settle it, by looking at the platform yourself.

## A content activity

When no confirmation follows the click, `Date Promoted` carries `clicked,
outcome not read` with the time, no promotion link is written, and the activity is
not counted as posted. No later run posts it again. In the desktop app, the
activity's result reads `clicked, outcome not read` with `clicked` and the time
of the click, never `sent`.

1. Open the profile on the platform and check whether the post is there.
2. If it is there, record it on the activity so it stays done.
3. If it is not there, and you want a run to try the activity again, clear `Date
   Promoted` with `blowhorn content upsert`:

```bash
blowhorn content upsert --activity 12 --payload '{"Date Promoted": ""}'
```

Never clear the date on a guess. Clearing it re-queues the activity, and if the
first click did go out, the retry publishes it twice. When in doubt, leave the
activity held and ask for help instead of re-running it.

Once the sending control was clicked, the run never reports the activity as not
sent. "Not sent" is kept for runs where nothing was clicked at all.

## Related

- [Post to X when it will not confirm](/docs/how-to/troubleshoot/x-posting/) - what X shows after Post, and what to check
- [Troubleshooting](/docs/how-to/troubleshoot/troubleshooting/) - start from a symptom instead
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - when the activity never ran at all

