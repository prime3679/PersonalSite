/**
 * Projects V2 - Static-First Case Studies
 *
 * Loads case studies from pre-generated static JSON.
 * Displays detailed project information with smooth animations.
 */

import { motion } from 'framer-motion';
import SiteHeader from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';
import { useStaticContent } from '@/lib/useStaticContent';

interface CaseStudy {
  id: string;
  company: string;
  title: string;
  headline: string;
  shortBlurb: string;
  fullHeadline: string;
  summary: string;
  outcomes: string[];
  responsibilities: string[];
  featured: boolean;
  order: number;
}

export default function ProjectsV2() {
  const { theme } = useTheme();
  const { data: caseStudies, isLoading, error } = useStaticContent<CaseStudy[]>('case-studies.json');

  if (isLoading) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground"
      >
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="h-12 w-48 rounded bg-muted animate-pulse" />
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border p-8">
                  <div className="mb-4 h-8 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="mb-6 h-6 w-full rounded bg-muted animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground"
      >
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-light tracking-tight">Work</h1>
            <p className="text-lg text-destructive">
              Failed to load projects: {error.message}
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-primary selection:text-primary-foreground"
    >
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 pt-12 pb-28">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
            Work
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Case studies from building products at scale for millions of users.
          </p>
        </motion.header>

        {/* Case Studies */}
        <div className="space-y-16">
          {caseStudies?.map((study, index) => (
            <motion.article
              key={study.id}
              id={study.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <CaseStudyDetail study={study} />
            </motion.article>
          ))}
        </div>

        {/* Footer */}
        {caseStudies && caseStudies.length > 0 && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-24 pt-8 border-t border-foreground/10"
          >
            <p className="text-sm text-foreground/50 text-center">
              {caseStudies.length} case {caseStudies.length === 1 ? 'study' : 'studies'} • All data loaded from static JSON • No database queries
            </p>
          </motion.footer>
        )}
      </div>
    </main>
  );
}

/**
 * Detailed Case Study Component
 */
function CaseStudyDetail({ study }: { study: CaseStudy }) {
  return (
    <div className="relative">
      {/* Company & Headline */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">
            {study.title}
          </h2>
          {study.featured && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 whitespace-nowrap">
              Featured
            </span>
          )}
        </div>
        <p className="text-xl md:text-2xl font-semibold text-foreground/80">
          {study.fullHeadline}
        </p>
      </div>

      {/* Summary */}
      <p className="text-lg leading-relaxed text-foreground/70 mb-8 border-l-2 border-foreground/20 pl-4">
        {study.summary}
      </p>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Outcomes */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-foreground/60 font-medium">
            Key Outcomes
          </h3>
          <ul className="space-y-3">
            {study.outcomes.map((outcome, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-3 text-base leading-relaxed"
              >
                <span className="text-primary mt-1.5">•</span>
                <span className="text-foreground/80">{outcome}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Responsibilities */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-foreground/60 font-medium">
            Key Responsibilities
          </h3>
          <ul className="space-y-3">
            {study.responsibilities.map((responsibility, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-3 text-base leading-relaxed"
              >
                <span className="text-primary mt-1.5">•</span>
                <span className="text-foreground/80">{responsibility}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider for all except last */}
      <div className="mt-16 border-b border-foreground/10" />
    </div>
  );
}
