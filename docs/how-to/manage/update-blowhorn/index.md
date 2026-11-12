# Update Blowhorn


> Install a newer Blowhorn from the app, follow each step as it runs, and what to do if an update stalls.


Blowhorn tells you when a newer version is out and installs it for you. You
need no GitHub account, and your settings, data and background service are
kept.

## Start an update

When a newer release is out, the menu-bar popup shows a card with the new
version and an **update** button. The Home screen (the **Update to
Blowhorn** card at the top of its results column), the Setup screen
(**update now**) and the This computer screen
offer the same update. Press any of them.

The app also checks each time you open it. If that check finds a newer
release, a prompt in the console window asks before anything is downloaded:
**Update now** starts it, **Later** skips that version.

You can check on demand instead of waiting: in the menu bar, open the
Blowhorn menu and choose **Check for Updates…**. If you are up to date it
says so; if the check fails it says why; if a newer release is out, the
console window asks before anything is downloaded, exactly as above.

Whichever way the update starts, the download checks once more for the
newest release before downloading anything, so the version installed is
the latest one at that moment, even if the offer you clicked named an
older one. There is no second prompt for the newer version: the click
already said update. If that last check fails, nothing is downloaded;
try the update again.

Blowhorn may also tell you it is out of date itself: when the server's
minimum app version is newer than the build you run, a scheduled pass
claims nothing and `schedule status` names the cause `app_outdated`.
That is the same update, reached from the other side -- press **update**
here and the next pass claims again.

`/Applications/Blowhorn.app` is one app for every macOS user on the Mac.
While another user on this Mac has Blowhorn open, or has its background
service running after quitting it, the update says so and waits: it installs
once they quit it and their service stops.

## What you see while it updates

In the console window the update covers the whole window, so you can see it
is working wherever you started it; nothing else can be done until Blowhorn
reopens. In the menu-bar popup the update card shows the same steps. Each
step is named as it happens:

1. **downloading**, with a progress bar, the percent done, how many MB of the
   total have arrived, and about how long is left. The time left comes from
   how fast the download has been going over the last few seconds.
2. **installing**. The new app is copied into Applications and swapped in.
   If anything fails, your current version is put back.
3. **finishing setup**. Blowhorn runs `blowhorn setup --yes` to refresh its
   Google Chrome connection for the new version: the native host file
   (`com.blowhorn.chrome_extension.json`) and the small launcher it names,
   rewritten only if they are out of date. Nothing else changes: Chrome is not
   opened, and your Chrome profiles, other apps' hosts, sign-in and Blowhorn
   settings are left alone. If you installed `blowhorn-axi` globally, it is
   updated too. This usually takes a few seconds. If it fails, your current
   version is put back.
4. **relaunching**. Blowhorn closes and the new version opens. If Blowhorn
   asks what to do about work in progress before it closes and you choose
   **stay open**, the new version stays installed and opens the next time you
   start Blowhorn, or when you press **update** again.

Installing and finishing setup have no bytes to count, so the bar
sweeps and Blowhorn says how long the step usually takes, for example
"usually about 20 seconds". Blowhorn times these steps on your computer each time
it updates and uses those timings next time. Until it has its own, it uses
timings measured on an Intel iMac: about 20 seconds to
copy the app and a few seconds to finish setup.

## Your data moves with the update

A new version may keep your data in a new place. When it does, the first
time the new version opens, it carries your profiles, settings, run history
and pause over before the background service starts. You need no Terminal,
and there is nothing for you to do. The old place is left exactly as it was.

If a scheduled pass is running when the new version opens, the carry waits
until the pass ends, and the service stays as it was until then. If the
carry cannot finish, the service is put back as it was and the next launch
tries again. A notification says what was carried, and the Setup screen's
**this computer on duty** row and the Service screen carry the same line.

## If an update stalls

If the download stops moving for 30 seconds, or a step runs for well over
its usual time, Blowhorn says so and offers two buttons (in the console,
**Close** also hides the update window while the update keeps going):

- **retry** stops the update and starts it again. Your current version stays
  installed until the new one takes its place. Once the new version is in
  Applications, retry cannot stop the update: if finishing setup ends well,
  Blowhorn reopens on the new version, and if it fails, your current version
  is put back. Nothing is downloaded again.
- **release page** opens the release on GitHub so you can update by hand.

The info button after the two buttons says how long nothing has moved.

## If an update fails

Blowhorn says what went wrong and that your current version is still
installed, with **retry** to start again and **release page** to update by
hand. The release page opens only when you choose it.

If the new version is installed but Blowhorn could not reopen itself, it
says so and offers no release page. Quit Blowhorn and open it again to
start the new version.

## Update by hand

On the release page, download `Blowhorn-<version>-mac-universal.dmg`, open
it, and drag Blowhorn to Applications, replacing the old copy. The update
in the app does this for you. See
[Install the app](/docs/how-to/set-up/install-the-app/) for how to check a download
yourself.

## Related

- [Install the app](/docs/how-to/set-up/install-the-app/) - download, verify and open
  the signed Mac app.
- [Fix Blowhorn when its engine won't start](/docs/how-to/troubleshoot/engine-wont-start/)
- [Uninstall Blowhorn](/docs/how-to/manage/uninstall/)

