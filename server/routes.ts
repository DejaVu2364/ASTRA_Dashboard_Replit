import type { Express } from "express";
import { createServer, type Server } from "http";
// WebSocket removed to prevent conflicts with Vite
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertCommentSchema, insertAnalyticsSchema, insertChallengeSchema, insertUserChallengeSchema, insertNarrativeReportSchema, insertGeminiReportSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "astra-intelligence-secret-key";

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ message: "ASTRA Intelligence Server is running", status: "operational" });
  });

  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // For demo purposes, use hardcoded admin credentials
      // In production, this should query the database
      const validUsername = "admin";
      const validPasswordHash = await bcrypt.hash("password123", 10);
      
      if (username === validUsername && await bcrypt.compare(password, validPasswordHash)) {
        const token = jwt.sign(
          { username, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        res.json({ token, user: { username, role: 'admin' } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // User routes (protected)
  app.get("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Post routes (protected)
  app.get("/api/posts", authenticateToken, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ error: "Post not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  // Analytics routes (protected)
  app.get("/api/analytics", authenticateToken, async (req, res) => {
    try {
      const metricType = req.query.type as string;
      const analytics = await storage.getAnalytics(metricType);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.createAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      res.status(400).json({ error: "Invalid analytics data" });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.post("/api/challenges", async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  // Narrative report routes (protected)
  app.get("/api/narrative-reports", authenticateToken, async (req, res) => {
    try {
      const reports = await storage.getAllNarrativeReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch narrative reports" });
    }
  });

  app.get("/api/narrative-reports/:month/:year", async (req, res) => {
    try {
      const month = req.params.month;
      const year = parseInt(req.params.year);
      const report = await storage.getNarrativeReport(month, year);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ error: "Narrative report not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/narrative-reports", async (req, res) => {
    try {
      const reportData = insertNarrativeReportSchema.parse(req.body);
      const report = await storage.createNarrativeReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid narrative report data" });
    }
  });

  // Gemini report routes (protected)
  app.get("/api/gemini-reports", authenticateToken, async (req, res) => {
    try {
      const reports = await storage.getAllGeminiReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Gemini reports" });
    }
  });

  app.get("/api/gemini-reports/:month/:year/:type", async (req, res) => {
    try {
      const month = req.params.month;
      const year = parseInt(req.params.year);
      const reportType = req.params.type;
      const report = await storage.getGeminiReport(month, year, reportType);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ error: "Gemini report not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/gemini-reports", async (req, res) => {
    try {
      const reportData = insertGeminiReportSchema.parse(req.body);
      const report = await storage.createGeminiReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid Gemini report data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
