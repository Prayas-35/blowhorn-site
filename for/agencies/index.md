# Show the client the dry-run. Then send it once.

> Run several clients' profiles from one desk, in real browser profiles on your own computer. Dry-run every action, pause one client instantly, and never hand a vendor a client's 2FA secret.

## Sound familiar?

- **"Where do my logins live?".** Every client security review asks, and the honest answer is usually a vendor's server.
- **Fingerprint tricks.** Antidetect browsers fake fingerprints to juggle profiles. That is not a story you want to tell a client.
- **No receipts.** When something goes out wrong, you need to show exactly what ran and stop it fast.

## What Blowhorn does for Agencies and consultants

- **Dry-run first.** Mutating commands take --dry-run, and --check-queue lists what a run would do. Show the client before anything publishes.
- **Pause one action.** Pause one action while everything else keeps running, or pause every computer at once.
- **Real browser profiles.** Each Blowhorn profile maps to its own browser profile on each computer. No fake fingerprints.
- **One automation per profile.** A person doesn't type into two browser windows at once, and neither does Blowhorn.

## Several client brands, a limit and a kill switch each

Run each client brand as its own profile and let your assistant queue work for them. Blowhorn desktop 1.61.0 installs the blowhorn-mcp command in ~/.local/bin, so Claude Code, Claude Desktop, Cursor or VS Code can drive Blowhorn on your own computer. Per-profile risk limits apply to every agent action, and pause stops everything.

"Queue this week's posts for client brands Acme and Globex from posts.csv, each on its own profile. Do a dry run, show me per client, wait for me to say "go", then confirm and report what was queued."

- [Blowhorn MCP server](https://blowhorn.ai/ai/mcp/)
- [Connect an assistant](https://blowhorn.ai/docs/how-to/set-up/connect-mcp-client/)
- [Agents across client brands, with a kill switch in your hand](https://blowhorn.ai/resources/articles/agents-across-client-brands-kill-switch/)
- [Why your assistant rehearses first](https://blowhorn.ai/resources/articles/why-your-assistant-rehearses-first/)

## Frequently Asked Questions

**Can clients approve posts?** Not today. There are no client workspaces, roles or approvals yet; share the dry-run instead.

**Where do client credentials live?** Cookies stay in the browser on each computer. GitHub, Hacker News and Slack credentials sync from your account.

**Is this an antidetect browser?** No. Blowhorn is a real browser, signed in as each profile. Want to see what sites can read about your browser? [Run the free check at Blowhorn Tells](https://tells.blowhorn.ai/)

