# Star repositories on GitHub


> Star GitHub repositories from every selected profile, over the REST API.



Star one or more GitHub repositories from every selected profile.
`blowhorn star` is a public endorsement by the acting account, so every
repository in a run is named by the operator on the command line, never
derived from a list the tool already holds. No browser opens. GitHub
runs over the REST API end to end.

## Before the first run

Store a token as the profile's `GH_TOKEN`:

```bash
blowhorn profile set personal GH_TOKEN=<redacted>
```

The token lands in the profile's GitHub credential in your account. A
classic token needs the `repo` scope, which covers both public and
private repositories; a fine-grained token needs read and write on
**Starring**. An installation token from a GitHub App is not a
substitute: it acts as the app installation rather than as you, so it
cannot star as the operator. Then check the token without starring
anything:

```bash
blowhorn profile status --profile personal --check-platform github
```

## Star from the command line

```bash
# Preview: reads each repository's star state for real and names exactly
# which would be starred, issuing no PUT.
blowhorn star --platform github --profile personal --repo acme/widgets --dry-run

# Star one repository from a single profile.
blowhorn star --platform github --profile personal --repo acme/widgets

# Star two repositories from every profile that holds a GH_TOKEN.
blowhorn star --platform github --profile all --repo acme/widgets --repo meshery/meshery

# A github.com URL names the same repository as owner/name.
blowhorn star --platform github --profile personal --repo https://github.com/acme/widgets

# Star from an explicit subset of profiles rather than all of them.
blowhorn star --platform github --profile company,work --repo acme/widgets

# Hold one profile out of this run.
blowhorn star --platform github --profile all --repo acme/widgets --exclude personal
```

`--platform github` is required: star acts on GitHub only, and any
other platform, including `all`, is refused. Star cannot be scheduled:
it stars only the repositories named on the command line.

## Who runs

`--profile all` expands to the roster profiles that hold a `GH_TOKEN`;
a profile you name that holds none is reported and skipped, and the
rest run. Naming profiles explicitly makes `--exclude` inert, as
everywhere else. Starring your own repository is ordinary on GitHub, so
there is no self-exclusion: leave that profile out with `--exclude`
when you do not want it.

## Already starred is not an error

A repository the profile already starred is counted apart, never
re-credited: the summary's `Starred` column counts only repositories
this run newly starred, and `Already` counts the ones already there.
A second run therefore stars nothing twice. A live run exits 0 only
when at least one repository was confirmed and every attempted
repository was confirmed by at least one profile; a `--dry-run` never
fails for confirming nothing, only when it could not produce a preview
for any profile at all.

## A 404 that means the token, not the repository

GitHub answers `404` rather than `403` for a token lacking the scope,
so "that repository is gone" and "your token cannot star" look
identical by status. Blowhorn reads the cause off the response's own
scope headers and says which scope is missing and which command stores
a reissued token, instead of reporting "Not Found". When the headers
show no shortfall, the status is reported as it came back.

A shortfall belongs to the token, so the run explains it once for that
profile, in full, and stops that profile's starring, rather than
failing once per repository. Every other profile in the run is still
tried.

## Related

- [Follow accounts](/docs/how-to/grow/follow-on-github/) - the other GitHub path that
  acts per profile, and the same 404 diagnosis for follows.
- [Amplify an issue or pull request on GitHub](/docs/how-to/publish/amplify-on-github/) -
  the other GitHub path, and the same 404 diagnosis for reactions.
- [Build a GitHub audience](/docs/how-to/grow/build-a-github-audience/) - list a
  repository's people into your account first.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  storing and checking the token.

