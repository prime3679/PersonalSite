import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertBlogPostSchema, insertProjectSchema, insertContactSubmissionSchema } from "@shared/schema";
import { sendEmail } from "./email";

// Basic auth middleware for admin operations
function requireBasicAuth(req: any, res: any, next: any) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return res.status(503).json({ error: "Admin operations not configured" });
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Admin authorization required" });
  }
  
  const token = authHeader.substring(7);
  if (token !== adminKey) {
    return res.status(403).json({ error: "Invalid admin token" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      // Only allow published=false for authenticated admin users
      const publishedOnly = req.query.published === 'false' ? false : true;
      if (!publishedOnly) {
        const adminKey = process.env.ADMIN_KEY;
        const authHeader = req.headers.authorization;
        if (!adminKey || !authHeader?.startsWith('Bearer ') || authHeader.substring(7) !== adminKey) {
          return res.status(401).json({ error: "Admin authorization required to view unpublished posts" });
        }
      }
      const posts = await storage.getBlogPosts(publishedOnly);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Check if post is published, or if user has admin access for unpublished posts
      if (!post.published) {
        const adminKey = process.env.ADMIN_KEY;
        const authHeader = req.headers.authorization;
        if (!adminKey || !authHeader?.startsWith('Bearer ') || authHeader.substring(7) !== adminKey) {
          // Return 404 instead of 401 to avoid disclosure that the post exists
          return res.status(404).json({ error: "Blog post not found" });
        }
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", requireBasicAuth, async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid blog post data", details: result.error.errors });
      }
      const post = await storage.createBlogPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.put("/api/blog/:id", requireBasicAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertBlogPostSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid blog post data", details: result.error.errors });
      }
      const post = await storage.updateBlogPost(id, result.data);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/:id", requireBasicAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const featuredOnly = req.query.featured === 'true';
      const projects = await storage.getProjects(featuredOnly);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const project = await storage.getProject(slug);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireBasicAuth, async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid project data", details: result.error.errors });
      }
      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", requireBasicAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertProjectSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid project data", details: result.error.errors });
      }
      const project = await storage.updateProject(id, result.data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireBasicAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Contact routes
  app.get("/api/contact", requireBasicAuth, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ error: "Failed to fetch contact submissions" });
    }
  });

  // Rate limiting for contact form
  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: {
      error: "Too many contact form submissions. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for localhost during development only
    skip: (req) => {
      return process.env.NODE_ENV === 'development' && 
             (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.startsWith('192.168.'));
    }
  });

  app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
      const result = insertContactSubmissionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid contact submission data", details: result.error.errors });
      }
      
      // Store the submission in database
      const submission = await storage.createContactSubmission(result.data);
      
      // Send email notification
      const emailSent = await sendEmail({
        to: process.env.CONTACT_EMAIL || "adrian@adrianlumley.com",
        subject: result.data.subject || "New Contact Form Submission",
        text: `You have received a new contact form submission:

Name: ${result.data.name}
Email: ${result.data.email}
Subject: ${result.data.subject || "No subject"}

Message:
${result.data.message}

This message was submitted on ${new Date().toLocaleString()}.`,
        userEmail: result.data.email,
        userName: result.data.name,
        userMessage: result.data.message
      });
      
      if (!emailSent) {
        console.warn("Failed to send email notification for contact submission:", submission.id);
      }
      
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating contact submission:", error);
      res.status(500).json({ error: "Failed to create contact submission" });
    }
  });

  app.patch("/api/contact/:id/read", requireBasicAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markContactSubmissionRead(id);
      if (!success) {
        return res.status(404).json({ error: "Contact submission not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error marking contact submission as read:", error);
      res.status(500).json({ error: "Failed to mark contact submission as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
