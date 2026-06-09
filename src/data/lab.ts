// Single source of truth for the /lab project cards, same pattern as nav.ts
// and now.ts. Adding a build = adding an entry here; the page handles markup.
// The familyos/bishop stats and the signal-room card are overridden at build
// time in lab.astro (stats JSONs + episode collection) so they can't go stale.

export type LabCategory = 'agents' | 'tools' | 'toys' | 'writing';
export type BadgeTone = 'green' | 'amber' | 'sky';

export interface LabStat {
  value: string;
  label: string;
}

export interface LabLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface LabProject {
  id: string;
  category: LabCategory;
  title: string;
  href: string;
  external?: boolean;
  dateline: string;
  badge: { label: string; tone: BadgeTone };
  description: string;
  stats: LabStat[];
  /** Optional caption under the stats grid, e.g. "snapshot · feb 2026". */
  statsNote?: string;
  links: LabLink[];
}

export const badgeToneClasses: Record<BadgeTone, string> = {
  green: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
  amber: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5',
  sky: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5',
};

export const labProjects: LabProject[] = [
  {
    id: 'signal-room',
    category: 'writing',
    title: 'signal room',
    href: '/signal-room/',
    dateline: 'fiction serial · weekly',
    badge: { label: 'public', tone: 'sky' },
    description:
      'a public home for the rogue/bishop fiction serial: literary fragments about systems, households, truth, and mercy. readable without knowing the private machinery underneath.',
    // Overridden in lab.astro with live episode counts from the collection.
    stats: [],
    links: [{ label: 'read the serial ↗', href: '/signal-room/' }],
  },
  {
    id: 'operator-stack',
    category: 'tools',
    title: 'operator stack',
    href: '/operator-stack',
    dateline: 'built april 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      'a small stack of operator tools for people carrying too many threads. morning brief, weekly review, and a fuller morning operator layer. priced low on purpose. built to be useful fast.',
    stats: [
      { value: '3', label: 'live products' },
      { value: '1', label: 'local draft' },
      { value: '$3–$9', label: 'current ladder' },
    ],
    links: [{ label: 'browse tools ↗', href: '/operator-stack' }],
  },
  {
    id: '90-day-os',
    category: 'tools',
    title: '90-day os',
    href: '/90-day-os',
    dateline: 'built march 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      'a simple 90-day operating system for identity, goals, habit replacement, daily check-ins, dashboard reset, and weekly review. built as a concrete way to run a quarter on purpose instead of letting it dissolve into reactive weeks.',
    stats: [
      { value: '90', label: 'day cycle' },
      { value: '8', label: 'core sections' },
      { value: 'mvp', label: 'review-ready' },
    ],
    links: [{ label: 'open app ↗', href: '/90-day-os' }],
  },
  {
    id: 'familyos',
    category: 'agents',
    title: 'familyos',
    href: '/familyos',
    dateline: 'started feb 2026',
    badge: { label: 'paused', tone: 'amber' },
    description:
      "multi-agent family coordination. scans the week's calendar every monday, proposes assignments, learns from approvals. built because two working partners with a child deserve better than group texts and spreadsheets.",
    // Overridden in lab.astro from public/familyos-stats.json.
    stats: [],
    links: [
      { label: 'details ↗', href: '/familyos' },
      { label: 'open source ↗', href: 'https://github.com/prime3679/familyos-template', external: true },
    ],
  },
  {
    id: 'bishop',
    category: 'agents',
    title: 'bishop',
    href: '/bishop-development',
    dateline: 'started feb 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      'ai chief of staff. runs on a mac mini, connected to calendar, email, and github. handles morning briefings, monitors systems, drafts artifacts, and builds things like this while i\'m at work. the goal is to see how much a single agent can own.',
    // Overridden in lab.astro from public/bishop-stats.json.
    stats: [],
    links: [{ label: 'details ↗', href: '/bishop-development' }],
  },
  {
    id: 'mission-control',
    category: 'agents',
    title: 'mission control',
    href: 'https://mission.adrianlumley.co',
    external: true,
    dateline: 'started feb 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      'personal ops dashboard. spend tracking, provider health, cron status, git activity, and security alerts — all in one tab. runs on the mac mini behind a cloudflare tunnel.',
    stats: [
      { value: 'port 7777', label: 'local' },
      { value: 'cloudflare', label: 'tunnel' },
      { value: 'live', label: 'always on' },
    ],
    links: [{ label: 'open dashboard ↗', href: 'https://mission.adrianlumley.co', external: true }],
  },
  {
    id: 'bishop-bench',
    category: 'agents',
    title: 'bishop-bench',
    href: 'https://github.com/prime3679/bishop-bench',
    external: true,
    dateline: 'started feb 2026',
    badge: { label: 'experimental', tone: 'amber' },
    description:
      "multi-model eval runner. tests the same task across claude, gpt, and gemini simultaneously and scores outputs side-by-side. built to validate the cost routing architecture — if haiku can do the job, there's no reason to pay for opus.",
    stats: [
      { value: '4', label: 'models tested' },
      { value: '40x', label: 'cost delta (haiku→opus)' },
      { value: 'real', label: 'api calls' },
    ],
    links: [{ label: 'github ↗', href: 'https://github.com/prime3679/bishop-bench', external: true }],
  },
  {
    id: 'familyos-template',
    category: 'agents',
    title: 'familyos-template',
    href: 'https://github.com/prime3679/familyos-template',
    external: true,
    dateline: 'open source · feb 2026',
    badge: { label: 'open source', tone: 'sky' },
    description:
      "the generic, self-hostable version of familyos. no saas, no subscription. runs on your own machine with a telegram bot, google calendar, and an anthropic api key. configure your schedule, point it at your family's calendars, and let it run.",
    stats: [
      { value: 'node.js', label: 'runtime' },
      { value: 'sqlite', label: 'storage' },
      { value: 'mit', label: 'license' },
    ],
    links: [
      { label: 'github ↗', href: 'https://github.com/prime3679/familyos-template', external: true },
      { label: 'read the story ↗', href: '/blog/familyos-building-a-family-agent' },
    ],
  },
  {
    id: 'evelyns-world',
    category: 'toys',
    title: "evelyn's world",
    href: '/lab/evelyns-world/',
    dateline: 'built april 2026',
    badge: { label: 'new', tone: 'green' },
    description:
      'a warm little animal garden for toddler play. nine bold cards lead the page, first tap plays the animal sound, second tap speaks the name, and a gentle “where is it?” game adds a cheerful win.',
    stats: [
      { value: '9', label: 'animal cards' },
      { value: 'tap x2', label: 'sound then speech' },
      { value: '0 deps', label: 'pure html/js' },
    ],
    links: [{ label: 'open app ↗', href: '/lab/evelyns-world/' }],
  },
  {
    id: 'chaos-garden',
    category: 'toys',
    title: 'tiny chaos garden',
    href: '/lab/chaos-garden/',
    dateline: 'built april 2026',
    badge: { label: 'toy', tone: 'amber' },
    description:
      'a personal-site toy: part mood ring, part sticker sheet, part tiny command rebellion. click anywhere, drag to boss the particles around, or make the garden stranger.',
    stats: [
      { value: 'p5', label: 'canvas garden' },
      { value: 'tap', label: 'spawn chaos' },
      { value: '1 file', label: 'standalone html' },
    ],
    links: [{ label: 'open toy ↗', href: '/lab/chaos-garden/' }],
  },
  {
    id: 'iron-log',
    category: 'tools',
    title: 'iron log',
    href: '/lab/iron-log/',
    dateline: 'built overnight · feb 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      "workout tracker built in a single overnight session. logs sets and reps, tracks week-over-week progression, and loads today's program based on the day and week. 4-week push/pull/legs split with scapular rehab built in. no app store, no subscription.",
    stats: [
      { value: '1 night', label: 'build time' },
      { value: '4 wk', label: 'program' },
      { value: '0 deps', label: 'pure html/js' },
    ],
    links: [{ label: 'open app ↗', href: '/lab/iron-log/' }],
  },
  {
    id: 'meeting-price-tag',
    category: 'tools',
    title: 'meeting price tag',
    href: '/lab/meeting-cost/',
    dateline: 'built march 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      "real-time meeting cost calculator. add attendees by salary tier, hit start, and watch the dollars tick up. escalating messages remind you what that money could have bought instead. corporate satire that's also genuinely useful.",
    stats: [
      { value: '5', label: 'salary tiers' },
      { value: 'live', label: 'ticker' },
      { value: '0 deps', label: 'pure html/js' },
    ],
    links: [{ label: 'open app ↗', href: '/lab/meeting-cost/' }],
  },
  {
    id: 'joytap',
    category: 'tools',
    title: 'joytap',
    href: '/blog/joytap-one-sprint',
    dateline: 'started march 2026',
    badge: { label: 'active', tone: 'green' },
    description:
      'sensory play app for toddlers. tap the screen — particles, sounds, and haptic feedback. 7 themed worlds, no accounts, no ads. built in a single sprint for evelyn.',
    stats: [
      { value: '1 sprint', label: 'build time' },
      { value: 'ios', label: 'platform' },
      { value: '0 deps', label: 'native swift' },
    ],
    links: [{ label: 'read the story ↗', href: '/blog/joytap-one-sprint' }],
  },
];
