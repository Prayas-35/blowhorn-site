# Failed posts are data: reading failure reasons and fixing the cause

A failed post is a report, not just a red mark. The reason on the activity names the cause, and the fix follows from the reason: re-sign in, shrink the run, fix the content, or wait out the platform. Retry only after a fix, never in a loop.


A failed post feels like the schedule breaking. It is usually the schedule talking. Every failure lands with a reason on the activity, and that reason is the most useful line in the whole run: it names the cause, and the cause names the fix. The expensive mistake is not the failure. It is retrying before reading.

## Read the reason first

Blowhorn puts the failure reason on the activity in plain language, not as a bare error code. Read it before you touch anything. Reasons fall into a few families, and each family points somewhere different:

- **Signed out or permission lost.** The platform no longer recognises the session, or a permission changed. Nothing about the post is wrong; the connection is. Re-sign in, then rerun.
- **A limit reached.** Daily caps, rate limits, too many posts too fast. The post is fine; the shape of the run is not. Shrink the batch and widen the spacing.
- **The content itself.** A link the platform will not accept, a format it no longer supports, an image that failed to upload. Fix the post, not the schedule.
- **The platform, not you.** An outage or a half-deployed change on their side. These clear on their own, and retrying into them only adds noise.

One failure is an accident. The same reason across a troop is a pattern, and a pattern is a policy or a broken connection, not bad luck. The reading-your-results article in this series covers the three patterns that matter on a finished activity; a repeated failure reason is the clearest of them.

## Fix the cause, not the symptom

Each reason has its own fix, and the wrong fix wastes the run:

- Session problems need a fresh sign-in, not a smaller batch.
- Limit problems need a slower, smaller run, not a corrected post.
- Content problems need an edit, not a retry. The same post will fail the same way as many times as you send it.
- Platform problems need patience. Wait, then run a small probe before restoring the full schedule.

If you cannot tell which family a reason belongs to, treat it as a content problem first: open the post, check the link and the format, and confirm the account is still signed in. That single check rules out the two most common causes in under a minute.

## The retry rule

Retry once, after a fix, and watch that single post land before restoring the troop. Never retry in a loop. A blind retry storm is how a limited account becomes a suspended one: the platform reads repeated identical failures as automation refusing to listen, and the pace article in this series explains why slowing down is the safer answer to a limit, not speeding up.

If the retry fails with the same reason, stop. The fix was wrong, or the cause is upstream. Pause the troop, note the reason, and come back with a different fix rather than a louder retry.

## Keep a failure note

A failure you write down once is a lesson; a failure you forget is a weekly surprise. When a post fails, note three things: the reason, the fix you tried, and whether it worked. After a month you have a small map of what actually breaks on your accounts, and the next failure takes minutes to place instead of an afternoon to diagnose. That monthly review habit is the subject of the last brief in this series, measuring a month of posting.

Failed posts are the cheapest feedback a schedule produces. A platform that refuses a post is telling you exactly what it wants, in writing, on the activity. Read it, fix it, retry once, and the failure has paid for itself.

This is the fifth article in the Product intelligence series. The first four covered reading your results, the scheduling craft, what happens when a platform changes the rules, and pace as a feature. Next: one subscription, five ways in, and getting the same work done from desktop, CLI, extension, MCP and scheduled troops.

