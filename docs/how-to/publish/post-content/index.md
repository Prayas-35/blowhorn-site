# Post content


> Preview and publish queued posts across profiles and platforms.



Publish the activities waiting in the content queue.

## Check what a run would pick up

Nothing is published, nothing is written back:

```bash
blowhorn post --check-queue
blowhorn post --check-queue --profile personal --platform linkedin
```

`--check-queue` is read-only: it opens no browser and reaches no platform.

## Publish the queue

```bash
blowhorn post --profile personal                       # every platform with pending activities
blowhorn post --platform linkedin --profile personal --headless   # unattended: a background window, never headless
blowhorn post --profile all --exclude personal,kanvas  # fan out, holding profiles back
```

`--profile all` leaves out the excluded profiles (`--exclude`, else
`BLOWHORN_EXCLUDE`, else `defaults.exclude`) and prints `Excluding
profiles: …` when it does. To post as one of them, name it:
`--profile personal`.

Rehearse first whenever the result matters. A dry run goes end to end
without publishing and without marking the activity done:

```bash
blowhorn post --profile personal --dry-run
```

A dry run still signs in where a real run would: on Hacker News it opens
the browser and signs in exactly as a real run does, then stops short of
the submit.

## Amplify or reply from the command line

On X and Reddit, `--amplify` with the post URL amplifies it for this run
(retweet, quote, or upvote), overriding the activity's `Amplify` column.
Replies ride on the activity's `Comment on` column with `Message Text`. The full
forms are [Amplify an existing post](/docs/how-to/publish/amplify-a-post/) and
[Reply to a post](/docs/how-to/publish/reply-to-a-post/). GitHub amplify and the one-off
Slack message need no activity at all; each has its own page.

## Slow a long unattended run down

```bash
blowhorn post --profile all --pace slow
```

`--pace` takes `fast`, `normal`, `slow`, or a numeric multiplier such as
`2.0`.

## Attaching an image or video to a post

An activity that fills `Image URL`, `GDrive Link`, or `Video URL` attaches that
file to the post. Three things are worth knowing when such a post fails:

- An activity whose text holds a URL and an image keeps the image: Blowhorn
  removes the link preview LinkedIn generates first, because the preview
  takes the slot the image needs. An activity with a URL and no image keeps its
  preview.
- A post never goes out without the image it asked for, on any platform. If
  the file cannot be downloaded or attached, the activity fails and stays
  pending for a later run, and the run goes on to the next activity. Re-run
  once the cause is understood rather than filling in `Date Promoted` to
  silence it.
- Blowhorn fetches the file itself before it opens the post. It accepts PNG,
  JPEG, GIF, WebP, and HEIC images and MP4, MOV, and WebM videos, judged by
  the file's contents rather than its name. It gives up on a host that goes
  silent for 30 seconds, and on a transfer that runs past 10 minutes. It
  refuses a file over 25 MiB for an image or 1024 MiB for a video. Those caps
  are Blowhorn's own; a platform may accept less. See
  [Messages and exit codes](/docs/reference/messages/) for the sentence each
  refusal prints.

In New order, a file you drop still needs its link pasted below the landing
zone: Blowhorn posts media from a link, so a dropped file with no link is
refused when you deploy.

## Related

- [Manage the content queue](/docs/how-to/publish/manage-the-content-worksheet/) - adding and
  editing the activities a run reads.
- [Amplify an existing post](/docs/how-to/publish/amplify-a-post/) - reposts, retweets,
  upvotes, GitHub reactions.
- [Reply to a post](/docs/how-to/publish/reply-to-a-post/) - comments and replies.
- [Send a Slack message](/docs/how-to/publish/send-a-slack-message/) - the one-off message
  that needs no activity.
- [`blowhorn post` reference](/docs/reference/post/) - what
  "pending" means, and what a run writes back.
- [You're in control](/docs/explanation/youre-in-control/) - what stops a run going wrong

