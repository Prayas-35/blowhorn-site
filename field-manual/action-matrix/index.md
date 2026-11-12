# Platform action matrix

> One table, every platform. What Blowhorn can do, and how each platform's own rules grade it. Read the notes before you charge.

| Platform | Post | Comment or reply | Amplify | Follow | Connect or invite | Accept invitations | Message |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LinkedIn | care: No bait, no recycled posts [1][2] | risky: LinkedIn bans automated comments [3] | risky: Repost plus like from many profiles looks like a pod [3][4] | none | care: Invitation limits; restrictions last about a week [5] | safe: Flagged invitations are always skipped [6] | none |
| X | care: Never the same text from two accounts [7] | safe: Replies are what the ranking rewards most [8] | risky: Several owned accounts reposting one post is named in X's rules [9] | care: Name a target: with --limit 0, follow the target itself; with a positive limit, follow up to that many of the target's followers, never the target. Capped at 400 a day, 15 per 15 minutes [10] | none | none | none |
| Reddit | care: Mostly not promotion; subreddit rules first [11] | care: Never the same comment twice [11] | risky: Upvotes from several accounts are vote manipulation [12] | none | none | none | none |
| Hacker News | care: 2 link submissions a day at most, never edited [10][13] | care: Your own words only [13] | none: Blowhorn never votes on Hacker News | none | none | none | none |
| Bluesky | safe: Spam and repetition are the limits [14] | safe | care: No manipulated social signals [14] | care: Name a target: with --limit 0, follow the target itself; with a positive limit, follow up to that many of the target's followers, never the target. Keep it human-sized [14] | none | none | none |
| GitHub | none | none | risky: All five reactions from many profiles; GitHub bans inauthentic interactions [15] | risky: Name a target: with --limit 0, follow the target, or several comma-separated; with a positive limit, follow up to that many of the target's followers, never the target itself. GitHub names automated following as rank abuse [15] | none | none | none |
| Slack | none | none | none | none | none | none | care: Each workspace sets its own rules. Hypothesis: one message per channel |
| Facebook, YouTube, Instagram, TikTok, Threads, Mastodon | none | none | none | none | none | none | none |


## Beyond the API

Some of these actions have no official API at all. Hacker News has no write API: every submission and comment runs through your own signed-in browser. LinkedIn offers no self-serve API for invitations, accepts, or withdrawals: outreach there is browser-only too. Everywhere else, the difference is acting as you: your own session, your own accounts, no developer app and no brand-account abstraction between you and the platform.

## How to read the grades

- **Safe** means the platform allows the action when a real person means it. It never means guaranteed: automation can still be blocked, and sessions can still break ([Platforms](/docs/reference/platforms/)).
- **Use care** means it's allowed with limits, or with wording rules the platform spells out. Read the note.
- **Risky** means the platform's own rules name this behavior, or something close to it, as a reason to cut reach or restrict an account. Use it rarely, from one profile, or not at all.
- **Not supported** means Blowhorn doesn't do it there. A blank cell means the same.

A grade describes the action, not the tool. LinkedIn says it doesn't permit "browser extensions that... automate activity on LinkedIn's website" ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a1341387)). Blowhorn types at human pace and hands you every CAPTCHA, but it is a browser extension acting on LinkedIn, so every LinkedIn action carries that rule with it. Weigh that before you run anything there unattended.

## Notes and sources

1. LinkedIn: "We're improving our systems to reduce repetitive, low-substance posts and engagement bait, such as 'comment to agree' prompts" ([LinkedIn Pressroom, 12 Mar 2026](https://news.linkedin.com/2026/ImprovingTheFeed)).
2. LinkedIn: "Don't do things to artificially increase engagement with your content" ([Professional Community Policies](https://www.linkedin.com/legal/professional-community-policies)).
3. LinkedIn: automated comments "aren't allowed on LinkedIn"; an engagement pod "is not allowed on LinkedIn" ([LinkedIn Pressroom, 13 Mar 2026](https://news.linkedin.com/2026/authentic-content-and-conversations)).
4. LinkedIn: "don't agree with others ahead of time to like or re-share each other's content" ([Professional Community Policies](https://www.linkedin.com/legal/professional-community-policies)).
5. LinkedIn: "This restriction typically lasts one week" ([Invitation limit reached](https://www.linkedin.com/help/linkedin/answer/a550555)).
6. [Why flagged invitations are skipped](/docs/explanation/invitation-safety/).
7. X: "You may not post duplicative or substantially similar posts on one account or over multiple accounts you operate" ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation)).
8. X's published 2023 weights: reply 13.5, like 0.5. Weights scale predicted probabilities, not raw counts ([twitter/the-algorithm-ml](https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md)).
9. X: "operating multiple accounts that interact with the same or substantially similar content... in order to inflate or manipulate the prominence of content" ([X platform manipulation policy](https://help.x.com/en/rules-and-policies/platform-manipulation)).
10. Blowhorn's built-in limits ([Platforms](/docs/reference/platforms/)). These are Blowhorn's caps, not numbers the platform publishes.
11. Reddit: spam includes "Repeatedly posting the same or similar comments in a thread, community or across communities"; some communities use a 10% self-promotion rule ([Reddit Help](https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community)).
12. Reddit prohibits "Creating and employing multiple accounts, voting services, or any automation to manipulate vote counts" ([Reddit Help](https://support.reddithelp.com/hc/en-us/articles/360043066412-Disrupting-Communities)).
13. Hacker News: "Don't solicit upvotes, comments, or submissions" and "Don't post generated text or AI-edited text" ([HN guidelines](https://news.ycombinator.com/newsguidelines.html)).
14. Bluesky: "Do not artificially manipulate features or social signals to gain unearned reach" ([Community Guidelines, 19 Sep 2025](https://bsky.social/about/support/community-guidelines)).
15. GitHub does not allow "inauthentic interactions, such as fake accounts and automated inauthentic activity; rank abuse, such as automated starring or following" ([GitHub Acceptable Use Policies](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies)).

