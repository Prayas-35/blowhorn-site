# Amplify an issue or pull request on GitHub


> React to GitHub issues and pull requests from every profile.



React to an issue or pull request from every eligible profile.
`blowhorn post --platform github` does exactly one thing: it adds the
uplifting reaction set to the target, 👍 `+1`, 😄 `laugh`, 🎉 `hooray`,
❤️ `heart`, 🚀 `rocket`, each under that profile's own `GH_TOKEN`. All
five, every time. It cannot publish a new post to GitHub, and it refuses
rather than run with no target.

No browser opens. GitHub runs over the REST API end to end.

## Before the first run

Store a token as the profile's `GH_TOKEN`:

```bash
blowhorn profile set personal GH_TOKEN=<token>
```

The token lands in the profile's GitHub credential in your account. A classic token needs the `repo` scope; a fine-grained
token needs read and write on **Issues**, and on **Pull requests** when
the target is a PR. Then check the token without reacting to anything:

```bash
blowhorn profile status --profile personal --check-platform github
```

## React from the command line

```bash
# Every eligible profile reacts to one issue. No content activity needed.
blowhorn post --platform github --profile all --amplify "https://github.com/layer5io/layer5/issues/1234"

# A pull request is an issue to GitHub's API, so a PR URL routes the same way.
blowhorn post --platform github --profile all --amplify "https://github.com/layer5io/layer5/pull/6210"

# One profile, or an explicit subset.
blowhorn post --platform github --profile personal --amplify "https://github.com/layer5io/layer5/issues/42"

# Hold one profile out of this run.
blowhorn post --platform github --profile all --exclude personal --amplify "https://github.com/layer5io/layer5/issues/42"

# Preview: reads which of the five each profile already left, and adds nothing.
blowhorn post --platform github --profile all --amplify "https://github.com/layer5io/layer5/issues/42" --dry-run
```

## React from the queue

Set `Platform` to GitHub and `Amplify` to the issue or PR URL on an activity,
then run with no `--amplify` at all:

```bash
blowhorn post --platform github --profile personal
```

With the flag, the flag wins over the activity. An activity whose `Amplify` value is
empty or is not an issue or PR URL is skipped with a per-activity error, and
the run continues.

## Who runs

`--profile all` expands to every profile that holds a `GH_TOKEN`; a
profile you name that holds none is reported and skipped, and the rest
run. Naming profiles explicitly makes `--exclude` inert, as everywhere
else. Reacting to your own issue or pull request is allowed: it is
ordinary on GitHub, so leave that profile out with `--exclude` when you do
not want it.

## Already reacted is not an error

GitHub answers `201` when it creates a reaction and `200` when the
reaction was already there. A second run reports "already amplified" per
reaction: not an error, and not a duplicate. A run that confirmed nothing
exits non-zero; a `--dry-run` never fails for confirming nothing.

## A 404 that means the token, not the issue

GitHub answers `404` rather than `403` for a token lacking the scope, so
"that issue is gone" and "your token cannot react" look identical by
status. Blowhorn reads the cause off the response's own scope headers and
says which scope is missing and which command stores a reissued token,
instead of reporting "Not Found". A token that can follow but cannot react
is told it is missing the reacting scope. When the headers show no
shortfall, the status is reported as it came back.

A shortfall belongs to the token, so the run explains it once for that
profile, in full, and stops that profile's reactions, rather than failing
once per reaction. Every other profile in the run is still tried.

## Related

- [Amplify an existing post](/docs/how-to/publish/amplify-a-post/) - amplifying on the other
  platforms.
- [Follow accounts on GitHub](/docs/how-to/grow/follow-on-github/) - the other
  GitHub path, and the same 404 diagnosis for follows.
- [Star repositories on GitHub](/docs/how-to/grow/star-on-github/) - star repositories
  from every selected profile, and the same 404 diagnosis for starring.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  storing and checking the token.

