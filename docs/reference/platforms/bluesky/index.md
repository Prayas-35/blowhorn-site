# Bluesky


> What Blowhorn can do on Bluesky, and how each action behaves there.


Blowhorn works on Bluesky through Bluesky's API, never the browser. It uses `BLUESKY_HANDLE` with `BLUESKY_APP_PASSWORD`, kept in the profile's credential in your account: an app password, not your main password.

Posts up to 300 characters per post; longer messages split into
threads. Reposts for amplify activities. Follows with `blowhorn follow`,
unfollows one account with `blowhorn unfollow`, searches posts with
`blowhorn find`. Analytics appends a follower and following trend activity
per run.

Bluesky publishes a limit of 1,666 records an hour and 11,666 a day per
account, every post, like, repost, reply and follow counted together.
Blowhorn counts them together too and never goes past it
([the one hard stop](/docs/how-to/settings/choose-your-rules-of-engagement/#a-limit-the-platform-publishes-is-the-one-hard-stop)).

<!-- BEGIN generated limits: release/scripts/capabilities_docs/build.py; do not edit -->

## Limits

The limits Blowhorn knows for Bluesky.

| Limit | Value |
|---|---|
| Post | 300 (graphemes) |
| Reply | 300 (graphemes) |
| Comment | 300 (graphemes) |
| Image | 1000000 bytes |
| Posts, Reactions, Comments, Shares, Outreach per hour | 1666 |
| Posts, Reactions, Comments, Shares, Outreach per day | 11666 |

<!-- END generated limits -->

## Supported actions



- **[Post](#action-post)**: Publishes your message. A message longer than 300 characters goes out as a thread.
- **[Reply](#action-reply)**: Replies to the Bluesky post you point it at.
- **[Amplify](#action-amplify)**: Reposts a post from each of your profiles.
- **[Follow](#action-follow)**: Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself.
- **[Unfollow](#action-unfollow)**: Unfollows one account.
- **[Find](#action-find)**: Searches Bluesky posts for the words you give it.
- **[Analytics](#action-analytics)**: Records your follower and following counts on each run, so you can watch the trend. Limits: Read-only.


## Related

- [All platforms](/docs/reference/platforms/) - every platform, side by side.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Field Manual: Bluesky](https://blowhorn.ai/field-manual/bluesky/) - what the Bluesky feed rewards and what it penalizes.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - safe versus risky actions, per platform.

