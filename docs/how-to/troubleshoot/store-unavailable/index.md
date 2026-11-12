# Fix cannot reach your account


> What to do when a command says it cannot reach your Blowhorn account and exits 3.


Every command that needs your Blowhorn account prints one sentence and exits 3
when it cannot use the account. Your profiles, content items, schedules and run
history live in your account, not on this computer, so there is no local copy
to fall back to. A tick in that state claims nothing and runs nothing, but still
writes its heartbeat, so `blowhorn schedule status` keeps answering with your
account as the last tick saw it.

## Check the connection

Ask now. `schedule status` never asks, because the app polls it every 15
seconds:

```bash
blowhorn store
```

Its `cloud` line either says `Connected to Blowhorn.` and the command exits 0,
or names the cause and the command exits 3. Find that sentence below.

## Fix the cause

| `blowhorn store` says | Do this |
| --- | --- |
| `Not signed in to Blowhorn. Sign in to continue.` | Run `blowhorn auth login`, or sign in from the app. |
| `Blowhorn refused the sign-in. Sign in again to continue.` | Your sign-in expired or was revoked. Run `blowhorn auth login` again. |
| `Your Blowhorn account is not a member of the selected organization.` | Sign in with the account that belongs to the organization, or run `blowhorn auth switch-organization` to pick one of yours. |
| `Update Blowhorn ...` or `Blowhorn's server speaks contract ...` | This build is too old for the server. [Update Blowhorn](/docs/how-to/manage/update-blowhorn/). |
| `Blowhorn is unreachable.` or `Blowhorn answered HTTP ...` | Check this computer's network, then run `blowhorn store` again until it answers. |
| `This Blowhorn server does not serve the store routes yet.` | The server you are signed in to is older than this build. Nothing on this computer fixes it; tell your Blowhorn contact. |

Once `blowhorn store` answers, ticks resume claiming on their next pass. Due
times carried forward while your account was out of reach, so a recurring
activity runs once, not once per missed interval.

Blowhorn no longer offers a local or self-hosted store. Settings for one left
in `.blowhorn.yaml` or `~/.config/blowhorn/store.yaml` by an older version are
not read, and nothing stored there is brought into your account.

## When Blowhorn asks you to slow down

Blowhorn limits how many requests each account makes per minute. Over
that rate it asks for a pause instead of answering. Your account is not down.
Blowhorn waits the time it is asked to, up to a minute, and tries again on its
own. A command that is still refused after that prints

```text
Blowhorn is rate limiting this account (schedules); retrying in 5s.
```

and exits 3. The app says "Blowhorn asked this computer to slow down for
a moment. It will retry on its own." There is nothing to fix: the next
pass tries again. Run records waiting in the spool go back a few at a time, in the
order they were written, and stop at the first refusal, so the records behind
it wait their turn rather than being lost or reordered.

## What the run did while your account was out of reach

Run records waited in the local spool and replay on the next pass or run that
reaches your account, which prints how many it replayed. To send them now:

```bash
blowhorn store --replay-spool
```

Commands that never need your account kept running throughout.

## Related

- [Create a Blowhorn account](/docs/how-to/set-up/create-an-account/) - sign up or sign in
- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - what a tick does when your account answers
- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - read one activity after the outage
- [Troubleshooting](/docs/how-to/troubleshoot/troubleshooting/) - start from a symptom instead

