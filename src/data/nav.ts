export interface NavItem {
  href: string;
  label: string;
}

// Single source of truth for primary navigation.
// Used by both the header (Header.astro) and the footer (Base.astro)
// so the two can never drift out of sync.
export const navItems: NavItem[] = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about' },
  { href: '/now', label: 'now' },
  { href: '/blog', label: 'blog' },
  { href: '/signal-room', label: 'signal room' },
  { href: '/lab', label: 'lab' },
  { href: '/contact', label: 'contact' },
];
