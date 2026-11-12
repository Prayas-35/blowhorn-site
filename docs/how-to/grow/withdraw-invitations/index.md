# Withdraw stale invitations


> Preview and withdraw old sent invitations to reclaim headroom.



Reclaim invitation headroom with `blowhorn withdraw`. Sent invitations
never expire on their own: they pile up against LinkedIn's ceiling on
unaccepted invitations, and once that ceiling is near, new connection
requests start failing. An invitation unaccepted for three weeks is not
going to be accepted, so withdrawing it costs nothing and returns headroom.

```bash
blowhorn withdraw --profile personal                                     # preview, withdraws nothing
blowhorn withdraw --profile personal --apply                             # withdraw up to 20
blowhorn withdraw --profile personal --older-than 60 --limit 40 --apply
```

| Flag | Default | Meaning |
|---|---|---|
| `--older-than` | `21` | Minimum pending age, in days, for an invitation to be eligible |
| `--limit` | `20` | Maximum withdrawals **confirmed** in one run |
| `--apply` | off | Actually withdraw. Without it the run is a preview |

**Preview is the default.** Withdrawing is hard to undo: LinkedIn blocks
re-inviting a withdrawn person for up to three weeks. A preview withdraws
nothing. It lists each eligible invitation as name, profile URL, and
parsed age, and prints that three-week consequence. `--dry-run` forces
preview, so `--apply` with `--dry-run` still withdraws nothing.
`--limit 0` means zero withdrawals.

## People only

The sent list has People and Pages tabs, and the run works the People
tab. It proves that tab is selected before it acts, and does nothing at
all when it cannot prove it.

## How age is read

LinkedIn renders only relative ages ("19 hours ago", "3 weeks ago", "1
month ago"), so ages are parsed from that text. Coarse units count their
lower bound: a month counts 28 days, not 30, so an invitation is never
treated as older than it provably is. An age worded in a way Blowhorn
does not recognize is **kept**, counted, and reported as Unreadable: a
wording change on LinkedIn's side shows up as a number, never as silent
over-withdrawal.

## What counts

`--limit` counts confirmed withdrawals. A click that leaves the card
still listed is not a withdrawal: it is reported as Unconfirmed, is not
counted, and is left for a later run.

| Outcome | Meaning | Counts against `--limit`? |
|---|---|---|
| `WITHDRAWN` | read as gone from the list | **yes** |
| `TOO_NEW` | parsed age below the threshold | no |
| `UNREADABLE_AGE` | age text not recognized | no |
| `UNCONFIRMED` | acted on, still listed afterwards | no |
| `FAILED` | control missing or undeliverable | no |

Three outcomes in a row that are not a confirmed withdrawal halt the run,
and a halted run is reported as halted, never as success.

## Related

- [Accept incoming invitations](/docs/how-to/grow/accept-invitations/) - the received
  list, the opposite direction.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the LinkedIn session the walk runs with.

