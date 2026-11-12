# LinkedIn


> What Blowhorn can do on LinkedIn, and how each action behaves there.


Blowhorn works on LinkedIn in your own signed-in Google Chrome, through the Blowhorn extension, in the Chrome profile you mapped. Sign in to LinkedIn there once, by hand. The credential Blowhorn checks, kept in your account, is the signed-in Chrome session you confirmed in setup (`LI_CHROME_SESSION`), or `LI_USERNAME` with `LI_PASSWORD`.

Posts to the feed from an activity; comments on a post when the activity's "Comment on"
holds its address; amplifies by reposting.

<!-- BEGIN generated limits: release/scripts/capabilities_docs/build.py; do not edit -->

## Limits

No limits are recorded for LinkedIn.

<!-- END generated limits -->

## Supported actions



- **[Post](#action-post)**: Publishes your message to your LinkedIn feed, to a group, or to a Page you manage, with an image or link preview when you add one.
- **[Comment](#action-comment)**: Comments on the LinkedIn post you point it at. Anything that isn't a LinkedIn post address stays a normal post.
- **[Amplify](#action-amplify)**: Reposts a post from each of your profiles. A post you already reposted is never reposted twice.
- **[Accept](#action-accept)**: Accepts the invitations people sent you, one at a time. An invitation LinkedIn flags with its "Take care when connecting" warning is skipped, never accepted. Limits: At most 20 confirmed acceptances a run, unless you set --limit.
- **[Withdraw](#action-withdraw)**: Withdraws invitations you sent that have waited 21 days or more, to free room for new ones. Shows a preview until you add --apply. Limits: At most 20 confirmed withdrawals a run, unless you set --limit. LinkedIn blocks re-inviting a withdrawn person for up to three weeks.
- **[Analytics](#action-analytics)**: Reads your Page's analytics for a date range and saves them, so you can watch the trend. Limits: Read-only.


## LinkedIn comments

An activity with "Comment on" set to a `linkedin.com` post address and a
"Message Text" becomes a comment on that post instead of a new post.
The same activity is also picked up by `blowhorn comment`. An activity whose
"Comment on" names anything else stays a normal post.

## Related

- [All platforms](/docs/reference/platforms/) - every platform, side by side.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Field Manual: LinkedIn](https://blowhorn.ai/field-manual/linkedin/) - what the LinkedIn feed rewards and what it penalizes.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - safe versus risky actions, per platform.

