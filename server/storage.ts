import { users, posts, comments, analytics, challenges, userChallenges, narrativeReports, geminiReports, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Analytics, type InsertAnalytics, type Challenge, type InsertChallenge, type UserChallenge, type InsertUserChallenge, type NarrativeReport, type InsertNarrativeReport, type GeminiReport, type InsertGeminiReport } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  getAllPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsForPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Analytics operations
  getAnalytics(metricType?: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Challenge operations
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenge(): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // User challenge operations
  getUserChallenges(userId: number): Promise<UserChallenge[]>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  completeUserChallenge(userId: number, challengeId: number, accuracy: number): Promise<UserChallenge | undefined>;
  
  // Narrative report operations
  getAllNarrativeReports(): Promise<NarrativeReport[]>;
  getNarrativeReport(month: string, year: number): Promise<NarrativeReport | undefined>;
  createNarrativeReport(report: InsertNarrativeReport): Promise<NarrativeReport>;
  
  // Gemini report operations
  getAllGeminiReports(): Promise<GeminiReport[]>;
  getGeminiReport(month: string, year: number, reportType: string): Promise<GeminiReport | undefined>;
  createGeminiReport(report: InsertGeminiReport): Promise<GeminiReport>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Post operations
  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: number, updatePost: Partial<InsertPost>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ ...updatePost, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  // Comment operations
  async getCommentsForPost(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Analytics operations
  async getAnalytics(metricType?: string): Promise<Analytics[]> {
    const query = db.select().from(analytics);
    if (metricType) {
      return await query.where(eq(analytics.metricType, metricType)).orderBy(desc(analytics.recordedAt));
    }
    return await query.orderBy(desc(analytics.recordedAt));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analytic;
  }

  // Challenge operations
  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).orderBy(desc(challenges.createdAt));
  }

  async getActiveChallenge(): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(desc(challenges.createdAt))
      .limit(1);
    return challenge || undefined;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db
      .insert(challenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  // User challenge operations
  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId)).orderBy(desc(userChallenges.createdAt));
  }

  async createUserChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const [userChallenge] = await db
      .insert(userChallenges)
      .values(insertUserChallenge)
      .returning();
    return userChallenge;
  }

  async completeUserChallenge(userId: number, challengeId: number, accuracy: number): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .update(userChallenges)
      .set({ 
        completed: true, 
        accuracy: accuracy.toString(),
        completedAt: new Date()
      })
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)))
      .returning();
    return userChallenge || undefined;
  }

  // Narrative report operations
  async getAllNarrativeReports(): Promise<NarrativeReport[]> {
    return await db.select().from(narrativeReports).orderBy(desc(narrativeReports.year), desc(narrativeReports.month));
  }

  async getNarrativeReport(month: string, year: number): Promise<NarrativeReport | undefined> {
    const [report] = await db.select().from(narrativeReports)
      .where(and(eq(narrativeReports.month, month), eq(narrativeReports.year, year)));
    return report || undefined;
  }

  async createNarrativeReport(insertReport: InsertNarrativeReport): Promise<NarrativeReport> {
    const [report] = await db
      .insert(narrativeReports)
      .values(insertReport)
      .returning();
    return report;
  }

  // Gemini report operations
  async getAllGeminiReports(): Promise<GeminiReport[]> {
    return await db.select().from(geminiReports).orderBy(desc(geminiReports.year), desc(geminiReports.month));
  }

  async getGeminiReport(month: string, year: number, reportType: string): Promise<GeminiReport | undefined> {
    const [report] = await db.select().from(geminiReports)
      .where(and(eq(geminiReports.month, month), eq(geminiReports.year, year), eq(geminiReports.reportType, reportType)));
    return report || undefined;
  }

  async createGeminiReport(insertReport: InsertGeminiReport): Promise<GeminiReport> {
    const [report] = await db
      .insert(geminiReports)
      .values(insertReport)
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();
