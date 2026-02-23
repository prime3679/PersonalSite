export interface CaseStudy {
  id: string;
  company: string;
  headline: string;
  blurb: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'siriusxm',
    company: 'SiriusXM',
    headline: '18% lift in daily sessions',
    blurb: 'Led the multi-platform playback overhaul, aligning design, data science, and engineering to unlock stickier listening habits for 34M subscribers.',
  },
  {
    id: 'disney-plus',
    company: 'Disney+',
    headline: '60+ market launch toolkit',
    blurb: 'Built localization ops dashboards and release workflows that cut subtitle/asset turnaround 35% while keeping day-one parity worldwide.',
  },
  {
    id: 'ea-sports',
    company: 'Electronic Arts',
    headline: '0→1 GM · 40-person team · became the EA Sports App',
    blurb: 'Built a GenZ sports companion app from scratch — mini games, highlight remixes, live reward loops tied to league partners. 90% CSAT, 86% weekly retention. The feed and highlight remix were mine.',
  },
];
