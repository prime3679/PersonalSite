import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", { published: true }],
    queryFn: () => fetch("/api/blog?published=true").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-28">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded mb-4"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 border border-zinc-800 rounded-xl">
                  <div className="h-6 bg-zinc-800 rounded mb-2"></div>
                  <div className="h-4 bg-zinc-800 rounded mb-4"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-28">
          <h1 className="text-4xl font-black tracking-tight mb-8">BLOG</h1>
          <p className="text-zinc-400">Failed to load blog posts. Please try again later.</p>
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
            <a href="#contact" className="hover:underline transition-all duration-200" data-testid="link-contact">
              CONTACT
            </a>
          </nav>
          <div className="text-xs text-zinc-400" data-testid="text-location">NYC • US/UK</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-8" data-testid="text-blog-title">
          BLOG
        </h1>
        
        {posts && posts.length === 0 ? (
          <p className="text-zinc-400" data-testid="text-no-posts">
            No blog posts published yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <article 
                key={post.id} 
                className="group border border-zinc-800 rounded-xl p-6 hover:bg-zinc-950 transition-all duration-300 hover:border-zinc-700"
                data-testid={`card-blog-post-${post.slug}`}
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors duration-200" data-testid={`text-post-title-${post.slug}`}>
                    {post.title}
                  </h2>
                  <p className="text-zinc-300 mb-4 leading-relaxed" data-testid={`text-post-excerpt-${post.slug}`}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <time dateTime={post.publishedAt?.toString() || post.createdAt.toString()} data-testid={`text-post-date-${post.slug}`}>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    <span className="group-hover:underline" data-testid={`link-read-more-${post.slug}`}>
                      Read more →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}