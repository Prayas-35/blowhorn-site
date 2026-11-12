# X: the feed that published its battle plans

> Most generals hide their maps. X put its ranking code on GitHub. The Major read every line so you don't have to.


## Roll call of the fallen

Sergeant Same-Post posted one announcement from five accounts in the same minute. Private Repost-for-Repost traded reposts with a stranger who traded with three hundred more. Lance Corporal Trending tacked a hot hashtag onto a product launch it had nothing to do with. X wrote a rule for each of them, and we quote every one below.

(Composites, recruit. The rules are real.)

## What X's ranking rewards

X has published its For You ranking twice. In 2023 Twitter released its "heavy ranker" with the weights it used on 5 April 2023 ([twitter/the-algorithm-ml](https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md)). In 2026 X published the system it runs now, a transformer model called Phoenix ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)).

**Both work the same way.** The model predicts how likely you are to take each action on a post, then adds those predictions up with a weight for each action: `Final Score = Σ (weight_i × P(action_i))` ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)).

**The actions X counts today** (same source):

| Kind | Actions |
| --- | --- |
| Engagement | like, reply, repost, quote, share, share by DM, share by copy link |
| Clicks | the post, the profile, a link, a photo, a video, a quoted post |
| Attention | dwell, dwell time, video views and seconds watched, time on your profile |
| Author | follow |
| Negative | not interested, mute, block, report, not dwelled |

**Conversation beats applause.** In the 2023 weights, a predicted reply scored 13.5, a reply the author then engages with scored 75, opening the conversation and replying or liking scored 11, and a like scored 0.5 ([twitter/the-algorithm-ml](https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md)). X says the weights have been adjusted since, and the 2026 repo keeps them in its code rather than its README. The direction is the lesson: a reply, especially one you answer, is worth far more than a like.

**Time matters.** Dwell, dwell time and "not dwelled" are all in the 2026 action list. A post people stop on is a post that ranks.

**New voices get a hand.** "Posts from authors whose impressions are below a threshold are lifted toward a target position" ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)).

## What sinks a post on X

**Negative reactions.** Not interested, mute, block, report and not dwelled carry negative weights. X warns these weights scale each reader's predicted chance of acting, not raw counts: "it'd be incorrect to see that a report has 468 times higher weight than a like and conclude that... '1 report cancels out 468 likes'" ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)).

**Your account's reputation.** X runs jobs that "label an account from how others respond to its posts: blocks, reports and spam reports relative to favorites," and a service that can label, challenge or suspend accounts from those scores (same source). X is piloting an [Under the Hood](https://x.com/i/jf/under_the_hood) page where you can see labels on your own account.

**Posting too much in a row.** "Each post after an author's first is multiplied by a decaying factor, down to a floor" (same source). Ten posts in an hour compete with each other.

**Reaching strangers is harder.** Posts from accounts a reader doesn't follow are multiplied by a factor below 1, and reposts and replies from accounts a reader doesn't follow are filtered out of For You (same source).

**Duplicates.** "You may not post duplicative or substantially similar posts on one account or over multiple accounts you operate" ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation)).

**Several accounts, one message.** X's platform manipulation policy names "operating multiple accounts that interact with the same or substantially similar content... in order to inflate or manipulate the prominence of content" and says "Do not create multiple accounts to boost or amplify one of your own accounts by misusing engagement features (likes, reposts)" ([X platform manipulation policy](https://help.x.com/en/rules-and-policies/platform-manipulation)).

**Trades and purchases.** The same policy prohibits "selling/purchasing Post or account metric inflation" and "'Repost for Repost' behavior."

**Trend hijacking.** "You may not automatically post about trending topics on X, or use automation to attempt to influence or manipulate trending topics" ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation)).

**What X does allow.** "Coordinating with others to express ideas, viewpoints, support, or opposition towards a cause, provided such behavior does not result in violations of our rules" ([X platform manipulation policy](https://help.x.com/en/rules-and-policies/platform-manipulation)). Friends who choose to share, in their own words, are fine.

## Do's

- **Ask a real question, then answer the replies.** In X's 2023 published weights, the reply the author engages with ranked among the heaviest positive weights.
- **Write posts worth stopping for.** Dwell is in the model; a skim is a negative.
- **Give people something to send.** Share by DM and copy link are counted actions.
- **Space your posts out.** The author diversity decay means your own posts compete with each other.
- **Check Under the Hood** if your reach falls off a cliff.

## Don'ts

- **Don't post the same text from two accounts,** ever. Rewrite it, or repost the original.
- **Don't run a repost wave from your own accounts.** Several accounts you operate boosting one post is the textbook case in X's policy.
- **Don't trade or buy reposts, likes or follows.**
- **Don't ride a trending hashtag** that has nothing to do with you.
- **Don't post things people mute you for.** One block costs more than you think.

## Field notes

Not from X. Treat as hunches until your own analytics agree.

- <span class="hypothesis">Hypothesis:</span> posts with an outside link reach fewer people than posts without one. Widely reported by users. The 2026 code counts link clicks as a positive action, and we found no link penalty in the parts of the code we read. Test it yourself.
- <span class="hypothesis">Hypothesis:</span> the first 30 to 60 minutes decide a post's reach, and a post that stalls early rarely recovers. Commonly reported; X hasn't published a window. What X has published is the weight on replies, quoted under [Conversation beats applause](#what-xs-ranking-rewards). Together they say: post when you can answer the first replies yourself ([Won or lost in the first hour](/resources/articles/won-or-lost-in-the-first-hour/)).
- <span class="hypothesis">Hypothesis:</span> paid X Premium accounts get extra reach. Common belief; we didn't confirm it in the published code.

## What Blowhorn does on X

Blowhorn posts (threads past 274 characters), replies, reposts or quotes for amplify, follows, and records follower trends, all from your own browser ([Platforms](/docs/reference/platforms/)). Follows are capped at 400 per profile a day and 15 in any 15 minutes; those are Blowhorn's limits, not numbers X guarantees. Sessions on X break more often than on other platforms; Blowhorn hands sign-in back to you. Keep amplify to a couple of profiles you really run, spread out in time, and never send copies.

