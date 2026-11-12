# Slack


> What Blowhorn can do on Slack, and how each action behaves there.


Blowhorn works on Slack through Slack's API, never the browser, and sends as you. It uses a Slack token in your account (`SLACK_USER_TOKEN` or `SLACK_BOT_TOKEN`) or your Slack session, linked through the Blowhorn extension in Google Chrome.

Sends a message as you to a channel, a person, or a thread. One
profile sends. `blowhorn post --platform slack --message` sends one
ad-hoc message with no queue activity.

<!-- BEGIN generated limits: release/scripts/capabilities_docs/build.py; do not edit -->

## Limits

No limits are recorded for Slack.

<!-- END generated limits -->

## Supported actions



- **[Post](#action-post)**: Sends a message as you to a channel or to a person, as #channel, @user, a channel ID, or a channel link. Shows a preview until you confirm. Limits: One profile sends per run. A target Blowhorn can't read is refused, never sent somewhere else.
- **[Reply](#action-reply)**: Replies in a thread when you give it the link to the message.


## Slack messages

Send from a queue activity or ad hoc. An activity sends to its own target; `--message`
with `--target` sends one message you type, with no activity read or marked
done, and `--target` redirects the run's queued Slack activities. The target
is a `#channel`, `@user`, channel id, channel link, or message link for
a thread reply; anything else is refused, never sent somewhere else.
One profile sends a `post` run, named with `--profile`; the profile from
the defaults file does not count as named. `blowhorn slack send` can send
as several profiles (`--profile work,personal`); see the [CLI reference](/docs/reference/cli/).

## From the command line

[`blowhorn slack`](/docs/reference/cli/slack/) has six verbs: `send`, `edit`, `delete`,
`react`, `whoami` and `profiles`. Each write is a dry run until `--confirm`, and
`edit` and `delete` change only a message that profile sent with Blowhorn. For
an AI agent, [`blowhorn-axi`](/docs/reference/cli/blowhorn-axi/) wraps the same writes:
your own session only, compact output with the next commands to run, and no
Slack reads.

## Related

- [All platforms](/docs/reference/platforms/) - every platform, side by side.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - the posting run.
- [Send a Slack message](/docs/how-to/publish/send-a-slack-message/) - Slack, worked.
- [Content queue columns and activity states](/docs/reference/content-queue/) - every column each platform reads.
- [Messages and exit codes](/docs/reference/messages/) - what a refusal means.
- [Who can post as whom](/docs/explanation/eligibility/) - why a credential is permission.
- [Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/) - browser versus API.
- [You're in control](/docs/explanation/youre-in-control/) - every safety control in one place.
- [Platform action matrix](https://blowhorn.ai/field-manual/action-matrix/) - safe versus risky actions, per platform.

