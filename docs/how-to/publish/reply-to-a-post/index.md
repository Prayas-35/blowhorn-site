# Reply to a post


> Comment on LinkedIn, Reddit, and Bluesky activities, and reply on X.



Comment on a post from a content activity. Put the post's URL in `Comment on`
and the reply in `Message Text`, approve the activity, and run `blowhorn
comment`:

```bash
blowhorn content upsert --payload '{"Platform":"linkedin","Profile":"company","Comment on":"https://www.linkedin.com/feed/update/urn:li:activity:123/","Message Text":"Great post!","Approved?":"yes"}'
blowhorn comment --platform linkedin --profile company --dry-run
blowhorn comment --platform linkedin --profile company
```

`blowhorn comment` covers LinkedIn, Reddit, and Bluesky. It only ever
comments: an activity whose `Comment on` is not a post on the activity's own
platform, or whose `Message Text` is empty, is skipped and stays pending.

## Reply on X

X replies ride with `blowhorn post`, not `blowhorn comment`. Set the
tweet's URL in `Comment on` and the reply in `Message Text`, then run
`post` for that profile and platform:

```bash
blowhorn post --platform x --profile company
```

## Reply without an activity

`--target` with `--message` comments once, with no activity read or marked:

```bash
blowhorn comment --platform linkedin --profile company --target "https://www.linkedin.com/feed/update/urn:li:activity:123/" --message "Great post!"
```

Name one profile: ad-hoc mode refuses `--profile all`. For a Slack thread
reply, use `blowhorn post --target` with a Slack message link instead
([Send a Slack message](/docs/how-to/publish/send-a-slack-message/)).

## Run one or the other over the same activities

`blowhorn post` also acts on `Comment on` activities, so a reply activity left
pending is picked up by whichever runs first. Queue reply activities and run
`comment`; or let the `post` run take them with everything else. Do not
run both over the same activities expecting each to take half.

`post` is not as strict as `comment`. It comments only when `Comment on`
is a post on the activity's own platform and `Message Text` is set; otherwise
it publishes the activity as an ordinary post. A mistyped `Comment on` URL, or
on LinkedIn any `Destination` at all, sends the reply text out as a
public post. Run reply activities through `comment` when you cannot vouch for
every URL.

Hacker News comments are activities too, but they publish through `post`, on
[Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/). There, once `Comment on`
holds anything, the activity is a comment and never a submission.

## Related

- [Amplify an existing post](/docs/how-to/publish/amplify-a-post/) - reposts and reactions,
  the other use of a URL on an activity.
- [Post content](/docs/how-to/publish/post-content/) - running `blowhorn post` in general.
- [Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/) - Hacker News comments.
- [Send a Slack message](/docs/how-to/publish/send-a-slack-message/) - Slack thread replies.

