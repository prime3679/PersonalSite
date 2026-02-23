---
title: "I gave an AI agent two weeks to coordinate my family"
date: 2026-02-18
description: "What I learned building a multi-agent family coordination system from scratch. Not a product pitch — just what happened when I stopped managing logistics manually."
---

<p>
  My partner and I both have demanding jobs. We have a young child and another on the way.
  Every week, the same invisible work: who does daycare pickup? When do we actually have a date night?
  Who's getting groceries?
</p>
<p>
  We were managing it with group texts and a shared Google Calendar. It worked, technically.
  But it was friction — small, constant, cumulative.
</p>
<p>
  I've been a product manager for 14 years. I know what "good enough" looks like.
  This wasn't good enough.
</p>
<p>So I built something.</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the idea</h2>
<p>
  I wanted a system that would handle the coordination layer entirely. Not remind me to coordinate
  — actually coordinate. Scan the week, look at both our calendars, figure out who should do what,
  and ask for a single confirmation.
</p>
<p>
  The thing that made this feel possible now is agents. Not chatbots. Autonomous systems that can
  reason about context, use tools, and take action.
</p>
<p>The architecture I landed on:</p>
<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Adrian-agent runs on a Mac Mini at home, 24/7</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Every Monday at 7am, it scans the week's calendar</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Identifies coordination needs: daycare, meals, errands, date nights</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Proposes assignments based on preferences and load balancing</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Sends a proposal via Telegram</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>I reply APPROVE or tell it what to change</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>It learns from the pattern over time</span>
  </li>
</ul>
<p>One message per week. Done.</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what I actually built</h2>
<p>
  The stack is deliberately boring: Node.js 25 (with built-in SQLite, no dependencies),
  TypeScript, and the Google Calendar API. The whole thing runs as a cron job.
  There's no app. No dashboard. No notification center to check.
</p>
<p>The agent does four things well:</p>

<div class="space-y-4 my-6">
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">01</span>
      <span class="text-sm font-medium">calendar scanning</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Reads the shared calendar, identifies gaps. If there's no one assigned to Tuesday pickup, that's a coordination need.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">02</span>
      <span class="text-sm font-medium">load balancing</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Tracks who's been assigned what. If I've done three dropoffs this week, it proposes my partner for the fourth.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">03</span>
      <span class="text-sm font-medium">preference learning</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Every approval and rejection gets logged. After a few weeks, it knows that Mondays are mine and Fridays are workout days. It stops asking.</p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">04</span>
      <span class="text-sm font-medium">date night detection</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">Scans for when we last had one. If it's been two weeks, it finds a Friday with no conflicts and puts it in the proposal. This one alone might justify the project.</p>
  </div>
</div>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what surprised me</h2>
<p>
  <strong>The hard part wasn't the code.</strong> The agent logic took a weekend.
  The hard part was defining preferences. Which days do you prefer pickup? What are your
  hard-blocked times? How many times a week do you want to cook?
</p>
<p>
  These seem like simple questions. They're not. They surface implicit negotiation that was
  previously happening in real-time via text. Making it explicit is uncomfortable at first.
  It's also exactly the point.
</p>
<p>
  <strong>The second agent is the interesting problem.</strong> Right now this is
  single-agent — my agent, my preferences, proposals sent to both of us. The next phase
  is my partner's agent: their own preferences, their own constraints, agent-to-agent negotiation
  before a proposal hits us. Not AI managing humans — AI managing AI on behalf of humans.
  That's the piece I'm most curious about.
</p>
<p>
  <strong>It changes the texture of the conversation.</strong> Before: "Can you get her today?"
  After: a calendar entry appears and neither of us had to discuss it. That's the win.
  Not the automation — the reclaimed attention.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what's next</h2>
<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Preference learning kicks in around week 4</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Partner agent (v0.3)</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Meal planning with grocery assignment (v0.4)</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>Open source release when it's working well enough to share (v1.0)</span>
  </li>
</ul>
<p>
  The template is <a href="https://github.com/prime3679/familyos-template" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">open source on GitHub</a> if you want to build your own.
  No launch announcement, no waitlist.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">why I'm writing this</h2>
<p>
  Not to pitch a product. Not to build an audience. I've been burned by internet attention
  before and I don't miss it.
</p>
<p>
  I'm writing this because I genuinely think this is a more useful application of AI than
  another chatbot wrapper. The value isn't in any single conversation — it's in systems
  that run quietly in the background and free up attention for things that actually matter.
</p>
<p>
  If you're a working parent with the technical chops to self-host this, you might find it useful.
  That's enough.
</p>
