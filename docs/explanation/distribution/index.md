# What runs when the app is closed


> The background service, quitting, keep-running, and how updates reach a closed app.



Closing the app stops the window, not the work. The background service
keeps running the schedule: a pass whenever an activity falls due, at least once a minute, claiming due
activities and writing the ledger, with no window open and no person
watching. Quitting pauses nothing and resumes nothing; the pause
scopes keep exactly what they said.

The service is per-user, registered from the app or with
`blowhorn service install`. It restarts itself between passes, reports
its heartbeat for `schedule status` and the popover, and writes
per-job logs beneath the log directory. `service stop` waits for the
pass in flight before stopping; `service restart` picks up a changed
definition between passes; `service uninstall` stops and removes it
whole. The app's "this computer" screen shows who registered it and whether it runs.

Keep-running is the one setting that matters here. With it on,
installing the app installs the service and quitting leaves it
running; with it off, quitting ends scheduled posting until you open
the app again. Login Items in System Settings decides whether the
service returns after a reboot. If registration fails, the app says so
once in a notification rather than failing silently every pass.

Updates reach a closed app through the same service. The update card
in the popover installs the new build and relaunches; when the app is
closed, the next open shows the card instead. A release is one
universal DMG per desktop tag, downloaded from the release page; the
app installs it into Applications and relaunches when this computer
can, and otherwise opens the release page for you.

## Related

- [Keep posting when the app is closed](/docs/how-to/schedule/background-service/) - install and control the service.
- [Job options and schedules](/docs/reference/jobs/) - what the passes run.
- [How scheduling works](/docs/explanation/scheduling/) - passes, leases, and pauses.
- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - the "this computer" screen.

