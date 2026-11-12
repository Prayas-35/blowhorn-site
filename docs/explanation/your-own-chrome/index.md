# Why Blowhorn uses your own browser


> Your signed-in browser through the extension, APIs where they exist, and never headless.



Platforms trust people, not programs. A post that arrives from a
browser you signed in to, carrying your session, your history, and
your ordinary behavior, reads as you. A post from a datacenter browser
that never slept reads as automation. Blowhorn therefore acts in the
browser you already use, and reaches for an API only where the platform
offers one it can honestly use.

The extension drives your signed-in browser: the tabs you have open, on
the sites Blowhorn acts on, with the sessions you made by hand. There
is no second browser to sign in to, no session to export, and nothing
that rots when a cookie expires except the session itself, which you
renew by signing in again. Scheduled passes drive the same browser
through the same extension; an unattended run never waits for a person
at a sign-in or a challenge, it stops and says so.

## A Chrome profile of its own

Blowhorn works in a Chrome profile set aside for it, never the one you
browse in. Its tabs open in that profile's window, in a collapsed group,
so a run never lands among your own tabs, and you keep working while it
posts, likes and connects for you. The accounts Blowhorn uses are signed
in there once, by you, and stay yours.

Google Chrome's main profile, the one Chrome made first, stays yours for the
same reason, and because Chrome 136 and later refuse the debugging
connection a run can need on Chrome's own data folder. So when the main
one is all you have, setup asks Google Chrome to make Blowhorn a profile
of its own (`blowhorn chrome create-profile`), and you sign in there
once. A main profile that an earlier setup already mapped keeps working.

Blowhorn works in Google Chrome whatever your default browser is. If
Safari or another browser is your default, it stays your default: a
sign-in link may open there, and every window Blowhorn needs is opened
in Google Chrome by name.

Slack, Bluesky, and GitHub post through their APIs above the browser,
because those calls carry a token, not a pretense. Everything else
drives your browser, because anything else would be a poorer copy of you.

The browser is never launched headless, and never swapped for bundled
Chromium. A headless browser announces itself in every request while
its hints still claim Google Chrome, and the bundled build announces
itself in both. Either would mark the run as automation to every site
it touches. An unattended run takes the minimized background window
instead: invisible, but honest about what it is.

What a site sees is therefore your own user agent, your own session,
and input delivered as keystrokes and clicks in your own browser,
paced rather than fired off all at once. That honesty is also the limit: a CAPTCHA or a
second-factor challenge hands back to you, always, because passing it
for you would stop being you.

Curious what sites can see about your browser? Run the free check at
[Blowhorn Tells](https://tells.blowhorn.ai/) in the Google Chrome profile you
post from. It lists the bot-detection and fingerprint signals a page can
read, in plain words.

## Related

- [Chrome reference](/docs/reference/chrome/) - launch modes and the extension default.
- [Chrome extension permissions](/docs/reference/extension-permissions/) - what the extension may do.
- [Platforms](/docs/reference/platforms/) - which platforms drive the browser and which use APIs.
- [How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/) - the pauses between actions.
- [Map Blowhorn profiles to Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/) - the browser half of setup.
- [You're in control](/docs/explanation/youre-in-control/) - one automation per profile and platform.
- [Install the Chrome extension](/docs/how-to/set-up/install-the-chrome-extension/) - put the extension in your browser.
- [Blowhorn Tells](https://tells.blowhorn.ai/) - a free check of what sites can see about your browser.

