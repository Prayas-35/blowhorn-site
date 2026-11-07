---
title: "Choose your rules of engagement"
description: "Your pace. Your risk. Your call. What Safety on, Weapons tight and Weapons free change in your day, and which one to pick."
weight: 25
aliases: [/docs/how-to/settings/choose-your-risk-profile/]
---

Your rules of engagement are one choice for how hard and how fast
Blowhorn pushes on a platform. There are three:

| In the app | Means | Stored, in the CLI and the config file |
|---|---|---|
| **Safety on** | slow and careful | `cautious` |
| **Weapons tight** (the default) | normal pace, within the platform's own limits | `standard` |
| **Weapons free** | fast, and more noticeable to the platform | `brisk` |

The names are the military's weapons-control states, from most to least
restrictive; the plain words beside each say what it does, so you never
need the military meaning to choose well. One choice sets pace, pointer
movement, caps, spacing, quiet hours, outreach, the pause after a
sign-in challenge, retries and how much runs at once, together. The
headline is ownership-first - "Your pace. Your risk. Your call." The
app shows the new names; the CLI and the config file keep the stored
values (`blowhorn risk set cautious`, `defaults.risk_profile: cautious`,
`--risk-profile cautious`), and the reference still calls the setting
the Risk Profile, so old scripts keep working.

Choose it in the app on the **Posture** screen: the slider at the top is
the choice for everyone, a track from Safety on (slow end, in the
brand's teal blue) through Weapons tight (teal) to Weapons free (fast
end, in coral). The same choice shows as a mini-slider in
the menu-bar popover, which opens Posture, and changing it anywhere
changes it everywhere. Or use
`blowhorn risk set cautious`. `blowhorn risk show` says which preset is
in effect and where it came from, and `blowhorn risk grid` lists every
profile on every platform. Any single dial you set yourself wins over
the preset for that dial, and the rest of the preset still applies
around it; a profile with a dial set outside the preset is a custom
profile, not a fourth preset you can pick.

## Set one platform for everyone

To run one platform more carefully for every profile, for example
LinkedIn on Safety on while the rest stay on Weapons tight:

1. Open **Posture**.
2. In the grid, pick the chip in the **Each platform** row under
   **LinkedIn**. It opens a small slider: move it to **Safety on**.

Or, from Terminal:

```bash
blowhorn risk set cautious --platform linkedin
```

The choice is kept with your organization, so every computer you run
Blowhorn on uses it. If your organization cannot keep it yet, it is saved on
this computer only: the command says `scope: this_computer` with the reason,
the app says so in one line under the grid, and the chip's slider reads
**Set here, on this computer only**. Each grid cell shows only its rules of
engagement (Warming, Safety on, Weapons tight or Weapons free); hold the
pointer over a chip to see where its choice comes from. Your organization's choice for that platform comes
first, so when it already has one, the command says it still applies on
every computer and this computer's choice has no effect until an
organization admin clears it. Choose **Follows Everyone** under the same
chip's slider, or run `blowhorn risk set default --platform linkedin`, to
clear it.

## Set one profile, or one profile on one platform

- **One profile on every platform:** pick the chip in that profile's
  **Every platform** column and move its slider, or
  `blowhorn risk set cautious --profile company`. When a platform has its own
  choice, the slider's window says that the more careful of the two wins and
  names each platform that wins over this profile.
- **One profile on one platform:** pick that profile's cell under the
  platform, or `blowhorn risk set brisk --profile company --platform x`.

A chip you chose is filled; a dashed chip is inherited, and the line under
it says where it comes from ("from LinkedIn", "from this profile", "from
everyone"). To put a cell back, point at it and press its reset, or choose
**Inherit** in its menu; the menu names what it would inherit first. A
platform's or a profile's slider says **Set here.** with **Follows Everyone**
to put it back, or **Follows Everyone** and the preset it follows.

## Which choice wins

The more specific choice wins: one activity beats one profile on one
platform, which beats a platform's or a profile's choice, which beats
everyone's. **When a platform and a profile both have a choice, the more
careful one wins**, so "LinkedIn on Safety on for everyone" also slows a
profile set to Weapons free, and "X on Weapons free for everyone" never
speeds up a profile set to Safety on. To let one profile go faster on one
platform, choose its cell. A new profile or computer still runs under
Safety on for its first 14 days. The
full order is in
[Which choice wins](/docs/reference/configuration/#which-choice-wins).

An activity may set its own rules, and they may be looser than Posture
for that profile on that platform: Blowhorn keeps them as you set them.
The app marks a looser activity with a note in coral, such as "Looser
than Kara Linden on LinkedIn (Weapons tight)". The warm-up and each
platform's published limits still apply above it. A new order follows
Posture: its **Rules** row says which rules each profile and platform
will use, and you change them in Posture.

## Adjust the limits yourself

Under the grid, **The limits Blowhorn keeps** starts from the preset: change
the pace and daily caps per platform in the **by platform** table, and the
other limits below it, including typing and pointer timing, then **save
limits**. The header reads "Custom, based on Weapons tight, 3 dials changed" once
dials move, and **reset to preset** puts every dial back. No dial may exceed a
built-in ceiling: your own cap can only lower a ceiling, never raise it.
Two dials carry a driver note: pauses and mistakes run on the Playwright
driver only. The extension driver, which types through the Blowhorn
extension in Google Chrome, sends one key per message and runs no
pause plan, so on that driver it types with the shaped delay from the delay
band and no pauses or corrections. The full values are in the
[configuration reference](/docs/reference/configuration/#risk-profile-presets),
with a stable anchor per dial in
[Risk Profile dials](/docs/reference/configuration/#risk-profile-dials).

## Safety on (cautious): one thing at a time, nights off

Pick Safety on for a new account, a new computer, or an unattended run
you will not be watching.

- **Between actions:** at least 15 minutes, plus a random wait of up to
  15 minutes, between two public actions on one platform for one
  profile. A day of posting is therefore a slow trickle, not a burst.
- **How much per day:** a quarter of each platform's built-in ceiling.
  On LinkedIn that is 2 posts and 10 comments a day (before any cap
  you set yourself); on X it is 12 posts a day. Your own daily caps can
  only take these lower.
- **Nights:** nothing public from 22:00 to 07:00 local time. A due
  activity inside those hours waits until morning; it is not failed.
- **After a challenge:** if a platform shows a CAPTCHA, checkpoint or
  restriction page, that profile on that platform is held for 72 hours
  from the last such record.
- **Outreach:** off entirely - no connects, invites or follows.
- **At once:** at most 1 run, and one profile at a time on a platform.
  A second run is refused and names your cautious profile; its
  activities stay queued.
- **Retries:** a failed scheduled job is not retried.

## Weapons tight (standard): half the ceiling, with the guardrails on

Weapons tight is the built-in default, and the right choice when an account
is established and you want Blowhorn at a normal pace, held to half of
each platform's built-in ceiling.

- **Between actions:** no minimum spacing; pace still shapes typing
  cadence and the random pauses between actions.
- **How much per day:** half of each platform's built-in ceiling. On
  LinkedIn that is 5 posts and 20 comments a day; on X it is 25 posts a
  day, before any cap you set yourself or a warmup ramp.
- **Nights:** no preset quiet hours. A quiet window you name yourself
  with `defaults.quiet_hours` still holds scheduled claims.
- **After a challenge:** the profile on that platform is held for 24
  hours.
- **Outreach:** on for established platforms, off on platforms still
  being built (Facebook, Instagram, TikTok, YouTube).
- **At once:** one profile at a time on a platform, and no preset limit
  on runs overall. Setting `defaults.concurrency.max_runs` adds one.
- **Retries:** a failed scheduled job is not retried.

## Weapons free (brisk): fast, while you watch

Pick Weapons free for an established account you are watching, when you want
the most throughput and accept the most exposure.

- **Between actions:** no minimum spacing, and the fast pace.
- **How much per day:** the full built-in ceiling - Blowhorn's own
  estimate of a safe day, not a number the platform publishes. On LinkedIn
  that is 10 posts and 40 comments a day; on X it is 50 posts a day.
  Weapons free never raises a ceiling, and never goes past a
  [limit the platform publishes](#a-limit-the-platform-publishes-is-the-one-hard-stop); it only lifts the
  share the other two keep below it (a quarter, a half), along with Safety
  on's quiet hours, spacing and outreach limits.
- **Nights:** no preset quiet hours.
- **After a challenge:** the profile on that platform is held for 12
  hours - the shortest pause, so a challenge is the place Weapons free costs
  you the most caution.
- **Outreach:** on everywhere, including platforms still being built.
- **At once:** different profiles may share a platform, and no preset
  limit on runs overall. One profile is still held to one run on a
  platform.
- **Retries:** a failed scheduled job gets one retry. A login is never
  retried, and a retry is never granted for an unknown outcome.

## A new profile warms up under Safety on, whatever you chose

A new profile or a new Mac runs under Safety on for scheduled jobs until it
has history - 14 days, whatever preset you picked. Its caps ramp over
those 14 days, from about a quarter of Safety on's caps on day one
(about 1 LinkedIn post a day) to Safety on's full caps by day 14, and
only then does your chosen preset take over. A profile idle longer
than the 15-day ledger window warms up again. A run you start yourself
is not held by the warmup, only warned about, and it follows your
chosen preset's caps, quiet hours and outreach.

## If you are still unsure

- New account, or you will not watch it: Safety on.
- Established account, normal use: Weapons tight.
- Established account, you are watching, and you want the most done
  today: Weapons free.
- One account needs to be slower than the rest: set that profile or
  platform to Safety on, and leave the rest alone - the choice is per
  profile and per platform, not only computer-wide.
- One platform feels risky for everyone: set that platform to Safety on in
  the **Each platform** row.

## One activity on its own rules of engagement

One recurring activity can run under Safety on while everything else on
the same profile and platform runs under Weapons tight: open the
activity, open its **Rules** row and set **rules of engagement** (inherit
means the activity's own choice is blank, exactly as before); it saves as
you choose.
From the terminal the same value is `risk_profile=cautious` in the
activity's params. The Rules row then says the activity's own preset, and its
troubleshooting facts (under the Log row) say the preset and where it came from (`Safety on · this activity`, or `Safety on ·
inherits: LinkedIn × work profile`), and while the profile is warming
it also says what the tick enforces (`warming: runs Safety on for
now`). An activity without one profile and one platform names no
single preset; its targets resolve their own. For a single run you
start by hand, `blowhorn --risk-profile cautious post ...` overrides
everything for that run only.

An activity's own choice stays as you set it, even when it is looser than
the Posture page: an activity on Weapons free runs Weapons free while the
same profile is on Safety on everywhere else. (A choice on one order in New
order works the other way and can only tighten.) Two things still stand
above it: the 14-day warm-up, and a limit the platform publishes.

## A limit the platform publishes is the one hard stop

Where a platform publishes its own limit for an account, nothing in
Blowhorn goes past it: not an activity's own choice, not Weapons free, not
your own dials, not a setting in `.blowhorn.yaml` or the environment, not
`--ignore-risk` and not **do it now**. Blowhorn cuts any cap that would go
past one down to it, and says so: the run prints which setting asked for
more and the platform's page it read the limit from, and the routine editor
says `this routine stops at …` under **rules of engagement** when the preset
you pick would go past it. When the limit is already reached for the day,
the activity waits until it clears.

Only limits the platform itself publishes count, each with its page and the
day it was read:

| Platform | Limit | Source |
|---|---|---|
| X | 400 follows a day | X Help, "Understanding X limits" |
| X | 50 original posts and 200 replies a day, for an account without a checkmark | X Help, "Understanding X limits" |
| Bluesky | 1,666 records an hour and 11,666 a day - posts, likes, reposts, replies and follows together | Bluesky's "Rate Limits" guide |

The rest of the numbers on this page are Blowhorn's own estimates, and
there is no hard stop where a platform publishes nothing: LinkedIn,
Reddit, Hacker News, Slack and GitHub publish no per-account count for
what Blowhorn does. Platforms change these limits without notice, and
Blowhorn reads them again on a schedule.

## Related

- [Configuration reference](/docs/reference/configuration/#risk-profile-presets) - every dial, every preset value.
- [Risk Profile dials](/docs/reference/configuration/#risk-profile-dials) - one anchor per dial, for the desktop info buttons.
- [You're in control](/docs/explanation/youre-in-control/#your-rules-of-engagement) - the rules of engagement among every safety control.
- [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/) - measured pacing and the no-retry rule.
