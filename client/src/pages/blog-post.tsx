import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { BlogPost } from "@shared/schema";
import SiteHeader from "@/components/site-header";
import { useTheme } from "@/components/theme-provider";
import "highlight.js/styles/github-dark.css";

export default function BlogPostPage() {
  const { theme } = useTheme();
  const { slug } = useParams();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: () => fetch(`/api/blog/${slug}`).then(res => {
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    }),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
          <h1 className="mb-8 text-4xl font-black tracking-tight">POST NOT FOUND</h1>
          <p className="mb-6 text-muted-foreground">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-foreground hover:underline" data-testid="link-back-to-blog">
            ← Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      data-theme={theme}
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
    >
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        {/* Back to blog link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
          data-testid="link-back-to-blog"
        >
          ← Back to Blog
        </Link>

        {/* Post header */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl" data-testid="text-post-title">
            {post.title}
          </h1>
          <div className="text-sm text-muted-foreground">
            <time dateTime={post.publishedAt?.toString() || post.createdAt.toString()} data-testid="text-post-date">
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose prose-zinc max-w-none
                     prose-headings:font-bold prose-headings:tracking-tight
                     prose-h1:mb-6 prose-h1:text-3xl
                     prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-2xl
                     prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-xl
                     prose-p:leading-relaxed prose-p:text-muted-foreground
                     prose-a:text-foreground prose-a:underline hover:prose-a:text-muted-foreground
                     prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground
                     prose-pre:border prose-pre:border-border prose-pre:bg-muted/70
                     prose-blockquote:border-l prose-blockquote:border-border prose-blockquote:text-muted-foreground
                     prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                     prose-li:text-muted-foreground
                     prose-strong:text-foreground prose-strong:font-semibold dark:prose-invert"
          data-testid="content-post-body"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Post footer */}
        <footer className="mt-12 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            data-testid="link-back-to-blog-footer"
          >
            ← Back to All Posts
          </Link>
        </footer>
      </article>
    </main>
  );
}