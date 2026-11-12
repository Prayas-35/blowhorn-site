# How Blowhorn works


> The app, the engine, the extension, the background service, and your account.



Blowhorn is a social media console that takes one message and
broadcasts, reposts and amplifies it across every profile and platform
your community runs, on autopilot. Five parts do it together.

The app is what you see: the menu-bar popover and the console. It shows
the queue, the schedule, the runs, and the settings, and it installs
updates. It never posts on its own.

The engine is what acts: `blowhorn <command>` run from the app, the
background service, or your terminal. Every run resolves its profiles,
reads the queue, reaches your browser or an API, and writes the ledger. The
same engine answers the app's screens, so the app can never offer what
the engine does not know.

The extension is how the engine reaches your signed-in browser. It
carries out the clicks and keystrokes the engine queues, inside the
Chrome profile you already use, on the sites Blowhorn acts on. It makes
no requests of its own.

The background service is what runs the schedule while the app is
closed: a pass whenever an activity falls due, and at least once a minute, claiming the activities that are due.
Quitting the app never pauses it; pausing is explicit, per computer,
per organization, or per activity.

Your account is what the parts share: the content activities, the schedule, the profiles and their credentials, the ledgers, and the run history, kept in sync for every computer you sign in on. Your computer holds the app, the engine, and your browser sessions; your account keeps everything the computers share.

Every action leaves from the computer that runs it, over that computer's
own internet connection: a teammate's computer posts from their
connection, and yours from yours. Blowhorn sends no platform traffic
through a server or proxy of its own, so there is no proxy to buy or
set up. Sites can see a VPN or proxy, and
[Fix a sign-in that stopped working](/docs/how-to/troubleshoot/sign-in-problems/)
shows how to check what they see.

A post travels this path: an activity in the queue, approved and due; a run
acting as the activity's profile; the platform reached through your browser
or its API; the outcome written back to the activity and the ledger. Any
step the run cannot confirm stops the run instead of guessing: the activity
reads clicked, outcome not read, and waits for you.

## Related

- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - what you see.
- [Platforms](/docs/reference/platforms/) - what each platform leg does.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - the extension leg.
- [How scheduling works](/docs/explanation/scheduling/) - the service leg.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - watch the engine work.
- [You're in control](/docs/explanation/youre-in-control/) - what Blowhorn will and won't do on its own.

