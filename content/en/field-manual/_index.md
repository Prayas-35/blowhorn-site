---
title: The Field Manual
linkTitle: Field Manual
heading: "The Field Manual: what the feeds reward, and what gets you benched"
description: What LinkedIn, X, Reddit and other social feeds reward and penalize, in plain language, with a source for every claim. Hard-won lessons from Major Blowhorn so you can claim victory.
lead: "We've lost more profiles so you don't have to. Here is what every feed told us, in its own words, and what we learned the hard way."
layout: field-manual
checked: 28 October 2026
lastmod: 2026-10-28
sitemap:
  changefreq: monthly
  priority: 0.5

plate:
  file: fm-home-open.webp
  alt: "Open Field Manual with a woodcut of a hill and fallen soldiers"
  caption: "Standing orders. Every claim has a source."
  w: 1280
  h: 720
---

## A word from the Major

At ease, recruit. Before you charge into any feed, you should know what's on the other side of the hill.

I have stood at a lot of graves. Corporal Comment-to-Agree, who asked LinkedIn for a "YES" in the replies. Private Pod, who swapped likes with forty strangers every morning at 7:00. Sergeant Same-Post, who said the exact same thing from five accounts in the same minute. Good soldiers, all of them, and every one benched by an algorithm that saw them coming.

These were hard-won battles. This manual passes along that value so you can claim victory. (The fallen soldiers are composites, recruit. The lessons are real, and every one links to its source.)

## How to read this manual

- **Every claim has a source.** We lean hardest on what the platforms say themselves: help centers, policy pages, engineering blogs and, for X, the code it published.
- **"Hypothesis" means a platform didn't say it.** When an idea comes from forums, analysts or our own experience, it's labelled **Hypothesis**. Treat those as field notes, not orders.
- **No numbers we can't back.** Platforms rarely publish weights or safe limits. Where they do, we quote them with a date. Where they don't, we don't make one up.

## Five orders that hold on every feed

1. **Earn conversation, not clicks.** Replies, real discussion and time spent reading are what feeds say they reward. LinkedIn ranks on how long people spend with a post ([LinkedIn Engineering](https://www.linkedin.com/blog/engineering/feed/leveraging-dwell-time-to-improve-member-experiences-on-the-linkedin-feed)), and X's published ranking code scores the chance of a reply far above the chance of a like ([X, 2023](https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md)).
2. **Never ask for the engagement.** "Comment to agree" and similar bait is something LinkedIn says it actively reduces ([LinkedIn, Mar 2026](https://news.linkedin.com/2026/ImprovingTheFeed)), and Meta says the same of Facebook ([Meta Transparency Center](https://transparency.meta.com/features/approach-to-ranking/content-distribution-guidelines/engagement-bait)).
3. **No pods, no trades, no bought anything.** LinkedIn calls engagement pods "not allowed" ([LinkedIn, Mar 2026](https://news.linkedin.com/2026/authentic-content-and-conversations)). X prohibits "Repost for Repost" and buying engagement ([X platform manipulation policy](https://help.x.com/en/rules-and-policies/platform-manipulation)). Reddit prohibits coordinated voting ([Reddit Help](https://support.reddithelp.com/hc/en-us/articles/360043066412-Disrupting-Communities)).
4. **Don't say the same thing twice, from anywhere.** X: "You may not post duplicative or substantially similar posts on one account or over multiple accounts you operate" ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation)). Reddit lists repeating the same or similar comments as spam ([Reddit Help](https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community)).
5. **Annoyed readers cost you.** X's published ranking code lists "not interested," mute, block, report and "not dwelled" as negative actions that carry negative weights ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)). X warns that the weights scale each reader's predicted chance of an action, not raw counts, so "1 report cancels out 468 likes" is the wrong reading. The right one: content people want to hide sinks.

**The first hour is a field pattern, not an order.** <span class="hypothesis">Hypothesis:</span> feeds show a new post to a few readers first and widen it if they respond, so early replies and reading time count for a lot, and the decisive window is roughly the first hour. No platform we cover has published that window. The longer story is in [Won or lost in the first hour](/resources/articles/won-or-lost-in-the-first-hour/).

{{< major >}}Nobody can promise you won't get flagged. I can promise I won't rush, won't repeat myself and won't touch your CAPTCHA.{{< /major >}}

## What Blowhorn does about it

Blowhorn was built around these lessons. It types at human speed with random pauses, clicks a public action once and never retries it on a guess, hands every CAPTCHA and two-factor prompt to you, and skips LinkedIn invitations that LinkedIn flags as risky ([How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/), [Why flagged invitations are skipped](/docs/explanation/invitation-safety/)).

None of that makes a behavior allowed. The rules govern what an account does, not which software clicks. Running in your own browser keeps your passwords on your computer; it doesn't make a pod a good idea. The [action matrix](/field-manual/action-matrix/) shows which Blowhorn actions are safe, which need care and which are risky on each platform.

Curious what sites can see about your browser? Run the free check at [Blowhorn Tells](https://tells.blowhorn.ai/). It shows what a page can read, not what a platform will decide.

Blowhorn posts to LinkedIn, X, Reddit, Hacker News, Bluesky, Slack and GitHub, on your computer ([Platforms](/docs/reference/platforms/), [System requirements](/docs/reference/requirements/)). The pages on Facebook, YouTube, Instagram, TikTok, Threads and Mastodon are general education only: Blowhorn doesn't post to them.
