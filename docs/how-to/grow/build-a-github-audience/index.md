# Build a GitHub audience


> List a repository's stargazers, contributors, or watchers into your account.



List the people around one or more repositories into your account with
`blowhorn source --platform github`: stargazers unless you name another
audience, one stored activity per login. It does not follow, connect, or send
mail. The run lists with the profile's stored `GH_TOKEN`.

```bash
# Stargazers of one repository. Preview first: it lists and writes nothing.
blowhorn source --platform github --profile personal --repo layer5io/layer5 --dry-run
blowhorn source --platform github --profile personal --repo layer5io/layer5

# Another audience, or several repositories at once.
blowhorn source --platform github --profile personal --repo layer5io/layer5 --audience contributors
blowhorn source --platform github --profile personal --repo layer5io/layer5 --repo blowhorn-ai/blowhorn-site --audience watchers
```

`--audience` is one of `owner`, `contributors`, `forks`, `stargazers`,
`watchers`, `subscribers`, or `issues`. `--audience all` lists their
union, and only when you type it. `--repo` repeats; at least one is
required. `--limit` caps the people examined in the run.

## Related

- [Follow accounts](/docs/how-to/grow/follow-on-github/) - follow the audience you built.
- [Amplify an issue or pull request on GitHub](/docs/how-to/publish/amplify-on-github/) -
  react in the repositories you listed.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the token the listing runs with.

