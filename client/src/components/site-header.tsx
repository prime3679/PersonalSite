import { Link, useLocation } from "wouter";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
  { href: "/", label: "HOME", isActive: (path: string) => path === "/" },
  { href: "/blog", label: "BLOG", isActive: (path: string) => path === "/blog" || path.startsWith("/blog/") },
  { href: "/projects", label: "PROJECTS", isActive: (path: string) => path === "/projects" },
  { href: "/contact", label: "CONTACT", isActive: (path: string) => path === "/contact" },
] as const;

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm">
        <nav className="flex gap-5 font-medium">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(location);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors duration-200 ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                data-testid={`link-${item.label.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground" data-testid="text-location">
            NYC • US/UK
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
