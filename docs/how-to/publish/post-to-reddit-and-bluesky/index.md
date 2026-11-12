# Post to Reddit and Bluesky


> Queue Reddit posts and Bluesky posts, threads, and reposts.



Queue posts for Reddit and Bluesky from content activities, then publish them
with `blowhorn post`.

## Reddit: post to a subreddit

Set `Title`, put the text in `Message Text`, and put the subreddit in
`Destination` as `r/<sub>`:

```bash
blowhorn content upsert --payload '{"Platform":"reddit","Profile":"company","Title":"Our v2.0 release is out","Message Text":"What is new in this release...","Destination":"r/devops","Approved?":"yes"}'
blowhorn post --platform reddit --profile company --dry-run
blowhorn post --platform reddit --profile company
```

A title longer than 300 characters is cut short with a warning. An activity
with no subreddit in `Destination` or `Amplify` is skipped with an error
naming the activity.

A comment on a thread is a `Comment on` activity, and an upvote is an
`Amplify` activity; both are on their own pages.

## Bluesky: post and thread

Put the text in `Message Text`. Past 300 characters the post splits into a
thread at word boundaries:

```bash
blowhorn content upsert --payload '{"Platform":"bluesky","Profile":"company","Message Text":"Our v2.0 release is out...","Approved?":"yes"}'
blowhorn post --platform bluesky --profile company --dry-run
blowhorn post --platform bluesky --profile company
```

A thread that stops part-way is recorded with what landed and never
retried: re-running it would post the landed part twice. Read the run's
`!!!` line before you touch that activity again.

An activity with `Image URL` attaches that file. A comment on a post is a
`Comment on` activity, on its own page.

## Bluesky: repost

Put the post's Bluesky URL in `Amplify` and leave `Message Text` empty:

```bash
blowhorn content upsert --payload '{"Platform":"bluesky","Profile":"company","Amplify":"https://bsky.app/profile/yourproject.bsky.social/post/abc","Approved?":"yes"}'
```

Unlike LinkedIn reposts, a Bluesky repost is not guarded against a second
run: once the activity is done, leave `Date Promoted` alone.

## Related

- [Post content](/docs/how-to/publish/post-content/) - running `blowhorn post` in general.
- [Amplify an existing post](/docs/how-to/publish/amplify-a-post/) - Reddit upvotes in full.
- [Reply to a post](/docs/how-to/publish/reply-to-a-post/) - comments on both platforms.
- [Sign a profile in to each platform](/docs/how-to/set-up/platform-accounts/) -
  the Reddit session and the Bluesky login each run needs.

