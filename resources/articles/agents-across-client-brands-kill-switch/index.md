# Agents across client brands, with a kill switch in your hand

If you run several brands, an assistant can save hours, and a mistake lands on someone else's name. One profile per client brand, risk limits per profile, a dry run per brand, and a way to pause everything with a reason.


When you manage accounts for other people, the cost of a mistake is not yours alone. A post to the wrong brand is an awkward call to a client. An assistant makes that risk bigger and smaller at once: bigger because it works faster than you read, smaller if you set up the boundaries before it starts. This article is about those boundaries.

## One profile per client brand

Keep each client brand in its own profile, named for the client brand, and never mix two in one. The profile is the unit everything else attaches to: its schedule, its queue, its limits and its history. When you ask an assistant to work on one client brand's profile, the profile is the fence.

Use plain, distinct names. If two client brands look alike in a list, an assistant and a tired person will both mix them up. Treat a similar name as a fault to fix before you start.

## Set risk limits per profile

Per-profile risk limits apply to agent actions, as [the safety explainer](/docs/explanation/mcp-and-safety/) describes. A brand with a young account and a cautious owner should have tight limits; a busy established brand can run looser. Set them deliberately, per client brand, before you give an assistant any work. A client who asks how you keep things safe gets a real answer: here is the limit on your profile, and here is the record of what ran.

## Rehearse each brand separately

Do not ask for a week of posts across all your client brands in one prompt. Work one brand at a time, with the dry run in front of you. The prompt below names the profile in every line so the assistant cannot drift.

Start by reading, to see where each brand stands:

```text
Read only: for each of my client brand profiles, list what is queued for the next
seven days and when it fires. Do not change anything.
```

Then one brand's week, as a rehearsal:

```text
On the profile for client brand Northwind only, draft three posts from
northwind-week.md and queue them for Tuesday, Wednesday and Friday at 09:00 their
time. Do a dry run, show me the profile name and each payload, and wait for me to
say "go". Do not confirm yet, and do not touch any other profile.
```

In the dry run, check the profile name first, then the time zone (the client's, not yours), then the wording against the brand's voice. After "go", the assistant confirms and lists what is queued. Then move to the next brand and repeat. It feels slower than a single sweep, and it is the reason a client never sees another client's post.

If a client wants to see the plan, the dry run is what you show them. They approve the real text before anything runs.

## Pause everything, with a reason

Sooner or later a client calls to say "stop, we have news". Pause stops everything in one move, and you can give it a reason so the record says why. You do not hunt profile by profile. Resume when the client says so.

```text
Pause everything, with the reason "client asked to hold all posts pending a
legal review". Then read back what is paused.
```

Rehearse this once with no pressure, so you know where it is and what it looks like when you need it. The [pause guide](/docs/how-to/schedule/pause/) covers the app side.

## Read what happened

Afterwards, ask for a read-only account of each profile's run: what went out, what was held, what failed. [Review runs](/docs/how-to/measure/review-runs/) shows where that record lives in the app. For clients, a short weekly summary built from it is more convincing than any promise.

```text
Read only: for the Northwind profile, summarize what ran last week, what was
skipped and why. Do not change anything.
```

## Keep a person approving

An agent can never approve its own content ([why](/docs/explanation/mcp-and-safety/)). With approval mode on, whatever it queues waits for a person in the app, and for client work that person should be you or the client's own contact. Every write starts as a dry run, so the order is always yours.

## Related

- [The Blowhorn MCP server](/ai/mcp/)
- [How the MCP server keeps you in control](/docs/explanation/mcp-and-safety/)
- [Connect an assistant](/docs/how-to/set-up/connect-mcp-client/)
- [Pause](/docs/how-to/schedule/pause/)

