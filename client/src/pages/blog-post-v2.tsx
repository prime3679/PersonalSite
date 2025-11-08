/**
 * Blog Post Detail V2 - Static-First Individual Post
 *
 * Loads blog post content from pre-generated static JSON.
 * Renders markdown with syntax highlighting.
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import SiteHeader from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';
import { useStaticContent } from '@/lib/useStaticContent';
import 'highlight.js/styles/github-dark.css';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags?: string[];
}

export default function BlogPostV2() {
  const { theme } = useTheme();
  const { slug } = useParams<{ slug: string }>();
  const { data: posts, isLoading, error } = useStaticContent<BlogPost[]>('blog-posts.json');
  const [post, setPost] = useState<BlogPost | null>(null);

  // Find the specific post
  useEffect(() => {
    if (posts) {
      const found = posts.find(p => p.slug === slug);
      setPost(found || null);
    }
  }, [posts, slug]);

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
            <div className="h-12 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-6 w-1/3 rounded bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (error || !post) {
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
            className="space-y-4 sm:space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl font-light">Post Not Found</h1>
            <p className="text-base sm:text-lg text-foreground/70">
              The post you're looking for doesn't exist or hasn't been published yet.
            </p>
            <Link href="/blog-v2">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors touch-manipulation">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to blog
              </span>
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-primary selection:text-primary-foreground"
    >
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/blog-v2">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors touch-manipulation">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to blog
            </span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 sm:mb-10 md:mb-12 space-y-4 sm:space-y-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-foreground/60">
            <time dateTime={post.publishedAt}>{formattedDate}</time>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
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

          <p className="text-base sm:text-lg text-foreground/70 leading-relaxed border-l-2 border-foreground/20 pl-3 sm:pl-4">
            {post.excerpt}
          </p>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none
                     prose-headings:font-light prose-headings:tracking-tight
                     prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                     prose-p:leading-relaxed prose-p:text-foreground/90
                     prose-a:text-foreground prose-a:underline prose-a:decoration-foreground/30
                     hover:prose-a:decoration-foreground
                     prose-strong:text-foreground prose-strong:font-semibold
                     prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                     prose-code:before:content-none prose-code:after:content-none
                     prose-pre:bg-muted prose-pre:border prose-pre:border-foreground/10
                     prose-blockquote:border-l-2 prose-blockquote:border-foreground/20 prose-blockquote:pl-4 prose-blockquote:italic
                     prose-table:border-collapse prose-th:border prose-th:border-foreground/20 prose-th:p-2
                     prose-td:border prose-td:border-foreground/20 prose-td:p-2"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-foreground/10"
        >
          <Link href="/blog-v2">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors touch-manipulation">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all posts
            </span>
          </Link>
        </motion.footer>
      </article>
    </main>
  );
}
