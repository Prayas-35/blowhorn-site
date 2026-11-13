---
title: "Set up Blowhorn at first muster"
aliases: [/docs/how-to/set-up/first-run-setup/]
description: "What each step of the desktop app's first-muster setup does, and what it never does."
weight: 33
---


The guided setup opens by itself the first time you open Blowhorn, and every
time after that until you finish it. If you quit partway, or come back with
Home's **Finish setting up**, it checks what is already done and opens
straight on the first step that isn't, with one line saying so. It never asks
whether to pick up first. If your sign-in ended, it asks you to sign in once,
then picks up the same way. If you are signed out when you open Blowhorn, it
starts at Sign in. Uninstalling removes that progress with the sign-in, so
the next open is a first muster. If you set Blowhorn up before this setup
existed and you are still signed in, it doesn't open by itself. Updating
alone never opens it again; it reopens by itself, from the first step, only
when a new version of Blowhorn needs something your earlier setup did not do.

- **Sign in:** one screen does the welcoming and the signing in: Major
  Blowhorn says hello and asks for your papers. Sign in to your Blowhorn
  account, or choose **Create account**.
  Both open your browser and bring you straight back to the app. Create
  account opens the sign-up page, and once you confirm your email the
  app moves on by itself. Once you are signed in, setup goes straight on
  to setting up your account, with no **Next** to press; if your account
  belongs to more than one organization, it stops there for you to pick
  one. Point at an organization, or move to it with the keyboard, to see its
  description and its ID, which tell apart two organizations with the same
  name. **Back** from the next step still shows who you are signed in as,
  with **Not you? Sign out**. There is no extra page asking you to allow it. If the browser attempt fails, or you close it before
  finishing, **Cancel** on
  the waiting screen stops the wait right away - you never have to wait
  it out - and **Open it again** ends the old attempt and starts a fresh
  one. See [Create a Blowhorn account](/docs/how-to/set-up/create-an-account/).
- **Google Chrome first:** right after your account is set up, Blowhorn
  checks Google Chrome. With no Google Chrome on this computer, the next
  screen is **Blowhorn needs Google Chrome**: **Get Google Chrome** opens
  Google's download page, and once it is installed the app notices by
  itself when you come back to its window (or choose **Check again**).
  If Safari or another browser is your default, the screen says you can
  keep it.
  A Google Chrome older than Blowhorn needs, or one that has never been
  opened, gets its own screen the same way. Google Chrome is found in
  your computer's Applications folder or in your own `~/Applications`.
  **Check again** on these screens, and on Getting ready, reads
  **Checking…** and then says what it found: Google Chrome found (the
  app moves on, or says what is still needed), **Nothing new found** with
  what is still true (Google Chrome is still missing, still out of date,
  or still hasn't been opened), or why it couldn't read Google Chrome.
  Coming back to the window checks quietly and only speaks when
  something changed.
- **Blowhorn's own window:** one screen says Blowhorn deploys in its own
  Google Chrome window, so you keep working in yours while it posts,
  likes and connects for you. **What's a Google Chrome profile?** explains
  the rest if you want it. If another browser, such as Safari, is your
  default, the screen says it stays your default: there is nothing to
  change. **Continue** moves on. The row of five steps across the top
  (Mission, Sign in, Browser, Profiles, First post) shows where you are on
  every screen, and **Back** at the bottom left returns to the screen before.
- **Assign troops:** Blowhorn shows what it found in each Chrome
  profile: the Google account, and the platform accounts signed in or
  saved there. Mark each Chrome profile and each account **in use** or
  **not in use**. For a profile that isn't in Blowhorn yet, confirm the
  name it will be created under. The profiles you mark in use are the ones
  the next step installs into, and a profile you mark not in use is left
  alone. Chrome's main profile is not listed here, since Blowhorn never
  works in it; a main profile an earlier setup already mapped is listed
  and keeps its switch. If the main profile is the only one you have, the screen
  reads **Blowhorn will set up its own profile**: choose **Set up
  Blowhorn's profile**, and Google Chrome is asked to open a new window
  in a profile of Blowhorn's own (Chrome should make the profile the
  first time, and open the same one after). Your main profile is left
  untouched. Sign in there once to LinkedIn, X and the rest, then come
  back: the app looks again by itself, or choose **Continue**. You can
  add the rest later, any time. **Open the window again** reopens it.
  Rather add a profile yourself? The steps are under **What's a Google
  Chrome profile?** on that screen. On **Confirm**, Blowhorn creates the profiles you marked in use,
  saves the handles (and a GitHub token or Bluesky app password you type
  on the activity), and maps each of those Chrome profiles. A profile you mark
  not in use is recorded that way: its mapping on this computer is
  removed, and a run of every profile skips it. A profile you had already
  excluded stays excluded. Marking it in use again removes that skip only
  when this screen added it. The Blowhorn profile and its saved sign-in
  stay. An account you mark not in use is skipped on this computer, and
  its saved sign-in stays too. Nothing is created or
  installed until you confirm. See
  [Map Chrome profiles](/docs/how-to/set-up/map-chrome-profiles/).
- **Getting ready:** Blowhorn finds your Chrome profiles, then says what it
  installs - the Chrome extension in the profiles you marked in use, plus a
  helper, the `blowhorn`, `blowhorn-axi` and `blowhorn-mcp` commands for the whole
  computer - and waits for your **Continue** before writing anything. It
  adds its extension only to the profiles you marked in use on Confirm
  troops, one at a time: Chrome opens Blowhorn's page in each, and you click
  **Enable now** (or **Add to Chrome**) there. There is no administrator
  prompt and no profile you left out is touched. Each step shows as it
  runs, with the time left, and **Start again** appears if it takes
  longer than usual. A profile that already has the extension on
  needs nothing. One ready profile you chose
  is enough to go on. If Google Chrome is on this computer but has never
  been opened, setup stops on its own screen (before Blowhorn's window
  screen, and again here if that changed) and asks you to open Google
  Chrome once, then check again: Chrome creates its profile list on that
  first open, and there is no list for Blowhorn to read before it. The
  same screen appears when you reopen Blowhorn already signed in, or come
  back to a setup you left. If a step
  does stop with something wrong, its screen says what stopped in one
  sentence, and **Copy details** keeps the full details for support. See
  [Install the Chrome extension](/docs/how-to/set-up/install-the-chrome-extension/).
- **First post:** write a post and pick where it goes. It lands in your queue
  as a draft, and nothing is posted until you approve it in Content. You can
  also skip this: **Skip for now** finishes guided setup, and Home won't ask
  for a first post again. Write one any time with **New activity**. See
  [Post content](/docs/how-to/publish/post-content/).
- **Home:** you're done. Connect your platform accounts any time. See
  [Platform accounts](/docs/how-to/set-up/platform-accounts/).

## Leaving a Chrome profile out

A Chrome profile you leave unchecked on Confirm troops is not in use, and
guided setup leaves it alone: it gets no extension from this setup, no
Blowhorn profile and no mapping.

If you run guided setup again and leave out a profile that an earlier
setup already put the extension in, this setup cannot take the extension
out of that one profile, and it never removes an extension on its own.
The extension stays in that profile
until you remove it there yourself (in that profile, open
`chrome://extensions` and remove Blowhorn). This setup never adds it
again, never maps that profile, and its being ready there counts for
nothing here.

## The rest of the app stays limited until Getting ready

- **Limited until then:** the rail's places (Dashboard stays open), and the **+** New activity button,
  stay locked until you're signed in and the extension is ready. Home, and
  any place you already opened, stay on screen, and anything that would
  take you somewhere else - a rail item, the menu bar's buttons, a capture
  link - brings you back to Home instead. There is no separate training
  page. While the guided setup is open it fills the window, with no rail
  beside it; sign in from the sign-in step. The
  rail does not add another Sign in, and it hides this computer's status
  until you are signed in. After setup, if you are signed out, Home's
  **Finish setting up** opens the guided setup again. The menu bar shows
  **Welcome to Blowhorn** and one **Open Blowhorn** button, which opens the
  console, instead of a pause or an error; signed in with the extension not
  ready yet, it shows **Finish setting up** and the same one button. When you are
  signed in, the account button stays usable, so you can still sign out or
  open the docs.
- **It checks for real:** the lock reads your actual sign-in and extension
  state each time you come back to the window, so signing out later locks it
  again until you sign back in. The extension counts as ready once it's
  turned on in at least one Chrome profile, set to install by your
  organization's policy, or answering. Getting ready never adds the
  extension twice: once Chrome is set to add it, it writes nothing again.
- **Open it again any time:** choose **guided setup** at the bottom of
  Settings.
- **Missing tools come first:** if Blowhorn's own tools aren't set up on this
  computer yet, the Setup screen shows first. See
  [Install the app](/docs/how-to/set-up/install-the-app/).

## Going back and forward is safe

- **Next checks first:** each step checks that its work is really done (you're
  signed in, the extension is ready in at least one Chrome profile you marked
  in use, your choices are saved) before it lets you go on. If it isn't, the
  step says why, right under the button.
- **Back never redoes harmful work:** going back and forward again skips what's
  already done. The extension is never added twice, sign-in is not repeated
  while you're signed in, and your first post is never added to the queue
  twice.
- **Re-checking is fine:** finding profiles again and changing a choice are
  safe to repeat.
- **No pop-ups:** every status and every reason shows on the step itself,
  including when your progress couldn't be saved.
