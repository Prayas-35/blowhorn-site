# Messages and exit codes


> Every refusal sentence keyed by its first words, with the cause, the fix, and the exit code.



What a failed run prints, why, and what fixes it. Entries are keyed by
the sentence's first words. Exits: 0 ran clean; 1 the run failed; 2 the
invocation was wrong; 3 your account was unreachable. A run cancelled
at a safe point (between passes, or by Stop in the side panel) exits 75.

## Your account

A run that needs your account and cannot reach it prints the cause's own
wording, then `error: store unavailable`, and exits 3. There is no
traceback. Check the connection and run again; nothing was published
and nothing was marked done.

Any other store error prints its own sentence and exits 1. A ledger
write your account refuses names the person and stops the run before its
next platform action, so the run halts rather than acting without
recording.

## Eligibility and plans

A profile you named that is eligible for nothing in scope stops the run
with the reason and exits 1. `--profile all` skips such profiles
quietly instead. A run the organization's plan does not cover exits 1;
an unknown `BLOWHORN_ENTITLEMENT` value is refused by name rather than
read as off. Dry runs are never refused: they publish nothing. See
[Plans and limits](/docs/reference/plans/).

## Chrome and the extension

`another blowhorn run holds the Chrome extension bridge (pid ...)`: two runs want
the extension at once, and the message names the holding run's pid.
Wait for the other run or stop it; this run did nothing. A holding run
that stops sending its heartbeat is released automatically after
30 seconds.

`chrome refused the connection (Allow was declined ...)`: the attach
handshake did not complete. Keep a Google Chrome window open, approve the
Allow dialog, and run again. In a scheduled pass the Allow window is
short; prefer the extension default.

`extension_outdated` with two versions: the installed extension is older
than the run needs. Reload or update the extension and run again.

`error: chrome unavailable (blowhorn-engine-NNNN)`: Chrome was not
running, Blowhorn opened it for the run, and the start did not get as far
as the extension. The sentence above the summary says what happened and
what to do, and the code names the case; the codes are listed under
[Opening Chrome when it is closed](/docs/reference/chrome/#opening-chrome-when-it-is-closed).
Exit 1.

`Chrome didn't respond. Make sure Chrome is open with the Blowhorn extension, then try again.`:
a scheduled run's Chrome extension did not answer in time. Last Error shows
this sentence. The log keeps the raw timeout line. Open Chrome with the
Blowhorn extension and try the activity again.

`The Chrome profile for <profile> isn't connected to Blowhorn.`: the activity's
Chrome profile has no connected Blowhorn extension. Connect that profile, then
run again. This is separate from a timeout.

`error: page did not load`: Google Chrome was running. LinkedIn did not
finish loading in the Blowhorn tab, or its received list could not be
read. The sentence above the summary says which, and nothing was done.
Run the activity again. Exit 1.

A profile with no Chrome mapping on this computer, a mapped directory
Chrome no longer has, or an identity that drifted since binding is
refused by name before anything opens, with the command that re-maps
it. There is never a fallback to another profile.

## Sign-in

`X session expired ... redirected to login page` and `Reddit session
expired ... redirected to login page`: sign in again in that Chrome
profile, by hand, then run again. `X rejected the credentials for
@...`: the stored username or password is wrong; fix it and run again.
A CAPTCHA or second-factor challenge always hands back to you; an
unattended run never waits. For X, see
[Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/).

## The queue and the schedule

`title is ... characters; Hacker News allows 80 ...`: shorten the
title to 80 characters; the activity failed rather than truncating because a
submission cannot be edited after it lands. `Rate limited: HN said
...`: Hacker News throttled the run; the activity failed, wait before
retrying, and never retry to beat the limiter.

`Unsupported Recurrence '...'` and `Invalid recurrence interval
'...'`: the schedule activity's word is not one Blowhorn knows; use `once`,
`hourly`, `daily`, `weekly`, `monthly`, or `every:N`. See
[Job options and schedules](/docs/reference/jobs/).

`Could not download the media: ...`: the activity's `Image URL`, `GDrive
Link`, or `Video URL` could not be fetched, and the sentence says why - the
host could not be reached after its retries, accepted the connection and sent
nothing for 30 seconds, took longer than 10 minutes to send the file, broke
off mid-transfer, answered with an HTTP error, sent a file over Blowhorn's cap
(25 MiB for an image, 1024 MiB for a video), or sent something that is not a
PNG, JPEG, GIF, WebP, HEIC, MP4, MOV, or WebM file (often a sign-in page: make
the link public or download it yourself). The activity fails and stays
pending; nothing was published, and the run goes on to the next activity. The
caps are Blowhorn's own, not a platform's limit.

An activity `clicked, outcome not read` is not an error: the sending control
was clicked and no confirmation was read back. Check the platform,
then clear "Date Promoted" to try again or leave it. See
[Content queue columns and activity states](/docs/reference/content-queue/).

## Failures inside Blowhorn

A failure Blowhorn has no specific sentence for still prints one sentence
and a `Details:` line, then exits 1. The `Details:` line names the error log,
`~/Library/Application Support/Blowhorn/logs/blowhorn-errors.log`. The log
holds the full error with anything that looks like a password, token or
cookie removed. Share that log when you report a problem. Add `--debug`, or
set `BLOWHORN_DEBUG=1`, to see the full error on the terminal as well.

`Blowhorn's browser engine didn't start, so nothing was done.`: the browser
engine bundled with Blowhorn exited before the run could use it. Nothing was
opened, sent or recorded. Update or reinstall Blowhorn and run again. See
[Fix Blowhorn when its engine won't start](/docs/how-to/troubleshoot/engine-wont-start/).
What the browser engine printed is in the error log, not on your terminal.

`Something went wrong inside Blowhorn.`: nothing more specific is known yet.
Run it again. If the same thing happens, share the log the `Details:` line
names.

## Related

- [Content queue columns and activity states](/docs/reference/content-queue/) - activity states including unread.
- [Job options and schedules](/docs/reference/jobs/) - recurrence words.
- [Plans and limits](/docs/reference/plans/) - plan refusals.
- [Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/) - expired sessions.
- [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/) - why a run stops instead of retrying.

