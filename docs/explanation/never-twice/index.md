# How Blowhorn avoids repeat posts


> One click per run, preview first, and what clicked-outcome-not-read means.



A public action cannot be taken back, and a guess repeated is spam.
Blowhorn therefore clicks once per run and records exactly what it
read: posted where it read a confirmation, clicked where it did not,
and never "not sent" once the control was clicked.

> **The Major says:** "One click per action. If I'm not sure it landed, I report it and wait for you."


Preview first. `--check-queue` lists what a run would do, and
`--dry-run` walks it end to end, without publishing, following, or
writing anything. A Hacker News activity gets both before its first real
run, because its landing is permanent.

One click per run. The sending control is clicked a single time; there
is no retry click. "No confirmation, the dialog still reads open"
reports the activity not sent and stops. The page a flow started on is never
the new post's link: a reader that starts on a post refuses it at every
rung and records no link rather than the wrong one.

"Clicked, outcome not read" is the honest middle. Once the control was
clicked, the absence of a confirmation is no reading of "nothing went
out", so the run records the click, counts nothing, writes no
promotion link, and leaves the activity out of the pending set without
marking it done. A person left in that state is held the same way:
recorded, kept off the drain, and listed at the start of every run
until settled. Neither a retry nor a drop is a run's to decide.

A lost write-back is recorded the same way. A post whose account
write-back fails is not spooled anywhere: the activity stays pending in
form but carries the unread stamp, LinkedIn amplify re-checks before
acting, and any other platform risks a duplicate on re-run.

Within a run, Blowhorn doesn't retry a failed post; it moves on to the next item. If a post goes out but Blowhorn can't record it, it stops that profile's queue rather than risk posting twice. Scheduled jobs only re-run a failure if you turn on retries, and they're off by default.

## Related

- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - check before publishing.
- [Content queue columns and activity states](/docs/reference/content-queue/) - the unread state.
- [Messages and exit codes](/docs/reference/messages/) - what the sentences mean.
- [Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/) - permanence first.
- [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/) - why no retry click.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.

