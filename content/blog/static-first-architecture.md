---
title: "Why I Chose a Static-First Architecture"
slug: "static-first-architecture"
excerpt: "Moving from database-driven to static-first: 10x faster, infinitely scalable, and $0 hosting costs."
publishedAt: "2025-11-05"
tags: ["architecture", "performance", "web development"]
---

# Why I Chose a Static-First Architecture

When rebuilding my personal site, I made a controversial choice: **ditch the database entirely**.

## The Problem

My original architecture looked like this:

```
User → Express API → Postgres → Return Data → Render
```

Every page load triggered a database query. For a personal site with mostly static content, this was overkill.

**The costs:**
- $25/month for database hosting
- 100-200ms query latency on every page load
- Complex deployment (database migrations, connection strings, etc.)
- Potential security vulnerabilities (SQL injection, auth bypasses)

## The Solution

I moved to a **static-first architecture**:

```
Build Time: Content Files → Generator → JSON
Runtime: User → CDN → Pre-generated JSON → Render
```

**The benefits:**
- $0/month hosting (Cloudflare Pages is free)
- 10-20ms load time (CDN cached)
- Dead simple deployment (just push to Git)
- Zero security surface area (no database to hack)

## How It Works

### 1. Content Lives in Markdown/YAML

Instead of storing blog posts in a database, I write them in markdown:

```markdown
---
title: "My Blog Post"
publishedAt: "2025-11-05"
---

# My Post Content

This is so much nicer than a textarea in an admin UI.
```

### 2. Build Script Transforms Content

At build time, a simple script reads all markdown files and generates optimized JSON:

```typescript
// scripts/generate-content.ts
const posts = await loadAllMarkdownFiles('content/blog/');
const json = posts.map(transformToJSON);
await fs.writeFile('public/content/blog-posts.json', JSON.stringify(json));
```

This runs in **0.01 seconds** for my entire site.

### 3. Frontend Fetches Static JSON

Instead of API calls, components load pre-generated data:

```typescript
const response = await fetch('/content/blog-posts.json');
const posts = await response.json();
```

The JSON is cached by the CDN, so it loads **instantly**.

## The Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Load Time | 200ms | 20ms | **10x faster** |
| Hosting Cost | $25/mo | $0/mo | **100% savings** |
| Deployment | Complex | `git push` | **Effortless** |

## When NOT to Use Static-First

This approach isn't right for everyone. **Don't use it if:**

- You need real-time data (stock prices, live sports scores)
- You have user-generated content (comments, forums)
- Your content changes multiple times per hour
- You need complex queries (search, filtering, aggregations)

**Do use it if:**
- Your content is mostly static (personal sites, blogs, documentation)
- You value performance and simplicity
- You want content in version control
- You're comfortable with build-time generation

## The Future

Static-first doesn't mean static-only. You can still add dynamic features:

- **Comments:** Use a service like Giscus (GitHub Discussions)
- **Analytics:** Client-side tracking with Plausible or Fathom
- **Contact Forms:** Serverless functions (Cloudflare Workers)
- **Search:** Client-side search with Fuse.js or Algolia

You get the best of both worlds: static content performance with dynamic feature flexibility.

## Conclusion

Moving to static-first was one of the best architectural decisions I've made. My site is faster, cheaper, more reliable, and easier to maintain.

If your content is mostly static, **question whether you really need that database**.

---

*This post was written in Vim, committed to Git, and published in 30 seconds. No admin UI required.*
