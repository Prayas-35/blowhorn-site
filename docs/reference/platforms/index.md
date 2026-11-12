# Platforms

> What Blowhorn does on each platform: supported actions, browser or API, sign-in, and limits.



What Blowhorn can do on each platform, how it reaches
each one, and the limits it honors. This page describes; the steps live
in the how-to guides linked under Related.

> **The Major says:** "Two hundred seventy-four characters before X wants a thread. I don't make the rules. I thread them."


Four platforms drive your own signed-in Google Chrome through the extension:
LinkedIn, X, Reddit, and Hacker News. Three post through their APIs
above the browser: Slack, Bluesky, and GitHub. A platform is usable the
moment its credential exists; see [Who can post as whom](/docs/explanation/eligibility/).

`blowhorn post --platform` accepts one of: `linkedin`, `x`, `reddit`,
`hn`, `slack`, `bluesky`, `github`, or `all`. `twitter` reads as `x`
and `bsky` as `bluesky`. GitHub is amplify-only under `post`: it needs
an issue or pull-request URL and refuses without one.

Each platform has its own page, listing its supported actions and how each one behaves there:

<div class="grid grid-2 platform-cards">
  <a class="card docs-card platform-card" href="/docs/reference/platforms/linkedin/">
    <span class="h3">LinkedIn</span>
    <span>Browser, through the extension</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/x/">
    <span class="h3">X (Twitter)</span>
    <span>Browser, through the extension</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/reddit/">
    <span class="h3">Reddit</span>
    <span>Browser, through the extension</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/hacker-news/">
    <span class="h3">Hacker News</span>
    <span>Browser, through the extension</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/slack/">
    <span class="h3">Slack</span>
    <span>API, never the browser</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/bluesky/">
    <span class="h3">Bluesky</span>
    <span>API, never the browser</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/github/">
    <span class="h3">GitHub</span>
    <span>API, never the browser</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/youtube/">
    <span class="h3">YouTube</span>
    <span>Coming soon - not generally available yet</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/instagram/">
    <span class="h3">Instagram</span>
    <span>Coming soon - not generally available yet</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/tiktok/">
    <span class="h3">TikTok</span>
    <span>Coming soon - not generally available yet</span>
  </a>
  <a class="card docs-card platform-card" href="/docs/reference/platforms/facebook/">
    <span class="h3">Facebook</span>
    <span>Coming soon - not generally available yet</span>
  </a>
</div>

YouTube, Instagram, TikTok, and Facebook are coming soon. None of them
is generally available yet, `blowhorn post --platform` does not list
them, and each page will list its actions once it ships.

## Limits

Every platform and action has a built-in daily ceiling, enforced per
profile from the run ledger in your account, so a cap holds on every
computer that shares the account; each platform's page carries its
numbers. A Risk Profile preset may take only a share of a ceiling, and
you can set a lower daily cap of your own per platform and action --
`defaults.caps` for every profile, or one profile's `Daily Caps`
attribute -- but never a higher one. See
[Daily caps](/docs/reference/configuration/#daily-caps).

## Related


- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Post to Hacker News](/docs/how-to/publish/post-to-hacker-news/) - the strictest platform, worked.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Send a Slack message](/docs/how-to/publish/send-a-slack-message/) - Slack, worked.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - which actions are safe and which risk a penalty, per platform.
- [Developer distribution](https://blowhorn.ai/solutions/developer-distribution/) - Hacker News, Reddit, GitHub, Slack, X and Bluesky from one queue, for a developer launch.

