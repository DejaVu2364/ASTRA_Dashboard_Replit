import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
// WebSocket removed to prevent conflicts with Vite
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertCommentSchema, insertAnalyticsSchema, insertChallengeSchema, insertUserChallengeSchema, insertNarrativeReportSchema, insertGeminiReportSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { aiService } from "./ai";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const JWT_SECRET = process.env.JWT_SECRET || "astra-intelligence-secret-key";

// Zod validation middleware
const validate = (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({
        error: "Invalid request body",
        details: validationError.details,
      });
    }
    // Forward other errors
    next(error);
  }
};

// Zod schema for AI content analysis
const AIAnalyzeContentSchema = z.object({
  content: z.string().min(1, "Content cannot be empty."),
  metrics: z.object({
    engagementRate: z.number().optional(),
    sentiment: z.number().optional(),
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
  }),
});

// Zod schema for strategic report
const AIStrategicReportSchema = z.object({
  timeframe: z.string().optional().default('current month'),
});

interface PostSummaryRow {
  post_id: string;
  post_caption: string;
  total_likes: string;
  num_shares: string;
  comment_count: string;
  avg_sentiment_score: string;
  sentiment_variance: string;
  negative_comment_ratio: string;
  main_topic: string;
  most_positive_comment: string;
  most_negative_comment: string;
  weighted_engagement_rate: string;
}

interface EnrichedCommentRow {
    post_id: string;
    text_for_analysis: string;
    original_comment_for_context: string;
    original_language: string;
    sentiment_score: string;
    topic: string;
    comment_likes: string;
}


// Real data loading functions
function loadPostSummaries() {
  try {
    const summaryDir = path.join(process.cwd(), "DASHBOARD FINAL 2", "monthly_reports");
    const summaryFiles = fs.readdirSync(summaryDir).filter(file => file.startsWith("post_summary_"));
    
    // Create English translations for Kannada post captions using manual mapping
    const translatedCaptions = {};
    
    // Manual translations for common Kannada phrases found in post captions
    const kannadaTranslations = {
      'ಗೃಹಕಚೇರಿಯಲ್ಲಿ ನನ್ನ ದಿನಚರಿ': 'My daily routine in home visits',
      'ಬುಧವಾರದ ದಿನಸೂಚಿ': 'Wednesday schedule',
      'ಮುಂಜಾನೆಯ ಶುಭೋದಯಗಳು': 'Morning greetings',
      'ವಾರ್ಷಿಕ ಮಾಸಿಕ ಪ್ರಗತಿ': 'Annual monthly progress',
      'ಸೇವಾ ಕಾರ್ಯಕ್ರಮ': 'Service program',
      'ಸಭಾ ಸಮಾರಂಭ': 'Meeting ceremony',
      'ಪ್ರಜಾ ಸಂಪರ್ಕ': 'Public connection',
      'ಅಭಿವೃದ್ಧಿ ಕಾರ್ಯಗಳು': 'Development works',
      'ಸಾರ್ವಜನಿಕ ಸೇವೆ': 'Public service',
      'ಸಮುದಾಯ ಸಭೆ': 'Community meeting'
    };
    
    // Apply translations to captions that contain these phrases
    Object.entries(kannadaTranslations).forEach(([kannada, english]) => {
      (translatedCaptions as any)[kannada] = english;
    });
    
    console.log(`Created ${Object.keys(translatedCaptions).length} manual caption translations`);
    
    const allPosts: any[] = [];
    for (const file of summaryFiles) {
      const filePath = path.join(summaryDir, file);
      const csvContent = fs.readFileSync(filePath, "utf-8");
      const rows = parse(csvContent, { columns: true, skip_empty_lines: true, cast: true }) as PostSummaryRow[];
      
      // Extract month from filename
      const monthMatch = file.match(/post_summary_(\d{4}-\d{2})\.csv/);
      const month = monthMatch ? monthMatch[1] : "unknown";
      
      rows.forEach((row: PostSummaryRow, index) => {
        // Check if this caption has a translation
        const originalCaption = row.post_caption || "No caption available";
        let translatedCaption = null;
        
        // Look for exact matches first
        if ((translatedCaptions as any)[originalCaption]) {
          translatedCaption = (translatedCaptions as any)[originalCaption];
        } else {
          // Look for partial matches in the caption
          for (const [kannada, english] of Object.entries(translatedCaptions)) {
            if (originalCaption.includes(kannada)) {
              translatedCaption = english + '\n#NammaPrabha #MPOfDavangere';
              break;
            }
          }
        }
        
        allPosts.push({
          id: allPosts.length + index + 1,
          postId: row.post_id,
          platform: "facebook",
          caption: originalCaption,
          translatedContent: translatedCaption,
          totalLikes: parseInt(row.total_likes) || 0,
          numShares: parseInt(row.num_shares) || 0,
          commentCount: parseInt(row.comment_count) || 0,
          avgSentimentScore: (parseFloat(row.avg_sentiment_score) || 0).toFixed(2),
          sentimentVariance: (parseFloat(row.sentiment_variance) || 0).toFixed(4),
          negativeCommentRatio: (parseFloat(row.negative_comment_ratio) || 0).toFixed(4),
          mainTopic: row.main_topic || "Unknown",
          mostPositiveComment: row.most_positive_comment || "",
          mostNegativeComment: row.most_negative_comment || "",
          originalPositiveContext: "", // Add missing properties
          originalNegativeContext: "", // Add missing properties
          weightedEngagementRate: (parseFloat(row.weighted_engagement_rate) || 0).toFixed(4),
          analysisMonth: month,
          createdAt: new Date(`${month}-01`),
          updatedAt: new Date()
        });
      });
    }
    
    return allPosts;
  } catch (error) {
    console.error("Error loading post summaries:", error);
    return [];
  }
}

function loadEnrichedComments() {
  try {
    const commentsDir = path.join(process.cwd(), "DASHBOARD FINAL 2", "enriched_data");
    const commentFiles = fs.readdirSync(commentsDir).filter(file => file.startsWith("enriched_data_"));
    
    const allComments: any[] = [];
    for (const file of commentFiles) {
      const filePath = path.join(commentsDir, file);
      const csvContent = fs.readFileSync(filePath, "utf-8");
      const rows = parse(csvContent, { columns: true, skip_empty_lines: true, cast: true }) as EnrichedCommentRow[];
      
      // Extract month from filename
      const monthMatch = file.match(/enriched_data_(\d{4}-\d{2})\.csv/);
      const month = monthMatch ? monthMatch[1] : "unknown";
      
      rows.forEach((row: EnrichedCommentRow, index) => {
        if (row.text_for_analysis && String(row.text_for_analysis).trim() !== "") {
          allComments.push({
            id: allComments.length + index + 1,
            postId: parseInt(row.post_id) || 0,
            content: String(row.text_for_analysis || ""),
            originalComment: row.original_comment_for_context || "",
            originalLanguage: row.original_language || "unknown",
            sentimentScore: (parseFloat(row.sentiment_score) || 0).toFixed(2),
            topic: row.topic || "Unknown",
            likesCount: parseInt(row.comment_likes) || 0,
            analysisMonth: month,
            createdAt: new Date(`${month}-01`)
          });
        }
      });
    }
    
    return allComments;
  } catch (error) {
    console.error("Error loading enriched comments:", error);
    return [];
  }
}

function loadNarrativeReports() {
  try {
    const reportsDir = path.join(process.cwd(), "DASHBOARD FINAL 2", "monthly_reports");
    const reportFiles = fs.readdirSync(reportsDir).filter(file => file.startsWith("report-") && file.endsWith(".md"));
    
    const allReports: any[] = [];
    for (const file of reportFiles) {
      const filePath = path.join(reportsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Extract month from filename
      const monthMatch = file.match(/report-(\d{4}-\d{2})\.md/);
      const month = monthMatch ? monthMatch[1] : "unknown";
      const [year, monthNum] = month.split("-");
      
      allReports.push({
        id: allReports.length + 1,
        month: monthNum,
        year: parseInt(year),
        title: `Astra Intelligence Report: ${month}`,
        content: content,
        summary: content.split('\n').slice(0, 5).join('\n') + '...',
        createdAt: new Date(`${month}-01`).toISOString()
      });
    }
    
    return allReports;
  } catch (error) {
    console.error("Error loading narrative reports:", error);
    return [];
  }
}

function generateAnalyticsFromRealData() {
  const posts = loadPostSummaries();
  const comments = loadEnrichedComments();
  const analytics: any[] = [];
  
  // Calculate total metrics
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.totalLikes, 0);
  const totalShares = posts.reduce((sum, post) => sum + post.numShares, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0);
  const avgSentiment = totalPosts > 0 ? posts.reduce((sum, post) => sum + parseFloat(post.avgSentimentScore), 0) / totalPosts : 0;
  const avgEngagement = totalPosts > 0 ? posts.reduce((sum, post) => sum + parseFloat(post.weightedEngagementRate), 0) / totalPosts : 0;
  
  // Sentiment distribution
  const positiveComments = comments.filter(c => parseFloat(c.sentimentScore) > 0.3).length;
  const negativeComments = comments.filter(c => parseFloat(c.sentimentScore) < -0.3).length;
  const neutralComments = comments.length - positiveComments - negativeComments;
  
  // Topic distribution
  const topicCounts = {};
  posts.forEach(post => {
    const topic = post.mainTopic || "Unknown";
    (topicCounts as any)[topic] = ((topicCounts as any)[topic] || 0) + 1;
  });
  
  return [
    { id: 1, metricType: "total_posts", value: totalPosts },
    { id: 2, metricType: "total_likes", value: totalLikes },
    { id: 3, metricType: "total_shares", value: totalShares },
    { id: 4, metricType: "total_comments", value: totalComments },
    { id: 5, metricType: "avg_sentiment", value: avgSentiment },
    { id: 6, metricType: "engagement_rate", value: avgEngagement },
    { id: 7, metricType: "positive_comments", value: positiveComments },
    { id: 8, metricType: "negative_comments", value: negativeComments },
    { id: 9, metricType: "neutral_comments", value: neutralComments },
    { id: 10, metricType: "topic_distribution", value: JSON.stringify(topicCounts) }
  ];
}

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Focus on pipeline data integration

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

  app.post("/api/users", validate(insertUserSchema), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to create user" });
    }
  });

  // Post routes (protected) - Now using real data from DASHBOARD FINAL 2
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = loadPostSummaries();
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

  app.post("/api/posts", validate(insertPostSchema), async (req, res) => {
    try {
      const post = await storage.createPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  // Comments route
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = loadEnrichedComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Analytics routes (public for testing) - Now using real data from DASHBOARD FINAL 2
  app.get("/api/analytics", async (req, res) => {
    try {
      const metricType = req.query.type as string;
      const analytics = generateAnalyticsFromRealData();
      // Filter by metric type if specified
      const filteredAnalytics = metricType ? analytics.filter(a => a.metricType === metricType) : analytics;
      res.json(filteredAnalytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics", validate(insertAnalyticsSchema), async (req, res) => {
    try {
      const analytics = await storage.createAnalytics(req.body);
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

  app.post("/api/challenges", validate(insertChallengeSchema), async (req, res) => {
    try {
      const challenge = await storage.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  // Narrative report routes (public for testing) - Now using real data from DASHBOARD FINAL 2
  app.get("/api/narrative-reports", async (req, res) => {
    try {
      const reports = loadNarrativeReports();
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

  app.post("/api/narrative-reports", validate(insertNarrativeReportSchema), async (req, res) => {
    try {
      const report = await storage.createNarrativeReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid narrative report data" });
    }
  });

  // AI-powered insights and analysis routes
  app.get("/api/ai-insights", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const insights = await aiService.generateInsights(posts);
      res.json(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ error: "Failed to generate AI insights" });
    }
  });

  app.post("/api/ai-analyze-content", validate(AIAnalyzeContentSchema), async (req, res) => {
    try {
      const { content, metrics } = req.body;
      const analysis = await aiService.analyzeContent(content, metrics);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  app.get("/api/ai-narrative-analysis", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const narrativeAnalysis = await aiService.generateNarrativeAnalysis(posts);
      res.json(narrativeAnalysis);
    } catch (error) {
      console.error('Error generating narrative analysis:', error);
      res.status(500).json({ error: "Failed to generate narrative analysis" });
    }
  });

  app.post("/api/ai-strategic-report", validate(AIStrategicReportSchema), async (req, res) => {
    try {
      const { timeframe } = req.body;
      const posts = await storage.getAllPosts();
      const report = await aiService.generateStrategicReport(posts, timeframe);
      res.json({ report });
    } catch (error) {
      console.error('Error generating strategic report:', error);
      res.status(500).json({ error: "Failed to generate strategic report" });
    }
  });

  // Gemini report routes (public for testing)
  app.get("/api/gemini-reports", async (req, res) => {
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

  app.post("/api/gemini-reports", validate(insertGeminiReportSchema), async (req, res) => {
    try {
      const report = await storage.createGeminiReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid Gemini report data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
