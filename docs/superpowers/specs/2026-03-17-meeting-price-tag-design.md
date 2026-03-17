# Meeting Price Tag — Design Spec

## Overview

A real-time meeting cost calculator that shows what your meeting costs per second based on who's in the room. Corporate satire tone. Two modes: setup (calculator) and live ticker. Deployed as a standalone HTML file on adrianlumley.co/lab/meeting-cost/.

## Core Flow

### Screen 1: Setup

**Header:** "MEETING PRICE TAG" — large, bold. Tagline: "Should this meeting be an email?"

**Salary tiers** with +/- steppers for headcount:

| Tier | Label | Annual Salary | Hourly Rate |
|------|-------|---------------|-------------|
| IC | Individual Contributor | $120,000 | $57.69 |
| MGR | People Manager | $180,000 | $86.54 |
| DIR | Senior Director | $250,000 | $120.19 |
| VP | Vice President | $350,000 | $168.27 |
| C | C-Suite | $500,000 | $240.38 |

Hourly rate = annual / 2080 (52 weeks * 40 hours).

**Live preview** below tiers: total attendees count and calculated cost-per-minute update as tiers change.

**"START MEETING" button** — disabled until at least 1 attendee added.

### Screen 2: Live Ticker

**Giant dollar amount** — primary visual element, ticking in real-time (updates every 100ms for smooth animation). Cents visible and rolling.

**Elapsed time** — MM:SS format below the dollar amount.

**Escalating message line** — single line that updates as cost crosses thresholds:

| Threshold | Message |
|-----------|---------|
| $0 | "The clock is ticking..." |
| $50 | "That's a team lunch." |
| $150 | "That's a month of ChatGPT Team." |
| $300 | "This should have been an email." |
| $500 | "That's a junior engineer for a day." |
| $1,000 | "This should have been a Slack message." |
| $2,000 | "That's a month of Figma for the whole team." |
| $5,000 | "This should have been a calendar decline." |
| $10,000 | "Someone could have shipped a feature." |
| $25,000 | "You just burned a quarter's intern budget." |

Message transitions should animate (fade out old, fade in new).

**"END MEETING" button** — stops ticker, transitions to results.

### Screen 3: Results Card

**Summary stats:**
- Total cost (large, prominent)
- Duration (MM:SS)
- Attendees count
- Cost per minute

**Final verdict** — the last threshold message reached, displayed prominently.

**"COPY RESULTS" button** — copies shareable text to clipboard:
```
Meeting Price Tag
$2,847.32 | 47min | 12 people
$60.58/min
"That's a month of Figma for the whole team."
adrianlumley.co/lab/meeting-cost
```

**"NEW MEETING" button** — resets to setup screen.

## Visual Design

**Primary requirement: beautiful.**

- Dark theme — near-black background (#0a0a0f or similar)
- Accent color: warm amber/gold (#F59E0B / #FBBF24) — evokes corporate luxury, money
- Secondary: cool slate for muted text
- The dollar amount on the ticker screen should be the hero — massive, sharp, possibly with a subtle glow or gradient
- Smooth transitions between screens (fade or slide)
- Tier selector cards should feel tactile — hover states, subtle borders, satisfying +/- interactions
- The ticker should feel alive — smooth number animation, not jumpy
- Typography: system font stack or a clean sans-serif (Inter or similar via CDN). No pixel fonts — this is polished, not retro.
- Mobile-first, max-width ~480px centered

## Technical

- Single HTML file: `public/lab/meeting-cost/index.html`
- Vanilla JS, no dependencies (may use Inter font via Google Fonts CDN — only external resource)
- CSS custom properties for theming
- requestAnimationFrame for smooth ticker updates
- All state in JS (no localStorage needed — ephemeral by nature)
- Responsive, works on phone (people will use this in actual meetings)

## Out of Scope

- User accounts, history, saving past meetings
- Custom salary inputs (tiers are sufficient)
- Sound effects
- Backend / API
