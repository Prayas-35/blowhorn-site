# System requirements


> What your computer needs to run Blowhorn: macOS version, Google Chrome, and a Blowhorn account.



What your computer needs before you install Blowhorn. Requires macOS 13
or newer and Google Chrome 142 or newer.

| Need | Requirement | Checked by |
|---|---|---|
| macOS | 13 or newer, Apple silicon or Intel (one universal build) | The build declares the floor; Setup checks the rest |
| Google Chrome | 142 or newer, the real Google Chrome (not Chromium), installed and signed in | Setup, "chrome profiles" row; `blowhorn chrome status` |
| Engine | Bundled in the app, with its own Python; nothing to install | Setup, "Blowhorn folder" and "helper tools" rows |
| Account | A Blowhorn account your profile belongs to | Setup, "organization connection" row; `blowhorn store` |
| Background runs | The background service, registered from the app | Setup, "this computer on duty" row |

macOS 13 is the floor the desktop build declares
(`minimumSystemVersion: 13.0`), and every release is one universal DMG
(`Blowhorn-<version>-universal.dmg`) for Apple silicon and Intel Macs.
The engine underneath also runs on Linux; the desktop app needs a Mac.
Windows is not supported.

Install the real Google Chrome the normal way and sign in before you map
anything; the requirement in full is in the
[Chrome reference](/docs/reference/chrome/#requirements).

The app carries its engine and Python, so your computer needs no git and no
Python. A contributor running the engine from a checkout instead needs
Python 3.14, the floor `tools/install.sh` enforces and the only supported
version. Either way the Setup screen checks the engine, so a broken engine
or interpreter shows up there first, not mid-run.

Network access to your account is required for the content queue, the schedule, profiles, and run history. Your account keeps those in sync; your computer holds the app, the engine, and your Chrome sessions.
Offline behavior is a plans question, not a requirements one: see
[Plans and limits](/docs/reference/plans/).

## Related

- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - what the Setup screen checks.
- [Plans and limits](/docs/reference/plans/) - what "free during early access" covers.
- [How Blowhorn works](/docs/explanation/how-it-works/) - why your account and the app are separate.

