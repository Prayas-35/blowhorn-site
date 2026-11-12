# Who can post as whom


> A credential is permission, a handle is not; a browser mapping is identity, not permission.



Blowhorn decides who may post as whom from one fact: whether the
profile holds the platform's credential. Nothing else grants it.

A handle is not authorization. A username in a roster, a display name
in the browser, or a follower count says who someone is, never what Blowhorn
may do as them. The roster notices that explain a thin selection are
diagnostics, not gates: nothing in the run treats a listed handle as
consent to post. What each platform's credential is, and where the run
reads it, is [Profile reference](/docs/reference/profiles/).

A browser session is not authorization either. Being signed in to a site
in a Chrome profile lets the run act there, but the run still checks
the profile's credential first. A named profile with no credential for
anything in scope stops the run with the reason; `--profile all`
skips such profiles quietly.

One deliberate exception, and it is still a credential: on setup's
confirm step a person can attest that the session in one of their
Google Chrome profiles is theirs and signed in, for LinkedIn, X, Reddit
or Hacker News. Blowhorn stores that attestation as a credential naming
the Chrome profile (`LI_CHROME_SESSION`, `X_CHROME_SESSION`,
`RDDT_CHROME_SESSION`, `HN_CHROME_SESSION`), and eligibility reads the
credential exactly as it reads a password's existence. For these
platforms the attestation is the whole credential: setup does not ask
for a username, and the session check reads the account name off the
signed-in page. A signed-in browser nobody confirmed grants
nothing, and a confirmed
session that has since signed out stops that platform's run with the
reason rather than posting.

A browser mapping is identity, not permission. It says which real
Google Chrome profile the run acts in on this computer, and its refusal checks
run before anything launches or attaches. It never grants, and no
fallback to another profile or folder ever applies when it does not
hold.

One profile is one person's posting identity, created activity-first in your account and kept nowhere else. Creating it resolves the person's email to one Blowhorn account and refuses none-or-several by name,
because two people sharing a posting identity could never be told
apart in the ledger.

## Related

- [Profile reference](/docs/reference/profiles/) - the credential per platform.
- [Platforms](/docs/reference/platforms/) - what each credential unlocks.
- [Map Blowhorn profiles to Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/) - the mapping half.
- [Content queue columns and activity states](/docs/reference/content-queue/) - the refused blank profile.

