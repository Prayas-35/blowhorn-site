# Choose where Blowhorn works in Chrome


> Keep Blowhorn's tab beside yours, or give it a window of its own mostly behind yours, in the app or from the command line.



When Blowhorn drives Google Chrome through the Blowhorn Chrome extension, it works in a
tab of its own. Your Blowhorn account has one setting for where that tab lives:

- **Beside your tabs** (the default). An inactive tab right after the tab you are
  on, in the Blowhorn tab group.
- **In its own window, mostly behind yours.** One window of Blowhorn's own, the same size
  as the window you used last and a little to its right, so an edge of it shows,
  opened without taking focus. Your window stays in front, your tab stays selected, and Blowhorn keeps reusing the
  same window until you close it or Chrome quits. Its tab sits in its own
  Blowhorn tab group.

On a Mac, a page in a tab you are not looking at reads its window size as zero,
which a site can notice. A page in its own window can avoid that, so choose
**In its own window, mostly behind yours** if that matters to you. Beside your tabs stays
the default.

## Keep that edge showing

On a Mac, Blowhorn's window only avoids this while part of it is visible on the
desktop you are using, which is why it opens with an edge showing beside yours. The page reads like a background tab again when the window is:

- fully covered by other windows
- minimized
- hidden (Command-H)
- on another desktop (Space)

When your Chrome window fills the screen there is no room for the edge, so leave a
little space on the right of your window, or use **beside your tabs**.

The setting follows your account to every computer you use Blowhorn on, and a run
reads it once when it starts.

## In the app

1. Open **Settings**, then **Setup**.
2. On the **Chrome extension** card, under **Where Blowhorn works**, choose
   **beside your tabs** or **in its own window, mostly behind yours**.

## From the command line

Sign in first with `blowhorn auth login`, then:

```bash
blowhorn chrome extension-mode --window own-window   # a window of its own, mostly behind yours
blowhorn chrome extension-mode --window side-tab     # an inactive tab beside yours
blowhorn chrome extension-mode --window default      # clear it, so runs use the default
blowhorn chrome extension-mode                       # show the setting a run would use
```

Add `--dry-run` to see what would be saved without saving it.

## What stays the same

In both places Blowhorn never brings its tab or Chrome in front of what you are
doing. When it needs you, it turns its tab group red and opens it, and waits for
you to click its tab. If you close Blowhorn's window, the next run makes a new
one. If no Chrome window is open at all, the run stops and asks you to open one.

Related: [Extension mode](/docs/reference/chrome/#extension-mode-classic-or-background),
[`blowhorn chrome extension-mode`](/docs/reference/chrome/#blowhorn-chrome-extension-mode),
[Chrome extension permissions](/docs/reference/extension-permissions/).

