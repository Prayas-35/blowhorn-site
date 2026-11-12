# Accept incoming invitations


> Answer received LinkedIn invitations; flagged ones are skipped.



Answer the LinkedIn invitations other people sent you with
`blowhorn accept`. It walks your received list accepting one invitation at
a time, with a pause between each.

```bash
blowhorn accept --profile personal --dry-run     # preview: accepts nobody
blowhorn accept --profile personal               # accept up to 20
blowhorn accept --profile personal --limit 5     # cap a single run
blowhorn accept --profile all --headless       # every eligible profile, unattended
```

## What `--limit` counts

Confirmed acceptances: only an invitation confirmed gone from the
received list counts. A click is not an acceptance, and an invitation
skipped because LinkedIn warned about it never consumes the budget.
`--limit 0` means no limit: the run stops at the examination ceiling.
A real run that accepts nobody is recorded as `noop`, never `ok`, and a
scheduled activity that did so shows why in its Last Error. If the list
reads empty after a session check that only reads the page address,
cookies and page, the run reports an error saying the profile may need to
sign in to LinkedIn again.

## Flagged invitations are skipped, never accepted

An invitation LinkedIn flags with its "Take care when connecting" warning
is left alone, never accepted, and the run carries on. Skips are reported
by name, apart from acceptances. Ignoring or declining an invitation is
out of scope: this command only accepts.

## What a preview can and cannot tell you

`--dry-run` walks the same received list a real run would and stops where
clicking would start. What it cannot tell you is which people a real run
would skip: LinkedIn raises its warning only once Accept is clicked. The
preview says so rather than implying it lists only acceptable
invitations. It is bounded like the run it previews: it lists at most
`--limit` people, and says so with numbers when it stopped short.

Three invitations in a row that could not be accepted halt the run with
the halt reported: repeated non-confirmation means the page changed
underneath the run, and continuing would click blindly down a list.

## Related

- [Withdraw stale invitations](/docs/how-to/grow/withdraw-invitations/) - the sent list,
  the opposite direction.
- [Why flagged invitations are skipped](/docs/explanation/invitation-safety/) -
  the rule behind the skip.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the LinkedIn session the walk runs with.

