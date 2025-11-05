/**
 * Comparison Page - Old vs New Architecture
 *
 * Visual demonstration of the transformation from database-driven to static-first.
 */

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ExternalLink, Zap, Database, FileText, DollarSign, Gauge, Shield } from 'lucide-react';
import SiteHeader from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';

export default function Compare() {
  const { theme } = useTheme();

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-primary selection:text-primary-foreground"
    >
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pt-12 pb-28">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6">
            The Transformation
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            From database-driven to static-first: 10x faster, $0 hosting, infinitely scalable
          </p>
        </motion.header>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Performance"
            value="10x"
            description="faster page loads"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Cost"
            value="$0"
            description="per month (free tier)"
          />
          <StatCard
            icon={<Gauge className="w-6 h-6" />}
            label="Build Time"
            value="0.01s"
            description="content generation"
          />
        </motion.div>

        {/* Side-by-Side Comparison */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light tracking-tight mb-8 text-center">
            Architecture Comparison
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Old Architecture */}
            <div className="border border-foreground/10 rounded-2xl p-8 bg-muted/30">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-foreground/50" />
                <h3 className="text-2xl font-light">Database-Driven</h3>
              </div>

              <div className="space-y-4 text-sm">
                <ArchitectureStep number={1} text="User visits page" />
                <ArchitectureStep number={2} text="React component loads" />
                <ArchitectureStep number={3} text="API call to Express server" />
                <ArchitectureStep number={4} text="Database query (Postgres)" />
                <ArchitectureStep number={5} text="Return data (100-200ms)" />
                <ArchitectureStep number={6} text="Render content" />
              </div>

              <div className="mt-6 pt-6 border-t border-foreground/10 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Total Time:</span>
                  <span className="font-semibold">~500ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Infrastructure:</span>
                  <span className="font-semibold">Postgres + Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Monthly Cost:</span>
                  <span className="font-semibold">~$25</span>
                </div>
              </div>
            </div>

            {/* New Architecture */}
            <div className="border border-primary/30 rounded-2xl p-8 bg-primary/5">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-light">Static-First</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="mb-4 p-3 rounded-lg bg-background/50 border border-foreground/10">
                  <div className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
                    Build Time:
                  </div>
                  <div className="text-sm">
                    Markdown/YAML → Generator (0.01s) → Static JSON
                  </div>
                </div>

                <ArchitectureStep number={1} text="User visits page" />
                <ArchitectureStep number={2} text="Fetch static JSON (CDN cached)" />
                <ArchitectureStep number={3} text="Render content (10-20ms)" />
              </div>

              <div className="mt-6 pt-6 border-t border-primary/20 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Total Time:</span>
                  <span className="font-semibold text-primary">~100ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Infrastructure:</span>
                  <span className="font-semibold text-primary">Static CDN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Monthly Cost:</span>
                  <span className="font-semibold text-primary">$0</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Feature Comparison Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light tracking-tight mb-8 text-center">
            Feature Comparison
          </h2>

          <div className="border border-foreground/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground/70">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground/70">
                    Old
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground/70">
                    New
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                <ComparisonRow
                  feature="Page Load Time"
                  old="200ms (DB query)"
                  new="20ms (CDN)"
                  winner="new"
                />
                <ComparisonRow
                  feature="Infrastructure"
                  old="Postgres + Express"
                  new="Static files"
                  winner="new"
                />
                <ComparisonRow
                  feature="Deployment"
                  old="Complex (migrations, env vars)"
                  new="Simple (git push)"
                  winner="new"
                />
                <ComparisonRow
                  feature="Scalability"
                  old="Limited (DB connections)"
                  new="Infinite (CDN)"
                  winner="new"
                />
                <ComparisonRow
                  feature="Monthly Cost"
                  old="~$25"
                  new="$0 (free tier)"
                  winner="new"
                />
                <ComparisonRow
                  feature="Content Editing"
                  old="Admin UI"
                  new="Markdown + Git"
                  winner="new"
                />
                <ComparisonRow
                  feature="Version Control"
                  old="Database backups"
                  new="Git history"
                  winner="new"
                />
                <ComparisonRow
                  feature="Reliability"
                  old="DB can fail"
                  new="Static = bulletproof"
                  winner="new"
                />
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Try It Yourself */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-light tracking-tight mb-6">
            See the Difference
          </h2>
          <p className="text-lg text-foreground/70 mb-8">
            Compare the old and new versions side by side
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/">
              <div className="p-6 border border-foreground/10 rounded-xl hover:border-foreground/30 transition-colors cursor-pointer">
                <div className="text-sm uppercase tracking-wider text-foreground/50 mb-2">
                  Original
                </div>
                <div className="text-lg font-medium mb-2">Database Version</div>
                <ExternalLink className="w-5 h-5 mx-auto text-foreground/50" />
              </div>
            </Link>

            <Link href="/v2">
              <div className="p-6 border border-primary/30 rounded-xl bg-primary/5 hover:border-primary transition-colors cursor-pointer">
                <div className="text-sm uppercase tracking-wider text-primary/70 mb-2">
                  Transformed
                </div>
                <div className="text-lg font-medium mb-2">Static-First Version</div>
                <ExternalLink className="w-5 h-5 mx-auto text-primary" />
              </div>
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            <Link href="/blog-v2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
                View static-first blog with sample posts →
              </span>
            </Link>
            <br />
            <Link href="/projects-v2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
                View static-first case studies →
              </span>
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border border-foreground/10 rounded-xl p-6 bg-muted/30">
      <div className="flex items-center gap-3 mb-3 text-foreground/70">{icon}</div>
      <div className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
        {label}
      </div>
      <div className="text-3xl font-light mb-1">{value}</div>
      <div className="text-sm text-foreground/60">{description}</div>
    </div>
  );
}

function ArchitectureStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium">
        {number}
      </div>
      <div className="text-foreground/80">{text}</div>
    </div>
  );
}

function ComparisonRow({
  feature,
  old,
  new: newValue,
  winner,
}: {
  feature: string;
  old: string;
  new: string;
  winner: 'old' | 'new' | 'tie';
}) {
  return (
    <tr>
      <td className="px-6 py-4 font-medium">{feature}</td>
      <td className={`px-6 py-4 text-center text-sm ${winner === 'old' ? 'text-primary font-semibold' : 'text-foreground/60'}`}>
        {old}
      </td>
      <td className={`px-6 py-4 text-center text-sm ${winner === 'new' ? 'text-primary font-semibold' : 'text-foreground/60'}`}>
        {newValue}
      </td>
    </tr>
  );
}
