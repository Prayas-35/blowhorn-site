# Post to Hacker News


> Submit links and text posts, comment, and stay within the daily cap.



Submit a link or a text post to Hacker News, or comment on an item, from a
content activity.

> **The Major says:** "Hacker News votes? Absolutely not. I have standards. Dry-run it first: a submission is forever."


Hacker News submissions **cannot be deleted**. Preview every new activity with
`--dry-run` before the first real run. An activity that fails costs you one run;
an activity that posts the wrong thing is permanent.

Blowhorn never votes on Hacker News. There is nothing to configure for
that and no way to turn it on.

## Before the first run

1. **Store the profile's Hacker News login.** Both keys are needed; the
   password is read from your account.

   ```bash
   blowhorn profile set your-profile HN_USERNAME=<account> HN_PASSWORD=<password>
   ```

   Check it landed, with the password shown only as set or not set:

   ```bash
   blowhorn profile get your-profile
   ```

2. **Map the profile to a Google Chrome profile**, if it is not mapped already.
   Hacker News is driven through a browser, like LinkedIn, X, and Reddit.
   See [Map Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/).

If a named profile has no Hacker News login stored,
`blowhorn post --profile your-profile --platform hn` says so by name and exits
non-zero before any browser opens.

## Submit a link

Set `Title` and put the URL in `Destination`. Leave `Comment on` blank.

```bash
blowhorn content upsert --payload '{"Platform":"HN","Profile":"your-profile","Title":"Example v1.0 is out","Destination":"https://example.com/news/v1-0","Approved?":"yes"}'
```

Keep the title to **80 characters or fewer**. A longer one fails the activity
rather than being cut short, because a Hacker News title cannot be edited
afterwards.

## Submit a text post

Set `Title` and put the body in `Message Text`. Leave `Destination` and
`Comment on` blank.

```bash
blowhorn content upsert --payload '{"Platform":"HN","Profile":"your-profile","Title":"Ask HN: How do you visualize your clusters?","Message Text":"We have been trying a few approaches...","Approved?":"yes"}'
```

An activity with both a `Destination` URL and body text submits the link and
tells you how much of the body it dropped. Pick one.

## Comment or reply

Put the item's URL in `Comment on` and the comment in `Message Text`. To
reply to a comment, use that comment's own permalink: the link on its
timestamp.

```bash
blowhorn content upsert --payload '{"Platform":"HN","Profile":"your-profile","Comment on":"https://news.ycombinator.com/item?id=41234567","Message Text":"We hit the same thing; what fixed it for us was...","Approved?":"yes"}'
```

Replies on a comment permalink have not been proven the way story comments
have: if Hacker News shows no comment box there, the activity fails with "No
comment form" and nothing is posted. Try a reply on one activity before queueing
many.

Once `Comment on` holds anything, the activity is a comment and nothing else. If
the URL is mistyped or the body is blank, the activity fails. It is never
submitted as a story instead, even when it also carries a `Title` and
`Destination`.

## Preview, then run

```bash
# See what would be submitted. Submits nothing and records nothing.
blowhorn post --platform hn --profile your-profile --dry-run

# Publish.
blowhorn post --platform hn --profile your-profile
```

A dry run is not offline. It opens the browser and **signs in to Hacker
News** exactly as a real run does, then stops short of the submit. It is a
real visit by a real account, so Hacker News can rate-limit it like one.

## If an activity is held or fails

- **Held (daily cap).** A profile may make 2 link submissions per UTC day.
  The activity is left pending and the run exits 0; run again tomorrow. Text
  posts are not counted.
- **"already submitted to HN by profile …".** Another profile submitted
  that URL first. Change or remove the activity: submitting one URL from
  several accounts is what gets domains banned.
- **"HN did not create a story … already submitted by …".** Somebody
  outside Blowhorn posted that URL and Hacker News redirected to their
  story. The URL is recorded as already on Hacker News and not ours: from
  now on every profile is refused it before the browser opens, and it
  counts toward nobody's daily cap. The activity keeps failing until you change
  or remove it. Comment on the existing story instead, using the link the
  message prints.
- **"… is already on Hacker News: submitted by …".** That same URL, on a
  later run or for another profile. Nothing was opened in the browser. To
  submit it after all, have an operator remove the URL's activity from your account's `hn:submissions` ledger, then run again; there is no command for
  that yet.
- **"the new comment could not be found on the page HN landed on".** The
  activity is marked done with the thread's link rather than the comment's own.
  The comment may well be there, on a later page of a long thread; the activity
  is never failed for this alone, because re-running it would post the
  comment twice. Check the thread and set the Promotion Link by hand if you
  need the comment's own link.
- **Rate limited.** The activity fails and the rest of that profile's Hacker
  News activities are skipped for this run. Wait before running again; do not
  retry immediately.
- **"could not be confirmed".** The click went through but neither the page
  nor Hacker News's public checks showed the submission as yours. Check the
  account's submissions page before running again.

## Related

- [Post content](/docs/how-to/publish/post-content/) - running `blowhorn post` in general.
- [Reply to a post](/docs/how-to/publish/reply-to-a-post/) - comments on the other platforms.
- [Hacker News platform reference](/docs/reference/platforms/hacker-news/) - every column,
  outcome, and limit.
- [Reliability and anti-bot design](/docs/explanation/reliability-and-anti-bot-design/) -
  why these rules are strict.
- [You're in control](/docs/explanation/youre-in-control/) - the limits on every platform.

