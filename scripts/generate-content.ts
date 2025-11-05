#!/usr/bin/env tsx
/**
 * Static Site Generator
 *
 * Transforms markdown and YAML content into optimized JSON files
 * for lightning-fast static site delivery.
 *
 * Philosophy: Content should live in human-friendly formats (markdown, YAML)
 * and be transformed once at build time, not repeatedly at runtime.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const outputDir = path.join(rootDir, 'public', 'content');

// Types
interface SiteConfig {
  site: {
    title: string;
    description: string;
    url: string;
    author: string;
  };
  person: {
    name: string;
    email: string;
    location: string;
    yearsInTech: number;
  };
  social: Record<string, string>;
  currentRole: {
    company: string;
    companyUrl: string;
    subscribers: string;
  };
  theme: {
    defaultMode: string;
    font: string;
    primaryColor: string;
  };
}

interface CaseStudy {
  id: string;
  company: string;
  title: string;
  headline: string;
  shortBlurb: string;
  fullHeadline: string;
  summary: string;
  outcomes: string[];
  responsibilities: string[];
  featured: boolean;
  order: number;
}

interface ProfileContent {
  frontmatter: Record<string, any>;
  content: string;
  sections: {
    introduction: string;
    currentFocus: string[];
    beliefs: string[];
    currently: Record<string, string>;
    contact: string;
  };
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags?: string[];
}

// Utilities
const log = {
  info: (msg: string) => console.log(`\x1b[36m→\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  time: (label: string) => console.time(`  ${label}`),
  timeEnd: (label: string) => console.timeEnd(`  ${label}`),
};

/**
 * Ensure output directory exists
 */
async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
}

/**
 * Load and parse site configuration
 */
async function loadConfig(): Promise<SiteConfig> {
  log.time('Load config');
  const configPath = path.join(contentDir, 'config.yaml');
  const configContent = await fs.readFile(configPath, 'utf-8');
  const config = yaml.load(configContent) as SiteConfig;
  log.timeEnd('Load config');
  return config;
}

/**
 * Load and parse profile content
 */
async function loadProfile(): Promise<ProfileContent> {
  log.time('Load profile');
  const profilePath = path.join(contentDir, 'profile.md');
  const fileContent = await fs.readFile(profilePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  // Parse sections from markdown
  const sections = {
    introduction: extractSection(content, 'Introduction'),
    currentFocus: extractListItems(content, 'Current Focus'),
    beliefs: extractListItems(content, 'Things I Believe'),
    currently: extractCurrently(content),
    contact: extractSection(content, "Let's Talk"),
  };

  log.timeEnd('Load profile');
  return { frontmatter, content, sections };
}

/**
 * Load case studies
 */
async function loadCaseStudies(): Promise<CaseStudy[]> {
  log.time('Load case studies');
  const caseStudiesPath = path.join(contentDir, 'case-studies', 'case-studies.yaml');
  const caseStudiesContent = await fs.readFile(caseStudiesPath, 'utf-8');
  const data = yaml.load(caseStudiesContent) as { caseStudies: CaseStudy[] };
  log.timeEnd('Load case studies');
  return data.caseStudies.sort((a, b) => a.order - b.order);
}

/**
 * Load blog posts from markdown files
 */
async function loadBlogPosts(): Promise<BlogPost[]> {
  log.time('Load blog posts');
  const blogDir = path.join(contentDir, 'blog');

  try {
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) {
      log.info('No blog posts found (this is OK for initial setup)');
      log.timeEnd('Load blog posts');
      return [];
    }

    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(blogDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
          slug: data.slug || file.replace('.md', ''),
          title: data.title || 'Untitled',
          excerpt: data.excerpt || content.substring(0, 200) + '...',
          content,
          publishedAt: data.publishedAt || new Date().toISOString(),
          tags: data.tags || [],
        };
      })
    );

    log.timeEnd('Load blog posts');
    return posts.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    log.info('Blog directory not found or empty (this is OK)');
    log.timeEnd('Load blog posts');
    return [];
  }
}

/**
 * Extract a section from markdown content
 */
function extractSection(content: string, heading: string): string {
  const regex = new RegExp(`## ${heading}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extract list items from a section
 */
function extractListItems(content: string, heading: string): string[] {
  const section = extractSection(content, heading);
  const items = section.split('\n').filter(line => line.startsWith('-'));
  return items.map(item => item.replace(/^-\s*/, '').trim());
}

/**
 * Extract the "currently" section items
 */
function extractCurrently(content: string): Record<string, string> {
  const section = extractSection(content, 'Currently');
  const items = section.split('\n').filter(line => line.includes('**'));

  const currently: Record<string, string> = {};
  items.forEach(item => {
    const match = item.match(/\*\*([^*]+):\*\*\s*(.+)/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      currently[key] = value;
    }
  });

  return currently;
}

/**
 * Write JSON output
 */
async function writeJSON(filename: string, data: any): Promise<void> {
  const outputPath = path.join(outputDir, filename);
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

  // Calculate size
  const stats = await fs.stat(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  log.success(`Generated ${filename} (${sizeKB} KB)`);
}

/**
 * Generate all static content
 */
async function generateContent(): Promise<void> {
  console.log('\n🚀 Static Site Generator\n');

  const startTime = Date.now();

  try {
    // Ensure output directory exists
    await ensureOutputDir();

    // Load all content
    log.info('Loading content...\n');
    const [config, profile, caseStudies, blogPosts] = await Promise.all([
      loadConfig(),
      loadProfile(),
      loadCaseStudies(),
      loadBlogPosts(),
    ]);

    // Write output files
    log.info('\nGenerating static files...\n');
    await Promise.all([
      writeJSON('config.json', config),
      writeJSON('profile.json', profile),
      writeJSON('case-studies.json', caseStudies),
      writeJSON('blog-posts.json', blogPosts),
    ]);

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Generated in ${duration}s\n`);

    // Stats
    console.log('📊 Content Summary:');
    console.log(`   • ${caseStudies.length} case studies`);
    console.log(`   • ${blogPosts.length} blog posts`);
    console.log(`   • All content ready for instant delivery\n`);

  } catch (error) {
    log.error(`Failed to generate content: ${error}`);
    process.exit(1);
  }
}

// Run generator
generateContent();
