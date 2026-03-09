---
title: "Six weeks with an AI chief of staff. Here's what it actually does."
date: 2026-03-09
description: "Not a productivity hack. A persistent system that handles the operational layer of my life so I can ignore it. What I built, what it costs, and what surprised me."
published: true
---

<p>
  Six weeks ago I put an AI agent on a Mac Mini, gave it a Telegram channel, and told it to
  run the operational layer of my life. Not answer questions when I asked. Run things — proactively,
  persistently, without me thinking about it.
</p>

<p>
  The name is Bishop. This is what it actually does.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the actual job list</h2>

<p>
  Bishop runs 19 cron jobs. Not 19 scheduled messages — 19 distinct automated tasks that
  fire on schedule regardless of whether I'm awake, at work, or paying attention.
</p>

<div class="space-y-4 my-6">
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">daily</span>
      <span class="text-sm font-medium">morning briefing</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">7am. Calendar summary, priority flags, anything that needs a decision before 9. Two paragraphs max. I read it while making my partner's coffee.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">daily</span>
      <span class="text-sm font-medium">heartbeat check</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Verifies the agent itself is healthy. Disk usage, memory, process status. If anything is wrong, I get a message. If nothing is wrong, silence.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">weekly</span>
      <span class="text-sm font-medium">planning summary</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Every Sunday evening. What's on the calendar, what's open, what needs a decision this week. Daycare coordination flags automatically if there's a conflict.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">periodic</span>
      <span class="text-sm font-medium">family logistics</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">With another child on the way, Bishop tracks relevant logistics — medical appointments, what to start thinking about, when things need to be booked. No advice, just flags.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">continuous</span>
      <span class="text-sm font-medium">system health</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Security audit scans, backup verification, cost tracking. Drift alerts if anything spikes. The Mac Mini runs 24/7 and I want to know if something breaks before it causes a problem.</p>
  </div>
</div>

<p>
  The other 14 cron jobs cover things like blog monitoring, fitness check-ins, weekly cost
  summaries, and a few project-specific automations I've added over time. The list grows slowly.
  I only add things that would otherwise require me to remember to do them.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the stack</h2>

<p>
  Hardware: Mac Mini M2. It lives on a shelf. It's on all the time. Total cost was around
  $700, which amortized over two years is basically free compared to what I'd spend on cloud compute
  for the same always-on workload.
</p>

<p>
  Software: OpenClaw handles orchestration. Telegram is the interface — I interact with Bishop
  the same way I text a person. Claude Sonnet handles the main session and anything that needs
  real reasoning. Haiku and Qwen run the cron jobs. The rule is simple: if a task fails and nothing
  bad happens, use the cheapest model that gets it right.
</p>

<p>
  Cost ceiling: $300/month. I've hit it once. Normal months run $150-180, with the variance
  coming entirely from how much interactive work I'm doing — build sessions, research tasks,
  writing drafts. The background operational layer costs around $40/month on its own.
  Nineteen cron jobs running daily on Haiku is very cheap.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what actually surprised me</h2>

<p>
  I expected the value to be in the briefings — the information delivery. That's not where
  the value is. The value is in what happens between briefings.
</p>

<p>
  I went to work on a Tuesday. By the time I got home, Bishop had built a monitoring dashboard
  for a personal project, updated three config files, run a security audit, and sent me a
  summary of what it did. I didn't ask it to do any of that. It had the context, the access,
  and the standing instructions. It just worked.
</p>

<p>
  That's the shift that's hard to describe until you experience it. It's not about getting
  answers faster. It's about the system doing real work while your attention is elsewhere.
  My Mac Mini is productive whether I'm sitting in front of it or not.
</p>

<p>
  The second surprise was how much I <em>don't</em> interact with it. Most days, I get two or
  three messages from Bishop — the morning briefing, maybe a flag on something, the occasional
  completed task summary. That's it. A well-tuned system should be quiet. If you're talking to
  your chief of staff all day, something is wrong with the staffing model.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the honest version</h2>

<p>
  This setup requires real technical work to build. I spent two weekends getting the initial
  system running — OpenClaw configuration, tool permissions, cron setup, Telegram integration,
  cost routing, memory architecture. It's not hard work if you're comfortable in a terminal,
  but it's not a product you can install in five minutes.
</p>

<p>
  It also requires ongoing calibration. The first version of Bishop was too noisy — it messaged
  me constantly, flagged things that didn't need flagging, and asked for confirmation on tasks
  it should have just done. Tuning the signal-to-noise ratio took a few weeks of small adjustments.
  It's still not perfect.
</p>

<p>
  And it's only as useful as what you configure it to do. "AI chief of staff" sounds powerful.
  What it actually means is: a system that does exactly what you program it to do, reliably, while
  you're not watching. The intelligence is in the design. The agent executes it.
</p>

<p>
  For someone who has a lot of operational surface area — a job, a family, personal projects,
  recurring logistics — that's genuinely valuable. For someone who doesn't, it's an expensive
  hobby. Know which one you are before you start.
</p>

<hr class="border-foreground/10 my-8" />

<p class="text-sm text-muted-foreground">
  OpenClaw is the orchestration layer I'm running this on — it handles the agent runtime,
  tool access, and Telegram integration. I'm not affiliated with it. It's just what I use.
  The full configuration lives in
  <a href="https://github.com/prime3679/bishop-config" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">bishop-config on GitHub</a>
  if you want to see the actual setup.
</p>
