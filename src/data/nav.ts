export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/work', label: 'work' },
  { href: '/lab', label: 'lab' },
  { href: '/writing', label: 'writing' },
  { href: '/signal-room', label: 'signal room' },
  { href: '/contact', label: 'contact' },
];

export const primaryNavItems = navItems;
