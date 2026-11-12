# Tune the CLI and blowhorn-axi for the feeds

> Rules in, config out. Each line below maps a cited platform rule to a Blowhorn setting you can set today.


## Baseline config

Set these once per checkout. They're conservative on purpose.

```bash
blowhorn config set defaults.dry_run true   # every write is a rehearsal until you say go
blowhorn config set defaults.pace slow      # human typing, longer random pauses
```

`--pace` takes `fast`, `normal`, `slow` or a numeric multiplier, resolved from the flag, then the environment, then the defaults file ([How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/), [Change your defaults](/docs/how-to/settings/defaults/)). Scheduled-job retries stay off; leave them off.

## Rule to setting

| Platform rule (cited in this manual) | Setting |
| --- | --- |
| LinkedIn: invitations ignored or pending count against you ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a551012)) | Withdraw stale invitations on a schedule; keep invite runs small |
| LinkedIn: flagged invitations are a warning ([docs](/docs/explanation/invitation-safety/)) | Nothing to set: `blowhorn accept` always skips them. Cap runs: `blowhorn accept --profile <p> --limit 5` |
| LinkedIn: no automated comments, no pods ([LinkedIn Pressroom](https://news.linkedin.com/2026/authentic-content-and-conversations)) | Comment rows only with text you wrote; amplify from one personal profile per human |
| X: no duplicates across accounts you operate ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation)) | Never queue the same Message Text on two X profiles; amplify the original instead |
| X: author diversity decay ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)) | Space X rows hours apart, not minutes |
| X: follows | `blowhorn follow --platform x --profile <p> --target <h> --limit 10`; Blowhorn also caps 400 a day and 15 per 15 minutes |
| Early engagement decides reach (<span class="hypothesis">Hypothesis</span>, see [Won or lost in the first hour](/resources/articles/won-or-lost-in-the-first-hour/)) | Schedule each row for the audience's waking hours, at a time you can answer replies by hand |
| X: replies weigh far more than likes ([twitter/the-algorithm-ml](https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md)) | Don't stack posts in one hour; leave room to reply to each |
| Reddit: no coordinated or multi-account voting ([Reddit Help](https://support.reddithelp.com/hc/en-us/articles/360043066412-Disrupting-Communities)) | Don't put a Reddit target in Amplify for more than one profile |
| Reddit: no repeated comments ([Reddit Help](https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community)) | One distinct comment row per thread, each rewritten |
| HN: no solicited votes, no generated text ([HN guidelines](https://news.ycombinator.com/newsguidelines.html)) | Blowhorn never votes; keep submissions to your own words and dry-run each one |
| GitHub: automated following is rank abuse ([GitHub AUP](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies)) | Small `--limit` on `blowhorn follow --platform github`; amplify reactions from one profile |
| Bluesky: no manipulated social signals ([Community Guidelines](https://bsky.social/about/support/community-guidelines)) | Same amplify rule as X |

## For agents on blowhorn-axi

[blowhorn-axi](/ai/blowhorn-axi/) is dry run by default. Recommended agent policy:

1. Always run the dry run, read the planned actions, and stop if any row would publish the same text from two profiles.
2. Never fan a Reddit upvote, or a GitHub reaction, across profiles.
3. On a CAPTCHA, a checkpoint or a restriction page, stop and hand control to the human. Don't retry.
4. Treat a drop in reach after an amplify as a warning. Pause that platform and tell the human.

Risk Profile presets that set these dials together are coming soon ([You're in control](/docs/explanation/youre-in-control/)).

