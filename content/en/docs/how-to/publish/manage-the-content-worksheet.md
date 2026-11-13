---
title: "Manage the content queue"
description: "Add, edit, and track queued posts under Activity › Upcoming and from the command line."
weight: 80
aliases: [/docs/how-to/manage-the-content-worksheet/]
---


Everything you publish waits in the content queue first. Add activities in the
desktop app under Activity › Upcoming, from the command line, or with the capture
bookmarklet. `blowhorn post` publishes from these activities and nothing else.

## The columns a run reads

| Column | What to put there |
| --- | --- |
| `Platform` | One `blowhorn post` publishes to: `linkedin`, `x`, `reddit`, `hn`, `slack`, `bluesky`, `github` (`twitter` and `bsky` also work) |
| `Profile` | Who posts it, or `all`. Never blank: a blank profile is refused rather than read as `all` |
| `Destination` | Where it goes: `r/<sub>` on Reddit, a link URL on Hacker News, the workspace on Slack (the channel goes in `Amplify`) |
| `Message Text` | The post itself |
| `Title` | Hacker News and Reddit titles |
| `Approved?` | `yes` to let a run pick the activity up |
| `Promote On` | `YYYY-MM-DD HH:MM:SS` in this computer's own zone; blank means now |
| `Image URL`, `GDrive Link`, `Video URL` | One attachment for the post |
| `Amplify` | URL of existing content to amplify instead of publishing ([Amplify an existing post](/docs/how-to/publish/amplify-a-post/)) |
| `Comment on` | URL to reply to, with the reply in `Message Text` ([Reply to a post](/docs/how-to/publish/reply-to-a-post/)) |
| `Date Promoted`, `Promotion Link` | What the run writes back. Clear `Date Promoted` to queue the activity again |

Activity numbers are the queue's own, stable for the life of an activity: deleting a
activity never renumbers the rest, so an activity number is safe to keep and script
against.

## Activity states

`blowhorn content list` reports each activity's state, decided by the same
rules that make an activity pending for a post run:

- `pending`: a run will pick it up.
- `scheduled`: `Promote On` is in the future.
- `draft`: `Approved?` is not `yes`.
- `done`: `Date Promoted` is set.
- `unread`: the submit was clicked and nothing afterwards confirmed it
  (`Date Promoted` says `clicked, outcome not read`). The activity is not
  pending and not done, and no run posts it again. Check the platform,
  then clear `Date Promoted` to try it again.
- `invalid`: a `Promote On` that will not parse. A post run skips it with
  a warning.
- `unsupported`: a `Platform` `blowhorn post` cannot publish to.

## Threads

Activities that answer one another show as one thread under Activity › Upcoming: the root first, then its replies in order, under a `thread · N` line you can expand and collapse. Opening any part of a thread shows the whole chain in its editor, root first, with the open post marked. A thread is created root first from the command line; see [Content item contract](/docs/reference/content-item-contract/).

## Approve a waiting activity

An activity whose `Approved?` is not `yes` waits, and no run picks it up.
In the app it reads **waiting for approval**, with an **approve** control
beside it in the list and in its editor. Approving is a person's act: the
control runs the same `blowhorn content approve` as the command below,
and records who approved it and when in `Approved by`. An agent caller
is refused by that verb in every approval mode (see
[Configuration](/docs/reference/configuration/)).

## From the command line

```bash
# Every activity with its state.
blowhorn content list

# The posts as one list: each post with its own Promote On inline, then the
# schedule's jobs as rows of their own. A job names no post - a post job
# drains this queue at run time - so the jobs are shown unlinked.
blowhorn content posts

# Only what a run would pick up now, as JSON.
blowhorn content list --pending --json

# One profile's activities; only X activities.
blowhorn content list --profile company
blowhorn content list --platform x

# One activity, every column, its state and its problems.
blowhorn content get 12 --json

# Create an activity: it takes the next activity number, which is never reused.
blowhorn content upsert --payload '{"Platform":"linkedin","Profile":"company","Message Text":"Our v2.0 release is out","Approved?":"yes"}'

# Update in place: the payload is merged over the activity; columns it does not
# name are left as they were.
blowhorn content upsert --activity 12 --payload '{"Approved?":"yes"}'

# Approve an activity, recording who approved it and when in `Approved by`.
# Under approval mode (defaults.approval.mode) this is the door activities
# an agent queued are waiting at; an agent caller is refused by it.
blowhorn content approve 12

# Delete (requires --yes; --dry-run previews first).
blowhorn content delete 12 --yes
```

A write refuses rather than guesses: an unknown `Platform`, a `Profile`
your account does not know, a blank `Profile`, an unparseable `Promote On`,
and unknown fields are all refused with the reason named.

## Capture a page from the browser

The bookmarklet turns the page you are reading into a new content entry
without retyping it. It holds no credential and reaches no account: it hands
the page's address, title, and any selected text to the desktop app, which
opens Activity › Upcoming on a new entry pre-filled from it.

To install it, open **Settings › Setup** (or **Activity › Upcoming → from browser**) and
drag the **Blowhorn: capture** link onto your Google Chrome bookmarks bar. If you
would rather paste, choose **copy code**, add a bookmark in Google Chrome named
`Blowhorn: capture`, and paste the code as its address.

or paste this:

```
javascript:(function(w,d){var s=String((w.getSelection&&w.getSelection())||"").slice(0,4000);var u="blowhorn://content/new?url="+encodeURIComponent(String(w.location.href).slice(0,2048))+"&title="+encodeURIComponent(String(d.title||"").slice(0,300))+"&text="+encodeURIComponent(s);var left=false;function gone(){left=true}w.addEventListener("blur",gone);d.addEventListener("visibilitychange",gone);w.setTimeout(function(){w.removeEventListener("blur",gone);d.removeEventListener("visibilitychange",gone);if(left||d.visibilityState==="hidden"||(d.hasFocus&&!d.hasFocus()))return;var n=d.createElement("div");n.setAttribute("role","alert");n.textContent="Blowhorn did not open. Install or start the Blowhorn desktop app, then try the bookmarklet again.";n.style.cssText="position:fixed;top:16px;right:16px;z-index:2147483647;max-width:360px;padding:10px 14px;background:#111;color:#f5f5f5;font:13px/1.4 -apple-system,system-ui,sans-serif;border:1px solid #444;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.4);cursor:pointer";n.onclick=function(){n.parentNode&&n.parentNode.removeChild(n)};d.body.appendChild(n);w.setTimeout(function(){n.parentNode&&n.parentNode.removeChild(n)},8000);},2000);w.location.href=u;})(window,document)
```

You choose what the link is for (**post the link**, **amplify it**,
**reply to it**: the URL lands in `Message Text`, `Amplify`, or `Comment
on`), pick the platform and profile, and the editor's add button queues
the entry. Nothing reaches the queue until you add it.

## Related

- [Post content](/docs/how-to/publish/post-content/) - publish the activities.
- [Amplify an existing post](/docs/how-to/publish/amplify-a-post/) - the `Amplify` column.
- [Reply to a post](/docs/how-to/publish/reply-to-a-post/) - the `Comment on` column.
- [`blowhorn post` reference](/docs/reference/post/) - what "pending"
  means and what a run writes back.
