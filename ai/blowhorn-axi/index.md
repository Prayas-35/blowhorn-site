# The agent interface to Blowhorn

Status: Version 0.2.0

blowhorn-axi is a small command your AI agent runs to use Blowhorn for you. It speaks the agent's language, rehearses before it acts and always says what to do next.

```bash
npx blowhorn-axi
```

```text
count: 2
profiles[2]{name,ready}:
  personal,yes
  work,no
help[1]:
  Run `blowhorn-axi profile status --profile work`
```
Needs Node.js 18 or later and the Blowhorn app. Run it once with npx, nothing to install first.

## What makes it agent friendly

- **Short answers agents can read.** Results come back as TOON, a compact text format made for AI agents. Less to read means faster, cheaper and fewer mix-ups.
- **A dry run by default.** Every action is a rehearsal unless the agent adds --confirm. It shows what would be sent, then waits.
- **Clear next steps.** Every answer, and every error, ends with a help list of the commands to try next. Agents don't get stuck guessing.
- **Your computer, your limits.** It runs on your own computer and follows the risk limits you set for each profile. Nothing secret is printed in its answers.

