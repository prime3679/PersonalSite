import { 
  type User, 
  type InsertUser,
  type BlogPost,
  type InsertBlogPost,
  type Project,
  type InsertProject,
  type ContactSubmission,
  type InsertContactSubmission,
  users,
  blogPosts,
  projects,
  contactSubmissions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog methods
  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  
  // Project methods
  getProjects(featuredOnly?: boolean): Promise<Project[]>;
  getProject(slug: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Contact methods
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  markContactSubmissionRead(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Blog methods
  async getBlogPosts(publishedOnly = false): Promise<BlogPost[]> {
    if (publishedOnly) {
      return await db.select().from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.createdAt));
    }
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Project methods
  async getProjects(featuredOnly = false): Promise<Project[]> {
    if (featuredOnly) {
      return await db.select().from(projects)
        .where(eq(projects.featured, true))
        .orderBy(projects.orderIndex, desc(projects.createdAt));
    }
    return await db.select().from(projects).orderBy(projects.orderIndex, desc(projects.createdAt));
  }

  async getProject(slug: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contact methods
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(submission).returning();
    return created;
  }

  async markContactSubmissionRead(id: string): Promise<boolean> {
    const result = await db
      .update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
