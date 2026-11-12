---
title: Privacy
heading: What Blowhorn stores, and where
description: What the Blowhorn website and the Blowhorn app store, where they store it, and what the app sends.
lead: Last updated 11 November 2026. This page covers this website, the Blowhorn app and its Chrome extension. Your account is covered by the [account privacy policy](https://layer5.io/company/legal/privacy/) of Layer5, Inc., which makes Blowhorn.
layout: legal
weight: 10
aliases:
  - /privacy.html
lastmod: 2026-11-11
sitemap:
  changefreq: yearly
  priority: 0.3
---

## This website

blowhorn.ai is a static site served by GitHub Pages. Its fonts, images and styles are all served from this site. If you accept the cookie notice, it uses Google Analytics to count visits. That is its one script from a third party, and its cookies are the only ones the site sets. Until you accept, Google Analytics doesn't load and nothing is sent to Google. The site's other requests to another host are the download page's release lookup, the home page's recent-activity card, and the signup forms described below. The newsletter form in the footer sends nothing unless you submit it.

- GitHub serves the pages and keeps its own server logs. Those are covered by the [GitHub privacy statement](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement).
- The download page asks GitHub's public API for the newest release from your browser. That request reaches GitHub like any other request your browser makes, with your IP address and the usual request headers. With JavaScript off, no request is made and the download button still works.
- The home page's recent-activity card asks the Blowhorn account service (cloud.blowhorn.ai) for recently completed public activity from your browser. The request sends no cookies and no account details. It reaches Blowhorn like any other request your browser makes, with your IP address and the usual request headers. When a person has made their activity public, the card also loads their profile picture from the network the person uses (X, LinkedIn, Reddit, Bluesky, Slack or GitHub), from their Google account photo, or from Blowhorn's account service, with no referrer. If the request fails or nothing is public yet, the card shows labelled examples. With JavaScript off, no request is made.

### Google Analytics {#google-analytics}

Google Analytics 4 runs only if you choose Accept in the cookie notice.

- Before you choose: the site tells Google's tag that every kind of storage is denied (Google Consent Mode), and it doesn't load the tag at all. Nothing goes to Google and no cookie is set. Decline or the close button keeps it that way.
- If you accept: your browser loads Google's tag (gtag.js) from `www.googletagmanager.com` on each page. It sends Google which pages you view, how you arrived, and roughly where you are and what device and browser you use, along with your IP address and the usual request headers. It sets first-party cookies named `_ga` and `_ga_<id>` on blowhorn.ai so that repeat visits can be counted. Advertising storage stays denied.
- How it's used: Layer5 uses the reports only to improve this site, and doesn't combine them with your Blowhorn account. Google's handling is covered by the [Google privacy policy](https://policies.google.com/privacy) and [how Google uses information from sites that use its services](https://policies.google.com/technologies/partner-sites).
- If you accept, the site also keeps how you arrived (the campaign tags on the first page's address and the referring site's host, never the full address) in your browser's session storage (`blowhorn-docs-attribution`) and sends it with a few events on the MCP guides: a guide view, a code snippet copy and a click on an install or download link. Closing the tab or withdrawing consent removes it.
- Your choice is kept in your browser's local storage (`blowhorn-consent`), so the notice doesn't come back. To change it, use **Cookie preferences** at the bottom of any page. If you withdraw consent, the page reloads without the tag. You can also delete the `_ga` cookies in your browser settings.

### Newsletter signup

The footer form signs you up for the Blowhorn newsletter. It is a plain HTML form with no script, and nothing leaves your browser until you press Subscribe.

- What is sent: the email address you type, the page you signed up from, and an empty bot-trap field. Like any site your browser contacts, the service also receives your IP address and the usual request headers.
- Who receives it: Layer5, which runs the signup service at `api.blowhorn.ai` (a Cloudflare Worker, not a third-party form service), which stores the signup in a Cloudflare D1 database. No other company receives the signup.
- What it is for: the Blowhorn newsletter. Signing up does not create a Blowhorn account and adds nothing to your account.
- Where you go: submitting takes you to the thanks page on blowhorn.ai.
- How long it is kept: until you unsubscribe. Unsubscribed rows are deleted after 90 days.
- Leaving the list: every newsletter email has an unsubscribe link. To ask for deletion sooner, write to security@blowhorn.ai.

### Coming-soon lists and the Blowhorn newsletter

The coming-soon pages and the newsletter page use the same signup service as the footer form above. The only difference is what they ask for.

- What is sent: the email address you type, and, on a coming-soon page, the optional remark about what you want from the feature. The forms also send the page you signed up from, so a ship email can name the feature.
- Who receives it: Layer5, which runs the signup service. No other company receives the signup.
- What it is for: one email when the feature you signed up for ships, or the Blowhorn newsletter. Signing up for one list never adds you to the other, and neither creates a Blowhorn account.
- How long it is kept: until you unsubscribe. Unsubscribed rows are deleted after 90 days.
- Leaving a list: every ship email and newsletter email carries an unsubscribe link. To ask for deletion sooner, write to security@blowhorn.ai.

## The Blowhorn app

### On your computer {#on-your-machine}

- Every action Blowhorn takes is executed on one of your computers. On LinkedIn, X, Reddit and Hacker News, it acts through your Chrome profile. On Bluesky, GitHub, Slack and X, it calls the platform's API from your computer.
- Your Blowhorn account keeps the queue and results in sync across your computers and coordinates them. It does not sign in, post or act for you from a server.
- Configuration lives in `.blowhorn.yaml` inside the installation. The store connection, including its password, lives in `~/.config/blowhorn/store.yaml`, readable only by your user account.
- For LinkedIn, X, Reddit and Bluesky, the password a run signs in with is read from `profiles/<name>/config.yaml` inside the installation, and `blowhorn profile set` writes it there.
- The app keeps its cached copy of your organization's plan features in your macOS Keychain.
- Run logs are written to the `logs/` directory of the installation. The menu-bar app keeps its preferences and state under `~/Library/Application Support/Blowhorn/`.

### In Chrome, through the Blowhorn extension

The extension works only for the Blowhorn app on your computer, over Chrome's native messaging. It acts only on the sites Blowhorn supports, only in the Chrome profiles you install it in, and only when the app asks. Everything it reads goes to that app and nowhere else: it reports to no server of its own, and it keeps nothing itself.

- Sign-in information: a session cookie or token on a supported site, read when the app needs to reuse a sign-in you already have. Today that is your Slack workspace session, which the app keeps in your account (below).
- Your communications: the posts, comments and messages the app asks it to enter and send as you.
- Page content: what a page shows, read to tell when an action has finished; a screenshot when an action needs a person to check it; and an export you asked a site for, such as an analytics or connections export, which it catches and hands to the app.

<div id="in-your-organizations-store-on-layer5-cloud"></div>

### In your Blowhorn account {#in-your-blowhorn-account}

Keeping this in your account is what lets you install Blowhorn on any number of computers, your own or your teammates', and run them as one. Every computer works from the same queue, and the computers coordinate through it, so the same post isn't sent from two of them. Your analytics cover every computer. Your content still goes out as long as one of those computers is awake. Your account holds:

- The content queue, schedule, profiles, run history and analytics. Every row is scoped to your organization's id.
- Platform credentials, in your organization's credentials table: GitHub tokens, Hacker News passwords, and Slack tokens and workspace sessions. For profiles set up before October 2026, it also holds the LinkedIn, X, Reddit and Bluesky passwords copied in when those profiles moved to your account. Blowhorn reads these credentials when it checks which profile may act on which platform. GitHub, Hacker News and Slack runs sign in with the stored value; for Slack that is the workspace session captured from your Chrome, or a Slack app token you enter. LinkedIn, X, Reddit and Bluesky runs sign in with the copy in the local `config.yaml` above.
- Which Chrome profile each Blowhorn profile uses on each computer: the computer's name, the Chrome profile's folder and display name, and the Google account signed in to that Chrome profile.
- The handling of that data is governed by the [account privacy policy](https://layer5.io/company/legal/privacy/).

### What the app sends

- Posts, comments, reactions and invitations to the platforms a profile is configured for, when an approved row is due or when you run a command. Nothing is published from a dry run.
- A version check that lists the releases on the Blowhorn release channel, hosted on GitHub. The check needs GitHub credentials: when a GitHub token is already on your computer (`GH_TOKEN`, `GITHUB_TOKEN` or `gh auth token`), the app sends it with that request, and updating downloads the disk image published with the newest release, installs the Blowhorn app from it into `/Applications` and relaunches. Without a token, the update button opens that release page in your browser and the app downloads nothing itself.
- A request to your account for your organization's plan features, sent with your account token and your organization's id. The app caches the answer in your Keychain.
- No usage analytics. The app carries no analytics or crash-reporting library. The failure reports below are sent by the app itself.

### Failure reports {#failure-reports}

When the app shows a failure, such as a store it cannot reach, it saves a small failure report on your computer, at most one per cause per day. The report helps fix the problem. It is anonymous: it works while signed out, and it carries no account information. Saved reports can be sent to Blowhorn when reporting is available. Until then, they stay on your computer.

- What is sent, field by field:
  - `diagnosticId`: an id generated for this one report.
  - `occurredAt`: when the failure happened.
  - `firstSeenAt`: when the failure was first seen.
  - `count`: how many times the same failure occurred, with repeats on one computer counted together per day.
  - `client`: the app itself: kind `blowhorn-desktop`, version, buildSha and channel.
  - `os`: the operating system name, version and architecture.
  - `failure`: where the failure was shown (`surface`: tray, popover, console or service), the cause, the code, the message, and how many ticks were skipped (`ticksSkipped`).
  - `compat`: `requiresSchema` and `contractVersion`.
  - `installId` (optional): a random id for this install, never a hardware id. It is left out when unavailable.
- The failure message is redacted before sending, and is at most 500 characters. Paths, usernames, email addresses, profile names, post text and tokens are removed, and hosts are reduced to "cloud" or "custom".
- What is never sent: your email address, posts, account names, content, config files, logs and Chrome data.
- How long reports are kept: Blowhorn keeps failure reports for 90 days.
- Support follow-up: if you contact support about a failure, you may type in an email address for a follow-up. That address is sent only when you type it in. The automatic report itself contains no email address.
- Turning it off: failure reports are on by default. Turn them off in Posture, in the "Where your sign-ins live" card, under "Send failure reports". When off, no report is stored or sent.

## Frequently Asked Questions {#questions}

Open an issue on the [site repository](https://github.com/blowhorn-ai/blowhorn-site/issues) for anything about this page, or use the contact channels in the account [privacy policy](https://layer5.io/company/legal/privacy/).
