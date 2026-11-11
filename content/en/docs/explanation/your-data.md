---
title: "Where your data lives"
description: "What stays on your computer, what your account keeps in sync, and what the extension reads."
weight: 281
---


Three places hold Blowhorn's data, and each holds a different kind.
Nothing here is a step; for the sharing behind it see
[How Blowhorn works](/docs/explanation/how-it-works/).

On your computer: the app with the engine it carries, the engine's folder
(`~/Library/Application Support/Blowhorn/home`, or a contributor's checkout),
and your browser sessions.
Browser sessions, meaning the cookies your browser keeps for LinkedIn, X,
Reddit and Hacker News, live in your Chrome profiles, where you made
them; Blowhorn reads them there and copies none of them elsewhere, with
one exception: a Slack workspace session you capture is kept in your account, below. Every
password, token and app password a run signs in with is a credential in
your account, never a file on your computer. Every action
Blowhorn takes runs on one of your computers; Blowhorn never signs in or
acts for you from a server. The daily
logs, the run ledger copy, and the scheduler heartbeat live under the
log directory. The sign-in to your account lives in your keychain, or in a 0600
`cloud-token` file beside `cloud.yaml` outside the engine's folder. A plan attestation, once fetched, is kept in your keychain
for the offline grace.

In your account: the content activities, the schedule, the
profiles, the ledgers, the run history, and the analytics. Keeping them
in one account is what lets you install Blowhorn on any number of computers,
your own or your teammates', and run them as one: every computer works from
the same queue, and the computers coordinate through it, so the same post
isn't sent from two of them, and your analytics cover every computer. Your account holds platform credentials too: GitHub tokens, Hacker News
passwords, and Slack tokens and captured sessions. For profiles set up
before October 2026, it also holds the LinkedIn, X, Reddit and Bluesky
passwords copied in when those profiles moved to your account. It records
which Google Chrome profile each Blowhorn profile uses on each computer: the computer's
name, the Chrome profile's folder and display name, and the Google
account signed in to that Chrome profile. A computer that isn't signed in to your account runs nothing.

On the platforms: whatever Blowhorn published, amplified, or followed
as you, under your name, subject to each destination's own retention.
A published post is the platform's copy; Blowhorn keeps the link and
the outcome, not the content's master.

The extension queries tabs only on the supported sites and reads
cookies there only when the app asks, handing both to the Blowhorn app
on your computer. Every action Blowhorn takes is executed on one of your computers,
through your Chrome profile or a platform's API; your account keeps the
queue and results in sync and does not act for you from a server. The
one browser session the app keeps in your account is your Slack workspace
session, saved as that profile's Slack credential.
Platform credentials such as tokens and passwords are a different
matter: they live in your account, as the
[privacy page](https://blowhorn.ai/legal/privacy/) describes. What a run records, such as a new post's link and its
outcome, goes to your account as described above. The extension makes no
requests of its own to any server, sells nothing, and injects no ads.
The [privacy page at blowhorn.ai](https://blowhorn.ai/legal/privacy/) states the same promises; this page
follows it, and the privacy page wins on any difference.

What never belongs in a report, an issue, or a chat message:
credentials, session files, the sign-in (`cloud.yaml`, the `cloud-token` file), and anything
from your Chrome profile directories. A refusal sentence and an exit
code are enough to diagnose with.

## Failure reports

When the app or the engine hits a failure you can see - a tray
warning, a popover or console outage line, a setup connection check
that fails - it queues a failure report on your computer, once per
failure cause per day. Nothing leaves your computer until Blowhorn offers a place to send it to; until then the queue is local
only, and `blowhorn diagnostics show` prints exactly what would be
sent. A sent report is anonymous: it carries no account name, no
email, and no post text.

A report carries exactly these fields: a report id, when the failure
happened and when it was first seen that day, how many times it
happened that day, the app (its kind, version, build and channel),
your operating system (name, version and architecture), the failure
(its surface, its cause name, its code, a redacted one-sentence
message, and how many scheduler ticks it skipped), the schema
contract versions this build speaks, and - only while you are signed
in - the installation id for your account. It never carries a config
file, a log, browser data, a platform account name, a profile name, a
path, a token, or an email. Host names in the message are reduced to
"cloud" or "custom" before anything is queued.

Cloud keeps a sent report for 90 days, then deletes it. A report you
queue is cleared from your computer once Cloud accepts it; one Cloud
refuses stays queued and is retried with a growing delay, at most a
day apart.

You can turn reports off: Settings has a "Send failure reports" row,
and `blowhorn config set defaults.diagnostics.enabled false` does the
same from the command line. Off means nothing is queued or sent.
The contact support dialog, at a failure line, sends a separate
message only when you submit it: a category, your message, and your
email only if you typed one in, plus the report id only if you left
"include the failure report" checked.

## Anonymous usage data

Separately from failure reports, your Blowhorn account has a setting for
anonymous usage data, **Share anonymous usage data for product
improvement**. It is on until you turn it off, and it is kept in your
account rather than on one computer, so every computer you use Blowhorn on
follows it.

Today this is a preference and nothing more: Blowhorn records your choice
and checks it, but does not collect or send usage data yet. When sharing is
on, Blowhorn may share anonymous usage data, such as which features run and
how often, so we can see what to improve. It would never include what you
post or send, your credentials or sign-in, platform account names, or the
contents of any page Blowhorn drives. With the setting off, none is shared.
To change it, see
[Turn anonymous usage data on or off](/docs/how-to/settings/share-usage-data/).

## Public activity

Your account also has one setting for whether completed runs can appear in
the public activity feed on blowhorn.ai: **Share my activity publicly**. It
is on until you turn it off. On, a completed run can appear in that feed,
linked to your profile only when your profile is public. Off, your activity
stays visible only inside your org. The setting is kept in your account, so
every computer you use Blowhorn on follows it. To change it, see
[Share your activity publicly or keep it in your org](/docs/how-to/settings/share-activity/).

## Related

- [Get help](/docs/reference/support/) - report a problem without secrets.
- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - the log directory listing.
- [Profile reference](/docs/reference/profiles/) - which secrets live where.
- [Chrome extension permissions](/docs/reference/extension-permissions/) - what the extension may read.
