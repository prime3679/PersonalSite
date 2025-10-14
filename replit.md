# Overview

This is a personal portfolio website for Adrian Lumley, a Senior Director of Product Management at SiriusXM. The application is built as a full-stack web application featuring a React frontend with a modern, minimalist design inspired by personal portfolio sites. It includes sections for blog posts, projects, and contact functionality, with a clean black theme and typography-focused layout.

The site serves as both a professional showcase and a content management platform, allowing for dynamic content updates through API endpoints for blog posts, projects, and contact submissions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom dark theme variables
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple
- **Rate Limiting**: Express rate limiting middleware
- **Authentication**: Basic bearer token authentication for admin operations

## Data Storage Solutions
- **Primary Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: 
  - Users (authentication)
  - Blog posts (content management)
  - Projects (portfolio items)
  - Contact submissions (form handling)

## Authentication and Authorization
- **Admin Authentication**: Bearer token-based authentication using ADMIN_KEY environment variable
- **Public Access**: Read-only access to published content without authentication
- **Protected Operations**: Admin-only endpoints for content creation, updates, and unpublished content access

## External Dependencies
- **Email Service**: SendGrid for contact form email notifications
- **Database Hosting**: Neon Database (serverless PostgreSQL)
- **UI Component Library**: Radix UI for accessible component primitives
- **Styling Framework**: Tailwind CSS for utility-first styling
- **Development Tools**: 
  - Replit integration for development environment
  - Vite plugins for hot reload and error handling
- **Font Loading**: Google Fonts (DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Markdown Processing**: ReactMarkdown with syntax highlighting via rehype-highlight
- **Form Validation**: Zod schema validation library

<!-- Test verification comment added by Devin -->
