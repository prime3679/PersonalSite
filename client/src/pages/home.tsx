import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <main className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        
        {/* Main intro */}
        <section className="mb-12">
          <h1 className="text-2xl font-normal mb-6 leading-relaxed" data-testid="text-main-title">
            hey, i'm adrian.
          </h1>
          <p className="text-base leading-relaxed mb-4">
            i'm a senior director of product management at <a href="https://www.siriusxm.com" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-siriusxm">siriusxm</a>, 
            based in nyc.
          </p>
          <p className="text-base leading-relaxed">
            i've been building products for 5,475 days.
          </p>
        </section>

        {/* Achievements */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-achievements">
            a few achievements:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- leading product for 34+ million subscribers</li>
            <li>- architected ai-powered personalization systems</li>
            <li>- built platform apis serving billions of requests</li>
            <li>- shipped products used by millions daily</li>
            <li>- led cross-functional teams of 20+ engineers and designers</li>
          </ul>
        </section>

        {/* Current work */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-current-work">
            what i'm working on:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- <Link href="/projects" className="underline hover:no-underline" data-testid="link-platform-architecture">platform architecture</Link> - scalable apis and developer tools</li>
            <li>- <Link href="/projects" className="underline hover:no-underline" data-testid="link-ai-personalization">ai personalization</Link> - content discovery at scale</li>
            <li>- <Link href="/blog" className="underline hover:no-underline" data-testid="link-writing-product">writing about product</Link> - sharing insights and learnings</li>
          </ul>
          <p className="text-base leading-relaxed mt-4 text-gray-600">
            i focus on building platforms that make other teams move faster. 
            this approach creates leverage through thoughtful abstractions.
          </p>
        </section>

        {/* TL;DR */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-tldr">
            tl;dr:
          </h2>
          <p className="text-base leading-relaxed mb-4">
            i started building things as a kid and never stopped.
          </p>
          <p className="text-base leading-relaxed mb-4">
            i've worked across startups and scale-ups, from 0-to-1 products to platform engineering.
          </p>
          <p className="text-base leading-relaxed">
            i believe the best products come from deep customer empathy, technical feasibility, and clear business impact.
          </p>
        </section>

        {/* Expandable sections */}
        <div className="space-y-8 mb-12">
          <div>
            <button
              onClick={() => toggleSection('approach')}
              className="text-base font-normal uppercase tracking-wider bg-gray-100 px-4 py-2 hover:bg-gray-200 transition-colors w-full text-left"
              data-testid="button-toggle-approach"
            >
              {openSections.approach ? 'close' : 'open'}
            </button>
            <div className="text-center text-sm uppercase tracking-wider text-gray-500 mt-2">
              my approach
            </div>
            {openSections.approach && (
              <div className="mt-6 text-base leading-relaxed space-y-4" data-testid="section-approach">
                <p>
                  i believe in building products that solve real problems. this means starting with customer research, 
                  understanding pain points deeply, and validating assumptions early.
                </p>
                <p>
                  my technical background helps me work closely with engineering teams to find the right balance 
                  between what's possible and what's valuable.
                </p>
                <p>
                  i prefer small, autonomous teams that can move fast and iterate based on user feedback.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('philosophy')}
              className="text-base font-normal uppercase tracking-wider bg-gray-100 px-4 py-2 hover:bg-gray-200 transition-colors w-full text-left"
              data-testid="button-toggle-philosophy"
            >
              {openSections.philosophy ? 'close' : 'open'}
            </button>
            <div className="text-center text-sm uppercase tracking-wider text-gray-500 mt-2">
              product philosophy
            </div>
            {openSections.philosophy && (
              <div className="mt-6 text-base leading-relaxed space-y-4" data-testid="section-philosophy">
                <p>
                  platforms over features. developer experience over short-term wins. 
                  systems thinking over isolated solutions.
                </p>
                <p>
                  in the ai era, i focus on augmenting human creativity rather than replacing it. 
                  the best ai products feel magical but work reliably.
                </p>
                <p>
                  measurement matters, but not everything that matters can be measured.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('background')}
              className="text-base font-normal uppercase tracking-wider bg-gray-100 px-4 py-2 hover:bg-gray-200 transition-colors w-full text-left"
              data-testid="button-toggle-background"
            >
              {openSections.background ? 'close' : 'open'}
            </button>
            <div className="text-center text-sm uppercase tracking-wider text-gray-500 mt-2">
              background
            </div>
            {openSections.background && (
              <div className="mt-6 text-base leading-relaxed space-y-4" data-testid="section-background">
                <p>
                  before siriusxm, i worked at early-stage startups building b2b saas products. 
                  i've been on both sides of the 0-to-1 and 1-to-n equation.
                </p>
                <p>
                  i have a computer science background but found my passion in product management—
                  the intersection of technology, business, and user experience.
                </p>
                <p>
                  i spend my free time reading about emerging tech, experimenting with new tools, 
                  and occasionally building side projects.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('future')}
              className="text-base font-normal uppercase tracking-wider bg-gray-100 px-4 py-2 hover:bg-gray-200 transition-colors w-full text-left"
              data-testid="button-toggle-future"
            >
              {openSections.future ? 'close' : 'open'}
            </button>
            <div className="text-center text-sm uppercase tracking-wider text-gray-500 mt-2">
              where i see myself in 3,650 days
            </div>
            {openSections.future && (
              <div className="mt-6 text-base leading-relaxed space-y-4" data-testid="section-future">
                <p>
                  leading product for a company that's pushing the boundaries of what's possible with ai and content.
                </p>
                <p>
                  maybe building my own thing. maybe advising startups. definitely still learning and growing.
                </p>
                <p>
                  whatever comes next, i want to be working on products that genuinely improve people's lives.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-experience">
            recent experience:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- (24-) <span className="font-semibold">siriusxm</span> - senior director of product</li>
            <li>- (22-24) <span className="font-semibold">siriusxm</span> - director of product</li>
            <li>- (21-22) <span className="font-semibold">pandora</span> - senior product manager</li>
            <li>- (19-21) <span className="font-semibold">various startups</span> - product management roles</li>
          </ul>
        </section>

        {/* Projects */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-projects">
            some projects i've worked on:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- (24) <Link href="/projects" className="underline hover:no-underline" data-testid="link-unified-api">unified content api</Link> - platform serving 1b+ requests</li>
            <li>- (24) <Link href="/projects" className="underline hover:no-underline" data-testid="link-ai-engine">ai recommendation engine</Link> - personalized content discovery</li>
            <li>- (23) <Link href="/projects" className="underline hover:no-underline" data-testid="link-developer-portal">developer portal</Link> - self-service tools for internal teams</li>
            <li>- (23) <Link href="/blog" className="underline hover:no-underline" data-testid="link-product-blog">product blog</Link> - sharing insights and learnings</li>
            <li>- (22) <Link href="/projects" className="underline hover:no-underline" data-testid="link-mobile-platform">mobile platform</Link> - cross-platform sdk and tools</li>
          </ul>
        </section>

        {/* Directory */}
        <section>
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-directory">
            directory:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- <Link href="/contact" className="underline hover:no-underline" data-testid="link-contact">contact</Link></li>
            <li>- <Link href="/blog" className="underline hover:no-underline" data-testid="link-blog">writing</Link></li>
            <li>- <Link href="/projects" className="underline hover:no-underline" data-testid="link-projects">projects</Link></li>
            <li>- <a href="https://www.linkedin.com/in/adrianlumley" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">linkedin</a></li>
          </ul>
        </section>

      </div>
    </main>
  );
}