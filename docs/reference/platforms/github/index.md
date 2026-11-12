# GitHub


> What Blowhorn can do on GitHub, and how each action behaves there.


Blowhorn works on GitHub through GitHub's API, never the browser, with the `GH_TOKEN` in your account.

Follows accounts with `blowhorn follow` and lists an audience with
`blowhorn source --platform github --repo`. Searches issues and pull
requests with `blowhorn find --platform github`, read-only through
GitHub's search API: `--repo`, `--type`, and `--state` narrow it, and
the other find filters translate to search qualifiers. See
[Find issues and pull requests on GitHub](/docs/how-to/grow/find-on-github/).
Under `post`, GitHub
amplifies only: it adds all five uplifting reactions (+1, laugh,
hooray, heart, rocket) to the issue or pull request the `--amplify`
flag or the activity's "Amplify" column names, from every selected profile
under its own token. Re-running adds none of them twice.

One command group works differently: `blowhorn github` runs through
GitHub's GraphQL API instead of the REST API, with no CLI to install
and nothing vendored. Its squatter sweep
(`blowhorn github squatters --repo owner/name`) finds assigned-but-stalled
issues and, on a fixed grace-period progression, posts a nudge, then a
final warning, then releases the assignment -- never reassigning to
another person, never closing the issue. It runs with the store's
GitHub token, never a second credential, and a token that is missing
or unauthenticated is a hard error, never a silent fallback.
A dry run is the default: without `--apply` nothing is
written. See [Sweep stalled GitHub assignments](/docs/how-to/grow/squatter-sweep/).

<!-- BEGIN generated limits: release/scripts/capabilities_docs/build.py; do not edit -->

## Limits

No limits are recorded for GitHub.

<!-- END generated limits -->

## Supported actions



- **[React](#action-react)**: Adds the five upbeat reactions (+1, laugh, hooray, heart, rocket) to an issue or pull request from each of your profiles. Running it again adds none of them twice. Limits: GitHub doesn't publish posts; it needs an issue or pull request link.
- **[Follow](#action-follow)**: Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself.
- **[Find](#action-find)**: Lists the people around a repository, so you can choose whom to reach. Limits: Lists only; it doesn't follow or react.


## Related

- [All platforms](/docs/reference/platforms/) - every platform, side by side.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - safe versus risky actions, per platform.
- [Developer distribution](https://blowhorn.ai/solutions/developer-distribution/) - GitHub reactions beside the other developer channels, for a launch.

