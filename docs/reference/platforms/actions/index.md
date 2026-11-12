# All actions

> Every action Blowhorn takes on each platform, in one table. Sort by action or platform, or filter.


Each action links to its usage on that platform's page. For the
at-a-glance grid, including coming-soon platforms, see the
[action matrix](/integrations/actions/).


| Action | Platform | What it does |
| --- | --- | --- |
| [Post](/docs/reference/platforms/linkedin/#action-post) | LinkedIn | Publishes your message to your LinkedIn feed, to a group, or to a Page you manage, with an image or link preview when you add one. |
| [Post](/docs/reference/platforms/x/#action-post) | X (Twitter) | Publishes your message, with an image if you add one. A message longer than 274 characters goes out as a thread. X publishes 50 original posts a day for an account without a checkmark, and no setting in Blowhorn goes past it. |
| [Post](/docs/reference/platforms/reddit/#action-post) | Reddit | Publishes your post to the subreddit you name, as r/<name>. A post with no subreddit is skipped, never guessed. |
| [Post](/docs/reference/platforms/hacker-news/#action-post) | Hacker News | Submits a link or a text post. Titles hold up to 80 characters; a longer title is refused, never cut short, because a submission can't be edited once it's up. At most 2 link submissions per profile per UTC day; only link submissions are recorded, so only they count toward the cap. Preview first with --dry-run, because every submission is permanent. Blowhorn never votes. |
| [Post](/docs/reference/platforms/slack/#action-post) | Slack | Sends a message as you to a channel or to a person, as #channel, @user, a channel ID, or a channel link. Shows a preview until you confirm. One profile sends per run. A target Blowhorn can't read is refused, never sent somewhere else. |
| [Post](/docs/reference/platforms/bluesky/#action-post) | Bluesky | Publishes your message. A message longer than 300 characters goes out as a thread. |
| [Comment](/docs/reference/platforms/linkedin/#action-comment) | LinkedIn | Comments on the LinkedIn post you point it at. Anything that isn't a LinkedIn post address stays a normal post. |
| [Comment](/docs/reference/platforms/reddit/#action-comment) | Reddit | Comments on the Reddit post or comment you point it at. |
| [Comment](/docs/reference/platforms/hacker-news/#action-comment) | Hacker News | Comments on the Hacker News item your post is addressed to, under your name. |
| [Reply](/docs/reference/platforms/x/#action-reply) | X (Twitter) | Replies in a conversation when your post is addressed to it. X publishes 200 replies a day for an account without a checkmark, and no setting in Blowhorn goes past it. |
| [Reply](/docs/reference/platforms/slack/#action-reply) | Slack | Replies in a thread when you give it the link to the message. |
| [Reply](/docs/reference/platforms/bluesky/#action-reply) | Bluesky | Replies to the Bluesky post you point it at. |
| [Amplify](/docs/reference/platforms/linkedin/#action-amplify) | LinkedIn | Reposts a post from each of your profiles. A post you already reposted is never reposted twice. |
| [Amplify](/docs/reference/platforms/x/#action-amplify) | X (Twitter) | Retweets or quotes a post from each of your profiles. |
| [Amplify](/docs/reference/platforms/reddit/#action-amplify) | Reddit | Upvotes a post from each of your profiles. |
| [Amplify](/docs/reference/platforms/bluesky/#action-amplify) | Bluesky | Reposts a post from each of your profiles. |
| [React](/docs/reference/platforms/github/#action-react) | GitHub | Adds the five upbeat reactions (+1, laugh, hooray, heart, rocket) to an issue or pull request from each of your profiles. Running it again adds none of them twice. GitHub doesn't publish posts; it needs an issue or pull request link. |
| [Follow](/docs/reference/platforms/x/#action-follow) | X (Twitter) | Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself, skipping anyone you already follow. At most 400 follows per profile a day, and 15 in any 15 minutes, counted from that profile's follow log on this computer. |
| [Follow](/docs/reference/platforms/bluesky/#action-follow) | Bluesky | Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself. |
| [Follow](/docs/reference/platforms/github/#action-follow) | GitHub | Name a target account. With --limit 0, follow that account, or several comma-separated. With a positive limit, follow up to that many of the target's followers, never the target itself. |
| [Unfollow](/docs/reference/platforms/bluesky/#action-unfollow) | Bluesky | Unfollows one account. |
| [Accept](/docs/reference/platforms/linkedin/#action-accept) | LinkedIn | Accepts the invitations people sent you, one at a time. An invitation LinkedIn flags with its "Take care when connecting" warning is skipped, never accepted. At most 20 confirmed acceptances a run, unless you set --limit. |
| [Withdraw](/docs/reference/platforms/linkedin/#action-withdraw) | LinkedIn | Withdraws invitations you sent that have waited 21 days or more, to free room for new ones. Shows a preview until you add --apply. At most 20 confirmed withdrawals a run, unless you set --limit. LinkedIn blocks re-inviting a withdrawn person for up to three weeks. |
| [Find](/docs/reference/platforms/bluesky/#action-find) | Bluesky | Searches Bluesky posts for the words you give it. |
| [Find](/docs/reference/platforms/github/#action-find) | GitHub | Lists the people around a repository, so you can choose whom to reach. Lists only; it doesn't follow or react. |
| [Analytics](/docs/reference/platforms/linkedin/#action-analytics) | LinkedIn | Reads your Page's analytics for a date range and saves them, so you can watch the trend. Read-only. |
| [Analytics](/docs/reference/platforms/x/#action-analytics) | X (Twitter) | Records your follower and following counts on each run, so you can watch the trend. Read-only. |
| [Analytics](/docs/reference/platforms/bluesky/#action-analytics) | Bluesky | Records your follower and following counts on each run, so you can watch the trend. Read-only. |


