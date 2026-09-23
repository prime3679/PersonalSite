export interface NavItem {
  href: string;
  label: string;
}

// hrefs carry the trailing slash the canonical worker would otherwise
// redirect to, so a nav click is one request. three items fit on one line
// at 320px, so there is no mobile menu.
export const navItems: NavItem[] = [
  { href: '/writing/', label: 'writing' },
  { href: '/lab/', label: 'lab' },
  { href: '/about/', label: 'about' },
];
