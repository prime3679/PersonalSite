---
title: "I built a sensory app for my toddler in one sprint. It runs on nothing."
date: 2026-03-09
description: "No backend, no accounts, no dependencies. Just a screen that makes sounds and particles when a toddler taps it."
published: true
---

<p>
  My child is a toddler. They gravitate toward screens the way all kids that age do —
  with full-body enthusiasm and zero concept of why a particular screen might be bad for them.
</p>

<p>
  I could keep redirecting them to the Duplo blocks. Or I could build something worth looking at.
</p>

<p>
  I built JoyTap in one overnight sprint. Here's what it is and what it taught me.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what it does</h2>

<p>
  You tap the screen. Particles explode. A note plays. The phone vibrates.
</p>

<p>
  That's it. That's the whole product.
</p>

<p>
  The sounds are pentatonic — a five-note scale that doesn't have any dissonant combinations,
  so no matter what you tap or how fast, it always sounds musical. The particles are color-coded
  by world: fire world is warm and orange, ocean world is cool and deep, space world trails stars.
  There are seven worlds total, each with its own visual language and haptic pattern.
</p>

<p>
  Every tap is immediate. No loading states, no menus, no parent controls to navigate before
  the child can play. You hand it to a toddler, they tap, something beautiful happens.
  The feedback loop closes in under 100ms.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">the stack</h2>

<p>
  Pure Swift. SpriteKit for the particles. AVFoundation for the audio.
  CHHapticEngine for haptics. Zero third-party dependencies. Zero network calls.
  Zero backend. No analytics, no accounts, no data leaving the device.
</p>

<p>
  The binary is small enough that it doesn't feel like it should exist as an app.
  It runs on a hand-me-down iPhone without a sim card. It would run on an iPad from 2018.
  The power requirement is basically zero.
</p>

<p>
  I made one deliberate technical choice: no persistent state. Every session starts fresh.
  No save files, no progress, no streaks. A toddler doesn't have a concept of progress.
  They just want things to happen when they touch them.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">what building for a non-verbal user taught me</h2>

<p>
  My child cannot tell me what they think. They can't say "the haptic on world 3 feels wrong"
  or "I'd prefer softer colors." Their feedback is binary: they keep playing, or they put the
  phone down. The first version had too many particles — they'd tap once, the screen would fill
  with 200 emitters, and they'd stare blankly instead of tapping again. The second version
  throttled it. They kept tapping.
</p>

<p>
  Building for someone who can't articulate a preference forces a specific kind of clarity.
  You can't ask what they want. You watch what they do. Every design decision has to be
  legible to a toddler with no prior context.
</p>

<p>
  <strong>That constraint made the app better.</strong> Every time I was tempted to add
  a menu, a settings screen, a second tap gesture — I asked whether a toddler could
  figure it out without instruction. The answer was almost always no. So I didn't add it.
</p>

<p>
  Most apps I work on professionally have the opposite problem. Too many features, too much
  onboarding, too many assumptions about user patience. Designing for someone with zero
  patience and zero vocabulary is a useful corrective.
</p>

<hr class="border-foreground/10 my-8" />

<h2 class="text-base font-medium mt-8 mb-3">it's not on the App Store</h2>

<p>
  JoyTap is not a product. It's not on the App Store. I'm not building a company around it.
</p>

<p>
  I made it for my child. They use it. That's the whole story.
</p>

<p>
  There's something clarifying about building something for a specific person with no intention
  of ever shipping it publicly. No product metrics, no retention analysis, no monetization model.
  Just: does this person enjoy this thing I made for them?
</p>

<p>
  They do. They giggle at the space world. They make the same "more" sign they use for snacks
  when the screen goes idle and the particles stop. They've figured out that swiping sideways
  changes the world, even though I never showed them how.
</p>

<p>
  I've shipped features at Salesforce that affect millions of users. None of them gave me
  feedback like that.
</p>

<hr class="border-foreground/10 my-8" />

<p class="text-sm text-muted-foreground">
  If you want to build something similar for your kid, the core particle/audio loop is about
  200 lines of Swift. CHHapticEngine setup is the trickiest part — Apple's documentation is
  technically complete and practically opaque. Happy to share the relevant sections if you're
  building something and get stuck.
</p>
