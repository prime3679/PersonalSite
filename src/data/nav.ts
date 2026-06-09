export interface NavItem {
  href: string;
  label: string;
  /**
   * Shown as a top-level tab in the header. Non-primary items are reachable
   * from the footer (and the mobile menu) but kept out of the desktop tab bar
   * to keep it tight. Home is the wordmark, so it is not a primary tab.
   */
  primary?: boolean;
}

// Single source of truth for navigation.
// The footer and mobile menu render the full list; the header renders only
// `primaryNavItems` as tabs (with the name acting as the home link).
export const navItems: NavItem[] = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about', primary: true },
  { href: '/now', label: 'now' },
  { href: '/blog', label: 'blog', primary: true },
  { href: '/signal-room', label: 'signal room' },
  { href: '/lab', label: 'lab', primary: true },
  { href: '/contact', label: 'contact', primary: true },
];

// Tightened set of top-level header tabs (home lives in the wordmark).
export const primaryNavItems = navItems.filter((item) => item.primary);
