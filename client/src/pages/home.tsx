import { Link } from "wouter";
import SiteHeader from "@/components/site-header";
import { useTheme } from "@/components/theme-provider";

export default function Home() {
  const { theme } = useTheme();

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
    >
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* Intro */}
        <section className="mb-16 fade-in">
          <h1 className="text-2xl font-normal mb-6 leading-relaxed" data-testid="text-main-title">
            hello, i'm adrian.
          </h1>
          <p className="text-base leading-relaxed mb-4">
            i build products at <a href="https://www.siriusxm.com" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-siriusxm">siriusxm</a> for 34+ million people, where a cross-platform listening revamp added <span className="font-semibold">18%</span> more daily sessions and reduced voluntary churn by <span className="font-semibold">12%</span>.
          </p>
          <p className="text-base leading-relaxed mb-4">
            at disney+, i helped stand up international launch tooling that enabled day-one availability in <span className="font-semibold">60+</span> markets and cut localization cycle time by <span className="font-semibold">35%</span>.
          </p>
          <p className="text-base leading-relaxed">
            earlier, i shipped live-service systems at ea that lifted event ARPDAU <span className="font-semibold">14%</span> and led automation at hyperscience that trimmed document processing costs <span className="font-semibold">30%</span>. 14 years in tech, based in nyc.
          </p>
        </section>

        <FeaturedWork />

        {/* Current Focus */}
        <section className="mb-16 fade-in">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-focus">
            current focus:
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>learning how to be a good parent — the hardest and most rewarding experience.</p>
            <p>building scalable content platforms and ai personalization systems.</p>
            <p>writing a scifi novel exploring what happens when AI develops consciousness (because product docs aren't creative enough).</p>
          </div>
        </section>

        {/* Things I Believe */}
        <section className="mb-16 fade-in">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-beliefs">
            things i believe:
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>ai should augment human creativity, not replace it. the best ai feels magical but works reliably.</p>
            <p>small autonomous teams {'>'} big hierarchical ones. user feedback {'>'} internal opinions.</p>
            <p>measurement matters, but not everything that matters can be measured.</p>
            <p>in 3,650 days: maybe leading product at a company pushing ai/content boundaries. maybe building my own thing. definitely still learning.</p>
          </div>
        </section>

        {/* Currently */}
        <section className="mb-16 fade-in">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-currently">
            currently:
          </h2>
          <div className="space-y-3 text-base leading-relaxed">
            <p><span className="font-semibold">building with:</span> react, typescript, tailwind, figma, notion</p>
            <p><span className="font-semibold">thinking with:</span> claude, chatgpt, oboe</p>
            <p><span className="font-semibold">learning from:</span> twitter, hacker news, product hunt, youtube</p>
            <p><span className="font-semibold">reading:</span> brian sanderson, viet thanh nguyen, shane parrish, patty wipfler, anything about consciousness — <a href="https://www.goodreads.com/user/show/149439647-adrian-lumley" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-goodreads">see my goodreads</a></p>
            <p><span className="font-semibold">exploring:</span> cursor, v0, replit, n8n, jiu jitsu, muay thai</p>
          </div>
        </section>

        {/* Connect */}
        <section className="fade-in" id="contact">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-connect">
            let's talk:
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>always interested in product challenges, creative projects, or just good conversation.</p>
            <p>open to advisory roles and the right side-hustle.</p>
            <div className="space-y-2 mt-6">
              <p>- <a href="mailto:alumley007@gmail.com" className="underline hover:no-underline" data-testid="link-email">email me</a></p>
              <p>- <a href="https://minoritymusings.substack.com/?r=4evku&utm_campaign=pub-share-checklist" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-blog">read my writing</a></p>
              <p>- <a href="https://www.linkedin.com/in/adrianlumley/" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">find me on linkedin</a></p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

type FeaturedWin = {
  id: string;
  company: string;
  headline: string;
  blurb: string;
  cta: string;
};

const featuredWins: FeaturedWin[] = [
  {
    id: "siriusxm",
    company: "SiriusXM",
    headline: "18% lift in daily sessions",
    blurb: "Led the multi-platform playback overhaul, aligning design, data science, and engineering to unlock stickier listening habits for 34M subscribers.",
    cta: "/projects#siriusxm",
  },
  {
    id: "disney-plus",
    company: "Disney+",
    headline: "60+ market launch toolkit",
    blurb: "Built localization ops dashboards and release workflows that cut subtitle/asset turnaround 35% while keeping day-one parity worldwide.",
    cta: "/projects#disney-plus",
  },
  {
    id: "ea-hyperscience",
    company: "EA & Hyperscience",
    headline: "Revenue and cost efficiency gains",
    blurb: "Shipped live-service monetization experiments at EA (+14% ARPDAU) and automated document classification at Hyperscience (-30% processing cost).",
    cta: "/projects#ea-hyperscience",
  },
];

function FeaturedWork() {
  return (
    <section className="mb-16 fade-in" aria-labelledby="featured-work-heading">
      <h2 id="featured-work-heading" className="text-lg font-normal mb-6 uppercase tracking-wider">
        featured work:
      </h2>
      <div className="grid gap-6">
        {featuredWins.map((win) => (
          <article key={win.id} className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/40 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2 text-sm uppercase tracking-wide text-foreground/70">
              <span>{win.company}</span>
              <span className="font-semibold">{win.headline}</span>
            </div>
            <p className="text-base leading-relaxed mb-4 text-foreground/90">
              {win.blurb}
            </p>
            <Link
              href={win.cta}
              className="inline-flex items-center text-sm font-medium underline hover:no-underline"
              aria-label={`Read more about ${win.company} work`}
            >
              dive into the case study ↗
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
