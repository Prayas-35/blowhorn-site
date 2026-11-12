# Troubleshooting


> Start from the symptom: find the fix for what Blowhorn just told you.



Start from what you saw. Each symptom names its fix page.

## A post did not go out, or might have

- **X post NOT sent under the extension driver.** The extension's typing does
  not reach X's editor, so the run stops before anything is typed and tells
  you to rerun with `--chrome-launch persistent`. See [Post to X when it will
  not confirm](/docs/how-to/troubleshoot/x-posting/).
- **The run clicked Post but read nothing after it.** The activity says `clicked,
  outcome not read`: check the platform, then clear the date or leave it. See
  [Settle something Blowhorn could not confirm](/docs/how-to/troubleshoot/clicked-not-confirmed/).

## Sign-in problems

- **LinkedIn, X or Reddit says the session expired.** Sign in again in your
  mapped Google Chrome profile, or run `blowhorn profile auth` for that platform. See
  [Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/).
- **A CAPTCHA or second factor appears mid-run.** The run stops and hands the
  browser back to you. Complete the challenge by hand, then run again. See
  [Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/).
- **X sign-in under the extension driver stops at once.** The extension's
  typing does not reach X's form either. Sign in by hand in the tab, or run
  with `--chrome-launch cdp`. See [Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/).
- **Challenges keep coming back in one Chrome profile.** Curious what sites
  can see about that browser? Open the free check at [Blowhorn
  Tells](https://tells.blowhorn.ai/) in that profile. See [Fix a sign-in that
  stopped working](/docs/how-to/troubleshoot/sign-in-problems/#captcha-and-second-factors).

## The app

- **The menu-bar popup says the engine couldn't start, isn't responding, or
  asks you to move Blowhorn to Applications.** See [Fix Blowhorn when its
  engine won't start](/docs/how-to/troubleshoot/engine-wont-start/).
- **macOS says Blowhorn is damaged and can't be opened.** See [Fix
  "Blowhorn is damaged and can't be opened"](/docs/how-to/troubleshoot/damaged-cant-be-opened/).
- **The app icon bounces in the dock and no window appears.** See [Open
  the app when it bounces in the dock](/docs/how-to/troubleshoot/bounces-in-dock/).
- **An update sits on one step, or says it stalled.** See [Update
  Blowhorn](/docs/how-to/manage/update-blowhorn/#if-an-update-stalls).

## Chrome and the extension

- **The extension says not connected, or the versions mismatch.** Re-approve
  the connection after an update, or check which install route is on disk with
  `blowhorn chrome extension-status`. See [Fix the Chrome extension
  connection](/docs/how-to/troubleshoot/extension-connection/).
- **Another run holds the bridge or the profile.** Wait for it, or stop it;
  your activities stay queued. See [Fix the Chrome extension
  connection](/docs/how-to/troubleshoot/extension-connection/).
- **A run refuses an unmapped profile, or asks for an allow dialog you cannot
  see.** Check the mapping, or switch mode for that run. See [Choose how
  Blowhorn reaches Chrome](/docs/how-to/settings/launch-mode/).

## Schedule and store

- **A job did not run.** Ask the activity directly: `blowhorn schedule why
  <activity>`. See [Find out why a job did not run](/docs/how-to/schedule/why-not-run/).
- **Nothing is claimed on this computer.** You may be paused. See [Pause and
  resume posting](/docs/how-to/schedule/pause/).
- **Every account-backed command exits 3 saying your account is unavailable.**
  Nothing was claimed and nothing is lost. Run `blowhorn store`, find the
  sentence it prints in [Fix cannot reach your account](/docs/how-to/troubleshoot/store-unavailable/),
  and do what it says; usually that is `blowhorn auth login`.

## Related

- [Find out why a job did not run](/docs/how-to/schedule/why-not-run/) - one activity's state in one command
- [Settle something Blowhorn could not confirm](/docs/how-to/troubleshoot/clicked-not-confirmed/) - the held-activity procedure
- [Change your defaults](/docs/how-to/settings/defaults/) - pace, excluded profiles, logs

