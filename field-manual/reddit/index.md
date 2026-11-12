# Reddit: where the locals hold the line

> Every subreddit is a village with its own sheriff. The algorithm counts votes; the moderators count you. Win both.


## Roll call of the fallen

Private Link-Drop arrived in r/programming with his product link and no history. Removed in minutes. Corporal Copy-Paste left the same helpful comment in nine threads; the ninth sheriff noticed the first eight. And Sergeant Upvote rallied his own accounts behind a post. Reddit has a name for that, and it is not "teamwork."

(Composites, recruit. Reddit's rules are quoted below, word for word.)

## How Reddit ranks posts

**Votes, then time.** Reddit's own open-source code, archived in 2017, shows the "hot" formula: the log of a post's net votes plus its age, so a post needs ten times the net votes to keep up with one posted 12.5 hours later ([reddit-archive/reddit, `_sorts.pyx`](https://github.com/reddit-archive/reddit/blob/master/r2/r2/lib/db/_sorts.pyx)). In plain terms: the first votes count most, and every post fades. <span class="hypothesis">Hypothesis:</span> Reddit's ranking today has changed since that code was archived, and the home feed now adds recommendations. The shape (early votes, fast decay) still matches what redditors report.

**The community decides first.** Moderators "adjudicate what constitutes unwanted/spammy content in their communities and may take action accordingly" ([Reddit Help: Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)). A removed post ranks nowhere.

## What Reddit rewards

- **Belonging.** "Post authentic content into communities where you have a personal interest" ([Reddit Help: Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)).
- **Mostly helping, sometimes promoting.** "Promotional content is not inherently considered to be spam." Some communities use the 10% rule: "only 10% of your posting and comment history in the community can be self-promotional in nature, while the other 90% should be helpful, organic content" ([Reddit Help: Keeping spam out](https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community)).
- **Reading the local rules.** "Check to see if the community you want to engage with has specific rules in addition to the guidelines above" ([Reddit Help: Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)).

## What gets you removed or banned

**Spam,** "repeated or unsolicited actions (whether automated or manual) that negatively affect redditors, communities, and/or Reddit itself," which "is never allowed." Reddit's examples include "Mass-posting repetitive content for the purpose of exposure or financial gain," "Repeatedly posting or sharing old content for the purpose of rapidly gaining karma," and "Using tools (e.g., bots, generative AI tools) that may break Reddit or facilitate the proliferation of spam" ([Reddit Help: Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)).

**Repeating yourself.** "Repeatedly posting the same or similar comments in a thread, community or across communities," and "Repeatedly posting unrelated/off-topic/link-farmed content." Spam "is a violation of the User Agreement and Reddit Rules, punishable by content removal and temporary or permanent banning of the user's account" ([Reddit Help: Keeping spam out](https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community)).

**Mostly links to your own business.** "If your contributions to Reddit consist primarily of links to a business that you run, own, or otherwise benefit from, please be thoughtful about the frequency of posting, or consider advertising" ([Reddit Help: Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)).

**Vote manipulation, of any kind.** Reddit prohibits "Vote cheating or manipulation, whether manual, programmatic, or otherwise," including "Creating and employing multiple accounts, voting services, or any automation to manipulate vote counts" and "Engaging in coordinated voting with an organized group of people (or bots) to target a specific post" ([Reddit Help: Disrupting communities](https://support.reddithelp.com/hc/en-us/articles/360043066412-Disrupting-Communities)).

## Do's

- **Join before you post.** Comment helpfully for a while in a community before you share anything of yours.
- **Keep promotion to a sliver.** Use the 10% rule as a ceiling, and follow a stricter subreddit rule when there is one.
- **Write for that subreddit.** A post tailored to r/devops is not a post for r/kubernetes. Rewrite it.
- **Post when the community is awake.** Early votes count most in the hot formula.
- **Answer every comment yourself.**

## Don'ts

- **Don't upvote your own post from your other accounts.** Not once. Reddit names it, and so does this manual.
- **Don't post the same comment twice,** in one thread or across many.
- **Don't drop a link and leave.**
- **Don't ask anyone to upvote you.**
- **Don't use AI to write your comments.** Reddit lists generative AI tools among the tools that can "facilitate the proliferation of spam," and many communities ban AI text outright.

## Field notes

- <span class="hypothesis">Hypothesis:</span> new accounts with little karma get filtered or removed more often. Many subreddits set karma and account-age minimums in their rules; Reddit doesn't publish site-wide numbers.
- <span class="hypothesis">Hypothesis:</span> link posts to your own domain trip spam filters faster than text posts that explain and then link. Common moderator advice, not a Reddit rule.

## What Blowhorn does on Reddit

Blowhorn posts to the subreddit a row names (never a guessed one), comments, and has an upvote amplify action, from your own browser ([Platforms](/docs/reference/platforms/)). Read that last one against Reddit's rule above: an upvote from more than one profile you run on the same post is what Reddit calls vote manipulation. Our advice: never use Reddit amplify across your own profiles. Post from one account, as yourself, and let Reddit's voters do the voting.

