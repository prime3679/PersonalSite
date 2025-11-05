# Deploy in 2 Minutes 🚀

Your site is **ready to deploy**. Choose your platform and follow the steps:

---

## Option 1: Cloudflare Pages (Recommended)

### Why Cloudflare?
- ✅ **100% free** (unlimited sites, bandwidth)
- ✅ **Fastest** (300+ edge locations)
- ✅ **Built-in Workers** (for contact form)

### Steps:

1. **Go to Cloudflare Dashboard**
   ```
   Visit: https://dash.cloudflare.com/sign-up
   (Create account if needed - it's free)
   ```

2. **Create New Site**
   ```
   Click: Workers & Pages
   Click: Create application
   Click: Pages tab
   Click: Connect to Git
   ```

3. **Connect GitHub**
   ```
   Authorize Cloudflare to access GitHub
   Select repository: PersonalSite
   ```

4. **Configure Build**
   ```
   Build command: npm run build
   Build output: dist/public
   Root directory: /
   ```

5. **Deploy!**
   ```
   Click: Save and Deploy
   Wait: ~2 minutes
   ```

**Done!** Your site will be live at: `https://your-project.pages.dev`

---

## Option 2: Vercel (Excellent for React)

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow Prompts**
   ```
   ? Set up and deploy? Y
   ? Which scope? Your account
   ? Link to existing project? N
   ? Project name? adrianlumley-site
   ? In which directory is your code? ./
   ? Want to override settings? N
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

**Done!** Your site will be live at the URL shown.

---

## Option 3: Netlify (Great Documentation)

### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Follow Prompts**
   ```
   Site path: ./dist/public
   ```

**Done!** Your site will be live at the URL shown.

---

## After Deployment

### Add Custom Domain (Optional)

**Cloudflare Pages:**
```
Dashboard → Your site → Custom domains → Add domain
Enter: adrianlumley.com
Follow DNS instructions
```

**Vercel:**
```
Project Settings → Domains → Add
Enter domain, update DNS
```

**Netlify:**
```
Site Settings → Domain management → Add custom domain
Update DNS as shown
```

### Deploy Contact Form Worker (Optional)

If you want the contact form to work:

```bash
cd workers
npm install -g wrangler
wrangler login
wrangler kv:namespace create "RATE_LIMIT_KV"
# Copy the ID and update wrangler.toml
wrangler secret put SENDGRID_API_KEY
wrangler secret put CONTACT_EMAIL
wrangler deploy
```

---

## Test Your Deployment

Once deployed, visit these URLs to verify:

- `/` - Original home
- `/v2` - Transformed home ✨
- `/blog-v2` - Blog with 2 posts
- `/blog-v2/static-first-architecture` - Sample post
- `/projects-v2` - Case studies
- `/compare` - See the transformation

---

## Automatic Updates

Every time you push to `main`:
```bash
git add .
git commit -m "Update content"
git push
# Site auto-deploys in 2 minutes
```

---

## Need Help?

All platforms have great docs:
- Cloudflare: https://developers.cloudflare.com/pages/
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com/

---

**The hard work is done. Just pick a platform and deploy!** ✨
