---
title: "Share your activity publicly or keep it in your org"
description: "Choose whether your completed runs can appear in the public activity feed, in the app or from the command line."
weight: 191
---


Your Blowhorn account has one setting for activity visibility. When it is
on, your completed runs can appear in the public activity feed on
[blowhorn.ai](https://blowhorn.ai), linked to your profile only when your
profile is public. When it is off, they stay visible only inside your org.
It is **on** until you turn it off.

The setting belongs to your account, not to one computer, so every computer
you sign in to Blowhorn on follows it.

## In the app

1. Open **Settings** from the account menu.
2. In the **Privacy** card, under **Share anonymous usage data for product
   improvement**, switch **Share my activity publicly** off (or back on).

The switch saves to your account straight away. There is no separate save.
While your account cannot be read (you are signed out or offline) the switch
is disabled and shows the default, on; nothing is saved later on your behalf.
To change it, sign in and get online, then come back to Settings and use the
switch. If a save does not stick, the switch returns to where it was and the
card says why.

## From the command line

Show the current setting and whether your account holds it or it is the
default:

```bash
blowhorn auth share-activity-publicly
```

Turn it off, or back on:

```bash
blowhorn auth share-activity-publicly --off
blowhorn auth share-activity-publicly --on
```

`--json` prints the same facts for a script. `--dry-run` with `--on` or
`--off` reads the account and sends nothing.

## Related

- [Turn anonymous usage data on or off](/docs/how-to/settings/share-usage-data/) - the other switch
  in the Privacy card.
- [`blowhorn auth`](/docs/reference/cli/auth/) - every flag of `auth share-activity-publicly`.
