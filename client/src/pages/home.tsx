import { useState, useMemo } from "react";
import { Link } from "wouter";

interface DisclosureProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

function Disclosure({ title, children, isOpen, onClick }: DisclosureProps) {
  return (
    <div className="disclosure-item">
      <button
        onClick={onClick}
        className="w-full text-left px-4 py-3 bg-zinc-950 hover:bg-zinc-900 flex items-center justify-between transition-colors duration-200"
        data-testid={`button-disclosure-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="font-semibold">{title}</span>
        <span className="text-zinc-500">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="px-4 py-4 text-zinc-300 leading-relaxed bg-black transition-all duration-300 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [openDisclosure, setOpenDisclosure] = useState<string | null>(null);

  const toggleDisclosure = (key: string) => {
    setOpenDisclosure(openDisclosure === key ? null : key);
  };

  const daysBuilding = useMemo(() => {
    const birthDate = new Date('1989-03-06');
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/70 border-b border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between text-sm">
          <nav className="flex gap-5 font-medium">
            <Link 
              href="/blog" 
              className="hover:underline transition-all duration-200"
              data-testid="link-blog"
            >
              BLOG
            </Link>
            <Link 
              href="/projects" 
              className="hover:underline transition-all duration-200"
              data-testid="link-projects"
            >
              PROJECTS
            </Link>
            <a 
              href="#contact" 
              className="hover:underline transition-all duration-200"
              data-testid="link-contact"
            >
              CONTACT
            </a>
            <a 
              href="https://www.linkedin.com/in/adrianlumley" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline transition-all duration-200"
              data-testid="link-linkedin"
            >
              LINKEDIN
            </a>
          </nav>
          <div className="text-xs text-zinc-400" data-testid="text-location">NYC • US/UK</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="text-hero-title">
            HEY, I'M ADRIAN.
          </h1>
          <p className="mt-4 text-lg text-zinc-300" data-testid="text-hero-description">
            Senior Director of Product Management at SiriusXM, based in Long Island City, NYC. I build partnerships, platforms, and AI-enabled experiences.
          </p>
          <p className="mt-4 text-zinc-400" data-testid="text-days-building">
            I've been building things for{' '}
            <span className="font-semibold text-white">{daysBuilding.toLocaleString()}</span> days.
          </p>
        </section>

        {/* Notes & Wins Section */}
        <section className="mt-10">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-notes">
            A FEW NOTES & WINS
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-200">
            <li data-testid="text-note-siriusxm">
              Led product partnerships at <span className="font-semibold">SiriusXM</span> shaping connected, personalized subscriber journeys.
            </li>
            <li data-testid="text-note-background">
              EMBA grad (Quantic). Formerly at <span className="font-semibold">EA</span>, <span className="font-semibold">Disney Streaming</span>, and <span className="font-semibold">ESPN</span>.
            </li>
            <li data-testid="text-note-consulting">
              Built a small consulting practice and a portfolio of AI/product strategy experiments.
            </li>
            <li data-testid="text-note-personal">
              Dual citizen (US/UK); endlessly curious about cities, culture, and design. Martial artist for longevity (Muay Thai + BJJ).
            </li>
          </ul>
        </section>

        {/* Projects Section */}
        <section className="mt-10">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-projects">
            SOME PROJECTS I'M WORKING ON
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-200">
            <li data-testid="text-project-lacarta">
              <a className="underline hover:text-white transition-colors duration-200" href="#" target="_blank" rel="noopener noreferrer">
                La Carta
              </a>{' '}
              — a dining experience product: reserve, pre-order, and pre-pay to compress dwell time and personalize service.
            </li>
            <li data-testid="text-project-sierra">
              <a className="underline hover:text-white transition-colors duration-200" href="#" target="_blank" rel="noopener noreferrer">
                Sierra AI Playbooks
              </a>{' '}
              — org design + guardrails for AI agents across growth and service journeys.
            </li>
            <li data-testid="text-project-radar">
              <a className="underline hover:text-white transition-colors duration-200" href="#" target="_blank" rel="noopener noreferrer">
                VP Comp Radar
              </a>{' '}
              — living Google Sheet + visuals tracking market ranges and outbound pipeline.
            </li>
            <li data-testid="text-project-automations">
              <a className="underline hover:text-white transition-colors duration-200" href="#" target="_blank" rel="noopener noreferrer">
                Personal Automations
              </a>{' '}
              — inbox triage, contact memory, travel planning, and family ops.
            </li>
          </ul>
          <p className="mt-3 text-sm text-zinc-400" data-testid="text-projects-philosophy">
            I start many experiments and keep the compounding ones. Sunk cost is not a strategy.
          </p>
        </section>

        {/* TL;DR Disclosure Section */}
        <section className="mt-10">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-tldr">
            TL;DR
          </h2>
          
          <div className="mt-3 divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
            <Disclosure
              title="HOW I STARTED"
              isOpen={openDisclosure === 'start'}
              onClick={() => toggleDisclosure('start')}
            >
              <p>
                First-gen builder with roots in Jamaica and London, raised in the U.S. Learned systems by shipping: games at EA, platforms at Disney/ESPN, partnerships at SiriusXM. Now optimizing for meaningful work, family, and health.
              </p>
            </Disclosure>

            <Disclosure
              title="MY GOAL"
              isOpen={openDisclosure === 'goal'}
              onClick={() => toggleDisclosure('goal')}
            >
              <p>
                Become a VP of Product to scale platforms and teams, then build a durable business around human-centered AI experiences.
              </p>
            </Disclosure>

            <Disclosure
              title="MY MOTIVATIONS"
              isOpen={openDisclosure === 'motivation'}
              onClick={() => toggleDisclosure('motivation')}
            >
              <p>
                Longevity, craftsmanship, and compounding knowledge. Make good things with good people, leave processes cleaner than I found them, and be present for my wife Nicole and our daughter Evelyn.
              </p>
            </Disclosure>

            <Disclosure
              title="WHERE I SEE MYSELF IN ~3,000 DAYS"
              isOpen={openDisclosure === 'horizon'}
              onClick={() => toggleDisclosure('horizon')}
            >
              <p>
                Running a small, high-leverage company that blends content, software, and services—calm, profitable, and useful.
              </p>
            </Disclosure>
          </div>
        </section>

        {/* Previous Ventures Section */}
        <section className="mt-10">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-ventures">
            PREVIOUS VENTURES
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-200">
            <li data-testid="text-venture-advisory">
              (25–){' '}
              <a className="underline hover:text-white transition-colors duration-200" href="#" target="_blank" rel="noopener noreferrer">
                Lumley Advisory
              </a>{' '}
              — solo consulting (product strategy, platform org design).
            </li>
            <li data-testid="text-venture-family">
              (24–25) Family Ops Kit — baby logistics, daycare readiness, and travel systems.
            </li>
            <li data-testid="text-venture-habit">
              (23–24) Habit Stack — micro-rituals app exploring adherence and delight.
            </li>
          </ul>
        </section>

        {/* Shipped Section */}
        <section className="mt-10">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-shipped">
            A FEW THINGS I'VE SHIPPED OR HELPED SHAPE
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-200">
            <li data-testid="text-shipped-platform">
              (25) Growth & Experience Platform patterns — decision rights, RICE portfolio flow, and headless agent deployment.
            </li>
            <li data-testid="text-shipped-travel">
              (24) Travel + parenting playbooks for Japan, Paris, and California with infant-first constraints.
            </li>
            <li data-testid="text-shipped-recovery">
              (24) Personal recovery protocol for Muay Thai & BJJ (sleep, nutrition, and mobility routines).
            </li>
          </ul>
        </section>

        {/* Directory Section */}
        <section id="directory" className="mt-10">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-directory">
            DIRECTORY
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-200">
            <li>
              <a className="underline hover:text-white transition-colors duration-200" href="#contact" data-testid="link-directory-contact">
                contact
              </a>
            </li>
            <li>
              <a className="underline hover:text-white transition-colors duration-200" href="#resources" data-testid="link-directory-resources">
                resources
              </a>
            </li>
            <li>
              <a className="underline hover:text-white transition-colors duration-200" href="#gallery" data-testid="link-directory-gallery">
                gallery
              </a>
            </li>
            <li>
              <a className="underline hover:text-white transition-colors duration-200" href="#radio" data-testid="link-directory-radio">
                radio
              </a>
            </li>
          </ul>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-16">
          <h2 className="text-sm font-bold tracking-wider text-zinc-400" data-testid="text-section-contact">
            CONTACT
          </h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <a
              className="group border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 transition-all duration-300 hover:border-zinc-700"
              href="mailto:adrian@adrianlumley.com"
              data-testid="link-email"
            >
              <div className="text-zinc-400 text-xs">EMAIL</div>
              <div className="font-semibold">adrian@adrianlumley.com</div>
              <div className="text-zinc-400 text-xs group-hover:underline">preferred for collabs and intros</div>
            </a>
            <a
              className="group border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 transition-all duration-300 hover:border-zinc-700"
              href="https://cal.com/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-calendar"
            >
              <div className="text-zinc-400 text-xs">CALENDAR</div>
              <div className="font-semibold">Book time</div>
              <div className="text-zinc-400 text-xs">brief intros only</div>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-6 border-t border-zinc-800 text-xs text-zinc-500">
          <div data-testid="text-copyright">
            © {currentYear} ADRIAN LUMLEY — BY ADRIAN®
          </div>
        </footer>
      </div>
    </main>
  );
}
