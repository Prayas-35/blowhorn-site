# Find conversations on Bluesky


> Search Bluesky posts by query, date, author, and other filters.



Search Bluesky for posts matching a query, with date, author, and
relevancy filters. Read-only: results are printed, never posted, and no
browser opens.

```bash
# Name the query. It is required.
blowhorn find --query "developer relations" --profile company

# Newest or most relevant first.
blowhorn find --query "developer relations" --sort latest --profile company
blowhorn find --query "developer relations" --sort top --profile company

# Narrow by date, author, mention, language, linked domain, URL, or tag.
blowhorn find --query "developer relations" --since 2026-09-01 --until 2026-10-01 --profile company
blowhorn find --query "developer relations" --author yourproject.bsky.social --profile company
blowhorn find --query "developer relations" --tag opensource --limit 10 --profile company
```

The query takes Lucene syntax. `--limit` takes 1 to 100 and defaults to
25. The run authenticates as the profile, so the profile needs its
Bluesky login stored first.

## Related

- [Follow accounts](/docs/how-to/grow/follow-on-github/) - follow the accounts worth
  following.
- [Post to Reddit and Bluesky](/docs/how-to/publish/post-to-reddit-and-bluesky/) -
  join the conversations worth joining.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the Bluesky login the search runs with.

