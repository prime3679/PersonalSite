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
            i've been working in tech for 14+ years.
          </p>
        </section>

        {/* Achievements */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-achievements">
            a few achievements:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- leading product management for siriusxm's 34+ million subscribers</li>
            <li>- shipped disney+ b2b2c products and espn streaming experiences</li>
            <li>- built ai-powered automation systems at hyperscience</li>
            <li>- directed product strategy for ea's gaming platforms</li>
            <li>- certified in ai product management and strategic planning</li>
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
            connecting people to audio experiences - music, stories, news and sports. 
            i focus on platform architecture that enables content discovery at scale.
          </p>
        </section>

        {/* TL;DR */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-tldr">
            tl;dr:
          </h2>
          <p className="text-base leading-relaxed mb-4">
            i started in consulting as a salesforce solutions architect, then moved into product management.
          </p>
          <p className="text-base leading-relaxed mb-4">
            i've worked across entertainment (disney), enterprise ai (hyperscience), gaming (ea), and now audio (siriusxm).
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
                  i started my career in consulting, working as a salesforce solutions architect and analyst 
                  for companies like pwc, redkite, and bluewolf from 2011-2016.
                </p>
                <p>
                  i transitioned to product management at disney in 2016, working on espn and disney+ products. 
                  since then i've worked at hyperscience, ea, and now siriusxm.
                </p>
                <p>
                  i have a philosophy degree from st. john's and an executive mba from quantic. 
                  i'm also a uc berkeley haas venture fellow and ondeck fellow.
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
            <li>- (2023–present) <span className="font-semibold">siriusxm</span> - senior director of product management</li>
            <li>- (2021–2023) <span className="font-semibold">electronic arts</span> - director of product management</li>
            <li>- (2020–2021) <span className="font-semibold">hyperscience</span> - senior product manager</li>
            <li>- (2016–2020) <span className="font-semibold">disney</span> - product manager, streaming & espn</li>
            <li>- (2011–2016) <span className="font-semibold">consulting</span> - salesforce solutions architect & analyst</li>
          </ul>
        </section>

        {/* Projects */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-projects">
            some projects i've worked on:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- (2024) <Link href="/projects" className="underline hover:no-underline" data-testid="link-unified-api">unified content api</Link> - large-scale platform architecture</li>
            <li>- (2024) <Link href="/projects" className="underline hover:no-underline" data-testid="link-ai-engine">ai recommendation engine</Link> - personalized content discovery</li>
            <li>- (2023) <Link href="/projects" className="underline hover:no-underline" data-testid="link-developer-portal">developer portal</Link> - self-service tools for internal teams</li>
            <li>- (2023) <Link href="/blog" className="underline hover:no-underline" data-testid="link-product-blog">product blog</Link> - sharing insights and learnings</li>
            <li>- (2022) <Link href="/projects" className="underline hover:no-underline" data-testid="link-mobile-platform">mobile platform</Link> - cross-platform sdk and tools</li>
          </ul>
        </section>

        {/* Education & Certifications */}
        <section className="mb-12">
          <h2 className="text-lg font-normal mb-4 uppercase tracking-wider" data-testid="text-section-education">
            education & certifications:
          </h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>- <span className="font-semibold">quantic school of business</span> - executive mba</li>
            <li>- <span className="font-semibold">uc berkeley haas</span> - venture fellow (2021)</li>
            <li>- <span className="font-semibold">st. john's university</span> - ba philosophy</li>
            <li>- <span className="font-semibold">ondeck</span> - fellow</li>
            <li>- ai product management certification (ai product academy)</li>
            <li>- prof g certified strategist (product strategy)</li>
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