/**
 * Blog V2 - Static-First Blog Listing
 *
 * Loads pre-generated blog posts from static JSON instead of API calls.
 * 10x faster, no database overhead, instant page loads.
 */

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import SiteHeader from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';
import { useStaticContent } from '@/lib/useStaticContent';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags?: string[];
}

export default function BlogV2() {
  const { theme } = useTheme();
  const { data: posts, isLoading, error } = useStaticContent<BlogPost[]>('blog-posts.json');

  if (isLoading) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="h-12 w-32 rounded bg-muted animate-pulse" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl sm:rounded-2xl border border-border p-5 sm:p-6 md:p-8">
                  <div className="mb-3 h-7 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="mb-4 h-5 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Blog</h1>
            <p className="text-base sm:text-lg text-destructive">
              Failed to load blog posts: {error.message}
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

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-3 sm:mb-4">
            Writing
          </h1>
          <p className="text-base sm:text-lg text-foreground/70">
            Thoughts on product, engineering, and building things that matter.
          </p>
        </motion.header>

        {/* Posts */}
        {posts && posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 sm:py-16"
          >
            <p className="text-base sm:text-lg text-foreground/60">
              No posts yet. Check back soon!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {posts?.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <BlogPostCard post={post} />
              </motion.article>
            ))}
          </div>
        )}

        {/* Footer note */}
        {posts && posts.length > 0 && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-foreground/10"
          >
            <p className="text-sm text-foreground/50 text-center">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} • All content loaded from static JSON • No database queries
            </p>
          </motion.footer>
        )}
      </div>
    </main>
  );
}

/**
 * Blog Post Card Component
 */
function BlogPostCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog-v2/${post.slug}`}>
      <div className="group relative rounded-xl sm:rounded-2xl border border-foreground/10 p-5 sm:p-6 md:p-8 hover:border-foreground/30 active:border-foreground/40 transition-all duration-500 overflow-hidden cursor-pointer touch-manipulation">
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500" />

        <div className="relative space-y-3 sm:space-y-4">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-foreground group-hover:text-foreground transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-foreground/70 group-hover:text-foreground/90 transition-colors">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4">
            <time
              dateTime={post.publishedAt}
              className="text-sm text-foreground/50"
            >
              {formattedDate}
            </time>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Read more indicator */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60 group-hover:text-foreground group-hover:gap-3 transition-all duration-300">
            <span>Read article</span>
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
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
