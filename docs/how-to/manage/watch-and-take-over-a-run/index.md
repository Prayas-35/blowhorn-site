# Watch, pause or take over a run in Chrome


> Open the Blowhorn side panel to see what Blowhorn is doing in Chrome, pause or stop it, and take over for a sign-in or a check.



When Blowhorn works in your Google Chrome through the extension, the Blowhorn side
panel shows what it is doing and lets you stop it, pause it, or take the tab
over for a sign-in or an are-you-human check. Nothing is added to the pages
Blowhorn works on: the panel is part of Chrome, beside the page.

## Open the panel

Click the Blowhorn button in Chrome's toolbar. The side panel opens on the
right of the window. If you do not see the button, open the extensions menu
(the puzzle piece) and pin Blowhorn.

With nothing running the panel shows **Idle**. Below the run, **This Chrome
profile** shows whether this profile is linked and ready, as the toolbar
button did before (see [Install the Chrome extension](/docs/how-to/set-up/install-the-chrome-extension/#check-it-from-the-toolbar)).

## Watch a run

While a run works, the panel shows:

- the task, such as **Post the queue**;
- the address of the Blowhorn tab, which names the site;
- each step as a short line: done, in progress, or failed. Typing is one
  line; the panel never shows what was typed.

## Pause and resume

Click **Pause**. Blowhorn finishes the step it is on, then does nothing at all,
in any tab, until you click **Resume**. A paused run is not timed out and is
not counted as a failure.

## Stop a run

Click **Stop**. Blowhorn finishes recording the post it is on, then does
nothing more in any tab and lets go of the tab. The run is recorded as stopped
by you, never as failed or as a crash; a scheduled activity that was not yet
posted goes back to the queue for its next turn.

The panel shows **Stopped** for a few seconds, then goes back to **Idle**.
The stopped run stays stopped: nothing it asks for afterwards is done.

If Blowhorn had already clicked Post, it records that post as clicked but not
confirmed and does not post it again. Check the profile on the site before you
retry it. Stop between steps when you can.

Known limit: the panel does not remember its state when Chrome restarts the
extension's background worker.

## When Blowhorn needs you

When a site asks for a sign-in, a two-step code or an are-you-human check,
Blowhorn waits. The Blowhorn button shows **!**, the Blowhorn tab group turns
red and reads **Blowhorn needs you**, and the panel says what is needed.

1. Click **Take over**. Chrome brings the Blowhorn tab and its window to the
   front. Blowhorn does nothing while you have the tab.
2. Sign in or finish the check in that tab.
3. Click **Give back**. Blowhorn carries on from the page you leave it on; it
   reads the page again rather than repeating what it did.

You can also sign in in the red tab without opening the panel, as before:
Blowhorn notices when you are done.

You can take over at any time, not only when Blowhorn asks, and give back the
same way.

## Teach Blowhorn a step it got stuck on

When a click fails because Blowhorn found nothing to click, or another element
covered the target, the panel offers **Show me**.

1. Click **Show me**. Blowhorn takes you to the tab, as with Take over.
2. Click the element yourself, the way the step should have.
3. Click **Give back**. Blowhorn reads the element you clicked through its
   debugger connection - its role, its name and a selector for it - and keeps
   it as a hint for that page. The next time the same step fails there,
   Blowhorn tries your hint before giving up.

Hints stay on this computer, in the extension's own storage; they are never
sent to your Blowhorn account or anywhere else. A hint only applies to the
page you taught it on. If the site changes and the hint stops matching,
Blowhorn fails the step as it did before, and you can teach it again.

Known limit: Blowhorn records the element your click focused. If your click
moved to another page, there is nothing focused to record and the panel says
so.

## Related

- [Chrome extension permissions](/docs/reference/extension-permissions/) - what
  the side panel permission allows.
- [Fix the Chrome extension connection](/docs/how-to/troubleshoot/extension-connection/)

