export interface NavItem {
  href: string;
  label: string;
}

// hrefs carry the trailing slash the canonical worker would otherwise
// redirect to, so a nav click is one request.
export const navItems: NavItem[] = [
  { href: '/work/', label: 'work' },
  { href: '/lab/', label: 'lab' },
  { href: '/writing/', label: 'writing' },
  { href: '/signal-room/', label: 'signal room' },
  { href: '/contact/', label: 'contact' },
];

export const primaryNavItems = navItems;
