# Adrian Lumley Personal Site

Adrian Lumley’s personal site pairs a React + TypeScript single-page application with an Express/Drizzle backend so his story, case studies, blog posts, and contact channels stay in sync across the stack.

The frontend highlights his background, featured wins, long-form writing, and multiple ways to connect, while the API exposes admin workflows and persistence backed by Neon Postgres.

## Features

- Narrative landing page with themed sections (intro, featured work, focus, beliefs, and contact cues) plus a sticky header that exposes a light/dark toggle.
- Blog listing, loading skeletons, and Markdown rendering with syntax highlighting for individual posts, including graceful fallbacks when content is missing.
- Projects gallery that hydrates from the API, shows images, technology badges, deep links, and featured project badges when flagged in the database.
- Contact flow built with React Hook Form and Zod validation, toast feedback, a success state, alternate channels, and a backend that rate-limits submissions, stores them, and emails notifications through SendGrid.
- Admin-protected REST API covering blog, project, and contact resources with bearer auth, structured logging, and centralized persistence via Drizzle queries.
- Shared schema module keeps Postgres tables, Zod validators, and TypeScript types aligned across client and server imports.
- Tailwind-powered design system with custom CSS variables, animations, and shadcn/ui components applied through a theme provider.

## Tech Stack

### Frontend

- React 18 with Wouter routing, TanStack Query, tooltip/toast providers, and shared layout wrappers.
- QueryClient configuration that wraps fetch calls, centralizes error handling, and disables unnecessary refetches for a SPA portfolio use case.
- Tailwind CSS extended with custom colors, typography, animations, and CSS variables for both light and dark modes.
- shadcn/ui setup (New York theme) for consistent component primitives and alias management.
- React Hook Form + Zod resolver for form UX and validation, reusing insert schemas from the shared layer.
- Markdown rendering with ReactMarkdown, GFM, and highlight.js styling for developer-friendly blog posts.

### Backend

- Express server that logs API payloads, trusts upstream proxies, and orchestrates both API routes and the Vite dev middleware/static assets.
- Drizzle ORM targeting Neon Postgres, with pooled connections, table helpers, and strongly typed CRUD helpers in a storage class.
- Route module providing blog, project, and contact endpoints, bearer-token admin guards, contact rate limiting, and SendGrid-powered notifications.

### Shared

- Centralized schema file declaring `users`, `blog_posts`, `projects`, and `contact_submissions` tables alongside insert schemas and inferred TypeScript types for both layers.

## Project Structure

- `client/` – React SPA entry point, routing, pages, and UI components consumed via the `@` alias.
- `server/` – Express bootstrap, HTTP routes, Vite integration, database access, storage abstraction, and email helper.
- `shared/` – Drizzle schema and Zod validators shared between client and server packages.
- `tailwind.config.ts`, `postcss.config.js`, `vite.config.ts`, `tsconfig.json`, and `components.json` – tooling configs for styling, bundling, path aliases, and shadcn scaffolding.
- `attached_assets/` – asset directory exposed through the `@assets` alias for optional static content.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

   (Scripts and dependencies are defined in `package.json`.)

2. **Configure environment**

   Set the environment variables described below (at minimum, `DATABASE_URL` must be present before the server starts).

3. **Run the app in development**

   ```bash
   npm run dev
   ```

   This starts the Express server in development mode and mounts Vite’s middleware for hot module reloads while logging API traffic.

4. **Create a production build**

   ```bash
   npm run build
   ```

   Builds the Vite client into `dist/public` and bundles the server entry with esbuild.

5. **Start the production server**

   ```bash
   npm run start
   ```

   Launches the compiled Express server from the `dist` directory.

6. **Type-check**

   ```bash
   npm run check
   ```

   Runs `tsc` against the client, server, and shared packages without emitting output.

7. **Sync the schema**

   ```bash
   npm run db:push
   ```

   Applies the Drizzle schema to the database using the configured `DATABASE_URL`.

The server listens on `PORT` (default 5000) and trusts proxy headers, making it suitable for deployment behind CDNs or load balancers.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Connection string for the Neon Postgres database used by Drizzle and migrations. |
| `ADMIN_KEY` | For admin APIs | Bearer token that unlocks unpublished blog views and CRUD endpoints for blog, project, and contact resources. |
| `SENDGRID_API_KEY` | Optional (needed for email) | Enables transactional email via SendGrid; without it, contact submissions are stored but logged as email failures. |
| `SENDGRID_FROM_EMAIL` | Optional | Overrides the default `noreply@adrianlumley.com` sender address. |
| `CONTACT_EMAIL` | Optional | Target inbox for contact notifications (defaults to `adrian@adrianlumley.com`). |
| `PORT` | Optional | Port for the Express HTTP server (defaults to 5000). |
| `NODE_ENV` | Optional | Controls dev vs. production behavior, including Vite middleware and contact rate-limit bypass for localhost. |
| `REPL_ID` | Optional | Enables the Replit Cartographer plugin during local development when present. |

## Database Schema

- **`users`** – Auth table with UUID primary key, unique username, and password hash fields.
- **`blog_posts`** – Stores titles, slugs, Markdown content, excerpts, publish flags, publish timestamps, and audit timestamps.
- **`projects`** – Captures project metadata including descriptions, optional long descriptions, technology arrays, media URLs, feature flags, ordering, and timestamps.
- **`contact_submissions`** – Persists inbound contact form payloads with read-tracking and timestamps.
- Zod-powered insert schemas and inferred TypeScript types accompany each table for validation and compile-time safety across the stack.

## API Reference

All endpoints live under `/api`. Endpoints marked 🔐 require `Authorization: Bearer <ADMIN_KEY>`.

| Method & Path | Description |
| --- | --- |
| `GET /api/blog?published=true|false` | Lists blog posts. Access to unpublished drafts requires the admin token; the query defaults to published posts only. |
| `GET /api/blog/:slug` | Fetches a single post. Unpublished posts are hidden unless the request is authenticated. |
| 🔐 `POST /api/blog` | Validates payload with `insertBlogPostSchema` and creates a post. |
| 🔐 `PUT /api/blog/:id` | Partially updates a post and stamps `updatedAt`. |
| 🔐 `DELETE /api/blog/:id` | Removes a post by ID. |
| `GET /api/projects?featured=true` | Lists projects, optionally filtering to featured ones. |
| `GET /api/projects/:slug` | Fetches a single project record. |
| 🔐 `POST /api/projects` | Creates a project entry after Zod validation. |
| 🔐 `PUT /api/projects/:id` | Partially updates project attributes and timestamps. |
| 🔐 `DELETE /api/projects/:id` | Deletes a project by ID. |
| 🔐 `GET /api/contact` | Returns stored contact submissions, newest first. |
| `POST /api/contact` | Rate-limited to three submissions per 15 minutes (except local dev), validates the payload, stores it, and attempts a SendGrid notification. |
| 🔐 `PATCH /api/contact/:id/read` | Marks a contact submission as read. |

The storage layer wraps these endpoints in Drizzle queries so both admin and public routes share typed access patterns.

## Frontend Pages

- **Home** – Introduces Adrian, highlights metric-driven wins, outlines current focus/beliefs, and spotlights contact links with smooth fade-in animations.
- **Blog** – Lists published posts with loading skeletons, error feedback, and date formatting; clicking a card navigates to the slug view.
- **Blog Post** – Renders Markdown with headings, code blocks, blockquotes, and navigation back to the blog list, plus loading/error placeholders.
- **Projects** – Fetches projects via TanStack Query, showing media, descriptions, technology pills, live and GitHub links, and featured markers.
- **Contact** – Provides a validated form with toast feedback, success confirmation, and alternate email/LinkedIn cards after the submission section.
- **Site Header** – Sticky navigation that reflects the active route, displays location text, and toggles themes via the shared provider.

## Development Notes

- Structured logging truncates long API payloads while timing each response.
- Production builds serve static assets from `dist/public`, with Express falling back to `index.html` for SPA routing.
- Path aliases (`@`, `@shared`, `@assets`) are configured in both Vite and TypeScript for ergonomic imports across packages.
- The query helper shares fetch behavior (JSON parsing, auth handling) between hooks and mutations to keep data access consistent.
- Tailwind layers and CSS variables define fonts, spacing, and animation utilities leveraged throughout the UI.
- The project is distributed under the MIT license.

## Testing

⚠️ Not run (not requested).
