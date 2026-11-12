# The Blowhorn desktop app bounces in my dock and won't start. Why?


> What a bouncing dock icon means, and how to get the app open again without a terminal.


A bouncing dock icon means the app is alive but its first window never
appears. That is a launch problem, not a crash: a crashing app shows
"quit unexpectedly" dialogs instead. The window only opens after the app
loads its preferences, finds its bundled engine, probes its store, and
registers its command-line link, so a stall in any of those steps, or in
macOS's own first-launch check of a downloaded app, looks exactly like
this. A stall can also sit before all of those steps, in macOS's own
launch step, where the app's own code has not run at all. The last
section below tells the two apart.

You do not need a terminal for any step below.

## If Blowhorn was already on this Mac

This covers a re-install, an upgrade over an older version, and an
install into a different user account on a computer where Blowhorn was
already installed. The usual cause is a stale copy getting in the way of
the new one.

1. Quit the bouncing app: right-click (or Control-click) its dock icon
   and choose Quit. If it will not quit, open Activity Monitor, find
   Blowhorn, and quit it from there.
2. Check for an older Blowhorn still running. Look for its menu-bar
   icon: an older copy can be running with no window at all, and a new
   launch while the old copy holds the app's single-instance lock
   bounces forever with no window. If another user is logged in on this
   Mac, the running copy may be theirs; have them quit it, or log that
   user out, and then relaunch.
3. Open Blowhorn from Applications again.
4. If it still bounces, replace the copy: download Blowhorn again from
   [blowhorn.ai/download](https://blowhorn.ai/download/) and drag it to Applications,
   replacing the old copy. Your settings and data live outside the app,
   so they are kept.

To check which version you actually have, select the app in Finder and
choose File, then Get Info: the version is listed there. Compare it with
the version on the downloads page; a mismatch means the copy in
Applications is not the one you think it is.

On a Mac with more than one user account, a new account starts fresh:
settings and the background service belong to each user, so nothing
carries over from another account's install, and another account staying
logged in does not share settings with yours. The copy in Applications
is shared, though: if another account's session shows a dialog about
Blowhorn, don't let it move the shared copy to the Trash. See [Fix
"Blowhorn is damaged and can't be opened"](/docs/how-to/troubleshoot/damaged-cant-be-opened/).

## If this Mac never had Blowhorn before

The usual cause is macOS's first-launch verification of a downloaded
app.

1. Wait. A downloaded app is verified on first launch, and the
   "Verifying…" step can take a while on a slow or captive network. If
   a verification dialog is visible, let it finish rather than
   force-quitting through it.
2. If nothing changes after several minutes, quit the bouncing app as
   above and open it again from Applications.
3. If it still bounces, the download itself may be partial or corrupt:
   download it again from [blowhorn.ai/download](https://blowhorn.ai/download/) and drag the
   fresh copy to Applications.
4. Check the requirement: Blowhorn needs macOS 13 or newer.

## If it still will not open

A bouncing icon is about launching, not about signing in. Session
problems (a refused sign-in, an unreachable store) only appear once the
app's window is open, and they are fixed from inside the app: the
account menu offers sign-in again where a refusal shows up, and the
Debug menu opens the app's logs. If the window never appears at all,
restart your Mac and open Blowhorn from Applications again. If it still
bounces after that, note the macOS version and the app version from Get
Info and report both; those two facts decide what to check next.

## If it still bounces after a restart

The steps above need no terminal. These do, and they tell you whether
the stall is in Blowhorn or in macOS's launch step. They are also what
support will ask for, so they are worth doing before you report.

1. Open Activity Monitor and find Blowhorn. If it shows 0% CPU and
   "Not Responding", the app is waiting, not working. Then check whether
   it ever got as far as its own startup: in Finder, choose Go, then Go
   to Folder, and open `~/Library/Application Support`. If there is no
   Blowhorn folder there, the app never got far enough to write its own
   settings, so its settings cannot be the cause.
2. If other apps also will not launch, the Mac's launch system itself
   is stuck, not Blowhorn. Restart again and say so in your report; that
   fact changes what support checks.
3. Launch Blowhorn from Terminal and watch what it prints:

   ```bash
   /Applications/Blowhorn.app/Contents/MacOS/Blowhorn
   ```

   If it prints nothing and hangs, the hold is below the app. If the
   window opens from Terminal but not from the dock, the problem is in
   how Finder launches it.
4. While it is hung, take a sample of the process for support:

   ```bash
   sample Blowhorn 5 -file ~/Desktop/blowhorn-sample.txt
   ```

   If every sample in that file is in `_dyld_start`, the app's own code
   never ran at all: the process was held in macOS's launch step before
   its first instruction.

Report the macOS version, the app version from Get Info, whether the
Blowhorn folder exists in Application Support, whether other apps
launch, and the sample file. Those facts decide what to check next.

