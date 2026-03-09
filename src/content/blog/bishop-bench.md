---
title: "I built a benchmark tool to stop making AI model choices on vibes."
date: 2026-03-09
description: "Haiku vs Sonnet vs Opus vs GPT — I was just guessing. So I built something to run the same task across all of them and look at the actual numbers."
draft: false
---

<p>
  Every time I spin up a new automation, I make the same call: which model should run this?
  Claude Haiku? Sonnet? Opus? GPT? For the last few months my answer was basically vibes.
  Sonnet for anything that matters. Haiku for the cheap stuff. Opus when I'm desperate.
  GPT when I feel like comparing.
</p>

<p>
  That's not a strategy. That's just expensive intuition.
</p>

<p>
  So I built <a href="https://github.com/prime3679/bishop-bench" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">bishop-bench</a> — a tool that runs identical tasks across multiple models simultaneously and shows you the real numbers: quality score, cost, latency.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the actual problem</h2>

<p>
  Model routing sounds like an infrastructure problem. It's not. It's a trust problem.
</p>

<p>
  I know intellectually that Haiku costs about 40x less than Opus. I know it. But when I'm
  configuring a cron job that runs 19 times a day, I default to Sonnet anyway — because I've
  seen Sonnet succeed and I haven't personally verified what Haiku would do with the same task.
  So I pay the Sonnet tax on every run, indefinitely, because uncertainty is expensive.
</p>

<p>
  The gap between Haiku and Opus on complex reasoning tasks is real and significant.
  The gap on simple tasks — summarize this, format that, flag anything urgent — is much smaller
  than I assumed. But "much smaller than I assumed" is still a vibe. I needed evidence.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">how it works</h2>

<p>
  You define tasks in YAML — the prompt, what capabilities it requires, what good output looks like.
  The eval runner sends that exact same task to every model you're comparing. Then scoring
  runs against each result: completeness, accuracy, formatting, actionability.
</p>

<p>
  The output is a comparison table. Model × metric. You see what Haiku got right, what it missed,
  what Sonnet did differently, how long each took, and what each one cost per run. Then you
  make the routing call with data instead of instinct.
</p>

<p>
  The task format matters. Vague prompts produce noisy comparisons. The discipline of writing
  a benchmark task — specific prompt, explicit success criteria, clear expected capabilities —
  is half the value. It forces you to define what "good" actually means for a given use case
  before you pick a model to do it.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what I've found so far</h2>

<p>
  It's early. The tool is still being built — scoring algorithms are in progress, the dashboard
  doesn't exist yet, and I'm still refining the task library. But even the rough results are
  already shifting my defaults.
</p>

<p>
  For the operational layer of Bishop — morning briefings, heartbeat checks, weekly summaries —
  Haiku handles the job. Not almost handles it. Handles it. The quality difference on structured,
  well-scoped tasks is marginal. The cost difference is not. Running 19 cron jobs a day on Haiku
  instead of Sonnet compounds across weeks.
</p>

<p>
  For tasks that require actual reasoning — multi-step planning, ambiguous inputs, anything where
  a wrong call has real consequences — Sonnet earns its place. The gap shows up clearly when you
  look at it side by side.
</p>

<p>
  The 40x cost delta is real. Whether that delta is worth it for a given task is a question
  you can now answer with data instead of instinct.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">why this matters beyond my own setup</h2>

<p>
  Model selection is a first-class engineering decision that most teams treat as an afterthought.
  Someone picks a model at the start of a project — usually the one they've heard of — and it
  stays there. No benchmarking, no routing logic, no revisiting as better or cheaper options emerge.
</p>

<p>
  That's going to be expensive at scale. The model landscape is changing fast. Prices are
  dropping. Smaller models are getting better. The right answer six months ago may not be
  the right answer now. You need a way to test.
</p>

<p>
  Bishop-bench is my way of testing. It's experimental, opinionated, and built entirely
  around my own use cases. But the principle is portable: if you're making routing decisions
  for repeated, automated tasks, you should be able to show your work.
</p>

<hr class="border-foreground/10 my-8" />

<p class="text-sm text-muted-foreground">
  The repo is at <a href="https://github.com/prime3679/bishop-bench" class="underline hover:no-underline" target="_blank" rel="noopener noreferrer">github.com/prime3679/bishop-bench</a>.
  Early stage — the eval runner is functional, scoring and dashboard are in progress.
  If you're building something similar or want to compare notes on model routing, I'm easy to find.
</p>
