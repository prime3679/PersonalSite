---
title: "Does Claude train on your email? The honest, sourced answer."
date: 2026-06-09
description: "The first question every team asks when they turn on Claude's Gmail connector — answered with primary sources, including the consumer-plan catch and the enterprise gotcha nobody mentions."
published: true
---

<p>
  Every time I help a team turn on Claude's connectors, the same question stops the room.
  Not "how good is the model." Not "what does it cost." It's: <em>what actually happens to our data?</em>
</p>

<p>
  And the honest truth is that Anthropic answers it — completely — but the answer is scattered
  across six support docs, a privacy center, two blog posts, and an enterprise page. Nobody
  assembles it. So a question with a clear, defensible answer gets treated like a black box,
  and the black box is what kills the rollout.
</p>

<p>
  So I assembled it. Here's the whole thing, with the nuance the marketing pages skip.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the short version</h2>

<p>
  When you connect Gmail, Claude reads (and can draft, but not send) your mail through a
  connector Anthropic builds and runs itself. Every retrieval needs your approval, pulls only
  what it needs, and gets cited in the response. The retrieved data is stored on Anthropic's
  servers and tied to the specific chat it was pulled into — delete the chat, delete the data.
  <strong>Anthropic does not train its models on Gmail, Drive, or Calendar connector data.</strong>
  The one real catch lives on consumer plans: if you're on Free, Pro, or Max <em>and</em> you opted
  into training, then connector content that lands in your chat can be used to improve models.
  On Team, Enterprise, API, Government, and Education plans, none of it trains the model by default.
</p>

<p>
  That's the answer. Everything below is the receipt.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what the connector actually is</h2>

<p>
  This is the part most people get wrong in conversation. Connecting Gmail is not "giving Claude
  your whole inbox forever." It's closer to a per-question, you-approve-it, read-only lookup that
  shows its work. Straight from <a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">the connector doc</a>:
</p>

<div class="space-y-4 my-6">
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">01</span>
      <span class="text-sm font-medium">read and draft, never send</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Claude can read your messages and create drafts. It cannot send email on your behalf.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">02</span>
      <span class="text-sm font-medium">attachments are metadata only</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Claude sees message metadata, not the contents of attachments.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">03</span>
      <span class="text-sm font-medium">it mirrors your permissions</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">The connector can't reach anything in Google that you couldn't reach yourself. It inherits your account's access, no more.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">04</span>
      <span class="text-sm font-medium">minimum retrieval, you approve it, it's cited</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Claude requests only the data it needs to answer, you approve the pull, and the response cites what it read. It's not silently crawling your inbox.</p>
  </div>
</div>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">where the data goes, and for how long</h2>

<p>
  This is the question that usually comes out as "does it live for the session, the chat, or
  forever?" The precise answer, <a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">again from the connector doc</a>:
  data retrieved through connectors is stored on Anthropic's servers
  and <strong>retained with its associated chat</strong>. So the unit of persistence is the chat,
  not the session.
</p>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>It's not ephemeral to one app session. Retrieved Gmail data persists as long as that chat exists.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>It's scoped to that one chat. A new chat starts clean and doesn't inherit what a previous one pulled.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Delete the chat and the retrieved data goes with it. That's your off switch.</span>
  </li>
</ul>

<p>
  One honest flag: this is about connector-retrieved data. Claude's <strong>memory</strong> feature,
  if it's on, can persist facts across chats independently of any single conversation. If someone
  has memory enabled, "delete the chat" doesn't necessarily erase a fact Claude already wrote to
  memory. Treat connector retention and memory as two different levers.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">does it train on it? (the part people actually worry about)</h2>

<p>
  Stated plainly, in <a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Anthropic's own words</a>: <em>"We do not train our models on your Gmail, Drive,
  or Calendar connector data."</em> Full stop.
</p>

<p>
  Now the nuance the marketing copy skips. <a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">The same doc</a> adds a consumer-only carve-out: if you're
  on Free, Pro, or Max <em>and</em> you've chosen to allow your chats to be used for training, then
  anything you copy and paste from Gmail, or any of Claude's responses that quote specific
  information from those connectors, can be used to improve the models.
</p>

<p>
  Read those two statements together, because the distinction is the whole game:
</p>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>The raw connector pull is never training data. What the connector fetches from Gmail is excluded, period.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>But connector-derived content that lands in your chat can be — and only if you're (a) on a consumer plan and (b) opted into training. Claude quoting your email back to you becomes ordinary chat content, and chat content on an opted-in consumer account is eligible.</span>
  </li>
</ul>

<p>
  The clean mental model, and the one sentence worth memorizing for the room:
  <strong>the pipe is private; the conversation might not be — but only on consumer plans you
  opted into.</strong>
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">who you're actually trusting</h2>

<p>
  Two trust questions get collapsed into one, and separating them is most of the value here.
</p>

<p>
  <strong>For Gmail specifically, you're trusting Anthropic and Google.</strong> The Google
  Workspace connector is first-party — Anthropic builds and runs it, so the data path is Anthropic
  end to end, with no third-party operator in the middle. Your trust surface is Anthropic's data
  hygiene plus Google's OAuth, which is also what lets you revoke access from your Google account
  at any time.
</p>

<p>
  <strong>For the broader connector directory, you may also be trusting a third party.</strong>
  Anthropic's <a href="https://claude.com/blog/connectors-for-everyday-life" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">directory now spans 200+ connectors</a>, and many are operated by the app maker, not by
  Anthropic, over remote MCP servers. For those, "Anthropic doesn't train on it" is necessary but
  not sufficient: you're also trusting whoever runs that connector with whatever it brokers. A
  first-party connector and a third-party directory connector are not the same risk class, and they
  shouldn't get the same checklist. Gmail is the easy case. The CRM connector your sales team wants
  is the one to diligence.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the plan-by-plan breakdown</h2>

<p>
  This is the table everyone wants and Anthropic never publishes as a table.
</p>

<div class="border border-foreground/10 rounded-xl p-5 my-6 space-y-3">
  <div class="grid grid-cols-3 gap-4 text-xs text-muted-foreground pb-2 border-b border-foreground/10">
    <span></span>
    <span>free / pro / max</span>
    <span>team / enterprise / api</span>
  </div>
  <div class="grid grid-cols-3 gap-4 text-sm">
    <span class="text-foreground/60">trains on connector pulls?</span>
    <span>no</span>
    <span>no</span>
  </div>
  <div class="grid grid-cols-3 gap-4 text-sm">
    <span class="text-foreground/60">trains on chat content?</span>
    <span>only if you opted in</span>
    <span>no, not by default</span>
  </div>
  <div class="grid grid-cols-3 gap-4 text-sm">
    <span class="text-foreground/60">default chat retention</span>
    <span>30 days, or 5 yrs if opted in</span>
    <span>30 days, configurable</span>
  </div>
  <div class="grid grid-cols-3 gap-4 text-sm">
    <span class="text-foreground/60">who controls it</span>
    <span>the user</span>
    <span>the admin</span>
  </div>
  <div class="grid grid-cols-3 gap-4 text-sm">
    <span class="text-foreground/60">zero data retention</span>
    <span>no</span>
    <span>yes, on eligible usage</span>
  </div>
</div>

<p class="text-xs text-muted-foreground -mt-3 mb-6">
  Sources: <a href="https://www.anthropic.com/news/updates-to-our-consumer-terms" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">consumer terms</a> and <a href="https://code.claude.com/docs/en/data-usage" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">data usage</a> (consumer column); <a href="https://www.anthropic.com/product/enterprise" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Enterprise</a> and <a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">API &amp; data retention</a> (commercial column).
</p>

<p>
  The consumer training decision had a hard fork. As of the <a href="https://www.anthropic.com/news/updates-to-our-consumer-terms" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">2025 consumer terms update</a>,
  Free/Pro/Max users had until <strong>October 8, 2025</strong> to choose whether their chats and
  coding sessions could be used for training. Opt in and retention on new or resumed chats extends
  to five years; opt out and it stays at 30 days. You can change it any time in your privacy
  settings. Critically, that update <em>does not apply</em> to Claude for Work, Government,
  Education, or the API.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">enterprise: the honest gotcha</h2>

<p>
  For the buyer who asks "what happens when we fire someone," the good news is real. On
  <a href="https://www.anthropic.com/product/enterprise" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Enterprise</a>,
  prompts and responses aren't used for training by default, retention is configurable, access is
  tied to your identity provider for clean offboarding, and the
  <a href="https://platform.claude.com/docs/en/manage-claude/compliance-content-data" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Compliance API</a> can retrieve and
  permanently delete a departed employee's chats, files, and projects. Hard deletes are immediate
  and unrecoverable. <a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Zero Data Retention</a> is available on eligible API usage and on Claude Code via
  Enterprise.
</p>

<p>
  Here's the part to say out loud rather than oversell. The Compliance API's <strong>Activity Feed</strong>
  — the who-did-what-when log, not message content — is <a href="https://platform.claude.com/docs/en/manage-claude/compliance-integration-patterns" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">retained by Anthropic for <strong>six years</strong></a>.
  So "delete everything when an employee leaves" is true for content, but the activity metadata about
  that account persists for six years. Separately, Anthropic may <a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">retain flagged inputs and outputs for
  up to two years</a> for misuse review, even under privacy arrangements. An honest enterprise answer names
  both of these. It's also the answer that builds trust in the room, because the person asking has
  usually already read the fine print.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">if you're evaluating Claude for your company, ask these</h2>

<div class="border border-foreground/10 rounded-xl p-5 my-6 space-y-4">
  <div>
    <p class="text-sm font-medium mb-1">are we on a commercial plan?</p>
    <p class="text-xs text-muted-foreground">if yes, your prompts and connector data don't train the models by default. if your team is using personal Pro accounts for work, that's a shadow-IT exposure problem, not a Claude problem.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">is the connector first-party or third-party?</p>
    <p class="text-xs text-muted-foreground">Google Workspace is first-party. a directory connector may add a third-party operator to your trust surface. diligence them separately.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">what's our retention set to, and who can change it?</p>
    <p class="text-xs text-muted-foreground">enterprise lets you configure it. consumer leaves it to each user.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">what's our offboarding mechanism?</p>
    <p class="text-xs text-muted-foreground">SSO/SCIM for access, Compliance API for content deletion. confirm both — and accept the six-year activity-metadata retention as a known limit.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">do we need zero data retention?</p>
    <p class="text-xs text-muted-foreground">if yes, confirm it's enabled for your org on the specific products you use. it's not on by default, and not every interface is eligible.</p>
  </div>
</div>

<hr class="border-foreground/10 my-8" />

<p>
  The data question isn't the hard part. The answer exists, it's defensible, and most of it is a
  setting you control. The pipe is private. The conversation might not be — but only on consumer
  plans you opted into, and that's the easiest gap to close.
</p>

<p>
  So if your company is rolling out Claude and half the team is on personal Pro accounts, start there.
  Not with the connector — with the plan.
</p>

<hr class="border-foreground/10 my-10" />

<p class="text-sm text-muted-foreground">
  This piece is built entirely from Anthropic's own documentation, assembled in one place. The receipts:
</p>

<ul class="space-y-1.5 my-4 text-sm text-muted-foreground">
  <li><a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Google Workspace connectors</a> — the authoritative connector doc</li>
  <li><a href="https://claude.com/blog/connectors-for-everyday-life" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Connectors for everyday life</a> — consumer launch</li>
  <li><a href="https://www.anthropic.com/news/updates-to-our-consumer-terms" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Updates to consumer terms & privacy policy</a> — the Oct 8, 2025 training fork</li>
  <li><a href="https://code.claude.com/docs/en/data-usage" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Data usage & retention</a> — consumer retention and coding sessions</li>
  <li><a href="https://www.anthropic.com/product/enterprise" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Claude Enterprise</a></li>
  <li><a href="https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Custom data retention controls (Enterprise)</a></li>
  <li><a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">API & data retention / ZDR</a> — flagged-content two-year retention</li>
  <li><a href="https://platform.claude.com/docs/en/manage-claude/compliance-content-data" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Compliance API — content deletion</a></li>
  <li><a href="https://platform.claude.com/docs/en/manage-claude/compliance-integration-patterns" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Compliance integration patterns</a> — six-year activity retention</li>
</ul>
