# Plans, offline use and lapses


> Why plans count profiles and platforms, the 72-hour offline grace, and why dry runs stay free.



Plans count what costs: profiles and platforms. Each posting identity
is someone's account acting, each platform a destination with its own
rules and risk, so "how many identities, where" is the honest meter.
Actions are never the meter: counting clicks would punish checking
before publishing, which is the behavior the whole product exists to
protect.

During early access there is one plan and it is free, with no tiers
and no limits. When tiers arrive they will differ in profiles and
platforms, and dry runs will stay free in all of them: a dry run
publishes nothing, and refusing it would charge for caution. See
[Plans and limits](/docs/reference/plans/).

The plan is checked at the moment of publishing, from an attestation
your account issued after sign-in. Enforcement is
off unless `BLOWHORN_ENTITLEMENT=required` is set in the environment
on your computer; it is a local switch, not an organization setting. With
it on, a real run without
a current attestation, or outside what the plan covers, refuses before
any browser opens. The check reads no queue and no browser: the answer
is already held, in the keychain, before the run starts.

With enforcement off, being offline changes nothing and nothing is
ever refused for it. With it on, offline use degrades by the clock,
not by features: a held attestation keeps publishing for 72 hours
while your account is unreachable; past that, publishing refuses until the
connection returns. Nothing else changes
offline: reading the queue, dry runs, and reports never needed the
plan and never ask for it. A lapse therefore reads as "not entitled,
reconnect", never as lost work: the activities wait, the ledger waits, and
the next connected run carries on where the last one stopped.

## Related

- [Plans and limits](/docs/reference/plans/) - what early access covers.
- [Get help](/docs/reference/support/) - questions about access and billing.
- [How Blowhorn avoids repeat posts](/docs/explanation/never-twice/) - why dry runs stay free.
- [Where your data lives](/docs/explanation/your-data/) - the keychain half of the attestation.

