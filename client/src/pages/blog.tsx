import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import SiteHeader from "@/components/site-header";
import { useTheme } from "@/components/theme-provider";

export default function Blog() {
  const { theme } = useTheme();
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", { published: true }],
    queryFn: () => fetch("/api/blog?published=true").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-6">
                  <div className="mb-2 h-6 w-3/4 rounded bg-muted" />
                  <div className="mb-4 h-4 w-full rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
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
      <main
        data-theme={theme}
        className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300"
      >
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
          <h1 className="mb-8 text-4xl font-black tracking-tight">BLOG</h1>
          <p className="text-muted-foreground">Failed to load blog posts. Please try again later.</p>
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

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-28">
        <h1 className="mb-8 text-4xl font-black tracking-tight sm:text-5xl" data-testid="text-blog-title">
          BLOG
        </h1>

        {posts && posts.length === 0 ? (
          <p className="text-muted-foreground" data-testid="text-no-posts">
            No blog posts published yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <article
                key={post.id}
                className="group rounded-xl border border-border p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-muted/60"
                data-testid={`card-blog-post-${post.slug}`}
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <h2
                    className="mb-2 text-xl font-bold transition-colors duration-200 group-hover:text-foreground"
                    data-testid={`text-post-title-${post.slug}`}
                  >
                    {post.title}
                  </h2>
                  <p className="mb-4 leading-relaxed text-muted-foreground" data-testid={`text-post-excerpt-${post.slug}`}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
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