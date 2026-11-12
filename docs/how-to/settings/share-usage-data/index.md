# Turn anonymous usage data on or off


> Choose whether your Blowhorn account shares anonymous usage data for product improvement, in the app or from the command line.



Your Blowhorn account has one setting for anonymous usage data. When it is
on, Blowhorn may share anonymous usage data, such as which features run and
how often, to help us decide what to improve; with it off, none is shared.
Blowhorn does not collect or send usage data yet - the setting records your
choice ahead of that. It is **on** until you turn it off. What it covers, and
what it never covers, is under
[Anonymous usage data](/docs/explanation/your-data/#anonymous-usage-data).

The setting belongs to your account, not to one computer, so every computer
you sign in to Blowhorn on follows it.

## In the app

1. Open **Settings** from the account menu.
2. In the Privacy card, switch **Usage sharing** off (or back on).

The line under the switch says your choice is saved and that no usage data is collected yet. The info button beside Usage sharing explains the choice, and that failure reports stay a separate setting in Posture.

The switch saves to your account straight away. While your account cannot
be read (you are signed out or offline) the switch is disabled and shows the
default, on; nothing is saved later on your behalf. To change it, sign in and
get online, then come back to Settings and use the switch.

## From the command line

Show the current setting and whether your account holds it or it is the
default:

```bash
blowhorn auth anonymous-usage-stats
```

Turn it off, or back on:

```bash
blowhorn auth anonymous-usage-stats --off
blowhorn auth anonymous-usage-stats --on
```

Both need you to be signed in (`blowhorn auth login`). Add `--dry-run` to see
what would change without saving anything.

## Not the same as failure reports

Failure reports are a separate setting, **send failure reports** on the
Posture screen, described under
[Failure reports](/docs/explanation/your-data/#failure-reports). Turning
one off leaves the other as it is.

## Related

- [What Blowhorn keeps, and where](/docs/explanation/your-data/)
- [`blowhorn auth`](/docs/reference/cli/auth/) - every flag of `auth anonymous-usage-stats`.

