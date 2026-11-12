# Why flagged invitations are skipped


> A flagged invitation is LinkedIn warning you, so Blowhorn walks away instead of confirming.



Some invitations arrive with a warning, and the only safe answer to a
warning is to walk away. When LinkedIn is unsure you know the person,
accepting opens a "Take care when connecting" dialog offering to view
the profile or accept anyway. That dialog is LinkedIn telling you it
does not think you know this person. Clicking through it would defeat
the only warning there is.

`blowhorn accept` therefore dismisses the flagged invitation and skips
it entirely, never confirming it, and carries on with the rest. Accepts
and skips are reported separately, by name, so the skipped ones stay
visible instead of vanishing into a count. Ignoring or declining is
out of scope: the command only accepts, one at a time, with a
randomized pause between each.

This is the same rule the whole product follows: a public action is
never taken on a guess. A flagged invitation is LinkedIn saying it is
guessing about the person; acting anyway would spend your account's
standing on that guess.

## Related

- [Accept incoming invitations](/docs/how-to/grow/accept-invitations/) - the command in practice.
- [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/) - never act on a guess.
- [Messages and exit codes](/docs/reference/messages/) - what the run reports.
- [LinkedIn](/docs/reference/platforms/linkedin/) - LinkedIn actions and limits.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Withdraw invitations](/docs/how-to/grow/withdraw-invitations/) - the outgoing side.

