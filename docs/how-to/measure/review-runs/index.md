# Review what ran


> Read the runs ledger: what each computer did, what failed, and what was a preview.



Every action run appends one line per profile and platform to the run ledger,
dry or real. Read it back in the app under Activity › History, newest first; a long
history comes a window-full at a time, and the arrows under the list turn the page.
Or read it grouped any way you like:

```bash
blowhorn analytics operations --group-by host
blowhorn analytics operations --group-by profile --since 7d
blowhorn analytics operations --kind tick
```

`--group-by` takes `profile`, `platform`, `command`, `day` or `host`: the
ledger has always recorded which computer a run happened on, so grouping by
host shows who did what across the computers sharing your organization. `--kind
tick` aggregates the scheduler's own passes instead of the action runs.

A dry run counts apart and never as an operation: a preview is not work done.
Records exist from the first run after this command shipped, so an older
window reports zero rather than history.

To re-run a failure, run its command again by hand, or choose "try again" on
it in the app under Activity › History; a dry run first shows what the retry would do.

## Related

- [Collect and read your analytics](/docs/how-to/measure/analytics/) - follower numbers, not operations
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - one activity's state in one command
- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - trigger an activity now

