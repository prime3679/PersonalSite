# Deployment Guide: Static-First Architecture

This guide covers deploying the transformed site to production with zero infrastructure overhead.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: Cloudflare Pages (Recommended)](#option-1-cloudflare-pages)
3. [Option 2: Vercel](#option-2-vercel)
4. [Option 3: Netlify](#option-3-netlify)
5. [Contact Form Setup](#contact-form-setup)
6. [Custom Domain](#custom-domain)
7. [CI/CD Workflow](#cicd-workflow)
8. [Performance Optimization](#performance-optimization)

---

## Prerequisites

### What You Need
- Git repository (already have ✓)
- GitHub/GitLab account
- Content in `/content` directory (already set up ✓)
- Node.js installed locally for testing

### Before Deploying
1. Test locally: `npm run dev`
2. Generate content: `npm run content:generate`
3. Build production: `npm run build`
4. Verify everything works

---

## Option 1: Cloudflare Pages (Recommended)

### Why Cloudflare Pages?
- ✅ **Free tier is generous** (unlimited sites, requests, bandwidth)
- ✅ **Edge network** (fast globally)
- ✅ **Built-in Workers** (serverless functions for contact form)
- ✅ **Easy setup** (connect Git, deploy)
- ✅ **Automatic HTTPS**
- ✅ **Branch previews** (test before merging)

### Setup Steps

#### 1. Create Cloudflare Account
```
Visit: https://dash.cloudflare.com/sign-up
Create free account
```

#### 2. Connect Repository
```
1. Go to Cloudflare Dashboard
2. Click "Workers & Pages"
3. Click "Create application" → "Pages" → "Connect to Git"
4. Authorize GitHub and select your repository
```

#### 3. Configure Build Settings
```
Framework preset: None (custom build)
Build command: npm run build
Build output directory: dist/public
Root directory: /
```

#### 4. Environment Variables
```
NODE_VERSION: 18
```

#### 5. Deploy
```
Click "Save and Deploy"
Wait ~2 minutes for first build
Your site will be live at: https://your-site.pages.dev
```

### Automatic Deployments
- **Every push to `main`** → Production deployment
- **Every push to other branches** → Preview deployment
- **Every Pull Request** → Automatic preview link

---

## Option 2: Vercel

### Why Vercel?
- ✅ Fast edge network
- ✅ Excellent DX (developer experience)
- ✅ Built-in serverless functions
- ✅ Free tier includes everything you need

### Setup Steps

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login
```bash
vercel login
```

#### 3. Deploy
```bash
vercel
```

#### 4. Follow Prompts
```
? Set up and deploy? [Y/n] Y
? Which scope? Your account
? Link to existing project? [y/N] N
? What's your project's name? adrianlumley-site
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

#### 5. Build Configuration (vercel.json)
Create `vercel.json` in root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 6. Production Deploy
```bash
vercel --prod
```

---

## Option 3: Netlify

### Why Netlify?
- ✅ Generous free tier
- ✅ Great documentation
- ✅ Built-in forms (alternative to Cloudflare Worker)
- ✅ Split testing built-in

### Setup Steps

#### 1. Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

#### 3. Or Deploy via UI
```
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import from Git"
3. Connect GitHub
4. Select repository
5. Build settings:
   - Build command: npm run build
   - Publish directory: dist/public
6. Deploy site
```

---

## Contact Form Setup

Your contact form needs a serverless function to handle submissions.

### Using Cloudflare Workers (Recommended)

#### 1. Install Wrangler
```bash
npm install -g wrangler
```

#### 2. Login to Cloudflare
```bash
wrangler login
```

#### 3. Create KV Namespace (for rate limiting)
```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
# Copy the ID from output
```

#### 4. Update wrangler.toml
```toml
# In workers/wrangler.toml, replace:
id = "YOUR_KV_NAMESPACE_ID"  # with actual ID from step 3
```

#### 5. Set Secrets
```bash
cd workers
wrangler secret put SENDGRID_API_KEY
# Paste your SendGrid API key when prompted

wrangler secret put CONTACT_EMAIL
# Enter your email (e.g., adrian@adrianlumley.com)
```

#### 6. Deploy Worker
```bash
wrangler deploy
# Note the URL: https://adrianlumley-contact.your-username.workers.dev
```

#### 7. Update Frontend
Update contact form to post to Worker URL:
```typescript
// In your contact form component
const response = await fetch('https://YOUR-WORKER-URL/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
```

### Using Vercel Functions

Create `api/contact.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Your contact form logic here
  // (similar to Cloudflare Worker implementation)

  return res.status(200).json({ success: true });
}
```

---

## Custom Domain

### Cloudflare Pages
```
1. Go to your site in Cloudflare Dashboard
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., adrianlumley.com)
5. Follow DNS instructions
6. Wait for DNS propagation (~5 minutes)
```

### Vercel
```
1. Go to Project Settings
2. Click "Domains"
3. Add your domain
4. Update DNS records as shown
5. Wait for verification
```

### Netlify
```
1. Go to Site Settings
2. Click "Domain management"
3. Add custom domain
4. Update nameservers or DNS records
5. Enable HTTPS (automatic)
```

---

## CI/CD Workflow

### Automatic Workflow

Your site will auto-deploy on every push:

```
1. Edit content in /content/*.md
2. git add .
3. git commit -m "Add new blog post"
4. git push origin main
5. Deploy platform detects push
6. Runs: npm run build (includes content:generate)
7. Deploys new version
8. Site is live in ~2 minutes
```

### Branch Previews

Test changes before merging:

```
1. Create feature branch: git checkout -b feature/new-post
2. Make changes
3. git push origin feature/new-post
4. Platform creates preview URL
5. Review at: https://feature-new-post.your-site.pages.dev
6. Merge when ready → auto-deploys to production
```

---

## Performance Optimization

### 1. Enable Compression
All platforms enable gzip/brotli by default ✓

### 2. Cache Headers
Create `_headers` file in `dist/public`:

```
# Cloudflare Pages / Netlify
/*
  Cache-Control: public, max-age=0, must-revalidate

/content/*
  Cache-Control: public, max-age=3600, s-maxage=3600

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

For Vercel, add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/content/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        }
      ]
    }
  ]
}
```

### 3. Optimize Images
```bash
# Install image optimization
npm install sharp

# Create script to optimize images
# (or use CDN like Cloudflare Images)
```

### 4. Preload Critical Assets
In `index.html`:
```html
<link rel="preload" href="/content/config.json" as="fetch" crossorigin>
<link rel="preload" href="/assets/fonts/mono.woff2" as="font" type="font/woff2" crossorigin>
```

### 5. Enable Analytics

#### Cloudflare Web Analytics (Free, Privacy-Respecting)
```html
<!-- Add to index.html -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

#### Plausible Analytics (Paid, Privacy-First)
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## Post-Deployment Checklist

### Testing
- [ ] Visit all V2 pages (/, /v2, /blog-v2, /projects-v2)
- [ ] Test contact form submission
- [ ] Check mobile responsiveness
- [ ] Test dark mode toggle
- [ ] Verify links work
- [ ] Test syntax highlighting in blog posts

### Performance
- [ ] Run Lighthouse audit (should be 95+ across the board)
- [ ] Check page load speed (<2s)
- [ ] Verify Core Web Vitals (green)

### SEO
- [ ] Add meta descriptions
- [ ] Add OpenGraph images
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console
- [ ] Test social media previews

### Analytics
- [ ] Set up analytics
- [ ] Configure goals/events
- [ ] Verify tracking works

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, free)
- [ ] Configure error tracking (Sentry, free tier)
- [ ] Set up performance monitoring

---

## Troubleshooting

### Build Fails
```bash
# Test locally first
npm run content:generate
npm run build

# Check logs on deploy platform
# Common issues:
# - Missing environment variables
# - Node version mismatch (use Node 18)
# - Build command incorrect
```

### Content Not Updating
```bash
# Clear cache
# Cloudflare: Dashboard → Caching → Purge Everything
# Vercel: Deployments → Redeploy
# Netlify: Deploys → Trigger deploy → Clear cache and deploy
```

### Contact Form Not Working
```bash
# Check Worker logs (Cloudflare)
wrangler tail

# Verify secrets are set
wrangler secret list

# Test Worker directly
curl -X POST https://your-worker.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

---

## Cost Breakdown

### Free Tier (Cloudflare Pages)
- Static hosting: **FREE** (unlimited sites)
- Bandwidth: **FREE** (unlimited)
- Builds: **FREE** (500/month)
- Workers: **FREE** (100,000 requests/day)
- **Total: $0/month**

### Paid Options (Optional)
- Custom domain: **$10-15/year** (Namecheap, Cloudflare Registrar)
- SendGrid email: **FREE** (100 emails/day), $15/mo for more
- Plausible Analytics: **$9/month** (optional)

### Comparison to Old Architecture
- **Old:** $25/month (database + hosting)
- **New:** $0-10/month (domain only)
- **Savings:** ~$300/year

---

## Advanced: Multi-Environment Setup

### Development
```
Branch: develop
URL: https://develop.your-site.pages.dev
Use: Testing new features
```

### Staging
```
Branch: staging
URL: https://staging.your-site.pages.dev
Use: Final testing before production
```

### Production
```
Branch: main
URL: https://adrianlumley.com
Use: Live site
```

---

## Rollback Strategy

### Cloudflare Pages
```
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → "Rollback to this deployment"
4. Confirm
5. Site reverts in seconds
```

### Git-Based Rollback
```bash
# Find commit to rollback to
git log --oneline

# Revert to previous commit
git revert HEAD

# Or reset (use with caution)
git reset --hard <commit-hash>
git push --force
```

---

## Next Steps

1. **Deploy to your preferred platform** (Cloudflare recommended)
2. **Set up contact form Worker**
3. **Configure custom domain**
4. **Enable analytics**
5. **Add more content** (blog posts, projects)
6. **Monitor performance**
7. **Iterate and improve**

---

## Resources

### Documentation
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)

### Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automate performance testing
- [web.dev](https://web.dev/measure/) - Measure performance
- [PageSpeed Insights](https://pagespeed.web.dev/) - Google's performance tool

### Community
- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Vercel Discord](https://discord.gg/vercel)

---

**The future is static-first. Deploy with confidence.** ✨
