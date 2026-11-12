# Post to X when it will not confirm


> What Blowhorn reads after Post on X, the extension typing limit, and what to check.



Blowhorn posts to X through the browser, not the X API. It clicks Post once
per activity and never a second time in the same run. After the click it reads back
what it can: the page address for a `/status/` link, the sent banner's view
link, or the post's own words in the feed. None of those readings was ever
captured against the live service, so every one of them is a model, not a
fact.

## Under the extension driver, nothing is typed

The Blowhorn extension's typing in Google Chrome sets X's editor text without the input event X reads,
so X keeps an empty post and Post stays disabled. The run stops before
anything is typed or clicked:

```text
X post NOT sent: the Chrome extension driver's typing does not reach X's editor (it sets the text and fires no input event, so X keeps an empty post and Post stays disabled). Nothing was typed.
  Run this post with --chrome-launch persistent.
```

Nothing was clicked, so "not sent" is the true report here and the activity stays
pending. Run the post again with `--chrome-launch persistent`. A dry run stops
with the same line, so preview an activity under the driver you will post with.

## After the click, check the account

When the click lands but the read-back shows nothing, the activity is held as
`clicked, outcome not read` and no later run posts it again. Open the account
on x.com before the next pass: if the post is there, record it on the activity; if
it is not, clear `Date Promoted` only when you have looked and want a retry.
The full procedure is [Settle something Blowhorn could not
confirm](/docs/how-to/troubleshoot/clicked-not-confirmed/).

Long posts split into a thread at 274 characters, at sentence and paragraph
breaks, with media on the first post only.

## Related

- [Settle something Blowhorn could not confirm](/docs/how-to/troubleshoot/clicked-not-confirmed/) - the held-activity procedure
- [Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/) - expired X sessions
- [Choose how Blowhorn reaches Chrome](/docs/how-to/settings/launch-mode/) - run X under another mode
- [Troubleshooting](/docs/how-to/troubleshoot/troubleshooting/) - start from a symptom instead

