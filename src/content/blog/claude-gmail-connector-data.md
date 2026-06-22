---
title: "Does Claude train on your email? The plan-by-plan teardown."
date: 2026-06-09
tags: ["ai"]
description: "What Claude's Gmail connector trains on, where the data lives, and how long it stays , broken down across all five plans, sourced to Anthropic's own docs, with the gaps marked."
published: true
---

<p class="text-xs text-muted-foreground">
  Last verified June 9, 2026 against Anthropic's primary documentation.
  <em>Changelog: Jun 9, 2026 , v2. Rebuilt as a plan-by-plan teardown: added the five-plan table
  (and a <a href="/files/claude-gmail-connector-tier-table.pdf" class="underline hover:no-underline" download>downloadable one-pager</a>),
  a memory &amp; incognito section, and a "where the docs go quiet" list. Every claim was re-checked
  against the source on this date.</em>
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">TL;DR , forward this to your security team</h2>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>The connector reads and drafts your mail but <strong>cannot send it</strong>, and every action it takes needs your explicit approval.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span><strong>The raw connector pull never trains the models.</strong> Anthropic does not train on your Gmail, Drive, or Calendar connector data , on any plan.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Connector content that <em>lands in your chat</em> is the one carve-out: on Free, Pro, or Max accounts that opted into training, it can be used to improve models. Team, Enterprise, API, Government, and Education never train on it by default.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Retrieved data is <strong>chat-scoped, not session-scoped</strong> , stored on Anthropic's servers and kept with the chat. Delete the chat, delete the data.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>On Enterprise, data is retained <strong>indefinitely</strong> until an Owner sets a custom period , and incognito chats are still visible to your org through data exports and the Compliance API.</span>
  </li>
</ul>

<p class="text-xs text-muted-foreground">
  jump to:
  <a href="#why" class="underline hover:no-underline">why this matters</a> ·
  <a href="#sees" class="underline hover:no-underline">what it sees</a> ·
  <a href="#lives" class="underline hover:no-underline">where it lives</a> ·
  <a href="#training" class="underline hover:no-underline">training</a> ·
  <a href="#memory" class="underline hover:no-underline">memory &amp; incognito</a> ·
  <a href="#table" class="underline hover:no-underline">the table</a> ·
  <a href="#gaps" class="underline hover:no-underline">the gaps</a> ·
  <a href="#bottom" class="underline hover:no-underline">bottom line</a>
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="why" class="text-base font-medium mt-8 mb-3">why this matters</h2>

<p>
  Every team that turns on Claude's Gmail connector asks the same question first , not "how good
  is the model" or "what does it cost," but <em>what actually happens to our data?</em> Anthropic
  answers it completely, but the answer is scattered across a connector doc, a privacy center, a
  consumer-terms update, and three enterprise pages. Nobody assembles it. So a question with a
  defensible answer gets treated like a black box , and the black box is what stalls the rollout.
</p>

<p>
  It's worth naming the shape of the problem: this is <strong>shared responsibility</strong>.
  Anthropic secures and documents the data path. You decide which plan your people are on,
  what retention is set to, and whether anyone is running company email through a personal
  account. Most rollout anxiety points at the model. The real exposure almost always lives on
  the configuration side , which is the part you control.
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="sees" class="text-base font-medium mt-8 mb-3">what the connector can see and do</h2>

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
    <p class="text-sm text-foreground/60 leading-relaxed">Claude can search and read your messages, create drafts, and manage labels and threads. It cannot send email on your behalf.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">02</span>
      <span class="text-sm font-medium">attachments are metadata only</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Claude reads message bodies and metadata , including attachment metadata , but not the contents of the attachments themselves.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">03</span>
      <span class="text-sm font-medium">it mirrors your permissions</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">The connector "mirrors your existing permissions , you cannot access information you don't already have access to." It inherits your account's reach, no more.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">04</span>
      <span class="text-sm font-medium">minimum retrieval, you approve it, it's cited</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">It "only accesses your data when you explicitly ask" and "retrieves the minimum information needed." Each action requires your explicit approval, and responses cite what they read with links back to the originals.</p>
  </div>
</div>

<p>
  Now the tension worth flagging before someone on your team finds it and panics. During the
  Google sign-in, the OAuth consent screen lists email-<em>sending</em> permission. That looks
  alarming. Anthropic addresses it directly: <em>"During authentication, Google's OAuth screen
  mentions email sending permissions. Claude only reads emails and creates drafts with your
  explicit approval. The send function is not enabled , all emails must be sent manually."</em>
</p>

<p>
  This is the gap between <strong>scope breadth</strong> (what the OAuth grant technically covers)
  and the <strong>app layer</strong> (what the product actually wires up). The grant is broad; the
  send capability is switched off in the application. That distinction is exactly the kind of
  thing a diligent reviewer should ask a vendor to put in writing , which is precisely what
  Anthropic has done.
</p>

<p>
  One scoping note before moving on: everything in this piece is about the <strong>first-party</strong>
  Google Workspace connector, which Anthropic builds and runs itself , the data path is Anthropic
  end to end, revocable any time from your Google account. Anthropic's
  <a href="https://claude.com/blog/connectors-for-everyday-life" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">broader directory spans 200+ connectors</a>,
  and many of those are operated by the app maker over remote MCP servers. For those, "Anthropic
  doesn't train on it" is necessary but not sufficient , you're also trusting whoever runs the
  connector. Different risk class, different checklist. Gmail is the easy case.
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="lives" class="text-base font-medium mt-8 mb-3">where the data lives, and for how long</h2>

<p>
  This usually comes out as "does it live for the session, the chat, or forever?" The precise
  answer, <a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">again from the connector doc</a>:
  data retrieved through connectors is stored on Anthropic's servers and
  <strong>retained with its associated chat</strong>. The unit of persistence is the chat, not
  the session.
</p>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>It is not ephemeral to one app session. Retrieved Gmail data persists as long as that chat exists.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>It is scoped to that one chat. A new chat starts clean and doesn't inherit what a previous one pulled.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Delete the chat and the retrieved data goes with it. That is your off switch.</span>
  </li>
</ul>

<p>
  One honest flag, because it's the most common point of confusion: "chat-scoped" is the
  <em>storage model</em>, not the <em>retention clock</em>. How long that chat itself survives
  depends on your plan , 30 days on a consumer account, up to five years if you opted into
  training, and on Enterprise, indefinitely until an Owner sets a custom period. More on that in
  <a href="#table" class="underline hover:no-underline">the table</a>. And memory is a separate
  lever entirely , covered <a href="#memory" class="underline hover:no-underline">below</a>.
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="training" class="text-base font-medium mt-8 mb-3">the training fork: consumer vs commercial</h2>

<p>
  Stated plainly, in <a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Anthropic's own words</a>:
  <em>"We do not train our models on your Gmail, Drive, or Calendar connector data."</em>
  That holds on every plan.
</p>

<p>
  Here is the fork. The same doc carves out one consumer-only case: if you're on Free, Pro, or
  Max <em>and</em> you've opted into training, then anything you copy and paste from a connector,
  or any of Claude's responses that quote connector information, may be used to improve the
  models. Read the two statements together, because the distinction is the whole game:
</p>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>The raw connector pull is never training data. What the connector fetches from Gmail is excluded, on every plan, period.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Connector-derived content that lands in the chat can be , but only if you're (a) on a consumer plan and (b) opted in. Claude quoting your email back to you becomes ordinary chat content, and chat content on an opted-in consumer account is eligible.</span>
  </li>
</ul>

<p>
  The clean mental model, and the one sentence worth memorizing for the room:
  <strong>the pipe is private; the conversation might not be , but only on consumer plans you
  opted into.</strong>
</p>

<p>
  That consumer decision had a hard deadline. Under the
  <a href="https://www.anthropic.com/news/updates-to-our-consumer-terms" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">2025 consumer-terms update</a>,
  Free/Pro/Max users had until <strong>October 8, 2025</strong> to choose whether their chats and
  coding sessions could be used for training. Opt in and retention on new or resumed chats
  extends to five years (de-identified); opt out and it stays at 30 days. Deleted chats are
  excluded from training either way, and you can change the setting any time. Critically, this
  fork <em>does not apply</em> to Claude for Work, Government, Education, or the API.
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="memory" class="text-base font-medium mt-8 mb-3">memory and incognito (the part nobody reads)</h2>

<p>
  Connector retention is one lever. <strong>Memory</strong> is a second, independent one , and
  it's where the under-reported surprises live. From the
  <a href="https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">memory &amp; chat-search doc</a>:
</p>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Memory from chat history is on every plan (Free through Enterprise); summaries are synthesized roughly every 24 hours. Chat search , retrieval over your past chats , is paid plans only.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Deleting a conversation removes it from memory synthesis, and memory updates within 24 hours of any create, modify, or delete. All memory data is included in data exports.</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>On Enterprise, an Owner can disable memory org-wide , but read the warning first: <em>"Disabling Claude's memory at the organization level will automatically and permanently delete all memory data for all users in your organization."</em> Team plans have no org-level memory controls; it's individual-only.</span>
  </li>
</ul>

<p>
  And the finding worth the price of admission. People reach for <strong>incognito chats</strong>
  assuming they're private. On a personal account, they largely are: not used for training, not
  saved to history, not pulled into memory or chat search, retained 30 days by default. But on
  Team and Enterprise, <a href="https://support.claude.com/en/articles/12260368-using-incognito-chats" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">the doc</a> is blunt:
</p>

<p>
  <em>"Incognito chats are included in organizational data exports available to account Owners."
  … "Incognito chats are included in the Compliance API (available for Enterprise plans)."</em>
</p>

<p>
  In other words: on a managed plan, <strong>incognito is incognito from you, not from your
  org</strong>. It keeps a chat out of your history and out of memory, but it does not hide it
  from an Owner's export or an Enterprise Compliance pull, and it's retained at least 30 days for
  safety. If you're rolling Claude out, tell your people this plainly , because the word
  "incognito" promises more than it delivers in a workspace, and someone will assume it's a
  shield it isn't.
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="table" class="text-base font-medium mt-8 mb-3">the plan-by-plan table</h2>

<p>
  This is the table everyone wants and Anthropic never publishes as a table. Free, Pro, and Max
  share identical data-governance terms , the differences between them are usage and features,
  not data handling , so they share a column below. The real lines are drawn at Team and
  Enterprise.
</p>

<div class="border border-foreground/10 rounded-xl p-5 my-6 space-y-3 text-sm">
  <div class="grid grid-cols-4 gap-3 text-xs text-muted-foreground pb-2 border-b border-foreground/10">
    <span></span>
    <span>free / pro / max</span>
    <span>team</span>
    <span>enterprise</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">trains on connector data (raw pull)</span>
    <span>no</span>
    <span>no</span>
    <span>no</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">trains on connector-derived chat content</span>
    <span>only if opted in</span>
    <span>no</span>
    <span>no</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">default data retention</span>
    <span>30 days · 5 yrs if opted in</span>
    <span>not publicly specified</span>
    <span>indefinite until an Owner sets a custom period</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">who controls retention</span>
    <span>you</span>
    <span>not documented</span>
    <span>Owner / Primary Owner</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">zero data retention</span>
    <span>no</span>
    <span>no</span>
    <span>API &amp; Claude Code only, not the chat app</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">memory from chat history</span>
    <span>on, user-controlled</span>
    <span>on, individual-only</span>
    <span>on, Owner can disable org-wide</span>
  </div>
  <div class="grid grid-cols-4 gap-3">
    <span class="text-foreground/60">is incognito private from your org?</span>
    <span>yes (personal)</span>
    <span>no , in org exports</span>
    <span>no , exports + Compliance API</span>
  </div>
</div>

<p class="text-xs text-muted-foreground -mt-3 mb-4">
  Sources, by column: <a href="https://www.anthropic.com/news/updates-to-our-consumer-terms" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">consumer terms</a> and <a href="https://code.claude.com/docs/en/data-usage" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">data usage</a> (consumer);
  <a href="https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">custom retention</a>,
  <a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">API &amp; data retention</a>,
  <a href="https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">memory</a>, and
  <a href="https://support.claude.com/en/articles/12260368-using-incognito-chats" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">incognito</a> (Team / Enterprise).
  Where the docs don't say, the cell says so and points to <a href="#gaps" class="underline hover:no-underline">the gaps</a>.
</p>

<p class="my-4">
  <a href="/files/claude-gmail-connector-tier-table.pdf" class="underline hover:no-underline" download>↓ download the one-page tier table (PDF)</a>
  <span class="text-xs text-muted-foreground"> , the full five-column version, made to forward.</span>
</p>

<p>
  Two documented limits worth naming alongside the table, because the person asking has usually
  read the fine print: Anthropic may <a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">retain flagged inputs and outputs for up to two years</a>
  for misuse review even under privacy arrangements, and the Compliance API's <strong>activity feed</strong>
  , the who-did-what-when log, not message content , is
  <a href="https://platform.claude.com/docs/en/manage-claude/compliance-integration-patterns" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">retained for six years</a>.
  So "delete everything when an employee leaves" is true for content; the activity metadata
  persists.
</p>

<hr class="border-foreground/10 my-8" />

<h2 id="gaps" class="text-base font-medium mt-8 mb-3">where the documentation goes quiet</h2>

<p>
  A teardown is only honest if it marks its own edges. These are the places Anthropic's public
  docs don't give a crisp, primary answer as of June 9, 2026. None of them is a red flag ,
  they're the questions to send your account team, in writing, before you sign.
</p>

<div class="border border-foreground/10 rounded-xl p-5 my-6 space-y-4">
  <div>
    <p class="text-sm font-medium mb-1">what is the default data retention on Team?</p>
    <p class="text-xs text-muted-foreground">the custom-retention controls and the indefinite-by-default behavior are documented for Enterprise. Team's number isn't published. ask for the Team data-retention period in writing, and whether it's admin-configurable.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">is EU / in-region data residency GA for the claude.ai Team and Enterprise apps?</p>
    <p class="text-xs text-muted-foreground">the API documents data-residency / inference-geo options, and Bedrock and Vertex offer regional routes. residency for the chat product on Team/Enterprise is less clearly stated. confirm it for the exact surface your people will use.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">what's the real lifecycle of connector data in a chat that is neither deleted nor expired?</p>
    <p class="text-xs text-muted-foreground">"retained with the chat" is clear. but with Enterprise defaulting to indefinite retention, "with the chat" can mean "forever" until someone acts. ask what the actual time-to-live is under your configured retention setting.</p>
  </div>
  <div class="border-t border-foreground/10 pt-4">
    <p class="text-sm font-medium mb-1">does Team have SSO / SCIM and a Compliance API?</p>
    <p class="text-xs text-muted-foreground">don't assume it does , identity-tied provisioning (SSO/SCIM) and the Compliance API are Enterprise capabilities. if clean offboarding matters, confirm your plan actually includes the mechanism, not just the promise.</p>
  </div>
</div>

<hr class="border-foreground/10 my-8" />

<h2 id="bottom" class="text-base font-medium mt-8 mb-3">the bottom line</h2>

<p>
  The data question isn't the hard part. The answer exists, it's defensible, and most of it is a
  setting you control. <strong>The pipe is private</strong> , Anthropic does not train on your
  Gmail, Drive, or Calendar connector data on any plan. <strong>The conversation might not
  be</strong>, but only on consumer plans you opted into training on. Retrieved data lives with
  the chat; on Enterprise that means indefinitely until an Owner sets a retention period. And
  incognito is private from you, not from your org.
</p>

<p>
  So if your company is rolling out Claude and half the team is on personal Pro accounts, start
  there. Not with the connector , with the plan.
</p>

<hr class="border-foreground/10 my-10" />

<p class="text-sm text-muted-foreground">
  This piece is built entirely from Anthropic's own documentation, assembled in one place and
  re-verified on June 9, 2026. The receipts:
</p>

<ul class="space-y-1.5 my-4 text-sm text-muted-foreground">
  <li><a href="https://support.claude.com/en/articles/10166901-use-google-workspace-connectors" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Google Workspace connectors</a> , the authoritative connector doc</li>
  <li><a href="https://www.anthropic.com/news/updates-to-our-consumer-terms" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Updates to consumer terms &amp; privacy policy</a> , the Oct 8, 2025 training fork</li>
  <li><a href="https://code.claude.com/docs/en/data-usage" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Data usage &amp; retention</a> , consumer retention and coding sessions</li>
  <li><a href="https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Chat search &amp; memory</a> , memory synthesis, org controls, exports</li>
  <li><a href="https://support.claude.com/en/articles/12260368-using-incognito-chats" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Using incognito chats</a> , exports + Compliance API inclusion on Team/Enterprise</li>
  <li><a href="https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Custom data retention controls (Enterprise)</a> , indefinite-by-default</li>
  <li><a href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">API &amp; data retention / ZDR</a> , ZDR scope, flagged-content retention</li>
  <li><a href="https://platform.claude.com/docs/en/manage-claude/compliance-content-data" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Compliance API</a> , content deletion</li>
  <li><a href="https://platform.claude.com/docs/en/manage-claude/compliance-integration-patterns" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Compliance integration patterns</a> , six-year activity-feed retention</li>
  <li><a href="https://www.anthropic.com/product/enterprise" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Claude Enterprise</a></li>
  <li><a href="https://claude.com/blog/connectors-for-everyday-life" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Connectors for everyday life</a> , the 200+ connector directory</li>
</ul>

<p class="text-xs text-muted-foreground">
  Independent analysis, assembled from Anthropic's public documentation. I do not speak for
  Anthropic, and nothing here is legal advice. Plans and policies change , every claim is dated
  to its last verification above; check the source before you rely on it.
</p>
