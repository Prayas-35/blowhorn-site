# Amazon blocked Meta's Muse. Here is how it knew.

Twelve days after Meta launched Muse, Amazon cut it off. Amazon never said how it spots the agent, but the evidence points to datacenter traffic, identical browser fingerprints, and behavior, and the Chrome extension changes which signals are left.


On the night of Sunday, September 20, 2026, Amazon cut off Meta's Muse agent, twelve days after it launched. Shoppers who sent Muse to Amazon.com met a notice: continued access by an unauthorized AI agent violates Amazon's Conditions of Use. The block is still in force, and Amazon has never said how it detects Muse. That silence is the interesting part. What a platform can see about an agent, and what it cannot, decides where the line falls for everyone building with agents.

![The General, one of the Blowhorn troops, in charge of strategy and results](/assets/brand/troops/general-640.webp)

*The General: strategy and results.*

## What happened

Amazon wrote the rule first. On August 14, 2026, its Conditions of Use gained an "Agents" section: an agent must identify itself at all times, including `Agent/[agent name]` in the user-agent string of every request; must not mimic human keystroke or navigation speed; must not solve or dodge CAPTCHAs; and must stop when Amazon asks it to.

Meta launched Muse on September 8. Each user gets a dedicated cloud VM running its own Chromium browser, and Meta's line was that when Muse browses, "it will appear as your activity." Muse shipped with no user-agent token, no published IP list, and no declared identity.

On September 20, Amazon blocked it. Amazon told [GeekWire](https://www.geekwire.com/2026/amazon-blocks-metas-muse-ai-assistant-in-new-standoff-over-agentic-shopping/) it had first asked Meta to remove Amazon from the experience and Meta declined. Amazon gave three reasons: Meta never told Amazon that Muse would reach its store; the agent "doesn't identify itself when it browses"; and it "appears to capture and store customer credentials."

The story did not end there. Around November 12, the "Muse from Meta" Chrome extension appeared on the Chrome Web Store, unannounced. On November 13, a video showed Amazon blocking the extension too, in the user's own tab on the user's own computer. Around the same day, Muse's shopping skill changed to "Do not search Amazon" unless the user asks. As GeekWire put it: "Amazon blocked Muse, so now Muse blocked Amazon."

## How Amazon spots an agent

Start with the caveat: Amazon has never disclosed the mechanism. What follows is what security vendors have measured about Muse traffic, plus inference about what Amazon uses. The two are not the same.

**Network.** In a [DataDome](https://datadome.co/threat-research/meta-muse-doesnt-declare-itself-heres-why-that-matters/) sample, 99.3% of Muse traffic egressed through Cloudflare (81.2%) and Fastly (18.1%); only 0.6% came from consumer ISPs. Muse does not arrive on a home connection. It arrives on datacenter infrastructure.

**Fingerprint.** DataDome compared live Muse sessions across unrelated sites and found the overlap in environmental signal "almost total, the kind of match you only get from the same sandboxed image being deployed." [Fingerprint](https://fingerprint.com/blog/how-to-detect-meta-muse-ai-agent/) labels Muse traffic `bot_type: "meta_muse"` with high confidence. And the concealment is itself a signal: [Inc.'s code inspection](https://www.inc.com/jason-aten/meta-keeps-apologizing-for-muse-its-explanations-miss-the-point-entirely/91409363) found Muse hides `navigator.webdriver`, fakes plugin values, and checks pages for CAPTCHAs and Cloudflare Ray IDs. Spoofed values that disagree across contexts give the game away.

**Behavior.** [Verisoul](https://www.verisoul.ai/agents/meta-muse) reports bot-like interaction patterns across Muse sessions. Cequence noted that a browser-version update spiked from 0% to 90% of Muse traffic in days. A fleet that updates as one is fingerprintable.

![A swarm of tiny identical charcoal bots doing the same thing over and over.](/assets/brand/troops/bot-swarm-640.webp)

*A fleet that moves as one is easy to spot.*

**The inference.** [Vouched](https://www.vouched.id/learn/blog/muse-is-an-agent-but-it-doesnt-want-you-to-know) tested asking Muse to use Firefox through its own egress proxy, and the block lifted. Its conclusion, that Amazon most likely keys on the cloud browser's Chromium fingerprint, is inference, not Amazon's account. A headed Chromium on a Raspberry Pi at home also loaded Amazon without a CAPTCHA. Network plus fingerprint both matter.

**What is not established.** No source reports Amazon inspecting debugger connections, looking for DOM markers, or licensing a specific bot-detection vendor for this block. Treat those as speculation.

## Why the extension changes the picture

The extension runs in the user's own Chrome, on the user's own connection, signed in as the user. The two strongest cloud signals, datacenter egress and the uniform VM fingerprint, are gone.

What is left is behavior: how the agent navigates, clicks, and types, and whether a human's mouse and keyboard patterns are present at all. Amazon still blocked the extension, but no source explains what signal it used there. Behavior is the main remaining candidate, and that is analysis, not reporting.

One contrast is worth noting. An October test found Claude in Chrome shopping Amazon with no bot check in 24 runs. Local automation by itself is not reliably flagged, which suggests either Amazon fingerprints Muse specifically or Muse's automation behaves differently. That is inference, not established fact.

We ran our own check. On a Muse-driven session in our own Chrome, our bot-detection test at [tells.blowhorn.ai](https://tells.blowhorn.ai/) scored 75 out of 100, "Looks human": no automation flags, all fingerprint checks agreed, residential IP. The only flag was behavioral, and it fired because nothing had moved or typed during the test, not because anything moved like a bot. When the browser is genuinely yours, behavior is all that is left to judge.

## What Meta is doing about it

Meta has never responded on the record to the block itself. What it has done instead:

- **Partnerships.** Retail connectors announced at Connect on September 23: Walmart, Best Buy, Sephora, and others, plus Shopify and Shop Pay agentic checkout.
- **Identity standards.** Meta co-launched the Personal Agent Protocol ("Poppy"), which reached v1.0 on November 13 with Shopify enabled for every merchant; Muse now checks for Poppy first on every site. DataDome also found Meta quietly testing Web Bot Auth signing of some Muse requests since around October 12, unannounced.
- **New surfaces.** The Chrome extension and Mac operation move the agent onto the user's own computer instead of the cloud VM.
- **Quiet compliance.** The shopping skill now leaves Amazon out by default.

The block has not loosened. On Amazon's October 29 earnings call, CEO Andy Jassy said Amazon expects to work with "horizontal agents" eventually, but that its own Alexa for Shopping will be the main agent people use to shop Amazon.

## What it means for you

1. **Agents that browse as you, from your own browser, are the ones that pass.** The cloud VM is what got flagged. Your own connection, your own fingerprint, your own signed-in sessions are what read as human.
2. **Identity is becoming the price of admission.** Platforms are writing agent rules into their terms, and declared identity, through protocols like Poppy and Web Bot Auth, is the way in. Expect more of this, not less.
3. **Do not fight bot checks.** Muse itself refuses to solve them, and its terms forbid bypassing another service's access controls. When a site says no, the honest move is the human step: take control of the browser and do that step yourself.
4. **Behavior is the signal you control.** A steady human pace, real pauses, and your own sessions are what read as human. Bursts and unnaturally regular timing read as a bot.
5. **Read the terms before you automate against a platform.** Amazon wrote its Agents section a month before the block. The block was the enforcement, not the surprise.

## Where Blowhorn fits

Blowhorn posts from your own browser, signed in as you, so it sits on the right side of this line: your connection, your fingerprint, your sessions ([Why Blowhorn uses your own browser](/docs/explanation/your-own-chrome/)). It posts at the pace you set, not in bursts ([How Blowhorn paces itself](/docs/explanation/reliability-and-anti-bot-design/)). And you can check what a site sees about your own browser with [Tells](https://tells.blowhorn.ai/).

When a platform tightens its rules, [When a platform changes the rules](/resources/articles/when-a-platform-changes-the-rules/) covers how it shows up in your activity and what to do.

## Sources

- GeekWire, "Amazon blocks Meta's Muse AI assistant in new standoff over agentic shopping," September 21, 2026
- GeekWire, "'Do not search Amazon': Meta's Muse now shops elsewhere by default," November 17, 2026
- Amazon Conditions of Use, "Agents" section, updated August 14, 2026
- DataDome, "Meta's Muse Is Bringing Agentic Browsing to the Masses," October 2026
- Fingerprint, "How to Detect Meta's Muse AI Agent Traffic," October 6, 2026
- Verisoul, "How to detect Meta Muse"
- Vouched, "Muse Is an Agent, but It Doesn't Want You to Know," October 23, 2026
- Inc., "Meta Keeps Apologizing for Muse. Its Explanations Miss the Point Entirely," September 23, 2026
- TestingCatalog, "Meta brings Muse AI agent to Chrome with new extension," November 13, 2026

