# Fix "Blowhorn is damaged and can't be opened"


> What to do when macOS says Blowhorn is damaged after you download it from blowhorn.ai or GitHub.


You download Blowhorn from blowhorn.ai or GitHub, install it, and open it.
macOS shows a dialog saying Blowhorn is damaged and can't be opened, and
tells you to move it to the Trash. Don't move it to the Trash yet.

A download from the site can save as `Blowhorn-mac.dmg`. That file is the
same release as the one on GitHub: a notarized, universal app signed with
an Apple Developer ID. macOS accepts a good copy of it, so this dialog
usually does not mean the release is bad. It usually means one of these:

- You opened the app while its copy from the disk image was still
  settling, and macOS checked it before the copy finished.
- You opened a different copy of Blowhorn than the one in Applications,
  for example from the Dock or Spotlight, or an older or locally built
  copy that isn't signed.
- The verdict is stale. On a Mac where an older Blowhorn was removed, or
  where more than one user account uses the shared copy in Applications,
  macOS can show this dialog for a copy that is actually fine. The dialog
  alone does not prove the release is bad.

## Open the copy in Applications

1. Eject the Blowhorn disk image if it is still mounted. In the Finder
   sidebar, click the eject button next to Blowhorn.
2. In Finder, open the Applications folder and open Blowhorn from there.
   Don't open it from the Dock or Spotlight, which can point at another
   copy.
3. If the dialog comes back, clear the quarantine flag macOS put on the
   download. In Terminal, run:

   ```bash
   xattr -dr com.apple.quarantine /Applications/Blowhorn.app
   ```

   Then open Blowhorn from Applications again. This clears only the
   quarantine attribute on this Mac. The app stays signed and notarized.
4. If it still fails on this Mac, and on other computers that used the same
   download, contact support (see [Get help](/docs/reference/support/))
   and say which version you downloaded. Support may ask you to compare
   the file's hash with the published one. Don't rebuild or repackage the
   app yourself.

## If the copy checks out but the dialog keeps coming back

Verify the copy before you trust the dialog. In Terminal, run:

   ```bash
   codesign --verify --deep --strict /Applications/Blowhorn.app
   spctl -a -vv /Applications/Blowhorn.app
   ```

A good copy ends with "valid on disk" and "satisfies its Designated
Requirement", and spctl says "accepted" with source "Notarized Developer
ID". If both pass, the dialog is wrong: click Cancel, never "Move to
Trash", and clear the quarantine flag as above, then open Blowhorn from
Applications again.

On a shared Mac, this matters twice over: the copy in Applications
belongs to every account, so a dialog in one user's session must not
delete it for the others. If the dialog appears in another user's
session, that user should Cancel it rather than trash the shared copy.

## If another copy of Blowhorn is opening

An older Blowhorn, or a local build that isn't signed, can be what the Dock
or Spotlight opens. macOS checks that copy, not the one you just installed.

1. Quit the other copy. Look for its menu-bar icon, or find Blowhorn in
   Activity Monitor and quit it there.
2. Open Blowhorn from the Applications folder in Finder.

To see which version you have, select Blowhorn in Applications and choose
**File** > **Get Info**.

## If an update left an old copy behind

An in-app update keeps the previous version until the new one starts, in
`~/Library/Caches/ai.blowhorn.desktop/update-backup-<id>`. That folder is not
an application, so nothing opens it by mistake. Older versions of Blowhorn
kept it in Applications, as a hidden copy named `.Blowhorn-backup-<id>.app`.
Every such copy carries Blowhorn's identity, so anything that opens Blowhorn
without naming a path, a `blowhorn` command included, can open an old or
broken copy instead and get this dialog.

Blowhorn moves any hidden copy out of Applications and removes it, and clears
old backups from the cache, each time it starts. If a copy can't be removed
it tries again on the next start, and only if that fails too does it show the
copy's path and what macOS said, with a **copy command** button. It says
another account owns the copy only when that is true. To remove one by hand:

1. List the leftover copies:

   ```bash
   ls -a /Applications ~/Applications ~/Library/Caches/ai.blowhorn.desktop | grep -E '^(\.Blowhorn-(backup|update)-|update-backup-)'
   ```

2. For each hidden `.app` copy in Applications, whether it is
   `.Blowhorn-backup-` or `.Blowhorn-update-`, tell macOS to forget it.
   Replace the path with the one you found:

   ```bash
   /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -u '/Applications/.Blowhorn-backup-<id>.app'
   ```

3. Delete each copy. Replace the path with the one you found.
   `sudo` asks for an administrator password:

   ```bash
   sudo rm -rf '/Applications/.Blowhorn-backup-<id>.app'
   sudo rm -rf ~/Library/Caches/ai.blowhorn.desktop/update-backup-<id>
   ```

Never delete `/Applications/Blowhorn.app` itself this way.

## Related

- [Troubleshooting](/docs/how-to/troubleshoot/troubleshooting/) - start from the symptom.
- [Install the app](/docs/how-to/set-up/install-the-app/)
- [Update Blowhorn](/docs/how-to/manage/update-blowhorn/)
- [Fix Blowhorn when its engine won't start](/docs/how-to/troubleshoot/engine-wont-start/)
- [Open the app when it bounces in the dock](/docs/how-to/troubleshoot/bounces-in-dock/)

