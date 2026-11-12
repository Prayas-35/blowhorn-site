# Find issues and pull requests on GitHub


> Search GitHub issues and pull requests by query, repository, type, and state.


Search GitHub issues and pull requests by query, with repository, type,
state, date, author, and label filters. Read-only: results are printed,
never posted, and no browser opens. The search runs through GitHub's REST
API (`GET /search/issues`) with the profile's stored `GH_TOKEN`, never
through a browser, so it is not scraping.

```bash
# Name the query. It is required.
blowhorn find --platform github --query "service mesh" --profile company

# Open issues in one repository.
blowhorn find --platform github --query "meshery" --repo meshery/meshery --type issue --state open --profile company

# Pull requests, newest first, across several repositories.
blowhorn find --platform github --query "flaky test" --repo meshery/meshery --repo layer5io/layer5 --type pr --sort latest --profile company

# Narrow by date, author, mention, language, or label.
blowhorn find --platform github --query "docs" --since 2026-09-01 --until 2026-10-01 --profile company
blowhorn find --platform github --query "onboarding" --author octocat --tag "good first issue" --lang go --profile company
```

## How the query is translated

Bluesky find takes a Lucene query plus named filters; GitHub search takes
qualifiers. The translation is:

| `blowhorn find` input | GitHub search |
| --- | --- |
| `--query` | search terms, plus the qualifiers below |
| `--sort top` | best match, GitHub's default, so no sort is sent |
| `--sort latest` | `sort=created`, newest first |
| `--since` / `--until` | `created:>=YYYY-MM-DD` / `created:<=YYYY-MM-DD` |
| `--author` | `author:<login>` |
| `--mentions` | `mentions:<login>` |
| `--tag` | one `label:<name>` qualifier per tag |
| `--lang` | `language:<name>` |
| `--repo owner/name` | one `repo:owner/name` qualifier per repository |
| `--type issue` / `pr` / `all` | `is:issue` / `is:pr`, or neither for `all` |
| `--state open` / `closed` / `all` | `state:open` / `state:closed`, or neither for `all` |
| `--limit` | `per_page`, 1 to 100, default 25 |

`--domain` and `--url` have no GitHub equivalent. They are refused with
a clear message when you search GitHub, never silently reinterpreted;
use them with `--platform bluesky` instead. Repository search and code
search are not part of this: `find` on GitHub covers issues and pull
requests only.

`--dry-run` prints the translated GitHub query and makes no API call.
`--platform bluesky` keeps the Bluesky search unchanged, and
`--platform all` runs both, Bluesky first, then GitHub. When
`--platform` is omitted, `find` still searches Bluesky only.

GitHub limits authenticated search requests to 30 a minute. A find run
makes exactly one search call, and the client backs off on GitHub's
rate-limit answers (`Retry-After`, `x-ratelimit-remaining` and
`x-ratelimit-reset`) the same bounded way every other GitHub read does.

## Related

- [Find conversations on Bluesky](/docs/how-to/grow/find-on-bluesky/) - the Bluesky
  search, and the filters the two platforms share.
- [Follow accounts](/docs/how-to/grow/follow-on-github/) - follow the accounts worth
  following.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the GitHub token the search runs with.

