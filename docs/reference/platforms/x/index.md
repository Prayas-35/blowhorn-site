# X (Twitter)


> What Blowhorn can do on X (Twitter), and how each action behaves there.


Blowhorn works on X in your own signed-in Google Chrome, through the Blowhorn extension. Sign in to X there once, by hand. The credential Blowhorn checks is `X_USERNAME`, kept in your account.

Posts from an activity; a message past 274 characters goes out as a thread.
If a post asks for media and the upload into the compose form fails, the
post is not sent: nothing is clicked, the row stays pending, and the
next run can retry it with its media. A media download failure behaves
the same way.
Replies go through a post activity that targets the conversation. Amplifies
by retweet or quote. Follows accounts with `blowhorn follow`. Analytics
appends a follower and following trend activity per run.

Follows: at most 400 per profile a day and 15 in any 15 minutes,
counted from that profile's follow log on this computer. The 400 is X's
own published follow limit; the 15 is Blowhorn's spacing. X also
publishes 50 original posts and 200 replies a day for an account without
a checkmark, and no setting in Blowhorn goes past any of the three
([the one hard stop](/docs/how-to/settings/choose-your-rules-of-engagement/#a-limit-the-platform-publishes-is-the-one-hard-stop)).

<!-- BEGIN generated limits: release/scripts/capabilities_docs/build.py; do not edit -->

## Limits

The limits Blowhorn knows for X.

| Limit | Value |
|---|---|
| Post | 274 (x-weighted) |
| Reply | 274 (x-weighted) |
| Image | 5000000 bytes |
| Video | 512000000 bytes |
| Outreach per day | 400 |
| Posts per day | 50 |
| Comments per day | 200 |

<!-- END generated limits -->

## Supported actions



- **[Post](#action-post)**: Publishes your message, with an image if you add one. A message longer than 274 characters goes out as a thread. Limits: X publishes 50 original posts a day for an account without a checkmark, and no setting in Blowhorn goes past it.
- **[Reply](#action-reply)**: Replies in a conversation when your post is addressed to it. Limits: X publishes 200 replies a day for an account without a checkmark, and no setting in Blowhorn goes past it.
- **[Amplify](#action-amplify)**: Retweets or quotes a post from each of your profiles.
- **[Follow](#action-follow)**: Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself, skipping anyone you already follow. Limits: At most 400 follows per profile a day, and 15 in any 15 minutes, counted from that profile's follow log on this computer.
- **[Analytics](#action-analytics)**: Records your follower and following counts on each run, so you can watch the trend. Limits: Read-only.


## X (Twitter) replies

Replying is a post activity addressed at the conversation, not a separate
command. There is no comment flow for X under `blowhorn comment`.

## Related

- [All platforms](/docs/reference/platforms/) - every platform, side by side.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Field Manual: X](https://blowhorn.ai/field-manual/x/) - what the X feed rewards and what it penalizes.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - safe versus risky actions, per platform.

