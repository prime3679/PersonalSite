---
title: "Second-order effects in product organizations"
date: 2026-03-09
description: "Why the best product decisions consider what happens after what happens. Lessons from 14 years of product work at Salesforce, SiriusXM, Disney+, and beyond."
published: true
---

<p>
  Most product decisions get evaluated on their direct effect. Will this feature increase
  engagement? Does this cut reduce cost? Will this launch make the quarter?
</p>

<p>
  The best PMs I've worked with ask a different question first: <em>and then what?</em>
</p>

<p>
  That's it. That's the whole framework. But it's harder than it sounds, because the answer
  to "and then what?" is almost never technical. It's usually organizational.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what second-order effects actually look like</h2>

<p>
  Three examples from real product work:
</p>

<div class="space-y-4 my-6">
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">01</span>
      <span class="text-sm font-medium">shipping fast</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">
      The direct effect: feature ships in Q3, you hit the milestone, stakeholders are happy.
      The second-order effect: every shortcut in the implementation becomes load-bearing.
      The next six features slow down by 20% because the foundation is fragile. By Q1 the team
      is moving half as fast as they were before the "fast" ship. The launch looked like a win.
      The compounding looked like decline.
    </p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">02</span>
      <span class="text-sm font-medium">power-user capability</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">
      Direct effect: power users get a feature they've been asking for. NPS goes up.
      Second-order effect: the feature is flexible enough that it gets used in unexpected ways.
      Support ticket volume climbs. Documentation expands. Onboarding gets more complex.
      The org is now maintaining a capability that serves 3% of users and costs more than it generates.
      The users who asked for it love it. The team that has to support it doesn't.
    </p>
  </div>
  <div class="border border-foreground/10 rounded-xl p-4">
    <div class="flex items-baseline gap-3 mb-1.5">
      <span class="text-xs text-muted-foreground">03</span>
      <span class="text-sm font-medium">cutting scope</span>
    </div>
    <p class="text-sm text-foreground/60 leading-relaxed">
      Direct effect: you reduce scope, hit the timeline, and ship something smaller than promised.
      Second-order effect: the stakeholder who was already skeptical now has evidence for the narrative
      they were already building. The scope cut wasn't just a project decision — it was a trust signal.
      You shipped on time. You also made next quarter's roadmap fight harder.
    </p>
  </div>
</div>

<p>
  None of these are hypothetical. All three happened to me or around me in the last five years.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">why the second-order effect is usually organizational</h2>

<p>
  Engineers think in systems. When they model second-order effects, they're thinking about
  technical debt, architectural dependencies, test coverage. Those are real. They're also
  the easier ones to reason about.
</p>

<p>
  The harder second-order effects are social. <strong>What signal does this decision send?
  Who does this put in a difficult position? What story does this enable?</strong>
</p>

<p>
  Cutting scope doesn't just change a delivery date — it changes a narrative. Shipping a rough
  feature doesn't just add tech debt — it sets expectations for what "done" means on your team.
  Saying yes to a request from a senior stakeholder doesn't just add scope — it creates
  a precedent for who gets to change the roadmap and when.
</p>

<p>
  At small companies, these effects are visible and fast. Someone makes a decision, the team
  reacts, you see the consequence within a sprint. At Salesforce scale — tens of thousands
  of employees, nested hierarchies, cross-functional dependencies — the lag between decision
  and second-order consequence can be six months. By the time the effect shows up,
  most people have forgotten the cause.
</p>

<p>
  That lag is exactly why the habit matters. If you only learn from immediate feedback,
  you'll never see the pattern.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the habit</h2>

<p>
  Before any major decision — roadmap change, scope cut, new capability, launch timing —
  I ask "and then what?" twice.
</p>

<p>
  Once gets you the obvious consequence. Twice gets you the consequence of that consequence.
  That's usually where the real risk lives.
</p>

<ul class="space-y-1.5 my-4">
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>If we ship this fast: and then what? (debt accrues) And then what? (next sprint slows, team morale dips, PM credibility on timelines gets quietly discounted)</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>If we say yes to this stakeholder: and then what? (they get what they asked for) And then what? (every other stakeholder now knows the priority can be moved, and they start asking)</span>
  </li>
  <li class="flex items-start gap-2 text-foreground/70">
    <span class="shrink-0 mt-0.5">→</span>
    <span>If we cut this feature: and then what? (we hit the date) And then what? (the affected team feels deprioritized, the relationship costs start compounding)</span>
  </li>
</ul>

<p>
  You don't have to reverse every decision because of what you find. Sometimes the second-order
  effect is acceptable, or manageable, or smaller than the first-order gain. The point is to
  see it clearly before you commit — not discover it six months later wondering what happened.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what separates the best from the rest</h2>

<p>
  I've worked with PMs at every level across media, streaming, and enterprise software.
  The ones who compound — who consistently produce outsized outcomes over years, not just
  quarters — share this trait more reliably than any other. They're not smarter about features.
  They're smarter about systems.
</p>

<p>
  They see the organization as the product. They understand that every roadmap decision,
  every scope negotiation, every launch call is also a social and political act with consequences
  that extend beyond the immediate deliverable.
</p>

<p>
  The first-order effect is easy to optimize for. Any PM with spreadsheet skills and a willingness
  to argue can do it. The second-order effect is where the judgment lives — and it's almost
  entirely invisible to people who haven't trained themselves to look for it.
</p>

<p>
  Ask "and then what?" twice. Write down the answer. Then decide.
</p>
