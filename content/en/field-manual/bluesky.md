---
title: Bluesky
linkTitle: Bluesky
heading: "Bluesky: you pick the algorithm"
tag: Platform briefing
description: How Bluesky's feeds work (your Following feed, Discover, and custom feeds anyone can build) and the one rule that matters most, no manipulated signals.
lead: "Bluesky hands every reader a choice of feeds. Win over people, not one algorithm."
layout: field-manual
weight: 50
checked: 13 October 2026
lastmod: 2026-10-13

plate:
  file: fm-bluesky-open.webp
  alt: "Open Field Manual with a woodcut of an open sky and a flock of birds"
  caption: "No Bluesky logo in the art."
  w: 1280
  h: 720
---

## How Bluesky feeds work

- **Choice.** Bluesky's Discover feed mixes trending posts, posts from people you follow and posts from accounts near your network, and readers can swap it for any custom feed ([Bluesky blog, Jul 2023](https://bsky.social/about/blog/7-27-2023-custom-feeds)).
- **Anyone can build a feed.** Custom feeds are run by independent developers, who can choose posts by keyword, curated lists or machine learning ([Bluesky docs](https://docs.bsky.app/docs/starter-templates/custom-feeds)).

So there is no single algorithm to please. <span class="hypothesis">Hypothesis:</span> topic feeds that pick posts by keyword reward posts that name their topic clearly in plain words.

## What Bluesky prohibits

- "Do not send spam or repeatedly post content in ways that disrupt normal conversations or service use."
- "Do not artificially manipulate features or social signals to gain unearned reach or mislead users, including engagement metrics, follower counts, or other measures of community interest."

Both from the [Community Guidelines, updated 19 Sep 2025](https://bsky.social/about/support/community-guidelines).

## Do's and don'ts

- **Do** say plainly what your post is about.
- **Do** reply to people; conversation is the point.
- **Don't** repost one post from a crowd of your own accounts.
- **Don't** mass-follow to get follows back.

## What Blowhorn does on Bluesky

Through Bluesky's official API with an app password, never your main password: posts (threads past 300 characters), reposts for amplify, follows and unfollows, finds posts, and records follower trends ([Platforms](/docs/reference/platforms/)).
