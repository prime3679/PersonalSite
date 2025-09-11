import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { BlogPost } from "@shared/schema";
import "highlight.js/styles/github-dark.css";

export default function BlogPostPage() {
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
      <main className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-28">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded mb-6"></div>
            <div className="h-4 bg-zinc-800 rounded mb-8 w-1/3"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-28">
          <h1 className="text-4xl font-black tracking-tight mb-8">POST NOT FOUND</h1>
          <p className="text-zinc-400 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-white hover:underline" data-testid="link-back-to-blog">
            ← Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/70 border-b border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between text-sm">
          <nav className="flex gap-5 font-medium">
            <Link href="/" className="hover:underline transition-all duration-200" data-testid="link-home">
              HOME
            </Link>
            <Link href="/blog" className="hover:underline transition-all duration-200 text-white" data-testid="link-blog">
              BLOG
            </Link>
            <Link href="/projects" className="hover:underline transition-all duration-200" data-testid="link-projects">
              PROJECTS
            </Link>
            <a href="/#contact" className="hover:underline transition-all duration-200" data-testid="link-contact">
              CONTACT
            </a>
          </nav>
          <div className="text-xs text-zinc-400" data-testid="text-location">NYC • US/UK</div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        {/* Back to blog link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 mb-8"
          data-testid="link-back-to-blog"
        >
          ← Back to Blog
        </Link>

        {/* Post header */}
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" data-testid="text-post-title">
            {post.title}
          </h1>
          <div className="text-zinc-400 text-sm">
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
          className="prose prose-invert prose-zinc max-w-none 
                     prose-headings:font-bold prose-headings:tracking-tight
                     prose-h1:text-3xl prose-h1:mb-6
                     prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
                     prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                     prose-p:leading-relaxed prose-p:text-zinc-300
                     prose-a:text-white prose-a:underline hover:prose-a:text-zinc-300
                     prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-zinc-200
                     prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
                     prose-blockquote:border-l-zinc-600 prose-blockquote:text-zinc-300
                     prose-ul:text-zinc-300 prose-ol:text-zinc-300
                     prose-li:text-zinc-300
                     prose-strong:text-white prose-strong:font-semibold"
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
        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200"
            data-testid="link-back-to-blog-footer"
          >
            ← Back to All Posts
          </Link>
        </footer>
      </article>
    </main>
  );
}