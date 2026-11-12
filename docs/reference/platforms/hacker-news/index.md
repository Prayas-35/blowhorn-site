# Hacker News


> What Blowhorn can do on Hacker News, and how each action behaves there.


Blowhorn works on Hacker News in your own Google Chrome, through the Blowhorn extension, signed in with the username and password in your account (`HN_USERNAME` with `HN_PASSWORD`).

Submits link and text posts and comments from activities. Titles hold 80
characters; a longer title fails the activity rather than truncating,
because a submission cannot be edited after it lands. At most 2 link
submissions per profile per UTC day count; only link submissions are
recorded, so only they count toward the cap. Blowhorn never votes:
there is nothing to configure and no way to turn it on.

<!-- BEGIN generated limits: release/scripts/capabilities_docs/build.py; do not edit -->

## Limits

The limits Blowhorn knows for Hacker News.

| Limit | Value |
|---|---|
| Title | 80 |
| Tags per post | 0 |

<!-- END generated limits -->

## Supported actions



- **[Post](#action-post)**: Submits a link or a text post. Titles hold up to 80 characters; a longer title is refused, never cut short, because a submission can't be edited once it's up. Limits: At most 2 link submissions per profile per UTC day; only link submissions are recorded, so only they count toward the cap. Preview first with --dry-run, because every submission is permanent. Blowhorn never votes.
- **[Comment](#action-comment)**: Comments on the Hacker News item your post is addressed to, under your name.


## Hacker News submissions and comments

A link activity needs the URL; a text post needs the title and text. An activity
with "Comment on" set becomes a comment on that item. Every submission
is permanent and every comment lands under your name, so preview each
new activity with `--dry-run` first. Submissions HN rate-limits fail the
activity; see [Messages and exit codes](/docs/reference/messages/).

## Related

- [All platforms](/docs/reference/platforms/) - every platform, side by side.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/) - the strictest platform, worked.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Field Manual: Hacker News](https://blowhorn.ai/field-manual/hacker-news/) - what the Hacker News feed rewards and what it penalizes.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - safe versus risky actions, per platform.
- [Developer distribution](https://blowhorn.ai/solutions/developer-distribution/) - Hacker News beside the other developer channels, for a launch.

