# Fix a sign-in that stopped working


> Recover expired LinkedIn, X and Reddit sessions, and hand CAPTCHAs back to yourself.



Sessions expire. When one does, sign in again by hand in the mapped Google Chrome
profile, or run `blowhorn profile auth` for that platform. Scheduled passes
never wait for a person: an unattended job whose session is gone fails by
name instead of hanging.

## LinkedIn

When LinkedIn challenges the session or signs it out, the run stops and names
the step. Sign in again in the mapped Chrome profile's window, complete any
challenge LinkedIn shows, then run again. If the challenge keeps returning,
pause the schedule until it clears so no pass spends itself against it.

## X

Check the session first without posting anything:

```bash
blowhorn profile auth --platform x --profile ada
```

Under the extension driver the walk runs nowhere: the extension's typing does
not reach X's sign-in form, so sign in by hand in the tab, or run with
`--chrome-launch cdp` to use the stored credentials.

Blowhorn types only into the sign-in dialog's own field, and only into a field
a person could actually click. It never navigates the page away, never submits
the username twice, and leaves the form where it is when the walk stops so you
can finish it yourself.

When the page says the account is limited or disabled, the run stops rather
than waiting or retrying. Wait until X permits another sign-in before trying
again.

## Reddit

When Reddit reports the session expired, sign in again in the mapped Chrome
profile and run again. A failed step leaves a screenshot and a scrubbed copy
of the page under the checkout's `data/cache/diagnostics/<profile>/` directory, and
names the step and the reason. Field values are never in that copy.

## CAPTCHA and second factors

Any CAPTCHA or second factor hands the browser back to you: the run stops,
completes nothing on your behalf, and leaves the page where it is. Complete
the challenge once by hand, then run again. For a login that always needs you
present, run with `--headed` so the window stays visible.

If challenges keep coming back in one Chrome profile, open the free check at
[Blowhorn Tells](https://tells.blowhorn.ai/) in that profile. It shows what
sites can see about the browser, such as a VPN or proxy, an automation flag, or
a WebRTC address that doesn't match your connection. Pause the schedule while
you sort it out.

## Related

- [Post to X when it will not confirm](/docs/how-to/troubleshoot/x-posting/) - the X composer and its confirmation
- [Troubleshooting](/docs/how-to/troubleshoot/troubleshooting/) - start from a symptom instead
- [Blowhorn Tells](https://tells.blowhorn.ai/) - a free check of what sites can see about your browser
- [Pause and resume posting](/docs/how-to/schedule/pause/) - hold the schedule while a challenge clears
- [Choose how Blowhorn reaches Chrome](/docs/how-to/settings/launch-mode/) - which mode a sign-in runs under
- [You're in control](/docs/explanation/youre-in-control/) - why CAPTCHAs and 2FA are left to you

