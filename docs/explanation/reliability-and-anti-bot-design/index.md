# How Blowhorn paces itself


> Measured typing and pauses, per-run pace, and why a failed post is not retried.



Blowhorn works at a measured pace, and stops at the first thing it
cannot confirm. Both are deliberate: speed and retries are what get an
account flagged.

> **The Major says:** "Nobody can promise you won't get flagged. I can promise I won't rush, won't repeat myself and won't touch your CAPTCHA."


Typing arrives keystroke by keystroke, and how the gaps between keys
are shaped depends on the path. Where Blowhorn types through the
page's own keyboard, each entry follows a plan: a computed delay
between keys, short hesitations, a longer pause every so often, and
an occasional typo typed and corrected. Through the Chrome
extension, the default driver, typing is one character per message
with a shaped delay between characters: each gap is drawn from a
right-skewed distribution around the computed delay and stretches
after a word or a sentence ends. The extension path does not insert
the plan's extra pauses and does not type-and-correct typos. In
background mode those same per-character messages are sent as real
key events through the browser's debugger, on that same cadence, and the
field is read back afterwards; in classic mode the extension writes
each character into the field directly, which is why the flows that
read a page's own input handling (X posting and sign-in among them)
only run in background mode. Actions
are separated by random pauses of a few seconds, scaled by the run's
pace. `--pace` sets it: `fast`, `normal`, `slow`,
or a numeric multiplier, resolved from the flag, then the environment,
then the defaults file. A long unattended run earns the slow pace; a
failure never earns a retry click.

That pace can also come from your rules of engagement: Safety on,
Weapons tight or Weapons free (stored as `cautious`, `standard` and
`brisk`) set pace, spacing, caps, quiet hours, outreach, the pause
after a sign-in challenge and how much runs at once, together, so you
do not have to set each dial by hand. Safety on is the slowest and
most guarded, Weapons free the fastest and least guarded, Weapons tight
the default in between. See [You're in control](/docs/explanation/youre-in-control/#your-rules-of-engagement)
for the rules of engagement among every safety control, and the
[configuration reference](/docs/reference/configuration/#risk-profile-presets)
for what each preset sets, dial by dial.

Clicks and scrolls are plainer than the typing, and this page will
not dress them up: a click moves the pointer straight to a point
that varies inside the target, presses, holds briefly and releases,
with no curved path across the screen, and a scroll is a single
wheel movement of the full amount asked for, never a series of
smaller ticks. The pacing here is about timing, not about imitating
the path a hand takes.

Public actions are never repeated on a guess. The sending control is
clicked once per run; "no confirmation, the dialog still reads open"
reports the activity not sent, never sends it again, and never reports it
sent either. What the platform showed after the click is a reading, not
a fact, so the activity reads clicked, outcome not read, and waits for you.
See [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/).

A typing failure fails only its own activity. The dispatcher has no
per-activity rescue around the loop, so a lost typing target would abandon
every remaining queued activity for that profile; every call site therefore
contains the failure to its own unit of work instead.

Within a run, Blowhorn doesn't retry a failed post; it moves on to the next item. If a post goes out but Blowhorn can't record it, it stops that profile's queue rather than risk posting twice. Scheduled jobs only re-run a failure if you turn on retries, and they're off by default.

Pointer and keyboard input look like a hand's. A click does not jump to its target: the pointer crosses to it
along a gently curved path, quickly in the middle and slowly at both ends, reporting a position every few
milliseconds, and each key stays down for a short, varying time before it is released. The Chrome extension sends
these as real input events, the same kind a mouse and keyboard produce, and Blowhorn turns off every
browser-masking tweak that would make Chrome report itself differently from how it really is.

## Hacker News is the least forgiving platform

A Hacker News submission cannot be deleted, and coordinated-looking
promotion gets the whole domain banned. Blowhorn treats it
accordingly: at most 2 link submissions per profile per UTC day, titles
held to 80 characters with the activity failing rather than truncating, no
voting ever, and a comment activity that can only ever be a comment. A
rate-limited run fails the activity and waits; it never retries to beat the
limiter.

## Related

- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - pace your run.
- [Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/) - the strictest rules, worked.
- [Platforms](/docs/reference/platforms/) - per-platform limits.
- [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/) - one click per run.
- [Change your defaults](/docs/how-to/settings/defaults/) - the pace default.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Blowhorn Tells](https://tells.blowhorn.ai/) - a free check of what sites can see about your browser.

