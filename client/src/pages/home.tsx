import { Link } from "wouter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        
        {/* Intro */}
        <section className="mb-16">
          <h1 className="text-2xl font-normal mb-6 leading-relaxed" data-testid="text-main-title">
            hello, i'm adrian.
          </h1>
          <p className="text-base leading-relaxed mb-4">
            i build products at <a href="https://www.siriusxm.com" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-siriusxm">siriusxm</a> for 34+ million people.
          </p>
          <p className="text-base leading-relaxed">
            previously: disney+ (streaming), ea (gaming), hyperscience (ai). 14 years in tech, based in nyc.
          </p>
        </section>

        {/* Current Focus */}
        <section className="mb-16">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-focus">
            current focus:
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>learning how to be a good parent — the hardest and most important product challenge.</p>
            <p>building scalable content platforms and ai personalization systems.</p>
            <p>writing a scifi novel about consciousness and reality (because product docs aren't creative enough).</p>
            <p>shipped disney+ b2b products, ai automation at scale.</p>
          </div>
        </section>

        {/* Things I Believe */}
        <section className="mb-16">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-beliefs">
            things i believe:
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>ai should augment human creativity, not replace it. the best ai feels magical but works reliably.</p>
            <p>small autonomous teams {'>'} big hierarchical ones. user feedback {'>'} internal opinions.</p>
            <p>measurement matters, but not everything that matters can be measured.</p>
            <p>platforms beat features. developer experience beats quick wins. systems thinking beats isolated solutions.</p>
            <p>in 3,650 days: maybe leading product at a company pushing ai/content boundaries. maybe building my own thing. definitely still learning.</p>
          </div>
        </section>

        {/* Currently */}
        <section className="mb-16">
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-currently">
            currently:
          </h2>
          <div className="space-y-3 text-base leading-relaxed">
            <p><span className="font-semibold">building with:</span> react, typescript, tailwind, figma, notion</p>
            <p><span className="font-semibold">thinking with:</span> claude, chatgpt, oboe</p>
            <p><span className="font-semibold">learning from:</span> twitter, hacker news, product hunt, youtube</p>
            <p><span className="font-semibold">reading:</span> ted chiang, ursula k. le guin, anything about consciousness</p>
            <p><span className="font-semibold">exploring:</span> cursor, v0, ai coding assistants (the future is weird)</p>
          </div>
        </section>

        {/* Connect */}
        <section>
          <h2 className="text-lg font-normal mb-6 uppercase tracking-wider" data-testid="text-section-connect">
            let's talk:
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>always interested in product challenges, creative projects, or just good conversation.</p>
            <p>open to advisory roles and the right full-time opportunity.</p>
            <div className="space-y-2 mt-6">
              <p>- <a href="mailto:alumley007@gmail.com" className="underline hover:no-underline" data-testid="link-email">email me</a></p>
              <p>- <Link href="/blog" className="underline hover:no-underline" data-testid="link-blog">read my writing</Link></p>
              <p>- <a href="https://www.linkedin.com/in/adrianlumley/" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">find me on linkedin</a></p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}