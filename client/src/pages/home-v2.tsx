/**
 * Home V2 - Reimagined Landing Experience
 *
 * Philosophy: Every pixel tells a story. Every transition feels inevitable.
 * This isn't a page—it's an experience.
 */

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import SiteHeader from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';

// Types
interface CaseStudy {
  id: string;
  company: string;
  headline: string;
  shortBlurb: string;
  order: number;
}

interface ProfileData {
  sections: {
    introduction: string;
    currentFocus: string[];
    beliefs: string[];
    currently: Record<string, string>;
    contact: string;
  };
}

interface Config {
  person: {
    name: string;
    email: string;
    location: string;
  };
  social: Record<string, string>;
}

export default function HomeV2() {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Load static content
  useEffect(() => {
    Promise.all([
      fetch('/content/profile.json').then(r => r.json()),
      fetch('/content/case-studies.json').then(r => r.json()),
      fetch('/content/config.json').then(r => r.json()),
    ]).then(([profileData, caseStudiesData, configData]) => {
      setProfile(profileData);
      setCaseStudies(caseStudiesData);
      setConfig(configData);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading experience...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-primary selection:text-primary-foreground"
    >
      <SiteHeader />

      {/* Hero Section - The Opening */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-light leading-tight tracking-tight"
          >
            hello, i'm adrian.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-lg md:text-xl leading-relaxed text-foreground/80"
          >
            <p>
              i build products at{' '}
              <a
                href="https://www.siriusxm.com"
                className="underline decoration-foreground/30 hover:decoration-foreground transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                siriusxm
              </a>{' '}
              for 34+ million people.
            </p>
            <p className="text-base md:text-lg">
              <span className="font-semibold text-foreground">18%</span> more daily sessions.{' '}
              <span className="font-semibold text-foreground">12%</span> less churn.{' '}
              <span className="font-semibold text-foreground">14</span> years in tech.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ScrollIndicator />
          </motion.div>
        </motion.div>

        {/* Ambient background effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Featured Work - The Evidence */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-widest text-foreground/60 mb-12"
          >
            Featured Work
          </motion.h2>

          <div className="space-y-6">
            {caseStudies.map((study, index) => (
              <motion.article
                key={study.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CaseStudyCard study={study} />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy - The Beliefs */}
      {profile?.sections.beliefs && (
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-widest text-foreground/60 mb-12"
            >
              Things I Believe
            </motion.h2>

            <div className="space-y-8">
              {profile.sections.beliefs.map((belief, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-lg md:text-xl leading-relaxed text-foreground/80"
                >
                  {belief}
                </motion.p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Currently - The Now */}
      {profile?.sections.currently && (
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-widest text-foreground/60 mb-12"
            >
              Currently
            </motion.h2>

            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(profile.sections.currently).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-xs uppercase tracking-wider text-foreground/50">
                    {key}
                  </div>
                  <div
                    className="text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact - The Invitation */}
      <section className="py-32 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-light"
          >
            let's build something together
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-foreground/70"
          >
            always interested in product challenges, creative projects, or just good conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <ContactButton href={`mailto:${config?.person.email}`}>
              Email Me
            </ContactButton>
            <ContactButton href={config?.social.linkedin} external>
              LinkedIn
            </ContactButton>
            <ContactButton href={config?.social.substack} external>
              Writing
            </ContactButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-foreground/50">
          <p>© {new Date().getFullYear()} {config?.person.name}. Built with care.</p>
        </div>
      </footer>
    </main>
  );
}

/**
 * Case Study Card Component
 */
function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/projects#${study.id}`}>
      <div className="group relative p-8 rounded-2xl border border-foreground/10 hover:border-foreground/30 transition-all duration-500 overflow-hidden cursor-pointer">
        {/* Hover effect background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-xs uppercase tracking-wider text-foreground/50">
              {study.company}
            </div>
            <div className="text-sm font-semibold text-foreground group-hover:translate-x-1 transition-transform duration-300">
              {study.headline}
            </div>
          </div>

          <p className="text-base leading-relaxed text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">
            {study.shortBlurb}
          </p>

          <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 group-hover:text-foreground group-hover:gap-3 transition-all duration-300">
            <span>Read case study</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Contact Button Component
 */
function ContactButton({
  href,
  children,
  external = false,
}: {
  href?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="px-6 py-3 rounded-full border border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 font-medium"
    >
      {children}
    </a>
  );
}

/**
 * Scroll Indicator Component
 */
function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center gap-2 text-foreground/40">
      <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-px h-12 bg-gradient-to-b from-foreground/40 to-transparent"
      />
    </div>
  );
}
