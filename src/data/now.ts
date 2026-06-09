// Single source of truth for "current focus" content.
// Rendered in full on /now and condensed in the homepage "currently:" section,
// so the two never drift apart. Update here, both pages follow.

export interface BuildingItem {
  /** Optional link label (renders as an inline link when href is set). */
  label?: string;
  href?: string;
  /** The descriptive text following the label. */
  text: string;
}

export interface ReadingItem {
  author: string;
  note?: string;
}

export const now = {
  updated: 'June 2026',
  goodreads: 'https://www.goodreads.com/user/show/149439647-adrian-lumley',
  building: [
    {
      label: 'signal room',
      href: '/signal-room',
      text: 'a fiction serial about rogue, mission control, and systems trying to help humans without becoming the weather. new episodes monthly.',
    },
  ] satisfies BuildingItem[],
  reading: [
    { author: 'brandon sanderson', note: 'the cosmere, in order' },
    { author: 'viet thanh nguyen' },
    { author: 'patty wipfler', note: 'listen' },
  ] satisfies ReadingItem[],
  training: {
    disciplines: ['muay thai', 'jiu jitsu'],
    note: 'still getting hit. still showing up.',
  },
};
