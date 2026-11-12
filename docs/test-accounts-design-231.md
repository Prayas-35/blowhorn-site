# Test accounts for CI ("soldiers in the army"): design plan

Issue: [blowhorn-ai/blowhorn-site #231](https://github.com/blowhorn-ai/blowhorn-site/issues/231)
("\[CI\] Testing with solidiers in the army").
Author of this plan: winkletinkle. Date: 2026-11-09. Status: design;
the Google Groups land separately (see "Blocked").

## Goal

Each test user ("soldier") gets an email address used for testing, so
end-to-end tests are more legitimate. Each address maps to a real account
that signs into the production system, flexing actual production code,
while staying disposable and mungeable for tests.

## What is true today (verified 2026-11-09)

- `test@blowhorn.ai` has been created (carlosriosilva, on #231).
- Temp accounts are created using the `test+name@blowhorn.ai` pattern
  (carlosriosilva, on #231).
- The test accounts (`test+name@blowhorn.ai`) are created; the Google
  Groups per test user are still pending a Workspace admin step
  (simihablo, on #231). The groups land separately; this plan assumes
  that.
- Nothing about the test accounts lives in this repository yet. Checked
  on master (`cf2634a`): no reference to Ada Lovelace, no `test@`
  address, and no end-to-end harness (no Playwright, no Cypress)
  anywhere in this repo. The end-to-end tests that will sign in with
  these accounts live in the product repository
  (`blowhorn-ai/blowhorn`), not here.
- This repository's own CI consumers of a test account:
  - `.github/workflows/cloud-auth-smoke.yml` signs into Blowhorn Cloud
    end to end with a throwaway test account held in the
    `BLOWHORN_SMOKE_EMAIL` and `BLOWHORN_SMOKE_PASSWORD` secrets.
  - `.github/workflows/product-ci.yml` dispatches the product
    repository's checks; it holds no test account itself.
- Internal site access is separate from test accounts:
  `internal-worker/access.json` admits `layer5.io` members and named
  team members to `internal.blowhorn.ai`. Test accounts get no internal
  site access from this plan unless someone asks for it later.

## Account matrix

Three shapes, all using the `test+name@blowhorn.ai` pattern. The roster
of soldier names is filled in by simihablo when the groups land; no
names are invented here.

| Shape | Organisation | Team |
| --- | --- | --- |
| Solo soldier | Own individual organisation | n/a (single member) |
| Teammates | Shared organisation | Same team |
| Same org, different team | Shared organisation | Different teams (not the same team) |

The matrix is the point of the issue: tests must be able to exercise
all three shapes, so the roster needs at least one account in each row,
and the shared-organisation rows need at least two accounts each.

## Implementation steps (from the issue)

1. Create a Google Group for each test user, using the
   `test+name@blowhorn.ai` addresses. Owner: simihablo with a Layer5
   Google Workspace admin. Blocked; see below.
2. Add the AI agents as members of each group. Owner: simihablo with
   the Workspace admin, same step as (1).
3. Replace Ada Lovelace with the new test accounts. The Ada Lovelace
   accounts live in the production system, not in this repository (no
   Ada Lovelace reference exists in this repo, verified on master), so
   the replacement happens where the end-to-end suites sign in: the
   product repository's suites switch from the Ada accounts to the new
   test accounts. Which Ada accounts retire, and when, is confirmed
   with the team once the new accounts are ready; nothing is retired
   before the replacement accounts are proven to sign in.
4. Assign each test account its respective avatar. Avatars are assigned
   in the production account setup, by simihablo with the Workspace
   admin, as part of the same setup step. This repository holds no
   avatar mapping today, and this plan adds none.

## How CI and end-to-end tests consume the accounts

- The product repository's end-to-end suites sign in with the real
  test accounts, one per shape in the matrix above. Tests stay
  disposable and mungeable: a test may create, rename, or delete data
  owned by its account, and never touches a human's account.
- No credential is ever committed to any repository. Only the address
  pattern and the matrix live in the repo. Passwords and tokens stay in
  CI secrets, owned by whoever creates the accounts.
- This repository's cloud-auth-smoke workflow keeps its current
  secret-backed throwaway account. It is a candidate to move to a
  dedicated `test+smoke@blowhorn.ai` address once the groups exist;
  that move is a follow-up, not part of this plan, and it needs the
  secrets updated first. The workflow header now points at this
  document so the follow-up is not lost.
- The groups are the delivery mechanism for the AI agents: an agent
  acts as a member of a test user's group, so group membership, not a
  shared password, is what grants an agent its test identity.

## What lands now vs what is blocked

Lands now (this PR):

- This design document, so the matrix, the four steps, and the
  split between repo work and admin work are written down before the
  groups exist.
- A pointer in the cloud-auth-smoke workflow header to this document
  for the `test+smoke@blowhorn.ai` follow-up.

Blocked on the Layer5 Google Workspace admin step (owner: simihablo,
coordinating the admin):

- The Google Group per test user.
- Adding the AI agents as members of each group.
- Avatar assignment per test account.
- The product repository's end-to-end switch from the Ada Lovelace
  accounts to the new test accounts, which needs the groups and
  accounts to exist first.

Nothing in this PR creates a group, an account, or touches any admin
console. That step belongs to simihablo and the Workspace admin.

## Next steps

1. simihablo pings #231 once the groups are ready.
2. ParthrChandurkar picks up testing then; he is standing by until the
   setup lands.
3. The product repository's end-to-end suites switch to the new test
   accounts, per the matrix above, and the Ada Lovelace accounts are
   retired once the replacements are proven.
4. Follow-up: move the cloud-auth-smoke account to
   `test+smoke@blowhorn.ai` and update the workflow secrets.
