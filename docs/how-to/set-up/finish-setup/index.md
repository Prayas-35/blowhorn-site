# Finish setup on this computer


> Run blowhorn setup to check this computer, write the Chrome native host, and see what is left.



`blowhorn setup` checks what Blowhorn needs on this computer, changes only
what is missing or out of date, and lists what is left for you to do. It is
safe to run as often as you like.

It never starts, opens or attaches to Google Chrome, and it installs no extension.

## See what would change

```bash
blowhorn setup --dry-run
```

Nothing is written. Each line starts with a state:

| State | Meaning |
|---|---|
| `ok` | already in place; nothing was written |
| `changed` | written by this run |
| `planned` | would be written: a dry run, or nobody could be asked |
| `declined` | you answered no; nothing was written |
| `todo` | needs you: signing in, or putting `blowhorn` on your `PATH` |
| `failed` | could not be checked or written; the line says why |

## Run it

```bash
blowhorn setup
```

It checks, in order:

1. `cli` - that `blowhorn` is on your `PATH`.
2. `chrome-profiles` - your Chrome profiles, read from Chrome's `Local State`
   file.
3. `native-host` - the small file that lets the Blowhorn Chrome extension talk
   to Blowhorn. When it is missing or out of date, setup says which Chrome
   profiles it reaches - every Chrome profile you use on this computer, now
   and later, naming the ones it found today - and asks before writing it.
4. `cloud-account` - whether you are signed in to Blowhorn.

The run ends with `changed:` (what this run wrote, or that everything was
already in place) and `Next:`, the steps only you can take:

- sign in to [Blowhorn](https://cloud.blowhorn.ai) (or create an account there)
- install the Blowhorn extension from the Chrome Web Store
- check the extension answers: `blowhorn chrome extension-status`
- get the Blowhorn app for macOS from <https://blowhorn.ai/download>

Run `blowhorn setup` again after any of them: the steps already done report
`ok`.

## Run it from a script

```bash
blowhorn setup --yes --json
```

`--yes` agrees to write the native host without asking. `--json` prints one
object with `steps`, `profiles`, `changed`, `already_ok` and `next_steps`.
With `--json`, or when there is no terminal to ask in, and no `--yes`, nobody
is asked: the native host is reported `planned` and nothing is written. The
command exits 1 when any step `failed`.

Do not run it with `sudo`: the native host would land in the wrong home
directory, so a root run on behalf of another user is refused and reported
`failed`.

## Related

- [Install the Chrome extension](/docs/how-to/set-up/install-the-chrome-extension/)
- [Command-line reference](/docs/reference/cli/)

